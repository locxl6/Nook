# 成员 B

---

## 第一部分：技术简介和通俗解释

### 1. Ollama

**一句话解释**：Ollama 是一个让你在自己电脑上跑大语言模型的工具，跑起来以后会在本机开一个 HTTP 服务（默认 `http://localhost:11434`），任何程序都能通过它跟模型对话——可以理解成"装在你自己电脑上的、不要钱、不联网也能用的 ChatGPT 服务"。

**通俗比喻**：

- ChatGPT 是别人家开的饭店，你得联网点外卖，还得付钱。
- Ollama 是你自己家装了个厨房（模型），食材（模型文件）下载一次就存本地，做完菜（生成回答）不依赖外网。点菜的方式是给厨房发个 HTTP 请求。

**在本项目中的用途**：后端通过 Ollama 跑 Qwen2.5、Llama3.2 等开源模型，用户在客户端里打的每一句话，最终都会发到本地 Ollama 服务，再把模型吐出来的字一个一个流式传回前端。

**怎么安装**：

```bash
# Linux / WSL（官方一行命令）
curl -fsSL https://ollama.com/install.sh | sh

# macOS 也可以用 Homebrew
brew install ollama

# Windows：去 https://ollama.com/download 下载安装包双击装
```

装完以后，Ollama 会作为一个后台服务跑起来，默认监听 `localhost:11434`。验证一下：

```bash
ollama --version   # 能看到版本号就说明装好了
```

**怎么拉模型（下载模型文件到本地）**：

```bash
# 拉一个轻量模型，CPU 也能跑（本项目默认用这个）
ollama pull qwen2.5:1.5b

# 或者拉稍大一点的，效果更好但更慢
ollama pull qwen2.5:3b
ollama pull llama3.2:1b

# 拉完看看本地有哪些模型
ollama list

# 直接和模型对话（交互式，会自动拉模型）
ollama run qwen2.5:1.5b
```

> 第一次 `pull` 要下载几个 G 的模型文件，慢的话见后面的"国内加速"。

**国内拉模型慢的解决办法**（项目里用得到，先存着）：

```bash
# 方案一：给 Ollama 服务设个代理（Linux，改成你自己的代理端口）
sudo systemctl edit ollama.service
# 在打开的文件里加：
# [Service]
# Environment="HTTPS_PROXY=http://127.0.0.1:7890"
# Environment="NO_PROXY=localhost,127.0.0.1"
# 保存后重启服务：sudo systemctl daemon-reload && sudo systemctl restart ollama

# 方案二：直接重试，有时候换个网络就好了
ollama pull qwen2.5:1.5b
```

**官方文档与教程**：

- 官方文档（英文）：<https://docs.ollama.com/>
- 官方文档中文镜像：<https://docs.ollama.ac.cn/> （流式传输专页：<https://docs.ollama.ac.cn/capabilities/streaming> ）
- 中文快速上手：<https://ollama.readthedocs.io/quickstart/>
- Ollama 本地部署教程（Win/Mac/Linux 全平台）：<https://aistacknav.com/ollama-local-deployment-tutorial/>
- Ollama 本地部署大模型完整教程：<https://aistacknav.com/ollama-local-llm-deployment-guide/>
- Ollama 部署 Qwen 详细指南（掘金）：<https://juejin.cn/post/7603677143214473231>
- 动手学 Ollama（Datawhale 开源教程）：<https://datawhalechina.github.io/handy-ollama/>
- 模型库（看有哪些模型可拉）：<https://ollama.com/library>

---

### 2. Ollama Python SDK

**一句话解释**：`ollama` 这个 Python 包是 Ollama 官方提供的客户端库，装上以后你不用自己拼 HTTP 请求，几行 Python 就能调模型。

**在本项目中的用途**：`llm.py` 里所有跟 Ollama 打交道的地方都用这个 SDK——列模型、流式聊天，都是它。

**安装**：

```bash
pip install ollama
```

**同步 vs 异步**：

SDK 提供两套客户端，API 长得一模一样，区别在"调用时会不会卡住整条线程"：

| 客户端 | 导入方式 | 适用场景 |
|---|---|---|
| 同步 `Client` | `from ollama import Client` | 脚本、命令行工具，调一次拿结果就行 |
| 异步 `AsyncClient` | `from ollama import AsyncClient` | Web 服务（FastAPI）、并发场景，调模型时还能接别的请求 |

本项目用 `AsyncClient`，因为 FastAPI 是异步框架，流式推理时如果用同步 `Client`，一个用户问问题的时候整个服务就卡死了，别人连不上。

**`stream=True` 的含义**：

默认情况下（`stream=False`），调一次 `chat()` 会**等模型把整段话全生成完**才一次性返回——用户要干等几秒才看到一整段字。

