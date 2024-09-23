from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import List
import logging
import uuid
import numpy as np

from .core import FileDetector, FileProcessor
from .. import globals
from ..db.database import Database

router = APIRouter()
detector = FileDetector(domain_folder_path=globals.domain_folder_path, memory_file_path=globals.memory_file_path)
processor = FileProcessor(db_folder_path=globals.db_folder_path)

class Query(BaseModel):
    user_query: str

class UploadAction(BaseModel):
    action: str

class UserEmailRequest(BaseModel):
    user_email: str

class QueryWithEmail(BaseModel):
    user_query: str
    user_email: str

    
@router.post("/qa/generate_answer")
async def generate_answer(request: QueryWithEmail):
    try:
        if not globals.index:
            with Database() as db:
                user_info = db.get_user_info(request.user_email)
                if not user_info:
                    raise HTTPException(status_code=404, detail="User not found")
                # Create index
                file_infos = db.get_file_info(user_info['user_id'])
                file_ids = [file_info["file_id"] for file_info in file_infos]
                file_content = db.get_file_content(file_ids)
                embeddings = np.vstack([np.frombuffer(row[3], dtype=np.float64).reshape(1, -1) for row in file_content if row[3] is not None])
                globals.sentences = [row[0] for row in file_content if row[0] is not None]
                globals.index = processor.create_index(embeddings=embeddings)
                
        # Search index and return answer
        answer = processor.search_index(user_query=request.user_query, sentences=globals.sentences)
        response = {
            "answer": answer
        }
        
        return JSONResponse(content=response)
    
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/db/get_user_info")
async def get_user_info(request: UserEmailRequest):
    try:
        with Database() as db:
            user_info = db.get_user_info(request.user_email)
            file_info = db.get_file_info(user_info['user_id'])
        
        return user_info, file_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/io/select_files")
async def select_files(
    files: List[UploadFile] = File(...),
    lastModified: List[int] = Form(...)
):
    try:
        file_names = []
        for file, last_modified_date in zip(files, lastModified):
            bytes = await file.read()
            file_modified_date = datetime.fromtimestamp(int(last_modified_date) / 1000).strftime('%Y-%m-%d')
            file_info = {
                "file_id": str(uuid.uuid4()),
                "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
                "file_domain": "domain1",
                "file_name": file.filename,
                "file_modified_date": file_modified_date,
                "file_bytes": bytes
            }
            file_names.append(file.filename)
            globals.file_selections.append(file_info)
        return JSONResponse(content={"message": "Files uploaded successfully", "file_names": file_names, "total_files": len(globals.file_selections)}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/remove_file_selections")
async def remove_file_selections():
    try:
        globals.file_selections.clear()
        return {
        "success": True,
        "message": "Files deleted successfully"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

@router.post("/io/upload_files")
async def upload_files(action: UploadAction):
    if action.action != 'upload':
        raise HTTPException(status_code=400, detail="Invalid action")
    
    if not globals.file_selections:
        raise HTTPException(status_code=400, detail="No file to be upload")
    
    try:
        for file_selection in globals.file_selections:
            file_info = {}
            file_info["file_id"] = file_selection["file_id"]
            file_info["user_id"] = file_selection["user_id"]
            file_info["file_domain"] = file_selection["file_domain"]
            file_info["file_name"] = file_selection["file_name"].split(".")[0]
            file_info["file_type"] = file_selection["file_name"].split(".")[-1]
            file_info["file_modified_date"] = file_selection["file_modified_date"]

            file_sentences = processor.rf.read_file(file_bytes=file_selection["file_bytes"], file_type=file_info["file_type"])
            file_embeddings = processor.ef.create_embeddings_from_sentences(file_sentences=file_sentences)

            with Database() as db:
                db.insert_file_info(file_info=file_info)
                db.insert_file_content(file_id=file_info["file_id"], file_sentences=file_sentences, file_embeddings=file_embeddings)
                db.conn.commit()
            
        globals.file_selections.clear()
        return {
        "success": True,
        "message": "Files uploaded successfully"
        }
    except Exception as e:
        if hasattr(db, 'conn'):
            db.conn.rollback()
        logging.error(f"Error during file upload: {str(e)}")
        return {
            "success": False,
            "message": str(e)
        }

@router.post("/io/remove_file_upload")
async def remove_file_upload(request: UserEmailRequest):
    try:
        with Database() as db:
            user_info = db.get_user_info(request.user_email)
            deleted_content = db.clear_file_content(user_id=user_info["user_id"])
            deleted_files = db.clear_file_info(user_id=user_info["user_id"])
            db.conn.commit()
        
        return {
        "success": True,
        "message": {
            "deleted_content": deleted_content,
            "deleted_files": deleted_files
        }
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }
