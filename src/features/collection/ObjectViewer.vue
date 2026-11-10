<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { gsap } from 'gsap';
import type { ObjectModelKind } from '../../content/object-models';
import type { Asset } from '../../core/contracts';
import type { createInspectionStage } from '../../presentation/inspection-stage';
import UiButton from '../../shared/UiButton.vue';
const props=defineProps<{title:string;description:string;kind:ObjectModelKind;source:HTMLElement;reducedMotion?:boolean;art?:Asset}>();
const emit=defineEmits<{close:[]}>();
const surface=ref<HTMLElement>(),host=ref<HTMLElement>(),copy=ref<HTMLElement>();
const loading=ref(true),failed=ref(false),closing=ref(false);
const motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)'),systemReduced=ref(motionQuery.matches);
const reduce=computed(()=>!!props.reducedMotion||systemReduced.value);
const touchControls=window.matchMedia('(pointer: coarse)').matches;
const motionChanged=()=>{systemReduced.value=motionQuery.matches;};
let stage:ReturnType<typeof createInspectionStage>|undefined,disposed=false,ctx:gsap.Context|undefined;
let origin={x:0,y:0,scale:.25};
async function close(){
  if(closing.value)return;closing.value=true;ctx?.kill();
  const h=host.value;if(!h){emit('close');return;}
  ctx=gsap.context(()=>{
    const duration=reduce.value?0:.38;
    gsap.timeline({onComplete:()=>{if(!disposed)emit('close');}})
      .to(copy.value!,{opacity:0,duration:duration*.5},0)
      .to(h,{x:reduce.value?0:origin.x,y:reduce.value?0:origin.y,scale:reduce.value?1:origin.scale,opacity:0,duration,ease:'power2.inOut'},0)
      .to(surface.value!,{backgroundColor:'rgba(239,228,200,0)',duration},0);
  },surface.value);
}
function escape(e:KeyboardEvent){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();void close();}}
defineExpose({close});
watch(reduce,()=>{if(reduce.value&&!closing.value){ctx?.kill();if(host.value)gsap.set(host.value,{x:0,y:0,scale:1,opacity:1});if(copy.value)gsap.set(copy.value,{opacity:1});}});
onMounted(async()=>{
  motionQuery.addEventListener('change',motionChanged);
  document.addEventListener('keydown',escape,true);
  const from=props.source.getBoundingClientRect(),to=host.value!.getBoundingClientRect();
  origin={x:from.x+from.width/2-to.x-to.width/2,y:from.y+from.height/2-to.y-to.height/2,scale:Math.max(.12,Math.min(.65,from.width/to.width))};
  const d=reduce.value?0:.65;
  ctx=gsap.context(()=>{
    gsap.fromTo(surface.value!,{backgroundColor:'rgba(239,228,200,0)'},{backgroundColor:'rgba(239,228,200,1)',duration:d*.5});
    gsap.fromTo(host.value!,{x:reduce.value?0:origin.x,y:reduce.value?0:origin.y,scale:reduce.value?1:origin.scale,opacity:0},{x:0,y:0,scale:1,opacity:1,duration:d,ease:'power3.inOut'});
    gsap.fromTo(copy.value!,{opacity:0},{opacity:1,delay:d*.45,duration:d*.5});
  },surface.value);
  try{
    const {createInspectionStage}=await import('../../presentation/inspection-stage');
    if(disposed||closing.value)return;
    stage=createInspectionStage(host.value!,props.kind,()=>reduce.value,props.art);
  }catch{failed.value=true;}finally{loading.value=false;}
  if(!disposed&&!closing.value)host.value?.focus({preventScroll:true});
});
onBeforeUnmount(()=>{disposed=true;motionQuery.removeEventListener('change',motionChanged);document.removeEventListener('keydown',escape,true);ctx?.revert();stage?.dispose();void nextTick(()=>{if(props.source.isConnected)props.source.focus({preventScroll:true});});});
</script>
<template>
  <section ref="surface" class="object-viewer" :aria-label="title+' · 立体查看'" :aria-busy="loading">
    <div ref="host" class="object-viewer-stage" :inert="closing" tabindex="0" role="group" :aria-label="title+'三维模型，拖动或按方向键转动'" aria-describedby="object-viewer-help" @stage-error="failed=true">
      <p v-if="loading" class="object-viewer-status" role="status">正在拿起物件……</p>
      <p v-else-if="failed" class="object-viewer-status" role="status">这台设备暂时无法显示立体物件。可以返回查看原图与文字。</p>
    </div>
    <div ref="copy" class="object-viewer-copy">
      <h3>{{ title }}</h3><p class="object-viewer-description text-scroll">{{ description }}</p>
      <p id="object-viewer-help" class="object-viewer-help">{{ touchControls?'单指拖动物件，看看另一面':'按住物件拖动，看看另一面' }}<br>{{ touchControls?'点＋／－缩放 · 点摆正复位 · 放回原处返回':'滚轮缩放 · 方向键转动 · Home 复位 · Esc 返回' }}</p>
      <div class="object-viewer-tools"><UiButton :disabled="loading||failed||closing" @click="stage?.rotate()">翻到另一面</UiButton><UiButton :disabled="loading||failed||closing" @click="stage?.reset()">摆正</UiButton><UiButton :disabled="loading||failed||closing" aria-label="放大物件" @click="stage?.zoom(.15)">＋</UiButton><UiButton :disabled="loading||failed||closing" aria-label="缩小物件" @click="stage?.zoom(-.15)">－</UiButton><UiButton tone="wood" :disabled="closing" @click="close">放回原处</UiButton></div>
    </div>
  </section>
