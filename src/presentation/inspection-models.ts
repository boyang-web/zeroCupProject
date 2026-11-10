import * as T from 'three';
import type { ObjectModelKind } from '../content/object-models';
import { createPersonalObject } from './personal-object-models';

export function createInspectionModel(kind: ObjectModelKind) {
  if(kind==='phone'||kind==='letter')return createPersonalObject(kind);
  const root = new T.Group();
  const mat = (color: string, roughness = .8, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
  const wood = mat('#805535'), paper = mat('#efe1bc'), dark = mat('#443a2e'), brass = mat('#b79a58', .4, .7);
  const grain = document.createElement('canvas'); grain.width=128;grain.height=512;
  const grainContext=grain.getContext('2d')!;grainContext.fillStyle='#c4a177';grainContext.fillRect(0,0,128,512);
  for(let i=0;i<150;i++){const x=(i*53.17)%128,y=(i*91.31)%512;grainContext.strokeStyle=i%3?'#4a2e1e35':'#fff2cb40';grainContext.lineWidth=i%4?.8:2;grainContext.beginPath();grainContext.moveTo(x,y);grainContext.bezierCurveTo(x+4,y+40,x-3,y+80,x+1,y+150);grainContext.stroke();}
  wood.map=new T.CanvasTexture(grain);wood.map.colorSpace=T.SRGBColorSpace;
  function mesh(g: T.BufferGeometry, m: T.Material, x = 0, y = 0, z = 0) {
    const o = new T.Mesh(g, m); o.position.set(x, y, z); root.add(o); return o;
  }
  const box = (w: number, h: number, d: number, m: T.Material, x = 0, y = 0, z = 0) => mesh(new T.BoxGeometry(w, h, d), m, x, y, z);
  const cylinder = (r: number, h: number, m: T.Material, y = 0) => mesh(new T.CylinderGeometry(r, r, h, 64), m, 0, y);
  function print(lines: string[], w: number, h: number, x: number, y: number, z: number, back = false, bg = '#eadcba') {
    const c = document.createElement('canvas'); c.width = 640; c.height = 800;
    const ctx = c.getContext('2d')!; ctx.fillStyle = bg; ctx.fillRect(0, 0, 640, 800);
    for (let i = 0; i < 1800; i++) { ctx.fillStyle = i % 2 ? '#58432409' : '#ffffff22'; ctx.fillRect((i * 127) % 640, (i * 197) % 800, 1, 3); }
    ctx.fillStyle = '#51412e'; ctx.textAlign = 'center'; ctx.font = '36px serif';
    lines.forEach((line, i) => ctx.fillText(line, 320, 150 + i * 85, 560));
    const texture = new T.CanvasTexture(c); texture.colorSpace = T.SRGBColorSpace;
    const face = mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: texture, roughness: .95 }), x, y, z);
    if (back) face.rotation.y = Math.PI;
  }
  if (kind === 'spool') {
    cylinder(.38, 1.35, wood); cylinder(.69, .13, wood, .73); cylinder(.69, .13, wood, -.73);
    cylinder(.59, 1.18, paper);
    for (let i = 0; i < 42; i++) { const r = mesh(new T.TorusGeometry(.59, .012, 5, 64), paper, 0, -.57 + i * .028); r.rotation.x = Math.PI / 2; }
    const tail = new T.CatmullRomCurve3([new T.Vector3(.59,-.4,0), new T.Vector3(.8,-.7,.1), new T.Vector3(1,-.74,.25)]);
    mesh(new T.TubeGeometry(tail, 20, .018, 6, false), paper);
  } else if (kind === 'cup') {
    const points = [[.28,-.6],[.38,-.58],[.47,-.45],[.62,.5],[.64,.58],[.59,.59],[.57,.5],[.43,-.35],[.3,-.4]].map(([x,y]) => new T.Vector2(x!,y!));
    const glaze = mat('#c7d4b5', .25);
    mesh(new T.LatheGeometry(points, 64), glaze);
    cylinder(.28, .12, glaze, -.65); cylinder(.49, .012, mat('#895a2a', .18), .2);
    const handle = mesh(new T.TorusGeometry(.36,.07,12,40),glaze,.66,-.03); handle.scale.x = .8;
    cylinder(.9,.075,glaze,-.77);
  } else if (kind === 'key') {
    mesh(new T.TorusGeometry(.37,.095,12,48),brass,0,.55);
    box(.16,1.2,.13,brass,0,-.2); box(.4,.16,.13,brass,.13,-.72); box(.3,.16,.13,brass,.08,-.42);
    const cord = mesh(new T.TorusGeometry(.3,.035,8,40),mat('#987052'),0,1.04); cord.scale.x = .6;
  } else if (kind === 'bag') {
    const cloth = mat('#8b7952'); box(1.65,1.5,.85,cloth,0,-.18);
    box(1.72,.18,.92,wood,0,.58); box(1.5,1.1,.035,mat('#a79364'),0,-.2,.45);
    for (const z of [-.3,.3]) { const h = mesh(new T.TorusGeometry(.47,.055,8,40,Math.PI),dark,0,.65,z); h.scale.y = 1.15; }
    for (const x of [-.7,.7]) box(.025,1.4,.025,paper,x,-.15,.48);
    box(1.4,.025,.025,brass,0,.69,.46);
  } else if (kind === 'book') {
    box(1.55,2.05,.32,paper); for (const z of [-.19,.19]) box(1.7,2.2,.07,mat('#655a38'),0,0,z);
    box(.14,2.2,.44,wood,-.82);
    for (let i = 0; i < 16; i++) box(1.5,.008,.012,mat('#c9b995'),.02,-.94+i*.125,.168);
    print(['百 味 录','','桂花米酒','长明巷'],1.25,1.8,0,0,.23);
    for (let i = 0; i < 3; i++) box(.14,.65,.015,mat(['#9a684c','#8c9567','#b49c60'][i]!),-.42+i*.35,-.92,.08-i*.08);
    for (const y of [-.8,-.4,0,.4,.8]) { const stitch=mesh(new T.TorusGeometry(.08,.014,6,16),paper,-.84,y,.02); stitch.rotation.y=Math.PI/2; }
  } else if (kind === 'photo') {
    box(1.8,2.1,.14,dark); const frame=mat('#805032',.58);
    for (const x of [-.91,.91]) box(.18,2.3,.23,frame,x);
    for (const y of [-1.06,1.06]) box(2,.18,.23,frame,0,y);
    // 用几何剪影表现现有合照的三人构图，照片不代替物件厚度与背板。
    box(1.64,1.95,.015,paper,0,0,.09);
    for (const [x,y,r] of [[-.48,.35,.19],[.42,.35,.2],[0,-.05,.14]]) {
      mesh(new T.CircleGeometry(r!,32),mat('#ac8e63'),x!,y!,.11);
      const body=mesh(new T.CircleGeometry(r!*1.5,32),mat('#6d6a52'),x!,y!-.44,.12); body.scale.y=1.4;
    }
    const photo=mesh(new T.PlaneGeometry(1.62,1.94),new T.MeshStandardMaterial({color:'#fff7df',roughness:.9}),0,0,.14);photo.name='photo-print';photo.visible=false;
    const stand=box(.55,1.35,.07,dark,0,-.4,-.45); stand.rotation.x=-.42;
    print(['第一次来长明巷','认门认了三回'],1.45,1.3,0,.15,-.081,true);
  } else {
    const calendar = kind === 'calendar';
    const w = 1.55, h = calendar ? 2.05 : 1.65;
    box(w,h,calendar?.12:.025,paper);
    const lines = calendar ? ['十一月','','取眼镜　✓','买桂花　✓','小满回家　○'] : ['鸡蛋　青菜','桂花一罐','','买完记得带回来'];
    print(lines,w*.92,h*.94,0,0,calendar?.065:.015);
    print(calendar ? ['眼镜店小票'] : ['桂花米酒','','糖的旧量留在这里'],w*.92,h*.94,0,0,calendar?-.065:-.015,true);
    if (calendar) { box(w,.16,.14,wood,0,1); for(const x of [-.5,0,.5])mesh(new T.TorusGeometry(.085,.025,8,24),brass,x,1,.08); }
    else { box(.008,h,.004,mat('#c4b38f'),0,0,.018); }
  }
  // Some branches do not use every shared material.
  const used = new Set<T.Material>(); root.traverse(o => { if(o instanceof T.Mesh) for(const m of Array.isArray(o.material)?o.material:[o.material])used.add(m); });
  for(const m of [wood,paper,dark,brass])if(!used.has(m)){m.map?.dispose();m.dispose();}
  return root;
}
