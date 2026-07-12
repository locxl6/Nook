# main.py
import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import models, conversations, chat, health
from app.config import setting
from app.schemas import GeneralResponse
from app.db import init_db

app = FastAPI()

init_db()

p = Path(setting.sensitive_words_file)
words = [l.strip() for l in p.read_text(encoding="utf-8").splitlines() if l.strip() and l[0] != "#"] if p.exists() else []


@app.middleware("http")
async def sensitive_filter(request: Request, call_next):
    if request.method == "POST" and words:
        body = await request.body()
        try:
            text = json.loads(body).get("message", "")
        except Exception:
            text = ""
        for w in words:
            if w in text:
                return JSONResponse(
                    GeneralResponse(ok=False, message="请求包含敏感内容").model_dump(),
                    status_code=400,
                )
    return await call_next(request)


app.include_router(models.router)
app.include_router(conversations.router)
app.include_router(chat.router)
app.include_router(health.router)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# PyInstaller / direct entry point — not used when started via uvicorn CLI.
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=setting.listen_host, port=setting.listen_port)

