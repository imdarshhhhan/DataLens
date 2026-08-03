import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def call_ai(prompt: str, temperature: float = 0.1) -> str:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature
    )
    return response.choices[0].message.content.strip()


def natural_language_to_sql(
    user_query: str,
    schema: list,
    sample_rows: list
) -> dict:
    schema_text = "\n".join([
        f"- {col['name']} ({col['type']}) — sample: {col['sample']}"
        for col in schema
    ])

    prompt = f"""You are a SQL expert. Convert the user's question to a DuckDB SQL query.

Table name: data
Columns:
{schema_text}

Sample rows: {json.dumps(sample_rows[:5])}

Rules:
1. Return ONLY a valid DuckDB SQL query — no explanation, no markdown, no backticks
2. Use exact column names from the schema above
3. If the question is unclear or cannot be answered from the data, return exactly: UNCLEAR
4. Keep it simple and efficient

User question: {user_query}"""

    try:
        sql = call_ai(prompt, temperature=0.1)
        sql = sql.replace("```sql", "").replace("```", "").strip()

        if sql.upper() == "UNCLEAR" or len(sql) < 10:
            return {
                "sql":     None,
                "unclear": True,
                "message": "Could not find results for your query. Try being more specific."
            }

        return {"sql": sql, "unclear": False}

    except Exception as e:
        return {
            "sql":     None,
            "unclear": True,
            "message": f"AI service error: {str(e)}"
        }


def generate_followup_questions(
    insight_text: str,
    schema: list,
    sample_rows: list = None
) -> list:
    column_names = [col["name"] for col in schema]
    schema_text  = "\n".join([
        f"- {col['name']} ({col['type']})"
        for col in schema
    ])

    sample_context = ""
    if sample_rows:
        sample_context = f"\nActual sample rows: {json.dumps(sample_rows[:3])}"

    prompt = f"""Generate exactly 3 short follow-up questions for this data insight.

Insight: {insight_text}
Dataset columns (USE ONLY THESE): {column_names}
{schema_text}
{sample_context}

STRICT RULES:
1. Return ONLY a JSON array of exactly 3 strings
2. Every question MUST reference at least one column from: {column_names}
3. NEVER mention columns that do not exist in the list above
4. Each question under 8 words
5. No explanation, no markdown, just the raw JSON array

Example format: ["Question 1?", "Question 2?", "Question 3?"]"""

    try:
        content = call_ai(prompt, temperature=0.3)
        content = content.replace("```json", "").replace("```", "").strip()
        questions = json.loads(content)
        return questions[:3]
    except:
        cols = [col["name"] for col in schema[:3]]
        return [
            f"Show distribution of {cols[0]}?",
            f"What is average {cols[1]}?" if len(cols) > 1 else "Show top values?",
            f"Count by {cols[2]}?"        if len(cols) > 2 else "Show summary stats?"
        ]


def generate_auto_insights(
    schema: list,
    sample_rows: list
) -> list:
    schema_text = "\n".join([
        f"- {col['name']} ({col['type']}) — sample: {col['sample']}"
        for col in schema
    ])

    prompt = f"""You are a data analyst. Generate exactly 5 SQL queries that reveal the most important insights from this dataset.

Table name: data
Columns:
{schema_text}

Sample rows: {json.dumps(sample_rows[:10])}

Rules:
1. Return ONLY a JSON array of 5 objects
2. Each object must have: "title" (short label) and "sql" (valid DuckDB SQL)
3. Cover: summary stats, top values, distributions, trends if date exists
4. No explanation, no markdown, just the raw JSON array

Example format:
[
  {{"title": "Revenue by region", "sql": "SELECT region, SUM(revenue) as total FROM data GROUP BY region ORDER BY total DESC"}},
  ...
]"""

    try:
        content = call_ai(prompt, temperature=0.2)
        content = content.replace("```json", "").replace("```", "").strip()
        insights = json.loads(content)
        return insights[:5]
    except:
        return []


def generate_written_analysis(
    schema: list,
    sample_rows: list,
    insight_results: list
) -> str:
    schema_text = "\n".join([
        f"- {col['name']} ({col['type']})"
        for col in schema
    ])

    results_summary = ""
    for item in insight_results:
        title = item.get("title", "")
        rows  = item.get("rows", [])[:5]
        if rows:
            results_summary += f"\n{title}:\n{json.dumps(rows)}\n"

    prompt = f"""You are a senior data analyst. Based on the dataset and query results below, write a professional data analysis report with 8 to 12 key insights.

Dataset columns:
{schema_text}

Sample rows: {json.dumps(sample_rows[:10])}

Query results:
{results_summary}

Rules:
1. Write exactly 8 to 12 bullet points
2. Each point must be a specific, actionable insight about THIS data
3. Use actual numbers and values from the results above
4. Highlight trends, anomalies, top performers, comparisons
5. Write in plain English — no technical jargon
6. Each point should be 1-2 sentences maximum
7. Start each point with a relevant emoji
8. Do NOT make up numbers — only use what is in the results
9. Return ONLY the bullet points, no title, no introduction

Example format:
- 📈 Sales increased by 23% in Q2 compared to Q1.
- ⚠️ Product X has the lowest margin at 12%, below the average of 34%."""

    try:
        content = call_ai(prompt, temperature=0.3)
        return content.strip()
    except Exception as e:
        return "Could not generate written analysis at this time."