# 成员 D

---

## 项目背景与你的职责

这是一个**前后端分离**的本地 AI 聊天机器人：

- **后端**：Python + FastAPI + SQLite + Ollama（本地大模型）
- **前端**：Electron + React + Vite + TypeScript + Tailwind CSS
- AI 的回答是 Markdown 格式的（含代码块、表格、列表），需要在前端漂亮地渲染出来

### 你要交付的文件

| 文件 | 说明 | 大致行数 |
|------|------|---------|
| `frontend/src/components/MarkdownRenderer.tsx` | Markdown 渲染 + 代码高亮 + 代码块复制 | ~115 |
| `frontend/src/components/ModelSelector.tsx` | 模型下拉选择器 | ~95 |
| `frontend/src/components/CopyButton.tsx` | 复制到剪贴板按钮 | ~25 |
| `frontend/src/styles/globals.css` | 全局样式 + 滚动条 + highlight.js 主题 | ~26 |
| `frontend/tailwind.config.ts` | 深色主题配色 | ~37 |

### 你被谁依赖、依赖谁（速览）

- **被 C 依赖**：`ModelSelector` 的 props 接口要和 C 的 `App.tsx` 对接
- **依赖 C**：等 C 的 `App.tsx` 在顶栏留好位置
- **依赖 B**：等 B 的 `http://localhost:8000/api/models` 接口
- **不等任何人**：`MarkdownRenderer`、`CopyButton`、主题配色可以**独立先做**

