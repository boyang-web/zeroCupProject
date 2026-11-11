"""Create reviewable complete/anonymous contest archives without changing source art."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
from PIL import Image
import datetime,hashlib,json,os,re,shutil,subprocess,sys,zipfile
sys.stdout.reconfigure(encoding='utf8')
ROOT=Path(__file__).resolve().parent.parent
STAMP=datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
OUT=ROOT/'submission'/STAMP;COMPLETE=OUT/'complete';ANON=OUT/'anonymous';PACK=OUT/'packages'
for p in [COMPLETE,ANON,PACK]:p.mkdir(parents=True,exist_ok=False)
def run(args,cwd=ROOT,log=None):
    r=subprocess.run(args,cwd=cwd,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    text=r.stdout.decode('utf8',errors='replace')
    if log:(OUT/log).write_text(text,encoding='utf8')
    if r.returncode:raise RuntimeError(text[-7000:])
    return text
BASE=run(['git','rev-parse','HEAD']).strip()
# Do not accidentally ship an uncommitted local gameplay variant.
if run(['git','status','--porcelain','--','src','public','tests','package.json','package-lock.json','index.html','tsconfig.json','vite.config.ts']).strip():
    raise RuntimeError('Commit or restore runtime changes before packaging.')
manifest=json.loads(run(['node','--experimental-strip-types','scripts/submission-assets.ts']))
def copy_file(src,dst):
    dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
for folder in ['src','tests']:
    shutil.copytree(ROOT/folder,COMPLETE/folder)
for name in ['package.json','package-lock.json','index.html','tsconfig.json','vite.config.ts','THIRD_PARTY_NOTICES.md']:
    copy_file(ROOT/name,COMPLETE/name)
for name in ['check-content.ts','export-story.ts','generate-soundscape.py','subset-fonts.py','local-preview.mjs','preview.py','serve.mjs']:
    copy_file(ROOT/'scripts'/name,COMPLETE/'scripts'/name)
# Only the isolated copy drops retired sample registrations.
asset_file=COMPLETE/'src/content/assets.ts';source=asset_file.read_text(encoding='utf8')
for id in manifest['excludedIds']:
    source=re.sub(r'^  '+re.escape(id)+r': placeholder\([^\n]*\),\r?\n','',source,flags=re.M)
asset_file.write_text(source,encoding='utf8')
def convert(name):
    src=ROOT/'public'/name;target=COMPLETE/'public'/name
    if src.suffix.lower()=='.png':
        target=target.with_suffix('.webp');target.parent.mkdir(parents=True,exist_ok=True)
        with Image.open(src)as im:
            dimensions=im.size;im.save(target,'WEBP',quality=82,method=6,exact=True)
        with Image.open(target)as result:assert result.size==dimensions
    else:copy_file(src,target)
    return {'source':name,'file':str(target.relative_to(COMPLETE)).replace('\\','/'),'originalBytes':src.stat().st_size,'bytes':target.stat().st_size}
records=[]
with ThreadPoolExecutor(max_workers=4)as pool:
    futures=[pool.submit(convert,name)for name in manifest['files']]
    for future in as_completed(futures):
        records.append(future.result())
        if len(records)%12==0:print('Prepared assets',len(records),'/',len(futures),flush=True)
for path in (COMPLETE/'src').rglob('*'):
    if path.suffix in ['.ts','.vue','.css']:path.write_text(path.read_text(encoding='utf8').replace('.png','.webp'),encoding='utf8')
# Remove local original/computer paths from newly authored provenance. Team originals are not shipped.
(COMPLETE/'public/assets/fonts/README.md').write_text('# 字体\n\nBaiweiHand 与 BaiweiTitle 为本地字体子集。保留两份随附 OFL 许可及第三方版权，未改字体字形比例。\n',encoding='utf8')
package=json.loads((COMPLETE/'package.json').read_text(encoding='utf8'));package['scripts'].pop('package:submission',None);(COMPLETE/'package.json').write_text(json.dumps(package,ensure_ascii=False,indent=2),encoding='utf8')
license_dir=COMPLETE/'third_party_licenses';license_dir.mkdir()
for name in ['vue','three','gsap','vite','typescript','@vitejs/plugin-vue','vue-tsc','@types/three']:
    folder=ROOT/'node_modules'/name
    candidates=[p for p in folder.iterdir()if p.is_file()and re.match(r'(?i)(license|licence|copying|copyright)',p.name)]
    for candidate in candidates:copy_file(candidate,license_dir/(name.replace('/','-')+'-'+candidate.name))
library_rows=[]
purposes={'vue':'界面组件与响应式状态','three':'物件三维渲染','gsap':'动画与转场','vite':'开发与构建','typescript':'类型检查','@vitejs/plugin-vue':'Vue 组件编译','vue-tsc':'Vue 类型检查','@types/three':'三维类型定义'}
for name,purpose in purposes.items():
    p=json.loads((ROOT/'node_modules'/name/'package.json').read_text(encoding='utf8'));library_rows.append('| '+name+' | '+p['version']+' | '+purpose+' | '+str(p.get('license','随项目许可'))+' |')
libraries='| 库 | 版本 | 用途 | 许可 |\n| --- | --- | --- | --- |\n'+'\n'.join(library_rows)
# Share the approved product copy with the development README.
readme=(ROOT/'docs/submission/README-产品与技术.md').read_text(encoding='utf8')+'\n'+"""{team}

