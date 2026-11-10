import{test}from'node:test';import assert from'node:assert/strict';import{effectScope,nextTick}from'vue';import{createSoundscape}from'../src/infrastructure/soundscape.ts';import{useSettings}from'../src/features/settings/useSettings.ts';
const sources={music:{home:'home.wav',day:'day.wav',night:'night.wav'},effects:{wood:'wood.wav',paper:'paper.wav',cup:'cup.wav',door:'door.wav'}};
class Player{loop=false;volume=1;currentTime=0;preload='';playing=false;plays=0;loads=0;removed:string[]=[];reject=false;pending?:()=>Promise<void>;url:string;constructor(url:string){this.url=url;}async play(){this.plays++;if(this.reject)throw Error('blocked');if(this.pending)await this.pending();this.playing=true;}pause(){this.playing=false;}removeAttribute(name:string){this.removed.push(name);}load(){this.loads++;}}
function setup(reject=false){let time=0,id=0;const callbacks=new Map<number,FrameRequestCallback>();const players:Player[]=[];const clock={now:()=>time,request:(callback:FrameRequestCallback)=>{callbacks.set(++id,callback);return id;},cancel:(key:number)=>{callbacks.delete(key);}};const audio=createSoundscape(sources,{player:url=>{const p=new Player(url);p.reject=reject;players.push(p);return p;},clock});return{audio,players,advance(ms:number){time+=ms;const ready=[...callbacks.values()];callbacks.clear();ready.forEach(c=>c(time));},callbacks};}
const settle=async()=>{await Promise.resolve();await Promise.resolve();};

test('music waits for a gesture, keeps the same room theme and crossfades chapter themes without restarting',async()=>{
 const x=setup();x.audio.setLevels({music:.2,effects:.3,muted:false});x.audio.setTheme('home');x.audio.setActive(true);assert.equal(x.players.length,0);await x.audio.unlock();x.advance(1400);
 const home=x.players[0]!;assert.equal(home.loop,true);assert.equal(home.volume,.2);home.currentTime=12;x.audio.setTheme('home');assert.equal(home.plays,1);assert.equal(home.currentTime,12);
 x.audio.setTheme('day');await settle();x.advance(650);const day=x.players.find(p=>p.url==='day.wav')!;assert.ok(home.volume>0&&day.volume>0);x.advance(800);assert.equal(home.playing,false);assert.equal(day.volume,.2);assert.equal(day.playing,true);x.audio.dispose();
});
test('muting or hiding pauses all sounds, zero music still permits effects and fast taps are limited',async()=>{
 const x=setup();x.audio.setActive(true);x.audio.setTheme('night');await x.audio.unlock();x.advance(1400);
 assert.equal(await x.audio.play('paper'),true);assert.equal(await x.audio.play('cup'),false);
 x.audio.setLevels({music:0,effects:.3,muted:false});x.advance(100);assert.equal(await x.audio.play('cup'),true);
 x.audio.setActive(false);assert.ok(x.players.every(p=>!p.playing));assert.equal(await x.audio.play('wood'),false);
 x.audio.setActive(true);x.audio.setLevels({music:.2,effects:.3,muted:true});assert.equal(await x.audio.play('wood'),false);assert.ok(x.players.every(p=>!p.playing));
 x.audio.dispose();assert.equal(x.callbacks.size,0);assert.ok(x.players.every(p=>p.loads===1&&p.removed.includes('src')));
});
test('a delayed old track cannot start after a newer theme has been selected',async()=>{
 let complete:()=>void=()=>{};const pending=new Promise<void>(resolve=>{complete=resolve;});const players:Player[]=[];let time=0;const callbacks:FrameRequestCallback[]=[];
 const audio=createSoundscape(sources,{player:url=>{const p=new Player(url);if(url==='home.wav')p.pending=()=>pending;players.push(p);return p;},clock:{now:()=>time,request:f=>{callbacks.push(f);return callbacks.length;},cancel:()=>{}}});
 audio.setTheme('home');audio.setActive(true);const unlocked=audio.unlock();audio.setTheme('day');await settle();complete();await unlocked;await settle();time=2000;callbacks.splice(0).forEach(c=>c(time));assert.equal(players.find(p=>p.url==='home.wav')!.playing,false);assert.equal(players.find(p=>p.url==='day.wav')!.playing,true);audio.dispose();
});
test('autoplay and media failures remain handled and can be retried after the next gesture',async()=>{
 const x=setup(true);x.audio.setTheme('home');x.audio.setActive(true);assert.equal(await x.audio.unlock(),false);
 // A rejected effect is a local audio failure, not a narrative transition.
 x.advance(100);assert.equal(await x.audio.play('paper'),false);
 x.audio.setActive(false);x.audio.setActive(true);await settle();x.players[0]!.reject=false;assert.equal(await x.audio.unlock(),true);x.audio.dispose();
});

test('returning to a tab during a pending media abort resumes once without a second click',async()=>{
 let abort:(error:Error)=>void=()=>{};let attempts=0;const pending=new Promise<void>((_,reject)=>{abort=reject;});
 const player=new Player('home.wav');player.pending=()=>++attempts===1?pending:Promise.resolve();
 const audio=createSoundscape(sources,{player:()=>player,clock:{now:()=>0,request:()=>1,cancel:()=>{}}});
 audio.setTheme('home');audio.setActive(true);const initial=audio.unlock();audio.setActive(false);audio.setActive(true);
 const error=new Error('interrupted');error.name='AbortError';abort(error);assert.equal(await initial,false);await settle();await settle();
 assert.equal(player.plays,2);assert.equal(player.playing,true);audio.dispose();
});
test('music, effects, mute and reduced-motion preferences roundtrip independently',async()=>{
 const data=new Map([['baiwei:settings:v1',JSON.stringify({reducedMotion:true,musicVolume:0,effectsVolume:.37,muted:true})]]);const port={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v)},removeItem:(k:string)=>{data.delete(k)}};
 const scope=effectScope();const settings=scope.run(()=>useSettings(port))!;assert.equal(settings.musicVolume.value,0);assert.equal(settings.effectsVolume.value,.37);assert.equal(settings.muted.value,true);settings.musicVolume.value=.22;settings.muted.value=false;await nextTick();
 assert.deepEqual(JSON.parse(data.get('baiwei:settings:v1')!),{reducedMotion:true,musicVolume:.22,effectsVolume:.37,muted:false});scope.stop();
});
