from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json

from app.database import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.query import Query
from app.services.auth_utils import get_current_user
from app.services.groq_service import natural_language_to_sql
from app.services.duckdb_service import execute_query, get_sample_rows

router = APIRouter()


class QueryRequest(BaseModel):
    file_id:    str
    query_text: str
    query_type: Optional[str] = "nl"


@router.post("/run")
def run_query(
    body: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file = db.query(FileModel).filter(
        FileModel.id      == body.file_id,
        FileModel.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    schema      = json.loads(file.schema_json)
    sample_rows = get_sample_rows(file.duckdb_path)
    schema_text = "\n".join([
        f"- {col['name']} ({col['type']})"
        for col in schema
    ])

    #Direct SQL 
    if body.query_type == "sql":
        sql_to_run    = body.query_text
        sql_generated = body.query_text

    #Natural language
    else:
        try:
            nl_result = natural_language_to_sql(
                body.query_text, schema, sample_rows
            )
        except Exception as e:
            return {
                "query":      body.query_text,
                "sql_used":   None,
                "understood": False,
                "message":    "Something went wrong. Please try again.",
                "result":     None,
                "suggestions": [
                    "Check your internet connection",
                    "Try a simpler question",
                    "Use SQL mode if you know SQL"
                ]
            }

        #Layer 1: Model could not understand 
        if nl_result.get("unclear"):
            user_words   = set(body.query_text.lower().split())
            col_names    = [c["name"] for c in schema]

            related_cols = [
                col for col in col_names
                if any(word in col.lower() or col.lower() in word
                       for word in user_words)
            ]

            suggestions = []
            if related_cols:
                suggestions.append(f"Did you mean one of these columns: {', '.join(related_cols[:3])}?")
            suggestions.append(f"Available columns in your file: {', '.join(col_names[:5])}")
            if len(col_names) >= 2:
                suggestions.append(f"Try: 'count of {col_names[0]} by {col_names[1]}'")
            else:
                suggestions.append("Try asking about a specific column")

            return {
                "query":       body.query_text,
                "sql_used":    None,
                "understood":  False,
                "message":     f"Could not find results for '{body.query_text}' — try being more specific.",
                "result":      None,
                "suggestions": suggestions
            }

        sql_to_run    = nl_result["sql"]
        sql_generated = sql_to_run

    #Execute SQL on DuckDb
    result = execute_query(file.duckdb_path, sql_to_run)

    if not result["success"]:
        #Layer 3: Auto fix via Groq 
        try:
            fix_prompt = f"""This SQL query failed with error: {result['error']}
SQL: {sql_to_run}
Table: data
Columns: {schema_text}
Return only the corrected SQL query, nothing else."""

            from app.services.groq_service import call_ai
            fixed_sql = call_ai(fix_prompt, temperature=0.1)



            
            fixed_sql  = fixed_sql.replace("```sql", "").replace("```", "").strip()
            result     = execute_query(file.duckdb_path, fixed_sql)
            sql_to_run = fixed_sql
        except:
            pass

        #Layer 4: Still failing 
        if not result["success"]:
            col_names = [c["name"] for c in schema]
            return {
                "query":      body.query_text,
                "sql_used":   sql_to_run,
                "understood": False,
                "message":    "Could not retrieve data. Please try rephrasing.",
                "result":     None,
                "suggestions": [
                    f"Available columns: {', '.join(col_names[:5])}",
                    "Try: 'show all data' to see what is available",
                    "Switch to SQL mode for precise queries"
                ]
            }

    #Confidence scoring 
    query_words = body.query_text.lower().split()
    uncertain_keywords = [
        "maybe", "approximately", "around", "estimate",
        "roughly", "trend", "predict", "forecast", "compare",
        "difference", "why", "reason", "best", "worst"
    ]
    is_complex = any(word in query_words for word in uncertain_keywords)
    row_count  = result.get("row_count", 0)

    if body.query_type == "sql":
        confidence = "high"
        disclaimer = "You wrote this SQL directly — results are exact."
    elif is_complex:
        confidence = "medium"
        disclaimer = "DataLens may not always be accurate. Double-check important information."
    elif row_count == 0:
        confidence = "low"
        disclaimer = "No results found. Please verify column names and values."
    else:
        confidence = "high"
        disclaimer = "DataLens can make mistakes. Please verify important results."

    #Save to history 
    query_record = Query(
        user_id       = current_user.id,
        file_id       = file.id,
        query_text    = body.query_text,
        query_type    = body.query_type,
        sql_generated = sql_to_run,
        result_json   = json.dumps(result.get("rows", [])),
    )
    db.add(query_record)
    db.commit()

    return {
        "query":      body.query_text,
        "sql_used":   sql_to_run,
        "understood": True,
        "message":    None,
        "result":     result,
        "query_type": body.query_type,
        "confidence": confidence,
        "disclaimer": disclaimer
    }


@router.get("/history/{file_id}")
def get_history(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    queries = db.query(Query).filter(
        Query.file_id == file_id,
        Query.user_id == current_user.id
    ).order_by(Query.created_at.desc()).all()

    return [
        {
            "id":            q.id,
            "query_text":    q.query_text,
            "query_type":    q.query_type,
            "sql_generated": q.sql_generated,
            "created_at":    q.created_at.isoformat()
        }
        for q in queries
    ]