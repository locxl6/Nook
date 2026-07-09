# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import models, conversations, chat, health
from app.db import init_db

app = FastAPI()

# 启动时自动初始化数据库
init_db()

app.include_router(models.router)
app.include_router(conversations.router)
app.include_router(chat.router)
app.include_router(health.router)
app.add_middleware(
CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)