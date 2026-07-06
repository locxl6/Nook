# 成员 A

---

## 第一部分：技术简介和通俗解释

> 每个技术给出四件事：**一句话通俗解释** → **在本项目中的用途** → **官方文档链接（中文优先）** → **推荐中文教程链接**。

### 1. Python 3

**一句话解释：** 一门语法简洁、生态丰富的编程语言，是 AI / 数据处理 / 后端开发的首选语言之一。

**在本项目中的用途：** 整个后端用 Python 编写。它自带的 `sqlite3`、`asyncio`、`uuid`、`json` 等标准库直接覆盖了我们 80% 的需求，不用额外装包。

**版本要求：** Python **3.10+**（项目用了 `X | None` 这种新写法类型注解，3.10 以前不支持，要写成 `Optional[X]`）。推荐 3.11 或 3.12。

**官方文档（中文）：** <https://docs.python.org/zh-cn/3/tutorial/index.html>

**推荐教程：**

- 廖雪峰 Python 教程：<https://liaoxuefeng.com/books/python/introduction/index.html>
- 官方文档国内镜像：<https://docs.pythonlang.cn/3/tutorial/index.html>

---

### 2. FastAPI

**一句话解释：** 一个现代、高性能的 Python Web 框架，专门用来快速写 API 接口，自带数据校验和自动接口文档。

**通俗比喻：** 开一家餐厅。

- 你写的是「菜单 + 厨房流程」（路由 + 业务逻辑）。
- FastAPI 是「餐厅经理」：客人点单（HTTP 请求）时，它帮你核对订单格式对不对（数据校验）、把单子派到对应窗口（路由分发）、还自动生成一份带图的菜单给客人看（Swagger 文档 `/docs`）。
- 你不用自己招呼客人、不用手写参数校验，专心做菜就行。

**为什么用它而不是 Flask / Django？**

| 对比项 | FastAPI | Flask | Django |
|---|---|---|---|
| 异步支持（async/await） | 原生支持 | 需要额外配置 | 较弱 |
| 自动数据校验 | Pydantic 内置 | 要手写或装扩展 | 要手写或用 Form |
| 自动 API 文档 | 自带 `/docs` | 要装 flasgger | 要装 drf-yasg |
| 学习曲线 | 低 | 低 | 高（大而全） |
| 适合场景 | API 服务、流式接口 | 小型网站 | 全栈 Web 应用 |

我们要做**流式聊天接口（SSE）**，必须用异步，FastAPI 是最合适的选择。

**在本项目中的用途：**

- 提供 REST API（会话管理、健康检查）
- 提供 SSE 流式聊天接口（`POST /api/chat/stream`）
- 用 Pydantic 自动校验请求体（`ChatRequest`）
- 自动生成接口文档（开发时访问 `http://localhost:8000/docs`）

**官方文档（中文）：** <https://fastapi.tiangolo.com/zh/>

**推荐教程：**

- FastAPI 官方教程（中文，最权威）：<https://fastapi.tiangolo.com/zh/tutorial/>
- FastAPI 官方学习路径：<https://fastapi.tiangolo.com/zh/learn/>
- FastAPI 官方学习路径：<https://fastapi.tiangolo.com/zh/learn/>
- GitHub 中文体系化教程 hello-FastAPI：<https://github.com/m12305/hello-FastAPI>

> 学习重点：**路径操作（路由）**、**请求体（Pydantic 模型）**、**StreamingResponse（流式响应）**。这三个看懂就能干活。

---

### 3. Uvicorn

**一句话解释：** 一个 ASGI 服务器，负责把你的 FastAPI 应用「跑起来」，监听端口、接收 HTTP 请求、转发给 FastAPI、再把响应发回去。

**通俗比喻：** 接着上面餐厅的比喻。

- FastAPI 是「餐厅经理 + 厨房」（业务逻辑）。
- Uvicorn 是「门面 + 服务员」：它站在门口迎客（监听端口）、把客人引到经理那里（转发请求）、菜做好了端给客人（返回响应）。
- **FastAPI 自己不会监听端口**，没有 Uvicorn（或其他 ASGI 服务器），你的代码跑不起来、外面访问不了。

**ASGI 是什么（通俗解释）：**
ASGI = Asynchronous Server Gateway Interface（异步服务器网关接口）。它是一套**协议/标准**，规定「服务器」和「应用」之间怎么对话。

- 老标准叫 **WSGI**（同步）：一个请求独占一个线程，处理完才能接下一个。像只有一个收银台的超市。
- 新标准叫 **ASGI**（异步）：一个线程就能交替处理多个请求，还支持 WebSocket 长连接。像加了多条自助通道的超市，效率高得多。

FastAPI 基于 async/await 异步编程，**必须**用 ASGI 服务器（Uvicorn）才能跑，用老的 WSGI 服务器（如 Gunicorn 默认模式）跑不了异步代码。

**关系图：**

```
浏览器 / 前端
    ↓ HTTP 请求
  Uvicorn（ASGI 服务器，监听端口）
    ↓ 按 ASGI 协议转发
  FastAPI（你的应用，路由 + 校验 + 业务逻辑）
    ↓
  SQLite / Ollama
```

**在本项目中的用途：** 启动后端服务。开发时用 `--reload` 参数，改代码自动重启。

```bash
uvicorn app.main:app --reload --port 8000
# app.main:app = 文件 app/main.py 里的 app 变量
# --reload = 改代码自动重启（仅开发用）
```

