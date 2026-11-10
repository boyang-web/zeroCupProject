<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { gsap } from 'gsap';
import IntroAtmosphere from './IntroAtmosphere.vue';
const props=defineProps<{reducedMotion:boolean;homeImage:string;titleImage:string;paperImage:string;doorImage:string;bagImage:string}>();
const emit=defineEmits<{finish:[]}>();
const scroller=ref<HTMLElement>();
const progress=ref(0),door=ref(0),dragging=ref(false),done=ref(false);
const pointer=reactive({x:0,y:0});
const pointerX=gsap.quickTo(pointer,'x',{duration:.9,ease:'power2.out'}),pointerY=gsap.quickTo(pointer,'y',{duration:.9,ease:'power2.out'});
const ticketOut=ref(false),paperBack=ref(false),ticketBack=ref(false),windowClear=ref(false),knocked=ref(false);
const phoneView=ref<'lock'|'calendar'|'resume'|'chat'>('lock');
const draft=ref('能够适应……'),reply=ref('好，我这两天回来。'),sentReply=ref('');
const act=computed(()=>Math.min(4,Math.max(0,Math.floor(progress.value+.48))));
const beats=[
 {place:'长明巷 · 秋',title:'这次，先回家。',copy:'我叫小满，刚失了业。',thought:'简历还没写完，我先买了一张回家的车票。'},
 {place:'城市 · 星期一',title:'今天，不用赶早班。',copy:'离开公司的东西，一个纸箱就装完了。',thought:''},
 {place:'傍晚 · 家里的消息',title:'“被子给你晒好了。”',copy:'奶奶没有问工作，只问什么时候回来。',thought:'我把“最近不太顺”删掉，换成了一句：“这两天回来。”'},
 {place:'归途 · 窗边',title:'先回去住几天。',copy:'窗外的楼慢慢低了，手机的信号断了一会儿。',thought:'包放在脚边。离到站还有一会儿，我把眼睛从屏幕上移开。'},
 {place:'长明巷 · 家门口',title:'“小满？门没锁。”',copy:'箱子先放门边。屋里有人在等。',thought:''},
];
watch(act,()=>{phoneView.value='lock';});
watch(()=>props.reducedMotion,reduced=>{if(reduced){pointerX.tween.kill();pointerY.tween.kill();pointer.x=0;pointer.y=0;gsap.killTweensOf(door);if(done.value)door.value=1;}});
const worldStyle=computed(()=>({'--progress':progress.value,'--mx':pointer.x,'--my':pointer.y,'--door':door.value,'--light-x':(58+pointer.x*19)+'%','--light-y':(32+pointer.y*17)+'%','--paper':'url("'+props.paperImage+'")','--door-art':'url("'+props.doorImage+'")'}));
function scroll(){const el=scroller.value;if(el)progress.value=el.scrollTop/el.clientHeight;}
// Native focus must not rewind sticky objects to their unscrolled position.
function preserveScenePosition(){const el=scroller.value;if(el&&Math.abs(el.scrollTop-progress.value*el.clientHeight)>1)el.scrollTo({top:progress.value*el.clientHeight,behavior:'instant'});}
function point(e:PointerEvent){if(props.reducedMotion||e.pointerType==='touch')return;pointerX((e.clientX/innerWidth-.5)*2);pointerY((e.clientY/innerHeight-.5)*2);}
function resetPointer(){pointerX(0);pointerY(0);}
function presence(index:number){return {'--presence':Math.max(0,1-Math.abs(progress.value-index)*1.25),'--drift':(index-progress.value)*48+'px'};}
function advance(){if(done.value||act.value===4)return;const el=scroller.value;if(el)el.scrollTo({top:(act.value+1)*el.clientHeight,behavior:props.reducedMotion?'instant':'smooth'});}
function keyboard(e:KeyboardEvent){if(e.target!==scroller.value)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();if(act.value===4)finish();else advance();}}
function animateDoor(value:number,duration=.5){gsap.to(door,{value,duration:props.reducedMotion?0:duration,ease:'power3.out',overwrite:true});}
let startX=0,distance=0,timer:ReturnType<typeof setTimeout>|undefined;
function grab(e:PointerEvent){if(done.value)return;startX=e.clientX;distance=0;dragging.value=true;gsap.killTweensOf(door);(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);}
function pull(e:PointerEvent){if(!dragging.value)return;distance=startX-e.clientX;animateDoor(Math.max(0,Math.min(.98,distance/Math.min(300,innerWidth*.6))),.13);}
function release(){dragging.value=false;if(distance>Math.min(85,innerWidth*.2))finish();else if(Math.abs(distance)<6){if(knocked.value)finish();else{knocked.value=true;animateDoor(.12,.7);}}else animateDoor(knocked.value ? .12 : 0);}
function cancelDrag(){dragging.value=false;animateDoor(knocked.value ? .12 : 0);}
function finish(){if(done.value)return;done.value=true;animateDoor(1,1.1);timer=setTimeout(()=>emit('finish'),props.reducedMotion?0:1550);}
function sendReply(){if(reply.value.trim())sentReply.value=reply.value.trim();}
onBeforeUnmount(()=>{clearTimeout(timer);pointerX.tween.kill();pointerY.tween.kill();gsap.killTweensOf(door);});
</script>
<template>
 <section ref="scroller" class="journey" :class="{still:reducedMotion,complete:done,'door-dragging':dragging}" tabindex="0" aria-label="小满的归途" :style="worldStyle" @scroll.passive="scroll" @focusin="preserveScenePosition" @pointermove="point" @pointerleave="resetPointer" @keydown="keyboard">
  <div class="journey-sticky" :data-act="act">
   <div class="journey-world" aria-hidden="true"><img class="journey-backdrop" :src="titleImage" alt="" fetchpriority="high"/><img class="journey-home" :class="{'is-near':act===4}" :src="homeImage" alt=""/><div class="journey-shade"></div><div class="journey-pointer-light"></div><div class="journey-lattice"></div></div>
   <IntroAtmosphere :reduced-motion="reducedMotion"/>
   <Transition name="intro-words" mode="out-in"><div :key="act" class="journey-copy"><small>{{beats[act]!.place}}</small><h2>{{beats[act]!.title}}</h2><p>{{beats[act]!.copy}}</p><p v-if="beats[act]!.thought" class="journey-thought">{{beats[act]!.thought}}</p></div></Transition>
   <div class="journey-props">
    <div class="luggage-scene intro-prop" :class="{'is-active':act===0,'ticket-out':ticketOut}" :style="presence(0)" :inert="act!==0" :aria-hidden="act!==0">
     <span class="luggage-halo" aria-hidden="true"></span>
     <button class="luggage-bag" aria-label="从旅行包里抽出车票" :aria-expanded="ticketOut" aria-controls="luggage-ticket" @click="ticketOut=!ticketOut"><img :src="bagImage" alt="帆布旅行包" fetchpriority="high" draggable="false"/></button>
     <button id="luggage-ticket" class="luggage-ticket" :inert="!ticketOut" :aria-hidden="!ticketOut" aria-label="把车票收回旅行包" @click="ticketOut=false"><small>归途 · 单程</small><strong>回家</strong><span>旅客　小满<br/>靠窗座位</span><i aria-hidden="true"></i></button>
     <p class="luggage-note" :class="{'is-shown':ticketOut}" :aria-hidden="!ticketOut">返程票，还没有买。</p>
    </div>
    <div class="city-scene intro-prop" :class="{'is-active':act===1,'paper-open':paperBack}" :style="presence(1)" :inert="act!==1" :aria-hidden="act!==1">
     <button class="desk-paper" :class="{'is-turned':paperBack}" aria-label="翻看简历草稿" :aria-pressed="paperBack" @click="paperBack=!paperBack"><template v-if="!paperBack"><small>个人简历 / 草稿</small><h3>小满</h3><p>工作经历</p><span>结束日期：至今</span><i></i><i></i><i></i></template><template v-else><small>纸背的一行字</small><p class="paper-memory">先回去住几天。<br/>别的，见了奶奶再说。</p><span class="paper-crossed">最近还行。</span></template></button>
    </div>
    <div class="journey-phone intro-prop" :class="{'is-active':act===1||act===2,'phone-engaged':phoneView!=='lock'}" :style="presence(act===2?2:1)" :inert="act!==1&&act!==2" :aria-hidden="act!==1&&act!==2">
     <div class="phone-metal"><span class="phone-volume"></span><button class="phone-power" aria-label="锁定手机" @click="phoneView='lock'"></button><div class="phone-glass">
      <span class="phone-island" aria-hidden="true"><i></i></span><div class="device-status" aria-hidden="true"><span>{{act===1?'09:41':'18:26'}}</span><span>▮▮▮ ◒ ▰</span></div>
      <template v-if="phoneView==='lock'"><div class="device-clock">{{act===1?'09:41':'18:26'}}<small>{{act===1?'星期一 · 晴':'傍晚'}}</small></div><template v-if="act===1"><button class="device-notification" @click="phoneView='calendar'"><small>日历</small><strong>今天没有日程</strong><span>查看今日</span></button><button class="device-notification" @click="phoneView='resume'"><small>备忘录</small><strong>个人简介 · 草稿</strong><span>继续编辑</span></button></template><button v-else class="device-notification message-notification" @click="phoneView='chat'"><small>奶奶 · 现在</small><strong>有空回来住几天。被子给你晒好了。</strong><span>查看消息</span></button></template>
      <template v-else-if="phoneView==='calendar'"><div class="device-app-header"><button aria-label="返回锁屏" @click="phoneView='lock'">‹</button><span>星期一</span></div><div class="calendar-page"><strong>一</strong><p>今天没有日程</p><div v-for="hour in ['09:00','10:00','11:00','12:00']" :key="hour"><small>{{hour}}</small><i></i></div></div></template>
      <template v-else-if="phoneView==='resume'"><div class="device-app-header"><button aria-label="返回锁屏" @click="phoneView='lock'">‹</button><span>备忘录</span></div><div class="resume-page"><small>上次编辑 · 昨晚</small><h3>个人简介</h3><p>工作经历<br/>结束时间：至今</p><label>草稿<textarea v-model="draft" aria-label="编辑个人简介草稿" spellcheck="false"></textarea></label></div></template>
      <template v-else><div class="device-app-header"><button aria-label="返回锁屏" @click="phoneView='lock'">‹</button><span>奶奶</span><i>•••</i></div><div class="device-chat text-scroll"><small>今天 18:26</small><p>小满，院里的桂花开了。今年开得好，你小时候总拿碗在树底下接。</p><p>有空回来住几天。被子给你晒好了。</p><p v-if="sentReply" class="device-response">{{sentReply}}</p></div><form v-if="!sentReply" class="device-compose" @submit.prevent="sendReply"><textarea v-model="reply" rows="2" aria-label="给奶奶的回复"></textarea><button type="submit" :disabled="!reply.trim()" aria-label="发送回复">↑</button></form><small v-else class="reply-delivered" role="status">已发送</small></template>
      <button class="device-home" aria-label="返回手机锁屏" @click="phoneView='lock'"></button>
     </div></div>
    </div>
    <div class="train-scene intro-prop" :class="{'is-active':act===3,'window-clear':windowClear}" :style="presence(3)" :inert="act!==3" :aria-hidden="act!==3">
     <div class="train-window"><div class="window-land"><img :src="titleImage" alt="车窗外渐近的街巷"/></div><button class="window-mist" :aria-pressed="windowClear" aria-label="拂去车窗上的水汽" @click="windowClear=!windowClear"><span aria-hidden="true"></span></button><div class="window-rail" aria-hidden="true"></div></div>
     <button class="journey-ticket" :class="{'ticket-back':ticketBack}" aria-label="翻看车票背面" :aria-pressed="ticketBack" @click="ticketBack=!ticketBack"><template v-if="!ticketBack"><small>归 途 / HOMEBOUND</small><div><strong>城市</strong><i>→</i><strong>故乡</strong></div><p>靠窗座位 <b>小满</b></p><span class="ticket-bars" aria-hidden="true"></span></template><template v-else><small>奶奶的消息</small><p class="ticket-message">到了给我留句话。<br/>热的给你留着。</p><span>长明巷</span></template></button>
    </div>
   </div>
   <div v-if="act===4" class="arrival-door"><div class="door-panel"><span class="door-light-leak"></span><button class="door-handle" aria-label="向左拖开家门，也可按回车开门" @pointerdown.stop="grab" @pointermove.stop="pull" @pointerup.stop="release" @pointercancel="cancelDrag" @keydown.enter.stop.prevent="finish" @keydown.space.stop.prevent="finish"><span class="ring-plate"></span><span class="brass-ring"></span></button></div><div class="door-warmth" aria-hidden="true"></div></div>
   <button v-if="act<4" class="intro-down-cue" aria-label="继续这一段归途" @click="advance"><svg viewBox="0 0 40 55" fill="none" aria-hidden="true"><path d="M20 3v22M10 19l10 10 10-10M10 32l10 10 10-10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><i aria-hidden="true"></i></button>
   <div class="journey-blackout" aria-hidden="true"><span>第一章 · 归巷</span></div>
  </div><div class="journey-distance" aria-hidden="true"></div>
 </section>
</template>
<style scoped src="../../styles/intro-journey.css"></style>
