import pandas as pd
import duckdb
import json
import uuid
import os
from sqlalchemy.orm import Session
from app.models.file import File as FileModel
import io

DATASETS_DIR = "datasets"

def process_upload(
    contents: bytes,
    filename: str,
    ext: str,
    user_id: str,
    db: Session
) -> dict:

    # Step 1: Parse file into pandas DataFrame 
    try:
        if ext == "csv":
            df = pd.read_csv(io.BytesIO(contents))

        elif ext in ["xlsx", "xls"]:
            df = pd.read_excel(io.BytesIO(contents))

        elif ext == "json":
            df = pd.read_json(io.BytesIO(contents))

    except Exception as e:
        raise ValueError(f"Could not parse file: {str(e)}")

    #Step 2: Clean column names 
    df.columns = [
        col.strip().replace(" ", "_").replace("-", "_").lower()
        for col in df.columns
    ]

    #Step 3: Detect schema 
    schema = []
    for col in df.columns:
        dtype = str(df[col].dtype)

        if "int" in dtype:
            col_type = "integer"
        elif "float" in dtype:
            col_type = "float"
        elif "datetime" in dtype:
            col_type = "date"
        elif "bool" in dtype:
            col_type = "boolean"
        else:
            col_type = "text"

        schema.append({
            "name":         col,
            "type":         col_type,
            "null_count":   int(df[col].isnull().sum()),
            "sample":       df[col].dropna().head(3).tolist()
        })

    #  Step 4: Save to DuckDB 
    file_id     = str(uuid.uuid4())
    user_dir    = os.path.join(DATASETS_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)

    duckdb_path = os.path.join(user_dir, f"{file_id}.duckdb")

    conn = duckdb.connect(duckdb_path)
    conn.execute("CREATE TABLE data AS SELECT * FROM df")
    conn.close()

    #  Step 5: Save file record to SQLite 
    file_record = FileModel(
        id          = file_id,
        user_id     = user_id,
        filename    = filename,
        file_type   = ext,
        row_count   = len(df),
        col_count   = len(df.columns),
        schema_json = json.dumps(schema),
        duckdb_path = duckdb_path
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)

    # Step 6: Return result to frontend 
    return {
        "file_id":   file_id,
        "filename":  filename,
        "file_type": ext,
        "row_count": len(df),
        "col_count": len(df.columns),
        "schema":    schema,
        "message":   "File uploaded and processed successfully"
    }