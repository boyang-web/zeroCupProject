import type{Hotspot}from'../core/contracts.ts';
import type{MusicTheme,SoundEffect}from'../infrastructure/soundscape.ts';
export function sceneMusic(chapterId:string):MusicTheme{return chapterId==='night'?'night':['morning','noon'].includes(chapterId)?'day':'home';}
export function objectSound(hotspot:Hotspot):SoundEffect{
  const i=hotspot.interaction;
  if(i.kind==='inspect'&&['book','flip','unfold'].includes(i.manipulation??'')||['book','letter'].includes(hotspot.icon))return'paper';
  return /杯|茶|碗/.test(hotspot.label)?'cup':'wood';
}
