"""Original quiet game sketches; no external melody, recording or sample."""
from pathlib import Path
import json, wave
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'public/assets/audio'
OUT.mkdir(parents=True,exist_ok=True)
RATE=22050
def hz(midi):return 440*2**((midi-69)/12)
def write(name,data):
    data=np.asarray(data,dtype=np.float64)
    peak=float(np.max(np.abs(data)))
    if peak: data=data/peak*(.23 if name.startswith('music')else .26)
    data[:100]*=np.linspace(0,1,100);data[-100:]*=np.linspace(1,0,100)
    pcm=(np.clip(data,-.98,.98)*32767).astype('<i2')
    with wave.open(str(OUT/(name+'.wav')),'wb')as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(RATE);f.writeframes(pcm.tobytes())
    print(name,round(len(data)/RATE,2),'seconds',flush=True)
    return {'file':name+'.wav','seconds':len(data)/RATE,'peak':float(np.max(np.abs(pcm)))/32767}
def add(buffer,start,midi,length,level=.2,pad=False):
    at=int(start*RATE);count=min(int(length*RATE),len(buffer)-at)
    if count<=0:return
    t=np.arange(count)/RATE;freq=hz(midi)
    if pad:
        env=np.sin(np.pi*np.minimum(t/.9,1)/2)**2*np.sin(np.pi*np.minimum((length-t)/1.6,1)/2)**2
        sound=(np.sin(2*np.pi*freq*t)+.13*np.sin(2*np.pi*freq*2*t+.08))*.35
    else:
        env=(1-np.exp(-t/.012))*np.exp(-t/1.3)*np.minimum((length-t)/.22,1)
        sound=np.sin(2*np.pi*freq*t)+.24*np.exp(-t/0.5)*np.sin(2*np.pi*freq*2*t)+.065*np.exp(-t/.22)*np.sin(2*np.pi*freq*3*t)
    buffer[at:at+count]+=sound*env*level
def music(kind):
    length=40;data=np.zeros(RATE*length)
    chords={'home':[(48,55,64),(45,52,60),(41,48,57),(43,50,59)],
            'day':[(48,55,64),(53,60,69),(45,52,64),(43,55,62)],
            'night':[(45,52,60),(41,48,57),(48,55,64),(43,50,62)]}[kind]
    for i,chord in enumerate(chords):
        for midi in chord:add(data,i*10,midi,10,.105,True)
    motifs={'home':[[64,67,69,67],[62,64,60],[64,62,67],[62,60]],
            'day':[[67,69,72,69],[64,67,62],[67,64,69],[64,62,60]],
            'night':[[60,64,62],[57,60],[62,60,57],[55,57]]}[kind]
    for bar,phrase in enumerate(motifs):
        for i,midi in enumerate(phrase):add(data,1+bar*10+i*1.7,midi,3.5,.15 if kind=='night'else .17)
    # Unhurried room around the phrase; two ends meet at zero without a click.
    fade=np.minimum(np.arange(len(data))/RATE/2,1)*np.minimum((len(data)-1-np.arange(len(data)))/RATE/2,1)
    return data*fade
def effect(name):
    rng=np.random.default_rng({'wood':4,'paper':8,'cup':12,'door':16}[name])
    length={'wood':.12,'paper':.28,'cup':.48,'door':.36}[name]
    t=np.arange(int(length*RATE))/RATE;noise=rng.normal(size=len(t))
    if name=='wood':
        data=(np.sin(2*np.pi*420*t)+.4*np.sin(2*np.pi*710*t))*np.exp(-t/0.026)+.09*noise*np.exp(-t/.012)
    elif name=='paper':
        smooth=np.convolve(noise,np.ones(12)/12,mode='same')
        data=(noise-smooth)*np.sin(np.pi*t/length)**2*(.35+.65*np.cos(2*np.pi*6*t)**2)
    elif name=='cup':
        data=sum(level*np.sin(2*np.pi*frequency*t)*np.exp(-t/decay)for frequency,level,decay in [(1420,1,.085),(2193,.35,.055),(3217,.1,.03)])
        data*=1-np.exp(-t/.003)
    else:
        data=.55*np.sin(2*np.pi*(160*t-70*t*t))*np.exp(-t/.11)+.3*np.convolve(noise,np.ones(28)/28,mode='same')*np.sin(np.pi*t/length)**2
    return data
report={}
for theme in ['home','day','night']:report['music-'+theme]=write('music-'+theme,music(theme))
for sound in ['wood','paper','cup','door']:report['sfx-'+sound]=write('sfx-'+sound,effect(sound))
(OUT/'manifest.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
