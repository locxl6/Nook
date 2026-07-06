# 成员 C

---

## 第一部分：技术简介和通俗解释

### 1. Electron

**一句话解释**：Electron 是一个把网页变成桌面软件的框架——你用 React 写界面，Electron 给你套一个壳子（里面装着 Chromium 浏览器引擎 + Node.js），让它变成一个可以双击打开、有窗口、有图标的应用程序。

**通俗比喻**：想象你写了一个网页。正常情况你要开浏览器、输网址才能看。Electron 相当于给你造了一个「定制浏览器」，只显示你的网页，没有地址栏、没有标签页，看起来就像一个原生软件。用户双击图标就能打开，不用装浏览器、不用开网址。

**主进程 vs 渲染进程（核心概念）**：

- **主进程**（`electron/main.ts`）：Node.js 环境，负责创建窗口、管理应用生命周期。像房子的框架结构——承重墙、大门、窗户框架。
- **渲染进程**（`frontend/src/`）：Chromium 环境，运行你的 React 代码。像房子里的房间——用户看到和使用的一切都在这里。
- 你写的大部分代码在渲染进程里，和普通网页开发一模一样。主进程只需要写很少的代码（创建窗口、加载页面）。

**在本项目中的用途**：把 React 前端打包成桌面应用。主进程创建一个 BrowserWindow，开发时加载 Vite dev server（<http://localhost:5173），生产环境加载打包后的静态> HTML 文件。

**官方文档**：

- Electron 官方中文文档：<https://www.electronjs.org/zh/docs/latest/>
- Electron API 中文：<https://www.electronjs.org/zh/docs/latest/api>

**推荐中文教程**：

- Electron 进程模型（官方教程）：<https://electronjs.org/zh/docs/latest/tutorial/process-model>
- Electron 中文网（文档镜像）：<https://electron.nodejs.cn/docs/latest/>
- B 站搜索「Electron 教程」，推荐看「Electron 从入门到实战」系列。

---

### 2. electron-vite

**一句话解释**：electron-vite 是一个把 Electron + Vite + React 整合到一起的构建工具，帮你处理主进程、渲染进程、preload 脚本的编译和启动。

**通俗比喻**：如果 Electron 是「定制浏览器壳子」，Vite 是「开发时的热更新服务器」，那 electron-vite 就是「组装流水线」——它帮你把壳子和服务器拼好，你只管写代码，不用操心怎么把它们连起来。

**为什么用它**：手动配置 Electron + Vite 很麻烦——要配主进程编译、渲染进程编译、preload 编译、开发时热更新、生产打包。electron-vite 一条命令全搞定：`electron-vite dev` 启动开发，`electron-vite build` 打包。

**在本项目中的用途**：项目搭建、开发启动、生产打包都通过 electron-vite。

**官方文档**：

- electron-vite 中文文档：<https://cn.electron-vite.org/>

**推荐中文教程**：

- electron-vite 官方指南（含中文）：<https://cn.electron-vite.org/guide/>

---

### 3. React 18

**一句话解释**：React 是一个用「组件拼页面」的库，你把界面拆成一个个小组件（按钮、消息气泡、输入框），它们各自管理自己的状态，组合起来就是完整页面。

**通俗比喻**：想象你在搭乐高。传统写网页像用一块整塑料刻出一个房子，改一处就得重刻；React 像用一堆乐高积木拼，一个「消息气泡积木」可以复用一百次，哪块坏了换哪块。组件就是积木，`props` 是积木之间传递的接口，`state` 是积木自己肚子里的状态。

**Hooks 是什么**：Hooks 是 React 18 的核心写法，让你在函数组件里「钩入」React 的能力。常用三个：

- `useState` — 让组件记住一个会变的值（比如输入框的文字）。
- `useEffect` — 让组件在「挂载到页面 / 某个值变化 / 卸载」时执行副作用（比如发请求、加事件监听）。
- `useRef` — 让组件记住一个**不触发重新渲染**的值，常用来直接操作 DOM（比如让一个 `<div>` 滚动到底）。

> 函数组件 + Hooks 是现在的主流写法，本项目**不用** class 组件，全部是函数组件。

**在本项目中的具体用途**：整个前端就是一个 React 应用。`App.tsx` 是根组件，里面组合了 `Sidebar` / `ChatMessage` / `ChatInput` 等子组件。每个组件用 Hooks 管理自己的状态和副作用。

**官方文档（中文）**：

- React 官方中文文档：<https://zh-hans.react.dev/>
- 快速入门：<https://zh-hans.react.dev/learn>
- `useRef` 参考：<https://zh-hans.react.dev/reference/react/useRef>
- `useEffect` 参考：<https://zh-hans.react.dev/reference/react/useEffect>
- React v18.0 发布说明：<https://zh-hans.react.dev/blog/2022/03/29/react-v18>

**推荐中文教程**：

- React 中文文档 GitHub 仓库（实时同步官方）：<https://github.com/reactjs/zh-hans.react.dev>
- 现代前端框架 React 教程（zh.javascript.info，配套练习）：<https://zh.javascript.info/react>
- 在 B 站搜索「React 18 教程」，推荐看「尚硅谷 React 全家桶」或「技术胖 React」系列，跟着敲一遍 Hooks 部分。

---

### 4. Vite 6

**一句话解释**：Vite 是前端构建工具，负责把你的 React + TypeScript 代码跑起来（开发服务器）、热更新（改代码自动刷新）、打包成静态文件。在 Electron 项目里，Vite 为渲染进程提供开发服务。

**为什么不用 Create React App（CRA）**：CRA 已经停止维护（2023 年起），React 官方文档也不再推荐它，现在的新项目都用 Vite。Vite 比 CRA 快得多：CRA 用 Webpack 打包整个项目再启动，项目一大要等几十秒；Vite 用原生 ES Module，按需编译，启动几乎瞬间完成，热更新只更新改动的文件。

**在 Electron 项目中的角色**：本项目用 Electron + Vite + React。Electron 主进程创建窗口，开发时加载 Vite dev server（`http://localhost:5173`），生产环境加载打包后的静态文件。你写的 React 代码运行在 Electron 渲染进程里，和普通网页开发一样。Vite 在这里只为渲染进程提供开发服务，**不需要 proxy 配置**——Electron 渲染进程有完整网络访问能力，直接 `fetch('http://localhost:8000/api/...')` 调用后端即可。

本项目 `vite.config.ts` 实际配置：

```ts
server: {
  port: 5173,
}
```

**在本项目中的具体用途**：渲染进程开发服务器 + 别名配置（`@` 指向 `src`，所以可以写 `import xxx from '@/stores/chatStore'`）。

**官方文档（中文）**：

- Vite 官方中文文档：<https://cn.vite.dev/>
- Vite 6 中文文档：<https://v6.vite.org.cn/>