</template>
<style>
.object-browser{position:relative;min-height:0;height:100%}
.object-viewer{position:absolute;inset:0;z-index:5;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(230px,.8fr);gap:24px;background:#efe4c8;border-radius:8px;padding:12px;overflow:hidden;isolation:isolate}
.object-viewer-stage{min-height:0;min-width:0;position:relative;touch-action:none;cursor:grab;background:radial-gradient(ellipse,#fff8df99,transparent 68%);border-radius:12px;outline-offset:-4px}
.object-viewer-stage.dragging{cursor:grabbing}.object-viewer-stage canvas{width:100%;height:100%;display:block}.object-viewer-status{position:absolute;inset:35% 8% auto;text-align:center;line-height:1.9;z-index:1;background:#efe4c8dd;padding:12px}
.object-viewer-copy{min-height:0;display:flex;flex-direction:column;justify-content:center;gap:16px}.object-viewer-copy h3{font:26px/1.6 var(--font-story);margin:0}.object-viewer-description{font:17px/1.9 var(--font-story);overflow-y:auto;min-height:0;margin:0}.object-viewer-help{font-size:13px;line-height:1.9;color:#746448;margin:0}.object-viewer-tools{display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0}
.object-preview{flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;width:100%;border:0;background:transparent;color:inherit;padding:8px;cursor:pointer;border-radius:8px;transition:background .2s,transform .2s}.object-preview:hover{background:#fff8e344;transform:translateY(-3px)}.object-preview>span:last-child{flex-shrink:0;font:13px/2 var(--font-ui);color:#766344;margin-top:12px}
.inventory-card{width:100%;text-align:left;cursor:pointer;color:inherit;font:inherit;border:1px solid #ac926347;background:#fff7e233;padding:20px;transition:transform .2s,background .2s}.inventory-card:hover{transform:translateY(-3px);background:#fff7e288}.inventory-card small{display:block;color:#766344;margin-top:12px}.inventory-browser{min-height:300px}.inventory-browser .inventory-grid{height:100%;overflow-y:auto;align-content:start}
@media(max-width:720px){.object-viewer{grid-template-columns:1fr;grid-template-rows:minmax(160px,1fr) minmax(0,1fr);gap:10px;padding:6px}.object-viewer-copy{gap:8px;justify-content:flex-start}.object-viewer-copy h3{font-size:21px}.object-viewer-description{font-size:15px}.object-viewer-help{font-size:12px}.object-viewer-tools .ui-button{min-height:36px;padding:7px 12px}}
@media(prefers-reduced-motion:reduce){.object-preview,.inventory-card{transition:none}}
.reduced-motion .object-preview,.reduced-motion .inventory-card{transition:none}
</style>
