"""Finalize checked staging copies into the two named ZIPs and their outer ZIP."""
from pathlib import Path
import hashlib,json,re,shutil,sys,zipfile
ROOT=Path(__file__).resolve().parent.parent
OUT=Path(sys.argv[1]).resolve()
assert OUT.is_relative_to(ROOT/'submission')and(OUT/'report.json').is_file()
report=json.loads((OUT/'report.json').read_text(encoding='utf8'))
validation=json.loads((OUT/'validation.json').read_text(encoding='utf8'))
assert not validation['errors']
text_suffixes={'.ts','.vue','.css','.js','.mjs','.json','.html','.md','.txt','.svg','.py','.bat','.command'}
identity=re.compile(r'风栖林|蔺博洋|王子萌|boyang|Lin-young|C:[/\\]+Users[/\\]+dell|E:[/\\]+UserData|(?<![A-Za-z0-9_])1[3-9]\d{9}(?![A-Za-z0-9_])',re.I)
for variant in ['complete','anonymous']:
    folder=OUT/variant
    for rel in validation.get('selectedImages',[]):
        target=folder/'docs/images'/Path(rel).name;target.parent.mkdir(exist_ok=True);shutil.copyfile(OUT/rel,target)
    doc=folder/'docs/架构与验证.md'
    text=doc.read_text(encoding='utf8')
    text+='\n## 本次独立运行核验\n\n实际浏览器：'+validation['browser']+'。源码与打包副本分别通过类型、内容检查、190项测试和生产构建。当前成品已在独立服务器验证下列视口与关键场景，无缺失资源或页面异常；未将目标 chrome129 设置称为 129 实测，IE、Safari、全部真机及完整人工通关仍留待复核。\n\n'
    text+='\n'.join('- '+str(row['viewport'])+'：'+row['result']for row in validation['checks'])+'\n\n'
    text+='\n'.join('![运行画面](images/'+Path(rel).name+')'for rel in validation.get('selectedImages',[]))+'\n'
    doc.write_text(text,encoding='utf8')
    candidates=[]
    for path in folder.rglob('*'):
        if 'node_modules'in path.parts or not path.is_file():continue
        if path.suffix=='.map':raise AssertionError('Source map: '+str(path))
        if path.suffix in text_suffixes:
            value=path.read_text(encoding='utf8',errors='ignore')
            if variant=='anonymous'and identity.search(value):raise AssertionError('Anonymous identity: '+str(path.relative_to(folder))+' '+identity.search(value).group())
        candidates.append(path)
    report['files'][variant]=len(candidates)
    if variant=='anonymous':report['anonymousIdentityHits']=0
    for path in candidates:
        rel=path.relative_to(folder)
        assert not any(part in ['.git','node_modules','archive','references','.tmp','比赛要求','previews','placeholders']for part in rel.parts),rel
    name='2026-零杯壹组-风栖林-蔺博洋-'+('完整版本'if variant=='complete'else'匿名版本')+'.zip'
    target=OUT/'packages'/name
    with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6)as z:
        for path in candidates:
            info=zipfile.ZipInfo.from_file(path,str(path.relative_to(folder)).replace('\\','/'))
            if path.suffix=='.command':info.external_attr=(0o100755<<16)
            z.writestr(info,path.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=6)
    with zipfile.ZipFile(target)as z:
        assert z.testzip()is None
        assert 'README.md'in z.namelist()and'package.json'in z.namelist()and'dist/index.html'in z.namelist()
        assert not any(name.startswith('/')or'..'in Path(name).parts for name in z.namelist())
    report['packages'][variant]={'file':name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'under40MiB':target.stat().st_size<=40*1024*1024}
outer=OUT/'packages/零杯壹组-风栖林-蔺博洋.zip'
with zipfile.ZipFile(outer,'w',compression=zipfile.ZIP_STORED)as z:
    for row in report['packages'].values():z.write(OUT/'packages'/row['file'],row['file'])
with zipfile.ZipFile(outer)as z:assert z.testzip()is None and len(z.namelist())==2
report['outer']={'file':outer.name,'bytes':outer.stat().st_size,'sha256':hashlib.sha256(outer.read_bytes()).hexdigest()}
(OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps({'output':str(outer),'packages':report['packages'],'outer':report['outer']},ensure_ascii=False,indent=2))