**官方文档：**

- Uvicorn 官方文档（英文）：<https://uvicorn.dev/>
- FastAPI 部署文档（中文，讲 Uvicorn 用法）：<https://fastapi.tiangolo.com/zh/deployment/manually/>

**推荐教程：**

- Uvicorn 官方文档（英文）：<https://uvicorn.dev/>
- Agent Wiki Uvicorn 核心概念：<https://learnagent.wiki/agent/cards/uvicorn>
- 51CTO「关于 Uvicorn」：<https://blog.51cto.com/qzcsbj/14458717>

---

### 4. Pydantic

**一句话解释：** 一个数据校验库，你用「类 + 类型注解」定义数据结构，它自动帮你校验传入的数据对不对、不对就报错。

**通俗比喻：** 像一份「订单模板」。

- 你规定：下单必须有 `message`（字符串），可选 `model`（字符串）。
- 客人传 `{"message": "你好"}` → 通过，自动变成对象给你用。
- 客人传 `{"model": "gpt"}`（漏了 message）→ Pydantic 直接挡回去，返回清晰的错误信息，你不用手写 if 判断。

**简单例子（就是本项目 `ChatRequest` 的写法）：**

```python
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str                    # 必填，必须是字符串
    conversation_id: str | None = None   # 可选，默认 None
    model: str | None = None        # 可选，默认 None

# 正确：自动校验通过
req = ChatRequest(message="你好")
print(req.message)  # 你好

# 错误：漏了必填字段，Pydantic 自动返回 422 错误给前端
# ChatRequest()  →  FastAPI 自动返回 {"detail": [{"msg": "Field required", ...}]}
```

在 FastAPI 里，**你只要把 Pydantic 模型写成函数参数的类型注解**，FastAPI 就自动校验请求体，不用写一行校验代码：

```python
@router.post("/stream")
async def chat_stream(request: ChatRequest):  # ← 自动校验请求体
    print(request.message)  # 校验通过了才进到这里
```

**在本项目中的用途：**

- 定义 `ChatRequest`（聊天请求体：message、conversation_id、model）
- 定义 `SSEEvent`（SSE 事件结构，用于文档说明）
- 会话管理接口里定义 `CreateConversationRequest`

**官方文档（中文）：** <https://docs.pydantic.org.cn/latest/> ｜ 模型概念：<https://docs.pydantic.org.cn/latest/concepts/models/>

**推荐教程：**

- 阿里云「Pydantic v2 入门」：<https://developer.aliyun.com/article/1740729>
- Pydantic v2 入门（阿里云开发者社区）：<https://developer.aliyun.com/article/1740729>

> 学习重点：**BaseModel**、**类型注解（`str`、`int`、`str | None`）**、**默认值**。不用学复杂的校验器，本项目用不到。

---

### 5. SQLite + sqlite3 标准库

**一句话解释：** SQLite 是一个「不用安装、不用启动服务、整个数据库就是一个文件」的轻量级数据库；Python 自带 `sqlite3` 模块直接操作它，零配置。

**通俗比喻：**

- MySQL / PostgreSQL 像「银行」：有独立的服务器进程，要安装、要配置账号密码、客户端通过网络连过去存取钱。强大但麻烦。
- SQLite 像「家里的保险箱」：就是一个文件（`chatbot.sqlite3`），你的程序直接读写这个文件，不用启动任何服务。够用、零门槛。

**为什么不用 MySQL / PostgreSQL？**

| 对比项 | SQLite | MySQL / PostgreSQL |
|---|---|---|
| 安装 | 不用，Python 自带 | 要装服务、配账号 |
| 部署 | 一个文件，跟着项目走 | 要起数据库服务进程 |
| 并发 | 单写入（够本项目用） | 高并发写入 |
| 适合场景 | 本地应用、单机、学习 | 大型 Web、多用户 |
| 本项目结论 | 完美匹配 | 杀鸡用牛刀 |

本项目是**本地单用户聊天机器人**，数据量小、读写不频繁，SQLite 是最合适的选择——装完 Python 就能用，换台电脑把那个 `.sqlite3` 文件拷走就行。

**为什么不用 ORM（如 SQLAlchemy）？**

- ORM 是「用 Python 对象操作数据库」的工具，省去写 SQL，但学习成本高、多一层抽象。
- 本项目只有 2 张表、7 个简单函数，**直接写 SQL 更直观、更利于学习数据库原理**。
- 标准库 `sqlite3` 够用，少装一个依赖。组长定的原则就是「原始 SQL，无 ORM」。

**在本项目中的用途：**

- 存会话列表（`conversations` 表）
- 存聊天消息（`messages` 表）
- 数据库文件在 `data/chatbot.sqlite3`（被 gitignore，不进版本库）

**官方文档：**

- Python sqlite3 标准库（中文）：<https://docs.python.org/zh-cn/3/library/sqlite3.html>
- SQLite 官网（含中文页）：<https://www.sqlite.org/> ｜ SQL 语法：<https://www.sqlite.org/lang.html>

**推荐教程：**

- 廖雪峰 SQLite 教程：<https://liaoxuefeng.com/books/python/database/sqlite/index.html>
- Kanaries Python SQLite3 完整指南：<https://docs.kanaries.net/zh/topics/Python/python-sqlite3>
- Python 官方文档镜像：<https://docs.pythonlang.cn/3/library/sqlite3.html>