设成 `stream=True` 以后，模型一边生成一边往外吐，每次返回一个 `chunk`（一小段，可能就一两个字）。前端就能做出"打字机"那种一字一字蹦出来的效果。这就是"流式"。

同步流式返回的是普通生成器（用 `for` 遍历），异步流式返回的是**异步生成器**（用 `async for` 遍历）。

**关键代码片段**（异步流式，本项目用的就是这种）：

```python
import asyncio
from ollama import AsyncClient

async def chat():
    message = {'role': 'user', 'content': '为什么天空是蓝色的？'}
    # 注意这行：await 拿到的是异步生成器，再用 async for 遍历
    async for part in await AsyncClient().chat(
        model='qwen2.5:1.5b',
        messages=[message],
        stream=True,
    ):
        # part 是一个 ChatResponse 对象，既能当对象用，也能当字典用
        print(part.message.content, end='', flush=True)

asyncio.run(chat())
```

> 关于 `part.message.content` vs `part['message']['content']`：
> 新版 ollama SDK（1.x）返回的是 `ChatResponse` 对象，**两种写法都支持**——既能用属性 `part.message.content`，也能用下标 `part['message']['content']`。老版本（0.x）只支持字典写法。本项目用的是新版，所以两种都行，统一用一种就好。项目里 `llm.py` 用的是 `part.message.content`（属性风格）。

**官方文档与教程**：

- SDK 官方仓库（README 就是文档）：<https://github.com/ollama/ollama-python>
- 在 Python 中使用 Ollama API（中文，含同步/异步/流式）：<https://aisharenet.com/zai-python-zhongshiyong/>
- Ollama API 实战：Python 客户端开发指南（中文，踩坑记录）：<https://eastondev.com/blog/zh/posts/ai/20260418-ollama-api-practice/>
- Ollama 大模型入门指南（含 LangChain 对接）：<https://developer.cloud.tencent.com/article/2639603>

---

### 3. async / await 异步编程

**一句话解释**：`async`/`await` 是 Python 用来写"异步代码"的关键字，让程序在"等某个慢操作（比如等模型生成字）"的时候，能先去干别的事，而不是傻等。

**通俗比喻**：

假设你是一家餐厅唯一的服务员（单线程）：

- **同步做法**：客人点了一道要炖 30 分钟的菜，你就站在厨房门口等 30 分钟，期间新来的客人没人理。
- **异步做法**：你把订单递进厨房，跟厨房说"好了叫我"，然后**立刻回大厅**去接待新客人。厨房每做好一道菜就叫你一声，你再去端。

`async def` 定义的就是"可以被暂停、被恢复"的函数；`await` 就是"我在等一个慢操作，可以先让别人"的那个"让出去"的动作。

**为什么流式推理要用异步生成器（async generator）？**

流式推理 = 模型一个字一个字往外吐。每个字都要等 Ollama 那边算出来，这是慢操作（I/O）。

如果用普通函数 `return`，你得等所有字全算完才能返回——用户干等。

如果用普通生成器（`def` + `yield`），函数能一个一个吐字，但吐字过程中如果要去"等 Ollama 返回下一个字"（这也是个 I/O），普通生成器没法 `await`——它没进入异步世界。

所以需要 **异步生成器 = `async def` + `yield`**：函数体里既能 `await`（等 Ollama 的下一个字），又能 `yield`（把字交给调用方）。调用方用 `async for token in ...:` 来接收。

**四种函数组合（这是最核心的区分，记住这个表）**：

| 定义 | 关键字 | 调用方式 | 拿值方式 |
|---|---|---|---|
| 普通函数 | `def` + `return` | `result = f()` | 直接拿 |
| 同步生成器 | `def` + `yield` | `g = f()` | `for x in g:` |
| 协程 | `async def` + `return` | `result = await f()` | `await` 拿 |
| **异步生成器** | `async def` + `yield` | `g = f()` | **`async for x in g:`** |

本项目 `stream_ollama()` 就是第四种——异步生成器。

**官方文档与教程**：

- Python 官方 asyncio 概念性概述（中文）：<https://docs.pythonlang.cn/3.14/howto/a-conceptual-overview-of-asyncio.html>
- PEP 525 异步生成器（中文翻译）：<https://peps.pythonlang.cn/pep-0525/>
- Python 异步与迭代体系完整复习指南：<https://sinimite.work/posts/python-async-iteration-complete-guide/>
- 异步生成器详解（async 中文教程）：<https://hellowac.github.io/async-zh-cn/asyncio/en/c17/>

---

### 4. Ollama Chat API

**一句话解释**：Ollama 的 Chat 接口接收一个"消息列表"，模型根据这些消息生成下一条回复。消息列表就是一段对话的"剧本"。

**在本项目中的用途**：`build_messages()` 函数把"系统提示词 + 历史 + 当前问题"拼成这种消息列表，再交给 `stream_ollama()` 发给 Ollama。

