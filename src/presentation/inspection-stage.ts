import * as T from 'three';
import { gsap } from 'gsap';
import { createInspectionModel } from './inspection-models';
import type { ObjectModelKind } from '../content/object-models';
import type { Asset } from '../core/contracts';

export function createInspectionStage(host: HTMLElement, kind: ObjectModelKind, reduced: () => boolean, art?: Asset) {
  const renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0); renderer.domElement.setAttribute('aria-hidden','true');
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(32, 1, .1, 50);
  scene.add(new T.HemisphereLight('#fff1d8','#514938',2.5));
  const key = new T.DirectionalLight('#ffe1ad',3); key.position.set(-3,4,6); scene.add(key);
  const rim = new T.DirectionalLight('#d7e3de',2); rim.position.set(4,1,-3); scene.add(rim);
  let reflectionTarget:T.WebGLRenderTarget|undefined;
  if(kind==='phone'){
    // A procedural softbox environment: no scene photograph or screen image is loaded.
    const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d')!;
    ctx.fillStyle='#111718';ctx.fillRect(0,0,c.width,c.height);
    for(const [x,y,rx,ry,opacity] of [[260,190,78,185,.8],[720,230,140,210,.45],[480,70,240,40,.25]]){
      ctx.save();ctx.translate(x!,y!);ctx.scale(rx!,ry!);const glow=ctx.createRadialGradient(0,0,0,0,0,1);
      glow.addColorStop(0,`rgba(235,240,237,${opacity})`);glow.addColorStop(.45,`rgba(220,228,225,${opacity!*.6})`);glow.addColorStop(1,'rgba(220,228,225,0)');
      ctx.fillStyle=glow;ctx.fillRect(-1,-1,2,2);ctx.restore();
    }
    const environment=new T.CanvasTexture(c);environment.colorSpace=T.SRGBColorSpace;environment.mapping=T.EquirectangularReflectionMapping;
    const generator=new T.PMREMGenerator(renderer);reflectionTarget=generator.fromEquirectangular(environment);scene.environment=reflectionTarget.texture;
    environment.dispose();generator.dispose();
  }
  const model = createInspectionModel(kind); scene.add(model); host.append(renderer.domElement);
  let disposed = false, pointer: {id:number;x:number;y:number} | undefined;
  const pose = { x: -.14, y: -.3, zoom: 1 };
  const render = () => {
    if (disposed) return;
    model.rotation.set(pose.x, pose.y, 0); model.scale.setScalar(pose.zoom);
    renderer.render(scene,camera); host.dataset.rotation = `${pose.x.toFixed(3)},${pose.y.toFixed(3)}`;
  };
  // 校正合照内页；手机玻璃只使用程序化环境反光，不读取原图片。
  const photo=model.getObjectByName('photo-print');
  const image=photo&&art?new Image():undefined;
  if(image&&art){
    image.onload=()=>{
      if(disposed)return;
      const r=art.region;if(!r)return;
      const source=document.createElement('canvas');source.width=image.naturalWidth;source.height=image.naturalHeight;
      const sc=source.getContext('2d')!;sc.drawImage(image,0,0);const raw=sc.getImageData(0,0,source.width,source.height);
      const [width,height]=photo!.userData.artSize??[512,576];
      const quad:number[][]=photo!.userData.artQuad??[[r.x+59,r.y+36],[r.x+247,r.y+57],[r.x+207,r.y+204],[r.x+35,r.y+184]];
      const [sourceWidth,sourceHeight]=photo!.userData.artCanvas??[r.canvasWidth,r.canvasHeight];
      const target=document.createElement('canvas');target.width=width;target.height=height;const tc=target.getContext('2d')!,out=tc.createImageData(width,height);
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){
        const u=x/(width-1),v=y/(height-1),weights=[(1-u)*(1-v),u*(1-v),u*v,(1-u)*v];
        const sx=quad.reduce((sum,p,i)=>sum+p[0]!*weights[i]!,0)*image.naturalWidth/sourceWidth;
        const sy=quad.reduce((sum,p,i)=>sum+p[1]!*weights[i]!,0)*image.naturalHeight/sourceHeight;
        const p=(Math.min(source.height-1,Math.max(0,Math.round(sy)))*source.width+Math.min(source.width-1,Math.max(0,Math.round(sx))))*4;
        const q=(y*width+x)*4;out.data[q]=raw.data[p]!;out.data[q+1]=raw.data[p+1]!;out.data[q+2]=raw.data[p+2]!;out.data[q+3]=255;
      }
      tc.putImageData(out,0,0);const texture=new T.CanvasTexture(target);texture.colorSpace=T.SRGBColorSpace;
      const material=(photo as T.Mesh).material as T.MeshStandardMaterial;material.map=texture;material.color.set('#ffffff');material.needsUpdate=true;photo!.visible=true;host.dataset.artReady='true';render();
    };
    image.src=art.url;
  }
  const animate = (values: Partial<typeof pose>) => gsap.to(pose,{...values,duration:reduced()?0:.25,overwrite:true,onUpdate:render});
  const zoom = (amount: number) => animate({zoom:T.MathUtils.clamp(pose.zoom+amount,.65,1.65)});
  const reset = () => animate({x:-.14,y:-.3,zoom:1});
  const resize = () => {
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    camera.aspect=w/h;camera.position.set(0,0,Math.max(7,5/camera.aspect)); camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);render();
  };
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const down=(e:PointerEvent)=>{
    if(pointer||(e.pointerType==='mouse'&&e.button!==0))return;
    gsap.killTweensOf(pose);pointer={id:e.pointerId,x:e.clientX,y:e.clientY};host.setPointerCapture(e.pointerId);host.classList.add('dragging');host.focus({preventScroll:true});
  };
  const move=(e:PointerEvent)=>{
    if(pointer?.id!==e.pointerId)return;
    pose.y+=(e.clientX-pointer.x)*.009;pose.x=T.MathUtils.clamp(pose.x+(e.clientY-pointer.y)*.007,-1.5,1.5);
    pointer.x=e.clientX;pointer.y=e.clientY;render();
  };
  const up=(e:PointerEvent)=>{if(pointer?.id!==e.pointerId)return;pointer=undefined;host.classList.remove('dragging');if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);};
  const wheel=(e:WheelEvent)=>{e.preventDefault();zoom(e.deltaY>0?-.1:.1);};
  const keydown=(e:KeyboardEvent)=>{
    const deltas:Record<string,[number,number]>={ArrowLeft:[0,-.2],ArrowRight:[0,.2],ArrowUp:[-.15,0],ArrowDown:[.15,0]};
    const d=deltas[e.key];if(d){e.preventDefault();animate({x:T.MathUtils.clamp(pose.x+d[0],-1.5,1.5),y:pose.y+d[1]});}
    else if(e.key==='Home'){e.preventDefault();reset();}
    else if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?-.15:.15);}
  };
  const lost=()=>host.dispatchEvent(new CustomEvent('stage-error'));
  renderer.domElement.addEventListener('webglcontextlost',lost);
  host.addEventListener('pointerdown',down);host.addEventListener('pointermove',move);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(name,up as EventListener);
  host.addEventListener('wheel',wheel,{passive:false});host.addEventListener('keydown',keydown);
  return {reset,zoom,rotate:()=>animate({y:pose.y+Math.PI}),dispose(){
    disposed=true;gsap.killTweensOf(pose);observer.disconnect();
    if(image){image.onload=null;image.onerror=null;}
    host.removeEventListener('pointerdown',down);host.removeEventListener('pointermove',move);
    for(const name of ['pointerup','pointercancel','lostpointercapture'])host.removeEventListener(name,up as EventListener);
    host.removeEventListener('wheel',wheel);host.removeEventListener('keydown',keydown);
    const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
    model.traverse(o=>{if(!(o instanceof T.Mesh))return;geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);for(const value of Object.values(m))if(value instanceof T.Texture)textures.add(value);}});
    geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());
    scene.environment=null;reflectionTarget?.dispose();
    renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
  }};
}