> 学习重点：**`connect()`**、**`cursor.execute()`**、**`?` 参数占位符（防 SQL 注入）**、**`commit()`**、**`row_factory = sqlite3.Row`（让结果像字典一样取值）**。

---

### 6. SSE (Server-Sent Events)

**一句话解释：** 一种基于 HTTP 的「服务器单向推送给浏览器」的技术，服务器可以持续往一个连接里发数据，浏览器边收边显示。

**通俗比喻：**

- 普通 HTTP 请求像「点外卖」：下单 → 等饭店做完 → 一次性送到（你要等全部做完才能看到）。
- SSE 像「看直播」：服务器是主播，连上之后它一边生成一边往外发，你一边收一边看，源源不断。
- WebSocket 像「打电话」：双方都能说话（双向）。但我们的场景只有 AI 在说话（单向推送），用 WebSocket 是杀鸡用牛刀。

**SSE 和 WebSocket 的区别：**

| 对比项 | SSE | WebSocket |
|---|---|---|
| 方向 | 服务器 → 客户端（单向） | 双向 |
| 协议 | 普通 HTTP | 单独的 ws:// 协议 |
| 浏览器支持 | 原生 `EventSource` | 原生 `WebSocket` |
| 自动重连 | 内置 | 要自己写 |
| 复杂度 | 低 | 高 |
| 适合场景 | AI 流式输出、通知推送 | 聊天室、游戏 |

**为什么用 SSE？** AI 回答是一个字一个字「吐」出来的（像 ChatGPT 那样），这正是「服务器单向推送」的场景。SSE 基于 HTTP，简单、稳定、CDN 友好，是 LLM 流式输出的最优解。

**SSE 数据格式（重点，你要按这个格式发）：**

```
data: {"type": "token", "content": "你"}\n\n
data: {"type": "token", "content": "好"}\n\n
data: {"type": "done"}\n\n
```

- 每条消息以 `data:` 开头
- 内容是 JSON 字符串
- 每条消息结尾是**两个换行符** `\n\n`（分隔不同事件）

**在本项目中的用途：** `POST /api/chat/stream` 接口用 SSE 流式返回 AI 的回答，前端边收边渲染，体验接近 ChatGPT。

**官方文档：**

- FastAPI SSE 官方文档（中文）：<https://fastapi.tiangolo.com/zh/tutorial/server-sent-events/>
- MDN Server-Sent Events（中文）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events>

**推荐教程：**

- FastAPI 官方 StreamingResponse：<https://fastapi.tiangolo.com/zh/advanced/stream-data/>
- 工具库「Python SSE 流式输出 LLM 的 5 种实现模式」：<https://www.toolsku.com/zh-CN/blog/python-sse-streaming-llm-2026/>
- 融管理社区「FastAPI + SSE 少踩一半坑」：<https://www.rongpm.com/column/fastapi-sse-stream-36ry.html>

> 本项目采用「**手动 SSE**」：用 `StreamingResponse` + 自己拼 `data: {json}\n\n` 字符串。这种写法最直观、最好理解 SSE 格式，也是社区最主流的做法。（FastAPI 新版有 `EventSourceResponse`，但手动写法对学习更友好，且本项目就是用这种。）

---

### 7. async/await 异步编程

**一句话解释：** 一种「让程序在等待某件事时先去干别的、等那件事好了再回来继续」的写法，用 `async def` 定义异步函数、`await` 等待异步操作。

**通俗比喻：** 你在厨房做菜。

- **同步**：烧水时你盯着壶等水开，期间什么都不干。水开了再下面条。（浪费时间）
- **异步**：烧水时你先去切菜；水开的「通知」来了，你回去下面条。（高效利用时间）
- `async def` = 标记「这个函数里有需要等待的操作」
- `await` = 「等这个操作完成，期间可以先去干别的」

**为什么流式接口要用 async？**

- AI 生成回答是**慢操作**（一个 token 一个 token 吐，要几秒到几十秒）。
- 如果用同步（普通 `def`），处理这个请求的线程会一直卡住等 AI，期间没法接其他用户的请求。
- 用 `async` + `await`，在等 AI 吐下一个 token 时，线程能去服务别的请求，**一台机器能同时撑很多用户**。
- 流式生成器（`async for token in stream`）也是异步的，必须用 async 函数接收。

**最简例子：**

```python
import asyncio

async def say_hello():          # async def 定义异步函数
    await asyncio.sleep(1)      # await 等待，期间可以干别的
    return "你好"

# 异步函数之间互相调用
async def main():
    result = await say_hello()  # await 调用另一个异步函数
    print(result)

asyncio.run(main())             # 启动事件循环跑起来
```

**在本项目中的用途：**

- `chat_stream_generator` 是 `async` 生成器，用 `yield` 一个一个吐 SSE 事件
- 调用成员 B 的 `stream_ollama()`（它也是 async 生成器）时用 `async for`
- 处理用户点「停止」时捕获 `asyncio.CancelledError`

**官方文档（中文）：**

- Python asyncio 标准库（国内镜像）：<https://docs.pythonlang.cn/3/library/asyncio-task.html>
- asyncio 概念性概述：<https://docs.pythonlang.cn/3.14/howto/a-conceptual-overview-of-asyncio.html>

**推荐教程：**

- 廖雪峰「使用 asyncio」（通俗入门）：<https://liaoxuefeng.com/books/python/async-io/asyncio/index.html>
- 掘金「Python 异步编程终极指南」：<https://juejin.cn/post/7474782353464197156>

