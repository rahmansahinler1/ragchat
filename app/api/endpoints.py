from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path

from .data_pipeline import FileDetector, FileProcessor
from .. import globals

router = APIRouter()
detector = FileDetector(domain_folder_path=globals.domain_folder_path, memory_file_path=globals.memory_file_path)
processor = FileProcessor(db_folder_path=globals.db_folder_path)

    
@router.post("/qa/generate_answer")
async def create_embedding(user_query:str):
    index_object = processor.indf.load_index(index_path=globals.index_path)
    globals.index = processor.create_index(embeddings=index_object["embeddings"])
    try:
        if globals.index:
            response, resource_text = processor.search_index(user_query=user_query)
            return response, resource_text
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/data_pipeline/check_changes")
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

