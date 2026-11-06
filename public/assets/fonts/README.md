# 百味录本地字体

- 原字体：霞鹜文楷 LXGW WenKai Regular。
- 来源：https://github.com/lxgw/LxgwWenKai/tree/main/fonts/TTF 。
- 许可证：同目录 LXGWWenKai-OFL.txt，保留原作者及 SIL OFL 1.1 信息。
- BaiweiHand.woff：本项目已有中文内容与界面字符的子集，用于手记、对白和控件。
- BaiweiTitle.woff：书名与街名子集，供首页优先加载。

子集内部名称已改为 BaiweiHand / BaiweiTitle。页面不依赖远程字体服务；未收录的新字回退到系统楷体或宋体。

更新内容后，将官方原字体放到工作区 `.tmp/fonts/LXGWWenKai-Regular.ttf`，运行 `python scripts/subset-fonts.py` 更新。原始字体保持不变。脚本使用 FontTools，输出 WOFF，不要求额外的 Brotli 依赖。