**messages 格式**：

每条消息是一个字典，有两个键：`role`（谁说的）和 `content`（说了什么）。`role` 只有三种：

| role | 含义 | 通俗解释 |
|---|---|---|
| `system` | 系统提示词 | 给 AI 设定"人设"和规则，对话开始前一次性交代，像发剧本前的"导演说明" |
| `user` | 用户消息 | 你（用户）说的话 |
| `assistant` | AI 回复 | 模型之前回过的话，作为上下文传回去，让它记得"刚才聊到哪" |

一个完整的 messages 列表长这样：

```python
messages = [
    {"role": "system", "content": "你是一个友好的助手，用中文回答，简洁。"},
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮你的？"},
    {"role": "user", "content": "解释一下什么是异步"},  # 当前要回答的这条
]
```

**关键规则**：

- `system` 消息通常放第一条，且只有一条。
- `user` 和 `assistant` 要交替出现（用户问→AI答→用户问→AI答……）。
- 最后一条一般是 `user`（因为我们要让 AI 回答最新的问题）。

**stream 返回的 chunk 结构**：

设了 `stream=True` 后，模型不是一个完整的字典返回，而是切成很多 `chunk` 一个一个返回。每个 `chunk` 长这样：

```python
# 每个 chunk 的核心字段
{
    "model": "qwen2.5:1.5b",
    "message": {
        "role": "assistant",
        "content": "你好"   # 这次吐出来的一小段（可能就一两个字）
    },
    "done": False            # 还没说完
}
# 最后一个 chunk：
{
    "model": "qwen2.5:1.5b",
    "message": {"role": "assistant", "content": ""},
    "done": True,
    "total_duration": 1234567890,  # 总耗时（纳秒）
    "eval_count": 50,             # 生成的 token 数
    ...
}
```

所以流式处理的套路就是：把每个 chunk 里的 `message.content` 拼起来，就是完整回答。

**官方文档**：

- Ollama API 参考（含 /api/chat）：<https://docs.ollama.ac.cn/api/>
- 流式传输说明：<https://docs.ollama.ac.cn/capabilities/streaming>

---

### 5. Ollama 模型列表 API

**一句话解释**：Ollama 提供一个接口列出本机已经下载了哪些模型，SDK 里对应的是 `Client(host=...).list()`。

**在本项目中的用途**：`list_ollama_models()` 调用它拿到本机模型，前端模型选择器下拉框里展示的就是这个结果。Ollama 没装或没启动时，返回空，前端就显示默认模型。

**SDK 用法**：

```python
from ollama import Client

resp = Client(host='http://localhost:11434').list()
for m in resp.models:
    print(m.model)       # 模型名，如 'qwen2.5:1.5b'
    print(m.size)        # 模型大小（字节）
    print(m.modified_at)  # 最后修改时间
    print(m.details)      # 详细信息（参数量、量化级别等）
```

> 注意属性名：新版 SDK 里模型对象的标识字段叫 `model`（就是模型名字符串）。本项目代码里用的是 `m.name`，这是兼容写法——某些版本两个属性都暴露。你写的时候跟项目代码保持一致用 `m.name`，跑通了就行；如果报错说没 `name`，就换成 `m.model`。

**对应的 REST API**（不用 SDK 也能调）：

```bash
curl http://localhost:11434/api/tags
```

返回 JSON，里面 `models` 数组就是模型列表。SDK 只是对这个接口的封装。

**官方文档**：

- 列出本地模型（REST）：<https://docs.ollama.ac.cn/api/#list-local-models-tags>

---

### 6. Prompt Engineering

**一句话解释**：Prompt Engineering 是"怎么写好给 AI 的指令"的学问；系统 prompt（system prompt）是其中最关键的一环——在对话开始前给 AI 定个"人设"和"规则"，整段对话它都按这个走。

**通俗比喻**：

- 普通用户每次提问都靠 `user` 消息，就像每次见员工都要重新交代公司规矩。
- `system` prompt 相当于发一本"员工手册"——只发一次，员工（AI）整个对话都按手册办事，你后面提问不用重复说明。

**在本项目中的用途**：

- `build_system_prompt(base, skill, memories)` 组装系统提示词，把"基础人设 + 技能（编程/翻译/学习辅导）+ 长期记忆"拼进去。
- 技能来自 `backend/app/skills/*.md` 文件（通用、编程、翻译、学习），用户在界面切换技能，就是换不同的 system prompt。
- 记忆来自 SQLite 的 memories 表，用户说"记住我喜欢 Python"，下次对话系统提示词里会带上"用户喜欢 Python"。

**为什么要"组装" prompt 而不写死？**

