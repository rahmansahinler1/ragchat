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

class UserQueryRequest(BaseModel):
    user_query: str
    user_id: str

class FileInfoRequest(BaseModel):
    user_id: str
    selected_domain_number: int

class FileRemovalRequest(BaseModel):
    filesToRemove: List[str]

class FileDeletionRequest(BaseModel):
    user_email: str
    files_to_remove: List[str]

    
@router.post("/qa/generate_answer")
async def generate_answer(request: UserQueryRequest):
    try:
        # TODO dynamic index generation with selected domain information
        if not globals.index:
            with Database() as db:
                file_infos = db.get_file_info(request.user_id)
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
        
        response = {
            "user_info": user_info,
        }
        return JSONResponse(content=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/db/get_file_info")
async def get_user_info(request: FileInfoRequest):
    try:
        with Database() as db:
            file_info = db.get_file_info(request.user_id, request.selected_domain_number)
        
        response = {
            "file_info": file_info,
        }
        return JSONResponse(content=response)
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
                "user_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
                "file_id": str(uuid.uuid4()),
                "file_name": file.filename,
                "file_modified_date": file_modified_date,
                "file_bytes": bytes,
            }
            file_names.append(file.filename)
            globals.file_selections.append(file_info)
        return JSONResponse(content={"message": "Files uploaded successfully", "file_names": file_names, "total_files": len(globals.file_selections)}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/remove_file_selections")
async def remove_file_selections(request: FileRemovalRequest):
    try:
        files_to_remove = set(request.filesToRemove)
        files_removed = []

        globals.file_selections = [
            file_info for file_info in globals.file_selections
            if file_info["file_name"] not in files_to_remove
        ]
        files_removed = len(files_to_remove) - len(globals.file_selections)

        return {
            "success": True,
            "message": f"{files_removed} file(s) deleted successfully",
            "removed_count": files_removed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/upload_files")
async def upload_files(action: UploadAction):
    if action.action != 'upload':
        raise HTTPException(status_code=400, detail="Invalid action")
    
    if not globals.file_selections:
        raise HTTPException(status_code=400, detail="No file to be upload")
    
    try:
        for file_selection in globals.file_selections:
            file_info = {}
            file_info["user_id"] = file_selection["user_id"]
            file_info["file_id"] = file_selection["file_id"]
            file_info["file_name"] = file_selection["file_name"]
            file_info["file_modified_date"] = file_selection["file_modified_date"]
            file_info["domain_name"] = "Cyber Security Homologe"
            file_info["domain_number"] = 2

            file_sentences = processor.rf.read_file(file_bytes=file_selection["file_bytes"], file_name=file_info["file_name"])
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
async def remove_file_upload(request: FileDeletionRequest):
    try:
        with Database() as db:
            user_info = db.get_user_info(request.user_email)
            deleted_content, file_ids = db.clear_file_content(user_id=user_info["user_id"], files_to_remove=request.files_to_remove)
            deleted_files = db.clear_file_info(user_id=user_info["user_id"], file_ids=file_ids)
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