**推荐中文教程**：

- B 站搜索「Vite 教程」，推荐看「Vite 从入门到精通」。

---

### 5. TypeScript

**一句话解释**：TypeScript 是 JavaScript 的「带类型版本」，写代码时给每个变量标明它是什么类型（数字、字符串、对象…），编译时就能发现「把字符串当数字用」这类错误，而不是等运行时才崩。

**和 JavaScript 的关系**：TypeScript 是 JavaScript 的超集——所有合法的 JS 都是合法的 TS，TS 额外加了类型系统。TS 代码不能直接在浏览器跑，要先用 `tsc` 编译成 JS（Vite 会自动帮你做这步）。你写 `.ts` / `.tsx` 文件，Vite 在开发时实时编译，`npm run build` 时统一编译打包。

**为什么要用**：

1. **编译时抓错**：少打个字段、传错参数类型，编辑器立刻画红线，不用等运行。
2. **有类型提示**：在 VSCode 里敲 `msg.` 会自动列出 `msg` 有哪些属性，写代码像有副驾驶。
3. **重构有底气**：改一个接口，所有用到的地方编译器都会报错提醒你，不会漏。

**interface 和 type 的区别（面试常问，项目里都用）**：两者都能定义对象类型，90% 的场景可以互换。区别：

- `interface` 只能描述对象/类的形状，支持**同名自动合并**（声明两次同名 interface 会合并），支持 `extends` 继承。**推荐优先用 interface 定义对象形状**。
- `type` 能定义任何类型：基本类型别名、联合类型（`A | B`）、元组、交叉类型（`A & B`）。遇到联合类型、元组这类**必须用 type**。

本项目约定（见 `types/index.ts`）：对象形状用 `interface`（如 `Message`、`Conversation`），需要联合类型时用 `type`。

```ts
// interface 示例（本项目 types/index.ts）
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'  // 字面量联合类型
  content: string
  created_at: string
}

// type 示例（联合类型，interface 做不到）
type Role = 'user' | 'assistant' | 'system'
```

**在本项目中的具体用途**：所有 `.ts` / `.tsx` 文件都用 TypeScript，定义消息、会话、SSE 事件等类型，让流式处理的代码有类型提示。

**官方文档（中文）**：

- TypeScript 中文官方文档（含 5 分钟入门）：<https://www.typescriptlang.org/zh/docs/handbook/typescript-in-5-minutes.html>
- 演练场 types-vs-interfaces：<https://www.typescriptlang.org/zh/play/typescript/language-extensions/types-vs-interfaces.ts.html>

**推荐中文教程**：

- TypeScript 入门教程（xcatliu，GitHub 万星）：<https://ts.xcatliu.com/>
- TypeScript 中文手册（zhongsp，含进阶类型）：<https://zhongsp.gitbook.io/typescript-handbook/>

---

### 6. Tailwind CSS 3

**一句话解释**：Tailwind 是一个「原子化 CSS」框架，它给你一堆现成的小 class（比如 `p-4` = 内边距 16px，`text-center` = 文字居中），你直接在 HTML 里组合这些 class 写样式，**不用写单独的 CSS 文件**。

**通俗比喻**：传统 CSS 像「先去衣柜挑一套西装再穿」——你写 `.button { padding: 16px; background: purple; }` 然后给元素加 `class="button"`。Tailwind 像「一件一件往身上套」——你写 `class="p-4 bg-purple-600"`，每个 class 只干一件事。好处是不用起类名、不用跳来跳去看 CSS 文件、改样式就在原地改。

**和传统 CSS 的区别**：

| 维度 | 传统 CSS | Tailwind |
|------|---------|----------|
| 写法 | 单独 `.css` 文件 + class 名 | 直接在 HTML 写 className 组合 |
| 起类名 | 要想名字（`btn-primary`? `main-btn`?） | 不用起名 |
| 复用 | 复用 class | 复用组件（把 className 包在 React 组件里） |
| 体积 | 手写容易冗余 | 按需生成，没用到的不会打包 |

**className 组合写法**：用模板字符串 + 三元运算符按条件拼。

```tsx
// 本项目 ChatMessage.tsx 的真实写法：用户和 AI 气泡颜色不同
<div className={`max-w-[80%] rounded-xl px-4 py-3 ${
  isUser
    ? 'bg-accent-purple/20 border border-accent-purple/30 ml-auto'
    : 'bg-bg-card border border-border-default'
}`}>
```

- `bg-accent-purple/20` = 紫色背景 + 20% 透明度（`/20` 是透明度修饰符）。
- `max-w-[80%]` = 方括号写**任意值**（不在 Tailwind 默认值里时用）。
- `hover:bg-bg-hover` = 鼠标悬停时的背景色。
- `focus:ring-1 focus:ring-accent-purple/30` = 聚焦时显示一圈光晕。

**在本项目中的具体用途**：所有样式都用 Tailwind，没有单独的 CSS 文件（只有 `index.css` 引入 Tailwind 指令）。深色主题配色定义在 `tailwind.config.ts` 里（`bg-primary` `#0B1020` 等）。

**官方文档（中文）**：

- Tailwind CSS 中文文档：<https://tailwindcss.zhcndoc.com/>
- 工具优先的基础（核心理念）：<https://tailwind-v3.nodejs.cn/docs/utility-first>
- 处理悬停、聚焦和其他状态：<https://tailwind-v3.nodejs.cn/docs/hover-focus-and-other-states>

**推荐中文教程**：

- Tailwind CSS 中文文档（tailwind.org.cn）：<https://tailwind.org.cn/docs/configuration>
- B 站搜索「Tailwind CSS 教程」，推荐看「Tailwind CSS 从入门到实战」。

> Tailwind 速查小技巧：VSCode 装 **Tailwind CSS IntelliSense** 插件，敲 class 时会自动补全 + 显示实际 CSS 值，不用背。

---

### 7. Zustand 4

**一句话解释**：Zustand 是 React 的状态管理库，让你在组件外面存一个「全局状态」，任何组件都能读写，**不用像 Redux 那样写一堆 action / reducer / dispatch**。

**通俗比喻**：Redux 像一个官僚机构——你想改一个状态，要写「申请单」（action）→ 交给「办事员」（reducer）→ 他改完通知你，流程繁琐。Zustand 像一个共享白板——任何组件都能直接拿笔在白板上写（调 `set()`），也能直接看（调 `useStore()`），没人拦你，但规则是你自己定的。Zustand 的名字在德语里就是「状态」的意思。

**和 Redux 的区别**：

| 维度 | Redux | Zustand |
|------|-------|---------|
| 代码量 | 多（action type、creator、reducer、configureStore） | 少（一个 `create()` 搞定） |
| Provider | 要包 `<Provider>` | 不用，直接 import |
| 学习曲线 | 陡（要懂 flux 思想） | 平（就是函数 + set） |
| 体积 | ~2KB+ | ~1KB |
| 模板代码 | 多 | 几乎没有 |

