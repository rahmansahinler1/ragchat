from fastapi import APIRouter, UploadFile, HTTPException, Request, Query, File, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List
import logging
import uuid

from .core import Processor
from .core import Authenticator
from .. import globals
from ..db.database import Database

router = APIRouter()
processor = Processor()
authenticator = Authenticator()


@router.post("/db/get_user_info")
async def get_user_info(request: Request):
    try:
        data = await request.json()
        user_id = data.get("user_id")
        with Database() as db:
            user_info = db.get_user_info_w_id(user_id)

        return JSONResponse(
            content={
                "user_id": user_id,
                "user_name": user_info["user_name"],
                "user_surname": user_info["user_surname"],
                "user_type": user_info["user_type"],
            },
            status_code=200,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/qa/select_domain")
async def select_domain(
    request: Request,
    userID: str = Query(...),
):
    try:
        data = await request.json()
        selected_domain_number = data.get("currentDomain")
        globals.selected_domain[userID] = selected_domain_number
        with Database() as db:
            file_names, domain_name = None, None
            domain_info = db.get_domain_info(userID, selected_domain_number)
            file_info = db.get_file_info_with_domain(userID, domain_info["domain_id"])
            if file_info:
                content, embeddings = db.get_file_content(
                    file_ids=[info["file_id"] for info in file_info]
                )
                globals.domain_content[userID] = content
                globals.boost_info[userID] = processor.extract_boost_info(
                    domain_content=content, embeddings=embeddings
                )
                globals.index[userID] = processor.create_index(embeddings=embeddings)
                globals.index_header[userID] = processor.create_index(
                    embeddings=globals.boost_info[userID]["header_embeddings"]
                )
                file_names = [info["file_name"] for info in file_info]
                domain_name = domain_info["domain_name"]
            else:
                globals.domain_content[userID] = []
                globals.index[userID] = None
                domain_name = domain_info["domain_name"]

            return JSONResponse(
                content={"file_names": file_names, "domain_name": domain_name},
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
        user_message = data.get("user_message")
        if userID not in globals.selected_domain.keys():
            return JSONResponse(
                content={"message": "Please select a domain first"},
                status_code=500,
            )
        elif globals.index[userID] and globals.domain_content[userID]:
            answer, resources, resource_sentences = processor.search_index(
                user_query=user_message,
                domain_content=globals.domain_content[userID],
                boost_info=globals.boost_info[userID],
                index=globals.index[userID],
                index_header=globals.index_header[userID],
            )

            if not answer or not resources or not resource_sentences:
                return JSONResponse(
                    content={
                        "message": f"Can you explain the question better? I did not understand '{user_message}'"
                    },
                    status_code=200,
                )

            with Database() as db:
                resources["file_names"] = [
                    db.get_file_name_with_id(file_id=file_id)
                    for file_id in resources["file_ids"]
                ]
                del resources["file_ids"]

            return JSONResponse(
                content={
                    "information": answer["information"],
                    "explanation": answer["explanation"],
                    "resources": resources,
                    "resource_sentences": resource_sentences,
                },
                status_code=200,
            )
        else:
            return JSONResponse(
                content={"message": "Selected domain is empty!"},
                status_code=500,
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
                file_modified_date = datetime.fromtimestamp(
                    int(last_modified_date) / 1000
                ).strftime("%Y-%m-%d")
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
        files = data.get("files_to_remove", [])
        globals.file_selections = [
            file_info
            for file_info in globals.file_selections
            if not (file_info["user_id"] == userID and file_info["file_name"] in files)
        ]
        globals.file_selection_identifiers = [
            identifier
            for identifier in globals.file_selection_identifiers
            if not (identifier[0] == userID and identifier[1] in files)
        ]

        return JSONResponse(
            content={"message": "Selected files removed successfully", "success": True},
            status_code=200,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/io/clear_file_selections")
async def clear_user_selections(userID: str = Query(...)):
    try:
        globals.file_selections = [
            selection
            for selection in globals.file_selections
            if selection["user_id"] != userID
        ]
        globals.file_selection_identifiers = [
            identifier
            for identifier in globals.file_selection_identifiers
            if identifier[0] != userID
        ]

        return JSONResponse(content="", status_code=200)
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
            if userID != file_selection["user_id"]:
                continue
            file_data = processor.rf.read_file(
                file_bytes=file_selection["file_bytes"],
                file_name=file_selection["file_name"],
            )
            file_embeddings = processor.ef.create_embeddings_from_sentences(
                sentences=file_data["sentences"]
            )
            with Database() as db:
                domain_info = db.get_domain_info(
                    user_id=userID, selected_domain_number=selected_domain_number
                )
                db.insert_file_info(
                    file_info=file_selection,
                    domain_id=domain_info["domain_id"],
                )
                db.insert_file_content(
                    file_id=file_selection["file_id"],
                    file_sentences=file_data["sentences"],
                    page_numbers=file_data["page_number"],
                    file_headers=file_data["is_header"],
                    file_embeddings=file_embeddings,
                )
                file_info = db.get_file_info_with_domain(
                    user_id=userID, domain_id=domain_info["domain_id"]
                )
                db.conn.commit()
        globals.file_selections = [
            file for file in globals.file_selections if file["user_id"] != userID
        ]

        return JSONResponse(
            content={
                "message": f"Files uploaded successfully to domain {selected_domain_number}",
                "file_names": [info["file_name"] for info in file_info],
                "domain_name": domain_info["domain_name"],
            },
            status_code=200,
        )
    except KeyError:
        return JSONResponse(
            content={"message": "Please select the domain number first"},
            status_code=200,
        )
    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during file upload: {str(e)}")
        raise HTTPException(
            content={"message": f"Failed uploading, error: {e}"}, status_code=500
        )


@router.post("/io/remove_file_upload")
async def remove_file_upload(
    request: Request,
    userID: str = Query(...),
):
    try:
        selected_domain_number = globals.selected_domain[userID]
        data = await request.json()
        files = data.get("files_to_remove", [])
        message, file_names, domain_name, status_code = (
            "Unsuccessful deletion!",
            [],
            "",
            500,
        )
        with Database() as db:
            deleted_content, file_ids = db.clear_file_content(
                user_id=userID, files_to_remove=files
            )
            deleted_files = db.clear_file_info(user_id=userID, file_ids=file_ids)
            domain_info = db.get_domain_info(
                user_id=userID, selected_domain_number=selected_domain_number
            )
            file_info = db.get_file_info_with_domain(
                user_id=userID, domain_id=domain_info["domain_id"]
            )
            db.conn.commit()
            message = f"{deleted_files} files and {deleted_content} sentences deleted"
            domain_name = domain_info["domain_name"]
            status_code = 200
        if file_info:
            file_names = [info["file_name"] for info in file_info]

        return JSONResponse(
            content={
                "message": message,
                "domain_name": domain_name,
                "file_names": file_names,
            },
            status_code=status_code,
        )
    except KeyError:
        return JSONResponse(
            content={"message": "Please select the domain number first"},
            status_code=200,
        )
    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during file deletion: {str(e)}")
        raise HTTPException(
            content={"message": f"Failed deleting, error: {e}"}, status_code=500
        )


@router.post("/auth/login")
async def login(
    request: Request,
):
    try:
        data = await request.json()
        user_email = data.get("user_email")
        trial_password = data.get("trial_password")
        message = None
        status_code = 500
        session_id = None
        with Database() as db:
            user_info = db.get_user_info_w_email(user_email=user_email)
            if not user_info or not authenticator.verify_password(
                plain_password=trial_password,
                hashed_password=user_info["user_password"],
            ):
                message = "Invalid email or password"
                status_code = 401
            elif not user_info["is_active"]:
                message = "User is not activated yet. Please contact with --> rahmansahinler1@gmail.com"
                status_code = 401
            else:
                session_id = str(uuid.uuid4())
                db.insert_session_info(user_info["user_id"], session_id=session_id)
                db.conn.commit()
                message = "Login sucessfull"
                status_code = 200

        response = JSONResponse(
            content={"message": message, "session_id": session_id},
            status_code=status_code,
        )
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            secure=True,
            samesite="strict",
        )
        return response

    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during login: {str(e)}")
        raise HTTPException(
            content={"message": f"Failed deleting, error: {e}"}, status_code=500
        )


@router.post("/auth/signup")
async def signup(
    request: Request,
):
    try:
        data = await request.json()
        user_name = data.get("user_name")
        user_surname = data.get("user_surname")
        user_email = data.get("user_email")
        user_password = data.get("user_password")
        message = None
        status_code = 500
        with Database() as db:
            user_info = db.get_user_info_w_email(user_email=user_email)
            if user_info:
                message = "User already signed up!"
                status_code = 400
            else:
                user_id = str(uuid.uuid4())
                db.insert_user_info(
                    user_id=user_id,
                    user_name=user_name,
                    user_surname=user_surname,
                    user_password=authenticator.hash_password(user_password),
                    user_email=user_email,
                    user_type="trial",
                    is_active=True,
                )
                for i in range(5):
                    db.insert_domain_info(
                        user_id=user_id,
                        domain_id=str(uuid.uuid4()),
                        domain_name=f"Domain {i+1}",
                        domain_number=i + 1,
                    )
                db.conn.commit()
                message = "Successfully Signed Up!"
                status_code = 201

        return JSONResponse(
            content={
                "message": message,
            },
            status_code=status_code,
        )
    except Exception as e:
        db.conn.rollback()
        logging.error(f"Error during login: {str(e)}")
        raise HTTPException(
            content={"message": f"Failed deleting, error: {e}"}, status_code=500
        )
