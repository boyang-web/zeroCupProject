import type { Chapter, Condition, Dialogue, DialogueBeat, MinigameDefinition } from '../../core/contracts.ts';
import { lifeUnlocked, revisitUnlocked } from '../progression.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { arrivalScripts, arrivalHomeAfterBreakfast, arrivalHomeWithReturnedSpool, arrivalHomeAfterBreakfastAndSpool, arrivalOsmanthusKnown } from '../scripts/arrival.ts';

export const arrival: Chapter = {
  id: 'arrival', number: 1, title: '归巷', location: '奶奶家 · 堂屋', subtitle: '行李还没拆，茶已经温好了。', time: '清晨 · 奶奶的老宅',
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
      },
      {
        "kind": "flag",
        "id": "arrival-spool-story"
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
          },
          {
            "kind": "flag",
            "id": "arrival-spool-story"
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
    "text": "你看到椅脚外有一只白线轴，线头拖出来，绕在椅腿底下。奶奶正低头找它，膝上还搁着没缝完的锅垫，手往旁边摸了两下，只摸到了篮沿。\n\n篮里另有一卷蓝线，你想起自己小时候总爱替她挑颜色，越鲜亮越好，她嘴上说补锅垫用不着这么好看，到头来还是由着你选。今天这两卷倒分得清楚，白的补锅垫，蓝的留给围裙。",
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
            },
            {
              "kind": "flag",
              "id": "arrival-spool-story"
            }
          ]
        },
        "text": "奶奶用指尖勾出一截白线，放到锅垫边比了比，觉得够长，便先压住。篮里那卷蓝的，你问能不能也补这里，她拿两卷并着给你看，说蓝的得留给围裙，补在这块浅布上，一眼就瞧见了。\n\n你说那不也挺好看，她听着就笑：“还是小时候那样，什么都挑花的。等这块真用不得了，咱俩再挑块新的。”"
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
              },
              {
                "kind": "flag",
                "id": "arrival-spool-story"
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
    "text": "你看到奶奶从书里抽出的购物单，鸡蛋、青菜、桂花写在正面，价钱改过两回，背后却挤着一份米酒方子。你原先以为她是出门前就想好买什么，照着一项项买齐，看到桂花旁边那个圈，才想起她常常走过摊子，又倒回去添一样。\n\n糖那句旁边换了一种细笔迹，原来的量没有划掉。你问是不是别人替她改过，她接过来看，先将纸挪到亮处，自己也认了一会儿。她没急着答，你就替她压住卷起的纸边，等她慢慢想。",
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
    "text": "书翻到桂花米酒那页，糖的用量旁边挤着一行细字。你认得奶奶的大字，添在旁边的那笔却更轻些。小时候你只顾找自己画的小碗，没想过这些方子也是她一回回吃过、问过，再带回来记下的。\n\n她把书脊轻轻按住，给你指原来的量：“这个先别擦。你尝过觉得不够，再往旁边补，咱俩的都留着。”你将笔拿稳一点，先把关火后撒桂花那句誊清。",
    "exhibit": {
      "kind": "book",
      "kicker": "奶奶的旧食谱",
      "title": "百味录",
      "lines": [
        "桂花米酒 · 奶奶的旧方",
        "清水煮开，酒酿拨散，最后撒桂花。",
        "“糖先少放，尝了再说。”"
      ]
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
        "text": "奶奶的字大，一句占了两行，你后来添的挤在旁边，她倒说这样正好，两种都看得见。写到桂花，你抬头问她厨房里是不是还有，她说新买的那罐留着，等你哪天不急着出门，咱俩煮一点。\n\n三张写着店名的长书签从页间散出来，奶奶替你压住一角，又抽出夹混的旧购物单，放到了桌边。买菜的纸留在家里，那三张才是今天要带走的。"
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
    "text": "你先认出了那双鞋。鞋面上沾着一小团白面，左脚歪在凳子边，像下一刻就要踩空。再往上看，才看见六岁的自己，两边袖子卷得不一样高，手护着案板上那只没合好口的包子，谁也不肯让碰。\n\n那天的事，你原本只记得自己做了个月亮。看见照片里漏在外头的肉馅，灶间那股热气却一下又回来了：鼻尖发痒，手上都是面，陈伯说别揉眼睛，你偏要拿胳膊蹭，蹭得脸也白了一块。奶奶就在旁边，替你拿着脱下来的外套，叫了好几声，你都舍不得从凳子上下来。\n\n你还记得等开笼时，自己紧张得不许别人先看，生怕陈伯偷偷把那只换掉。后来到底吃成了什么样，反而记不清了。照片里奶奶只挤进半边肩膀，那件外套却抱得很牢。你看了一会儿，忍不住朝窗边望，她还在那里，手里的布换了，坐着等你说话的样子却没怎么变。",
    "exhibit": {
      "kind": "photo",
      "kicker": "照片背面 · 祖母的字",
      "title": "那年，第一笼包子",
      "lines": [
        "“小满六岁。闹着要帮忙，",
        "最后帮着吃了三个。”"
      ]
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
        "text": "背后的“吃了三个”又被奶奶圈了一遍。你盯着那个圈，终于想起自己当时怎么不肯认：头一只算尝味道，第二只没包好，不能算，第三只才是正经吃的。奶奶一边给你掸袖上的面，一边答应，行行行，那就只算一只。\n\n你一直记着自己捏了个月亮，连这场耍赖也忘了。照片里那只包子明明裂着口，你却把手挡在它前面，得意得很。小时候你做坏了东西，第一件事是拿给他们看，让他们替你想办法；这趟回来，反而先想好了许多句轻描淡写的话。\n\n你用拇指摸了摸框角，又朝奶奶身旁那张椅子看。那只包子后来怎么出锅的，她多半还记着。"
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
    "text": "这封信是你从外地带回来的，票根也一直夹在里面。出发前收东西，你本来想把它留在抽屉里，关上抽屉又折回去拿，最后塞到了随身包最外层。车上翻过两次，照着原来的折痕没折齐，现在纸上多了一道浅浅的印。\n\n电话里，奶奶说的多半是“好呀，回来呀”，问车次，问要不要接。信却写了这么长。你在车上读到“住几天都好”那句，原本已经点开了返程的页面，后来一路也没再往下选。\n\n她现在就在窗边坐着，你反而不太好意思叫她知道，自己把这几张纸带来带去。你用掌心慢慢抚平折痕，没有将压在信底的票根抽走。",
    "exhibit": {
      "kind": "letter",
      "kicker": "奶奶寄来的家信",
      "title": "小满：",
      "addressee": "小满",
      "sender": "奶奶",
      "lines": [
        "上次电话里听你说工作的事，我后来还想着，没问你那边住得方不方便，要搬的东西多不多，有没有人搭把手。你说先回来住几天，那就回来。被子我晒过了，床单也换好了，到家先好好睡一觉。",
        "我也想你了。你那间屋子没怎么动，衣架还在门后，厚被子收在柜里。早晚有一点凉，外套记得带上，别的不用特意买，家里都有。吃的你想起什么就提前跟我说，路上买的东西别拎太多。",
        "以前记吃食的那本书，我前几天又翻出来了，后面还空着好些页。陈家的包子、琴记的汤，我记的还是从前那样，想去问问如今怎么做。等你回来有空，咱俩先看看这本书，你愿意陪我跑两趟就更好了。觉先睡足，饭也好好吃，这事不赶。",
        "住几天都好，不用先跟我定返程。我知道你心里还有事，回来也不用一件件急着说。想说的时候，咱俩坐着慢慢说。来的车次记得告诉我，改了也说一声，我好算着你什么时候到家。",
        "奶奶"
      ]
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
    "text": "你看到杯碟搁在小几外沿，奶奶每次伸手，都得先将膝上的布往里收一点。杯口缺的那一小处还在，她喝茶总让它背着自己，你从前嫌这只杯子旧，买过一只新的，她却把新的留给了你。\n\n这会儿新杯子仍收在柜上，她用惯的这只倒离你更近。你站到小几边，托住底碟，想着替她挪到伸手就能够着的地方。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "tea-offered"
        },
        "text": "奶奶喝茶时总会先抿一下，觉得温度正好，才肯多喝两口。你小时候等不及，她就另拿一只碗替你晾着，嘴上还数落，说过多少遍了，刚倒的别急着往嘴里送。\n\n你在外面早就学会端着纸杯边走边喝，有时候喝完都说不清是什么味道。这会儿看她捧着杯子慢慢吹，你也想把柜上那只拿下来，坐一会儿再走。"
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
        "feedback": "奶奶伸手扶住碟沿，抬眼朝你笑：“哎，这边正好。你那只还在柜上，拿来呀，陪我喝两口。”她又把茶壶往中间让了让，给你的杯子留出地方。"
      }
    ]
  }
},
    {
  "id": "calendar",
  "label": "旧日历",
  "cameraView": "wall",
  "x": 22.6,
  "y": 32,
  "icon": "look",
  "sprite": {
    "asset": "prop-calendar",
    "width": 6.1,
    "height": 16.3,
    "z": 3
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你抬头看到日历上自己的名字，跟取眼镜、买桂花挤在同一格。前两件都勾掉了，“小满回家”却圈了一道，旁边还涂改过日期。你在手机上退票重买，只打过一个电话，说晚两天到，没想过这面墙上也跟着改了一次。\n\n“怎么我这个还不打勾呀？”你问。奶奶抬头看了看，说昨晚一听你敲门，就去看锅里的汤了，收完碗又忙着找枕套，哪还记着日历。她叫你先别撕，取眼镜的小票夹在背面，还得留着。\n\n你把翘起来的页角压好，没去找笔。名字留在那里也挺好，昨晚进门时你只顾说路上不累，还没问她等了多久。",
    "exhibit": {
      "kind": "note",
      "kicker": "日历页角",
      "title": "这几天",
      "lines": [
        "取眼镜。",
        "买桂花。",
        "小满回家。"
      ]
    },
    "action": {
      "id": "read-calendar",
      "label": "看清改过的日期",
      "effects": [
        {
          "kind": "clue",
          "id": "calendar"
        }
      ]
    }
  }
},
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
    "text": "你又摸到了手机。其实刚才醒来已经看过一遍，没有未接电话，也没有非得现在回的消息，手却还是自己伸了过去。回家之前，你总觉得得赶紧把下一步安排好，连在车上坐着，都不肯让屏幕多暗一会儿。\n\n备忘录停在没写完的个人简介上。上一份工作的结束日期还写着“至今”，你知道该改了，可真要删掉那两个字，手指又停住。再往下是半句“能够适应……”，车上改了几次，越改越觉得不像自己。\n\n昨晚你也想接着写，奶奶在门外叫吃饭，你应了一声，就将手机扣在了柜上。那碗汤喝完，人困得连包都没收。现在汤碗已经洗好了，充电线也替你理到了柜边，她倒从头到尾没催过你那份草稿。",
    "exhibit": {
      "kind": "note",
      "kicker": "备忘录",
      "title": "个人简介（草稿）",
      "phone": {
        "heading": "备忘录",
        "view": "draft"
      },
      "lines": [
        "工作经历\n结束时间：至今",
        "个人简介\n能够适应……"
      ]
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
        "text": "“至今”还留在结束日期里。你认得这份草稿每一次删改的位置，甚至知道光标上回停在哪儿，却还是习惯性地从头又看了一遍，好像多看一遍，下一句话就会自己冒出来。\n\n窗边传来收针线的声音，奶奶把针别好，又摸了摸，怕落在布里。你听着这点响动，忽然想起昨晚自己还举着手机，她将汤碗往桌里推了推，叫你先坐稳，别站着喝。你那时嘴上说不饿，最后连碗底也喝干净了。\n\n草稿先留在这里吧。至少这一会儿，你想过去陪她说几句话，不想一边应着她，一边还盯着没写完的半行字。"
      }
    ]
  }
},
  ],
};