**`create()` 的用法**：传一个函数，函数拿到 `set`（改状态）和 `get`（读状态），返回一个对象（状态 + 操作方法）。`create` 返回的是一个 **Hook**。

```ts
import { create } from 'zustand'

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],            // 状态
  isStreaming: false,
  addUserMessage: (content) => set((s) => ({   // 操作方法
    messages: [...s.messages, { id: crypto.randomUUID(), role: 'user', content }],
  })),
}))
```

**`getState()` 的用法（重点）**：在**非 React 组件**的地方（比如 `useStreamChat.ts` 的 fetch 回调里）想读写 store，不能用 Hook（Hook 只能在组件里调）。这时用 `useChatStore.getState()` 读、`useChatStore.getState().xxx()` 调方法、`useChatStore.setState()` 写。这是 SSE 消费者能更新状态的关键。

```ts
// 本项目 useStreamChat.ts 的真实写法：在 fetch 回调里更新 store
useChatStore.getState().appendToLastMessage(event.content ?? '')
useChatStore.getState().finishLastMessage()
```

**Selector 用法（性能优化）**：组件里不要 `const store = useChatStore()`（这样任何状态变都会重渲染），而是**只订阅需要的那一块**：

```tsx
// 本项目 App.tsx 的真实写法：每个状态单独订阅
const messages = useChatStore((s) => s.messages)
const isStreaming = useChatStore((s) => s.isStreaming)
```

**在本项目中的具体用途**：三个 store——`chatStore`（消息列表、流式状态）、`conversationStore`（会话列表、当前会话）、`settingsStore`（当前模型、技能开关）。

**官方文档（中文）**：

- Zustand 中文网（`create` API 详解）：<https://zustand.nodejs.cn/docs/apis/create>
- Zustand 中文文档（ouweiya 译）：<https://ouweiya.github.io/zustand-zh/>
- 介绍与快速上手：<https://ouweiya.github.io/zustand-zh/docs/getting-started/introduction>
- 迁移到 v4（`create<T>()(...)` 双括号写法）：<https://ouweiya.github.io/zustand-zh/docs/migrations/migrating-to-v4>

**推荐中文教程**：

- CodexLin「Zustand 状态管理快速入门」：<https://codexlin.com/blog/zustand-quick-start>
- B 站搜索「Zustand 教程」，推荐看「Zustand 状态管理从入门到精通」。

---

### 8. Fetch API + ReadableStream

**一句话解释**：`fetch` 是浏览器自带的发 HTTP 请求的函数，`ReadableStream` 是它返回的「可读字节流」——当后端流式返回数据时（AI 一边想一边吐字），你可以用 `reader.read()` 一块一块地读，**边读边显示**，而不是等全部下完才显示。

**为什么不用 EventSource**：浏览器原生有个 `EventSource` API 专门收 SSE，但它有三个硬伤，本项目都踩到了：

1. **只支持 GET 请求**，不能发 POST body。本项目要给后端发 `{message, conversation_id, model}`，必须用 POST。
2. **不能自定义请求头**（除了 Cookie），没法设 `Authorization` 等。
3. **不能主动取消**（只能 `close()` 断开，没法精细控制）。

所以本项目用 `fetch` POST + 手动读 `ReadableStream` + 手动解析 SSE 格式。代价是代码多一点，但完全可控。

**怎么手动解析 SSE 格式**：核心三步（本项目 `useStreamChat.ts` 的真实逻辑）：

1. `const reader = res.body.getReader()` 拿到读取器。
2. `const decoder = new TextDecoder()` 准备字节转字符串。
3. 循环 `reader.read()`，把字节解码成字符串**追加到 buffer**，按 `\n\n` 分割出完整事件，剩下的留在 buffer 等下次。

> **关键陷阱**：`decoder.decode(value, { stream: true })` 的 `stream: true` **必须加**！AI 回答里有中文，一个汉字是 3 个字节，网络可能把一个汉字切成两半传过来，不加 `stream: true` 会出现乱码。`stream: true` 让解码器记住「上次没解完的字节」，下次拼起来再解。

> **另一个陷阱**：不能直接对每个 chunk 做 `split('\n\n')` 就完事——一个 SSE 事件可能被网络切成两个 chunk。正确做法是维护一个 `buffer` 字符串，每次 `split('\n\n')` 后**把最后一段（可能不完整的）放回 buffer**，等下次 chunk 来了再拼。本项目用 `buffer = parts.pop() ?? ''` 实现这一点。

**在本项目中的具体用途**：`useStreamChat.ts` 是整个前端最关键的文件，用 fetch POST + ReadableStream 消费后端的 SSE 流，逐 token 更新聊天气泡。

**官方文档（中文）**：

- MDN Fetch API（中文）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API>
- MDN ReadableStream（中文）：<https://developer.mozilla.org/zh-CN/docs/Web/API/ReadableStream>
- MDN TextDecoder（中文）：<https://developer.mozilla.org/zh-CN/docs/Web/API/TextDecoder>

**推荐中文教程**：

- 脚本之家「前端 SSE 流式请求的三种实现方案」（含 fetch + ReadableStream 完整代码 + 三方案对比）：<https://www.jb51.net/javascript/359506301.htm>
- 前端流式通信完整梳理（技术栈，fetch + ReadableStream vs EventSource 对比）：<https://jishuzhan.net/article/2053760488903868418>
- HTML Fetch 流式响应读取指南（讲清楚 TextDecoder `stream:true` 和 buffer 缓冲）：<https://www.17golang.com/article/609312.html>
- 腾讯云「服务端 SSE 数据代理与基于 fetch 的 EventSource 实现」：<https://developer.cloud.tencent.com/article/2523521>

---

### 9. AbortController

**一句话解释**：`AbortController` 是浏览器原生的「请求取消器」——你创建一个 controller，把它的 `signal` 传给 `fetch`，需要取消时调 `controller.abort()`，请求就中断了。

**通俗比喻**：像快递的「取消订单」按钮。你下单时（`fetch`）拿一个取消凭证（`signal`），货还在路上时点取消（`abort()`），快递就停了，不用等货送到再退。

**在本项目中的用途（停止生成功能）**：用户点「Stop」按钮时，调用 `controller.abort()` 中断正在进行的 fetch 流，AI 就停止吐字了。捕获到 `AbortError` 时要静默处理（这是用户主动取消，不是错误）。

本项目 `useStreamChat.ts` 真实写法：

