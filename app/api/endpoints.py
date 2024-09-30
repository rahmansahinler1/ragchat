from fastapi import APIRouter, UploadFile, HTTPException, Request, Query, File, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import List
import logging
import uuid
import numpy as np

from .core import FileProcessor
from .. import globals
from ..db.database import Database

router = APIRouter()
processor = FileProcessor(db_folder_path="")

class UserEmailRequest(BaseModel):
    user_email: str

class UserQueryRequest(BaseModel):
    user_query: str
    user_id: str

class FileUploadRequest(BaseModel):
    user_id: str
    selected_domain_number: int

class FileDeletionRequest(BaseModel):
    user_email: str
    files_to_remove: List[str]


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

@router.post("/qa/select_domain")
async def select_domain(
    request: Request,
    userID: str = Query(...),
):
    try:
        data = await request.json()
        selected_domain_number = data.get('currentDomain')
        with Database() as db:
            domain_info = db.get_domain_info(userID, selected_domain_number)
            file_info = db.get_file_info(userID, domain_info["domain_id"])
            file_content = db.get_file_content(file_ids=[info["file_id"] for info in file_info])
            #TODO: WHY IS THIS FUCKING EMBEDING DOES NOT COME IN RIGHT SHAPE?
            embeddings = np.vstack([np.frombuffer(row[3], dtype=np.float64).reshape(1, -1) for row in file_content if row[3] is not None])
            globals.sentences[userID] = [row[0] for row in file_content if row[0] is not None]
            globals.index[userID] = processor.create_index(embeddings=embeddings)
        
        return JSONResponse(content={"file_info": file_info}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        return JSONResponse(content={"answer": answer}, status_code=200)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/io/select_files")
async def select_files(
    userID: str = Query(...),
    files: List[UploadFile] = File(...),
    lastModified: List[int] = Form(...),
):
    try:
        added_files = []
        for file, last_modified_date in zip(files, lastModified):
            selection_identifier = [userID, file.filename]
            if selection_identifier not in globals.file_selection_identifiers:
                bytes = await file.read()
                file_modified_date = datetime.fromtimestamp(int(last_modified_date) / 1000).strftime('%Y-%m-%d')
                file_info = {
                    "user_id": userID,
                    "file_id": str(uuid.uuid4()),
                    "file_name": file.filename,
                    "file_modified_date": file_modified_date,
                    "file_bytes": bytes,
                }
                globals.file_selection_identifiers.append(selection_identifier)
                globals.file_selections.append(file_info)
                added_files.append(file.filename)

        return JSONResponse(content={"file_names": added_files}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/remove_file_selections")
async def remove_file_selections(
    request: Request,
    userID: str = Query(...),
):
    try:
        data = await request.json()
        files = data.get('filesToRemove', [])

        globals.file_selections = [
            file_info for file_info in globals.file_selections
            if not (file_info["user_id"] == userID and file_info["file_name"] in files)
        ]
        globals.file_selection_identifiers = [
            identifier for identifier in globals.file_selection_identifiers
            if not (identifier[0] == userID and identifier[1] in files)
        ]
        return JSONResponse(content={"message": "Selected files removed successfully", "success": True}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/clear_file_selections")
async def clear_user_selections(userID: str = Query(...)):
    try:
        globals.file_selections = [selection for selection in globals.file_selections if selection["user_id"] != userID]
        globals.file_selection_identifiers = [identifier for identifier in globals.file_selection_identifiers if identifier[0] != userID]
        
        return JSONResponse(content='', status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/upload_files")
async def upload_files(
    request: Request,
    userID: str = Query(...),
):
    if not globals.file_selections:
        raise HTTPException(status_code=400, detail="No file in server to be upload")
    try:
        for file_selection in globals.file_selections:
            # Extract valid sentences and create embeddings from the file
            if userID != file_selection["user_id"]:
                continue
            file_sentences = processor.rf.read_file(file_bytes=file_selection["file_bytes"], file_name=file_selection["file_name"])
            file_embeddings = processor.ef.create_embeddings_from_sentences(file_sentences=file_sentences)
            # Udate necessary tables with the file information
            with Database() as db:
                domain_info = db.get_domain_info(user_id=userID, selected_domain_number=1)
                db.insert_file_info(file_info=file_selection, domain_id=domain_info["domain_id"])
                db.insert_file_content(file_id=file_selection["file_id"], file_sentences=file_sentences, file_embeddings=file_embeddings)
                db.conn.commit()
        globals.file_selections.clear()
        return JSONResponse(content={"message": f"Files uploaded successfully to domain {1}"}, status_code=200)
    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during file upload: {str(e)}")
        raise HTTPException(content={"message": f"Failed uploading, error: {e}"}, status_code=500)

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
