import duckdb
import json
import pandas as pd


def execute_query(duckdb_path: str, sql: str) -> dict:
    conn = duckdb.connect(duckdb_path)

    try:
        #validate SQL before executing
        conn.execute(f"EXPLAIN {sql}")

        # Real execution
        result_df = conn.execute(sql).df()

        # Convert to JSON-safe format
        rows = result_df.to_dict(orient="records")
        columns = list(result_df.columns)

        # Clean up non-serializable types
        for row in rows:
            for key, value in row.items():
                if pd.isna(value) if not isinstance(value, (list, dict)) else False:
                    row[key] = None
                elif hasattr(value, 'item'):
                    row[key] = value.item()

        return {
            "success":  True,
            "columns":  columns,
            "rows":     rows,
            "row_count": len(rows)
        }

    except Exception as e:
        return {
            "success": False,
            "error":   str(e),
            "rows":    [],
            "columns": []
        }
    finally:
        conn.close()


def get_sample_rows(duckdb_path: str, limit: int = 10) -> list:
    conn = duckdb.connect(duckdb_path)
    try:
        result = conn.execute(f"SELECT * FROM data LIMIT {limit}").df()
        return result.to_dict(orient="records")
    except:
        return []
    finally:
        conn.close()