```ts
const controller = new AbortController()
controllerRef.current = controller

const res = await fetch('http://localhost:8000/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify({ ... }),
  signal: controller.signal,   // 把信号传给 fetch
})

// 用户点 Stop 时调这个
const stop = () => {
  controllerRef.current?.abort()           // 中断请求
  useChatStore.getState().finishLastMessage()  // 把当前消息标记为完成
}

// catch 里要识别 AbortError（用户主动取消，不算错误）
catch (err) {
  if (err instanceof Error && err.name === 'AbortError') return  // 静默
  // 其他错误才报错
}
```

**官方文档（中文）**：

- MDN AbortController（中文）：<https://developer.mozilla.org/zh-CN/docs/Web/API/AbortController>
- 现代 JavaScript 教程「Fetch：中止」：<https://zh.javascript.info/fetch-abort>

**推荐中文教程**：

- 张鑫旭「使用 AbortController abort 中断原生 fetch 或 axios 请求」：<https://www.zhangxinxu.com/wordpress/2023/01/fetch-abortcontroller-abort-fetch-axios/>
- OpenReplay「使用 AbortController 取消进行中的 Fetch 请求」：<https://blog.openreplay.com/zh/%E5%8F%96%E6%B6%88-fetch%E8%AF%B7%E6%B1%82-abortcontroller/>

---

### 10. SSE（Server-Sent Events）

**一句话解释**：SSE 是一种「服务器主动往浏览器推数据」的协议，基于普通 HTTP，服务器用 `text/event-stream` 格式一段段发，浏览器一段段收。AI 聊天用它是因为「逐字输出」体验好（像 ChatGPT 那样一个字一个字蹦出来）。

**`data: {json}\n\n` 格式怎么解析**：SSE 规定每个事件以 `data:` 开头，以**两个换行 `\n\n`** 结尾。本项目每个事件的 `data:` 后面跟一个 JSON 字符串：

```
data: {"type": "token", "content": "你"}

data: {"type": "token", "content": "好"}

data: {"type": "done"}
```

解析步骤（见第四部分代码示例）：

1. 拿到字符串后按 `\n\n` split 得到一个个事件块。
2. 每个块去掉 `data:` 前缀（`line.slice(6)`）。
3. `JSON.parse` 解析成对象。
4. 按 `event.type` 分发处理（`token` / `done` / `error` / `conversation` / `tool_call` / `tool_result`）。

**客户端怎么接收**：本项目用 fetch + ReadableStream 手动接收（见第 6 点），不用 EventSource。

**和 WebSocket 的区别**：SSE 是单向（服务器→客户端），基于 HTTP，简单；WebSocket 是双向，需要单独协议，复杂。聊天场景服务器只推、客户端不需要双向，SSE 够用且更简单。

**在本项目中的具体用途**：`POST /api/chat/stream` 返回 SSE 流，6 种事件类型（见第三部分接口协议）。

**官方文档（中文）**：

- MDN EventSource（中文，讲 SSE 协议背景）：<https://developer.mozilla.org/zh-CN/docs/Web/API/EventSource>
- WHATWG Server-Sent Events 规范（中文）：<https://html.whatwg.cn/dev/server-sent-events.html>

**推荐中文教程**：

- 使用服务器发送事件（MDN 中文，EventSource 创建 + 事件流格式）：<https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events>
- 使用服务器发送的事件流式传输更新（web.dev 中文，前后端结合）：<https://web.dev/articles/eventsource-basics?hl=zh-cn>

---

### 11. useRef + useEffect

**一句话解释**：`useRef` 让你「记住一个值但不触发重新渲染」（常用来抓 DOM 元素），`useEffect` 让你「在组件挂载/更新/卸载时执行副作用并清理」。

**通俗比喻**：

- `useRef` 像给一个 DOM 元素贴个「标签」，你之后能通过标签直接拿到那个元素（不用查询 DOM）。
- `useEffect` 像租房子：搬进去时（挂载）开水电，搬走时（卸载）记得关水电（清理函数），不然水电费（内存泄漏）一直跑。

**在本项目中的具体用途**：

**① 自动滚动到底部**（`App.tsx`）：消息列表更新时，自动滚到最底下看新消息。

```tsx
const bottomRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages])  // messages 一变就滚
```

**② 抓 textarea 元素做自动增高**（`ChatInput.tsx`）：

```tsx
const textareaRef = useRef<HTMLTextAreaElement>(null)

const adjustHeight = () => {
  const el = textareaRef.current
  if (el) {
    el.style.height = '0'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }
}
```

**③ 存 AbortController 跨渲染保持引用**（`useStreamChat.ts`）：

```tsx
const controllerRef = useRef<AbortController | null>(null)
// stream 时存进去，stop 时读出来 abort
```

