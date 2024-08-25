from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path

router = APIRouter()

@router.post("/upload_file/")
async def upload_file(file: UploadFile = File(...)):
    try:
        selected_file = file
        content = await file.read()
        # file_path.write_bytes(content)
        # file_size = file_path.stat().st_size

        # return {
        #     "file_name": file.filename,
        #     "size": file_size,
        #     "content": file.content_type
        # }
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error uploading file: {str(e)}")
