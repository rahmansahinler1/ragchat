from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import List
import logging
import uuid

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

class FileInfo(BaseModel):
    domain_name: str
    file_name: str
    file_date: str
    file_sentences: list[str]

    
@router.post("/qa/generate_answer")
async def generate_answer(user_input: Query):
    index_object = processor.indf.load_index(index_path=globals.index_path)
    globals.index = processor.create_index(embeddings=index_object["embeddings"])
    try:
        if globals.index:
            response, resources = processor.search_index(
                user_query=user_input.user_query,
                file_paths=index_object["file_path"],
                sentences=index_object["sentences"],
                file_sentence_amount=index_object["file_sentence_amount"]
            )
            return {"response": response, "resources": resources}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/db/check_changes")
async def check_changes():
    try:
        changes, updated_memory = detector.check_changes()
        changed_file_message = ["No change detected"]
        if any(changes.values()):
            changed_file_message = [
                "File changes detected!",
                f"--> {len(changes["insert"])} addition",
                f"--> {len(changes["update"])} update",
                f"--> {len(changes["delete"])} deletion",
                "Please wait ragchat to synchronize it's memory..."
            ]
            if changes["insert"]:
                processor.index_insert(changes=changes["insert"])
            if changes["update"]:
                processor.index_update(changes=changes["update"])
            if changes["delete"]:
                processor.index_delete(changes=changes["delete"])
            processor.update_memory(updated_memory=updated_memory, memory_json_path=globals.memory_file_path)
        return changed_file_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/io/add_files")
async def add_files(
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
            globals.file_additions.append(file_info)
        return JSONResponse(content={"message": "Files uploaded successfully", "file_names": file_names, "total_files": len(globals.file_additions)}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/io/upload_files")
async def upload_files(action: UploadAction):
    if action.action != 'upload':
        raise HTTPException(status_code=400, detail="Invalid action")
    
    if not globals.file_additions:
        raise HTTPException(status_code=400, detail="No file to be upload")
    
    try:
        for file_addition in globals.file_additions:
            file_info = {}
            file_info["file_id"] = file_addition["file_id"]
            file_info["user_id"] = file_addition["user_id"]
            file_info["file_domain"] = file_addition["file_domain"]
            file_info["file_name"] = file_addition["file_name"].split(".")[0]
            file_info["file_type"] = file_addition["file_name"].split(".")[-1]
            file_info["file_modified_date"] = file_addition["file_modified_date"]

            file_sentences = processor.rf.read_file(file_bytes=file_addition["file_bytes"], file_type=file_info["file_type"])
            file_embeddings = processor.ef.create_embeddings_from_sentences(file_sentences=file_sentences)

            with Database() as db:
                db.insert_file_info(file_info=file_info)
                db.insert_file_content(file_id=file_info["file_id"], file_sentences=file_sentences, file_embeddings=file_embeddings)
                db.conn.commit()
            
        globals.file_additions.clear()
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