**④ useEffect 清理事件监听**（`App.tsx` 快捷键）：

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => { /* Ctrl+K 新建会话 */ }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)  // 清理！
}, [createConversation])
```

> `useEffect` 的 return 函数就是清理函数，组件卸载或依赖变化时执行。**加了事件监听就一定要 return 清理函数**，不然会内存泄漏。

**官方文档（中文）**：

- `useRef` 参考：<https://zh-hans.react.dev/reference/react/useRef>
- `useEffect` 参考：<https://zh-hans.react.dev/reference/react/useEffect>

**推荐中文教程**：

- ReactUse「React 滚动效果：告别第三方库」：<https://reactuse.com/zh-Hans/blog/react-scroll-effects/>
- 使用 ref 操作 DOM（React 官方中文，含 ref 与生命周期同步时机）：<https://zh-hans.react.dev/learn/manipulating-the-dom-with-refs>

---

## 第二部分：任务说明

你负责以下 10 个文件（行数是预估，别死板）。

### 1. `electron/main.ts` — Electron 主进程（~30 行）

**做什么**：创建应用窗口，加载页面。

**核心逻辑**：

1. `app.whenReady()` 等 Electron 准备好。
2. `new BrowserWindow({...})` 创建窗口，设置宽高。
3. 开发时 `win.loadURL('http://localhost:5173')`（Vite dev server）。
4. 生产时 `win.loadFile('dist/index.html')`（打包后的静态文件）。
5. `app.on('window-all-closed', ...)` 处理关闭。

**关键点**：

- 开发和生产环境的区别只是 loadURL vs loadFile，用 `process.env.NODE_ENV` 或 `!app.isPackaged` 判断。
- 窗口配置：`width: 1200, height: 800`，`webPreferences: { nodeIntegration: false, contextIsolation: true }`。

**验收标准**：

- [ ] 开发时运行能看到应用窗口打开，里面显示前端页面
- [ ] 窗口大小合适，有标题栏
- [ ] 关闭窗口后进程正常退出

---

### 2. `electron/preload.ts` — 预加载脚本（~10 行）

**做什么**：在渲染进程加载前运行，通过 contextBridge 暴露安全的 API。本项目简单，可以只做最小化暴露或留空。

**关键点**：

- 用 `contextBridge.exposeInMainWorld(...)` 暴露需要在渲染进程中使用的 API。
- 本项目渲染进程直接 fetch 后端，preload 可以很精简。

**验收标准**：

- [ ] 应用能正常启动，不报 preload 相关错误

---

### 3. `frontend/src/App.tsx` — 主布局（~150 行）

**做什么**：整个应用的根组件，负责布局和把各组件拼起来。

**布局结构**：

```
┌─────────────────────────────────────────────┐
│ Sidebar │  顶栏（标题 + 技能选择器 + 留位置   │
│ 250px   │  给 D 的 ModelSelector + 连接状态） │
│         ├──────────────────────────────────┤
│ 会话    │                                      │
│ 列表    │  聊天区（消息列表 / 空状态 / 加载中） │
│         │                                      │
│         ├──────────────────────────────────┤
│ Settings│  输入框（ChatInput）                  │
└─────────┴──────────────────────────────────┘
```

**关键点**：

- 外层 `flex h-screen overflow-hidden`，左侧 `Sidebar` 固定 250px，右侧 `main` 用 `flex-1` 占满。
- 顶栏：左边标题「Local AI Chatbot」，右边**留位置给 D 的 `ModelSelector`**（你先放一个占位 div，D 会替换）。同时放连接状态指示灯（绿/红/灰点）。
- 聊天区三种状态切换：`loading`（加载历史时显示跳动的点）→ `messages.length === 0`（显示空状态欢迎语）→ 有消息（渲染消息列表）。
- 底部放 `ChatInput`，下面一行快捷键提示文字。
- `useEffect` 在挂载时调 `/api/health` 检查后端连接 + `fetchConversations()` 拉会话列表。
- `useEffect` 监听 `messages` 变化，自动滚动到底部。
- `useEffect` 注册全局快捷键 `Ctrl+K`（新建会话）、`Ctrl+L`（清空输入框）。

**和 D 的约定**：顶栏右边的 `ModelSelector` 位置你先留好（用一个 `<div>ModelSelector 占位</div>` 或直接 import D 的组件），D 写好后直接替换。

---

### 2. `frontend/src/hooks/useStreamChat.ts` — SSE 消费者（~100 行，**最关键**）

**做什么**：封装「发消息 + 收 SSE 流 + 更新 store」的全部逻辑，返回 `{ stream, stop }` 两个函数。

**为什么这是最关键的文件**：整个项目只有这一个文件处理流式响应。它出错，聊天就废了。

**核心逻辑**（必须按这个顺序）：

1. 创建 `AbortController`，存到 `controllerRef`。
2. 从 `conversationStore.getState()` 拿 `currentConversationId`，从 `settingsStore.getState()` 拿 `model` 等设置。
3. `fetch('http://localhost:8000/api/chat/stream', { method: 'POST', body: ..., signal: controller.signal })`。
4. 检查 `res.ok`，不 ok 就 `setError` + `finishLastMessage` 退出。
5. `const reader = res.body.getReader()` + `const decoder = new TextDecoder()` + `let buffer = ''`。
6. `while (true)` 循环 `reader.read()`：
   - `done` 为 true 就 break。
   - `buffer += decoder.decode(value, { stream: true })`。
   - `const parts = buffer.split('\n\n')`，`buffer = parts.pop() ?? ''`（最后一段可能不完整，留到下次）。
   - 遍历 `parts`：trim，跳过空行和不是 `data:` 开头的行，`JSON.parse(line.slice(6))`。
   - `switch (event.type)` 分发：`token` → `appendToLastMessage`；`done` → `finishLastMessage`；`error` → `setError`；`conversation` → `setCurrentConversation` + `fetchConversations`；`tool_call` → `addToolCall`；`tool_result` → `updateToolResult`。
   - `JSON.parse` 用 try/catch 包，解析失败就跳过（防止半截 JSON 崩溃）。
7. 循环结束后，如果 `isStreaming` 还是 true，补一个 `finishLastMessage`（防止 done 事件丢失）。
8. catch 里识别 `AbortError`（用户取消，静默 return），其他错误才 `setError` + `finishLastMessage`。
9. finally 里 `controllerRef.current = null`。

**`stop` 函数**：`controllerRef.current?.abort()` + `finishLastMessage()`。

**组件卸载清理**：因为 `stream` 是用户点击触发的，不是 useEffect，所以不强制在 useEffect 清理。但如果想在组件卸载时停止，可以在 App.tsx 加一个 `useEffect(() => () => stop(), [])`。

> 完整代码见第四部分代码示例 2。

---

### 3. `frontend/src/stores/chatStore.ts` — 聊天状态（~80 行）

**做什么**：管理当前会话的消息列表和流式状态。

**状态**：

- `messages: ChatMessage[]` — 消息列表
- `isStreaming: boolean` — 是否正在流式输出
- `error: string | null` — 错误信息

**方法**：

| 方法 | 作用 |
|------|------|
| `addUserMessage(content)` | 往列表末尾加一条用户消息（`role: 'user'`） |
| `addAssistantMessage()` | 加一条空的 AI 消息（`content: ''`, `isStreaming: true`），开始流式 |
| `appendToLastMessage(token)` | 把 token 追加到最后一条 AI 消息的 content 后面 |
| `finishLastMessage()` | 把最后一条 AI 消息的 `isStreaming` 设为 false，整体 `isStreaming` 设为 false |
| `clearMessages()` | 清空消息列表 |
| `setError(error)` | 设置错误信息，`isStreaming` 设为 false |
| `stopStreaming()` | 停止流式（和 finishLastMessage 类似） |
| `loadMessages(messages)` | 加载历史消息（切换会话时用） |
| `addToolCall(toolCall)` | 给最后一条 AI 消息加一个工具调用记录 |
| `updateToolResult(name, result)` | 更新某个工具调用的结果 |

**关键点**：

- `crypto.randomUUID()` 生成消息 id（浏览器原生，不用装库）。
- 所有更新都**不可变**（`[...s.messages]` 浅拷贝再改，不能直接 `push`），Zustand 靠引用变化判断是否重渲染。

---

### 4. `frontend/src/stores/conversationStore.ts` — 会话状态（~80 行）

**做什么**：管理会话列表、当前选中的会话、会话的增删查切换。

**状态**：

- `conversations: Conversation[]` — 会话列表
- `currentConversationId: string | null` — 当前会话 id
- `loading: boolean` — 是否正在加载历史消息

**方法**：

| 方法 | 作用 |
|------|------|
| `fetchConversations()` | `GET /api/conversations` 拉会话列表 |
| `createConversation()` | `POST /api/conversations` 新建会话，设为当前，清空消息 |
| `selectConversation(id)` | 设为当前会话，`GET /api/conversations/{id}/messages` 加载历史，调 `chatStore.loadMessages` |
| `deleteConversation(id)` | `DELETE /api/conversations/{id}`，如果是当前会话则清空消息 |
| `setCurrentConversation(id)` | 只设 id，不加载（SSE 收到 `conversation` 事件时用） |

**关键点**：

- `selectConversation` 里要把后端返回的 `Message[]` 转成 `ChatMessage[]`（补 `isStreaming: false`，`role` 收窄成 `'user' | 'assistant'`）。
- 跨 store 调用：`useChatStore.getState().clearMessages()` / `loadMessages()`。

---

### 5. `frontend/src/components/ChatMessage.tsx` — 消息气泡（~50 行）

**做什么**：渲染单条消息，区分用户和 AI。

**关键点**：

- 用户消息：右对齐（`justify-end`），紫色背景，纯文本（`whitespace-pre-wrap break-words` 保留换行）。
- AI 消息：左对齐，卡片背景，用 `MarkdownRenderer` 渲染（**D 负责，你先 `<p>{message.content}</p>` 占位**）。
- AI 消息空内容时（刚开始流式），显示三个跳动的小点（`animate-bounce`）。
- AI 消息流式中，末尾显示一个闪烁光标（`animate-pulse` 的竖条）。
- AI 消息流式结束且非空，显示复制按钮（**D 负责的 `CopyButton`，你先占位或写个简单的**）。
- 有 `toolCalls` 时，在内容上方渲染工具调用卡片（**D 负责的 `ToolCallCard`，你先占位**）。

> 和 D 的约定：`MarkdownRenderer`、`CopyButton`、`ToolCallCard` 都是 D 写的组件，你先 import 占位或写简单版，D 写好直接替换。

---

### 6. `frontend/src/components/ChatInput.tsx` — 输入框（~90 行）

**做什么**：底部输入框 + 发送/停止/清屏按钮。

**关键点**：

- `textarea` 用 `useRef` 抓元素，输入时调 `adjustHeight` 自动增高（`el.style.height = '0'` 再设为 `scrollHeight`，上限 200px）。
- 发送后重置 `textarea` 高度为 `auto`。
- `Enter` 发送（`e.key === 'Enter' && !e.shiftKey` 时 `preventDefault` + 发送），`Shift+Enter` 换行（默认行为，不用处理）。
- `isStreaming` 时显示「Stop」红色按钮，否则显示「Send」紫色按钮。
- 「Clear」按钮：`isStreaming` 时禁用。
- 发送按钮在文本为空或流式中禁用（`disabled={!canSend}`）。

---

### 7. `frontend/src/components/Sidebar.tsx` — 侧边栏（~70 行）

**做什么**：左侧 250px 侧边栏，显示会话列表。

**关键点**：

- 顶部「Conversations」标题 + 「+」新建会话按钮。
- 会话列表：每项点击切换（`onSelectConversation`），当前选中的高亮（`bg-bg-hover` + 左侧紫色边框）。
- 鼠标悬停时显示删除按钮（`opacity-0 group-hover:opacity-100`），点删除要 `e.stopPropagation()` 阻止冒泡（不然会同时触发选中）。
- 空列表显示「No conversations yet.」。
- 底部 Settings 区域放 Memory 面板（**D 负责的 `MemoryPanel`，你先留位置**）。

---

### 8. `frontend/src/types/index.ts` — 类型定义（~20 行）

**做什么**：集中放前后端共用的 TypeScript 类型。

**定义的类型**：

```ts
Message          // 后端消息（含 conversation_id, created_at）
Conversation     // 会话（id, title, created_at, updated_at）
Memory           // 记忆
ToolCall         // 工具调用记录
ModelInfo        // 模型信息（id, name, provider, local）
```

> `ChatMessage`（前端聊天状态用的消息类型）定义在 `chatStore.ts` 里，因为只有前端用，含 `isStreaming`、`toolCalls`。

---

## 第三部分：接口协议

> 这部分是字典，写代码时随时查。协议由组长定，**改协议前必须在群里说**。

### SSE 事件格式

后端 `POST /api/chat/stream` 返回 `text/event-stream`，每个事件格式：

```
data: {json}\n\n
```

其中 `{json}` 是一个对象，`type` 字段表示事件类型。共 **6 种事件**：

| `type` | 字段 | 含义 | 前端处理 |
|--------|------|------|----------|
| `token` | `content: string` | AI 吐一个字 | `appendToLastMessage(content)` |
| `done` | （无） | 流结束 | `finishLastMessage()` |
| `error` | `message: string` | 出错 | `setError(message)`，`finishLastMessage()` |
| `conversation` | `conversation_id: string`, `title: string` | 新会话创建（首次发消息时） | `setCurrentConversation(id)` + `fetchConversations()` |
| `tool_call` | `name: string`, `args: object` | AI 要调工具 | `addToolCall({name, args, result: null})` |
| `tool_result` | `name: string`, `result: string` | 工具执行结果 | `updateToolResult(name, result)` |

**事件流示例**（一次完整的带工具调用的对话）：

```
data: {"type": "conversation", "conversation_id": "abc-123", "title": "现在几点"}

