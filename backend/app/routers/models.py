from typing import Union

from app.llm import list_ollama_models, pull_ollama_model
from app.config import setting
from fastapi import APIRouter
from app.schemas import ModelInfo, GeneralResponse

router = APIRouter()

@router.get(
    "/api/models",
    summary="获取模型列表",
    description="获取可用的模型列表，包括本地和远程模型",
    response_model=Union[list[ModelInfo], GeneralResponse],
)
def list_models() -> Union[list[ModelInfo], GeneralResponse]:
    models = list_ollama_models()
    if not models:
        return GeneralResponse(ok=False, message="未找到可用模型")
    return models

@router.post("/api/models/pull", summary="拉取模型", description="从 Ollama 拉取指定的模型")
async def pull_model(model_name: str) -> GeneralResponse:
    success = await pull_ollama_model(model_name)
    if not success:
        return GeneralResponse(ok=False, message=f"拉取模型 {model_name} 失败")
    return GeneralResponse(ok=True, message=f"模型 {model_name} 拉取成功")