因为系统提示词是动态拼出来的：基础人设是固定的，但技能和记忆是运行时变化的。不同用户、不同会话、不同技能，拼出来的 system prompt 不一样。所以需要个函数来组装。

**一个简单的 system prompt 例子**：

```
你是一个乐于助人的本地 AI 助手。用与用户相同的语言回答，简洁友好。

Skill context:
你现在是编程助手，回答代码问题时给出完整可运行的代码示例，并解释关键行。

Long-term memories (reference naturally, don't recite):
- 用户喜欢 Python
- 用户是初学者，解释要通俗
```

**官方文档与教程**：

- System Prompt 设计（AIGC Camp，中文）：<https://aigccamp.com/prompt/system-prompt>
- 大模型提示词工程指南（开源中文书）：<https://yeasy.gitbook.io/prompt_engineering_guide>
- OpenAI 提示工程指南（中文）：<https://developers.openai.ac.cn/api/docs/guides/prompting>
- Google Cloud 提示工程：<https://cloud.google.com/discover/what-is-prompt-engineering?hl=zh-CN>

---

### 7. FastAPI

**一句话解释**：FastAPI 是 Python 的一个 Web 框架，用来写后端 API；它基于异步、自带接口文档、用 Pydantic 自动校验请求参数，写起来快、跑起来也不慢。

**在本项目中的用途**：整个后端就是 FastAPI 写的。成员 B 负责的 `models.py` 是其中一个路由文件，提供 `GET /api/models` 接口。`llm.py` 虽然是纯函数模块，但它被 FastAPI 的聊天路由 `chat.py` 调用——`chat.py` 用 `StreamingResponse` 把 B 的 `stream_ollama()` 流式输出包成 SSE 推给前端。

**FastAPI 路由的基本写法**（成员 B 要写的 `models.py` 就是这个套路）：

```python
from fastapi import APIRouter

# 创建一个路由器，所有接口都挂在它下面
router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("")  # 对应 GET /api/models
async def list_models():
    return [{"id": "ollama:qwen2.5:1.5b", "name": "qwen2.5:1.5b", "provider": "ollama", "local": True}]
```

然后在 `main.py` 里把 `router` 注册到 app 上，这个接口就生效了。

**流式响应（StreamingResponse）**——这是 A 在 `chat.py` 里要用的，B 了解即可：

```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])

async def chat_stream_generator():
    # 这是个 async generator，每 yield 一段就是一个 SSE 事件
    yield "data: {\"content\": \"你\"}\n\n"
    yield "data: {\"content\": \"好\"}\n\n"

@router.post("/stream")
async def chat_stream():
    return StreamingResponse(
        chat_stream_generator(),
        media_type="text/event-stream",  # SSE 的 MIME 类型
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )
```

A 在 `chat.py` 里就是这么做的：把 B 的 `stream_ollama()` 包成 SSE 事件往外 yield。B 只要保证 `stream_ollama()` 是个能 `async for` 的异步生成器就行。

**官方文档与教程**：

- FastAPI 官方中文文档：<https://fastapi.tiangolo.com/zh/>
- 流式数据（StreamingResponse）：<https://fastapi.tiangolo.com/zh/advanced/stream-data/>
- 自定义响应（含 StreamingResponse）：<https://fastapi.tiangolo.com/zh/advanced/custom-response/>
- 服务器发送事件 SSE：<https://fastapi.tiangolo.com/zh/tutorial/server-sent-events/>
- FastAPI 流式响应完全指南（中文，含 SSE 和打字机效果）：<https://www.daomanpy.com/pyweb/fastapi/流式响应StreamingResponse>

---

## 第二部分：任务说明

成员 B 负责两个文件：`backend/app/llm.py`（LLM Provider，纯函数）和 `backend/app/routers/models.py`（模型列表 API）。

> 参考实现已经在这两个文件里，下面是每个函数要做什么的说明。建议你先理解任务，再看参考代码，最后自己能改、能调。

### 1. `llm.py` — LLM Provider（纯函数，不用类）

> 设计原则：**纯函数，不写类**。一个功能一个函数，参数进、返回值出，没有状态、没有继承、没有 `self`。这种风格更短、更直白、更好测。

#### `list_ollama_models() -> list[dict]`

- 调用 Ollama 的 `Client(host=...).list()` 列出本机已安装的模型。
- 把结果转成统一格式：`[{"id": "ollama:qwen2.5:1.5b", "name": "qwen2.5:1.5b", "provider": "ollama", "local": True}, ...]`。
- **Ollama 没装/没启动时要兜底**：用 `try/except` 捕获异常，返回空列表 `[]`。上层 `models.py` 会用默认模型顶上。
- 是同步函数（`def`，不是 `async def`），因为只是列个模型，很快，没必要异步。

#### `stream_ollama(model, messages, temperature=0.7) -> AsyncGenerator[str, None]`

