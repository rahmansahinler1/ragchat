from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from app.core.config import LOCAL_DB_FOLDER_PATH

router = APIRouter()

@router.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        upload_dir = Path(LOCAL_DB_FOLDER_PATH)
        file_path = upload_dir / file.filename
        content = await file.read()
        file_path.write_bytes(content)
        file_size = file_path.stat().st_size

        return {
            "file_name": file.filename,
            "size": file_size,
            "content": file.content_type
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error uploading file: {str(e)}")
