# Git 协作流程

## 一、准备环境

### 1. 安装 Git

去 https://git-scm.com/downloads 下载对应系统的安装包，一路下一步装好。

安装完成后，打开终端（Windows 用 Git Bash，Mac/Linux 用系统终端），验证：

```bash
git --version
```

能看到版本号就说明装好了。

### 2. 注册 GitHub 账号

去 https://github.com 注册一个账号。

### 3. 配置 Git 身份

装完 Git 后，先告诉它你是谁（每次提交代码会带上你的名字）：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的GitHub邮箱"
```

### 4. 配置 SSH 连接 GitHub

每次推送代码都要输密码很烦，配置 SSH 密钥后就不用了。

教程：[如何使用 SSH 连接 GitHub 仓库](https://blog.locxl.site/posts/%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8ssh%E8%BF%9E%E6%8E%A5github%E4%BB%93%E5%BA%93/)

### 5. 接受组长邀请

组长会在 GitHub 仓库的 `Settings` → `Collaborators` 里邀请你。

你会收到一封邮件，点里面的链接接受邀请。也可以直接访问仓库地址，会看到邀请提示。

接受后你就有了这个仓库的推送权限。

---

## 二、克隆仓库

### 命令行方式

```bash
# 克隆仓库到本地（SSH 方式）
git clone git@github.com:sokx6/Nook.git

# 进入项目目录
cd Nook
```

### VS Code 方式

1. 打开 VS Code
2. 按 `Ctrl+Shift+P`（Mac 是 `Cmd+Shift+P`），输入 `git clone`
3. 选 `Git: Clone`
4. 粘贴仓库地址：`git@github.com:sokx6/Nook.git`
5. 选一个本地文件夹存放
6. 克隆完成后 VS Code 会问是否打开，点「打开」

---

## 三、分支策略

每人一个分支，代码审批后先合并到 dev，测试通过后再合并到 main：

```
main（最终发布版本，组长维护）
  └── dev（开发集成分支，组长审批后合并到 main）
        ├── backend-a（成员 A）
        ├── backend-b（成员 B）
        ├── frontend-c（成员 C）
        └── frontend-d（成员 D）
```

- **你的分支**：你写代码的地方，随便改
- **dev 分支**：所有人的代码汇总到这里，组长审批你的 PR 后合并到 dev
- **main 分支**：dev 测试通过后，组长再合并到 main，main 随时能跑

### 创建自己的分支

克隆完成后，第一件事是创建自己的分支：

**命令行：**

```bash
# 从 dev 创建并切换到你的分支
git checkout -b backend-a
```

**VS Code：**

1. 看 VS Code 左下角，会显示当前分支名（通常是 `dev`）
2. 点一下分支名
3. 在顶部弹出的输入框里输入你的分支名（比如 `backend-a`）
4. 选 `Create new branch: backend-a`

---

## 四、日常开发流程

每天重复以下步骤：

### 第 1 步：拉取 dev 最新代码

每天开始干活前，先把 dev 的最新代码拉下来，保证自己在最新版本上开发。

**命令行：**

```bash
# 先切到 dev
git checkout dev

# 拉取远程 dev 的最新代码
git pull origin dev

# 切回自己的分支
git checkout backend-a

# 把 dev 的更新合并到你的分支
git merge dev
```

**VS Code：**

1. 点左下角分支名，切换到 `dev`
2. 点左边栏第三个图标（源代码管理，图标像分叉的树）
3. 点「...」→ 「拉取」（Pull）
4. 切回自己的分支（点左下角分支名切换）
5. 点「...」→ 「合并分支」→ 选 `dev`

### 第 2 步：写代码

正常写代码，该改文件改文件，该建文件建文件。

### 第 3 步：提交代码

写完一个功能后，提交到你的分支。

**命令行：**

```bash
# 查看改了哪些文件
git status

# 把所有改动加入暂存区
git add .

# 提交，写清楚做了什么
git commit -m "完成 db.py 数据库 CRUD 函数"