## 直接运行

安装 Node.js 24.15 或更新版本，在本目录执行：

    node scripts/serve.mjs dist

浏览器打开 http://127.0.0.1:4173/ 。也可双击 RUN.bat（Windows）或运行 RUN.command（macOS）。不要用 file 协议直接打开 HTML。运行内置成品无需下载依赖。

## 源码运行与检查

    npm ci
    npm run dev
    npm run typecheck
    npm run check:content
    npm test
    npm run build

源码与成品所需素材均随包提供；运行资源已裁剪并转换为等尺寸 WebP，原始素材不在包内。小游戏只返回结果，由统一规则发奖励；领域规则不依赖 DOM。内容 v6、状态 v3，自动与手动存档、回访、章节重玩均保留。

## 交付目录

- `src/`：正式源码，按规则、内容、运行装配、功能、表现和适配分层。
- `public/assets/`：源码构建所需资源与字体许可。
- `dist/`：可直接启动的生产成品。
- `tests/`：规则、分支与存档测试。
- `scripts/`：检查、文本导出、素材生成和本地服务。
- `docs/`：设计、架构验证、素材披露与提示词。
- `third_party_licenses/`：第三方库许可原文。
- 根目录：README、第三方说明、锁文件、构建配置及双平台启动入口。

## 操作

点场景人物和独立物件，翻看、拖动或交谈。对白窗口点按或空格／回车补全、继续，回答须明确选择。纸本、手机等长文仅在正文区滚动。Tab 选择控件，Enter 确认，Esc 返回。引子保留自然滚动与物件操作；已有存档可翻开首页的书续读。

左下为任务、百味录、随身物和走访，菜单含图鉴、设置及存读档。设置支持音乐、音效、静音、减少动画、全屏及章节重玩。进度保存在当前浏览器，换端口会使用不同存档，可先导出备份。

## 第三方库

{libraries}

未使用预设样式库，无后端或 CMS。Node.js 用于本地构建和静态服务；字体采用 LXGW WenKai / Noto Serif SC 的本地 WOFF 子集，保留 OFL 许可。图像使用 AI 图像工具，音乐／音效为原创合成，更多登记见 [第三方说明](THIRD_PARTY_NOTICES.md) 与 [素材说明](docs/素材与工具说明.md)。

## 文档与验证

[设计说明](docs/设计说明.md)、[架构与验证](docs/架构与验证.md)。源码、运行资源、生产版 dist、tests 和文档均齐全；没有 .git、node_modules 或旧工程归档。

构建目标 Chrome 129；实际核验的浏览器版本及视口在文档中单独记录。未声称已覆盖 IE、Safari、全部手机硬件与屏幕阅读器。
"""
team='## 队伍信息\n\n队伍：风栖林；组别：壹组。队长：蔺博洋；队员：王子萌。'
(COMPLETE/'README.md').write_text(readme.format(team=team,libraries=libraries),encoding='utf8')
docs=COMPLETE/'docs';docs.mkdir()
(docs/'设计说明.md').write_text("""# 百味录设计说明

## 从一顿饭走进一条巷子

主题为市井烟火·百味人间。小满失业后回到虚构的长明巷，替奶奶续写一本旧食谱。方子串起行程，人的日子在营业、做饭、等饭和说不完的话中展开。人物各有生活与决定，不以小满替所有人调解成功作为唯一答案。

第一章在奶奶家接委托，第二章在陈家包子铺学做早饭，第三章在琴记理清堂食与接单，第四章在夜饭小馆处理留餐与回信，第五章回到灯下，与奶奶明确选择早餐、通话或留书。三店的结果分别保留，最终选择不会按前面成功数量自动评分。

## 交互与阅读

