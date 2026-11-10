# 第三方库、字体与工具

未使用 Bootstrap、Vue Elements 等预设样式库，无后端或 CMS。以下版本以当前 package-lock.json 为准。

| 名称 | 版本 | 用途 | 许可 |
| --- | --- | --- | --- |
| Vue | 3.5.44 | 组件和响应式界面 | MIT |
| Three.js | 0.180.0 | 独立物件三维渲染 | MIT |
| GSAP | 3.15.1 | 相机、开合、光影与转场 | [Standard “No Charge” License](https://gsap.com/community/standard-license/) |
| Vite | 8.3.5 | 开发预览与生产构建 | MIT |
| TypeScript | 5.9.3 | 类型与源码检查 | Apache-2.0 |
| @vitejs/plugin-vue | 6.0.10 | Vue 单文件组件编译 | MIT |
| vue-tsc | 3.3.14 | Vue 类型检查 | MIT |
| @types/three | 0.180.0 | Three.js 类型定义 | MIT |
| Node.js | ≥24.15.0 | 构建、测试与本机静态服务 | Node.js License |
| LXGW WenKai / Noto Serif SC | 本地 WOFF 子集 | 正文和标题字体 | SIL OFL 1.1 |

字体许可原文见 public/assets/fonts/LXGWWenKai-OFL.txt 与 NotoSerifSC-OFL.txt；保留第三方版权署名。参赛包额外收录可随已安装依赖取得的许可原文，位于 third_party_licenses。GSAP 许可链接按官方当前页面登记，不将它标作 MIT。

图像使用内置图像生成工具，并有独立提示词与来源登记；交互、SVG 图形与布局由工程代码实现。场景音乐和音效为本项目原创合成，生成代码为 scripts/generate-soundscape.py。打包期 PNG→WebP 仅在 staging 副本执行，使用 Pillow，正常运行不依赖 Python 或 Pillow。
