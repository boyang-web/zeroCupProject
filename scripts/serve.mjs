import {createServer} from 'node:http';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.argv[2]??'dist');
const portIndex=process.argv.indexOf('--port'),port=portIndex<0?4173:Number(process.argv[portIndex+1]);
if(!Number.isInteger(port)||port<1024||port>65535||!existsSync(resolve(root,'index.html')))throw Error('Choose a valid port and a built directory containing index.html.');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.wav':'audio/wav','.ogg':'audio/ogg','.mp3':'audio/mpeg','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method??'')){res.writeHead(405).end();return;}
  let name=decodeURIComponent(new URL(req.url??'/', 'http://localhost').pathname),file=resolve(root,'.'+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  if(existsSync(file)&&statSync(file).isDirectory())file=resolve(file,'index.html');
  if(!existsSync(file)){if(extname(name)){res.writeHead(404).end('Not found');return;}file=resolve(root,'index.html');}
  const size=statSync(file).size,headers={'Content-Type':mime[extname(file)]??'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
  const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range??'');
  if(match){const start=Number(match[1]),end=Math.min(Number(match[2]||size-1),size-1);if(start>end||start>=size){res.writeHead(416,{'Content-Range':'bytes */'+size}).end();return;}res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':'bytes '+start+'-'+end+'/'+size});if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);}
  else{res.writeHead(200,{...headers,'Content-Length':size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
 }catch{res.writeHead(400).end('Bad request');}
}).listen(port,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:'+port+'/'));