- 异步生成器（`async def` + `yield`），用 `AsyncClient`。
- 入参 `model` 形如 `"ollama:qwen2.5:1.5b"`，**要去掉 `"ollama:"` 前缀**再传给 SDK（SDK 要的是纯模型名 `"qwen2.5:1.5b"`）。
- 用 `await client.chat(model=..., messages=..., stream=True, options={"temperature": ...})` 拿到异步生成器。
- `async for part in <生成器>: yield part.message.content`，每个 yield 是一个**字符串** token。
- 跳过空 content（最后一个 chunk 的 content 是空字符串）。

#### `build_system_prompt(base=None, skill=None, memories=None) -> str`

- 把三段拼成一个系统提示词字符串：基础人设 `base` + 技能上下文 `skill` + 长期记忆 `memories`。
- `base` 没传就用默认人设（一段英文，让 AI 用用户语言回答、简洁）。
- `skill` 是技能 prompt（从 `skills/*.md` 读出来的），没传就不加这段。
- `memories` 是记忆字符串列表，没传就不加。
- 返回拼好的字符串。

#### `build_messages(system_prompt, history, user_message) -> list[dict]`

- 组装发给 Ollama 的 messages 列表：`[system] + 最近20条history + [当前user_message]`。
- 历史取**最后 20 条**（上下文窗口），超了就截断——这是为了控制 token 数和成本。
- 返回的列表第一条是 `{"role": "system", "content": system_prompt}`，最后一条是 `{"role": "user", "content": user_message}`，中间是历史。

### 2. `models.py` — 模型列表 API

- `GET /api/models`，返回 `[{id, name, provider, local}]` 格式的列表。
- 调 `list_ollama_models()` 拿本地模型；如果配置了 OpenAI 兼容 API，也调 `list_api_models()` 把 API 模型拼进去。
- **兜底**：如果两个列表都是空（Ollama 没跑、也没配 API），返回默认模型 `ollama:{settings.ollama_default_model}`，这样前端永远有东西可选、不会崩。
- 用 `APIRouter(prefix="/api/models", tags=["models"])`，路由函数 `@router.get("")`。

---

## 第三部分：接口协议

这是你和组员、和组长约定的"接口契约"，必须对齐。

### `stream_ollama()` 函数签名（A 会调用）

```python
async def stream_ollama(
    model: str,              # 形如 "ollama:qwen2.5:1.5b"，函数内部去掉 "ollama:" 前缀
    messages: list[dict],    # [{"role": "system"/"user"/"assistant", "content": "..."}]
    temperature: float = 0.7,
) -> AsyncGenerator[str, None]:  # 每次 yield 一个 str token
```

**返回格式**：每个 `yield` 出去的是一个**字符串**，是模型生成的一个 token（可能是一个字、一个词、一段子串）。调用方（A 在 `chat.py`）这样用：

```python
async for token in stream_ollama(model, messages):
    # token 是 str，比如 "你"、"好"、"\n"
    full_response += token
    # 包成 SSE 事件推给前端
```

### `model` 参数格式

- 格式：`"provider:model_name"`，例如 `"ollama:qwen2.5:1.5b"`、`"ollama:llama3.2:1b"`。
- `stream_ollama()` 内部要去掉 `"ollama:"` 前缀，把 `"qwen2.5:1.5b"` 传给 Ollama SDK。
- 这种 `"provider:name"` 前缀的设计是为了以后能支持多家 provider（项目里已经加了 OpenAI 兼容 API，前缀是 `"api:"`）。

### `messages` 格式

```python
[
    {"role": "system",    "content": "你是..."},     # 第一条，且只有一条
    {"role": "user",      "content": "历史用户消息1"},
    {"role": "assistant", "content": "历史AI回复1"},
    {"role": "user",      "content": "历史用户消息2"},
    {"role": "assistant", "content": "历史AI回复2"},
    # ... 最多 20 条历史
    {"role": "user",      "content": "当前要回答的问题"},  # 最后一条
]
```

### `/api/models` 返回格式

```json
[
    {"id": "ollama:qwen2.5:1.5b", "name": "qwen2.5:1.5b", "provider": "ollama", "local": true},
    {"id": "ollama:llama3.2:1b",  "name": "llama3.2:1b",  "provider": "ollama", "local": true}
]
```

字段说明：

| 字段 | 类型 | 含义 |
|---|---|---|
| `id` | str | 全局唯一标识，格式 `provider:name`，前端用这个调聊天接口 |
| `name` | str | 模型显示名，下拉框里展示 |
| `provider` | str | 提供方，`"ollama"` 或 `"api"` |
| `local` | bool | 是不是本地模型，本地模型前端显示绿点 |

Ollama 没跑时返回默认模型（保证列表非空）：

