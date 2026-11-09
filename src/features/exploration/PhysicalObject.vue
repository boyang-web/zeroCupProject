<script setup lang="ts">
import{computed,ref}from'vue';import type{Asset,Exhibit}from'../../core/contracts';import AssetImage from'../../shared/AssetImage.vue';import ProgressiveText from'../../shared/ProgressiveText.vue';import{useReadingSequence}from'../../presentation/useReadingSequence';
const props=defineProps<{kind:'book'|'flip'|'unfold'|'phone';asset?:Asset;exhibit?:Exhibit;reducedMotion?:boolean}>();
const emit=defineEmits<{examined:[]}>();const opened=ref(false),examined=ref(false);
const lines=computed(()=>props.exhibit?.lines??[]);
const{visibleCounts,textDone,finishText}=useReadingSequence({texts:()=>examined.value?lines.value:[],reduced:()=>props.reducedMotion,lead:0});
const phoneView=computed(()=>props.exhibit?.phone?.view??(props.exhibit?.phone?'messages':'draft'));
function reveal(){opened.value=true;if(!examined.value){examined.value=true;emit('examined');}}
let downX=0,dragged=false;
function flip(){if(dragged){dragged=false;return;}if(opened.value)opened.value=false;else reveal();}
function end(event:PointerEvent){if(Math.abs(event.clientX-downX)>35){if(opened.value)opened.value=false;else reveal();dragged=true;}}
</script>
<template>
 <figure class="physical-object" :class="['physical-object--'+kind,{'is-open':opened}]">
  <template v-if="kind==='phone'">
   <div class="physical-phone" :class="'phone-view--'+phoneView">
    <span class="phone-camera" aria-hidden="true"></span>
    <button v-if="!opened" type="button" class="phone-lock physical-object__surface" aria-label="点亮手机屏幕" @click="reveal"><span class="phone-lock__glint"></span><span v-if="exhibit?.phone?.time" class="phone-lock__time">{{exhibit.phone.time}}</span><span class="phone-lock__light" aria-hidden="true"></span></button>
    <div v-else class="phone-app">
     <div class="phone-status" aria-hidden="true"><span>{{exhibit?.phone?.time}}</span><span class="phone-status__signals">▮▮▮ <i></i></span></div>
     <header class="phone-app__header"><small>{{exhibit?.phone?.heading??'备忘录'}}</small><h3>{{exhibit?.title}}</h3></header>
     <div class="phone-app__copy text-scroll" tabindex="0" aria-label="手机屏幕文字" @click="finishText">
      <p v-for="(line,i) in lines" v-show="(visibleCounts[i]??0)>0" :key="i" :class="{'phone-message':phoneView==='messages','phone-order-field':phoneView==='orders','phone-draft-line':phoneView==='draft'}"><ProgressiveText :text="line" :revealed="visibleCounts[i]??0" :reserve-space="false"/><i v-if="phoneView==='draft'&&i===lines.length-1&&textDone" class="phone-caret" aria-hidden="true"></i></p>
     </div>
     <small v-if="exhibit?.phone?.footer||exhibit?.footer" class="phone-app__footer">{{exhibit.phone?.footer??exhibit.footer}}</small>
    </div>
    <span class="phone-home" aria-hidden="true"></span><button v-if="opened" type="button" class="phone-power" aria-label="熄灭手机屏幕" @click="opened=false"></button>
   </div>
  </template>
  <template v-else-if="kind==='unfold'">
   <button v-if="!opened" type="button" class="letter-sealed physical-object__surface" aria-label="拆开信封" @click="reveal"><AssetImage v-if="asset" :asset="asset"/><span class="letter-addressee">{{exhibit?.addressee?exhibit.addressee+' 收':exhibit?.title}}</span><span v-if="exhibit?.sender" class="letter-sender">{{exhibit.sender}} 寄</span></button>
   <div v-else class="letter-open"><div class="letter-open__envelope" aria-hidden="true"></div><article class="letter-paper"><header><small>{{exhibit?.kicker}}</small><h3>{{exhibit?.title}}</h3></header><div class="letter-paper__copy text-scroll" tabindex="0" aria-label="信纸正文" @click="finishText"><p v-for="(line,i) in lines" v-show="(visibleCounts[i]??0)>0" :key="i"><ProgressiveText :text="line" :revealed="visibleCounts[i]??0" :reserve-space="false"/></p></div></article></div>
  </template>
  <template v-else-if="kind==='flip'">
   <button type="button" class="physical-card physical-object__surface" :class="{'physical-card--back':opened}" aria-label="翻看物件正反面" :aria-pressed="opened" @click="flip" @pointerdown="downX=$event.clientX" @pointerup="end"><span v-if="!opened" class="physical-card__front"><AssetImage v-if="asset" :asset="asset"/></span><span v-else class="physical-card__back"><small>{{exhibit?.kicker}}</small><strong>{{exhibit?.title}}</strong><span class="physical-card__copy text-scroll" @click.stop="finishText"><span v-for="(line,i) in lines" :key="i"><ProgressiveText :text="line" :revealed="visibleCounts[i]??0"/></span></span></span></button>
  </template>
  <button v-else type="button" class="physical-book physical-object__surface" aria-label="翻开旧书" @click="opened?finishText():reveal()"><span v-if="!opened" class="physical-book__cover"><strong>{{exhibit?.title??'百味录'}}</strong></span><span v-else class="physical-book__pages"><strong>{{exhibit?.title}}</strong><span v-for="(line,i) in lines" :key="i"><ProgressiveText :text="line" :revealed="visibleCounts[i]??0"/></span></span></button>
 </figure>
</template>