详细协作见 [第五部分](#第五部分协作说明)。

---

## 第一部分：技术简介与通俗解释

> 这一节先把你要用到的技术一个个讲清楚。每项技术会给出：一句话通俗解释、在本项目中的用途、官方文档链接、推荐中文教程链接。
> **比喻是核心**：看懂比喻就懂了一半。

### 1. react-markdown

**一句话通俗解释**：
它就像一个"翻译官"——你给它一段 Markdown 文字（比如 `# 标题`、`**加粗**`），它帮你翻译成网页上真正显示的 React 元素（`<h1>标题</h1>`、`<strong>加粗</strong>`），你完全不用自己写 HTML。

**更具体一点**：
React 本身只能渲染 JSX/HTML，看不懂 Markdown。`react-markdown` 做的事是：把 Markdown 字符串先解析成一棵"语法树"（AST），再把树上的每个节点（标题、段落、代码块……）映射成对应的 React 元素。因为它走的是语法树而不是直接拼 HTML 字符串，所以天然防止 XSS 攻击（不会执行恶意脚本）。

**在本项目中的用途**：
AI 的回答是一段 Markdown 文本，里面可能有代码块、表格、列表、链接。我们用 `react-markdown` 把这段文本渲染成带样式的聊天气泡内容。最关键的是它的 **`components` 属性**——可以"覆盖"默认渲染：比如遇到代码块 `<code>`，我们不直接渲染，而是渲染一个带"复制按钮"的自定义代码块。

**官方文档**：

- GitHub 仓库（含完整 README）：<https://github.com/remarkjs/react-markdown>

**推荐中文教程**：

- 掘金《React-Markdown 教学指南》：<https://juejin.cn/post/7589171972446666794>
- 掘金《React-Markdown 完全上手指南》：<https://juejin.cn/post/7515393471542312995>
- 异常教程《react markdown 保姆级教程》：<https://www.exception.site/article/3587>

---

### 2. remark-gfm

**一句话通俗解释**：
它是 `react-markdown` 的一个"扩展包"，让 Markdown 多支持 GitHub 网站上的那套语法（GFM = GitHub Flavored Markdown，GitHub 风味 Markdown），比如**表格**、**删除线**（`~~这样~~`）、**任务列表**（`- [x]`）、**自动链接**（直接写网址就能点）。

**比喻**：标准 Markdown 像普通话，GFM 像带方言的普通话——能听懂更多本地词汇。`remark-gfm` 就是给翻译官装上"方言包"。

**在本项目中的用途**：
AI 经常用表格对比信息、用任务列表说明步骤、用删除线表示废弃。如果不加 `remark-gfm`，这些语法会原样显示成 `| a | b |` 这种乱码。加上之后就能正常渲染成表格。它作为 `remarkPlugins` 传给 `react-markdown`。

**GFM 额外支持的语法**：

| 语法 | 效果 | 标准 Markdown 是否支持 |
|------|------|----------------------|
| `\|表格\|` | 表格 | |
| `~~文字~~` | <s>删除线</s> | |
| `- [x]` / `- [ ]` | 任务列表（勾选框） | |
| `https://xxx` | 自动变成可点链接 | |

**官方文档**：

- GitHub 仓库：<https://github.com/remarkjs/remark-gfm>

**推荐中文教程**：

- 博客园《前端 + AI 进阶：流式 Markdown 渲染》：<https://www.cnblogs.com/aigent/p/19403810>
- 掘金《react+react-markdown 实现 markdown 预览》：<https://juejin.cn/post/7414047932465610786>

---

### 3. rehype-highlight

**一句话通俗解释**：
它是一个"代码上色插件"——把代码块里的关键字（`function`、`if`）、字符串（`"hello"`）、注释（`// 备注`）等涂上不同颜色，让代码看起来和 VS Code 里一样好看。

**比喻**：就像给黑白照片上色。代码本来是纯黑文字，这个插件根据"词性"给不同部分涂不同颜色。

**它和 react-markdown 怎么配合**：
`react-markdown` 的处理流水线是 `Markdown → AST → HTML AST → React`。`remark` 插件作用于第一阶段（Markdown AST），`rehype` 插件作用于第二阶段（HTML AST）。`rehype-highlight` 在 HTML 阶段找到 `<code>` 节点，把它内部用 `<span class="hljs-keyword">` 之类的标签包起来，这样配上 CSS 就有颜色了。它作为 `rehypePlugins` 传给 `react-markdown`。

**在本项目中的用途**：
AI 回答里的代码块要自动语法高亮。我们传 `rehypePlugins={[rehypeHighlight]}`，它负责把代码拆成带 class 的 span，颜色由下一个介绍的 `highlight.js` 主题 CSS 提供。

**官方文档**：

- GitHub 仓库：<https://github.com/rehypejs/rehype-highlight>

**推荐中文教程**：

- 博客园《流式 Markdown 渲染》（含 rehype-highlight 用法）：<https://www.cnblogs.com/aigent/p/19403810>

---

### 4. highlight.js

**一句话通俗解释**：
它是一个"代码高亮工具库"，支持 190+ 种编程语言、90+ 种配色主题。`rehype-highlight` 内部就是用它来分析代码的。我们这里**只用它的 CSS 主题文件**（不用它的 JS），给上一步生成的 span 上色。

**比喻**：`rehype-highlight` 是"画线稿的人"，`highlight.js` 的 CSS 主题是"涂颜色的颜料"。我们直接引入一管叫 `github-dark` 的颜料（深色主题），代码块就变成 GitHub 网站那种深色配色。

**在本项目中的用途**：
在 `globals.css` 里用一行 `@import 'highlight.js/styles/github-dark.css';` 引入 GitHub 深色主题。这样 `rehype-highlight` 生成的 `hljs-keyword`、`hljs-string` 等 class 就有对应颜色了。**不用调用任何 JS 函数**，纯 CSS。

**怎么选主题**：

- 官方主题预览（可在线对比 90+ 主题）：<https://highlightjs.org/demo>
- 常用深色主题：`github-dark`、`atom-one-dark`、`monokai`、`nord`
- 我们项目用 `github-dark`，和整体深色 UI 风格一致

**官方文档**：

- 官网（含主题预览 demo）：<https://highlightjs.org/>

**推荐中文教程**：

- 中文网（主题预览 + API 文档）：<https://fenxianglu.cn/highlight.html>
- 官方 API 文档：<https://highlightjs.readthedocs.io/en/latest/api.html>

---

### 5. Tailwind CSS 3

**一句话通俗解释**：
它是一个"原子化 CSS 框架"——不写 CSS 文件，直接在 JSX 的 `className` 里写 `bg-blue-500 text-white p-4` 这种"小工具类"，编译时自动生成对应的 CSS。优点是不用起 class 名、不用切换 HTML/CSS 文件、样式即所见。

**比喻**：传统 CSS 是"点菜"（先写好菜单 .btn-primary，再用），Tailwind 是"自助餐"（直接拿需要的料拼在一起）。

**主题配色怎么配置**：
在 `tailwind.config.ts` 的 `theme.extend.colors` 里加自定义颜色。`extend` 表示"在默认基础上扩展"（不会覆盖 Tailwind 自带的 blue/red 等）。加了之后就能用 `bg-颜色名`、`text-颜色名`、`border-颜色名`。

**在本项目中的用途**：
整个项目是深色主题（黑紫色风格）。我们在 `tailwind.config.ts` 里定义一套自定义颜色：背景色（`bg-primary` #0B1020 最深、`bg-secondary`、`bg-card`、`bg-hover`）、强调色（`accent-purple` 紫、`accent-blue` 蓝）、文字色（`text-primary` 最亮、`text-secondary`、`text-muted` 最暗）、边框色、状态色（success/error/warning）。这样所有组件都能用统一的颜色名，调色时只改一个文件。

**官方文档**：

- Tailwind CSS 中文官方文档：<https://tailwindcss.cn>
- 主题配置（中文）：<https://tailwindcss.cn/docs/theme>
- 自定义颜色（官方中文）：<https://tailwind.org.cn/docs/customizing-colors>

**推荐中文教程**：

- Tailwind 中文文档《配置》：<https://tailwind.org.cn/docs/configuration>
- Tailwind 中文网《主题配置》：<https://tailwind-v3.nodejs.cn/docs/theme>

---

### 6. React 组件设计（下拉组件模式）

**一句话通俗解释**：
做一个下拉菜单，核心是三个东西的组合拳：`useState`（记录"开/关"状态）+ `useRef`（拿到下拉框的 DOM 引用）+ 一个监听 `mousedown` 的全局事件（判断点击是不是在框外面）。

**比喻**：下拉框像一个"小帐篷"。`useState` 记录帐篷门开没开；`useRef` 是帐篷的"门牌号"（DOM 引用）；全局事件监听器像门口的保安——看到有人点击，就检查点击位置在不在帐篷里，不在就关门。

**为什么要用 `mousedown` 而不是 `click`**：
`click` 会在 `blur`（失焦）之后才触发，可能导致"选项还没选上，下拉就先关了"的 bug。`mousedown` 在失焦之前触发，顺序正确。这是社区踩坑后的标准做法。

**为什么要 `removeEventListener`**：
组件卸载时如果不清理事件监听器，会造成内存泄漏。`useEffect` 的 return 函数就是"清理函数"，在组件卸载时自动执行。

**在本项目中的用途**：
`ModelSelector` 是一个下拉选择器，点击外部要自动关闭。就用这个标准模式。

**官方文档**：

- React 官方中文文档（Hooks）：<https://zh-hans.react.dev/reference/react>

**推荐中文教程**：

- ReactUse 中文《在 React 中检测元素外部点击》：<https://reactuse.com/zh-Hans/blog/detect-click-outside-react/>
- 腾讯云《React 下拉菜单 Dropdown Menu》：<https://developer.cloud.tencent.cn/article/2476054>
- 掘金《React 下拉菜单 Dropdown Menu》：<https://juejin.cn/post/7446362500478337050>

---

### 7. Clipboard API（`navigator.clipboard.writeText()`）

**一句话通俗解释**：
浏览器自带的"复制到剪贴板"接口。调用 `navigator.clipboard.writeText('文字')` 就能把文字复制到系统剪贴板，相当于用户按 Ctrl+C，但是用代码触发。返回一个 Promise（异步），复制成功就 resolve，失败就 reject。

**比喻**：就是代码版的 Ctrl+C。

**两个重要的坑**：

1. **必须在 HTTPS 或 localhost 下才能用**：浏览器安全限制。本地开发用 `localhost` 没问题，但如果用内网 IP（`192.168.x.x`）就会变成 `undefined`。
2. **必须在用户交互事件里触发**：比如点击按钮。不能在页面加载时自动复制，会被浏览器拦截。

**怎么处理复制失败**：
用 `.catch(() => {})` 静默处理。复制失败的原因可能是浏览器不支持、权限被拒、非安全上下文等。对于本项目（本地聊天机器人，localhost 环境），失败概率极低，静默处理即可，不打扰用户。如果要更稳妥，可以加降级方案（`document.execCommand('copy')`），但本项目用最简方案就够。

**在本项目中的用途**：

- `CopyButton` 组件：复制整条 AI 回复
- `MarkdownRenderer` 的代码块：复制代码

**官方文档**：

- MDN `Clipboard.writeText()`：<https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard/writeText>

**推荐中文教程**：

- 阮一峰《剪贴板操作 Clipboard API 教程》：<https://www.ruanyifeng.com/blog/2021/01/clipboard-api.html>
- 网道《Clipboard API》：<https://wangdoc.com/webapi/clipboard>
- Chanx's Blog《如何实现复制功能》：<https://chanx.tech/blog/copy-with-vanilla-js>

---

### 8. useRef + textContent（获取代码块文本的正确姿势）

**一句话通俗解释**：
要拿到代码块里的纯文本内容用于复制，**不能**直接读 React 的 `children`（会得到 `[object Object]`），**正确做法**是给 `<code>` 元素挂一个 `ref`，然后用 `codeRef.current.textContent` 读取浏览器渲染后的纯文本。

**为什么不能直接用 children**：
`react-markdown` 给自定义 `code` 组件传的 `children` 是 **React 节点**（ReactNode），不是字符串。尤其在我们用了 `rehype-highlight` 之后，代码块里的内容已经被拆成一堆 `<span class="hljs-keyword">`、`<span class="hljs-string">` 子元素，`children` 是一个数组：

```
children = ["const ", <span class="hljs-keyword">x</span>, " = ", <span class="hljs-string">"1"</span>]
```

这时候：

- `String(children)` → `"[object Object]"`（或拼接出乱七八糟的东西）
- `children.toString()` → `"[object Object]"`
- `children + ''` → `"[object Object]"`

**正确做法**：把 children 原样渲染到 `<code ref={codeRef}>` 里，等浏览器渲染完后，DOM 元素的 `textContent` 属性会自动把所有子节点的文本拼成纯字符串。这是最稳的方式，不管 highlight 怎么拆 span 都不受影响。

```tsx
const codeRef = useRef<HTMLElement>(null)

const copy = () => {
  const text = codeRef.current?.textContent ?? ''  // 永远是纯文本
  navigator.clipboard.writeText(text)
}

return <pre><code ref={codeRef}>{children}</code></pre>
```

**对比错误的写法**：

```tsx
// 错误：children 是 React 节点，不是字符串
const copy = () => {
  navigator.clipboard.writeText(children)  // 复制出 "[object Object]"
}

// 错误：String() 对含 React 元素的数组也得不到正确结果
const copy = () => {
  navigator.clipboard.writeText(String(children))  // 可能是 "const [object Object] = [object Object]"
}
```

**在本项目中的用途**：
`MarkdownRenderer` 的代码块"复制"按钮，用这个方式拿到代码原文。这是整个项目最容易踩坑的点，务必理解。

**官方文档**：

- MDN `Node.textContent`：<https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent>
- React `useRef` 中文：<https://zh-hans.react.dev/reference/react/useRef>

---

## 第二部分：任务说明

> 这里告诉你**具体要实现什么**。每一项给出功能要求、关键点、验收标准。

### 任务 1：MarkdownRenderer.tsx — Markdown 渲染组件

**目标**：把 AI 回复的 Markdown 文本渲染成带样式的 React 元素。

**技术组合**：`react-markdown` + `remark-gfm` + `rehype-highlight` + `highlight.js` 主题

**功能要求**：

1. **基础渲染**：接收 `content: string` props，用 `<ReactMarkdown>` 渲染。
2. **自定义组件覆盖**（通过 `components` 属性）：
   - **代码块**（block code）：深色背景 + 圆角边框 + 复制按钮（鼠标悬停时显示）。复制按钮用 `useRef + textContent` 拿代码原文。
   - **行内代码**（inline code）：蓝色文字 + 深色底色 + 小圆角。判断依据：`className` 为空（没有 `language-xxx`）就是行内代码。
   - **表格**（table）：带边框 + 横向滚动容器（`overflow-x-auto`），防止宽表格撑破布局。
   - **链接**（a）：新窗口打开（`target="_blank" rel="noopener noreferrer"`），蓝色可悬停下划线。
   - **引用块**（blockquote）：左侧紫色竖线 + 灰色斜体文字。
   - **列表/标题/段落/分隔线**：基本排版样式。
3. **代码块复制按钮**：用 `useRef + textContent`，显示 "Copied!" 2 秒后恢复 "Copy"。
4. **highlight.js 主题**：在 `globals.css` 引入 `github-dark` 主题（见任务 5）。

**关键点**：

- `pre` 组件要"透传"：`pre: ({ children }) => <>{children}</>`。因为我们把代码块的样式和复制按钮放在了 `code` 组件里，`pre` 不再需要，用空片段包一下避免出现嵌套 `<pre><pre>`。
- 区分行内代码和代码块：`className` 有 `language-xxx` 的是代码块，没有的是行内代码。
- 复制按钮用 `group-hover`：鼠标移到代码块上才显示按钮（`opacity-0 group-hover:opacity-100`）。

**验收标准**：

- [ ] AI 回复里的代码块有语法高亮（彩色）
- [ ] 代码块右上角有"Copy"按钮，点击后变"Copied!"，2 秒恢复
- [ ] 复制出来的内容是纯代码，没有 `[object Object]`
- [ ] 表格能正常显示，宽表格能横向滚动
- [ ] 链接点击后在新标签页打开
- [ ] 引用块有紫色左边线

---

### 任务 2：ModelSelector.tsx — 模型选择器下拉

**目标**：从后端拉取可用模型列表，提供一个下拉选择器。

**功能要求**：

1. **拉取模型列表**：组件挂载时 `GET http://localhost:8000/api/models`，存到 `useState`。
2. **下拉选择器**：
   - 按钮显示当前选中的模型名 + 一个绿点（表示本地模型在线）
   - 点击按钮展开/收起下拉列表
   - 列表里每项显示模型名 + provider，本地模型显示 "local" 标签
   - 选中后高亮（`bg-bg-hover`）
3. **点击外部关闭**：用 `useRef` + `document.addEventListener('mousedown', ...)`，点击下拉框外部时收起。
4. **加载后自动选中第一个**：列表加载完，如果当前没选中任何模型（`model` 为 `null`），自动调用 `onChange(models[0].id)`。
5. **空状态提示**：Ollama 没运行时列表为空，显示 "No models available. Is Ollama running?"。

**Props 接口**（这是和 C 对接的契约，不能随意改）：

```ts
interface Props {
  model: string | null       // 当前选中的模型 id，null 表示未选
  onChange: (model: string) => void  // 选中模型时回调
}
```

**关键点**：

- 拉取失败用 `.catch(() => setModels([]))` 静默处理，列表空就会显示提示。
- 自动选中第一个模型用单独的 `useEffect`，依赖 `[models, model, onChange]`。
- 下拉框定位用 `absolute top-full right-0`，贴在按钮下方右对齐。
- 选项的点击用 `onClick`（这里没和 input blur 冲突，所以 `onClick` 即可；如果你的下拉和输入框联动，才需要 `onMouseDown`）。

**验收标准**：

- [ ] Ollama 运行时，下拉里能看到所有本地模型
- [ ] 点击模型后按钮显示对应名字
- [ ] 点击下拉框外部，下拉自动收起
- [ ] 首次加载后自动选中第一个模型
- [ ] Ollama 没运行时显示友好提示

---

### 任务 3：CopyButton.tsx — 复制按钮

**目标**：一个通用的"复制到剪贴板"按钮，用于复制整条 AI 回复。

**功能要求**：

1. 接收 `text: string` props，是要复制的内容。
2. 点击调用 `navigator.clipboard.writeText(text)`。
3. 复制成功后显示 "Copied!"，2 秒后恢复 "Copy"。
4. 复制失败**静默处理**：`.catch(() => {})`，不弹窗、不报错。

**Props 接口**：

```ts
interface Props {
  text: string
}
```

**关键点**：

- 用 `useCallback` 包裹 `copy` 函数，依赖 `[text]`，避免每次渲染都新建函数。
- `setTimeout` 2 秒后把 `copied` 改回 `false`。
- 这是给 `ChatMessage` 用的（C 写的），C 会在 AI 消息气泡里 `<CopyButton text={message.content} />`。

**验收标准**：

- [ ] 点击按钮能复制内容到剪贴板
- [ ] 点击后显示 "Copied!"，2 秒恢复
- [ ] 复制失败不会抛错、不会白屏

---

### 任务 4：tailwind.config.ts — 深色主题配色

**目标**：定义整个项目的深色主题颜色系统。

**要定义的颜色**：

| 颜色组 | 色阶 | 色值 | 用途 |
|--------|------|------|------|
| `bg.primary` | — | `#0B1020` | 最深背景（body） |
| `bg.secondary` | — | `#111827` | 次级背景（代码块、表头） |
| `bg.card` | — | `#161B2E` | 卡片背景（消息气泡、下拉框） |
| `bg.hover` | — | `#1E2438` | 鼠标悬停背景 |
| `accent.purple` | — | `#7C3AED` | 强调色紫（用户消息、引用块边线） |
| `accent.blue` | — | `#2563EB` | 强调色蓝（行内代码、链接） |
| `text.primary` | — | `#E5E7EB` | 主文字色（最亮） |
| `text.secondary` | — | `#9CA3AF` | 次文字色 |
| `text.muted` | — | `#6B7280` | 弱化文字（提示、时间戳） |
| `border.default` | — | `#273248` | 默认边框 |
| `border.hover` | — | `#3B4663` | 悬停边框 |
| `status.success` | — | `#10B981` | 成功（连接正常、本地模型绿点） |
| `status.error` | — | `#EF4444` | 错误（断连） |
| `status.warning` | — | `#F59E0B` | 警告 |

**配置要点**：

- 放在 `theme.extend.colors` 下（**不是** `theme.colors`，否则会覆盖 Tailwind 默认颜色）。
- 用嵌套对象：`bg: { primary: '#0B1020', secondary: '#111827', ... }`，这样类名是 `bg-bg-primary`（第一个 `bg` 是 Tailwind 的背景工具类前缀，第二个 `bg` 是我们定义的颜色组名）。
- `darkMode: 'class'`：启用 class 模式的深色模式（虽然我们整体就是深色，但留着以备扩展）。
- `content: ['./index.html', './src/**/*.{ts,tsx}']`：告诉 Tailwind 扫描哪些文件提取类名。

**验收标准**：

- [ ] 所有 `bg-bg-primary`、`text-text-primary`、`border-border-default` 等类名生效
- [ ] 改颜色值后所有用到的地方同步变化

---

### 任务 5：globals.css — 全局样式

**目标**：全局基础样式 + 代码高亮主题 + 自定义滚动条。

**内容**：

1. **引入 highlight.js 主题**：`@import 'highlight.js/styles/github-dark.css';`（放最前面）
2. **Tailwind 指令**：

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. **暗色 body 样式**：`color-scheme: dark` + `body` 用 `@apply bg-bg-primary text-text-primary` + 系统字体。
4. **自定义滚动条**：用 `::-webkit-scrollbar` 伪元素，6px 细滚动条，thumb 用 `bg-border-default rounded-full`。

**关键点**：

- `@import` 必须在 `@tailwind` 指令之前（CSS 规范要求 `@import` 在最前）。
- `color-scheme: dark` 让浏览器原生控件（滚动条、表单）也变深色。
- 滚动条用 `@apply` 引用我们定义的 Tailwind 颜色，保持一致。

**验收标准**：

- [ ] 代码块有 github-dark 配色
- [ ] 整个页面背景是深色（#0B1020）
- [ ] 滚动条是细的、深色的

---

### 任务 6：UI 打磨

**目标**：让界面看起来精致，不是"能跑就行"的粗糙样子。

**具体打磨项**：

1. **空状态**（在 `App.tsx`，C 负责主体，D 负责视觉）：
   - 消息列表为空时，显示一个图标（聊天气泡 SVG）+ 欢迎文案
   - 图标用紫色圆形背景（`bg-accent-purple/10`）+ 紫色 SVG
2. **输入框焦点光晕**：`focus:ring-2 focus:ring-accent-purple/50`，输入框获得焦点时有紫色光环。
3. **顶栏渐变**：`bg-gradient-to-r from-bg-secondary to-bg-secondary/50 backdrop-blur-sm`，顶栏用渐变 + 毛玻璃模糊。
4. **加载动画**：三个小圆点 `animate-bounce`，错开延迟（`animationDelay`）。
5. **流式光标**：AI 回复时末尾有一个闪烁的竖线光标（`animate-pulse`）。

**注意**：空状态和加载动画的代码在 `App.tsx`（C 的文件），但视觉设计由 D 决定。如果 C 已经写了，D 负责调样式；如果 C 没写，D 可以提议加上。和 C 沟通好。

**验收标准**：

- [ ] 空状态有图标 + 文案，不是白屏
- [ ] 输入框获得焦点时有视觉反馈
- [ ] 顶栏有渐变效果
- [ ] AI 回复时有"正在输入"的视觉提示

---

## 第三部分：接口协议

### `http://localhost:8000/api/models` 接口

这是成员 B 提供的接口，你的 `ModelSelector` 要消费它。

**请求**：

```
GET http://localhost:8000/api/models
```

**响应**（JSON 数组）：

```json
[
  {
    "id": "ollama:qwen2.5:3b",
    "name": "Qwen2.5 3B",
    "provider": "ollama",
    "local": true
  },
  {
    "id": "ollama:llama3.2:1b",
    "name": "Llama 3.2 1B",
    "provider": "ollama",
    "local": true
  }
]
```

**字段说明**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 模型唯一标识，格式 `provider:name:version`，例如 `"ollama:qwen2.5:3b"`。发送聊天请求时用这个 id。 |
| `name` | string | 模型显示名，展示给用户看。 |
| `provider` | string | 提供方，例如 `"ollama"`。 |
| `local` | boolean | 是否本地运行。`true` 时下拉里显示绿点和 "local" 标签。 |

**对应的 TypeScript 类型**（在 `frontend/src/types/index.ts`，C 负责维护）：

```ts
export interface ModelInfo {
  id: string
  name: string
  provider: string
  local: boolean
}
```

**模型 id 格式说明**：`"ollama:qwen2.5:3b"` —— 用冒号分隔，第一段是 provider，后面是模型名和版本。这个 id 会原样传给后端的 `/api/chat/stream` 接口。

### ModelSelector 的 Props 契约（和 C 对接）

`ModelSelector` 被 C 在 `App.tsx` 的顶栏里使用：

```tsx
// App.tsx 里 C 会这样用
import ModelSelector from './components/ModelSelector'
import { useSettingsStore } from './stores/settingsStore'

function App() {
  const model = useSettingsStore((s) => s.model)         // string | null
  const setModel = useSettingsStore((s) => s.setModel)   // (model: string) => void
  // ...
  return <ModelSelector model={model} onChange={setModel} />
}
```

所以你的 `ModelSelector` 必须**严格匹配**这个 props 签名：

```ts
interface Props {
  model: string | null
  onChange: (model: string) => void
}
```

- `model` 是当前选中模型的 id（从 `settingsStore` 来），`null` 表示还没选过。
- `onChange` 在用户选中一个模型时调用，把新的 model id 传出去，C 会用它更新 `settingsStore`。

**不要改这个 props 签名**，否则 C 的 `App.tsx` 对接不上。如果确实需要改，先和 C、组长沟通。

---

## 第四部分：代码示例

> 下面是关键代码的可运行示例，基于本项目的实际实现。可以直接参考，但要理解每行在做什么。

### 4.1 安装和引入 react-markdown + 插件

**安装**（在 `frontend` 目录下）：

```bash
npm install react-markdown remark-gfm rehype-highlight highlight.js
```

**package.json 里会多出这些依赖**（本项目实际版本）：

```json
{
  "dependencies": {
    "highlight.js": "^11.11.1",
    "react-markdown": "^10.1.0",
    "rehype-highlight": "^7.0.2",
    "remark-gfm": "^4.0.1"
  }
}
```

**在组件里引入**：

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
// highlight.js 的 CSS 主题在 globals.css 里 @import，这里不用引入 JS
```

---

### 4.2 自定义代码块渲染（pre/code 组件覆盖）

这是 `MarkdownRenderer` 的核心。`react-markdown` 遇到代码块时，默认渲染成 `<pre><code>...</code></pre>`。我们覆盖 `pre` 和 `code`，加上样式和复制按钮。

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { useState, useCallback, useRef } from 'react'

// 代码块组件：深色背景 + 复制按钮
function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const copy = useCallback(() => {
    // 用 ref + textContent 拿纯文本，不用 children
    const text = codeRef.current?.textContent ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [])

  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-bg-hover text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre className="bg-bg-secondary rounded-lg p-4 overflow-x-auto my-2 border border-border-default">
        <code ref={codeRef} className={className}>{children}</code>
      </pre>
    </div>
  )
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-body text-text-primary">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // pre 透传：把 pre 的内容直接交给下面的 code 组件处理
          // 避免 <pre><div><pre>... 这种嵌套
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            // 没有 className（没有 language-xxx）就是行内代码
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-bg-secondary text-accent-blue text-sm"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            // 代码块：用 CodeBlock 组件
            return <CodeBlock className={className}>{children}</CodeBlock>
          },
          // 链接：新窗口打开
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
              {children}
            </a>
          ),
          // 表格：横向滚动容器
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border border-border-default rounded-lg">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border-default px-3 py-2 bg-bg-secondary text-text-primary text-left">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-border-default px-3 py-2">{children}</td>
          ),
          // 引用块：紫色左边线
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent-purple pl-4 my-2 text-text-secondary italic">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

**几个要点解释**：

1. **`pre: ({ children }) => <>{children}</>`**：`react-markdown` 默认会把代码块包成 `<pre><code>...</code></pre>`。我们想在 `code` 组件里控制整个代码块（含复制按钮和 `<pre>` 标签），所以把外层 `pre`"吃掉"，只保留里面的 `<code>` 让我们的 `code` 组件处理。用空片段 `<></>` 避免多余的 DOM 节点。
2. **`isInline = !className`**：行内代码（`` `code` ``）没有 `language-xxx` 的 className，代码块（` ```js `）有。用这个区分。
3. **`group-hover`**：父级 `div` 加 `group` 类，按钮加 `opacity-0 group-hover:opacity-100`，鼠标移到代码块上按钮才出现。

---

### 4.3 useRef + textContent 获取代码块文本（对比错误方式）

这一节单独讲，因为这是最容易踩坑的地方。

**场景**：用户点"复制"按钮，要拿到代码块里的纯代码文本。

**错误方式 1：直接用 children**

```tsx
function CodeBlock({ children }: { children: React.ReactNode }) {
  const copy = () => {
    // children 是 React 节点，不是字符串
    navigator.clipboard.writeText(children)
    // TypeError / 复制出 "[object Object]"
  }
  return <pre><code>{children}</code></pre>
}
```

为什么错：用了 `rehype-highlight` 后，`children` 是一个数组，里面混着字符串和 React 元素（`<span class="hljs-keyword">` 等），不是纯字符串。

**错误方式 2：String(children)**

```tsx
const copy = () => {
  navigator.clipboard.writeText(String(children))
  // 可能复制出 "const [object Object] = [object Object]"
}
```

为什么错：`String()` 对含 React 元素的数组，会把每个元素 `toString()`，React 元素的 `toString()` 返回 `"[object Object]"`。

**正确方式：ref + textContent**

```tsx
import { useRef } from 'react'

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const codeRef = useRef<HTMLElement>(null)

  const copy = () => {
    // textContent 自动拼接所有子节点的纯文本
    const text = codeRef.current?.textContent ?? ''
    navigator.clipboard.writeText(text).then(() => {
      console.log('复制成功：', text)
    }).catch(() => {})
  }

  return (
    <pre>
      <code ref={codeRef} className={className}>{children}</code>
      <button onClick={copy}>Copy</button>
    </pre>
  )
}
```

原理：把 children 原样渲染到 `<code ref={codeRef}>` 里，浏览器渲染后，`codeRef.current` 就是真实的 DOM 元素，它的 `textContent` 属性会递归读取所有后代节点的文本，拼成纯字符串。不管 highlight 怎么用 span 拆分，`textContent` 都能正确还原原文。

**为什么 `useRef<HTMLElement>` 而不是 `HTMLCodeElement`**：
`<code>` 没有专门的 HTML 类型，用基类 `HTMLElement`。`textContent` 是 `Node` 上的属性，所有 DOM 节点都有。

---

### 4.4 点击外部关闭的下拉组件

这是 `ModelSelector` 的核心模式。下面是一个最小可运行示例：

```tsx
import { useState, useEffect, useRef } from 'react'

export default function Dropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 监听全局 mousedown，判断点击是否在组件外面
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // 如果点击的元素不在 ref 引用的容器里，就关闭
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    // 清理函数：组件卸载时移除监听器，防止内存泄漏
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}>Toggle</button>
      {open && (
        <div className="absolute top-full mt-1 bg-white border rounded shadow">
          <div>选项 1</div>
          <div>选项 2</div>
        </div>
      )}
    </div>
  )
}
```

**关键点**：

1. **`ref` 挂在最外层 `div`**：把按钮和下拉框都包在里面，这样点按钮和点选项都不会触发"外部关闭"。
2. **`e.target as Node`**：`event.target` 是 DOM 节点，用类型断言告诉 TypeScript 它是 `Node`，这样能传给 `contains()`。
3. **`ref.current.contains(target)`**：`contains` 判断 `target` 是不是 `ref.current` 的后代（或自身）。是 → 点的是内部，不关；不是 → 点的是外部，关。
4. **`mousedown` 而不是 `click`**：见第一部分第 6 节的解释，避免和失焦/选择冲突。
5. **`useEffect` 的依赖数组 `[]`**：只注册一次，不随 `open` 变化重复注册。

**在 ModelSelector 里的实际应用**（完整版见任务 2），下拉选项用 `onClick` 选中并关闭：

```tsx
<button
  onClick={() => {
    onChange(m.id)
    setOpen(false)
  }}
>
  {m.name}
</button>
```

---

### 4.5 配置 tailwind.config.ts 自定义颜色

本项目实际的 `tailwind.config.ts`：

```ts
import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 背景色组：用 bg-bg-primary、bg-bg-card 等
        bg: {
          primary: '#0B1020',
          secondary: '#111827',
          card: '#161B2E',
          hover: '#1E2438',
        },
        // 强调色组：用 text-accent-purple、bg-accent-blue 等
        accent: {
          purple: '#7C3AED',
          blue: '#2563EB',
        },
        // 文字色组：用 text-text-primary 等
        text: {
          primary: '#E5E7EB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        // 边框色组：用 border-border-default 等
        border: {
          default: '#273248',
          hover: '#3B4663',
        },
        // 状态色组：用 bg-status-success 等
        status: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
```

**类名怎么用**（容易混淆的点）：

| Tailwind 类名 | 拆解 | 实际色值 |
|---------------|------|---------|
| `bg-bg-primary` | `bg`(背景工具) + `bg`(颜色组) + `primary`(色阶) | #0B1020 |
| `text-text-primary` | `text`(文字工具) + `text`(颜色组) + `primary`(色阶) | #E5E7EB |
| `border-border-default` | `border`(边框工具) + `border`(颜色组) + `default`(色阶) | #273248 |
| `text-accent-blue` | `text`(文字工具) + `accent`(颜色组) + `blue`(色阶) | #2563EB |

为什么名字重复（`bg-bg`、`text-text`）？因为 Tailwind 的工具类前缀（`bg-`/`text-`/`border-`）和我们的颜色组名（`bg`/`text`/`border`）重了。看起来怪，但能用。如果你觉得别扭，可以把颜色组名改成 `surface`/`fg`/`line` 之类，但要全局替换所有组件的类名。**本项目统一用 `bg-bg-*` / `text-text-*` / `border-border-*`**。

**为什么不直接用 `theme.colors` 而用 `theme.extend.colors`**：
`theme.colors` 会**覆盖** Tailwind 默认颜色（blue/red/green 全没了），`theme.extend.colors` 是**追加**（默认颜色还在）。我们可能还要用 `text-white`、`bg-gray-500` 这些默认色，所以用 `extend`。

---

### 4.6 引入 highlight.js CSS 主题

在 `globals.css` 里用一行 `@import`：

```css
/* 必须在最前面，CSS 规范要求 @import 在其他规则之前 */
@import 'highlight.js/styles/github-dark.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-bg-primary text-text-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-border-default rounded-full;
}
```

**要点**：

1. **`@import` 在最前**：CSS 规范要求 `@import` 必须在所有其他规则之前（除了 `@charset`），否则被忽略。
2. **路径 `highlight.js/styles/github-dark.css`**：这是 `highlight.js` npm 包里自带的主题文件，Vite 会从 `node_modules` 里找到它。想换主题就把 `github-dark` 改成 `atom-one-dark`、`monokai` 等（去 <https://highlightjs.org/demo> 预览）。
3. **不用引入 highlight.js 的 JS**：因为我们用 `rehype-highlight`，它在构建时/运行时已经把代码拆成带 class 的 span 了，我们只需要 CSS 来上色。
4. **`@apply`**：在 CSS 里用 Tailwind 的类名。`bg-bg-primary` 引用我们配置的颜色。

---

### 4.7 Clipboard 复制按钮

完整的 `CopyButton.tsx`：

```tsx
import { useState, useCallback } from 'react'

interface Props {
  text: string
}

export default function CopyButton({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      // 2 秒后恢复
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // 静默处理失败：不弹窗、不报错
      // 可能原因：非 HTTPS、浏览器不支持、权限被拒
    })
  }, [text])

  return (
    <button
      onClick={copy}
      className="text-xs text-text-muted hover:text-text-secondary shrink-0 mt-0.5 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
```

**要点**：

1. **`useCallback(..., [text])`**：`text` 变化时才重建 `copy` 函数，避免每次渲染都新建函数（性能优化，传给子组件时尤其重要）。
2. **`.then().catch()`**：`writeText` 返回 Promise，成功走 `then` 改状态，失败走 `catch` 静默处理。
3. **`setTimeout(() => setCopied(false), 2000)`**：2 秒后把文字从 "Copied!" 改回 "Copy"。
4. **静默失败**：`.catch(() => {})` 空函数。本项目是 localhost 环境，基本不会失败，不需要降级方案。如果要更稳，参考 [Chanx's Blog](https://chanx.tech/blog/copy-with-vanilla-js) 的降级写法。

**在代码块里复制的写法**（和这里略有不同，因为代码块要自己拿 textContent）：

```tsx
// 在 CodeBlock 组件里
const codeRef = useRef<HTMLElement>(null)
const [copied, setCopied] = useState(false)

const copy = useCallback(() => {
  const text = codeRef.current?.textContent ?? ''  // 从 DOM 拿，不用 props
  navigator.clipboard.writeText(text).then(() => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }).catch(() => {})
}, [])
```

区别：`CopyButton` 的 text 是外部传进来的（整条消息），`CodeBlock` 的 text 是从 DOM 现拿的（代码块原文）。

---

## 第五部分：协作说明

### 依赖关系图

```
        ┌─────────┐
        │ 成员 B  │ 提供 http://localhost:8000/api/models 接口
        └────┬────┘
             │ 返回 [{id, name, provider, local}]
             ▼
┌────────────┴───────────┐
│  你（成员 D）           │
│  - ModelSelector        │ ← 依赖 B 的接口格式
│  - MarkdownRenderer     │ ← 不依赖任何人
│  - CopyButton           │ ← 不依赖任何人
│  - tailwind.config.ts   │ ← 不依赖任何人
│  - globals.css          │ ← 不依赖任何人
└────────────┬───────────┘
             │ ModelSelector 的 props 接口
             ▼
        ┌────────────┐
        │ 成员 C     │ 在 App.tsx 顶栏放 ModelSelector
        │            │ 在 ChatMessage 里用 MarkdownRenderer + CopyButton
        └────────────┘
```

### 不等任何人（可以 Day 1 就开始）

这些任务**完全独立**，不依赖任何其他成员：

| 任务 | 为什么能独立做 |
|------|---------------|
| `tailwind.config.ts` | 纯配置文件，自己定义颜色 |
| `globals.css` | 纯样式文件，引入 highlight.js 主题 |
| `CopyButton.tsx` | 纯组件，props 是 string，不依赖任何接口 |
| `MarkdownRenderer.tsx` | 纯组件，props 是 string（content），不依赖任何接口。用 mock 数据测试即可 |

**建议 Day 1 先做这四个**，把主题配色和独立组件搞定。

### 等 C（成员 C 的布局）

- **`ModelSelector` 的接入**：等 C 在 `App.tsx` 顶栏留好位置。C 会写 `<ModelSelector model={model} onChange={setModel} />`，你的 props 接口必须和这个匹配（见 [第三部分](#modelselector-的-props-契约和-c-对接)）。
- **`MarkdownRenderer` 和 `CopyButton` 的使用**：C 在 `ChatMessage.tsx` 里用：

  ```tsx
  <MarkdownRenderer content={message.content} />
  <CopyButton text={message.content} />
  ```

  你的 props 接口必须匹配：`MarkdownRenderer({ content: string })`、`CopyButton({ text: string })`。

### 等 B（成员 B 的接口）

- **`http://localhost:8000/api/models` 的返回格式**：等 B 实现好 `GET http://localhost:8000/api/models`，返回 `[{id, name, provider, local}]`。在 B 没好之前，你可以用 mock 数据测试 `ModelSelector`：

  ```tsx
  // 临时 mock，B 好了删掉
  useEffect(() => {
    setModels([
      { id: 'ollama:qwen2.5:3b', name: 'Qwen2.5 3B', provider: 'ollama', local: true },
      { id: 'ollama:llama3.2:1b', name: 'Llama 3.2 1B', provider: 'ollama', local: true },
    ])
  }, [])
  ```

### 被 C 依赖

- **`ModelSelector` 的 props 接口**：必须稳定。如果 props 签名要改（比如加个 `disabled` 选项），**先和 C 沟通**，否则 C 的 `App.tsx` 会编译报错。
- **组件默认导出**：所有组件用 `export default`，C 用 `import ModelSelector from './components/ModelSelector'` 引入。不要用具名导出，保持一致。

### 协作时间线（参考）

| 时间 | 你要完成的 | 和谁对接 |
|------|-----------|---------|
| Day 1 | `tailwind.config.ts` + `globals.css` + `CopyButton` | 不用对接 |
| Day 2 | `MarkdownRenderer`（用 mock 数据测试） | 不用对接 |
| Day 3 | `ModelSelector`（先 mock，B 好了接真接口）+ UI 打磨 | 和 C 对接 props、和 B 对接接口 |

### 沟通清单

遇到这些情况，主动找人：

- 想改 `ModelSelector` 的 props 签名 → 找 C
- `http://localhost:8000/api/models` 返回的字段对不上 → 找 B
- `MarkdownRenderer` 渲染 AI 回复时格式不对 → 找 C（确认 content 是不是完整传过来了）
- 想改 `tailwind.config.ts` 的颜色名（比如 `bg-bg-primary` 改成 `surface-primary`）→ **不要改**，会牵动所有组件，和组长商量

---

## 附录：学习资源汇总

### 官方文档

| 技术 | 链接 |
|------|------|
| react-markdown | <https://github.com/remarkjs/react-markdown> |
| remark-gfm | <https://github.com/remarkjs/remark-gfm> |
| rehype-highlight | <https://github.com/rehypejs/rehype-highlight> |
| highlight.js（含主题预览） | <https://highlightjs.org/> |
| Tailwind CSS 中文 | <https://tailwindcss.cn> |
| Tailwind 主题配置 | <https://tailwindcss.cn/docs/theme> |
| React 官方中文 | <https://zh-hans.react.dev> |
| MDN Clipboard API | <https://developer.mozilla.org/zh-CN/docs/Web/API/Clipboard> |
| MDN textContent | <https://developer.mozilla.org/zh-CN/docs/Web/API/Node/textContent> |

### 中文教程

| 主题 | 链接 |
|------|------|
| react-markdown 教学指南（掘金） | <https://juejin.cn/post/7589171972446666794> |
| react-markdown 完全上手（掘金） | <https://juejin.cn/post/7515393471542312995> |
| react markdown 保姆级教程 | <https://www.exception.site/article/3587> |
| 流式 Markdown 渲染（博客园） | <https://www.cnblogs.com/aigent/p/19403810> |
| Tailwind 配置（官方中文） | <https://tailwind.org.cn/docs/configuration> |
| Tailwind 自定义颜色（官方中文） | <https://tailwind.org.cn/docs/customizing-colors> |
| Tailwind 主题配置（中文网） | <https://tailwind-v3.nodejs.cn/docs/theme> |
| 检测元素外部点击（ReactUse 中文） | <https://reactuse.com/zh-Hans/blog/detect-click-outside-react/> |
| React 下拉菜单（腾讯云） | <https://developer.cloud.tencent.cn/article/2476054> |
| highlight.js 中文网（主题预览） | <https://fenxianglu.cn/highlight.html> |
| Clipboard API 教程（阮一峰） | <https://www.ruanyifeng.com/blog/2021/01/clipboard-api.html> |
| Clipboard API（网道） | <https://wangdoc.com/webapi/clipboard> |
| 复制功能实现（Chanx） | <https://chanx.tech/blog/copy-with-vanilla-js> |

---

## 附录：自检清单

提交前对照这个清单检查：

- [ ] `tailwind.config.ts` 颜色都在 `theme.extend.colors` 下（不是 `theme.colors`）
- [ ] `globals.css` 的 `@import` 在 `@tailwind` 之前
- [ ] `MarkdownRenderer` 的代码块复制用 `useRef + textContent`（不是 children）
- [ ] `MarkdownRenderer` 的 `pre` 组件透传（`<>{children}</>`）
- [ ] `ModelSelector` 的 props 是 `{ model: string | null; onChange: (m: string) => void }`
- [ ] `ModelSelector` 的点击外部关闭用 `mousedown` + `useEffect` 清理函数
- [ ] `CopyButton` 复制失败用 `.catch(() => {})` 静默处理
- [ ] 所有组件用 `export default`
- [ ] 没有引入未安装的依赖