```json
[{"id": "ollama:qwen2.5:1.5b", "name": "qwen2.5:1.5b", "provider": "ollama", "local": true}]
```

---

## 第四部分：代码示例

下面这些都能直接跑，先在本机验证一遍，再往项目里写。

### 1. 安装和配置 Ollama（命令行）

```bash
# 安装
curl -fsSL https://ollama.com/install.sh | sh

# 验证
ollama --version

# 拉模型（本项目默认模型，CPU 也能跑，约 1GB）
ollama pull qwen2.5:1.5b

# 看本地有哪些模型
ollama list

# 直接对话测试
ollama run qwen2.5:1.5b
# > 你好，介绍一下你自己
# > /bye   # 退出
```

### 2. 装依赖

```bash
cd backend
pip install ollama fastapi uvicorn pydantic-settings
```

### 3. 用 Ollama Python SDK 做异步流式 chat

把这个文件存成 `demo_stream.py` 跑一下，能看到字一个一个蹦出来：

```python
# demo_stream.py
import asyncio
from ollama import AsyncClient


async def stream_chat():
    messages = [
        {"role": "system", "content": "你是一个友好的助手，用中文回答，简洁。"},
        {"role": "user", "content": "用三句话介绍一下 Python。"},
    ]

    client = AsyncClient(host="http://localhost:11434")
    # 注意：await 拿到异步生成器，再 async for 遍历
    stream = await client.chat(
        model="qwen2.5:1.5b",
        messages=messages,
        stream=True,
        options={"temperature": 0.7},
    )
    async for part in stream:
        content = part.message.content  # 也能写 part['message']['content']
        if content:
            print(content, end="", flush=True)
    print()  # 收尾换行


if __name__ == "__main__":
    asyncio.run(stream_chat())
```

跑：

```bash
python demo_stream.py
```

### 4. 列出模型

```python
# demo_list.py
from ollama import Client


def main():
    resp = Client(host="http://localhost:11434").list()
    for m in resp.models:
        # 新版 SDK 用 m.model 拿模型名，项目里兼容用的是 m.name
        name = getattr(m, "name", None) or m.model
        print(f"id=ollama:{name}  name={name}  size={m.size}")


if __name__ == "__main__":
    main()
```

### 5. async generator 的写法（yield）

最小例子，理解 `async def + yield` 怎么配合 `async for`：

```python
# demo_async_gen.py
import asyncio


async def count_to_three():
    """异步生成器：每秒 yield 一个数"""
    for i in range(1, 4):
        await asyncio.sleep(0.3)  # 模拟"等一个慢操作"
        yield f"第 {i} 个"        # 把值交出去


async def main():
    async for item in count_to_three():  # 用 async for 接收
        print(item)


if __name__ == "__main__":
    asyncio.run(main())
```

对比 `stream_ollama()`：`await asyncio.sleep(0.3)` 换成 `async for part in <ollama 返回的生成器>`，`yield f"第 {i} 个"` 换成 `yield part.message.content`，套路完全一样。

### 6. FastAPI 路由的基本写法

完整的可跑例子，这就是 `models.py` 的骨架：

```python
# demo_fastapi.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()


# --- 模型列表接口（同步返回 JSON）---
@app.get("/api/models")
async def list_models():
    # 真实项目里这里调 list_ollama_models()
    return [
        {"id": "ollama:qwen2.5:1.5b", "name": "qwen2.5:1.5b", "provider": "ollama", "local": True},
    ]


# --- 流式接口骨架（StreamingResponse，演示用）---
async def fake_stream():
    import json
    for word in ["你", "好", "，", "世", "界"]:
        yield f"data: {json.dumps({'type': 'token', 'content': word}, ensure_ascii=False)}\n\n"
    yield "data: {\"type\": \"done\"}\n\n"


@app.post("/api/chat/stream")
async def chat_stream():
    return StreamingResponse(
        fake_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

跑起来后浏览器访问 `http://localhost:8000/docs`，FastAPI 自带的接口文档就出来了——这是 FastAPI 最大的爽点之一。

### 7. 项目里的实际 `llm.py`（参考实现，对照学习用）

下面是 `backend/app/llm.py` 里 B 负责的几个函数的核心代码（精简版，去掉 OpenAI provider 部分）：

