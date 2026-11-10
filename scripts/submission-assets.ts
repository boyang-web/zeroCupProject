import{content}from'../src/content/index.ts';
const excluded=new Set(['street','shops','night','model','ambience']);
const assets=Object.fromEntries(Object.entries(content.assets).filter(([id])=>!excluded.has(id)));
const files=[...new Set(Object.values(assets).map(a=>a.url.replace(/^[./]+/,'')))];
files.push('assets/fonts/BaiweiHand.woff','assets/fonts/BaiweiTitle.woff','assets/fonts/LXGWWenKai-OFL.txt','assets/fonts/NotoSerifSC-OFL.txt','assets/fonts/README.md','assets/audio/manifest.json','assets/audio/README.md');
console.log(JSON.stringify({assets,files:[...new Set(files)],excludedIds:[...excluded],contentVersion:content.version}));
