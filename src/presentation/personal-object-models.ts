import * as T from 'three';

// Only these two objects needed new silhouettes; keep the other collection models intact.
export function createPersonalObject(kind: 'phone' | 'letter') {
  const root = new T.Group();
  const material = (color: string, roughness = .8, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
  function add(geometry: T.BufferGeometry, surface: T.Material, x = 0, y = 0, z = 0, name = '') {
    const mesh = new T.Mesh(geometry, surface); mesh.position.set(x, y, z); mesh.name = name; root.add(mesh); return mesh;
  }
  function rounded(w: number, h: number, d: number, radius: number, surface: T.Material, x = 0, y = 0, z = 0) {
    // Round the silhouette independently of thickness: a thin phone still has broad corners.
    const r=Math.min(radius,w/2,h/2),left=-w/2,bottom=-h/2,shape=new T.Shape();
    shape.moveTo(left+r,bottom);shape.lineTo(left+w-r,bottom);shape.quadraticCurveTo(left+w,bottom,left+w,bottom+r);
    shape.lineTo(left+w,bottom+h-r);shape.quadraticCurveTo(left+w,bottom+h,left+w-r,bottom+h);
    shape.lineTo(left+r,bottom+h);shape.quadraticCurveTo(left,bottom+h,left,bottom+h-r);
    shape.lineTo(left,bottom+r);shape.quadraticCurveTo(left,bottom,left+r,bottom);
    const bevel=Math.min(d*.12,.004),geometry=new T.ExtrudeGeometry(shape,{depth:d-2*bevel,steps:1,curveSegments:12,bevelEnabled:true,bevelSegments:2,bevelThickness:bevel,bevelSize:bevel});
    geometry.translate(0,0,-d/2+bevel);
    const p=geometry.getAttribute('position'),uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)/w+.5;uv[i*2+1]=p.getY(i)/h+.5;}geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
    return add(geometry, surface, x, y, z);
  }
  function face(points: [number, number][], surface: T.Material, z: number) {
    const shape = new T.Shape(); points.forEach(([x,y],i) => i ? shape.lineTo(x,y) : shape.moveTo(x,y)); shape.closePath();
    return add(new T.ShapeGeometry(shape), surface, 0, 0, z);
  }
  function texture(canvas: HTMLCanvasElement) {
    const result = new T.CanvasTexture(canvas); result.colorSpace = T.SRGBColorSpace; return result;
  }
  const canvas = document.createElement('canvas');canvas.width=1024;canvas.height=640;
  const ctx = canvas.getContext('2d')!;
  if (kind === 'phone') {
    // Worn, subdued bronze-grey edging as in phone-flat-v4, rather than a wooden frame.
    ctx.fillStyle='#9c9388';ctx.fillRect(0,0,1024,640);
    for(let i=0;i<5000;i++){
      ctx.strokeStyle=i%3?'#4c484125':'#e8ded132';ctx.lineWidth=i%7?.5:1;
      const x=i*127.37%1024,y=i*197.13%640;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+i%11,y+.7);ctx.stroke();
    }
    const metal=material('#ada399',.45,.65);metal.map=texture(canvas);
    rounded(1.15,2.38,.145,.135,metal);
    rounded(1.113,2.343,.022,.12,material('#121716',.26,.12),0,0,.072);
    rounded(1.09,2.315,.013,.12,material('#292c29',.5,.22),0,0,-.079);
    const screenShape=new T.Shape(),w=1.074,h=2.277,r=.105,x=-w/2,y=-h/2;
    screenShape.moveTo(x+r,y);screenShape.lineTo(x+w-r,y);screenShape.quadraticCurveTo(x+w,y,x+w,y+r);
    screenShape.lineTo(x+w,y+h-r);screenShape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    screenShape.lineTo(x+r,y+h);screenShape.quadraticCurveTo(x,y+h,x,y+h-r);
    screenShape.lineTo(x,y+r);screenShape.quadraticCurveTo(x,y,x+r,y);
    const screenGeometry=new T.ShapeGeometry(screenShape,20),positions=screenGeometry.getAttribute('position');
    const uv=new Float32Array(positions.count*2);
    for(let i=0;i<positions.count;i++){uv[i*2]=positions.getX(i)/w+.5;uv[i*2+1]=positions.getY(i)/h+.5;}
    screenGeometry.setAttribute('uv',new T.BufferAttribute(uv,2));
    add(screenGeometry,new T.MeshPhysicalMaterial({color:'#090d0e',roughness:.19,metalness:.18,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:.7}),0,0,.09,'phone-glass');
    add(new T.CircleGeometry(.026,32),material('#060a0b',.23),0,1.075,.092,'phone-front-camera');
    add(new T.TorusGeometry(.026,.003,6,32),material('#252e30',.4,.45),0,1.075,.093);
    for(const [yy,length] of [[.55,.26],[.19,.32]] as const)rounded(.025,length,.065,.012,metal,-.585,yy);
    rounded(.024,.31,.065,.012,metal,.585,.4);
    const port=rounded(.21,.016,.045,.007,material('#111512'),0,-1.19);
    port.name='phone-charge-port';
    for(const x of [-.43,-.35,-.27,.27,.35,.43]){
      const hole=add(new T.CylinderGeometry(.018,.018,.006,12),material('#171a18'),x,-1.193);hole.name='phone-speaker';
    }
    for(const x of [-.5,.5])rounded(.012,.09,.15,.003,material('#494944'),x,-.78);
  } else {
    // Old buff envelope with fine fibres, rubbed edges and separate folded layers.
    ctx.fillStyle='#c6b9a3';ctx.fillRect(0,0,1024,640);
    const edge=ctx.createRadialGradient(512,320,60,512,320,600);edge.addColorStop(0,'#f3e6cf44');edge.addColorStop(1,'#75634b35');ctx.fillStyle=edge;ctx.fillRect(0,0,1024,640);
    for(let i=0;i<14000;i++){
      const x=i*127.37%1024,y=i*197.13%640;ctx.strokeStyle=i%3?'#6f513014':'#fff4d430';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+(i%5),y+(i%3)-1);ctx.stroke();
    }
    const buff=material('#f0e6d2');buff.map=texture(canvas);buff.side=T.DoubleSide;
    const fold=buff.clone();fold.color.set('#ecdbb9');
    rounded(2.65,1.38,.033,.015,buff,0,-.06);
    // Small letter edges are visible inside the pocket, rather than printed on its outside.
    rounded(2.4,1.08,.012,.006,material('#e9dcc0'),0,-.02,.024);
    face([[-1.31,-.73],[-1.31,.63],[.04,-.1]],fold,.048);
    face([[1.31,-.73],[.04,-.1],[1.31,.63]],buff,.05);
    face([[-1.31,-.73],[1.31,-.73],[.05,.06]],buff,.054);
    const flapShape=new T.Shape();flapShape.moveTo(-1.31,.63);flapShape.lineTo(1.31,.63);
    flapShape.lineTo(.18,-.14);flapShape.quadraticCurveTo(.02,-.23,-.14,-.14);flapShape.closePath();
    const flap=add(new T.ShapeGeometry(flapShape,24),buff,0,0,.08,'envelope-flap');
    // UVs use the same fibre scale across the different paper folds.
    for(const mesh of root.children){if(!(mesh instanceof T.Mesh)||!(mesh.geometry instanceof T.ShapeGeometry))continue;
      const p=mesh.geometry.getAttribute('position'),uv=new Float32Array(p.count*2);
      for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)/2.65+.5;uv[i*2+1]=p.getY(i)/1.38+.5;}mesh.geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
    }
    flap.userData.folded=true;
    // Pale ticket protruding at the upper right; blank markings match the original prop.
    const ticketCanvas=document.createElement('canvas');ticketCanvas.width=768;ticketCanvas.height=384;
    const ticketContext=ticketCanvas.getContext('2d')!;ticketContext.fillStyle='#e9edf0';ticketContext.fillRect(0,0,768,384);
    ticketContext.fillStyle='#aec4d1';ticketContext.fillRect(0,290,768,94);
    ticketContext.strokeStyle='#a7adb1';ticketContext.lineWidth=2;ticketContext.beginPath();ticketContext.moveTo(80,125);ticketContext.lineTo(690,125);ticketContext.stroke();
    ticketContext.strokeStyle='#929da5';ticketContext.lineWidth=6;ticketContext.beginPath();ticketContext.arc(90,75,19,0,Math.PI*1.8);ticketContext.stroke();
    for(let i=0;i<9;i++){ticketContext.fillStyle=i%2?'#a6afb5':'#88979f';ticketContext.fillRect(565+i*12,322,7,18);}
    for(let i=0;i<7;i++){ticketContext.fillStyle='#8f999f';ticketContext.fillRect(620+i*10,60,6,3);}
    const ticketMaterial=new T.MeshStandardMaterial({map:texture(ticketCanvas),roughness:.9,side:T.DoubleSide});
    // Ticket front stays behind BOTH side folds, including the small upper-right triangle.
    const ticket=rounded(1.03,.56,.012,.006,material('#e2e6e8'),.75,.63,.038);ticket.rotation.z=.035;
    const ticketFace=add(new T.PlaneGeometry(1.03,.56),ticketMaterial,.75,.63,.045,'envelope-ticket');ticketFace.rotation.z=.035;
    // Soft, fine fold seams; avoid the former heavy cross through the letter.
    const seam=material('#b69b73');
    function line(points:T.Vector3[]){add(new T.TubeGeometry(new T.CatmullRomCurve3(points),20,.002,4,false),seam);}
    line([new T.Vector3(-1.3,-.72,.059),new T.Vector3(-.66,-.37,.059),new T.Vector3(-.05,-.04,.059)]);
    line([new T.Vector3(1.3,-.72,.059),new T.Vector3(.7,-.37,.059),new T.Vector3(.14,-.07,.059)]);
  }
  return root;
}