```python
from collections.abc import AsyncGenerator
from ollama import AsyncClient, Client
from app.config import settings


def list_ollama_models() -> list[dict]:
    """列出 Ollama 已安装模型，统一格式。Ollama 没跑返回空列表。"""
    try:
        resp = Client(host=settings.ollama_base_url).list()
        return [
            {"id": f"ollama:{m.name}", "name": m.name, "provider": "ollama", "local": True}
            for m in resp.models
        ]
    except Exception:
        return []  # 兜底，上层会用默认模型


async def stream_ollama(model, messages, temperature=0.7) -> AsyncGenerator[str, None]:
    """异步流式推理，逐 token yield 字符串。"""
    client = AsyncClient(host=settings.ollama_base_url)
    # 去掉 "ollama:" 前缀，SDK 要纯模型名
    model_name = model.replace("ollama:", "", 1) if model.startswith("ollama:") else model
    async for part in await client.chat(
        model=model_name,
        messages=messages,
        stream=True,
        options={"temperature": temperature},
    ):
        if part.message.content:
            yield part.message.content


def build_system_prompt(base=None, skill=None, memories=None) -> str:
    """组装系统提示词：基础人设 + 技能 + 记忆。"""
    parts = []
    base_prompt = base or (
        "You are a helpful AI assistant running locally. "
        "Respond in the same language as the user. Be concise and helpful."
    )
    parts.append(base_prompt)
    if skill:
        parts.append(f"\n\nSkill context:\n{skill}")
    if memories:
        memory_text = "\n".join(f"- {m}" for m in memories)
        parts.append(f"\n\nLong-term memories (reference naturally, don't recite):\n{memory_text}")
    return "".join(parts)


def build_messages(system_prompt, history, user_message) -> list[dict]:
    """组装 messages：system + 最近 20 条历史 + 当前 user。"""
    messages = [{"role": "system", "content": system_prompt}]
    recent = history[-20:] if len(history) > 20 else history  # 上下文窗口
    for msg in recent:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})
    return messages
```

对应的 `models.py`：

```python
from fastapi import APIRouter
from app.config import settings
from app.llm import list_ollama_models

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
async def list_models():
    models = list_ollama_models()
    # （如果配了 API 模型，也拼进来，这里省略）
    if not models:  # 兜底：Ollama 没跑时返回默认模型
        models = [{
            "id": f"ollama:{settings.ollama_default_model}",
            "name": settings.ollama_default_model,
            "provider": "ollama",
            "local": True,
        }]
    return models
```

### 8. 一个能自检的最小 demo（懒人必备）

把流式推理和组装逻辑串起来自检，跑通了就说明 B 的核心功能 OK：

```python
# demo_self_check.py
import asyncio
from ollama import AsyncClient, Client

HOST = "http://localhost:11434"
MODEL = "qwen2.5:1.5b"


def build_messages(system_prompt, history, user_message):
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-20:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": user_message})
    return messages


async def stream_ollama(model, messages):
    client = AsyncClient(host=HOST)
    name = model.replace("ollama:", "", 1) if model.startswith("ollama:") else model
    async for part in await client.chat(model=name, messages=messages, stream=True):
        if part.message.content:
            yield part.message.content


async def main():
    # 1. 列模型
    resp = Client(host=HOST).list()
    names = [getattr(m, "name", None) or m.model for m in resp.models]
    assert MODEL in names, f"模型 {MODEL} 没装，先 ollama pull {MODEL}"
    print(f"[1] 本地模型: {names}")

    # 2. 组装 + 流式
    sys_prompt = "你是一个友好的助手，用中文回答，简洁。"
    history = [{"role": "user", "content": "1+1等于几？"},
               {"role": "assistant", "content": "1+1等于2。"}]
    messages = build_messages(sys_prompt, history, "那再加上 3 呢？")
    print("[2] messages:", messages)

    print("[3] 流式回答:")
    full = ""
    async for token in stream_ollama(f"ollama:{MODEL}", messages):
        print(token, end="", flush=True)
        full += token
    print()
    assert full.strip(), "回答为空，检查模型"
    print("[OK] 自检通过")


if __name__ == "__main__":
    asyncio.run(main())
```

---

## 第五部分：协作说明

### 依赖谁

| 依赖对象 | 依赖内容 | 什么时候要 |
|---|---|---|
| **组长** | 接口协议（SSE 事件格式、API 路径、`/api/models` 返回格式） | Day 1 组长发接口文档后 |
| **组长** | `backend/app/config.py` 里的 `settings.ollama_base_url`、`settings.ollama_default_model` | Day 1 骨架搭好后 |
| **组长** | `backend/.env.example`（环境变量模板） | Day 1 |
| **环境** | 本机装好 Ollama、`ollama pull qwen2.5:1.5b` 拉好模型 | 越早越好，Day 1 就该搞定 |

### 被谁依赖

| 被谁依赖 | 被依赖的接口 | 调用方式 |
|---|---|---|
| **成员 A**（`chat.py`） | `stream_ollama(model, messages)` | `async for token in stream_ollama(model, messages):` |
| **成员 A**（`chat.py`） | `build_messages(system_prompt, history, user_message)` | `messages = build_messages(...)` |
| **成员 A**（`chat.py`） | `build_system_prompt(skill=..., memories=...)` | `system_prompt = build_system_prompt(...)` |
| **成员 D**（前端 `ModelSelector.tsx`） | `GET /api/models` | `fetch("http://localhost:8000/api/models").then(r => r.json())` |

