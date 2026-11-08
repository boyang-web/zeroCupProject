import type { Chapter, Condition, Dialogue, DialogueBeat, MinigameDefinition } from '../../core/contracts.ts';
import { lifeUnlocked, revisitUnlocked } from '../progression.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { arrivalScripts, arrivalHomeAfterBreakfast, arrivalHomeWithReturnedSpool, arrivalHomeAfterBreakfastAndSpool, arrivalRequestAgain, arrivalOsmanthusKnown } from '../scripts/arrival.ts';

export const arrival: Chapter = {
  id: 'arrival', number: 1, title: '归巷', subtitle: '行李还没拆，茶已经温好了。', time: '清晨 · 奶奶的老宅',
  description: "上一份工作结束以后，你回到长明巷，返程票还没买。昨晚带回的包仍开着，手机搁在低柜上，屋里许多东西还放在你记得的位置。奶奶靠窗做针线，听见你起床，先抬头笑了，给身旁的椅子让出一点地方。小几上的茶还温着，你想先过去陪她坐坐。",
  asset: 'arrival-home', position: 'center', tint: 'dawn',
  objective: '陪奶奶坐一会儿，看看她搁了许久的旧书。',
  revisitDescription: "奶奶还在老宅，书能放回窗下的写字台。今天问来的几页可以念给她听，先前没讲完的，也能坐下来接着问。",
  camera: { views: [
    { id: 'entry', label: '进门的低柜', x: 11, y: 68, zoom: 1.7 },
    { id: 'cabinet', label: '斗柜边', x: 22, y: 43, zoom: 1.8 },
    { id: 'desk', label: '窗下的写字台', x: 46, y: 47, zoom: 1.8 },
    { id: 'grandma', label: '奶奶身旁', x: 77, y: 44, zoom: 1.45 },
    { id: 'tea', label: '座旁的小茶几', x: 63.5, y: 59.5, zoom: 1.7 },
    { id: 'wall', label: '墙上的日历', x: 22.6, y: 27, zoom: 1.8 },
  ] },
  variants: [
    { condition: { kind: 'any', conditions: ['active', 'completed', 'failed'].map(status => ({ kind: 'quest' as const, id: 'night', status: status as 'active' | 'completed' | 'failed' })) }, asset: 'arrival-home-evening', time: '入夜 · 回到奶奶的老宅', tint: 'night', description: '窗下的台灯亮着。奶奶听见门口的脚步声，从藤椅上抬起头。' },
    { condition: revisitUnlocked, time: '回访 · 奶奶的老宅', description: '你把带回的书放到写字台上。奶奶还坐在窗边，这回有些话可以接着问了。' },
  ],
  questId: 'commission', metricIds: ['attention'], next: 'morning', exitLabel: '带上书，去巷口',
  exit: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'clue', id: 'book' }, { kind: 'flag', id: 'arrival-packed' }] },
  exitHint: '聊清委托后，翻开窗下写字台上的书，整理三张走访书签。',
  beats: [
    { label: '听一听委托', condition: { kind: 'flag', id: 'entrusted' } },
    { label: '翻开旧食录', condition: { kind: 'clue', id: 'book' } },
    { label: '整理走访书签', condition: { kind: 'flag', id: 'arrival-packed' } },
  ],
  hotspots: [
    {
  "id": "thread-spool",
  "label": "白线轴",
  "x": 64.3,
  "y": 83,
  "cameraView": "tea",
  "icon": "look",
  "sprite": {
    "asset": "arrival-thread-spool",
    "width": 2.8,
    "height": 3.5,
    "z": 11
  },
  "completed": {
    "kind": "any",
    "conditions": [
      {
        "kind": "flag",
        "id": "arrival-spool-returned"
      },
      {
        "kind": "reward",
        "id": "arrival-remember"
      },
      {
        "kind": "reward",
        "id": "arrival-notice-book"
      }
    ]
  },
  "variants": [
    {
      "condition": {
        "kind": "any",
        "conditions": [
          {
            "kind": "flag",
            "id": "arrival-spool-returned"
          },
          {
            "kind": "reward",
            "id": "arrival-remember"
          },
          {
            "kind": "reward",
            "id": "arrival-notice-book"
          }
        ]
      },
      "x": 59.5,
      "y": 59.7,
      "width": 1.65,
      "height": 2.5
    }
  ],
  "drag": {
    "actionId": "return-spool",
    "target": {
      "x": 58.3,
      "y": 57,
      "width": 3.2,
      "height": 6
    },
    "hint": "把白线轴放到奶奶手边的小几上，也能点开归还。"
  },
  "interaction": {
    "kind": "inspect",
    "text": "白线轴滚到椅脚外，线头拖着一点。你弯下腰拾起来，奶奶就把手边的布挪开，给你腾出一小块地方。\n\n“放这儿就好，我还用着呢。”她伸手替你理开搭在轴上的线。篮里另有一卷蓝的，白的补锅垫，蓝的留给围裙，各有用处。",
    "versions": [
      {
        "condition": {
          "kind": "any",
          "conditions": [
            {
              "kind": "flag",
              "id": "arrival-spool-returned"
            },
            {
              "kind": "reward",
              "id": "arrival-remember"
            },
            {
              "kind": "reward",
              "id": "arrival-notice-book"
            }
          ]
        },
        "text": "线轴已经放回小几，线头留在外面，没打结。奶奶用指尖抽出一截，够这一段就压回去，伸手就能接着缝。"
      }
    ],
    "action": {
      "id": "look-thread-spool",
      "label": "看看这卷线",
      "effects": [
        {
          "kind": "clue",
          "id": "thread-spool"
        }
      ]
    },
    "options": [
      {
        "id": "return-spool",
        "label": "留好线头，放回奶奶手边",
        "condition": {
          "kind": "not",
          "condition": {
            "kind": "any",
            "conditions": [
              {
                "kind": "flag",
                "id": "arrival-spool-returned"
              },
              {
                "kind": "reward",
                "id": "arrival-remember"
              },
              {
                "kind": "reward",
                "id": "arrival-notice-book"
              }
            ]
          }
        },
        "unavailable": "线轴已经在手边了。",
        "effects": [
          {
            "kind": "flag",
            "id": "arrival-spool-returned"
          },
          {
            "kind": "metric",
            "id": "attention",
            "amount": 1
          }
        ],
        "feedback": "你将线头留在木轴外沿，放回小几。奶奶抽出一点试试，抬头朝你笑：“哎，这样一拿就找着了。你坐，我把这条边收好。”"
      }
    ]
  }
},
    {
  "id": "grocery-slip",
  "label": "从旧书里取出的便条",
  "x": 51.1,
  "y": 47.5,
  "cameraView": "desk",
  "icon": "letter",
  "sprite": {
    "asset": "arrival-grocery-slip",
    "width": 3.4,
    "height": 2.1,
    "z": 8
  },
  "condition": {
    "kind": "clue",
    "id": "book"
  },
  "completed": {
    "kind": "clue",
    "id": "osmanthus-note"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "奶奶从旧书里取出的购物单，先搁在桌边。鸡蛋、青菜、桂花，前头的价钱有的画过线，桂花旁边倒另圈了一下。\n\n翻到背面，米酒的做法挤在原来空着的地方，糖那句旁边有更细的笔迹。你问是不是一张纸用了两回，奶奶笑着说，背面正好能写，当时没带本子就先记在这里了。",
    "exhibit": {
      "kind": "note",
      "kicker": "购物单背面 · 米酒旧方",
      "title": "桂花最后撒",
      "lines": [
        "正面：鸡蛋、青菜、桂花。",
        "背面：米酒，清水，糖。",
        "细笔改字：尝过再放。"
      ]
    },
    "action": {
      "id": "read-osmanthus-note",
      "label": "看清两种笔迹",
      "effects": [
        {
          "kind": "clue",
          "id": "osmanthus-note"
        }
      ]
    }
  }
},
    { id: 'grandma', label: '奶奶', cameraView: 'grandma', x: 77, y: 95, icon: 'talk', sprite: { asset: 'grandmother-home', width: 28, height: 71, z: 6 }, interaction: { kind: 'dialogue', dialogueId: 'commission' }, completed: { kind: 'flag', id: 'entrusted' } },
    {
  "id": "book",
  "label": "百味录",
  "cameraView": "desk",
  "x": 46,
  "y": 48.2,
  "icon": "book",
  "sprite": {
    "asset": "arrival-book",
    "width": 6.3,
    "height": 4,
    "z": 7
  },
  "condition": {
    "kind": "any",
    "conditions": [
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "arrival-packed"
        }
      },
      {
        "kind": "any",
        "conditions": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "active"
          },
          {
            "kind": "quest",
            "id": "morning",
            "status": "completed"
          },
          {
            "kind": "quest",
            "id": "morning",
            "status": "failed"
          }
        ]
      }
    ]
  },
  "completed": {
    "kind": "clue",
    "id": "book"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "book",
    "journalLink": true,
    "text": "旧书放在窗下，书脊补过一截新线，前面的页夹得鼓，后面却还平着。你拿近，先沿书脊托着，奶奶也伸手帮你扶了一下。\n\n“慢慢翻，我给你托着。”封皮下露出几张长短不同的纸，熟悉的桂花米酒方子就在前头。",
    "exhibit": {
      "kind": "book",
      "kicker": "奶奶的旧食谱",
      "title": "百味录",
      "lines": [
        "桂花米酒 · 奶奶的旧方",
        "清水煮开，酒酿拨散，最后撒桂花。",
        "“糖先少放，尝了再说。”"
      ],
      "caption": "先把这一页誊清。其余的，等走到店里再问。"
    },
    "action": {
      "id": "inspect-book",
      "label": "翻开书页",
      "effects": [
        {
          "kind": "clue",
          "id": "book"
        }
      ]
    },
    "activityId": "arrival-route",
    "versions": [
      {
        "condition": {
          "kind": "clue",
          "id": "book"
        },
        "text": "翻到前面，第一张是桂花米酒。清水、酒酿、桂花，奶奶的字写得大，糖那句却另添了一行细字，挤在原来的量旁边。\n\n“这儿还能写，你补在旁边，我正好两样都看得见。”奶奶指给你看，又从里面抽出那张购物单，放到桌边。买菜的和记做法的用了同一张纸，出门要带的却是另外三张长书签。\n\n三张分别写陈家、琴记和夜里那家店。你先把店名和开门时间对好，再照着夹回书里，路上就不用一页页找。"
      }
    ]
  }
},
    {
  "id": "photo",
  "label": "旧合照",
  "cameraView": "cabinet",
  "x": 21.6,
  "y": 44,
  "icon": "look",
  "sprite": {
    "asset": "prop-photo",
    "width": 6.5,
    "height": 8.7,
    "z": 4
  },
  "completed": {
    "kind": "clue",
    "id": "family-photo"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "照片里你踩着一张小凳，袖子卷得一边高一边低。陈伯扶住凳背，奶奶拿着你的外套，往镜头里只挤进半边肩膀。\n\n你原来总记得自己做了个月亮包子，照片拍下来的这一只却没封好口，馅已经从边上露出来了。陈伯伸着手，像刚想接，你还低头护着它。\n\n相框背板能松动，翻过去有奶奶写的日期，后头还添着几行小字。",
    "exhibit": {
      "kind": "photo",
      "kicker": "照片背面 · 祖母的字",
      "title": "那年，第一笼包子",
      "lines": [
        "“小满六岁。闹着要帮忙，",
        "最后帮着吃了三个。”"
      ],
      "caption": "“三个”被圈过一回，旁边的日期倒没有圈。"
    },
    "action": {
      "id": "read-family-photo",
      "label": "记住这张照片",
      "effects": [
        {
          "kind": "clue",
          "id": "family-photo"
        },
        {
          "kind": "metric",
          "id": "attention",
          "amount": 1
        }
      ]
    },
    "versions": [
      {
        "condition": {
          "kind": "clue",
          "id": "family-photo"
        },
        "text": "小满六岁，闹着要帮忙，最后帮着吃了三个。奶奶的字写到框边，三个又被圈了一遍，日期倒没有圈。\n\n你把照片翻回正面，找到案板上那只没合好的包子。那天谁让你踩凳子、最后包子到底怎样出锅的，光看这张还想不全，奶奶就在旁边，可以拿给她认。"
      }
    ]
  }
},
    {
  "id": "letter",
  "label": "信封",
  "cameraView": "entry",
  "x": 13.3,
  "y": 70.5,
  "icon": "letter",
  "sprite": {
    "asset": "arrival-letter",
    "width": 9,
    "height": 5,
    "z": 9
  },
  "completed": {
    "kind": "clue",
    "id": "invitation"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "unfold",
    "text": "小满：\n\n上次电话你说工作的事，我听见了，还想问问你那边住着方不方便，要搬东西有没有人搭把手。想回来就回来，被子晒过，床单也换好了，到了先睡一觉。\n\n我也挺想你的。家里那几样东西都还在，你回来自己拿，不记得搁哪儿了就叫我。厚一点的外套带着，早晚坐门口说话用得上，别的不用特意买，家里都有。\n\n以前记吃食的那本书，后面还空着几页，我想接着补。你回来有空，咱俩先看看，陈家和琴记如今怎么做，再慢慢去问。觉先睡足，饭也好好吃，这事不赶。\n\n住几天都好，不用先跟我定返程。来的车次记得告诉我，改了也说一声，我好算着你什么时候到家。\n\n——奶奶\n\n信封里夹着到站的票根。你在车上重折过，没有照她原来的折痕，两道印子摊在一起。",
    "exhibit": {
      "kind": "letter",
      "kicker": "回家前寄来 · 已拆封",
      "title": "小满：",
      "lines": [
        "你说工作的事，我听见了，回来先歇歇。",
        "被子晒过，屋里那些东西都还在。",
        "那本旧书，等你回来咱俩一起看看。",
        "来的车次告诉我，住几天都好。"
      ],
      "caption": "最后一行，比前面的字小一点。"
    },
    "action": {
      "id": "read-invitation",
      "label": "把信折回去",
      "effects": [
        {
          "kind": "clue",
          "id": "invitation"
        },
        {
          "kind": "metric",
          "id": "attention",
          "amount": 1
        }
      ]
    }
  }
},
    {
  "id": "tea",
  "label": "温茶",
  "cameraView": "tea",
  "x": 61.9,
  "y": 60,
  "icon": "tea",
  "sprite": {
    "asset": "arrival-cup",
    "width": 4,
    "height": 4.1,
    "z": 10
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "tea-offered"
      },
      "x": 64.4,
      "y": 59.9
    }
  ],
  "drag": {
    "actionId": "offer-tea",
    "target": {
      "x": 63.5,
      "y": 58.8,
      "width": 2,
      "height": 2.4
    },
    "hint": "往靠近藤椅的一侧挪"
  },
  "completed": {
    "kind": "flag",
    "id": "tea-offered"
  },
  "interaction": {
    "kind": "inspect",
    "text": "杯碟留在小几外沿，你一伸手就碰得到，离奶奶却远一点。你托住底碟，往藤椅那边挪，奶奶便将手里的布收拢，给杯子让出位置。\n\n这只杯口有一点缺，你从前就见她转着方向喝。她指指杯柄，让你搁到顺手的那边，又朝柜上看，说那里还收着一只给你留的新杯子。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "tea-offered"
        },
        "text": "杯碟已经在奶奶手边。她捧起来喝了一口，放下时还让缺口朝里。你站在旁边，她就拍了拍椅子，叫你拿自己的杯子过来一起坐。\n\n壶还温着，奶奶给小几中间让了一点地方，两个人伸手都够得着。"
      }
    ],
    "options": [
      {
        "id": "offer-tea",
        "label": "把茶杯往奶奶手边挪一点",
        "effects": [
          {
            "kind": "flag",
            "id": "tea-offered"
          },
          {
            "kind": "metric",
            "id": "attention",
            "amount": 1
          }
        ],
        "feedback": "奶奶扶稳杯碟，喝了一小口：“哎，挪这边就好了。给你留的新杯子在柜上，你也拿来，咱俩一起喝。”"
      }
    ]
  }
},
    { id: 'calendar', label: '旧日历', cameraView: 'wall', x: 22.6, y: 32, icon: 'look', sprite: { asset: 'prop-calendar', width: 6.1, height: 16.3, z: 3 }, interaction: {"kind":"inspect","manipulation":"flip","text":"取眼镜、买桂花、小满回家，挤在同一个格子。前两件各打了小勾，名字旁边却是圈，外头还改过一次日期。\n\n你问怎么还不打勾，奶奶说昨晚光顾着叫你吃饭，后来收完碗就忘了。她让你先别撕，说取眼镜的小票夹在背面，等下还得看。\n\n你将票放回原处，想起改车次那回，自己在手机上退了重买，只回过一个电话，墙上也跟着涂改了一次。","exhibit":{"kind":"note","kicker":"日历页角","title":"这几天","lines":["取眼镜。","买桂花。","小满回家。"],"caption":"你的名字旁边，她画了一个圈。"},"action":{"id":"read-calendar","label":"看清改过的日期","effects":[{"kind":"clue","id":"calendar"}]}} },
    {
  "id": "phone",
  "label": "手机",
  "cameraView": "entry",
  "x": 7.5,
  "y": 73.8,
  "icon": "look",
  "sprite": {
    "asset": "arrival-phone",
    "width": 6.2,
    "height": 5.5,
    "z": 9
  },
  "completed": {
    "kind": "clue",
    "id": "job-gap"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "phone",
    "text": "手机搁在低柜上，充电线从包带下面穿过。你先将线松开，再拿起手机，屏幕还暗着。\n\n窗边的奶奶听见你起床，抬头朝你笑了一下。你看完这一眼，就能过去陪她坐坐，手机先轻触屏幕点亮。",
    "exhibit": {
      "kind": "note",
      "kicker": "草稿 · 尚未发出",
      "title": "个人简历",
      "lines": [
        "起止：仍写着“至今”",
        "简介：能够适应……",
        "返程：暂未决定"
      ],
      "caption": "昨晚回家时，奶奶先让你吃了饭。"
    },
    "action": {
      "id": "arrival-read-phone",
      "label": "看看屏幕",
      "effects": [
        {
          "kind": "clue",
          "id": "job-gap"
        }
      ]
    },
    "versions": [
      {
        "condition": {
          "kind": "clue",
          "id": "job-gap"
        },
        "text": "个人简介下面停着能够适应，后面还没接上。车上换过几回说法，没改好，昨晚回来又先跟着奶奶去吃饭了。\n\n结束日期仍留着至今。你点进去，光标闪了几下，没有立即落字。朝窗边看时，奶奶正将针别进针包，等着和你说话。\n\n你把屏幕按暗，充电线绕回柜边，没有再握着手机来回转。"
      }
    ]
  }
},
  ],
};

