from fastapi import APIRouter, UploadFile, HTTPException, Request, Query, File, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import List
import logging
import uuid
import base64
import psycopg2

from .core import Processor
from .core import Authenticator
from .. import globals
from ..db.database import Database

router = APIRouter()
processor = Processor()
authenticator = Authenticator()


# request functions
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


@router.post("/db/insert_feedback")
async def insert_feedback(
    userID: str = Query(...),
    feedback_type: str = Form(...),
    feedback_description: str = Form(...),
    feedback_screenshot: UploadFile = File(None),
):
    try:
        feedback_id = str(uuid.uuid4())
        screenshot_data = None

        if feedback_screenshot:
            contents = await feedback_screenshot.read()
            if len(contents) > 2 * 1024 * 1024:  # 2MB limit
                raise HTTPException(
                    status_code=400, detail="Screenshot size should be less than 2MB"
                )
            screenshot_data = base64.b64encode(contents).decode("utf-8")

        with Database() as db:
            db.insert_user_feedback(
                feedback_id=feedback_id,
                user_id=userID,
                feedback_type=feedback_type,
                description=feedback_description[:5000],
                screenshot=screenshot_data,
            )
            db.conn.commit()

        return JSONResponse(
            content={"message": "Thanks for the feedback!"}, status_code=200
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
        file_names, domain_name = update_selected_domain(
            user_id=userID, selected_domain=selected_domain_number
        )

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


@router.post("/io/upload_files")
async def upload_files(
    userID: str = Query(...),
    files: List[UploadFile] = File(...),
    lastModified: List[str] = Form(...),
):
    try:
        if not files:
            return JSONResponse(
                content={"message": "No files provided"}, status_code=400
            )

        selected_domain_number = globals.selected_domain[userID]

        # Get domain info
        with Database() as db:
            domain_info = db.get_domain_info(
                user_id=userID, selected_domain_number=selected_domain_number
            )
            if not domain_info:
                return JSONResponse(
                    content={"message": "Invalid domain selected"}, status_code=400
                )

            # Prepare direct insertion tuples
            file_info_batch = []
            file_content_batch = []

            # Process all files
            for file, last_modified in zip(files, lastModified):
                # Validate file
                if not file.filename:
                    continue

                try:
                    file_bytes = await file.read()
                    if not file_bytes:
                        continue

                    file_data = processor.rf.read_file(
                        file_bytes=file_bytes, file_name=file.filename
                    )

                    if not file_data["sentences"]:
                        continue

                    # Prepare batches
                    file_embeddings = processor.ef.create_embeddings_from_sentences(
                        sentences=file_data["sentences"]
                    )
                    file_id = str(uuid.uuid4())
                    file_info_batch.append(
                        (
                            userID,
                            file_id,
                            domain_info["domain_id"],
                            file.filename[:100],  # Truncate here if needed
                            datetime.fromtimestamp(int(last_modified) / 1000).strftime(
                                "%Y-%m-%d"
                            )[:20],
                        )
                    )
                    for i in range(len(file_data["sentences"])):
                        file_content_batch.append(
                            (
                                file_id,
                                file_data["sentences"][i],
                                file_data["page_number"][i],
                                file_data["is_header"][i],
                                file_data["is_table"][i],
                                psycopg2.Binary(file_embeddings[i].tobytes()),
                            )
                        )

                except Exception as e:
                    logging.error(f"Error processing file {file.filename}: {str(e)}")
                    continue

            if not file_info_batch or not file_content_batch:
                return JSONResponse(
                    content={"message": "No valid files to process"}, status_code=400
                )

            # Bulk insertions
            try:
                success = db.insert_file_batches(file_info_batch, file_content_batch)
                if not success:
                    return JSONResponse(
                        content={"message": "Failed to process files"}, status_code=500
                    )
                db.conn.commit()

            except Exception as e:
                logging.error(f"Database error: {str(e)}")
                raise HTTPException(status_code=500, detail="Database error occurred")

        # Update domain info
        file_names, domain_name = update_selected_domain(
            user_id=userID, selected_domain=selected_domain_number
        )

        return JSONResponse(
            content={
                "message": f"Files uploaded successfully to domain {selected_domain_number}",
                "file_names": file_names,
                "domain_name": domain_name,
            },
            status_code=200,
        )

    except KeyError:
        return JSONResponse(
            content={"message": "Please select the domain number first"},
            status_code=200,
        )
    except Exception as e:
        logging.error(f"Error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

    except KeyError:
        return JSONResponse(
            content={"message": "Please select the domain number first"},
            status_code=200,
        )
    except Exception as e:
        if "db" in locals():
            db.conn.rollback()
        logging.error(f"Error during file upload: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed uploading, error: {str(e)}"
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


# helper functions
def update_selected_domain(user_id: str, selected_domain: int):
    globals.selected_domain[user_id] = selected_domain
    with Database() as db:
        domain_info = db.get_domain_info(user_id, selected_domain)
        file_info = db.get_file_info_with_domain(user_id, domain_info["domain_id"])
        if not file_info:
            globals.domain_content[user_id] = []
            globals.index[user_id] = None
            return None, domain_info["domain_name"]

        content, embeddings = db.get_file_content(
            file_ids=[info["file_id"] for info in file_info]
        )
        globals.domain_content[user_id] = content
        globals.boost_info[user_id] = processor.extract_boost_info(
            domain_content=content, embeddings=embeddings
        )
        globals.index[user_id] = processor.create_index(embeddings=embeddings)
        try:
            globals.index_header[user_id] = processor.create_index(
                embeddings=globals.boost_info[user_id]["header_embeddings"]
            )
        except IndexError:
            globals.index_header[user_id] = None
        file_names = [info["file_name"] for info in file_info]
        domain_name = domain_info["domain_name"]
        return file_names, domain_name