data: {"type": "tool_call", "name": "get_time", "args": {}}

data: {"type": "tool_result", "name": "get_time", "result": "2026-07-06 14:30:00"}

data: {"type": "token", "content": "现在"}

data: {"type": "token", "content": "是"}

data: {"type": "token", "content": "下午 2 点 30 分"}

data: {"type": "done"}
```

> 你要处理的 4 个核心事件是 `token` / `done` / `error` / `conversation`；`tool_call` / `tool_result` 是工具调用功能加上后才有的，但你的代码要能处理（不然会崩）。本项目 `useStreamChat.ts` 六种都处理了。

### API 路径表

前端调用的所有接口（Electron 渲染进程直接 fetch `http://localhost:8000` + 路径）：

| 方法 | 路径 | 请求体 | 返回 | 谁调用 |
|------|------|--------|------|--------|
| GET | `/api/health` | — | `{"status": "ok"}` | App.tsx（检查连接） |
| GET | `/api/models` | — | `[{id, name, provider, local}]` | D 的 ModelSelector |
| POST | `/api/chat/stream` | `{message, conversation_id?, model?, skill?, enable_memory?, enable_tools?}` | SSE 流 | useStreamChat |
| GET | `/api/conversations` | — | `[{id, title, created_at, updated_at}]` | conversationStore |
| POST | `/api/conversations` | `{title?}` | `{id, title, ...}` | conversationStore |
| GET | `/api/conversations/{id}/messages` | — | `[{id, role, content, created_at}]` | conversationStore |
| DELETE | `/api/conversations/{id}` | — | `{"ok": true}` | conversationStore |
| DELETE | `/api/conversations/{id}/messages` | — | `{"ok": true}` | App.tsx（清屏） |
| GET | `/api/memory` | — | `[{id, content, source, created_at}]` | D 的 MemoryPanel |
| POST | `/api/memory` | `{content}` | `{id, ...}` | D 的 MemoryPanel |
| DELETE | `/api/memory/{id}` | — | `{"ok": true}` | D 的 MemoryPanel |
| GET | `/api/skills` | — | `[{id, name, ...}]` | D 的 SkillSelector |
| GET | `/api/tools` | — | `[{...}]` | D 的工具列表 |

