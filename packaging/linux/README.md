# Nook Linux 安装说明

当前安装包适用于 64 位 x86 Linux。Nook 需要 Ollama 提供本地模型服务。

## 安装

解压安装包并运行安装脚本：

```bash
tar -xzf nook-linux-x64.tar.gz
cd Nook-linux-x64
./install.sh
```

脚本会把 Nook 安装到 `~/.local/share/nook`，创建应用菜单入口，并在系统没有 Ollama 时询问是否安装。它不会重复安装已有的 Ollama。

## 启动

从应用菜单打开 Nook，或者运行：

```bash
~/.local/share/nook/Nook
```

如果 Ollama 没有自动启动，可运行：

```bash
ollama serve
```

检查 Ollama 服务：

```bash
curl http://localhost:11434/api/version
```

模型可以直接在 Nook 顶部的模型选择器中下载。

## 常见问题

如果提示 `chrome-sandbox` 权限错误，可执行：

```bash
sudo chown root:root ~/.local/share/nook/chrome-sandbox
sudo chmod 4755 ~/.local/share/nook/chrome-sandbox
```

然后重新启动 Nook。
