from fastapi import FastAPI
from app.api import file_services

app = FastAPI(title="ragchat api")

app.include_router(file_services.router, prefix="/api/v1", tags=["files"])

@app.get("/")
async def root():
    return {"message": "Welcome to the ragchat!"}