### 请求体格式

**`POST /api/chat/stream`** 请求体（ChatRequest）：

```ts
{
  message: string,                    // 必填，用户消息
  conversation_id?: string | null,    // 可选，新会话不传，后端会创建
  model?: string | null,              // 可选，如 "ollama:qwen2.5:1.5b" 或 "api:gpt-4o-mini"
  skill?: string,                     // 可选，技能 id，默认 "general"
  enable_memory?: boolean,            // 可选，默认 true
  enable_tools?: boolean,             // 可选，默认 true
}
```

**响应**：`Content-Type: text/event-stream`，见上面的 SSE 事件格式。

---

## 第四部分：代码示例

### 示例 1：怎么创建 Zustand store

完整可跑的 `chatStore.ts`（精简版，真实版见仓库）：

```ts
import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  error: string | null
  addUserMessage: (content: string) => void
  addAssistantMessage: () => void
  appendToLastMessage: (token: string) => void
  finishLastMessage: () => void
  clearMessages: () => void
  loadMessages: (messages: ChatMessage[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  error: null,

  addUserMessage: (content) =>
    set((s) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), role: 'user', content }],
      error: null,
    })),

  addAssistantMessage: () =>
    set((s) => ({
      messages: [...s.messages, { id: crypto.randomUUID(), role: 'assistant', content: '', isStreaming: true }],
      isStreaming: true,
    })),

  appendToLastMessage: (token) =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + token }
      }
      return { messages: msgs }
    }),

  finishLastMessage: () =>
    set((s) => {
      const msgs = [...s.messages]
      const last = msgs[msgs.length - 1]
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, isStreaming: false }
      }
      return { messages: msgs, isStreaming: false }
    }),

  clearMessages: () => set({ messages: [], error: null }),
  loadMessages: (messages) => set({ messages, error: null, isStreaming: false }),
}))
```

**自检**（贴到文件末尾跑 `node --experimental-vm-modules` 或 `ts-node` 验证逻辑）：

```ts
// ponytail: 自检——验证 appendToLastMessage 真的追加到最后一条
if (import.meta.vitest === undefined && typeof require !== 'undefined') {
  // 简单断言
}
```

---

### 示例 2：用 fetch + ReadableStream 消费 SSE（**重点，完整模式**）

这是 `useStreamChat.ts` 的完整可跑版本：

```ts
import { useRef, useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useConversationStore } from '../stores/conversationStore'

interface StreamEvent {
  type: 'token' | 'done' | 'error' | 'conversation' | 'tool_call' | 'tool_result'
  content?: string
  message?: string
  conversation_id?: string
  title?: string
  name?: string
  args?: Record<string, unknown>
  result?: string
}

export function useStreamChat() {
  const controllerRef = useRef<AbortController | null>(null)

  const stream = useCallback(async (message: string) => {
    const controller = new AbortController()
    controllerRef.current = controller

    try {
      // 1. 从其他 store 读当前状态（用 getState，不用 Hook）
      const conversationId = useConversationStore.getState().currentConversationId

      // 2. fetch POST，把 signal 传进去
      const res = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        useChatStore.getState().setError(`Server error: ${res.status}`)
        useChatStore.getState().finishLastMessage()
        return
      }

      // 3. 拿 reader + decoder + buffer
      const reader = res.body?.getReader()
      if (!reader) {
        useChatStore.getState().setError('No response body')
        useChatStore.getState().finishLastMessage()
        return
      }
      const decoder = new TextDecoder()
      let buffer = ''

      // 4. 循环读
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })  // stream:true 处理跨 chunk 中文
        const parts = buffer.split('\n\n')                   // SSE 事件以 \n\n 分隔
        buffer = parts.pop() ?? ''                           // 最后一段可能不完整，留到下次

        for (const part of parts) {
          const line = part.trim()
          if (!line || !line.startsWith('data: ')) continue

          try {
            const event: StreamEvent = JSON.parse(line.slice(6))
            switch (event.type) {
              case 'token':
                useChatStore.getState().appendToLastMessage(event.content ?? '')
                break
              case 'done':
                useChatStore.getState().finishLastMessage()
                break
              case 'error':
                useChatStore.getState().setError(event.message ?? 'Unknown error')
                break
              case 'conversation':
                if (event.conversation_id) {
                  useConversationStore.getState().setCurrentConversation(event.conversation_id)
                  useConversationStore.getState().fetchConversations()
                }
                break
            }
          } catch {
            // skip malformed JSON（半截 JSON 不崩）
          }
        }
      }

      // 5. 流正常结束但没收到 done，补一刀
      if (useChatStore.getState().isStreaming) {
        useChatStore.getState().finishLastMessage()
      }
    } catch (err: unknown) {
      // 6. 识别 AbortError（用户取消，静默）
      if (err instanceof Error && err.name === 'AbortError') return
      useChatStore.getState().setError(err instanceof Error ? err.message : 'Stream failed')
      useChatStore.getState().finishLastMessage()
    } finally {
      controllerRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    useChatStore.getState().finishLastMessage()
  }, [])

  return { stream, stop }
}
```

---

### 示例 3：用 AbortController 取消请求

最小可跑示例（独立于项目，演示原理）：

```ts
async function demoAbort() {
  const controller = new AbortController()

  // 5 秒后自动取消（模拟用户点 Stop）
  setTimeout(() => controller.abort(), 5000)

  try {
    const res = await fetch('https://httpbin.org/delay/10', {
      signal: controller.signal,
    })
    console.log('完成', await res.text())
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log('用户取消了，不算错误')
    } else {
      console.error('真出错了', err)
    }
  }
}

// 自检：跑一下能看到 5 秒后打印「用户取消了」
// demoAbort()
```

---

### 示例 4：React 组件 + Tailwind className

`ChatMessage.tsx` 精简版（区分用户 / AI）：

