from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path

from .data_pipeline import FileDetector, FileProcessor
from .. import globals

router = APIRouter()
detector = FileDetector(db_folder_path=globals.db_folder_path, memory_file_path=globals.memory_file_path)
processor = FileProcessor()

@router.post("/upload_file/")
async def upload_file(file: UploadFile = File(...)):
    try:
        return {
            "file_name": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error uploading file: {str(e)}")