全视口场景使用独立人物、物件与前景，通路固定在左右边缘。教学只聚焦眼前目标；无关对象暂时不可操作，收起便能自由看。对白整框补全与继续，末句不替玩家选回答。信纸展开、照片翻面、茶杯和凳子移动都围绕实物，单一结果不再弹第二个确认。

百味录直接打开可读纸页，食谱与人生片段分开。每个人间百味纸面是一篇完整的小事，读到的版本跟实际经历一致；未听过的私话不会凭任务结算自动写出。长文滚动只作用于正文，边框、物件与翻页入口保持固定。

## 手作感与节奏

木框、细纤维纸、等比例的独立桂花和本地字体组成暖木视觉。首页书本、手机、旅行包、车票和门环可直接操作；引子以原生滚动带动景物、枝叶、光影及落花，没有目录和文字滑动教程。游戏主体常用入口集中在左下，以正方形木制控件保持统一。

原创合成轻配乐分家中、白天小馆、夜饭三种气氛，换房间不重启同一主题，切主题淡化衔接。音乐和音效分开调节；对白正文与逐字显示不持续发声。减少动画保留全部操作，移除循环飘落和长等待。

## 实现与评审

内容与领域规则分开，素材替换不要求重写剧情条件。三家店均有正常与未达成的局部结果，回访保留实际动作，章节重玩经明确确认重新开始。素材由独立生成图与代码原件组成，未使用预设样式库。当前版本仍可继续进行文学与美术评审，不把自动测试数量当作叙事质量结论。
""",encoding='utf8')
(docs/'架构与验证.md').write_text('# 架构与验证\n\ncore 为纯状态与命令规则；content 描述剧情、条件和资产；runtime 连接存档；features 与 presentation 负责界面、物件和输入；infrastructure 适配声音和存储。\n\n本次源码自动检查与隔离打包检查分别记录。生产构建目标 Chrome 129，实际浏览器矩阵结果随后写入本文件；目标设置不等于已对该版本实测。运行可直接使用 dist，开发检查使用 npm ci 后的脚本。无后端、账号或云端存档。\n',encoding='utf8')
(docs/'素材与工具说明.md').write_text('# 素材与工具说明\n\n插画与透明物件使用内置图像生成工具，并由程序分层、裁切引用；物件、框角、字体和桂花不拉伸变形。SVG 单据、线轴、落花、窗影和部分三维物件由代码构建。音乐与音效为原创合成，生成脚本随包。所有 PNG→WebP 转换仅发生在打包副本，保持尺寸与透明通道。\n\n字体保留 SIL OFL 原文；第三方库许可见根目录说明与 third_party_licenses。以下为当前运行资产登记，不包含旧占位或其他工程素材。\n\n'+'\n'.join('- '+id+'：'+a['label']+'；'+a['source'].split('，见')[0].split('见 docs/')[0]for id,a in manifest['assets'].items()),encoding='utf8')
(COMPLETE/'RUN.bat').write_text('@echo off\ncd /d "%~dp0"\nnode scripts\\serve.mjs dist\nif errorlevel 1 pause\n',encoding='ascii')
(COMPLETE/'RUN.command').write_text('#!/bin/sh\ncd "$(dirname "$0")"\nnode scripts/serve.mjs dist\n',encoding='utf8')
(COMPLETE/'RUN.command').chmod(0o755)
# Reuse installed dependencies only for the staging checks; never put the junction in archives.
link=COMPLETE/'node_modules'
if os.name=='nt':run(['cmd','/c','mklink','/J',str(link),str(ROOT/'node_modules')])
else:link.symlink_to(ROOT/'node_modules',target_is_directory=True)
for name,args in [('typecheck',['npm.cmd'if os.name=='nt'else'npm','run','typecheck']),('content',['node','--experimental-strip-types','scripts/check-content.ts']),('tests',['npm.cmd'if os.name=='nt'else'npm','test']),('build',['npm.cmd'if os.name=='nt'else'npm','run','build'])]:
    print('Staging check:',name,flush=True);run(args,COMPLETE,name+'.log')
shutil.copytree(COMPLETE,ANON,ignore=shutil.ignore_patterns('node_modules','*.tsbuildinfo'),dirs_exist_ok=True)
(ANON/'README.md').write_text(readme.format(team='',libraries=libraries),encoding='utf8')
report={'sourceCommit':BASE,'testCount':int(re.search(r'(?:#|ℹ) tests (\d+)',(OUT/'tests.log').read_text(encoding='utf8')).group(1)),'directory':str(OUT.relative_to(ROOT)),'assets':sorted(records,key=lambda r:r['file']),'checks':['typecheck','content','tests','build'],'files':{},'packages':{}}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('STAGING_READY '+str(OUT),flush=True)