```tsx
interface Props {
  message: { role: 'user' | 'assistant'; content: string; isStreaming?: boolean }
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'
  const isEmpty = message.content.length === 0

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 ${
          isUser
            ? 'bg-accent-purple/20 border border-accent-purple/30 ml-auto'
            : 'bg-bg-card border border-border-default'
        }`}
      >
        {isUser ? (
          <p className="text-text-primary whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : isEmpty ? (
          <span className="inline-flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </span>
        ) : (
          <p className="text-text-primary whitespace-pre-wrap break-words">
            {message.content}
            {message.isStreaming && <span className="animate-pulse">▋</span>}
          </p>
        )}
      </div>
    </div>
  )
}
```

**要点**：

- `justify-end` / `justify-start` 控制用户消息靠右、AI 靠左。
- `${isUser ? '...' : '...'}` 三元运算符按角色切 className。
- `whitespace-pre-wrap` 保留换行，`break-words` 长单词换行不溢出。
- `animate-bounce`（跳动点）/ `animate-pulse`（闪烁光标）是 Tailwind 内置动画。

---

### 示例 5：useEffect 做自动滚动

```tsx
import { useEffect, useRef } from 'react'

export default function ChatList({ messages }: { messages: { id: string; content: string }[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // messages 变化时，自动滚到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}
      <div ref={bottomRef} />  {/* 哨兵 div，滚到它就等于滚到底 */}
    </div>
  )
}
```

**要点**：

- `bottomRef` 挂在一个空的哨兵 div 上，放在列表最末尾。
- `useEffect` 依赖 `[messages]`，messages 一变就触发滚动。
- `behavior: 'smooth'` 平滑滚动，体验好。

---

### 示例 6：auto-grow textarea（自动增高输入框）

```tsx
import { useState, useRef, useCallback } from 'react'

export default function AutoGrowTextarea() {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = '0'                              // 先清零，才能正确测 scrollHeight
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`  // 上限 200px
    }
  }, [])

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        adjustHeight()
      }}
      rows={1}
      className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-default text-text-primary resize-none"
    />
  )
}
```

**要点**：

- `resize-none` 禁止用户手动拖拽改大小（用自动增高替代）。
- `rows={1}` 初始一行高。
- `el.style.height = '0'` 这步**必须有**，否则删字时高度不会缩回去（scrollHeight 是「当前高度」和「内容需要的高度」的较大值，不清零就会卡在最大值）。

---

## 第五部分：协作说明

### 依赖谁

| 依赖 | 等谁 | 说明 |
|------|------|------|
| 接口协议 | **等组长** | SSE 事件格式、API 路径、请求体字段，必须等组长在群里发定稿。第三部分已是当前协议，但开工前再确认一遍。 |
| 后端接口 | **不硬等 A/B** | 你可以先用 mock 数据写 UI 和 SSE 消费者（见下方 mock 示例），后端好了直接接。 |
| ModelSelector 组件 | **等 D** | 顶栏右边 D 会放 `ModelSelector`，你先留位置。D 写好后 import 替换占位。 |
| MarkdownRenderer | **等 D** | `ChatMessage` 里 AI 消息先用 `<p>` 占位，D 写好 `MarkdownRenderer` 后替换。 |

### 不等后端：用 mock 数据先写 UI

后端没好之前，你可以用一个 mock 函数模拟 SSE 流，把前端全部跑通。下面这个函数返回一个 `Response` 对象，行为和真后端一致，直接喂给你的 `useStreamChat` 测试：

```ts
// mockStream.ts —— 模拟后端 SSE 流，用于前端独立开发
export function mockChatStream(message: string): Response {
  const encoder = new TextEncoder()
  const events = [
    { type: 'conversation', conversation_id: 'mock-1', title: message.slice(0, 20) },
    { type: 'token', content: '你好，' },
    { type: 'token', content: '这是' },
    { type: 'token', content: '一个 mock' },
    { type: 'token', content: '回答。' },
    { type: 'done' },
  ]

  const stream = new ReadableStream({
    async start(controller) {
      for (const ev of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`))
        await new Promise((r) => setTimeout(r, 300))  // 模拟网络延迟，逐字吐
      }
      controller.close()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}
```

**怎么用**：把 `useStreamChat.ts` 里的 `fetch('http://localhost:8000/api/chat/stream', ...)` 临时换成 `mockChatStream(message)`，其他逻辑完全不变，就能在前端独立调试流式效果。后端好了换回来即可。

> ponytail: mock 用 ReadableStream 构造，和真实 fetch 返回的 Response 接口一致，零适配切换。

### 被 D 依赖

| 谁依赖你 | 你要做什么 |
|---------|-----------|
| D 要在顶栏加 `ModelSelector` | `App.tsx` 顶栏右边**留好位置**（一个 `<div className="flex items-center gap-3">` 容器），写好后通知 D「顶栏位置留好了，ModelSelector 塞这个 div 里」。 |
| D 要在 `ChatMessage` 用 `MarkdownRenderer` | `chatStore.ts` 的 `ChatMessage` 类型定好后通知 D（D 要知道有 `isStreaming`、`toolCalls` 字段）。 |
| D 的组件要读 store | `chatStore` / `conversationStore` / `settingsStore` 的**接口（方法名、参数）定好后**，在群里发一版，D 才能开始写依赖 store 的组件。 |

### 沟通节奏

1. **Day 1**：搭项目骨架（Electron + Vite + TS + Tailwind + Zustand 装好），写 `App.tsx` 布局 + `types/index.ts` + 三个 store 的接口（方法名定下来，方法体可以先空）。**当天把 store 接口发给 D**。
2. **Day 2**：写 `useStreamChat.ts`（用 mock 数据测通）+ `ChatMessage` + `ChatInput`。**顶栏位置留好通知 D**。
3. **Day 3**：写 `Sidebar` + `conversationStore` 完整实现 + 和后端联调（换掉 mock，接真后端）。
4. **Day 4**：修 bug。

### 遇到问题找谁

- 接口不对 / SSE 事件格式有疑问 → **找组长**
- 后端接口报错 / 返回数据格式不对 → **找 A（聊天/会话）或 B（模型）**
- D 的组件和你的布局对不上 → **直接找 D**
- 改接口（比如 `ChatMessage` 要加字段）→ **群里说，别偷偷改**，D 依赖这个类型

---

## 附：快速上手清单

开工前花半天做完这几件事：

1. **装环境**：Node.js 18+，跑 `cd frontend && npm install`。
2. **跑起来**：启动 Electron（`npm run electron:dev` 或等效命令），看到应用窗口打开就对了（后端没开会显示连接失败）。
3. **读现有代码**：把 `frontend/src/stores/chatStore.ts`、`App.tsx`、`useStreamChat.ts` 通读一遍，这份指南的代码示例都和它们一致。
4. **读文档**：React 中文文档「快速入门」+ Zustand 中文文档「介绍」，各花 1 小时。
5. **写第一个 store**：照着示例 1 把 `chatStore.ts` 敲一遍，理解 `create` / `set` / `getState`。
6. **写 SSE 消费者**：照着示例 2 + mock 函数，把流式效果跑通（看到字一个一个蹦出来）。

做完这 6 步，你已经搞定最难的 70%。剩下的布局和组件都是体力活。

**加油。最关键的是 `useStreamChat.ts`，把它吃透，整个项目就通了。**