> 学习重点：**`async def`**、**`await`**、**`async for`（异步遍历生成器）**、**`asyncio.CancelledError`（任务被取消）**。不用深究事件循环原理，会用就行。

---

## 第二部分：任务说明

> 你负责 3 个文件，都在 `backend/app/` 下。下面说清楚每个文件要实现什么。

### 1. db.py — SQLite 数据库模块

**文件路径：** `backend/app/db.py`
**预计代码量：** ~120 行
**交付节点：** Day 1

#### 1.1 设计 2 张表

| 表名 | 用途 |
|---|---|
| `conversations` | 会话（一次完整对话的容器） |
| `messages` | 消息（会话里的每一条 user / assistant 消息） |

**表结构设计：**

```sql
-- 会话表
CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,      -- UUID 字符串，主键
    title       TEXT NOT NULL,         -- 会话标题（取首条消息前 30 字）
    created_at  TEXT NOT NULL,         -- 创建时间（ISO 8601 字符串）
    updated_at  TEXT NOT NULL          -- 最后更新时间
);

-- 消息表
CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,  -- UUID 字符串，主键
    conversation_id TEXT NOT NULL,     -- 所属会话 ID（外键）
    role            TEXT NOT NULL,     -- 角色：'user' 或 'assistant'
    content         TEXT NOT NULL,     -- 消息内容
    created_at      TEXT NOT NULL,     -- 创建时间
    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id) ON DELETE CASCADE  -- 删会话时自动删其消息
);
```

**字段说明：**

- 为什么 `id` 用 `TEXT` 存 UUID？SQLite 没有原生 UUID 类型，用字符串最简单，`uuid.uuid4()` 生成后转字符串。
- 为什么时间用 `TEXT` 存 ISO 字符串？SQLite 没有专门的日期类型，存 ISO 8601 字符串（如 `2026-07-06T10:30:00+00:00`）可读、可排序。
- `ON DELETE CASCADE` 是关键：删一个会话，它名下所有消息自动删掉，不用你手动清。

#### 1.2 写 7 个 CRUD 函数

每个函数的签名和功能：

| # | 函数签名 | 功能说明 | 返回值 |
|---|---|---|---|
| 1 | `create_conversation(title: str \| None = None) -> dict` | 创建一个新会话。`title` 为空时默认 `"New Conversation"`。生成 UUID、记录时间、插入表。 | `{"id", "title", "created_at", "updated_at"}` |
| 2 | `get_conversations() -> list[dict]` | 列出所有会话，按 `updated_at` 降序（最近用的排前面）。 | `[{...}, ...]` |
| 3 | `get_conversation(conversation_id: str) -> dict \| None` | 按 id 查单个会话。不存在返回 `None`。 | `dict` 或 `None` |
| 4 | `delete_conversation(conversation_id: str) -> bool` | 按 id 删会话（消息靠级联自动删）。返回是否删成功。 | `True` / `False` |
| 5 | `add_message(conversation_id: str, role: str, content: str) -> dict` | 往某会话加一条消息，同时更新该会话的 `updated_at`。 | `{"id", "conversation_id", "role", "content", "created_at"}` |
| 6 | `get_messages(conversation_id: str) -> list[dict]` | 取某会话所有消息，按 `created_at` 升序（从早到晚）。 | `[{...}, ...]` |
| 7 | `clear_messages(conversation_id: str) -> bool` | 清空某会话的所有消息（会话本身保留）。 | `True` |

**另外需要 2 个辅助函数（不算在 7 个 CRUD 里）：**

- `get_db() -> sqlite3.Connection` — 获取数据库连接（设好 `row_factory`、WAL 模式、外键开关）
- `init_db()` — 建表（`CREATE TABLE IF NOT EXISTS`），应用启动时调用一次

**编码要点（踩坑提醒）：**

1. **每次操作开连接、用完关掉**：`try ... finally: conn.close()`，避免连接泄漏。
2. **`conn.row_factory = sqlite3.Row`**：让查询结果能用 `row["id"]` 像字典一样取值，否则只能用下标 `row[0]`。
3. **永远用 `?` 占位符传参**：`conn.execute("... WHERE id = ?", (cid,))`，**绝不**字符串拼接（SQL 注入漏洞）。
4. **增删改后要 `conn.commit()`**：查询（SELECT）不用 commit，但 INSERT/UPDATE/DELETE 不 commit 不会真存盘。