### 必须和 A 约定的点（最关键）

A 会**这样调用**你的 `stream_ollama()`，签名和返回值必须严格对齐：

```python
# A 在 chat.py 里的调用方式（不能改）
async for token in stream_ollama(model, messages):
    full_response += token
    yield sse_event({"type": "token", "content": token})
```

所以你必须保证：

1. **函数名**就叫 `stream_ollama`，从 `app.llm` 导入。
2. **参数顺序**：`model` 在前，`messages` 在后，`temperature` 有默认值。
3. **返回值**：是个**异步生成器**，每次 `yield` 一个 `str`（不是 dict、不是 bytes，就是字符串 token）。
4. `model` 参数**带 `"ollama:"` 前缀**进来，你函数内部去掉——不要让 A 去前缀，A 不知道也不该关心。
5. **异常处理**：模型调用失败时别让异常冒泡到 A 的循环里把整个流搞崩；要么在函数内捕获重试，要么抛出让 A 的 `try/except` 接住（项目里 A 用 `try/except Exception` 包了整个流，所以抛异常也行，但最好别抛空字符串）。

### 和 D 约定的点

D 的 `ModelSelector.tsx` 会 `fetch("http://localhost:8000/api/models")`，拿到的 JSON 数组每个元素要有 `id`、`name`、`provider`、`local` 四个字段。D 会：

- 用 `name` 显示在下拉框；
- 用 `local` 决定要不要显示绿点（本地模型亮绿点）；
- 用 `id` 作为选中后传给聊天接口的 `model` 参数。

所以你的 `/api/models` 返回的 `id` 格式必须是 `ollama:模型名`，因为聊天接口（A 那边）会原样把这个 `id` 传给 `stream_ollama()`。

### 交付节点

| 时间 | 交付物 |
|---|---|
| **Day 1** | 装好 Ollama、拉好 `qwen2.5:1.5b`、跑通"用 SDK 流式 chat"的 demo |
| **Day 2** | `llm.py` 完成：`stream_ollama` + `build_messages` + `build_system_prompt` 都能用（用上面的自检 demo 验证） |
| **Day 3** | `models.py` 完成 + 配合 A 联调（A 把 `chat.py` 接到你的 `stream_ollama` 上，端到端跑通流式聊天） |
| **Day 4** | 修 bug |

### 常见坑（提前知道少踩）

1. **Ollama 没启动**：`list_ollama_models()` 和 `stream_ollama()` 都会抛连接异常。前者要 `try/except` 返回 `[]`，后者让 A 的 try 接住。先 `ollama list` 确认服务在跑。
2. **模型名写错**：SDK 要 `"qwen2.5:1.5b"`（带冒号和版本），写成 `"qwen2.5"` 可能拉到别的版本。`ollama list` 看清楚本地到底叫什么。
3. **`await` 忘了**：`await client.chat(..., stream=True)` 返回的是异步生成器，**必须先 `await` 拿到它，再 `async for`**。写成 `async for part in client.chat(...)` 会报错。
4. **`part.message.content` 还是 `part['message']['content']`**：新版 SDK 两种都行，项目统一用属性风格。如果某天升级 SDK 报错说没这个属性，再换成下标。
5. **历史消息没截断**：`build_messages` 必须取 `history[-20:]`，不然长对话 token 爆炸，模型会报 context too long。
6. **最后一条 history 是当前 user 消息**：A 调用时会先把当前 user 消息存进 db，再取历史，所以 `history` 里已经包含了当前 user 消息——A 会传 `history[:-1]`（去掉最后那条当前消息），你再把当前消息单独 append。看 A 的 `chat.py` 第 58 行就是这么干的。

---

## 附：快速自查清单

写完 B 的两个文件后，对照这个清单逐项确认：

- [ ] `ollama list` 能看到 `qwen2.5:1.5b`
- [ ] `python demo_stream.py` 能流式输出
- [ ] `llm.py` 里 `list_ollama_models()` 在 Ollama 关掉时返回 `[]`，不抛异常
- [ ] `stream_ollama()` 是 `async def`，每次 `yield` 的是 `str`
- [ ] `stream_ollama("ollama:qwen2.5:1.5b", messages)` 能正确去掉前缀
- [ ] `build_messages()` 第 1 条是 system，最后 1 条是 user，中间不超过 20 条
- [ ] `build_system_prompt()` 三段拼接顺序是 base → skill → memories
- [ ] `models.py` 的 `GET /api/models` 返回 `[{id, name, provider, local}]`，Ollama 没跑时返回默认模型
- [ ] 自检 demo `demo_self_check.py` 跑通

跑通这些，B 的活就干完了。剩下联调时按 A 的反馈微调即可。
