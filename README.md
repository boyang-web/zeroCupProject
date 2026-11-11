# 百味录

以归乡、街巷和三家小馆为背景的五章网页叙事游戏。正式源码在 `src/`；根目录为当前开发工程，历史副本和原件已分类收纳。

## 比赛提交

**可上交的附件：[零杯壹组-风栖林-蔺博洋.zip](零杯壹组-风栖林-蔺博洋.zip)**（74.48 MiB）。内含完整、匿名两个子压缩包，均提供源码、可运行成品、测试、设计说明和许可。

总包已通过匿名扫描、逐层解压及独立运行验证。详细记录见 [比赛提交验收记录](docs/engineering/比赛提交验收记录.md)。后续修改游戏后须重新打包，再替换根目录附件。

## 本地启动

需要 Node.js 24.15 或更新版本。

```sh
npm ci
npm run dev
```

macOS 可双击 `START.command`；Windows 可在安装依赖后双击 `START.bat`。本机独立浏览器预览使用 `npm run preview:local`。

```sh
npm run build
node scripts/serve.mjs dist
```

成品通过终端打印的 localhost 地址打开，不直接双击 HTML。比赛子包自带 dist，安装 Node 后即可运行，无需先安装依赖。

## 目录导航

| 位置 | 内容 |
| --- | --- |
| `src/` | 正式源码：规则、剧情、运行装配、界面和适配 |
| `public/assets/` | 正式运行素材与字体许可；原图保留 |
| `tests/` | 规则、分支与存档测试 |
| `scripts/` | 内容检查、素材工具、构建预览和比赛打包 |
| `docs/` | 策划、设计、工程记录与素材来源 |
| `references/competition/` | 比赛选手手册、评分 PPT 原件，仅本地保存 |
| `archive/original-packages/` | 原始归档 ZIP，仅本地保存 |
| `archive/local-snapshots/` | 此前的本地版本副本，仅供追溯，不作为开发入口 |
| `submission/` | 比赛打包副本、检查日志、截图、解压验收与子包 |
| `dist/` | 本机生成的生产成品 |
| `node_modules/` | 本机依赖，由 npm 安装 |

根目录的 `package.json`、锁文件、`index.html`、TypeScript/Vite 配置及 `START` 脚本是标准工程入口，保留原位。`.tmp/`、`.npm-cache/`、`.tools/` 为隐藏的本机工作目录，不进入比赛包。

## 检查与协作

```sh
npm run typecheck
npm run check:content
npm test
npm run build
```

当前内容 v6、状态 v3。存档在浏览器本地，可导入导出；开发测试工具通过设置、F8 或 `?dev=1` 开启，测试档与正常进度分离。

开始开发先读 [AGENTS.md](AGENTS.md)、[开发原则与协作约定](docs/开发原则与协作约定.md) 和 [架构与边界](docs/engineering/架构与边界.md)。更多内容见 [文档索引](docs/README.md)、[交付规范](docs/engineering/项目结构与交付规范.md) 与 [第三方说明](THIRD_PARTY_NOTICES.md)。原 README 的详细进度与历史说明保存在 [历史入口记录](docs/history/根目录说明-20261111.md)。
