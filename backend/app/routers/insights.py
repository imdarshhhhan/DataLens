from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json

from app.database import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.insight import Insight
from app.services.auth_utils import get_current_user


from app.services.groq_service import (
    generate_auto_insights,
    generate_followup_questions,
    generate_written_analysis
)


from app.services.duckdb_service import execute_query, get_sample_rows

router = APIRouter()


class InsightRequest(BaseModel):
    file_id:    str
    user_query: Optional[str] = None  # optional — if None, auto mode


@router.post("/generate")
def generate_insights(
    body: InsightRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get file — must belong to this user
    file = db.query(FileModel).filter(
        FileModel.id      == body.file_id,
        FileModel.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    schema      = json.loads(file.schema_json)
    sample_rows = get_sample_rows(file.duckdb_path, limit=20)

    #Auto mode 
    if not body.user_query:
        try:
            raw_insights = generate_auto_insights(schema, sample_rows)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Groq error: {str(e)}")

        if not raw_insights:
            return {
                "mode":     "auto",
                "insights": [],
                "analysis": "",
                "message":  "Could not generate insights. Please try querying manually."
            }

        insights_out    = []
        insight_results = []

        for item in raw_insights:
            title = item.get("title", "Insight")
            sql   = item.get("sql", "")

            # Execute the SQL
            result = execute_query(file.duckdb_path, sql)

            if not result["success"]:
                continue

            # Collect results for written analysis
            insight_results.append({
                "title": title,
                "rows":  result["rows"][:5]
            })

            #follow-up chips
            insight_summary = f"{title}: {json.dumps(result['rows'][:3])}"

            followups = generate_followup_questions(insight_summary, schema, sample_rows)
            # Safety check — remove any followup that doesn't mention a real column
            column_names_lower = [c["name"].lower() for c in schema]
            followups = [
                f for f in followups
                if any(col in f.lower() for col in column_names_lower)
            ] or followups  # if filter removes everything, keep originals as fallback

            # Save to DB
            insight_record = Insight(
                file_id        = file.id,
                user_id        = current_user.id,
                insight_text   = title,
                followup_chips = json.dumps(followups),
                sql_used       = sql,
                result_json    = json.dumps(result["rows"])
            )
            db.add(insight_record)
            db.commit()
            db.refresh(insight_record)

            insights_out.append({
                "id":         insight_record.id,
                "title":      title,
                "sql_used":   sql,
                "result":     result,
                "followups":  followups,
                "disclaimer": "DataLens can make mistakes. Please verify important results before making decisions."
            })

        # Generate written analysis from all results combined
        written_analysis = generate_written_analysis(
            schema, sample_rows, insight_results
        )

        return {
            "mode":     "auto",
            "insights": insights_out,
            "analysis": written_analysis,
            "message":  f"{len(insights_out)} insights generated"
        }

    # Query mode
    else:
        nl_result = natural_language_to_sql(
            body.user_query, schema, sample_rows
        )

        if nl_result.get("unclear"):
            return {
                "mode":     "query",
                "insights": [],
                "message":  nl_result["message"],
                "suggestions": [
                    "Try being more specific",
                    "Use column names from the data preview",
                    "Keep it simple — one question at a time"
                ]
            }

        sql    = nl_result["sql"]
        result = execute_query(file.duckdb_path, sql)
        followups = generate_followup_questions(
            f"{body.user_query}: {json.dumps(result.get('rows', [])[:3])}",
            schema,
            sample_rows
        )

        # Save to DB
        insight_record = Insight(
            file_id        = file.id,
            user_id        = current_user.id,
            insight_text   = body.user_query,
            followup_chips = json.dumps(followups),
            sql_used       = sql,
            result_json    = json.dumps(result.get("rows", []))
        )
        db.add(insight_record)
        db.commit()
        db.refresh(insight_record)

        return {
            "mode": "query",
            "insights": [{
                "id":         insight_record.id,
                "title":      body.user_query,
                "sql_used":   sql,
                "result":     result,
                "followups":  followups,
                "disclaimer": "DataLens can make mistakes. Please verify important results before making decisions."
            }],
            "message": "Query executed successfully"
        }


@router.get("/{file_id}")
def get_insights(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    insights = db.query(Insight).filter(
        Insight.file_id == file_id,
        Insight.user_id == current_user.id
    ).order_by(Insight.created_at.desc()).all()

    return [
        {
            "id":         i.id,
            "title":      i.insight_text,
            "followups":  json.loads(i.followup_chips) if i.followup_chips else [],
            "sql_used":   i.sql_used,
            "is_saved":   i.is_saved,
            "created_at": i.created_at.isoformat()
        }
        for i in insights
    ]


@router.patch("/{insight_id}/save")
def save_insight(
    insight_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    insight = db.query(Insight).filter(
        Insight.id      == insight_id,
        Insight.user_id == current_user.id
    ).first()

    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found")

    insight.is_saved = True
    db.commit()

    return {"message": "Insight saved successfully"}