const nodes: DialogueSeed[] = [
  { id: 'welcome', speaker: '奶奶',   choices: [
    { id: 'arrival-ate', label: "吃了点，还能再吃。", next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
    { id: 'arrival-hungry', label: "还没，刚起来。", next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }] },
  ] },
  { id: 'home', speaker: '奶奶',   choices: [
    { id: 'arrival-remember', label: '小时候你总夹着它去买菜。', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
    { id: 'arrival-notice-book', label: '信里说的，是这本书？', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
  ] },
  { id: 'request', speaker: '奶奶',   choices: [
    { id: 'arrival-why-book', label: '到店里要问些什么？', next: 'people', effects: [] },
    { id: 'arrival-why-me', label: "你是想让我出门走走？", next: 'why-you', effects: [] },
    { id: 'arrival-photo-question', label: "合照里那只包子，到底是谁做的？", condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看过斗柜上的旧合照，才想得起这件事。', next: 'photo-memory', effects: [] },
    { id: 'arrival-ready', label: '好。我该怎么开始？', next: 'approach', effects: [] },
  ] },
  { id: 'people', speaker: '祖母',   choices: [{ id: 'arrival-understand-book', label: "我先吃，等他们不忙了再问。", next: 'request', effects: [{ kind: 'clue', id: 'book-purpose' }] }] },
  { id: 'why-you', speaker: '奶奶',   choices: [{ id: 'arrival-admit', label: "那我先去坐坐，回来接着陪你。", next: 'request', effects: [{ kind: 'flag', id: 'phone-away' }] }] },
  { id: 'photo-memory', speaker: '祖母',   choices: [{ id: 'arrival-photo-reply', label: "我到了先跟他打个招呼。", next: 'request', effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'approach', speaker: '祖母',   choices: [
    { id: 'accept-commission', onceKey: 'arrival-commission', label: '好，我多坐一会儿，回来慢慢讲。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-slow' }, { kind: 'item', id: 'small-key', amount: 1 }] },
    { id: 'accept-brief', onceKey: 'arrival-commission', label: '我先照书上这几样去找。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-recording' }, { kind: 'item', id: 'small-key', amount: 1 }] },
  ] },
  { id: 'instructions', speaker: '祖母',   choices: [{ id: 'arrival-set-off', label: "我先把书和三张书签理好。", effects: [{ kind: 'flag', id: 'arrival-instructions' }] }] },
  { id: 'followup', speaker: '祖母',   choices: [
    {"id":"arrival-thread-question","label":"这卷白线和篮里的蓝线，都是补什么的？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
    {"id":"arrival-osmanthus-question","label":"这张便条上的桂花，也是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
    {"id":"arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},
    { id: 'arrival-followup-photo', label: '再讲讲我小时候的事。', next: 'remember-again', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看看那张合照，或许能想起什么。', effects: [] },
    { id: 'arrival-followup-tea', label: '茶放你手边了。', condition: { kind: 'flag', id: 'tea-offered' }, unavailable: '小茶几上的茶还温着。', next: 'tea-reply', effects: [] },
    { id: 'arrival-followup-bye', label: "我出去转转，回来再陪你坐。", effects: [] },
  ] },
  { id: 'remember-again', speaker: '祖母',   choices: [{ id: 'arrival-remember-bye', label: "我去找陈伯，也听听他怎么讲。", effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'tea-reply', speaker: '祖母',   choices: [{ id: 'arrival-tea-reply', label: "那我再陪你喝两口。", effects: [] }] },
  { id: 'grandma-early-return', speaker: '奶奶',   choices: [
    { id: 'grandma-early-knee', label: '陈伯站得久，阿宁给他留了护膝。', condition: { kind: 'clue', id: 'knee-note' }, unavailable: '在陈家留意过护膝，才能讲起这件事。', next: 'grandma-chen-chat', effects: [] },
    { id: 'grandma-early-ning', label: '阿宁要去城南，她还惦记着铺子。', condition: { kind: 'flag', id: 'ning-heard' }, unavailable: '先听阿宁讲讲她的工作。', next: 'grandma-ning-chat', effects: [] },
    { id: 'grandma-early-book', label: "米酒这一页，你当初跟谁学的？", next: 'grandma-first-story', effects: [] },
    { id: 'grandma-early-bye', label: "我再陪你坐会儿，等下去陈家。", effects: [] },
  {"id":"grandma-early-return-arrival-thread-question","label":"这卷白线和篮里的蓝线，都是补什么的？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
{"id":"grandma-early-return-arrival-osmanthus-question","label":"这张便条上的桂花，也是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
{"id":"grandma-early-return-arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},] },
  { id: 'grandma-chen-chat', speaker: '奶奶',   choices: [{ id: 'grandma-chen-chat-close', label: "我回去再看看他怎么说。", effects: [] }] },
  { id: 'grandma-ning-chat', speaker: '奶奶',   choices: [{ id: 'grandma-ning-chat-close', label: "我带句话，让她忙完路过来坐坐。", effects: [] }] },
  { id: 'grandma-later', speaker: '奶奶',   choices: [
    {"id":"grandma-ask-noon","label":"琴记那碗错的面，我还想跟你讲讲。","condition":{"kind":"flag","id":"noon-played"},"unavailable":"先在琴记做完眼前那几张单。","next":"grandma-noon-chat","effects":[]},
    { id: 'grandma-ask-first-page', label: "米酒这一页，你当初跟谁学的？", next: 'grandma-first-story', effects: [] },
    { id: 'grandma-ask-photo-margin', label: '照片背面说，你刚来时认门认了三回？', next: 'grandma-new-neighbor', condition: { kind: 'clue', id: 'photo-margin' }, unavailable: '重新细看那张照片，也许能找到这句话。', effects: [] },
    { id: 'grandma-return-bye', label: "我先陪你坐着，晚点再出去。", effects: [] },
  {"id":"grandma-later-arrival-thread-question","label":"这卷白线和篮里的蓝线，都是补什么的？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
{"id":"grandma-later-arrival-osmanthus-question","label":"这张便条上的桂花，也是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
{"id":"grandma-later-arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},] },
  { id: 'grandma-first-story', speaker: '奶奶',   choices: [{ id: 'grandma-record-first-story', label: "把那个“再”字补清楚。", effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
  { id: 'grandma-new-neighbor', speaker: '奶奶',   choices: [{ id: 'grandma-photo-story-close', label: '原来门口的花盆还有这段事。', effects: [{ kind: 'clue', id: 'grandma-first-page' }] }] },
  {"id":"thread","speaker":"奶奶","choices":[{"id":"arrival-thread-close","label":"我把线头留外面，搁你手边。","effects":[]}]},
  {"id":"osmanthus","speaker":"奶奶","choices":[{"id":"arrival-osmanthus-close","label":"原来的留着，我只补清楚这句。","effects":[]}]},
  {"id":"phone-draft","speaker":"奶奶","choices":[{"id":"arrival-draft-close","label":"好，我陪你慢慢试。","effects":[]}]},
  {"id":"grandma-noon-chat","speaker":"奶奶","choices":[{"id":"grandma-noon-close","label":"我下次去还可以接着问。","effects":[]}]},
];
const rewarded=(id:string):Condition=>({kind:'reward',id});
const spoolReturned=arrival.hotspots.find(h=>h.id==='thread-spool')!.completed!;
function arrivalVersions(id:string):{condition:Condition;beats:DialogueBeat[]}[]|undefined{
  if(id==='request')return [{condition:{kind:'any',conditions:['arrival-understand-book','arrival-admit','arrival-photo-reply'].map(rewarded)},beats:arrivalRequestAgain}];
  if(id==='home')return [
    {condition:{kind:'all',conditions:[rewarded('arrival-ate'),spoolReturned]},beats:arrivalHomeAfterBreakfastAndSpool},
    {condition:spoolReturned,beats:arrivalHomeWithReturnedSpool},
    {condition:rewarded('arrival-ate'),beats:arrivalHomeAfterBreakfast},
  ];
  if(id==='osmanthus')return [{condition:rewarded('grandma-record-first-story'),beats:arrivalOsmanthusKnown}];
}
export const commission: Dialogue = {
  id: 'commission', entry: 'welcome', entries: [
    { condition: lifeUnlocked, nodeId: 'grandma-later' },
    { condition: revisitUnlocked, nodeId: 'grandma-early-return' },
    { condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'not', condition: { kind: 'flag', id: 'arrival-instructions' } }] }, nodeId: 'instructions' },
    { condition: { kind: 'flag', id: 'entrusted' }, nodeId: 'followup' },
    { condition: { kind: 'flag', id: 'arrival-introduced' }, nodeId: 'request' },
    { condition: { kind: 'flag', id: 'arrival-greeted' }, nodeId: 'home' },
  ], nodes: nodes.map(n => scriptNode({ portrait: 'grandmother', ...n, speaker: n.speaker === '祖母' ? '奶奶' : n.speaker, versions: arrivalVersions(n.id) }, arrivalScripts[n.id])),
};
export const arrivalGame: MinigameDefinition = {
  id: 'arrival-route', chapterId: 'arrival', module: 'itinerary', title: '三张书签',
  description: '三张书签夹乱了。根据上面的营业时间，把它们放回相应的页间；点选书签，再点空位。', target: 100,
  condition: { kind: 'all', conditions: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-instructions' }, { kind: 'clue', id: 'book' }] },
  unavailable: '先和祖母聊清委托，再来整理走访书签。',
  itinerary: {
    slips: [
      { id: 'night-slip', title: '夜里食堂', detail: '夜班的人回来，灯才亮。21:00 后留餐。', slot: 'evening' },
      { id: 'morning-slip', title: '陈家包子铺', detail: '六点开门，第一笼 06:30。错过就等下一笼。', slot: 'morning' },
      { id: 'noon-slip', title: '琴记面馆', detail: '午间 11:30 开灶，老客靠窗坐。', slot: 'noon' },
    ],
    slots: [{ id: 'morning', label: '清晨', time: '第一笼热气' }, { id: 'noon', label: '午间', time: '一碗热面' }, { id: 'evening', label: '深夜', time: '最后一盏灯' }],
  },
  reward: { id: 'arrival-route-reward', label: '出门', feedback: "书签夹好了，钥匙也收进口袋，奶奶又叫你检查书别压着线头。你往门口走，她在后头想起一句：“陈伯要是问，昨天那碗汤不咸，正好。你别光顾问他的，忘了替我答这句。”", effects: [{ kind: 'flag', id: 'arrival-packed' }, { kind: 'item', id: 'baiwei-book', amount: 1 }, { kind: 'quest', id: 'commission', status: 'completed' }] },
};
