# 项目简介

## 项目介绍

正如字面意思所说，这是一个基于本地大模型的AI聊天软件，主要分为两个部分：

- 大模型的下载与部署，这部分要封装暴露接口给前端
- AI的聊天软件，也就是前端部分，主要包括UI的设计和视觉效果，例如markdown，数学公式实时渲染还有会话管理等。

## 如何合作？

我们主要使用git来进行版本管理和合作。

每一个人一个分支，代码审批后在dev分支上合并，测试通过后合并到main分支上

首先我们要了解什么是git，简而言之，git是一个版本控制系统，通俗来讲，就是能让你给项目拍照，而且能看到各个照片之间区别，一旦你发现一个版本问题过多，就可以回退到上一个版本。而且可以创建分支，每个成员可以在自己的分支上开发，互不影响，最后再审批合并各个分支。

下面是git的教程：[git教程](https://liaoxuefeng.com/books/git/introduction/index.html),在熟悉了命令行之后可以用vscode的git功能，图形化的界面更加友好。

还有就是建议学一下markdown文档格式：[markdown教程](https://markdown.com.cn/)

## 技术栈

### 前端技术栈

| 技术                   | 用途               | 为什么选它                                       |
| ---------------------- | ------------------ | ------------------------------------------------ |
| Electron               | 桌面应用框架       | 让 React 网页变成桌面软件，跨平台，可打包安装包  |
| React 18               | UI 框架            | 组件化开发，生态成熟                             |
| Vite 6                 | 渲染进程开发服务器 | 启动快，热更新，为 Electron 渲染进程提供开发服务 |
| TypeScript             | 类型检查           | 编译时发现错误，有类型提示                       |
| Tailwind CSS 3         | 样式               | 直接写 className，不用写 CSS 文件                |
| Zustand 4              | 状态管理           | 比 Redux 简单，一个函数创建一个 store            |
| react-markdown         | Markdown 渲染      | AI 回答含代码、表格、列表                        |
| remark-gfm             | GFM 语法支持       | 表格、任务列表、删除线                           |
| rehype-highlight       | 代码高亮           | 代码块语法着色                                   |
| highlight.js           | 高亮主题           | github-dark 深色主题                             |
| Fetch + ReadableStream | SSE 消费           | POST 请求流式读取，支持 AbortController 停止     |

### 后端技术栈

| 技术              | 用途         | 为什么选它                             |
| ----------------- | ------------ | -------------------------------------- |
| Python 3          | 编程语言     | 生态丰富，AI/ML 首选                   |
| FastAPI           | Web 框架     | 异步支持好，自动文档，Pydantic 校验    |
| Uvicorn           | ASGI 服务器  | 运行 FastAPI，支持热重载               |
| Pydantic          | 数据校验     | 请求体自动校验，定义接口模型           |
| pydantic-settings | 配置管理     | 从 .env 读取配置                       |
| sqlite3           | 数据库       | 标准库自带，不用装数据库，文件存储     |
| Ollama SDK        | 本地模型推理 | 异步流式调用，支持模型列表             |
| SSE               | 流式传输     | HTTP 原生，比 WebSocket 简单，单向推送 |

### 前后端通信

| 环节     | 技术       | 说明                                                                 |
| -------- | ---------- | -------------------------------------------------------------------- |
| 开发时   | 直连       | Electron 渲染进程直接 fetch http://localhost:8000，不需要 Vite proxy |
| 生产时   | 直连       | Electron 渲染进程有完整网络访问能力，直接调用后端 API                |
| 流式传输 | SSE        | `data: {json}\n\n` 格式，逐 token 推送                               |
| 请求格式 | JSON       | POST body 用 JSON，Pydantic 校验                                     |
| 响应格式 | JSON / SSE | 普通 API 返回 JSON，聊天返回 SSE 流                                  |

### 分工总览

| 成员   | 角色               | 核心职责                                                |
| ------ | ------------------ | ------------------------------------------------------- |
| 组长   | 架构 + 集成 + 文档 | 项目骨架、接口协议定义、前后端联调、代码审查、文档撰写  |
| 成员 A | 后端核心           | FastAPI 框架、SQLite 数据库、聊天流式接口、会话管理 API |
| 成员 B | 后端模型           | Ollama 模型接入、流式推理、模型列表、系统 prompt 组装   |
| 成员 C | 前端核心           | 整体布局、SSE 流式、状态管理、聊天交互                  |
| 成员 D | 前端功能           | Markdown 渲染、会话列表、模型选择器、UI 打磨            |

### 成员 A — 后端核心（聊天 + 数据库）（分支: backend-a）

#### 职责

- FastAPI 后端框架搭建
- SQLite 数据库设计与实现（原始 SQL，无 ORM）
- 聊天流式接口核心逻辑
- 会话管理 API（增删改查）
- 消息持久化、历史加载、上下文窗口

#### 负责文件

| 文件                                   | 说明                               | 行数 |
| -------------------------------------- | ---------------------------------- | ---- |
| `backend/app/db.py`                    | SQLite 数据库连接、建表、CRUD 函数 | ~120 |
| `backend/app/routers/chat.py`          | POST /api/chat/stream 流式聊天接口 | ~80  |
| `backend/app/routers/conversations.py` | 会话 CRUD（6 个端点）              | ~60  |

#### 具体任务

1. **db.py** — 设计 2 张表，写 CRUD 函数：
	- `create_conversation(title)` — 创建会话
	- `get_conversations()` — 列出所有会话
	- `get_conversation(id)` — 获取单个会话
	- `delete_conversation(id)` — 删除会话
	- `add_message(conv_id, role, content)` — 添加消息
	- `get_messages(conv_id)` — 获取会话所有消息
	- `clear_messages(conv_id)` — 清空会话消息

2. **chat.py** — 流式聊天接口：
	- 创建/获取会话
	- 保存用户消息
	- 加载历史消息（上下文窗口：最近 20 条）
	- 调用 B 的模型流式函数
	- 保存 AI 回复
	- 处理 Stop 中断时的部分保存
	- 新会话时发送 conversation SSE 事件

3. **conversations.py** — 会话管理 REST API：
	- `GET /api/conversations` — 列出会话
	- `POST /api/conversations` — 新建会话
	- `GET /api/conversations/{id}` — 获取会话
	- `DELETE /api/conversations/{id}` — 删除会话
	- `GET /api/conversations/{id}/messages` — 获取消息
	- `DELETE /api/conversations/{id}/messages` — 清空消息

  

#### 与其他人的协作

| 依赖      | 说明                                            |
| --------- | ----------------------------------------------- |
| 等组长    | 接口协议（SSE 格式、API 路径）                  |
| 等 B      | `stream_ollama()` 函数签名，A 在 chat.py 里调用 |
| 被 C 依赖 | API 路径和返回格式要和协议一致                  |

---

### 成员 B — 后端模型（Ollama 接入）(分支: backend-b)

#### 职责

- Ollama 本地模型接入（流式推理、模型列表）
- 系统 prompt 组装
- 消息列表构建（上下文窗口）
- 模型列表 API

#### 负责文件

| 文件                            | 说明                          | 行数 |
| ------------------------------- | ----------------------------- | ---- |
| `backend/app/llm.py`            | Ollama 流式推理 + prompt 组装 | ~70  |
| `backend/app/routers/models.py` | 模型列表 API                  | ~20  |

#### 具体任务

  
1. **llm.py** — LLM Provider（纯函数）：
	- `list_ollama_models()` — 列出 Ollama 可用模型
	- `stream_ollama(model, messages)` — Ollama 流式推理，async generator
	- `build_system_prompt(base)` — 组装系统 prompt
	- `build_messages(system_prompt, history, user_message)` — 组装消息列表（最近 20 条历史）

2. **models.py** — 模型列表 API：
	- `GET /api/models` — 返回 `[{id, name, provider, local}]`
	- Ollama 未运行时返回默认模型

#### 与其他人的协作

| 依赖      | 说明                                                      |
| --------- | --------------------------------------------------------- |
| 等组长    | 接口协议                                                  |
| 被 A 依赖 | A 在 chat.py 调用 `stream_ollama()` 和 `build_messages()` |
| 被 D 依赖 | /api/models 返回格式要和协议一致                          |

---

### 成员 C — 前端核心（布局 + 聊天 + 状态管理）(分支: frontend-a)

#### 职责

- React 项目搭建（Vite + TypeScript + Tailwind）
- 整体布局（侧边栏 + 聊天区 + 输入框 + 顶栏）
- SSE 流式消费者（fetch + ReadableStream，最关键的前端代码）
- Zustand 状态管理（聊天状态、会话状态）
- 聊天消息渲染、输入框交互
- 会话切换、历史加载

#### 负责文件

| 文件                                       | 说明                                 | 行数 |
| ------------------------------------------ | ------------------------------------ | ---- |
| `frontend/src/App.tsx`                     | 主布局，组件组装                     | ~150 |
| `frontend/src/hooks/useStreamChat.ts`      | SSE 消费者（fetch + ReadableStream） | ~100 |
| `frontend/src/stores/chatStore.ts`         | 聊天状态（消息列表、流式状态）       | ~80  |
| `frontend/src/stores/conversationStore.ts` | 会话状态（列表、当前选中）           | ~80  |
| `frontend/src/stores/settingsStore.ts`     | 设置状态（当前模型）                 | ~15  |
| `frontend/src/components/ChatMessage.tsx`  | 消息气泡（用户/AI 区分）             | ~50  |
| `frontend/src/components/ChatInput.tsx`    | 输入框（自动增高、发送/停止/清屏）   | ~90  |
| `frontend/src/components/Sidebar.tsx`      | 侧边栏（会话列表）                   | ~70  |
| `frontend/src/types/index.ts`              | TypeScript 类型定义                  | ~20  |

#### 具体任务

1. **App.tsx** — 主布局：
	- 左侧侧边栏 + 右侧聊天区
	- 顶栏：标题 + 连接状态 + 留位置给 D 的模型选择器
	- 聊天区：消息列表 + 空状态
	- 底部：输入框

2. **useStreamChat.ts** — SSE 消费者（最关键）：
	- 用 fetch POST（不是 EventSource）
	- ReadableStream reader 读取响应体
	- 按 `\n\n` 分割 SSE 事件
	- 解析 `data: {json}` 行
	- 处理 token/done/error/conversation 事件
	- AbortController 支持停止生成

3. **chatStore.ts** — 聊天状态：
	- `addUserMessage(content)` — 添加用户消息
	- `addAssistantMessage()` — 添加空 AI 消息（开始流式）
	- `appendToLastMessage(token)` — 追加 token
	- `finishLastMessage()` — 结束流式
	- `clearMessages()` — 清屏
	- `loadMessages(msgs)` — 加载历史消息

4. **conversationStore.ts** — 会话状态：
	- `fetchConversations()` — 拉取会话列表
	- `createConversation()` — 新建会话
	- `selectConversation(id)` — 切换会话（加载历史消息）
	- `deleteConversation(id)` — 删除会话

5. **ChatInput.tsx** — 输入框：
	- textarea 自动增高
	- Enter 发送，Shift+Enter 换行
	- 发送/停止/清屏按钮状态切换

#### 与其他人的协作

| 依赖      | 说明                                  |
| --------- | ------------------------------------- |
| 等组长    | 接口协议（SSE 事件格式、API 路径）    |
| 不等后端  | 用 mock 数据先写 UI 和 SSE 消费者     |
| 被 D 依赖 | App.tsx 留好顶栏位置给 D 的模型选择器 |
| 被 D 依赖 | chatStore 接口定好后通知 D            |
  
---

### 成员 D — 前端功能（Markdown + 模型选择 + UI 打磨）(分支: frontend-b)

#### 职责

- Markdown 渲染（react-markdown + 代码高亮 + 代码块复制
- 模型选择器下拉组件
- 复制按钮组件
- 全局样式与主题配色
- UI 视觉打磨（空状态、加载动画、焦点效果、快捷键）
  
#### 负责文件

| 文件                                           | 说明                                  | 行数 |
| ---------------------------------------------- | ------------------------------------- | ---- |
| `frontend/src/components/MarkdownRenderer.tsx` | Markdown 渲染 + 代码高亮 + 代码块复制 | ~116 |
| `frontend/src/components/ModelSelector.tsx`    | 模型下拉选择器                        | ~90  |
| `frontend/src/components/CopyButton.tsx`       | 复制到剪贴板按钮                      | ~26  |
| `frontend/src/styles/globals.css`              | 全局样式 + 滚动条 + highlight.js 主题 | ~26  |
| `frontend/tailwind.config.ts`                  | 深色主题配色                          | ~37  |

#### 具体任务

1. **MarkdownRenderer.tsx**：
	- 安装 react-markdown + remark-gfm + rehype-highlight + highlight.js
	- 代码块：深色背景 + 复制按钮（useRef + textContent）
	- 行内代码：蓝色高亮
	- 表格：边框 + 横向滚动
	- 链接：新窗口打开

2. **ModelSelector.tsx**：
	- GET /api/models 获取模型列表
	- 下拉选择器，本地模型显示绿点
	- Ollama 未运行时显示提示
	- 点击外部关闭下拉
	- 加载后自动选中第一个模型

3. **CopyButton.tsx**：
	- 复制到剪贴板，显示 "Copied!" 2 秒
	- clipboard 失败静默处理

4. **UI 打磨**：
	- 深色主题配色（bg-primary #0B1020 等）
	- 空状态图标 + 欢迎文案
	- 输入框焦点光晕
	- 自定义滚动条

#### 与其他人的协作

| 依赖       | 说明                                             |
| ---------- | ------------------------------------------------ |
| 等 C       | App.tsx 布局留好位置后才能塞模型选择器           |
| 等 B       | /api/models 返回格式                             |
| 不等任何人 | MarkdownRenderer、CopyButton、主题配色可独立先做 |
