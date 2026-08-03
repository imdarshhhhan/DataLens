from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.services.auth_utils import get_current_user
from app.services.file_service import process_upload
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file type
    allowed = ["csv", "xlsx", "xls", "json"]
    ext = file.filename.split(".")[-1].lower()

    if ext not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"File type .{ext} not supported. Use csv, xlsx or json."
        )

    # Validate file size (50MB max)
    contents = await file.read()
    if len(contents) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 50MB."
        )

    # Process the file — parse + save to DuckDB
    result = process_upload(
        contents   = contents,
        filename   = file.filename,
        ext        = ext,
        user_id    = current_user.id,
        db         = db
    )

    return result


@router.get("/list")
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    files = db.query(FileModel)\
              .filter(FileModel.user_id == current_user.id)\
              .order_by(FileModel.uploaded_at.desc())\
              .all()

    return [
        {
            "id":          f.id,
            "filename":    f.filename,
            "file_type":   f.file_type,
            "row_count":   f.row_count,
            "col_count":   f.col_count,
            "schema":      f.schema_json,
            "uploaded_at": f.uploaded_at.isoformat()
        }
        for f in files
    ]


@router.delete("/{file_id}")
def delete_file(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file = db.query(FileModel).filter(
        FileModel.id      == file_id,
        FileModel.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    import os, shutil
    duckdb_path = file.duckdb_path
    if duckdb_path and os.path.exists(duckdb_path):
        os.remove(duckdb_path)

    db.delete(file)
    db.commit()

    return {"message": "File deleted successfully"}


@router.get("/{file_id}/schema")
def get_schema(
    file_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file = db.query(FileModel).filter(
        FileModel.id      == file_id,
        FileModel.user_id == current_user.id
    ).first()

    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    return {
        "file_id":   file.id,
        "filename":  file.filename,
        "row_count": file.row_count,
        "col_count": file.col_count,
        "schema":    file.schema_json
    }