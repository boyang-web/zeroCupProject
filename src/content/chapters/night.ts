import type { Chapter, Condition, Dialogue, Entry, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { nightScripts } from '../scripts/night.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const sprite = (asset: string, width: number, height: number, z = 3) => ({ asset, width, height, z });
const person = (id: string, label: string, asset: string, x: number, y: number, dialogueId: string, cameraView: string): Hotspot => ({ id, label, x, y, icon: 'talk', sprite: sprite(asset, 19, 54, 5), cameraView, interaction: { kind: 'dialogue', dialogueId } });
const ready = all(flag('night-listened'), flag('night-luo-heard'), flag('night-table-wiped'));
const unfinished = not(flag('night-ended'));
const replyText = '今晚替同事多顶一会儿。十点五十五能到，辣酱另放，带双筷子。留得下回我一声。我下班前没收到准话，就直接上车。';
export const night: Chapter = {
  id: 'night', number: 4, title: '夜里有饭', location: '夜饭小馆', subtitle: '卷帘门留着半人高。', time: '22:40 · 长明巷夜饭小馆',
  asset: 'night-front', position: 'center', tint: 'night', questId: 'night', metricIds: ['care'], next: 'epilogue',
  firstScene: 'night-front', hotspots: [], description: "你在门外闻到一点烧过酱汁的香，低头才看清半截卷帘门里面的灶火。许叔正拧抹布，抬眼认出你怀里那本书，先让进门。罗姐的包还挨着凳子，柜上的另一只饭盒却空着，两份饭各有人等。",
  objective: '擦出一张桌，分清两份饭，再把留餐的事回个准话。',
  exit: flag('night-ended'), exitHint: '许叔还没把今晚的事交代完。去柜边听他说完，再离店。', exitLabel: '合上书，离开小馆',
  revisitDescription: "当晚用过的纸夹仍放在干柜那一侧。哪句回过、哪份交走，新的时间都能照原纸认，没接上的地方也还留着。许叔拿着钥匙，等你收齐自己的东西，再往门边让。",
  beats: [{ label: '听清两份饭，擦好桌', condition: ready }, { label: '看小梁的回信', condition: flag('night-reply-read') }, { label: '核对堂食与留餐', condition: flag('night-played') }, { label: '回信并听完锁门前的话', condition: flag('night-ended') }],
  scenes: [
    { id: 'night-front', title: '店门', time: '22:40 · 还有两份饭', asset: 'night-front', description: "卷帘门底下漏着光，碗勺的响声从灶边传来。你抱着书走近，先给罗姐提包让开一点位置，她还顾着往路口看，又回头问豆腐有没有留着。",
      variants: [{ condition: flag('night-ended'), time: '23:00 · 回看今晚的店门', description: '罗姐已经赶车去了。许叔收起碗，卷帘门就要放到底。' }, { condition: flag('night-played'), time: '22:48 · 罗姐吃完，起身赶车' }],
      camera: { views: [{ id: 'owner', label: '柜旁的许叔', x: 79, y: 58, zoom: 1.35 }, { id: 'table', label: '靠门小方桌', x: 19, y: 60, zoom: 1.65 }, { id: 'luo', label: '赶末班车的罗姐', x: 38, y: 56, zoom: 1.4 }, { id: 'note', label: '门边纸条', x: 68, y: 39, zoom: 1.8 }] },
      links: [{ sceneId: 'night-kitchen', label: '进灶边，核对两份饭', condition: ready, unavailable: '先跟许叔和罗姐说话，再把靠门那张桌擦好。' }],
      hotspots: [
        person('night-person', '许叔', 'night-xu', 79, 94, 'night-talk', 'owner'),
        { ...person('night-luo', '罗姐', 'night-luo', 38, 91, 'night-luo-talk', 'luo'), condition: not(flag('night-luo-left')), variants: [{ condition: flag('night-played'), asset: 'night-luo-seated', x: 29, y: 89, width: 18, height: 44, cameraView: 'table' }] },
        {
  "id": "night-table",
  "label": "桌角的抹布",
  "x": 10.5,
  "y": 64,
  "cameraView": "table",
  "icon": "look",
  "sprite": {
    "asset": "night-cloth",
    "width": 6,
    "height": 3.5,
    "z": 3
  },
  "completed": {
    "kind": "flag",
    "id": "night-table-wiped"
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "night-table-wiped"
      },
      "x": 10,
      "y": 61.5,
      "width": 5,
      "height": 3
    }
  ],
  "drag": {
    "actionId": "night-wipe",
    "target": {
      "x": 9,
      "y": 60,
      "width": 16,
      "height": 5
    },
    "hint": "把左侧的抹布拖过桌面，也可点开擦桌。"
  },
  "interaction": {
    "kind": "inspect",
    "text": "你看到桌沿留着一圈水印，罗姐的包刚从凳上提起来，空出的地方正好能让人坐下。抹布在左边，你捏着一角提起，先看了一眼还有什么得让开，免得擦的时候把东西扫到地上。\n\n白天在店里搭过几次手，你起初总怕碰错、拿错，别人一招呼，又想一下替人都弄好。这会儿桌面就这么大一点，你把书先放到干柜上，空出两只手，想先将眼前这一块照顾稳当。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "night-table-wiped"
        },
        "text": "罗姐坐下来，将包带从凳脚边勾出来，先搭到自己伸手够得着的位置。她见你还站着，朝空处让了让，说坐一下也成，不用忙完这一点又去找下一样。你将手擦干，才觉得刚才抱书的那边胳膊还酸着。"
      }
    ],
    "options": [
      {
        "id": "night-wipe",
        "label": "把这张桌擦干净",
        "effects": [
          {
            "kind": "flag",
            "id": "night-table-wiped"
          }
        ],
        "feedback": "你把水渍擦净，将布叠到桌角。罗姐把凳子往里收一点，朝你笑：“这就好了，碗放得稳，我也能看着路口。你歇会儿，别光顾替我们忙。”你把书拿回身侧，给许叔端碗留出路。"
      }
    ]
  }
},
        {
  "id": "night-note",
  "label": "门边留餐纸条",
  "x": 68,
  "y": 43,
  "cameraView": "note",
  "icon": "letter",
  "sprite": {
    "asset": "night-clip",
    "width": 5,
    "height": 12,
    "z": 3
  },
  "completed": {
    "kind": "clue",
    "id": "late-note"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "unfold",
    "text": "你把纸拿近，读到十点四十后头那声谢谢。字挤得紧，倒像手机上顺手回一句，落到纸上也舍不得漏。翻到背面，许叔又添了今夜待确认，笔迹跟前头不一样。\n\n你原本以为只要认准一个时间，留饭的事就有了着落。许叔见你拿着，朝干台上的手机比了一下，说这是上回的，小梁这次还在回话。他没把旧纸扔掉，只叫你看完放回单独那只夹子里，等新的准话来了，才好一起对。",
    "exhibit": {
      "kind": "note",
      "kicker": "门边 · 小梁原来的约定",
      "title": "十点四十，谢谢",
      "lines": [
        "十点四十，麻烦留一份。",
        "谢谢。",
        "今夜待确认。"
      ]
    },
    "action": {
      "id": "night-read",
      "label": "记下纸条上的字",
      "effects": [
        {
          "kind": "clue",
          "id": "late-note"
        }
      ]
    }
  }
},
        {
  "id": "night-served-bowl",
  "label": "罗姐的那碗饭",
  "x": 19.5,
  "y": 64,
  "cameraView": "table",
  "icon": "look",
  "sprite": {
    "asset": "night-bowl",
    "width": 9,
    "height": 6.5,
    "z": 3
  },
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "night-played"
      },
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "night-luo-left"
        }
      }
    ]
  },
  "interaction": {
    "kind": "inspect",
    "text": "饭刚端上桌，罗姐先拨开碗沿的辣酱，夹一块豆腐尝，接着才添过去一点。你站在旁边看，那一口吃完，她又自己拨了一点，倒没有像你原先想着的，赶时间就得赶紧拌匀吃。\n\n她将压着的包带抽出来，让你替她扶一下椅背，说东西先理好，吃完一提就走，心里反而不急。你扶稳了，等她坐好才松手，没有再站在桌边替她盯着每一口。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "night-luo-left"
        },
        "text": "罗姐把吃完的碗送到柜边，筷子摆在碗沿，包往肩上一提就走了。她赶十点五十那班车，门口没有留下等着再问什么的人，饭这一份也已经收清。"
      }
    ]
  }
},
      ] },
    { id: 'night-kitchen', title: '灶边', time: '22:40—22:48 · 分装', asset: 'night-kitchen', description: "灶边暖一些，锅盖旁的水汽慢慢散。许叔给你指干台那一头，书能先放稳，空碗和盒子各占着一点地方，手机也在他一伸手就拿得到的位置。",
      variants: [{ condition: flag('night-ended'), time: '回看今晚的灶边', description: '灶火关了，锅盖合着，擦过的台面已经干了。柜边还夹着今晚那张新条。' }],
      camera: { views: [{ id: 'reply', label: '干台边的回信', x: 40, y: 52, zoom: 1.8 }, { id: 'packing', label: '分装台', x: 54, y: 54, zoom: 1.65 }, { id: 'xu', label: '灶旁的许叔', x: 74, y: 56, zoom: 1.35 }] },
      links: [{ sceneId: 'night-front', label: '回店门的小方桌' }, { sceneId: 'night-counter', label: '去柜边交接', condition: flag('night-played'), unavailable: '先读小梁的回信，核对两张分装单。' }],
      hotspots: [
        { ...person('night-xu-kitchen', '灶旁的许叔', 'night-xu', 74, 94, 'night-kitchen-talk', 'xu'), condition: not(flag('night-luo-left')) },
        {
  "id": "night-phone",
  "label": "许叔让你看的回信",
  "x": 40,
  "y": 57,
  "cameraView": "reply",
  "icon": "look",
  "sprite": {
    "asset": "night-phone",
    "width": 7,
    "height": 4,
    "z": 3
  },
  "completed": {
    "kind": "flag",
    "id": "night-reply-read"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "phone",
    "text": "许叔手上还有水，用手背把手机往你这边转，叫你念新来的这条。你看见前头几条消息的边，想起他刚才叮嘱过，便只停在他指给你的地方，没有再往上划。\n\n十点五十五能到，辣酱另放，带双筷子。你先将这几件念出来，手指已经下意识地想去回一个好，又读到最后：下班前没收到准话，就直接上车。许叔听见这一句，自己也凑过来看。\n\n你将手机放稳，忽然有点懂他为什么还不盛饭。人还站在那边等着答复，屏幕上的这个能到，原来不是饭做好了就会自己走到门口。你又从最后那一句开始念了一遍，等他点头。",
    "exhibit": {
      "kind": "note",
      "kicker": "22:42 · 小梁的订餐回信",
      "title": "今晚改点",
      "phone": {
        "time": "22:42",
        "heading": "小梁 · 订餐消息",
        "view": "messages",
        "footer": "22:42 收到"
      },
      "lines": [
        "今晚替同事多顶一会儿。十点五十五能到，辣酱另放，带双筷子。留得下回我一声。我下班前没收到准话，就直接上车。"
      ]
    },
    "action": {
      "id": "night-read-reply",
      "label": "把这条回信念给许叔",
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "flag",
            "id": "night-listened"
          },
          {
            "kind": "flag",
            "id": "night-luo-heard"
          },
          {
            "kind": "flag",
            "id": "night-table-wiped"
          }
        ]
      },
      "effects": [
        {
          "kind": "flag",
          "id": "night-reply-read"
        },
        {
          "kind": "clue",
          "id": "night-reply"
        }
      ]
    },
    "options": [
      {
        "id": "night-recall-message",
        "label": "再想一想，那次晚归回过的话。",
        "condition": {
          "kind": "flag",
          "id": "night-reply-read"
        },
        "effects": [
          {
            "kind": "clue",
            "id": "night-riceball"
          }
        ],
        "feedback": "你想起有回很晚才往住处走，便利店只剩一个饭团。站到门外拆包装时，奶奶问到家没有，你手指冷，打得也快，只回一句快了。袋口一直没找准，最后连边上一块米都扯掉，手机却还放在窗台边，怕她再问一句，就得把其实还没到的事说全。后来回去了，那半句也没再补。"
      }
    ]
  }
},
        { id: 'night-object', label: '分装台上的空饭盒', x: 59, y: 57, cameraView: 'packing', icon: 'look', sprite: sprite('night-box', 12, 10), completed: flag('night-played'), condition: all(unfinished, not(flag('night-luo-left'))),
          interaction: { kind: 'minigame', gameId: 'night-game' } },
        {
  "id": "night-kitchen-bowl",
  "label": "堂食的浅碗",
  "x": 48,
  "y": 56.5,
  "cameraView": "packing",
  "icon": "look",
  "sprite": {
    "asset": "night-empty-bowl",
    "width": 8,
    "height": 6,
    "z": 3
  },
  "condition": {
    "kind": "not",
    "condition": {
      "kind": "flag",
      "id": "night-played"
    }
  },
  "interaction": {
    "kind": "inspect",
    "text": "你将手掌在浅碗边比了比，同样一份饭，摊在这里，跟装进盒子看着就不一样。碗沿有个小小的旧磕印，许叔伸手转了个方向，叫它背着端碗的手。\n\n罗姐说辣酱放边上，自己先尝一口，你便给碗边留出地方。另一只盒子还空着，许叔看过手机才会来盛，你把伸到锅铲旁的手收回来，先替他将两张纸各放到顺眼的一侧。"
  }
},
      ] },
    { id: 'night-counter', title: '柜边', time: '22:48 · 回个准话', asset: 'night-counter', description: "离开灶边，柜面显得宽一点，纸夹、空盒和手机不必挨得那么紧。门边一盏小灯留着暖光，外头偶尔有人走过，柜里的人便会抬头听一听。",
      variants: [{ condition: flag('night-ended'), time: '23:00 · 门灯熄了', description: '许叔把手机扣下，伸手去拉卷帘门。今晚的事写在新条上。' }, { condition: flag('night-wait'), time: '23:00 · 没有人来取' }, { condition: flag('night-reserve'), time: '22:55 · 小梁到了' }, { condition: flag('night-luo-left'), time: '22:48 · 罗姐赶车去了' }],
      camera: { views: [{ id: 'xu', label: '柜边的许叔', x: 47, y: 55, zoom: 1.35 }, { id: 'handoff', label: '留餐夹', x: 37, y: 34, zoom: 1.8 }, { id: 'lamp', label: '门边小灯', x: 10, y: 47, zoom: 1.8 }, { id: 'box', label: '柜上的交接处', x: 67, y: 48, zoom: 1.7 }, { id: 'old-sign', label: '柜台下的旧牌', x: 60, y: 74, zoom: 1.7 }, { id: 'liang', label: '小梁', x: 85, y: 58, zoom: 1.35 }] },
      links: [{ sceneId: 'night-kitchen', label: '回灶边看看' }],
      hotspots: [
        person('night-xu-counter', '柜边的许叔', 'night-xu', 47, 94, 'night-handoff', 'xu'),
        { id: 'night-handoff-clip', label: '留餐夹 · 确认回信', x: 37, y: 42, cameraView: 'handoff', icon: 'talk', sprite: sprite('night-clip', 6, 14), interaction: { kind: 'dialogue', dialogueId: 'night-handoff' } },
        {
  "id": "night-old-sign",
  "label": "柜台下的旧牌",
  "x": 60,
  "y": 80,
  "cameraView": "old-sign",
  "icon": "look",
  "sprite": {
    "asset": "night-sign",
    "width": 7,
    "height": 11,
    "z": 3
  },
  "completed": {
    "kind": "clue",
    "id": "night-old-sign"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你在柜台下看见那块旧牌，正面仍写晚点来也行。几个字不小，往门外一挂，走近的人总认得出；背后补的二十三点收却朝着里面，得拿起来转过来才看清。\n\n许叔说有个人照着前头那句，十一点半还跑来，他那会儿都收好了。你听见也跟着笑了一下，想起自己说等会儿时，总觉得对方该知道是多大一会儿，真问起来，嘴里又没个具体的点。\n\n你将牌照原处放稳，没再替他挂出去。柜上的新纸已经留出写时间的地方，这一回，他想让站门口的人也看得见。",
    "exhibit": {
      "kind": "note",
      "kicker": "许叔后来补在背面的字",
      "title": "23:00 收",
      "lines": [
        "晚点来也行。",
        "23:00 收。"
      ]
    },
    "action": {
      "id": "night-read-sign",
      "label": "翻看旧牌背面",
      "effects": [
        {
          "kind": "clue",
          "id": "night-old-sign"
        }
      ]
    }
  }
},
        {
  "id": "night-lamp",
  "label": "照着巷口的小灯",
  "x": 9,
  "y": 54,
  "cameraView": "lamp",
  "icon": "look",
  "sprite": {
    "asset": "night-lamp-on",
    "width": 6,
    "height": 14,
    "z": 3
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "night-ended"
      },
      "asset": "night-lamp-off"
    }
  ],
  "interaction": {
    "kind": "inspect",
    "text": "你从柜边望出去，小灯把里面照得亮，光却没怎么落到巷口。刚来时你也在外头站了一下，先闻见菜香，才敢低头往门里看。\n\n罗姐见你看灯，说自己方才差点走过，还想着老许今天怎么收这么早。许叔听见，只叫她先吃热的，说等会儿他来收线。你留意着那道光，没有再隔着半条巷子替别人断定这里一定还开着。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "night-ended"
        },
        "text": "门边的小灯熄了，柜下那块旧牌便没刚才看得清。许叔拿好钥匙，站在门内等你。你摸过手机，又将露在书外的纸角压回去，才往门口走，不让他锁好以后再替自己折回来。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "night-luo-left"
        },
        "text": "罗姐转过的小灯正照着巷口，她自己已经提包赶车去了。你从柜边看出去，门槛亮了一块，刚才在路口要停一下才能认出的门，这会儿离远些也看得见。许叔回头顺了顺灯线，给进来的人留出脚下。"
      }
    ]
  }
},
        {
  "id": "night-waiting-box",
  "label": "柜上待装的饭盒",
  "x": 66,
  "y": 53,
  "cameraView": "box",
  "icon": "look",
  "sprite": {
    "asset": "night-box",
    "width": 9,
    "height": 7.5,
    "z": 3
  },
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "night-played"
      },
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "night-box-removed"
        }
      }
    ]
  },
  "interaction": {
    "kind": "inspect",
    "text": "你又碰了一下盒边的搭扣，刚才试过，松紧已经心里有数。空盒底下压着那张留餐单，旁边的小杯和筷子各放一边，饭菜仍留在锅里。\n\n许叔看见你的手，先叫别急着找锅铲，说他得把消息回完。你便将盖子轻轻搭回去。刚才很想趁有空多做一点，这会儿才肯先放下，等那边真正说准了再伸手。"
  }
},
        {
  "id": "night-returned-bowl",
  "label": "罗姐送回的空碗",
  "x": 58,
  "y": 52.5,
  "cameraView": "box",
  "icon": "look",
  "sprite": {
    "asset": "night-empty-bowl",
    "width": 5.5,
    "height": 3.8,
    "z": 3
  },
  "condition": {
    "kind": "flag",
    "id": "night-luo-left"
  },
  "interaction": {
    "kind": "inspect",
    "text": "罗姐送回来的碗留在柜面左侧，沿口还沾着一点辣酱，筷子并得很整齐。她掏钱时还顾得上把它们放稳，提起包才往路口走，倒不像你一听见末班车就替她想的那样，什么都顾不上。\n\n许叔路过看了一眼，朝你比比旁边的空处，叫纸别压着碗沿。你将书往自己身侧收一点，给他留出伸手来接的位置。"
  }
},
        { ...person('night-liang', '小梁', 'night-liang', 85, 95, 'night-liang-talk', 'liang'), condition: all(flag('night-arrived'), not(flag('night-pickup'))) },
        {
  "id": "night-record",
  "label": "今晚的新条",
  "x": 73.5,
  "y": 51.5,
  "cameraView": "box",
  "icon": "letter",
  "sprite": {
    "asset": "night-flat-note",
    "width": 6,
    "height": 3,
    "z": 3
  },
  "condition": {
    "kind": "flag",
    "id": "night-ended"
  },
  "interaction": {
    "kind": "inspect",
    "text": "你把新条放到干的柜面，十一点落锁另起一行，许叔拿过来看，先用手背碰一下柜沿，确认不湿，才将纸夹挪过去。\n\n你写到这里，笔还想顺着往后走，他却已经去找钥匙了。今晚见过的、说定的，都在这几行里，没再发生的那一段，就先留给以后碰面时再问。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "night-legacy"
        },
        "text": "旧纸只留着那次的决定，后头没有接字。你拿近又认了一遍，许叔等着，没有替空白添一个后来。你把它原样夹好，今晚新听到的另找地方记，免得下回自己也分不清哪次是哪次。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "night-pickup"
        },
        "text": "你将十点五十五取到饭、改时间先回信、十一点落锁，念给许叔听。他听到最后那行，点点头，让新条夹在明天一来就能看见的地方。\n\n还有一张折向里面，你没有跟着展开。柜上已经没有待取的饭盒，小梁走时提稳袋子的样子，你记得，纸上却只留双方说准的几件。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "night-called-off"
        },
        "text": "新条上写着已发取消，这份饭没有交出去，十一点落锁。你原来写快了，后头差点接一个已回，读到手机上没有新消息，才停住，将空处留着。\n\n许叔看完把纸夹好，柜里的空盒也有了位置。小梁看到没有、那时走到哪儿，今晚没有听到，你不替他往下接。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "night-missed"
        },
        "text": "你将没有回信写在时间下面，许叔看见，先指了指手机，说自己刚才漏的就是这一句。空盒收了，饭没提前盛出来，十一点照时落锁，这些都还能照着认。\n\n你把笔停在后头，没有再补也许人已经坐车去了。门口没见到的事，现在多写两句，也替不了当时该回的那一声。"
      }
    ]
  }
},
      ] },
  ],
};
const xuNodes: DialogueSeed[] = [
  { id: 'opening', speaker: '许叔',  choices: [{ id: 'night-listen', label: '订好的那份，留到几点？', next: 'concern', effects: [{ kind: 'flag', id: 'night-listened' }, { kind: 'metric', id: 'care', amount: 1 }] }, { id: 'night-bye', label: '我先看看桌子。', effects: [] }] },
  { id: 'concern', speaker: '许叔',   choices: [{ id: 'night-thanks', label: '我再问问这位客人怎么吃。', effects: [] }, { id: 'night-ask-shift', label: '他每晚都这个点来？', condition: clue('late-note'), next: 'shift', effects: [] }] },
  { id: 'shift', speaker: '许叔',  choices: [{ id: 'night-shift-close', label: '我记住了。', effects: [] }] },
  { id: 'preparing', speaker: '许叔',  choices: [{ id: 'night-preparing-close', label: '好，我过去。', effects: [] }, { id: 'night-preparing-ask-shift', label: '纸条上订饭的人，每晚都这个点来？', condition: clue('late-note'), next: 'shift', effects: [] }] },
  { id: 'after-game', speaker: '许叔',  choices: [{ id: 'night-after-game-close', label: '我去柜边。', effects: [] }] },
  { id: 'after', speaker: '许叔',  choices: [{ id: 'night-after-close', label: '书在这儿。你也早点回。', effects: [] }] },
];
const handoffNodes: DialogueSeed[] = [
  { id: 'xu-opening', speaker: '许叔',  choices: [{ id: 'night-xu-let-luo-leave', label: '给罗姐让出送碗的地方。', next: 'luo-leaves', effects: [] }] },
  { id: 'not-ready', speaker: '许叔',  choices: [{ id: 'night-counter-prepare', label: '先去灶边。', effects: [] }] },
  { id: 'luo-leaves', speaker: '罗姐', portrait: 'night-luo',   choices: [{ id: 'night-luo-leave', label: '慢点走。把灯留朝着巷口。', next: 'decision', effects: [{ kind: 'flag', id: 'night-luo-left' }] }] },
  { id: 'decision', speaker: '许叔',   choices: [
    { id: 'night-agree', label: '回他，十一点前都能取。到巷口看门灯。', decision: 'night', next: 'pickup-arrival', effects: [{ kind: 'flag', id: 'night-reserve' }] },
    { id: 'night-cancel', label: '今晚先撤，告诉他可以直接上车。', decision: 'night', next: 'cancelled', effects: [{ kind: 'flag', id: 'night-cancel-sent' }] },
    { id: 'night-overpromise', label: '先照旧摆着，等他来再说。', decision: 'night', next: 'missed', effects: [{ kind: 'flag', id: 'night-wait' }] },
    { id: 'night-later', label: '我再看看，先不定。', effects: [] },
  ] },
  { id: 'pickup-arrival', speaker: '许叔',   choices: [{ id: 'night-pass-box', label: '把饭盒递过去。', next: 'liang', effects: [{ kind: 'flag', id: 'night-arrived' }, { kind: 'flag', id: 'night-box-removed' }] }] },
  { id: 'xu-liang', speaker: '许叔',  choices: [{ id: 'night-xu-listen-liang', label: '转向小梁，听他说完。', next: 'liang', effects: [] }] },
  { id: 'liang', speaker: '小梁', portrait: 'night-liang',   choices: [{ id: 'night-pickup-record', label: '只记取餐办法，把那句私话另折起来。', next: 'closing', effects: [{ kind: 'flag', id: 'night-pickup' }, { kind: 'clue', id: 'night-record-pickup' }, { kind: 'clue', id: 'night-private-liang' }, { kind: 'quest', id: 'night', status: 'completed' }] }] },
  { id: 'cancelled', speaker: '许叔',   choices: [{ id: 'night-cancel-record', label: '记下已发取消，没把这份饭交出去。', next: 'closing', effects: [{ kind: 'flag', id: 'night-called-off' }, { kind: 'flag', id: 'night-box-removed' }, { kind: 'clue', id: 'night-record-cancelled' }, { kind: 'quest', id: 'night', status: 'completed' }] }] },
  { id: 'missed', speaker: '许叔',   choices: [{ id: 'night-missed-record', label: '记下没有回信，也没人来取。', next: 'closing', effects: [{ kind: 'flag', id: 'night-missed' }, { kind: 'flag', id: 'night-box-removed' }, { kind: 'clue', id: 'night-record-missed' }, { kind: 'quest', id: 'night', status: 'failed' }] }] },
  { id: 'closing', speaker: '许叔',   choices: [{ id: 'night-lock-up', label: '把“十一点落锁”写进店记。', condition: flag('night-pickup'), next: 'after', effects: [{ kind: 'flag', id: 'night-ended' }] }, { id: 'night-fold-xu-note', label: '店记写关门时间，许叔的私话另折起来。', condition: not(flag('night-pickup')), next: 'after', effects: [{ kind: 'flag', id: 'night-ended' }, { kind: 'clue', id: 'night-private-xu' }] }] },
  { id: 'after', speaker: '许叔',   choices: [{ id: 'night-farewell', label: '收好书和随身的东西。', effects: [] }] },
  // Compatibility flag is produced only by migration, and described here for content/save validation.
  { id: 'legacy', speaker: '许叔',  choices: [{ id: 'night-legacy-close', label: '保留原来的记录。', effects: [{ kind: 'flag', id: 'night-legacy' }, { kind: 'flag', id: 'night-ended' }] }] },
];
const nightDialogueSeeds: (Omit<Dialogue, 'nodes'> & { nodes: DialogueSeed[] })[] = [
  { id: 'night-talk', entry: 'opening', entries: [{ condition: flag('night-ended'), nodeId: 'after' }, { condition: flag('night-luo-left'), nodeId: 'counter-progress' }, { condition: flag('night-played'), nodeId: 'after-game' }, { condition: flag('night-listened'), nodeId: 'preparing' }], nodes: [...xuNodes, { id: 'counter-progress', speaker: '许叔',  choices: [{ id: 'night-return-counter', label: '回柜边接着说。', effects: [] }] }].map(n => ({ portrait: 'night-xu', ...n })) },
  { id: 'night-luo-talk', entry: 'opening', entries: [{ condition: flag('night-luo-left'), nodeId: 'departed' }, { condition: flag('night-played'), nodeId: 'eating' }], nodes: [{ id: 'opening', speaker: '罗姐', portrait: 'night-luo',  choices: [{ id: 'night-luo-order', label: '堂食一碗，辣酱碗沿，筷子碗边。', effects: [{ kind: 'flag', id: 'night-luo-heard' }] }] }, { id: 'eating', speaker: '罗姐', portrait: 'night-luo',   choices: [{ id: 'night-luo-eating-close', label: '好，我去柜边。', effects: [] }] }, { id: 'departed', speaker: '柜边',  choices: [{ id: 'night-luo-departed-close', label: '放下碗，回许叔那边。', effects: [] }] }] },
  { id: 'night-kitchen-talk', entry: 'opening', entries: [{ condition: flag('night-ended'), nodeId: 'after' }, { condition: flag('night-played'), nodeId: 'prepared' }, { condition: flag('night-tofu-tasted'), nodeId: 'again' }], nodes: [
    { id: 'opening', speaker: '许叔', portrait: 'night-xu', choices: [
      { id: 'night-kitchen-close', label: '我看看手机，再核对分装。', effects: [] },
      { id: 'night-watch-tofu', label: '这面煎到什么样才能翻？', next: 'watch', condition: all(ready, unfinished, not(flag('night-played'))), effects: [] },
    ] },
    { id: 'watch', speaker: '许叔', portrait: 'night-xu', choices: [
      { id: 'night-tofu-early', label: '拿铲子试着翻一翻。', next: 'early', effects: [] },
      { id: 'night-tofu-wait', label: '先等一等，看许叔翻面。', next: 'turn', effects: [] },
      { id: 'night-tofu-later', label: '先放下铲子，待会儿再看。', effects: [] },
    ] },
    { id: 'early', speaker: '许叔', portrait: 'night-xu', choices: [{ id: 'night-tofu-steady', label: '先停手，等豆腐煎定。', next: 'turn', effects: [] }] },
    { id: 'turn', speaker: '许叔', portrait: 'night-xu', choices: [{ id: 'night-tofu-sauce', label: '看看什么时候添汁。', next: 'sauce', effects: [] }] },
    { id: 'sauce', speaker: '许叔', portrait: 'night-xu', choices: [{ id: 'night-tofu-taste', label: '吹凉一点汤汁，尝尝豆腐。', next: 'taste', effects: [] }] },
    { id: 'taste', speaker: '许叔', portrait: 'night-xu', choices: [{ id: 'night-tofu-finish', label: '记下煎定再翻，添汁后尝着收。', effects: [{ kind: 'flag', id: 'night-tofu-tasted' }] }] },
    { id: 'again', speaker: '许叔', portrait: 'night-xu', choices: [{ id: 'night-tofu-again-close', label: '记好了，先对分装单。', effects: [] }] },
    { id: 'after', speaker: '许叔', portrait: 'night-xu',  choices: [{ id: 'night-kitchen-after', label: '好。', effects: [] }] },
    { id: 'prepared', speaker: '许叔', portrait: 'night-xu',  choices: [{ id: 'night-kitchen-prepared', label: '去柜边。', effects: [] }] },
  ] },
  { id: 'night-handoff', entry: 'xu-opening', entries: [
    { condition: flag('night-legacy'), nodeId: 'legacy' }, { condition: flag('night-ended'), nodeId: 'after' },
    ...['night-pickup', 'night-called-off', 'night-missed'].map(id => ({ condition: flag(id), nodeId: 'closing' })),
    { condition: flag('night-arrived'), nodeId: 'xu-liang' }, { condition: flag('night-reserve'), nodeId: 'pickup-arrival' }, { condition: flag('night-cancel-sent'), nodeId: 'cancelled' }, { condition: flag('night-wait'), nodeId: 'missed' }, { condition: flag('night-luo-left'), nodeId: 'decision' }, { condition: not(flag('night-played')), nodeId: 'not-ready' },
  ], nodes: handoffNodes.map(n => ({ portrait: 'night-xu', ...n })) },
  { id: 'night-liang-talk', entry: 'opening', entries: [{ condition: flag('night-pickup'), nodeId: 'departed' }, { condition: not(flag('night-arrived')), nodeId: 'awaiting' }], nodes: [
    { id: 'opening', speaker: '小梁', portrait: 'night-liang',   choices: [
      { id: 'night-liang-record', onceKey: 'night-pickup-record', label: '只记取餐办法，把那句私话另折起来。', effects: [{ kind: 'flag', id: 'night-pickup' }, { kind: 'clue', id: 'night-record-pickup' }, { kind: 'clue', id: 'night-private-liang' }, { kind: 'quest', id: 'night', status: 'completed' }] },
      { id: 'night-liang-close', label: '回柜边，听完交接。', effects: [] },
    ] },
    { id: 'awaiting', speaker: '柜边',  choices: [{ id: 'night-liang-await-close', label: '先找许叔。', effects: [] }] },
    { id: 'departed', speaker: '柜边',  choices: [{ id: 'night-liang-departed-close', label: '回许叔那边。', effects: [] }] },
  ] },
];
export const nightDialogues: Dialogue[] = nightDialogueSeeds.map(({nodes,...dialogue}) => ({ ...dialogue, nodes:nodes.map(node => scriptNode(node,nightScripts[dialogue.id]?.[node.id])) }));
export const nightGame: MinigameDefinition = {
  id: 'night-game', chapterId: 'night', module: 'dual-packing', title: '一碗堂食，一盒带走', target: 100, assistedItem: 'insulated-bag',
  description: '先选一张单，再核对容器、饭菜、辣酱和筷子。罗姐的饭先盛；小梁那份排好分装单，等回信再盛。',
  condition: all(ready, flag('night-reply-read'), unfinished), unavailable: '先听清两位的要求、擦好桌，再读灶边的小梁回信。',
  packing: { orders: [
    { id: 'luo', person: '罗姐 · 堂食', hint: '浅碗，辣酱碗沿，筷子碗边；赶 22:50 末班车。', vessel: 'bowl', sauce: 'rim', utensils: 'beside' },
    { id: 'liang', person: '小梁 · 留餐', hint: '22:55 能到，辣酱另杯，筷子盒外；没收到准话就上车。', vessel: 'box', sauce: 'cup', utensils: 'outside' },
  ] },
  reward: { id: 'night-game-reward', label: '这碗先端走，空盒等回信', feedback: "搭扣试响了一声，许叔将筷子挪到盒外，叫你把好掰的那侧朝外留。罗姐的浅碗端走，另一只饭盒仍空着，他回头交代：“这个等回信再盛，东西分清了就别又拿来装一遍。”", effects: [{ kind: 'flag', id: 'night-played' }, { kind: 'metric', id: 'care', amount: 1 }] },
};
export const nightClues: Entry[] = [
  {
  "id": "night-reply",
  "title": "小梁改到五十五",
  "text": "小梁说十点五十五能到，辣酱另放，筷子留在盒外。最后还跟着一句，下班前没收到准话，就直接上车。许叔只让我看这条新消息，我从头念完，又回到最后那一行。人要从哪边出来，得等这边先答一声。",
  "category": "detail",
  "asset": "night-phone"
},
  {
  "id": "night-old-sign",
  "title": "旧牌背面的时间",
  "text": "旧牌正面说晚点来也行，背面补二十三点收。许叔说真有人十一点半才来，到了门口看见锁，还以为他临时早收。前头那句是他自己写的，后来补的时间又藏在背面，他也知道光怪人家没看见不成。",
  "category": "detail",
  "asset": "night-sign"
},
  {
  "id": "night-riceball",
  "title": "我只回了两个字",
  "text": "那回走到便利店，架上只剩一个饭团。我拿到门口拆，包装上的口怎么也找不准，手指冷，手机却在这时亮起来。奶奶问到家没有，我没多想，先回了快了。\n\n回完仍站在店外。袋子撕开，连边上一块米也扯掉了，我将那一点拣回来，眼睛又往窗台上的屏幕看。怕她再问吃饭没，怕真接着说，就得把今天那点不顺也从头讲。两字打得那么快，像只要她先放心，我就能先不想后面怎样。\n\n后来到了住处，鞋都没换好，便把手机扣到桌上。屏幕没有再亮，我也没有补上那句到了。第二天看见她早上发的消息，想说的时候，又觉得隔了一晚，听着像特意翻出一件小事。\n\n今天许叔叫我把回信念全，听到没收到准话就上车，手指又记起自己按那两个字有多快。柜上的饭盒还空着，我却已经想起家里那只留给我的杯子。回去以后，我想先陪奶奶坐一下，不从书里第几页开始报。",
  "category": "life",
  "asset": "night-phone"
},
  {
  "id": "night-record-pickup",
  "title": "手套还没摘",
  "text": "小梁扶着卷帘门进来，手套还没摘，眼睛先找柜上的饭。许叔刚盛好，他接近了又停一下，要看扣子朝哪边，像怕一使劲，整盒热的就从手里晃出去。\n\n我托着盒底，叫他从好掰的那侧试。他试开，笑着说上回在车上费半天劲，邻座都想替他帮一把，等真开了，豆腐已经不怎么热。话说着，手也一直没有离开盒沿。\n\n十点五十五，人到底到了，先前在手机上来回认的几句，这会儿都有一双手、一条要走的路。我还捏着笔，准备再问一点，他却把声音放低，说有句话不想写出去，免得下回来吃饭，又叫熟人追着问。\n\n我先把笔放下。怎么回信、到门口怎么拿，这些够留在书里；他为什么晚来，不必为了我多添一页，就全讲给别人听。\n\n他提稳袋子，看了一眼路口，等我将那张纸折好。我往旁边让开，没再拦着问下一句，听见他低头出门时还说了一声谢谢。",
  "category": "life",
  "asset": "night-packed-box"
},
  {
  "id": "night-record-cancelled",
  "title": "还没有新的回复",
  "text": "取消那句发出去，屏幕上写着送达，下面仍空着。我盯了一会儿，心里很想等个收到，像有了这两字，今晚这件事才算真落了地。\n\n许叔也看过，没有将手机急着收回口袋。他说舍不得，做买卖哪有不想卖的，可人家问的是留不留，真要收了，总得先讲。他把空盒拿回柜里，饭还在锅中，没有装着一份一直等到凉。\n\n我方才还兴冲冲对过扣子、辣酱和筷子，听见这份没交出去，总想再替他想个能留住人的办法。可门口没有小梁，手机也没有回信，我能说的，确实只有我们已经发过的这一句。\n\n纸上写到这里，笔还顺着往后跑了一下。我停住，又将已发取消念给许叔听。他点点头，手放回柜沿，去收十一点要收的东西，没有叫我再替这点舍不得找个好听的说法。",
  "category": "life",
  "asset": "night-clip"
},
  {
  "id": "night-record-missed",
  "title": "十一点，盒子还空着",
  "text": "十点五十五过后，我又往巷口看了一回。到十一点，门仍没响，许叔才将手机拿起来，把最后那一行从头读全。对方等的是一句准话，我们等的是人直接走进来。\n\n我说也许他已经坐车去了，话一出口，自己就先觉得轻飘。许叔也没顺着接，他说到哪儿了不知道，今晚确实没回清楚，明天见着再道个歉。\n\n空盒刚才试得那么顺手，扣子一合，还会轻轻响。收回去的时候却只要叠好，不必担心汤洒。我替他让出柜格，手碰到留餐单边上，一时没有别的话好帮。\n\n纸上先写时间，又写没有回信，也没人来取。刚才我总想替后面补一个大概，真将这句念出来，才肯把笔停在这里。\n\n许叔把手机留在手边，钥匙已经拿出来，仍等我收好自己的书。我摸过口袋里那只手机，没急着再回谁一句快了，先把该拿的东西一样样拿稳。",
  "category": "life",
  "asset": "night-clip"
},
  {
  "id": "night-private-liang",
  "title": "折札 · 小梁的私话",
  "text": "小梁提饭时压低声音，说今晚替同事多待的那件事不要写出来。同事也认识这家店，下回来吃饭又问，他不太好接。\n\n我把笔先放下，等他说完，只答应记怎么改时间、从哪里回话、到门口怎么取。别的折向里面，收在自己这边，店记不跟着念。",
  "category": "detail",
  "asset": "night-clip"
},
  {
  "id": "night-private-xu",
  "title": "折札 · 许叔的私话",
  "text": "许叔说女儿小时候等他，睡着了手机还攥着。如今长大，还是会问一句到家没有。他答应十一点收，就不想回过好了，又为了最后一份饭点起火。\n\n说完他将关门时间指给我看，让店记只留这一行。家里这些另折着收，不夹进给人照做的菜谱。我收纸时，他已经去拿钥匙，没有留在柜边等我替这句话再写个结尾。",
  "category": "detail",
  "asset": "night-clip"
},
];
