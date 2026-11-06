import * as THREE from 'three';
import { gsap } from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function createObjectStage(host: HTMLElement, kind: string, reduced: boolean, modelUrl?: string) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
  camera.position.set(3, 3, 4); camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xfff1d4, 0x284646, 2.8));
  const light = new THREE.DirectionalLight(0xffe1b0, 3); light.position.set(2, 4, 3); scene.add(light);
  const root = new THREE.Group(); scene.add(root);
  const material = new THREE.MeshStandardMaterial({ color: 0xba9566, roughness: .8 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xe8d9b7, roughness: .7 });
  if (kind === 'steamer') {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, .45, 40, 1, true), material); root.add(body);
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(1.16, 1.16, .06, 40), material); bottom.position.y = -.22; root.add(bottom);
    for (let i = 0; i < 3; i++) {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(.32, 20, 12), accent);
      bun.scale.y = .75; bun.position.set(Math.cos(i * 2.1) * .58, .02, Math.sin(i * 2.1) * .58); root.add(bun);
    }
  } else {
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.7, .12, 1.6), material); board.position.y = -.35; root.add(board);
    const dough = new THREE.Mesh(new THREE.SphereGeometry(.9, 24, 12), accent); dough.scale.set(1, .13, .65); dough.position.y = -.19; root.add(dough);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 2.4, 24), material); pin.rotation.z = Math.PI / 2; pin.position.set(0, .03, .25); root.add(pin);
  }
  let disposed = false; let progress = .5;
  let tween: gsap.core.Tween | undefined;
  const release = (object: THREE.Object3D) => {
    const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(); const textures = new Set<THREE.Texture>();
    object.traverse(child => {
      if (!(child instanceof THREE.Mesh)) return;
      geometries.add(child.geometry);
      for (const m of Array.isArray(child.material) ? child.material : [child.material]) {
        materials.add(m); for (const v of Object.values(m)) if (v instanceof THREE.Texture) textures.add(v);
      }
    });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose());
  };
  if (modelUrl) new GLTFLoader().loadAsync(modelUrl).then(gltf => {
    if (disposed) { release(gltf.scene); return; }
    release(root); root.clear(); root.add(gltf.scene); render();
  }).catch(() => { /* The procedural placeholder remains usable. */ });
  host.append(renderer.domElement);
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const resize = () => {
    if (disposed || !host.clientWidth || !host.clientHeight) return;
    camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight, false); render();
  };
  const observer = new ResizeObserver(resize); observer.observe(host); resize();
  return {
    update(value: number) {
      progress = value / 100; tween?.kill();
      tween = gsap.to(root.rotation, { y: (progress - .5) * .8, duration: reduced ? 0 : .25, onUpdate: render });
      root.scale.y = .8 + progress * .4; render();
    },
    dispose() {
      if (disposed) return;
      disposed = true; tween?.kill(); observer.disconnect(); release(scene);
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}
