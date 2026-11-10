#!/bin/bash
# Finder 双击时也从工程目录启动，不依赖终端的工作目录或 PATH。
cd -- "$(dirname -- "$0")" || exit 1
if [ -x "$PWD/.tools/node-v24.15.0-darwin-arm64/bin/node" ]; then
  export PATH="$PWD/.tools/node-v24.15.0-darwin-arm64/bin:$PATH"
else
  export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
fi
fail() {
  echo "$1"
  read -r -p '按回车键关闭窗口……'
  exit 1
}
command -v node >/dev/null 2>&1 || fail '未找到 Node.js，请先安装 Node.js 24.15 或更高版本。'
node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>24 || (a===24 && b>=15) ? 0 : 1)' || fail '需要 Node.js 24.15 或更高版本。'
command -v npm >/dev/null 2>&1 || fail '未找到 npm，请检查 Node.js 安装。'
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo '首次启动，正在安装依赖……'
  npm ci --cache .npm-cache --no-audit --no-fund || fail '依赖安装失败，请检查网络后重试。'
fi
echo '百味录正在启动；游玩期间请保留此终端窗口，按 Ctrl+C 停止服务。'
npm run preview:local -- "$@"
result=$?
if [ "$result" -ne 0 ]; then fail '启动失败，请查看上方错误信息。'; fi
