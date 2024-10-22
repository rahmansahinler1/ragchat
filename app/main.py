from fastapi import FastAPI, Request, Cookie
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from .api import endpoints
from .db.database import Database


app = FastAPI(title="ragchat")
app.include_router(endpoints.router, prefix="/api/v1", tags=["files"])
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse("homepage.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/signup", response_class=HTMLResponse)
async def signup_page(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

@app.get("/app/{session_id}")
async def app_page(request: Request, session_id: str, cookie_session: str = Cookie(None)):
    effective_session = cookie_session or session_id
    with Database() as db:
        session_info = db.get_session_info(effective_session)
    if not session_info:
        return RedirectResponse(url="/login")
    else:
        return templates.TemplateResponse("app.html", {"request": request, "user_id": session_info["user_id"], "session_id": effective_session})
    