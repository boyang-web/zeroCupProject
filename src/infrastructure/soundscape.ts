export type MusicTheme = 'home' | 'day' | 'night';
export type SoundEffect = 'wood' | 'paper' | 'cup' | 'door';
export interface SoundLevels { music: number; effects: number; muted: boolean }
interface Player {
  loop: boolean; volume: number; currentTime: number; preload: string;
  play(): Promise<void>; pause(): void; removeAttribute(name:string):void; load():void;
}
interface Clock { now():number; request(callback:FrameRequestCallback):number; cancel(id:number):void }
interface Track { player:Player; level:number; from:number; to:number; start:number; starting:boolean; retry:boolean }
const clamp = (value:number) => Number.isFinite(value) ? Math.min(1,Math.max(0,value)) : 0;

export function createSoundscape(sources:{music:Record<MusicTheme,string>;effects:Record<SoundEffect,string>}, options:{player?:(url:string)=>Player;clock?:Clock} = {}) {
  const makePlayer = options.player ?? (url => new Audio(url));
  const clock:Clock = options.clock ?? {now:()=>performance.now(),request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id)};
  const tracks = new Map<MusicTheme,Track>(), effects = new Map<SoundEffect,Player>();
  let levels:SoundLevels = {music:.18,effects:.25,muted:false};
  let unlocked = false, active = false, disposed = false, desired:MusicTheme|undefined, frame:number|undefined, lastEffect=-Infinity;
  const fadeMs = 1300;
  function cancelFrame(){if(frame!==undefined)clock.cancel(frame);frame=undefined;}
  function tick(time:number){
    frame=undefined;let moving=false;
    for(const track of tracks.values()){
      const progress=Math.max(0,Math.min(1,(time-track.start)/fadeMs));
      track.level=track.from+(track.to-track.from)*progress;
      track.player.volume=levels.muted?0:clamp(track.level*levels.music);
      if(progress<1)moving=true;else if(track.to===0)track.player.pause();
    }
    if(moving&&!disposed)frame=clock.request(tick);
  }
  function fade(track:Track,to:number){track.from=track.level;track.to=to;track.start=clock.now();if(frame===undefined)frame=clock.request(tick);}
  async function resume(){
    if(disposed||!unlocked||!active||levels.muted||levels.music===0||!desired)return true;
    const requested=desired;
    let track=tracks.get(requested);
    if(!track){
      const player=makePlayer(sources.music[desired]);player.loop=true;player.preload='auto';player.volume=0;
      track={player,level:0,from:0,to:0,start:clock.now(),starting:false,retry:false};tracks.set(desired,track);
    }
    for(const[theme,old]of tracks)if(theme!==desired&&old.to!==0)fade(old,0);
    if(track.to===1)return true;
    if(track.starting){track.retry=true;return true;}
    track.starting=true;track.retry=false;let interrupted=false;
    try{await track.player.play();if(disposed||!active||levels.muted||levels.music===0||desired!==requested){track.player.pause();return false;}fade(track,1);return true;}
    catch(error){interrupted=error instanceof Error&&error.name==='AbortError';return false;}
    finally{track.starting=false;if(interrupted&&track.retry&&active&&!levels.muted&&desired===requested&&!disposed)queueMicrotask(()=>{void resume();});}
  }
  function silence(){
    cancelFrame();
    for(const track of tracks.values()){track.player.pause();track.player.volume=0;track.level=0;track.from=0;track.to=0;}
    for(const player of effects.values())player.pause();
  }
  return {
    async unlock(){unlocked=true;return resume();},
    setActive(value:boolean){if(value===active)return;active=value;if(!active)silence();else void resume();},
    setTheme(theme:MusicTheme|undefined){
      if(desired===theme)return;desired=theme;
      if(!theme){for(const track of tracks.values())fade(track,0);}else void resume();
    },
    setLevels(next:SoundLevels){
      levels={music:clamp(next.music),effects:clamp(next.effects),muted:!!next.muted};
      if(levels.muted){silence();return;}
      for(const track of tracks.values())track.player.volume=clamp(track.level*levels.music);
      if(levels.music===0){for(const track of tracks.values()){track.player.pause();track.to=0;track.level=0;}}
      if(levels.effects===0)for(const player of effects.values())player.pause();
      void resume();
    },
    async play(effect:SoundEffect){
      if(disposed||!active||!unlocked||levels.muted||levels.effects===0)return false;
      const time=clock.now();if(time-lastEffect<85)return false;lastEffect=time;
      let player=effects.get(effect);if(!player){player=makePlayer(sources.effects[effect]);player.preload='auto';effects.set(effect,player);}
      player.volume=levels.effects;player.currentTime=0;
      try{await player.play();return true;}catch{return false;}
    },
    dispose(){disposed=true;silence();for(const player of [...tracks.values()].map(t=>t.player).concat([...effects.values()])){player.removeAttribute('src');player.load();}tracks.clear();effects.clear();},
  };
}