# 推送到远程你的分支
git push origin backend-a
```

**VS Code（推荐，图形化更直观）：**

1. 点左边栏第三个图标（源代码管理）
2. 看到改动的文件列表：
   - **绿色 U**（Untracked）：新文件，还没被 Git 跟踪
   - **黄色 M**（Modified）：改过的文件
   - **红色 D**（Deleted）：删掉的文件
3. 把要提交的文件点一下 `+` 号（暂存），或者全选点 `+`
4. 在上方输入框写提交信息，比如：`完成 db.py 数据库 CRUD 函数`
5. 点「提交」按钮（打勾图标），或按 `Ctrl+Enter`
6. 点「同步更改」或「推送」按钮，把代码推到 GitHub

### VS Code 源代码管理面板详解

```
源代码管理面板
├── 消息输入框          ← 在这里写提交信息
├── 提交按钮（勾）      ← 点这个提交
├── 刷新按钮            ← 刷新文件状态
├── ... 菜单            ← 更多操作
│   ├── 拉取 (Pull)     ← 从远程拉最新代码
│   ├── 推送 (Push)     ← 推送到远程
│   ├── 同步 (Sync)     ← 先拉再推
│   ├── 合并分支        ← 把别的分支合并进来
│   ├── 检出到...       ← 切换分支
│   └── 丢弃所有更改    ← 慎用，会丢代码
├── 暂存的更改          ← 已 git add 的文件
│   └── 文件列表        ← 每个文件可以点 - 撤回
├── 更改                ← 改了但还没 add 的文件
│   └── 文件列表        ← 每个文件可以点 + 暂存
└── 文件内容            ← 点文件可以看改了什么（diff 视图）
```

**查看改动内容：** 点一个改过的文件，VS Code 会打开 diff 视图：左边是旧代码（红色背景表示删除），右边是新代码（绿色背景表示新增），一目了然。

---

## 五、发起 Pull Request（PR）

当你的一个功能写完了，想合并到 dev 时：

### 在 GitHub 网页上操作

1. 打开仓库网页
2. 点 `Pull requests` 标签
3. 点 `New pull request`
4. 左边选 `dev`（目标分支），右边选你的分支（比如 `backend-a`）
5. 点 `Create pull request`
6. 写标题和说明（比如「完成 db.py，包含建表和 7 个 CRUD 函数」）
7. 点 `Create pull request` 提交

### 组长审查

组长会收到通知，在 GitHub 上审查你的代码：
- 可以逐文件看改了什么
- 可以在具体行上写评论
- 没问题 → 点 `Merge pull request` 合并到 dev
- 有问题 → 在 PR 里评论，你改完再推送（PR 会自动更新）

### dev 到 main

dev 分支上的代码测试通过后，组长会在 GitHub 上发起一个 `dev → main` 的 PR，审查无误后合并到 main。main 分支随时保持可运行状态。

### 你改完代码后更新 PR

如果组长审查后让你改，你不需要重新提 PR：

```bash
# 在你的分支上继续改
git add .
git commit -m "修复 xxx 问题"
git push origin backend-a
```

PR 会自动更新，组长再审查一次。

---

## 六、冲突处理

当你的分支和 dev 有冲突时（比如两个人改了同一个文件），合并或 PR 时会报冲突。

### 命令行解决

```bash
# 合并 dev 时出现冲突
git merge dev

# Git 会告诉你哪些文件冲突了
git status

# 打开冲突文件，会看到：
<<<<<<< HEAD
你的代码
=======
dev 的代码
>>>>>>> dev

# 手动编辑：删掉冲突标记，保留正确的代码
# 改完后：
git add 冲突文件
git commit -m "解决冲突"
```

### VS Code 解决（推荐）

VS Code 在遇到冲突时会提供按钮帮你选：

1. 合并时出现冲突，VS Code 会弹出提示
2. 打开冲突文件，每个冲突处会显示：
   - `Accept Current Change`（用你的代码）
   - `Accept Incoming Change`（用 dev 的代码）
   - `Accept Both Changes`（两边都保留）
   - `Compare Changes`（对比查看）
3. 选一个，或者手动编辑
4. 改完后点「提交」完成合并

---

## 七、常见问题

### Q: 推送时报错 `permission denied`

你没接受组长的邀请，或者用错了 GitHub 账号。去仓库网页看看自己是不是 Collaborator。

### Q: 推送时报错 `rejected - non-fast-forward`

远程有你本地没有的更新。先 `git pull` 拉下来再推。

**VS Code：** 点「同步」按钮，它会自动先拉再推。

### Q: 不小心提交了不该提交的文件

```bash
# 从暂存区移除（文件还在，只是不提交）
git rm --cached 文件名

# 如果已经提交了，撤销最后一次提交（代码不丢）
git reset --soft HEAD~1
```

### Q: 想撤销今天的所有改动

```bash
# 慎用！这会丢掉所有未提交的改动
git checkout .
```

**VS Code：** 源代码管理面板 → 「...」→ 「丢弃所有更改」

### Q: 想回到之前的某个版本

```bash
# 查看提交历史
git log --oneline

# 回到某个版本（不影响历史）
git checkout 提交哈希前几位
```

**VS Code：** 源代码管理面板 → 「...」→ 「Git: View History」→ 选一个版本点回去。

---

## 八、VS Code Git 速查

| 操作 | VS Code 方式 |
|------|-------------|
| 切换分支 | 点左下角分支名 |
| 查看改了什么 | 左边栏源代码管理图标，点文件看 diff |
| 暂存文件（add） | 文件旁的 `+` 号 |
| 取消暂存 | 文件旁的 `-` 号 |
| 提交（commit） | 写消息 → `Ctrl+Enter` |
| 推送（push） | 点「同步更改」或「推送」 |
| 拉取（pull） | 源代码管理 → 「...」→ 「拉取」 |
| 合并分支 | 源代码管理 → 「...」→ 「合并分支」 |
| 查看历史 | 源代码管理 → 「...」→ 「View Git Log」 |
| 解决冲突 | 打开冲突文件，点 Accept 按钮选择 |
| 新建分支 | 点左下角分支名 → 输入新名字 |

---

## 九、每日流程总结

```
1. git checkout dev && git pull        ← 拉 dev 最新代码
2. git checkout 你的分支                ← 切回自己分支
3. git merge dev                        ← 合并 dev 更新
4. 写代码                               ← 正常开发
5. git add . && git commit -m "xxx"     ← 提交
6. git push origin 你的分支              ← 推送
7. 在 GitHub 发 PR（你的分支 → dev）     ← 请组长审批
8. 组长审批后合并到 dev                   ← dev 测试通过后组长再合并到 main
```

VS Code 对应操作：切分支 → 拉取 → 合并 → 写代码 → 暂存 → 提交 → 推送 → 网页提 PR。
