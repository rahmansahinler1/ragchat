from fastapi import APIRouter, UploadFile, HTTPException, Request, Query, File, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List
import logging
import uuid

from .core import FileProcessor
from .. import globals
from ..db.database import Database

router = APIRouter()
processor = FileProcessor()

@router.post("/db/get_user_info")
async def get_user_info(
    request: Request
):
    try:
        data = await request.json()
        user_email = data.get('user_email')
        with Database() as db:
            user_info = db.get_user_info(user_email)
        return JSONResponse(content={
            "user_id": user_info["user_id"],
            "user_name": user_info["user_name"],
            "user_surname": user_info["user_surname"],
            "user_type": user_info["user_type"]
        }, status_code=200)
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
        globals.selected_domain[userID] = selected_domain_number
        with Database() as db:
            domain_info = db.get_domain_info(userID, selected_domain_number)
            file_info = db.get_file_info_with_domain(userID, domain_info["domain_id"])
            if file_info:
                content, embeddings = db.get_file_content(file_ids=[info["file_id"] for info in file_info])
                globals.domain_content[userID] = content
                globals.index[userID] = processor.create_index(embeddings=embeddings)
                return JSONResponse(
                    content={
                        "file_names": [info["file_name"] for info in file_info],
                        "domain_name": domain_info["domain_name"]
                    },
                    status_code=200,
                )
            else:
                globals.domain_content[userID] = []
                globals.index[userID] = None
                return JSONResponse(
                    content={
                        "file_names": None,
                        "domain_name": domain_info["domain_name"]
                    },
                    status_code=200,
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/qa/generate_answer")
async def generate_answer(
    request: Request,
    userID: str = Query(...),
):
    try:
        data = await request.json()
        user_message = data.get('user_message')
        if userID not in globals.selected_domain.keys():
            sentences, answer, resources = None, "Please select a domain first", None
        elif globals.index[userID] and globals.domain_content[userID]:
            sentences, answer, resources = processor.search_index(user_query=user_message, domain_content=globals.domain_content[userID], index=globals.index[userID])
            with Database() as db:
                resources["file_names"] = [db.get_file_name_with_id(file_id=file_id) for file_id in resources["file_ids"]]
                del resources["file_ids"]
        else:
            sentences, answer, resources = None, "Selected domain is empty", None

        return JSONResponse(
                    content={
                        "sentences": sentences,
                        "answer": answer,
                        "resources": resources
                    },
                    status_code=200,
                )
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
        files = data.get('files_to_remove', [])

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
    userID: str = Query(...),
):
    if not globals.file_selections:
        raise HTTPException(status_code=400, detail="No file in server to be upload")
    try:
        selected_domain_number = globals.selected_domain[userID]
        for file_selection in globals.file_selections:
            # Extract valid sentences and create embeddings from the file
            if userID != file_selection["user_id"]:
                continue
            file_sentences = processor.rf.read_file(file_bytes=file_selection["file_bytes"], file_name=file_selection["file_name"])
            file_embeddings = processor.ef.create_embeddings_from_sentences(file_sentences=file_sentences)
            # Udate necessary tables with the file information
            with Database() as db:
                domain_info = db.get_domain_info(user_id=userID, selected_domain_number=selected_domain_number)
                db.insert_file_info(file_info=file_selection, domain_id=domain_info["domain_id"])
                # TODO: R155 file content insertion error
                db.insert_file_content(file_id=file_selection["file_id"], file_sentences=file_sentences, file_embeddings=file_embeddings)
                file_info = db.get_file_info_with_domain(user_id=userID, domain_id=domain_info["domain_id"])
                db.conn.commit()
        # Clear file selections of the user and return
        globals.file_selections = [file for file in globals.file_selections if file["user_id"] != userID]
        return JSONResponse(content={
            "message": f"Files uploaded successfully to domain {selected_domain_number}",
            "file_names": [info["file_name"] for info in file_info],
            "domain_name": domain_info["domain_name"]
        }, status_code=200)
    except KeyError:
        return JSONResponse(content={"message": "Please select the domain number first"}, status_code=200)
    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during file upload: {str(e)}")
        raise HTTPException(content={"message": f"Failed uploading, error: {e}"}, status_code=500)

@router.post("/io/remove_file_upload")
async def remove_file_upload(
    request: Request,
    userID: str = Query(...),
):
    try:
        selected_domain_number = globals.selected_domain[userID]
        data = await request.json()
        files = data.get('files_to_remove', [])
        with Database() as db:
            deleted_content, file_ids = db.clear_file_content(user_id=userID, files_to_remove=files)
            deleted_files = db.clear_file_info(user_id=userID, file_ids=file_ids)
            domain_info = db.get_domain_info(user_id=userID, selected_domain_number=selected_domain_number)
            file_info = db.get_file_info_with_domain(user_id=userID, domain_id=domain_info["domain_id"])
            db.conn.commit()
        if file_info:
            return JSONResponse(content={
                "message": f"{deleted_files} files and {deleted_content} sentences deleted",
                "file_names": [info["file_name"] for info in file_info],
                "domain_name": domain_info["domain_name"]
            }, status_code=200)
        else:
            return JSONResponse(content={
                "message": f"{deleted_files} files and {deleted_content} sentences deleted",
                "domain_name": domain_info["domain_name"]
            }, status_code=200)
    except KeyError:
        return JSONResponse(content={"message": "Please select the domain number first"}, status_code=200)
    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during file deletion: {str(e)}")
        raise HTTPException(content={"message": f"Failed deleting, error: {e}"}, status_code=500)