完整代码模式见 [第四部分第 1 节](#1-用-sqlite3-连接数据库和执行-sql)。

---

### 2. chat.py — 流式聊天接口

**文件路径：** `backend/app/routers/chat.py`
**预计代码量：** ~80 行（核心流式逻辑，不含工具调用扩展）
**交付节点：** Day 2（先 mock，后接 B 的模型）

#### 2.1 接口

```
POST /api/chat/stream
Content-Type: application/json
请求体：ChatRequest
响应：SSE 流（Content-Type: text/event-stream）
```

#### 2.2 请求体（ChatRequest）

由组长在 `schemas.py` 定义，你直接 import 用：

```python
class ChatRequest(BaseModel):
    message: str                        # 必填：用户这轮说的话
    conversation_id: str | None = None  # 可选：已有会话 id；为空则新建会话
    model: str | None = None            # 可选：指定模型；为空用默认
```

> 注：实际项目还扩展了 `skill`、`enable_memory`、`enable_tools` 字段，那是后加的功能，你做核心版时只关心上面三个。

#### 2.3 处理流程（核心，按顺序写）

```
1. 接收 ChatRequest
2. 如果 conversation_id 为空：
   a. 调 create_conversation(title=message 前30字) 新建会话
   b. 立刻发一个 conversation 事件给前端（让它知道新会话 id）
3. 调 add_message(conv_id, "user", message) 保存用户消息
4. 调 get_messages(conv_id) 加载历史消息
   → 取最近 20 条作为上下文窗口（喂给模型的不能太长）
5. 调用成员 B 的 stream_ollama(model, messages) 拿到 async 生成器
   （Day 2 先 mock：自己写个假生成器吐字，Day 3 再接 B 的真函数）
6. async for token in 生成器：
   a. 累加 token 到 full_response
   b. yield 一个 token 事件 {"type": "token", "content": token}
7. 生成完，调 add_message(conv_id, "assistant", full_response) 保存 AI 回复
8. yield 一个 done 事件 {"type": "done"}
```

#### 2.4 关键：用 `async` 生成器 + `StreamingResponse`

```python
async def chat_stream_generator(request: ChatRequest):
    # ... 上面流程里的 yield ...
    yield sse_event({"type": "token", "content": token})

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        chat_stream_generator(request),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive",
                 "X-Accel-Buffering": "no"},  # 禁用 Nginx 缓冲，保证实时
    )
```

#### 2.5 关键：处理「停止生成」中断

用户点「Stop」时，前端会中断连接，这会触发 `asyncio.CancelledError`。**必须在此时保存已生成的部分回答**，否则用户点 Stop 后那些字就丢了。

```python
try:
    # ... 正常流式生成 ...
except asyncio.CancelledError:
    # 用户中断了，保存已生成的部分
    if conv_id and full_response.strip():
        add_message(conv_id, "assistant", full_response.strip())
    raise   # 重要：捕获后要重新抛出，让上层知道任务已取消
```

**为什么 `raise`？** `CancelledError` 不应该被吞掉，重新抛出让事件循环正确清理资源。这是标准做法。

完整代码模式见 [第四部分第 3-5 节](#3-streamingresponse--async-生成器-sse-核心)。

---

### 3. conversations.py — 会话管理 REST API

**文件路径：** `backend/app/routers/conversations.py`
**预计代码量：** ~60 行
**交付节点：** Day 3

提供 6 个端点，都是对 `db.py` 函数的薄封装：

| # | 方法 | 路径 | 功能 | 请求体 | 返回 |
|---|---|---|---|---|---|
| 1 | GET | `/api/conversations` | 列出所有会话 | — | `[{id, title, created_at, updated_at}]` |
| 2 | POST | `/api/conversations` | 新建会话 | `{title?}` | `{id, title, created_at, updated_at}` |
| 3 | GET | `/api/conversations/{id}` | 获取单个会话 | — | `{id, title, ...}` 或 404 |
| 4 | DELETE | `/api/conversations/{id}` | 删除会话（消息级联删） | — | `{"ok": true}` 或 404 |
| 5 | GET | `/api/conversations/{id}/messages` | 获取会话所有消息 | — | `[{id, role, content, created_at}]` 或 404 |
| 6 | DELETE | `/api/conversations/{id}/messages` | 清空会话消息（会话保留） | — | `{"ok": true}` 或 404 |

**编码要点：**

- 用 `APIRouter(prefix="/api/conversations", tags=["conversations"])` 路由分组
- 路径参数用 `{conversation_id}`，函数参数 `conversation_id: str` 自动接收
- **查不到就返回 404**：`raise HTTPException(status_code=404, detail="Conversation not found")`
- POST 的请求体用 Pydantic 模型接收（`CreateConversationRequest`，`title` 可选）

完整代码模式见 [第四部分第 2 节](#2-写-fastapi-路由)。

---

## 第三部分：接口协议

> 这部分是你和前端（成员 C）、组长之间约定的「契约」。**接口格式必须和这里完全一致**，否则前端调不通。

### 3.1 SSE 事件格式

聊天接口返回的是 SSE 流，每个事件是一行 `data: {JSON}\n\n`。共 4 种事件类型：

| 事件 type | 触发时机 | 数据示例 | 前端处理 |
|---|---|---|---|
| `conversation` | 新建会话时（仅新会话发一次） | `{"type": "conversation", "conversation_id": "abc-123", "title": "你好"}` | 记下新会话 id，刷新侧边栏 |
| `token` | AI 每生成一个字 | `{"type": "token", "content": "你"}` | 把 content 追加到当前 AI 消息 |
| `done` | AI 生成完成 | `{"type": "done"}` | 结束流式状态，标记消息完成 |
| `error` | 出错（模型连接失败等） | `{"type": "error", "message": "模型连接失败"}` | 显示错误，结束流式 |

**实际传输长这样（一整条流）：**

```
data: {"type": "conversation", "conversation_id": "a1b2", "title": "你好"}\n\n
data: {"type": "token", "content": "你"}\n\n
data: {"type": "token", "content": "好"}\n\n
data: {"type": "token", "content": "！"}\n\n
data: {"type": "done"}\n\n
```

**格式化函数（你直接抄进 chat.py）：**

```python
import json
def sse_event(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
```

> `ensure_ascii=False` 让中文不被转成 `\uXXXX`，便于调试时看清。

### 3.2 ChatRequest 请求体格式

```json
{
  "message": "你好",
  "conversation_id": "a1b2c3d4-...",   // 可选，新会话不传
  "model": "ollama:qwen2.5:1.5b"        // 可选，不传用默认模型
}
```

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `message` | string | | 用户输入 |
| `conversation_id` | string | | 已有会话 id；不传则新建会话 |
| `model` | string | | 模型标识；不传用默认 |

### 3.3 API 路径表

| 方法 | 路径 | 请求体 | 返回 | 负责人 |
|---|---|---|---|---|
| GET | `/api/health` | — | `{"status": "ok"}` | 组长 |
| GET | `/api/models` | — | `[{id, name, provider, local}]` | B |
| **POST** | **`/api/chat/stream`** | `ChatRequest` | **SSE 流** | **A（你）** |
| **GET** | **`/api/conversations`** | — | `[{id, title, created_at, updated_at}]` | **A** |
| **POST** | **`/api/conversations`** | `{title?}` | `{id, title, ...}` | **A** |
| **GET** | **`/api/conversations/{id}`** | — | `{id, title, ...}` | **A** |
| **DELETE** | **`/api/conversations/{id}`** | — | `{"ok": true}` | **A** |
| **GET** | **`/api/conversations/{id}/messages`** | — | `[{id, role, content, created_at}]` | **A** |
| **DELETE** | **`/api/conversations/{id}/messages`** | — | `{"ok": true}` | **A** |

> 加粗的是你负责的。注意所有会话相关路径前缀都是 `/api/conversations`，聊天是 `/api/chat/stream`。

### 3.4 数据库表结构（同第二部分，汇总在此方便对照）

```sql
CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role            TEXT NOT NULL,        -- 'user' / 'assistant'
    content         TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    FOREIGN KEY (conversation_id)
        REFERENCES conversations(id) ON DELETE CASCADE
);
```

---

## 第四部分：代码示例

> 这些是**能跑的模式参考**（不是完整实现，但复制改改就能用）。直接照着写，少走弯路。

### 1. 用 sqlite3 连接数据库和执行 SQL

```python
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "data" / "chatbot.sqlite3"

def get_db() -> sqlite3.Connection:
    """获取一个数据库连接。每次调用返回新连接，用完要 close。"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)  # data/ 目录不存在就建
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row   # 关键：结果能用 row["id"] 取值
    conn.execute("PRAGMA journal_mode=WAL")       # WAL 模式，读写不互锁
    conn.execute("PRAGMA foreign_keys=ON")        # 开启外键（级联删除才生效）
    return conn

def now() -> str:
    """当前 UTC 时间，ISO 8601 字符串。"""
    return datetime.now(timezone.utc).isoformat()

def new_id() -> str:
    """生成一个 UUID 字符串做主键。"""
    return str(uuid.uuid4())

def init_db():
    """建表。应用启动时调一次。"""
    conn = get_db()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    );
    """)
    conn.commit()
    conn.close()

# —— CRUD 函数模板 ——
def create_conversation(title: str | None = None) -> dict:
    if title is None:
        title = "New Conversation"
    conn = get_db()
    try:
        cid = new_id()
        ts = now()
        # 用 ? 占位符，绝不字符串拼接（防 SQL 注入）
        conn.execute(
            "INSERT INTO conversations (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (cid, title, ts, ts),
        )
        conn.commit()  # 增删改必须 commit
        return {"id": cid, "title": title, "created_at": ts, "updated_at": ts}
    finally:
        conn.close()   # 无论成功失败都关连接

def get_conversation(conversation_id: str) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, title, created_at, updated_at FROM conversations WHERE id = ?",
            (conversation_id,),   # 注意：单元素元组要带逗号
        ).fetchone()
        return dict(row) if row else None   # sqlite3.Row → dict
    finally:
        conn.close()

def add_message(conversation_id: str, role: str, content: str) -> dict:
    conn = get_db()
    try:
        mid, ts = new_id(), now()
        conn.execute(
            "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
            (mid, conversation_id, role, content, ts),
        )
        # 同时更新会话的 updated_at
        conn.execute(
            "UPDATE conversations SET updated_at = ? WHERE id = ?",
            (ts, conversation_id),
        )
        conn.commit()
        return {"id": mid, "conversation_id": conversation_id,
                "role": role, "content": content, "created_at": ts}
    finally:
        conn.close()
```

**自检（可独立运行验证 db.py 写对了）：**

```python
if __name__ == "__main__":
    init_db()
    c = create_conversation("测试会话")
    print("创建会话:", c)
    print("查询会话:", get_conversation(c["id"]))
    m = add_message(c["id"], "user", "你好")
    print("添加消息:", m)
    # 删会话，验证消息级联删除
    # delete_conversation(c["id"])
```

---

### 2. 写 FastAPI 路由

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db import (
    create_conversation, get_conversations, get_conversation,
    delete_conversation, get_messages, clear_messages,
)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

# POST 请求体用 Pydantic 模型定义
class CreateConversationRequest(BaseModel):
    title: str | None = None   # 可选

@router.get("")                       # GET /api/conversations
async def list_conversations():
    return get_conversations()        # 直接返回 list[dict]，FastAPI 自动转 JSON

@router.post("")                      # POST /api/conversations
async def create_conv(body: CreateConversationRequest):
    return create_conversation(title=body.title)

@router.get("/{conversation_id}")     # GET /api/conversations/{id}
async def get_conv(conversation_id: str):     # 路径参数自动注入
    conv = get_conversation(conversation_id)
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.delete("/{conversation_id}")  # DELETE /api/conversations/{id}
async def delete_conv(conversation_id: str):
    if not delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True}
```

**要点：**

- `APIRouter(prefix=...)` 给所有路由加统一前缀，省得每个都写 `/api/conversations`
- `@router.get("")` 注意是空字符串（因为前缀已经是完整路径）
- 路径参数 `/{conversation_id}` 会自动传给同名函数参数
- 查不到 → `raise HTTPException(404, ...)`，FastAPI 自动返回标准 404 JSON

---

### 3. StreamingResponse + async 生成器（SSE 核心）

```python
import asyncio
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas import ChatRequest
from app.db import create_conversation, add_message, get_messages

router = APIRouter(prefix="/api/chat", tags=["chat"])

def sse_event(data: dict) -> str:
    """把 dict 格式化成一条 SSE 事件字符串。"""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

async def chat_stream_generator(request: ChatRequest):
    """核心：async 生成器，yield 出每一条 SSE 事件。"""
    conv_id = request.conversation_id
    full_response = ""    # 累积 AI 的完整回答，用于最后存盘

    try:
        # 1. 新会话：创建并发 conversation 事件
        if not conv_id:
            conv = create_conversation(title=request.message[:30])
            conv_id = conv["id"]
            yield sse_event({
                "type": "conversation",
                "conversation_id": conv_id,
                "title": conv["title"],
            })

        # 2. 保存用户消息
        add_message(conv_id, "user", request.message)

        # 3. 加载历史（最近 20 条做上下文窗口）
        history = get_messages(conv_id)
        context = history[-20:]   # 取最后 20 条

        # 4. 调 B 的流式函数（这里先 mock，Day 3 换成真函数）
        # 真函数：async for token in stream_ollama(model, messages):
        async def mock_stream():
            for ch in "你好！我是本地 AI 助手。":
                await asyncio.sleep(0.1)   # 模拟生成延迟
                yield ch

        # 5. 流式吐 token
        async for token in mock_stream():
            full_response += token
            yield sse_event({"type": "token", "content": token})

        # 6. 保存 AI 回复
        if full_response.strip():
            add_message(conv_id, "assistant", full_response.strip())

        # 7. 完成
        yield sse_event({"type": "done"})

    except asyncio.CancelledError:
        # 用户点了 Stop：保存已生成的部分，然后重新抛出
        if conv_id and full_response.strip():
            add_message(conv_id, "assistant", full_response.strip())
        raise   # 必须重新抛出
    except Exception as e:
        # 其他错误：保存部分 + 发 error 事件
        if conv_id and full_response.strip():
            add_message(conv_id, "assistant", full_response.strip())
        yield sse_event({"type": "error", "message": f"模型错误: {e}"})

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    return StreamingResponse(
        chat_stream_generator(request),
        media_type="text/event-stream",          # SSE 的 MIME 类型
        headers={
            "Cache-Control": "no-cache",        # 禁缓存
            "Connection": "keep-alive",         # 长连接
            "X-Accel-Buffering": "no",          # 禁 Nginx 缓冲（部署时关键）
        },
    )
```

**要点：**

- 生成器是 `async def` + `yield`，叫「异步生成器」，`yield` 出去的每个字符串就是一段 SSE 数据
- `StreamingResponse` 接收这个生成器，把 yield 的内容**立即**推给前端（不等全部生成）
- 三个 header 是生产环境标配，特别是 `X-Accel-Buffering: no`，否则 Nginx 会攒一批再发，流式就变卡顿了

---

### 4. 怎么格式化 SSE 事件

就一行函数（上面已给出）：

```python
import json

def sse_event(data: dict) -> str:
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"

# 测试
print(sse_event({"type": "token", "content": "你"}))
# 输出: data: {"type": "token", "content": "你"}\n\n
```

**格式三要素（缺一不可）：**

1. `data:` 前缀
2. JSON 字符串内容
3. `\n\n` 结尾（两个换行，分隔事件）

`ensure_ascii=False` 让中文字符原样输出（否则变成 `\u4f60`，调试时看不清）。

---

### 5. 怎么处理 asyncio.CancelledError

```python
import asyncio

async def stream_task():
    full = ""
    try:
        async for token in some_async_generator():
            full += token
            yield token        # 假设这是生成器
        yield "DONE"
    except asyncio.CancelledError:
        # 用户中断了连接 / 调用了 task.cancel()
        # 这里做清理：保存部分结果、释放资源
        print(f"被中断了，已生成 {len(full)} 字，保存它")
        save_partial(full)
        raise                  # ← 关键：重新抛出，别吞掉
```

**核心三条：**

1. `asyncio.CancelledError` 在「生成器被外部取消」时抛出（前端断开连接 = Uvicorn 取消生成器任务）
2. 在 `except` 里做**收尾**：保存已生成的部分回答（否则用户点 Stop，那半个回答就丢了）
3. **`raise` 重新抛出**：`CancelledError` 不该被静默吞掉，要让事件循环知道任务已取消、正确回收资源

> 注意：`except asyncio.CancelledError` 要写在 `except Exception` **前面**或单独处理，因为 CancelledError 在 Python 3.8+ 继承自 BaseException（不是 Exception），`except Exception` 抓不到它。

---

## 第五部分：协作说明

### 5.1 你依赖谁

| 依赖对象 | 依赖内容 | 卡点说明 |
|---|---|---|
| **组长** | 接口协议（SSE 事件格式、API 路径表、`ChatRequest` 定义） | Day 1 组长发协议文档后才能动手写 chat.py。**先看 [第三部分](#第三部分接口协议) 就是协议**。`schemas.py`（`ChatRequest`、`SSEEvent`）组长已写好，你 import 即可。 |
| **成员 B** | `stream_ollama(model, messages)` 函数签名 | 你在 chat.py 里要调用 B 的这个 async 生成器。**Day 2 先用 mock 生成器占位**（见第四部分第 3 节的 `mock_stream`），Day 3 B 的 `llm.py` 好了再换成真函数。 |

**约定的 B 的函数签名（你按这个调）：**

```python
# B 提供，在 app/llm.py
async def stream_ollama(model: str, messages: list[dict]) -> AsyncGenerator[str, None]:
    """流式吐 token，每个 yield 是一个字符串 token。"""
    ...

def build_messages(system_prompt: str, history: list[dict], user_message: str) -> list[dict]:
    """组装喂给模型的消息列表（含上下文窗口）。"""
    ...
```

你调用时：

```python
from app.llm import stream_ollama, build_messages
messages = build_messages(system_prompt, history[-20:], request.message)
async for token in stream_ollama(model, messages):
    ...
```

### 5.2 谁依赖你

| 被依赖对象 | 依赖内容 | 你的责任 |
|---|---|---|
| **成员 C（前端）** | chat.py 的 SSE 事件格式、API 路径、请求体格式 | **必须和 [第三部分](#第三部分接口协议) 协议完全一致**。C 按这个写 SSE 消费者（fetch + ReadableStream），格式对不上就联调不通。改任何接口前先在群里说。 |
| **成员 C（前端）** | conversations.py 的 6 个端点返回格式 | 返回的 JSON 字段名要和协议表一致（`id`、`title`、`created_at` 等）。 |
| **组长** | 联调 | 你的代码合并到 main 后组长做整体联调。 |

### 5.3 交叉文件

**无。** 你负责的 3 个文件（`db.py`、`chat.py`、`conversations.py`）相互独立，不和别人共写同一个文件。

- `db.py`：你独立写，`chat.py` 和 `conversations.py` 都 import 它的函数。
- `chat.py`：你写，import 组长的 `schemas.py`（`ChatRequest`）和 B 的 `llm.py`（`stream_ollama`）。
- `conversations.py`：你写，只 import 自己的 `db.py`。

> 注意：`chat.py` 里 import 的 `app.schemas.ChatRequest` 和 `app.llm.stream_ollama` 是别人的文件，**你只读不改**。如果签名对不上，找对应的人协调，别擅自改别人的文件。

### 5.4 交付节奏

| 时间 | 交付 | 验收标准 |
|---|---|---|
| Day 1 | `db.py` 完成 | 建表 + 7 个 CRUD 函数能跑，`python -m app.db` 自检通过 |
| Day 2 | `chat.py` 流式骨架（mock） | POST `/api/chat/stream` 能返回 SSE 流，前端能看到逐字输出 |
| Day 3 | `conversations.py` + 接 B 的真函数 | 6 个端点通，Stop 中断能保存部分回答，全流程联调 |

### 5.5 常见问题找谁

| 问题 | 找谁 |
|---|---|
| 接口格式对不上 / 要改协议 | 组长（在群里说） |
| `stream_ollama()` 报错 / 签名变了 | 成员 B |
| 前端调你的接口 404 / 格式不对 | 先自查协议，再找 C 对 |
| `ChatRequest` 字段要加 | 组长（`schemas.py` 是他的） |

---

## 附录：快速上手清单

**装好环境（Day 1 早上做完）：**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn pydantic pydantic-settings
# Ollama SDK 等 B 那边装，你做核心版不需要
```

**先跑通最小 FastAPI（确认环境 OK）：**

```python
# test_min.py
from fastapi import FastAPI
app = FastAPI()

@app.get("/")
def root():
    return {"hello": "world"}
```

```bash
uvicorn test_min:app --reload --port 8000
# 浏览器开 http://localhost:8000/docs 看到 API 文档 = 环境通了
```

**开发顺序建议：**

1. 先写 `db.py`，用 `__main__` 自检（不用起服务器）
2. 再写 `conversations.py`，用 `/docs` 页面点按钮测 6 个端点
3. 最后写 `chat.py`，先 mock 流式，跑通后再接 B 的 `stream_ollama`

**调试技巧：**

- FastAPI 自动文档 `/docs`（Swagger）是你最好的朋友，所有接口都能在网页上点按钮测
- SSE 流可以用 `curl -N http://localhost:8000/api/chat/stream -X POST -H "Content-Type: application/json" -d '{"message":"你好"}'` 看原始输出
- 数据库用 `sqlite3 data/chatbot.sqlite3` 命令行进去 `.tables` 看表、`SELECT * FROM conversations;` 看数据

---

> **学习优先级**（时间紧的话按这个顺序看）：
>
> 1. FastAPI 官方教程的「第一个 API」+「请求体」两节（30 分钟）
> 2. sqlite3 增删改查（30 分钟，看脚本之家那篇）
> 3. SSE 格式 + StreamingResponse（看道满那篇的 SSE 部分）
> 4. async/await 基本语法（看廖雪峰那篇前半段）
>
> 其他的用到再查，别一上来通读所有文档，边写边学效率最高。祝你写代码顺利！
