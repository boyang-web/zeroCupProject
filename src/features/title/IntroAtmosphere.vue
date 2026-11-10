<script setup lang="ts">
import UiOrnament from '../../presentation/UiOrnament.vue';
defineProps<{reducedMotion:boolean}>();
const petals=Array.from({length:25},(_,i)=>({left:(i*37+11)%103,duration:12+(i*7)%13,delay:-((i*13)%29),size:4+(i*3)%5,sway:((i*17)%120)-60,depth:i%3}));
</script>
<template>
 <div class="intro-atmosphere" :class="{quiet:reducedMotion}" aria-hidden="true">
  <UiOrnament kind="osmanthus" class="intro-sprig intro-sprig--near"/><UiOrnament kind="osmanthus" class="intro-sprig intro-sprig--far"/>
  <div class="petal-stream"><span v-for="(petal,i) in petals" :key="i" class="petal" :class="'petal--'+petal.depth" :style="{'--left':petal.left+'%','--duration':petal.duration+'s','--delay':petal.delay+'s','--size':petal.size+'px','--sway':petal.sway+'px'}"><svg viewBox="0 0 24 24"><g fill="currentColor"><ellipse cx="12" cy="7" rx="4.2" ry="6"/><ellipse cx="17" cy="12" rx="6" ry="4.2"/><ellipse cx="12" cy="17" rx="4.2" ry="6"/><ellipse cx="7" cy="12" rx="6" ry="4.2"/></g><circle cx="12" cy="12" r="2" fill="#a27b3b"/></svg></span></div>
  <div class="intro-dust"><i v-for="n in 9" :key="n" :style="{'--n':n}"></i></div>
 </div>
</template>
<style scoped>
.intro-atmosphere{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.intro-sprig{position:absolute;object-fit:contain;will-change:transform;transition:opacity 1s}
.intro-sprig--near{width:clamp(170px,26vw,420px);height:clamp(130px,20vw,320px);right:-4%;top:-5%;opacity:.42;transform:translate(calc(var(--mx)*-11px),calc(var(--progress)*-18px + var(--my)*-7px)) rotate(153deg);filter:blur(.3px) drop-shadow(0 12px 10px #211b1266)}
.intro-sprig--far{width:190px;height:145px;left:-60px;bottom:-40px;opacity:.22;transform:translate(calc(var(--mx)*9px),calc(var(--progress)*-21px)) rotate(-20deg)}
.petal-stream{position:absolute;inset:-10% -8%;transform:translate(calc(var(--mx)*20px),calc(var(--progress)*-14px));transition:transform 1.2s ease-out}
.petal{position:absolute;left:var(--left);top:-8%;width:var(--size);height:var(--size);color:#e9cd8f;opacity:0;animation:petal-fall var(--duration) var(--delay) linear infinite;filter:drop-shadow(0 2px 2px #4a391e33)}
.petal svg{width:100%;height:100%}.petal--0{color:#f7e4b1;filter:blur(.2px)}.petal--2{width:calc(var(--size)*1.6);height:calc(var(--size)*1.6);filter:blur(1.2px)}
.intro-dust{position:absolute;inset:0;opacity:.35;transform:translateY(calc(var(--progress)*-9px))}
.intro-dust i{position:absolute;left:calc(var(--n)*9%);top:calc(14% + var(--n)*7%);width:2px;height:2px;border-radius:50%;background:#ffeac1;box-shadow:0 0 7px #ffddb8;animation:dust-drift calc(7s + var(--n)*.9s) calc(var(--n)*-.8s) ease-in-out infinite}
@keyframes petal-fall{0%{opacity:0;transform:translate3d(0,0,0) rotate(0) rotateY(0)}8%{opacity:.65}75%{opacity:.45}100%{opacity:0;transform:translate3d(var(--sway),112vh,0) rotate(290deg) rotateY(170deg)}}
@keyframes dust-drift{0%,100%{opacity:.1;translate:0 0}50%{opacity:.7;translate:12px -19px}}
.quiet .petal-stream,.quiet .intro-dust{display:none}.quiet .intro-sprig{will-change:auto}
@media(max-width:720px){.intro-sprig--near{right:-12%;top:-4%;width:190px;height:145px;opacity:.3}.intro-sprig--far{width:140px;height:106px;left:-60px}.petal--2{display:none}}
@media(prefers-reduced-motion:reduce){.petal-stream,.intro-dust{display:none}.intro-sprig{will-change:auto}}
</style>