const nodes: DialogueSeed[] = [
  { id: 'welcome', speaker: '奶奶',   choices: [
    { id: 'arrival-ate', label: "吃了点，还能再吃。", next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }, { kind: 'flag', id: 'arrival-spool-story' }] },
    { id: 'arrival-hungry', label: "还没，刚起来。", next: 'home', effects: [{ kind: 'flag', id: 'arrival-greeted' }, { kind: 'flag', id: 'arrival-spool-story' }] },
  ] },
  { id: 'home', speaker: '奶奶',   choices: [
    { id: 'arrival-remember', label: '小时候你总夹着它去买菜。', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
    { id: 'arrival-notice-book', label: '信里说的，是这本书？', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
  ] },
  { id: 'home-resume', speaker: '奶奶', choices: [
    { id: 'arrival-resume-remember', label: '小时候你总夹着它去买菜。', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
    { id: 'arrival-resume-notice-book', label: '信里说的，是这本书？', next: 'request', effects: [{ kind: 'flag', id: 'arrival-introduced' }] },
  ] },
  { id: 'request', speaker: '奶奶',   choices: [
    { id: 'arrival-why-book', label: '到店里要问些什么？', next: 'people', effects: [] },
    { id: 'arrival-why-me', label: "你是想让我出门走走？", next: 'why-you', effects: [] },
    { id: 'arrival-photo-question', label: "合照里那只包子，到底是谁做的？", condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看过斗柜上的旧合照，才想得起这件事。', next: 'photo-memory', effects: [] },
    { id: 'arrival-ready', label: '好。我该怎么开始？', next: 'approach', effects: [] },
  ] },
  { id: 'people', speaker: '祖母',   choices: [{ id: 'arrival-understand-book', label: "我先吃，等他们不忙了再问。", next: 'approach', effects: [{ kind: 'clue', id: 'book-purpose' }] }] },
  { id: 'why-you', speaker: '奶奶',   choices: [{ id: 'arrival-admit', label: "那我先去坐坐，回来接着陪你。", next: 'approach', effects: [{ kind: 'flag', id: 'phone-away' }] }] },
  { id: 'photo-memory', speaker: '祖母',   choices: [{ id: 'arrival-photo-reply', label: "我到了先跟他打个招呼。", next: 'approach', effects: [{ kind: 'clue', id: 'chen-memory' }] }] },
  { id: 'approach', speaker: '祖母',   choices: [
    { id: 'accept-commission', onceKey: 'arrival-commission', label: '好，我多坐一会儿，回来慢慢讲。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-slow' }, { kind: 'item', id: 'small-key', amount: 1 }] },
    { id: 'accept-brief', onceKey: 'arrival-commission', label: '我先照书上这几样去找。', decision: 'arrival-approach', next: 'instructions', effects: [{ kind: 'flag', id: 'entrusted' }, { kind: 'flag', id: 'arrival-recording' }, { kind: 'item', id: 'small-key', amount: 1 }] },
  ] },
  { id: 'instructions', speaker: '祖母',   choices: [{ id: 'arrival-set-off', label: "我先把书和三张书签理好。", effects: [{ kind: 'flag', id: 'arrival-instructions' }] }] },
  { id: 'followup', speaker: '祖母',   choices: [
    { id:'arrival-followup-people',label:'到店里问做法，还有什么得记着？',condition:{kind:'not',condition:{kind:'clue',id:'book-purpose'}},unavailable:'做法已经聊过了。',next:'more-people',effects:[] },
    { id:'arrival-followup-why',label:'你叫我出门，自己在家会不会闷？',condition:{kind:'not',condition:{kind:'flag',id:'phone-away'}},unavailable:'已经跟奶奶说好了，回来再陪她。',next:'more-why-you',effects:[] },
    { id:'arrival-followup-photo-memory',label:'合照里那只包子，真是我自己包的？',condition:{kind:'all',conditions:[{kind:'clue',id:'family-photo'},{kind:'not',condition:{kind:'clue',id:'chen-memory'}}]},unavailable:'先看看合照；听过的故事不必重新追问。',next:'more-photo-memory',effects:[] },
    {"id":"arrival-thread-question","label":"这卷白线和篮里的蓝线，都是补什么的？","condition":{"kind":"clue","id":"thread-spool"},"unavailable":"先看看椅边的线轴。","next":"thread","effects":[]},
    {"id":"arrival-osmanthus-question","label":"这张便条上的桂花，也是今天买的？","condition":{"kind":"clue","id":"osmanthus-note"},"unavailable":"翻看旧书取出的购物便条。","next":"osmanthus","effects":[]},
    {"id":"arrival-draft-question","label":"我手机上那段，还没改完。","condition":{"kind":"clue","id":"job-gap"},"unavailable":"先点亮手机看看自己的草稿。","next":"phone-draft","effects":[]},
    { id: 'arrival-followup-photo', label: '再讲讲我小时候的事。', next: 'remember-again', condition: { kind: 'clue', id: 'family-photo' }, unavailable: '看看那张合照，或许能想起什么。', effects: [] },
    { id: 'arrival-followup-tea', label: '茶放你手边了。', condition: { kind: 'flag', id: 'tea-offered' }, unavailable: '小茶几上的茶还温着。', next: 'tea-reply', effects: [] },
    { id: 'arrival-followup-bye', label: "我出去转转，回来再陪你坐。", effects: [] },
  ] },
  { id:'more-people',speaker:'奶奶',choices:[{id:'arrival-more-people-close',label:'那我先尝，再跟着问。',effects:[{kind:'clue',id:'book-purpose'}]}] },
  { id:'more-why-you',speaker:'奶奶',choices:[{id:'arrival-more-why-close',label:'好，回来咱俩接着聊。',effects:[{kind:'flag',id:'phone-away'}]}] },
  { id:'more-photo-memory',speaker:'奶奶',choices:[{id:'arrival-more-photo-close',label:'这回我去让陈伯也讲讲。',effects:[{kind:'clue',id:'chen-memory'}]}] },
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
// Optional questions remain available on a later visit, without leading back
// through the commission or granting another key.
for (const id of ['grandma-early-return','grandma-later']) {
  const topics=nodes.find(n=>n.id==='followup')!.choices.slice(0,3);
  nodes.find(n=>n.id===id)!.choices.unshift(...topics.map(choice=>({...choice,id:`${id}-${choice.id}`})));
}
const rewarded=(id:string):Condition=>({kind:'reward',id});
const spoolReturned:Condition={kind:'any',conditions:[{kind:'flag',id:'arrival-spool-returned'},rewarded('arrival-remember'),rewarded('arrival-notice-book')]};
function arrivalVersions(id:string):{condition:Condition;beats:DialogueBeat[]}[]|undefined{
  if(id==='home-resume')return [{condition:rewarded('arrival-ate'),beats:arrivalHomeAfterBreakfastAndSpool}];
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
    ...[{asked:'arrival-why-book',answered:'arrival-understand-book',nodeId:'people'}, {asked:'arrival-why-me',answered:'arrival-admit',nodeId:'why-you'}, {asked:'arrival-photo-question',answered:'arrival-photo-reply',nodeId:'photo-memory'}].map(({asked,answered,nodeId})=>({condition:{kind:'all' as const,conditions:[rewarded(asked),{kind:'not' as const,condition:rewarded(answered)}]},nodeId})),
    { condition:{kind:'any',conditions:['arrival-ready','arrival-understand-book','arrival-admit','arrival-photo-reply'].map(rewarded)},nodeId:'approach' },
    { condition: { kind: 'flag', id: 'arrival-introduced' }, nodeId: 'request' },
    { condition: { kind: 'all', conditions: [{kind:'flag',id:'arrival-greeted'},{kind:'flag',id:'arrival-spool-story'}] }, nodeId: 'home-resume' },
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
    slots: [{ id: 'morning', label: '清晨', time: '06:30' }, { id: 'noon', label: '午间', time: '11:30' }, { id: 'evening', label: '深夜', time: '21:00 后' }],
  },
  reward: { id: 'arrival-route-reward', label: '出门', feedback: "书签夹好了，钥匙也收进口袋，奶奶又叫你检查书别压着线头。你往门口走，她在后头想起一句：“陈伯要是问，昨天那碗汤不咸，正好。你别光顾问他的，忘了替我答这句。”", effects: [{ kind: 'flag', id: 'arrival-packed' }, { kind: 'item', id: 'baiwei-book', amount: 1 }, { kind: 'quest', id: 'commission', status: 'completed' }] },
};
