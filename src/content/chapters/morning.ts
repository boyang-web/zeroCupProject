import type { Chapter, Dialogue, Hotspot, MinigameDefinition, Condition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { chenScripts, ningScripts, chenKneeSeated, ningAfterTrial, ningAfterTable, ningAfterDefer, ningLaterFollowup, chenWaitingForBreakfast } from '../scripts/morning.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const any = (...conditions: Condition[]): Condition => ({ kind: 'any', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const laterJourney: Condition = any(...(['active', 'completed', 'failed'] as const).map(status => ({ kind: 'quest' as const, id: 'noon', status })));
const atMeal = all(flag('chen-at-table'), not(flag('morning-defer')), not(flag('morning-meal-cleared')), not(laterJourney));
const atCounter = not(atMeal);
const holdingBag: Condition = { kind: 'item', id: 'insulated-bag' };
const sprite = (asset: string, width: number, height: number, z = 8) => ({ asset, width, height, z });
const inspect = (id: string, label: string, asset: string, x: number, y: number, width: number, height: number, text: string, clueId?: string, cameraView?: string): Hotspot => ({
  id, label, x, y, cameraView, icon: 'look', sprite: sprite(asset, width, height), completed: clueId ? clue(clueId) : undefined,
  interaction: { kind: 'inspect', text, action: clueId ? { id: id === 'morning-note' ? 'morning-read' : 'read-' + id, label: '记下来', effects: [{ kind: 'clue', id: clueId }] } : undefined },
});
const front: Hotspot[] = [
  {
  "id": "front-trial-plan",
  "label": "试样的三个格子",
  "x": 87.5,
  "y": 43.5,
  "cameraView": "cashier",
  "icon": "look",
  "sprite": {
    "asset": "morning-prep",
    "width": 5.5,
    "height": 11.5,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "text": "陈伯把新添的三个格子按着又描了一遍，第一天、第二天、第三天，各留着写咸淡、塌没塌、好不好包的地方。你问要不要替他抄整齐些，他将笔往回收，说自己验的自己记，到时候一眼就找得着。\n\n七点开门那行仍带着问号。你本来想问他是不是就这么定了，看见他还在往格子边添字，又先闭了嘴。这才刚答应试样面，没必要趁他肯说话，把后面的事也一股脑推过去。",
    "exhibit": {
      "kind": "note",
      "kicker": "陈伯添了三个小格",
      "title": "先试三天",
      "lines": [
        "□ 第一天：第二笼试样，第一笼照旧。",
        "□ 第二天：陈伯自己验面、试包。",
        "□ 第三天：再商量是否晚开门。",
        "后天六点半送样；晚了先不等。"
      ]
    }
  },
  "condition": {
    "kind": "flag",
    "id": "morning-plan"
  }
},
  { id: 'morning-person', label: '陈伯', x: 49.5, y: 86, cameraView: 'counter', icon: 'talk', sprite: sprite('chen', 17.5, 57, 7), condition: atCounter,
    variants: [{ condition: flag('chen-has-seat'), asset: 'chen-seated', x: 49, y: 87.5, width: 20.5, height: 44.5, cameraView: 'rest' }],
    interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  {
  "id": "morning-customer",
  "label": "周叔留的纸条",
  "x": 69.9,
  "y": 56.1,
  "cameraView": "customer-slip",
  "icon": "letter",
  "sprite": {
    "asset": "morning-sample-sheet",
    "width": 6.3,
    "height": 2.5,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "text": "你看到留单上写着老周，青菜两只，七点半。“分两袋”下面还画了一道，字比包子数写得大。小时候你听他们喊老周，总觉得客人就叫这个名字，连问都没问过。\n\n陈伯见你看，自己先说起来：“外头那只他路上吃，里头的给老伴带回去。摞一块儿，到了家又压扁了。”说着，他将空纸袋往里折了一点，给待会儿装包子的地方留出来。\n\n你记住的原本只是两只青菜包，听他这么一说，手里那两个袋子倒不敢随便叠了。他忙着找钱，又回头叮嘱：“菜的还没出呢，等下一笼。你先认这张，别一会儿把自己的也递过去。”",
    "action": {
      "id": "read-customer-order",
      "label": "看看留单",
      "effects": [
        {
          "kind": "clue",
          "id": "breakfast-order"
        }
      ]
    },
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "morning-zhou-collected"
        },
        "text": "老周那两袋已经拿走了，留单上添了一个小勾。你想把纸收进账本，陈伯叫留在这里，明早还照这个数。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "morning-played"
        },
        "text": "新出的一笼已经分好，老周两只青菜包各装一袋，跟后院的三个碗分开。阿宁来拿时又对了一遍纸条，才将袋口折好。"
      }
    ]
  },
  "completed": {
    "kind": "clue",
    "id": "breakfast-order"
  }
},
  {
  "id": "front-steamer",
  "label": "已经卖空的一笼",
  "x": 79.7,
  "y": 56.8,
  "cameraView": "empty-basket",
  "icon": "look",
  "sprite": {
    "asset": "morning-empty-steamer",
    "width": 12,
    "height": 6.5,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "text": "你掀开空笼，湿布上还压着包子底的印子。一圈圈数过去只有十一，陈伯听见你小声数，隔着柜台就接：“十二只，布角里还藏着一只。”\n\n你将折进去的那角提起来，果然找着了。他腾出一只手接过去，抖开布，又赶紧叫你别碰笼底，刚空的，比装满时还容易忘记烫。你缩回手，他看见了就笑，问是不是还跟小时候一样，什么都想摸一下。\n\n门口有人喊还有没有，你差点指着这只空笼答没有，话到嘴边才听见灶间正叫下一笼好了。陈伯将湿布晾开，又转回去接钱，你赶紧给端笼的人让出路。"
  }
},
  {
  "id": "front-buns",
  "label": "给早班留的包子",
  "x": 65,
  "y": 59.6,
  "cameraView": "pickup",
  "icon": "look",
  "sprite": {
    "asset": "morning-reserved",
    "width": 7.5,
    "height": 7.2,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "text": "你认出刚才自己帮着留的两只青菜包，各装在一只纸袋里。阿宁折袋口时还挑了挑，将褶子齐整的那只放到里边，说给老周带回家的，别让路上先吃了。\n\n陈伯怕你也饿，指着后院叫你先去：“你的在那边呢，这两个可别顺手拿了。”你笑着说记住了，还是又看了一遍纸条。方才分装的时候觉得容易，真放到柜台上，旁边不断有人伸手来取，才知道为什么他连两个袋子也要反复对。"
  },
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "morning-played"
      },
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "morning-zhou-collected"
        }
      }
    ]
  }
},
  {
  "id": "front-stool",
  "label": "小凳子",
  "x": 35,
  "y": 80.5,
  "cameraView": "waiting-seat",
  "icon": "look",
  "sprite": {
    "asset": "prop-stool",
    "width": 7,
    "height": 11,
    "z": 2
  },
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "not",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "flag",
              "id": "chen-at-table"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "flag",
                "id": "morning-defer"
              }
            },
            {
              "kind": "not",
              "condition": {
                "kind": "flag",
                "id": "morning-meal-cleared"
              }
            },
            {
              "kind": "not",
              "condition": {
                "kind": "any",
                "conditions": [
                  {
                    "kind": "quest",
                    "id": "noon",
                    "status": "active"
                  },
                  {
                    "kind": "quest",
                    "id": "noon",
                    "status": "completed"
                  },
                  {
                    "kind": "quest",
                    "id": "noon",
                    "status": "failed"
                  }
                ]
              }
            }
          ]
        }
      },
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "chen-has-seat"
        }
      }
    ]
  },
  "completed": {
    "kind": "flag",
    "id": "chen-has-seat"
  },
  "interaction": {
    "kind": "inspect",
    "text": "你看到长凳底下还收着一只小凳子，正好够放到陈伯身旁。柜台外侧有一点空处，他坐下也能摸到纸袋，不用一有人招呼就站起来。你蹲下去抓住凳边，先看了看门口来往的人，想等这两个人过去，就替他挪过去。",
    "options": [
      {
        "id": "move-stool",
        "label": "把凳子挪到柜台外侧",
        "feedback": "你把凳子从长凳底下提出，挪到柜台外侧。陈伯先扶着边坐下，又伸手试了试纸袋：“哎，还真够得着。你去后院坐，我在这儿歇会儿。”他将腿往里收了收，给门口的人让出路。",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-has-seat"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      }
    ]
  },
  "drag": {
    "actionId": "move-stool",
    "target": {
      "x": 43,
      "y": 75,
      "width": 13,
      "height": 17
    },
    "hint": "柜台外侧的空处"
  }
},
];
const kitchen: Hotspot[] = [
  {"id":"chen-kitchen","label":"陈伯 · 学下一笼","x":59.5,"y":94,"cameraView":"teaching","icon":"look","sprite":{"asset":"chen","width":18.5,"height":58,"z":7},"interaction":{"kind":"dialogue","dialogueId":"morning-talk","entry":"before-food"},"condition":{"kind":"all","conditions":[{"kind":"flag","id":"morning-listened"},{"kind":"not","condition":{"kind":"flag","id":"morning-played"}}]}},
  { id: 'morning-object', label: '笼屉', x: 73.5, y: 54.1, cameraView: 'stove', icon: 'tea', sprite: sprite('morning-closed-steamer', 11, 13.5),
    variants: [{ condition: flag('morning-played'), asset: 'morning-empty-steamer', height: 8 }],
    interaction: { kind: 'minigame', gameId: 'morning-game' }, completed: flag('morning-played') },
  {
  "id": "morning-note",
  "label": "阿宁改过的备料表",
  "x": 35.5,
  "y": 42.7,
  "cameraView": "plan",
  "icon": "look",
  "sprite": {
    "asset": "morning-prep",
    "width": 6.5,
    "height": 15.8,
    "z": 8
  },
  "completed": {
    "kind": "clue",
    "id": "schedule"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你看到表头的“七点开门”后面添了一个问号，往下才是样面的安排：后天六点半先送一盆，第一笼照旧，第二笼试。陈伯还没答应，阿宁却把可能问到的都写上了，连验不好怎么办也留了地方。\n\n翻到背面，送面人的电话旁边有一句“别一开口就吵”，划掉了，仍看得出来。你想起刚进门时他们隔着门帘那两句，原本还觉得只是忙起来声音大。现在看见这行字，拿着纸的手也不由得轻了一点。\n\n陈伯从旁边看了一眼，先叫你别拿七点那句问他，后头还没看全。你便将纸翻回送样面的这一面，没有急着替阿宁说已经写得很清楚了。",
    "exhibit": {
      "kind": "note",
      "kicker": "阿宁改过几回的备料表",
      "title": "先试样，开门另议",
      "lines": [
        "后天六点半，先送一盆样面。",
        "第一笼照旧，拿第二笼试。",
        "先试三天，先验再收。",
        "七点开门？等样面试过再说。",
        "背面：面粉、发面情况与送面电话。"
      ]
    },
    "action": {
      "id": "morning-read",
      "label": "记下这个安排",
      "effects": [
        {
          "kind": "clue",
          "id": "schedule"
        }
      ]
    },
    "versions": []
  },
  "condition": {
    "kind": "not",
    "condition": {
      "kind": "flag",
      "id": "chen-at-table"
    }
  }
},
  {
  "id": "kneading-board",
  "label": "擀面板",
  "x": 40.2,
  "y": 70.5,
  "cameraView": "bench",
  "icon": "look",
  "sprite": {
    "asset": "morning-board",
    "width": 24,
    "height": 10.5,
    "z": 8
  },
  "completed": {
    "kind": "clue",
    "id": "board-marks"
  },
  "interaction": {
    "kind": "inspect",
    "text": "陈伯把面团往旁边收，案板上的几道刀印才露出来。外头那道特别直，你拿手指沿着旁边比了比，他就知道你想问什么：“从前分剂子没准头，一头大一头小，先划一道，照着看。”\n\n你问他现在还用不用，他将一截面搓好，手起刀落分了几块，倒没再找那根线。切完又挑出稍大的一块，揪掉一点重新揉，嘴上说手熟归手熟，也不是回回都准。\n\n你本来想夸两句，眼睛却一直跟着那块面。他看出来了，往你跟前分了一小团：“想做就洗手，别光看。丑的也给你留着，回头自己吃。”你应得比自己想的还快，手已经去找水，走出两步才想起袖子还没挽。",
    "action": {
      "id": "read-kneading-board",
      "label": "记下来",
      "effects": [
        {
          "kind": "clue",
          "id": "board-marks"
        }
      ]
    }
  }
},
  {
  "id": "work-apron",
  "label": "洗得发白的围裙",
  "x": 6.3,
  "y": 55.3,
  "cameraView": "hooks",
  "icon": "look",
  "sprite": {
    "asset": "prop-apron",
    "width": 8,
    "height": 20,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "text": "围裙口袋露出一角糖纸，你一下想起小时候伸手往里掏，被陈伯抓个正着的样子。他那时总说没有了，过一会儿却又从另一个口袋摸出一颗，非得等你转身才叫住你。\n\n这回你才碰了碰糖纸，他就隔着门帘问，要酸的还是甜的。你笑他怎么还藏着，他说带孩子的客人等下一笼，给颗糖，坐着就不那么着急。说完又补一句，阿宁前两天也来找，挑走两颗，嫌剩下的太酸。\n\n你挑的偏偏是酸的。剥开那一下，闻见一点熟悉的橘子味，舌头还没碰到，嘴里已经先酸起来了。"
  }
},
  {
  "id": "chen-knee",
  "label": "折起来的护膝",
  "x": 19.5,
  "y": 89.3,
  "cameraView": "storage",
  "icon": "look",
  "sprite": {
    "asset": "prop-brace",
    "width": 4,
    "height": 6.2,
    "z": 8
  },
  "completed": {
    "kind": "clue",
    "id": "knee-note"
  },
  "interaction": {
    "kind": "inspect",
    "text": "你在柜下看到一只护膝盒，打开时，魔术贴已经扣好了，内侧压着腿弯的地方软一些，边上也起了毛。盒子看着新，里面这只却显然用过，不是阿宁送来以后就一直收着没碰。\n\n盖里贴着一张纸：“爸，走楼梯记得戴。”底下挤了一个“好”，跟账本上的字一样。你将盒盖拿近，才看清陈伯把最后那一点空也用上了，自己答过，又没拿出来给人看。\n\n你本来还想去问他怎么不听阿宁的话，看见那个字，又觉得话得换个问法。收回去时布角卡住了，你托起护膝，将扣子按平，替他放回一伸手就能拿到的位置。",
    "action": {
      "id": "read-chen-knee",
      "label": "记下来",
      "effects": [
        {
          "kind": "clue",
          "id": "knee-note"
        }
      ]
    }
  }
},
  {
  "id": "cabinet",
  "label": "借一只保温袋",
  "x": 16,
  "y": 71.5,
  "cameraView": "storage",
  "icon": "book",
  "sprite": {
    "asset": "prop-bag",
    "width": 8,
    "height": 13,
    "z": 8
  },
  "condition": {
    "kind": "not",
    "condition": {
      "kind": "item",
      "id": "insulated-bag"
    }
  },
  "completed": {
    "kind": "item",
    "id": "insulated-bag"
  },
  "interaction": {
    "kind": "inspect",
    "text": "柜门边挂着一只保温袋，外侧还留有奶奶以前贴标签的胶印。你认出她的字，想起她说过书别跟吃的一块儿塞，路上碰着了会沾。袋子里面擦得很干净，书正好能放外侧那层。\n\n陈伯看你站在柜边，自己先说：“要用就拿着，你阿婆已经跟我说过了。跑完那几家，顺路再带回来。”你摸了摸口袋里的小钥匙，原来她昨晚连这个也替你想好了。",
    "options": [
      {
        "id": "borrow-with-key",
        "onceKey": "borrow-bag",
        "label": "给陈伯看过钥匙，借走保温袋",
        "condition": {
          "kind": "item",
          "id": "small-key"
        },
        "unavailable": "问问陈伯，也能借。",
        "effects": [
          {
            "kind": "item",
            "id": "insulated-bag",
            "amount": 1
          }
        ],
        "feedback": "陈伯替你将绕住门把的提手解开，交到你手里：“书放外侧，吃的另装好。袋子多着呢，你安心拿去，别一路又拎一堆。”你接稳了，才将奶奶给的小钥匙收回口袋。"
      },
      {
        "id": "borrow-by-asking",
        "onceKey": "borrow-bag",
        "label": "问陈伯借来用一天",
        "condition": {
          "kind": "flag",
          "id": "morning-listened"
        },
        "unavailable": "先和陈伯说一声。",
        "effects": [
          {
            "kind": "item",
            "id": "insulated-bag",
            "amount": 1
          }
        ],
        "feedback": "陈伯替你将绕住门把的提手解开，交到你手里：“书放外侧，吃的另装好。袋子多着呢，你安心拿去，别一路又拎一堆。”你接稳了，才将奶奶给的小钥匙收回口袋。"
      }
    ]
  }
},
];
const yard: Hotspot[] = [
  {
  "id": "ning-drawing",
  "label": "小朱画的教室",
  "x": 56.7,
  "y": 43.8,
  "cameraView": "school-drawing",
  "icon": "look",
  "sprite": {
    "asset": "morning-school-drawing",
    "width": 4.8,
    "height": 5.2,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你看到干柜上层的画纸，窗户画得几乎跟墙一样大，讲台上的人穿着蓝裙子，桌子却只有三条腿。阿宁见你盯着，先笑了：“挡住的那条不用画，小朱特意跟我交代的。你可别给人补上，我答应原样带回去的。”\n\n右下角写着陈老师，留了一个位置。你原先跟着她爸喊这三个字，还带一点熟人间逗笑的意思，看见孩子认真留出的空处，忽然不太舍得再拿来打趣。阿宁抚平纸中间那道折痕，说带回来时没找着大的袋子，幸好只折了这一回。",
    "exhibit": {
      "kind": "note",
      "kicker": "实习班的小朱画的",
      "title": "陈老师的教室",
      "lines": [
        "二楼，朝南，窗户画得特别大。",
        "老师穿蓝裙子，桌子画了三条腿。",
        "靠窗：给陈老师留的位置。"
      ]
    },
    "action": {
      "id": "read-ning-drawing",
      "label": "把画放回干的地方",
      "effects": [
        {
          "kind": "clue",
          "id": "ning-drawing"
        }
      ]
    }
  },
  "completed": {
    "kind": "clue",
    "id": "ning-drawing"
  },
  "variants": [
    {
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "flag",
            "id": "morning-papers-shared"
          },
          {
            "kind": "not",
            "condition": {
              "kind": "flag",
              "id": "morning-meal-cleared"
            }
          }
        ]
      },
      "x": 78.2,
      "y": 60.7,
      "width": 3.6,
      "height": 2,
      "cameraView": "ledger-meal"
    }
  ]
},
  {
  "id": "ning-chalk",
  "label": "门边的三盒粉笔",
  "x": 18,
  "y": 69.7,
  "cameraView": "bag",
  "icon": "look",
  "sprite": {
    "asset": "morning-chalk-boxes",
    "width": 5.4,
    "height": 6.4,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "text": "你看到纸袋搁在门边干凳上，里面摞着三盒粉笔。最上头的盒盖开了一点，阿宁伸手按好，自己也笑，说学校明明都有，买的时候却总觉得得先备一点。\n\n“买完文件夹又买笔，笔拿好了，才想起粉笔还没看。”她将几样东西挨着数给你听，教案反倒还没收齐，床上已经摆得没处坐。你想说不缺就别买了，话到嘴边又停下。你也有过这种时候，心里没个准，先把能准备的都准备一点，仿佛手边东西齐了，出门就能少慌一些。",
    "exhibit": {
      "kind": "note",
      "kicker": "阿宁刚买的东西",
      "title": "三盒粉笔",
      "lines": [
        "粉笔三盒，黑笔和文件夹另放。",
        "学校有，阿宁还是想先买一点。",
        "纸袋还在门后，陈伯昨天差点绊着。"
      ]
    },
    "action": {
      "id": "read-ning-chalk",
      "label": "替她把盒盖按好",
      "effects": [
        {
          "kind": "clue",
          "id": "ning-chalk"
        }
      ]
    }
  },
  "completed": {
    "kind": "clue",
    "id": "ning-chalk"
  }
},
  {
  "id": "morning-table-plan",
  "label": "饭桌旁的备料表",
  "x": 62.5,
  "y": 58.8,
  "cameraView": "table-plan",
  "icon": "look",
  "sprite": {
    "asset": "morning-sample-sheet",
    "width": 3.8,
    "height": 1.5,
    "z": 8
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "阿宁把备料表从灶间带过来，搁在手边。七点开门那行后面添了问号，样面的安排写在下面：后天六点半，先拿一盆，第一笼照旧，第二笼试。\n\n她把送面电话留在背面，表角那句别一开口就吵被划过，仍看得出来。陈伯还没接，先将碗朝自己这边挪了一点。",
    "exhibit": {
      "kind": "note",
      "kicker": "阿宁改过几回的备料表",
      "title": "先试样，开门另议",
      "lines": [
        "后天六点半，先送一盆样面。",
        "第一笼照旧，拿第二笼试。",
        "先试三天，先验再收。",
        "七点开门？等样面试过再说。",
        "背面：面粉、发面情况与送面电话。"
      ]
    },
    "action": {
      "id": "read-morning-table-plan",
      "label": "把表翻清楚",
      "effects": [
        {
          "kind": "clue",
          "id": "schedule"
        }
      ]
    },
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "morning-defer"
        },
        "text": "备料表折了两折，放在饭桌靠里的空处。阿宁没拿走，陈伯说晚上吃饭之前看。三个试样的格子还没画，七点开门那句也没定。",
        "exhibit": {
          "kind": "note",
          "kicker": "阿宁留下的提议稿",
          "title": "晚上再看",
          "lines": [
            "表折好放在饭桌里侧，今天没有约定试样。",
            "三天的格子还没画。",
            "七点开门仍是问号。"
          ]
        }
      },
      {
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "flag",
              "id": "morning-meal-cleared"
            },
            {
              "kind": "flag",
              "id": "morning-table"
            }
          ]
        },
        "text": "表还放在饭桌边，陈伯答应先看看一盆样面，没把试三天和晚开门一起定下。阿宁说晚一点给师傅回话，纸没有重新贴回灶间。",
        "exhibit": {
          "kind": "note",
          "kicker": "今天先把早饭吃完",
          "title": "先看一盆样面",
          "lines": [
            "后天让师傅带样面看看。",
            "还没正式约试三天。",
            "开门时间照旧，别的再商量。"
          ]
        }
      },
      {
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "flag",
              "id": "morning-papers-shared"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "flag",
                "id": "morning-meal-cleared"
              }
            }
          ]
        },
        "text": "备料表和账页已经并排放着，送样面那一面朝陈伯。阿宁的手指还压在改过的站名旁，你把自己的书往旁边收，让画纸也放得下。"
      }
    ]
  },
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "chen-at-table"
      },
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "morning-plan"
        }
      }
    ]
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "morning-defer"
      },
      "x": 62.5,
      "y": 58.8,
      "width": 3.8,
      "height": 1.5,
      "cameraView": "table-plan"
    },
    {
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "flag",
            "id": "morning-papers-shared"
          },
          {
            "kind": "not",
            "condition": {
              "kind": "flag",
              "id": "morning-defer"
            }
          },
          {
            "kind": "not",
            "condition": {
              "kind": "flag",
              "id": "morning-meal-cleared"
            }
          }
        ]
      },
      "x": 62.5,
      "y": 58.8,
      "width": 3.8,
      "height": 1.5,
      "cameraView": "table-plan"
    }
  ]
},
  { id: 'chen-yard', label: '陈伯', x: 49.3, y: 92, cameraView: 'chen-meal', icon: 'talk', sprite: sprite('chen-seated', 21, 44.5, 7), condition: atMeal, interaction: { kind: 'dialogue', dialogueId: 'morning-talk' } },
  { id: 'ning', label: '阿宁', x: 38.5, y: 86, cameraView: 'sink', icon: 'talk', sprite: sprite('ning', 17.5, 59.5, 7),
    variants: [{ condition: atMeal, asset: 'ning-seated', x: 84, y: 90, width: 20, height: 44.5, cameraView: 'ning-meal' }, { condition: flag('morning-defer'), x: 27, y: 87, cameraView: 'departure' }],
    interaction: { kind: 'dialogue', dialogueId: 'ning-talk' } },
  {
  "id": "school-letter",
  "label": "新学校的报到信",
  "x": 15.2,
  "y": 77.2,
  "cameraView": "bag",
  "icon": "letter",
  "sprite": {
    "asset": "morning-school-letter",
    "width": 8,
    "height": 6.5,
    "z": 8
  },
  "completed": {
    "kind": "clue",
    "id": "school-letter"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "unfold",
    "text": "阿宁从帆布包里抽出通知，先将手在围裙上蹭了蹭，才把纸展开。下周一，城南小学，带教案和试讲材料，几件事印得清清楚楚。你跟着念了一遍日期，她已经接上要坐哪班车，显然自己也读过不知多少回。\n\n你问东西是不是收齐了，她想了一会儿，先说粉笔肯定够，又笑着改口，别的还得回屋查。你看她将通知的角捏平，想起自己出门前也曾把一张纸翻来覆去读，连装在哪层包里都换过几回。",
    "exhibit": {
      "kind": "letter",
      "kicker": "城南小学",
      "title": "报到通知",
      "addressee": "陈老师",
      "lines": [
        "陈老师：",
        "请于下周一到校报到，并携带教案与试讲材料。报到后到二楼朝南的教室，联系负责老师确认当日安排。",
        "城南小学"
      ]
    },
    "action": {
      "id": "read-school-letter",
      "label": "把信折好放回",
      "effects": [
        {
          "kind": "clue",
          "id": "school-letter"
        }
      ]
    }
  }
},
  {
  "id": "chen-bus-note",
  "label": "陈伯抄的班车表",
  "x": 57.2,
  "y": 51.3,
  "cameraView": "family",
  "icon": "look",
  "sprite": {
    "asset": "prop-ledger",
    "width": 8.5,
    "height": 6.2,
    "z": 8
  },
  "completed": {
    "kind": "clue",
    "id": "bus-note"
  },
  "variants": [
    {
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "flag",
            "id": "chen-at-table"
          },
          {
            "kind": "flag",
            "id": "morning-papers-shared"
          },
          {
            "kind": "not",
            "condition": {
              "kind": "flag",
              "id": "morning-defer"
            }
          },
          {
            "kind": "not",
            "condition": {
              "kind": "flag",
              "id": "morning-meal-cleared"
            }
          }
        ]
      },
      "asset": "morning-ledger-flat",
      "x": 67.5,
      "y": 68.4,
      "cameraView": "ledger-meal",
      "width": 8,
      "height": 3.6
    }
  ],
  "interaction": {
    "kind": "inspect",
    "manipulation": "book",
    "text": "你顺着面粉、肉和纸袋的钱往后翻，最后一页忽然没了钱数，顶上写着六点十分。站名抄了三回，前两回改过，第三回旁边才打勾。陈伯平时记十几袋面粉不过两笔，这几站路却写得格外慢，一笔旁边还拖着没擦净的墨。\n\n下面另有两句：“下雨到桥下等。”“豆沙，放保温袋。”你想到阿宁刚才说父亲没问报到的事，原本还想回头跟她说一句，他其实记着。可拿着这本账，你又觉得该先问过陈伯，不能替他把藏在这里的话全翻出去。\n\n门帘外果然传来他的声音，问谁在看账。你说翻到班车那页了。他应了一声，没再说别的，过一会儿又在外头找起零钱。你将翘起的纸角压平，记住了这页夹在哪里。",
    "exhibit": {
      "kind": "book",
      "kicker": "陈伯的账本 · 最后一页",
      "title": "去城南的路",
      "lines": [
        "六点十分，站名改过三回。",
        "下雨到桥下等。",
        "豆沙，放保温袋。"
      ]
    },
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "morning-papers-shared"
        },
        "text": "阿宁的手指还压在改过的站名上，往下看，才看见“豆沙，放保温袋”。陈伯问她是不是站写错了，她摇摇头，又将纸拿近了一点。\n\n你本来想接一句，看吧，他都替你记好了，话到了嘴边却没说。这两个人好不容易正对着坐下，你将自己的书收开，给他们面前再多留一点地方。"
      }
    ],
    "action": {
      "id": "read-chen-bus-note",
      "label": "记住这几站路",
      "effects": [
        {
          "kind": "clue",
          "id": "bus-note"
        }
      ]
    }
  }
},
  {
  "id": "ning-family-photo",
  "label": "旧相框",
  "x": 50.6,
  "y": 44.1,
  "cameraView": "family",
  "icon": "look",
  "sprite": {
    "asset": "morning-family-photo",
    "width": 4.8,
    "height": 6.5,
    "z": 8
  },
  "completed": {
    "kind": "clue",
    "id": "ning-photo"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你看到阿宁穿着大了一号的校服，书包快垂到地上，陈伯替她拎着，人却还向铺子里侧着，像有人在里头喊他。他一边顾着照相，一边还惦记灶上的那笼，拍下来连脸也没转正。\n\n阿宁认出你看的那张，先伸手碰了碰框边，说那天本来讲好送她到校门口，后来客人来得早，走出巷口又折回去了。她嘴上说都记不清了，哪只手提书包倒记得牢，指给你看，说自己后来还拿这事笑过他。\n\n背后是陈伯那句“她说长大了当老师”。如今报到的日子就摆在包里，她看见这句话，也没立刻接着打趣，只扶正了有点松的框脚，让照片别倒下去。",
    "exhibit": {
      "kind": "photo",
      "kicker": "相框背面 · 圆珠笔字",
      "title": "她说长大了当老师",
      "lines": [
        "阿宁穿着大了一号的校服，站在店门口。",
        "陈伯一手提书包，一手拎蒸笼。"
      ]
    },
    "action": {
      "id": "read-ning-family-photo",
      "label": "把相框放回",
      "effects": [
        {
          "kind": "clue",
          "id": "ning-photo"
        }
      ]
    }
  }
},
  {
  "id": "yard-cup",
  "label": "给两个人倒杯茶",
  "x": 72.5,
  "y": 58.8,
  "cameraView": "tea",
  "icon": "tea",
  "sprite": {
    "asset": "morning-tea-empty",
    "width": 5.6,
    "height": 3.5,
    "z": 8
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "morning-tea"
      },
      "asset": "morning-tea-filled"
    }
  ],
  "completed": {
    "kind": "flag",
    "id": "morning-tea"
  },
  "interaction": {
    "kind": "inspect",
    "text": "你看到两只杯子还空着，一只底下留着姜片。阿宁说那只是她爸的，早上从锅边过来，总喊嘴里没味，倒上茶又嫌烫，姜片泡久了才肯喝。\n\n你将茶壶提起来试了试，不算太重，壶身也还温着。桌上碗碟已经摆开，她刚要去端下一趟，你想先替她把这两只杯子照顾好，省得坐下了还得来回找壶。",
    "options": [
      {
        "id": "morning-pour-tea",
        "label": "把两杯茶倒上",
        "feedback": "你倒好茶，阿宁将有姜片的那只转到父亲对面，低头试了一口自己的：“温的正好，等他来，不至于又说烫。”她把壶留在桌边，叫你也留一个杯子给自己。",
        "effects": [
          {
            "kind": "flag",
            "id": "morning-tea"
          }
        ]
      }
    ],
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "morning-tea"
        },
        "text": "姜片在水里慢慢舒开，阿宁的杯沿留着一点水印。你原先只想来问一份方子，现在连哪只杯子是谁的也认得了。茶壶还在手边，等他们坐定，谁想添就自己添一点，不必再起身去找。"
      }
    ]
  }
},
];
export const morning: Chapter = {
  id: 'morning', number: 2, title: '一笼早饭', location: '陈家', subtitle: '下一笼，就出锅了。', time: '早市 · 陈家包子铺',
  description: "柜前有人伸手取早饭，后面又喊下一笼好了，陈伯顾着找钱，抬头才认出你。灶间的帘子不断被掀起，阿宁在后院放碗，自己的饭还没端上桌。你把书拿稳，先给进出的人让一条路。", asset: 'morning-front', position: 'center', tint: 'dawn',
  questId: 'morning', metricIds: ['listening'], hotspots: [], firstScene: 'morning-front',
  objective: '帮陈伯赶完早市，再坐下来吃口热的。', next: 'noon', exitLabel: '去琴记面馆',
  exit: any({ kind: 'quest', id: 'morning', status: 'completed' }, { kind: 'quest', id: 'morning', status: 'failed' }),
  exitHint: '早饭还没端上桌。陈伯和阿宁都在等你。',
  beats: [{ label: '和陈伯打个照面', condition: flag('morning-listened') }, { label: '去后院找阿宁', condition: flag('ning-heard') }, { label: '在灶间跟陈伯学下一笼', condition: flag('morning-played') }, { label: '把早饭端上桌', condition: flag('morning-ended') }],
  scenes: [
    { id: 'morning-front', title: '店门口', time: '早市 · 等候与取餐', description: "等早饭的人挨着长凳站，买好的从搁板那边拿，零钱在另一头收。陈伯转身就能摸到纸袋，空笼往里面让了些，门口这条路仍要留给端东西的人。", asset: 'morning-front', hotspots: front,
      foreground: { clipPath: 'polygon(55.3% 54.4%,100% 58%,100% 85%,56.6% 80.6%)', z: 5 },
      camera: { views: [
        { id: 'counter', label: '柜台边', x: 49.5, y: 52, zoom: 1.45 },
        { id: 'rest', label: '柜台外侧的坐处', x: 49, y: 63, zoom: 1.5 },
        { id: 'waiting-seat', label: '长凳旁的小凳', x: 35, y: 77, zoom: 1.65 },
        { id: 'cashier', label: '收银小台', x: 87, y: 51, zoom: 1.8 },
        { id: 'customer-slip', label: '取餐台边的留单', x: 69.9, y: 54.3, zoom: 1.8 },
        { id: 'pickup', label: '取餐搁板', x: 65, y: 56.5, zoom: 1.6 },
        { id: 'empty-basket', label: '空笼的位置', x: 79.7, y: 53, zoom: 1.6 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '掀帘，进灶间', condition: flag('morning-listened'), unavailable: '先和陈伯打个照面。' }] },
    { id: 'morning-kitchen', title: '灶间', time: '清晨 · 揉面与蒸制', description: "面团在案板一侧，空笼留在炉边，陈伯伸手拿哪样都不用绕到门口。后院传来水声，你从干柜旁边经过，得先避开地上刚沾湿的一块。", asset: 'morning-kitchen', hotspots: kitchen,
      camera: { views: [
        { id: 'teaching', label: '陈伯示范的地方', x: 59.5, y: 64, zoom: 1.4 },
        { id: 'stove', label: '蒸炉边', x: 73.5, y: 48, zoom: 1.6 },
        { id: 'plan', label: '墙上的备料表', x: 35.5, y: 36, zoom: 1.8 },
        { id: 'bench', label: '揉面案', x: 40.2, y: 66, zoom: 1.6 },
        { id: 'hooks', label: '入口挂钩', x: 6.3, y: 46, zoom: 1.7 },
        { id: 'storage', label: '入口干柜', x: 17.5, y: 77, zoom: 1.7 },
      ] }, links: [{ sceneId: 'morning-front', label: '回店门口' }, { sceneId: 'morning-yard', label: '穿过后门，去小院' }] },
    { id: 'morning-yard', title: '后院', time: '早市后 · 洗手与吃早饭', description: "洗过的东西靠水池搭着，帆布包和教案放在干凳旁边。桌上先摆了碗筷，阿宁来回拿东西，没有将自己的信一起收进灶间，门外有人叫，仍听得见。", asset: 'morning-yard', hotspots: yard,
      foreground: { clipPath: 'polygon(65.4% 57.2%,81.6% 57.7%,79.2% 68.7%,78.4% 90.4%,76.8% 90.2%,77% 72.4%,58.8% 71.5%,58.6% 89.7%,56.8% 89.6%,56.6% 69.5%,54.9% 66.5%)', z: 6 },
      decorations: [
        { id: 'chen-empty-seat', asset: 'prop-stool', x: 49.3, y: 91.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'ning-empty-seat', asset: 'prop-stool', x: 84, y: 89.5, width: 8, height: 12, z: 2, condition: not(atMeal) },
        { id: 'family-breakfast', asset: 'morning-breakfast-bowl', x: 66.8, y: 59.2, width: 4, height: 6, z: 9, condition: all(flag('morning-played'), not(flag('morning-meal-cleared'))) },
      ],
      camera: { views: [
        { id: 'sink', label: '水池旁', x: 38.5, y: 52, zoom: 1.45 },
        { id: 'bag', label: '干凳与帆布包', x: 15.2, y: 72, zoom: 1.7 },
        { id: 'family', label: '家用柜', x: 54.5, y: 47, zoom: 1.8 },
        { id: 'school-drawing', label: '上层的教室画', x: 56.7, y: 41.2, zoom: 1.8 },
        { id: 'chen-meal', label: '陈伯的坐处', x: 49.3, y: 60, zoom: 1.5 },
        { id: 'ning-meal', label: '阿宁的坐处', x: 84, y: 58, zoom: 1.45 },
        { id: 'ledger-meal', label: '饭桌边的账簿', x: 61.5, y: 64.5, zoom: 1.75 },
        { id: 'table-plan', label: '桌面里侧的备料表', x: 62.5, y: 58, zoom: 1.8 },
        { id: 'tea', label: '桌内侧的茶具', x: 72.5, y: 57.2, zoom: 1.6 },
        { id: 'departure', label: '门边的干凳', x: 27, y: 60, zoom: 1.5 },
      ] }, links: [{ sceneId: 'morning-kitchen', label: '回灶间' }] },
  ],
};

const father: DialogueSeed[] = [
  {
    "portrait": "chen",
    "id": "invite",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-invite",
        "condition": { "kind": "reward", "id": "ning-ready-bye" },
        "unavailable": "先去后院跟阿宁尝一口，问好饭摆在哪儿。",
        "label": "那我们先摆碗。",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-at-table"
          },
          {
            "kind": "flag",
            "id": "morning-zhou-collected"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "opening",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-listen",
        "label": "阿宁在后头？我去找她。",
        "next": "concern",
        "effects": [
          {
            "kind": "flag",
            "id": "morning-listened"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      },
      {
        "id": "morning-shared-memory",
        "label": "照片里那个包子，你还记得吧？",
        "condition": {
          "kind": "any",
          "conditions": [
            {
              "kind": "clue",
              "id": "family-photo"
            },
            {
              "kind": "clue",
              "id": "chen-memory"
            }
          ]
        },
        "unavailable": "先看看奶奶家的旧照片，或听她讲起那回包包子的事。",
        "next": "old-photo",
        "effects": []
      },
      {
        "id": "morning-bye",
        "label": "我先在店里看看。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "old-photo",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-memory-return",
        "label": "今天我包个像样的。",
        "next": "concern",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-recognized"
          },
          {
            "kind": "flag",
            "id": "morning-listened"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "concern",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-ask-knee",
        "label": "你柜里那个护膝，怎么没戴？",
        "condition": {
          "kind": "clue",
          "id": "knee-note"
        },
        "unavailable": "还没留意到护膝。",
        "next": "knee",
        "effects": []
      },
      {
        "id": "morning-ask-old-hours",
        "label": "老周每天都这个点来？",
        "next": "hours",
        "effects": []
      },
      {
        "id": "morning-thanks",
        "label": "我去后院看看。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "hours",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-hours-end",
        "label": "看来今天这方子还得认真学。",
        "effects": [
          {
            "kind": "clue",
            "id": "old-customer"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "knee",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-knee-end",
        "label": "我把凳子拿过来，你先坐一会儿。",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-has-seat"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "before-food",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-back-to-talk",
        "label": "我先看看别的，待会儿回来。",
        "effects": []
      },
      {
        "id": "morning-return-stove",
        "label": "老周青菜两只，阿宁豆沙一只，你的肉包也得留。",
        "effects": [],
        "activityId": "morning-game",
        "condition": {
          "kind": "flag",
          "id": "ning-heard"
        },
        "unavailable": "先去后院问清阿宁的那份，再来装下一笼。"
      },
      {
        "id": "morning-decide",
        "label": "早饭好了，我们去后院吃。",
        "condition": {
          "kind": "flag",
          "id": "morning-played"
        },
        "unavailable": "先把这一笼照看好。",
        "next": "table",
        "effects": [
          {
            "kind": "flag",
            "id": "chen-at-table"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "table",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-show-papers",
        "label": "要不把两张纸放一起看看？",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "schedule"
            },
            {
              "kind": "clue",
              "id": "bus-note"
            },
            {
              "kind": "metric",
              "id": "listening",
              "min": 4
            }
          ]
        },
        "unavailable": "两张纸要看齐，也得听阿宁把安排说完。",
        "next": "papers",
        "effects": [
          {
            "kind": "flag",
            "id": "morning-papers-shared"
          }
        ]
      },
      {
        "id": "morning-table-first",
        "label": "包子再不吃就凉了。等会儿讲吧。",
        "next": "sit-down",
        "effects": []
      },
      {
        "id": "morning-later-plan",
        "label": "今天先不改了，慢慢再说。",
        "next": "defer",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "papers",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-let-father-answer",
        "label": "我先把书收起来，听你们说。",
        "next": "bus",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "bus",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-let-ning-answer",
        "label": "把样面那一栏翻给陈伯看。",
        "next": "trial",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "trial",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-agree",
        "label": "把试行的三格记下来。",
        "decision": "morning",
        "next": "trial-end",
        "effects": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "completed"
          },
          {
            "kind": "flag",
            "id": "morning-plan"
          },
          {
            "kind": "flag",
            "id": "morning-ended"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      },
      {
        "id": "morning-leave-to-them",
        "label": "先把这一顿吃完，表晚点再放。",
        "next": "sit-down",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "trial-end",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-trial-close",
        "label": "把书收好，等后天再来。",
        "effects": [
          {
            "kind": "clue",
            "id": "morning-record"
          },
          {
            "kind": "flag",
            "id": "morning-meal-cleared"
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "sit-down",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-table-agree",
        "label": "我把咸菜拿走，你们慢慢吃。",
        "decision": "morning",
        "next": "table-end",
        "effects": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "completed"
          },
          {
            "kind": "flag",
            "id": "morning-table"
          },
          {
            "kind": "flag",
            "id": "morning-ended"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "table-end",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-table-close",
        "label": "我这回拿纸袋装。",
        "effects": [
          {
            "kind": "clue",
            "id": "morning-record"
          },
          {
            "kind": "flag",
            "id": "morning-meal-cleared"
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "defer",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "morning-overpromise",
        "label": "那我先把书收起来。",
        "decision": "morning",
        "next": "defer-end",
        "effects": [
          {
            "kind": "quest",
            "id": "morning",
            "status": "failed"
          },
          {
            "kind": "flag",
            "id": "morning-defer"
          },
          {
            "kind": "flag",
            "id": "morning-ended"
          }
        ]
      },
      {
        "id": "morning-reconsider",
        "label": "再坐会儿吧，包子还剩着。",
        "next": "sit-down",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "defer-end",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-defer-close",
        "label": "那我下次再来问。",
        "effects": [
          {
            "kind": "clue",
            "id": "morning-unfinished"
          },
          {
            "kind": "flag",
            "id": "morning-meal-cleared"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chen",
    "id": "after",
    "speaker": "陈伯",
    "choices": [
      {
        "id": "morning-after-bye",
        "label": "我描清楚，回家先试少量。",
        "effects": []
      }
    ]
  },
  {
    "id": "counter-busy",
    "speaker": "陈伯",
    "portrait": "chen",
    "choices": [
      {
        "id": "morning-counter-busy-close",
        "label": "我先去后头看看。",
        "effects": []
      }
    ]
  }
];
const daughter: DialogueSeed[] = [
  {
    "portrait": "ning",
    "id": "hello",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-ask-school",
        "label": "学校那边怎么定下来的？",
        "next": "school",
        "effects": [
          {
            "kind": "flag",
            "id": "ning-heard"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      },
      {
        "id": "ning-hello-bye",
        "label": "我先把店里看完。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "school",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-ask-plan",
        "label": "你贴在灶间那张表，是怎么回事？",
        "condition": {
          "kind": "clue",
          "id": "schedule"
        },
        "unavailable": "去灶间看看她改过的备料表。",
        "next": "plan",
        "effects": []
      },
      {
        "id": "ning-listen",
        "label": "你是不是有点担心陈伯？",
        "next": "not-said",
        "effects": []
      },
      {
        "id": "ning-school-close",
        "label": "我先回灶间，待会儿再来。",
        "effects": []
      },
      {
        "id": "ning-ask-chalk",
        "label": "干凳上那三盒粉笔，真都是你买的？",
        "condition": {
          "kind": "clue",
          "id": "ning-chalk"
        },
        "unavailable": "看看门后新买的粉笔。",
        "next": "chalk",
        "effects": []
      },
      {
        "id": "ning-ask-drawing",
        "label": "小朱那张画，我翻过了。",
        "condition": {
          "kind": "clue",
          "id": "ning-drawing"
        },
        "unavailable": "先看看干凳旁的画纸。",
        "next": "drawing",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "plan",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-plan-close",
        "label": "这张先别收，饭桌上能用。",
        "effects": [
          {
            "kind": "flag",
            "id": "ning-plan-heard"
          },
          {
            "kind": "metric",
            "id": "listening",
            "amount": 1
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "not-said",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-listen-close",
        "label": "我去看下一笼了。",
        "effects": [
          {
            "kind": "clue",
            "id": "ning-breakfast"
          }
        ]
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "ready",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-ready-bye",
        "label": "我把这只端过去。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "ning",
    "id": "after",
    "speaker": "阿宁",
    "choices": [
      {
        "id": "ning-after-bye",
        "label": "行。那你也记得吃午饭。",
        "effects": [{ "kind": "clue", "id": "ning-lunchbox" }]
      },
      {"id":"ning-take-lunchbox-message","label":"饭盒那句话，我替你记着。","condition":{"kind":"not","condition":{"kind":"clue","id":"ning-lunchbox"}},"effects":[{"kind":"clue","id":"ning-lunchbox"}]}
    ]
  },
  {
    "id": "chalk",
    "speaker": "阿宁",
    "portrait": "ning",
    "choices": [
      {
        "id": "ning-chalk-close",
        "label": "我把袋子往里收，别再绊着。",
        "effects": []
      }
    ]
  },
  {
    "id": "drawing",
    "speaker": "阿宁",
    "portrait": "ning",
    "choices": [
      {
        "id": "ning-drawing-close",
        "label": "我原样夹好，不给他多画一条腿。",
        "effects": []
      }
    ]
  }
];
export const morningDialogues: Dialogue[] = [
 { id:'morning-talk',entry:'opening',entries:[{condition:all(flag('morning-plan'),not({kind:'reward',id:'morning-trial-close'})),nodeId:'trial-end'},{condition:all(flag('morning-table'),not({kind:'reward',id:'morning-table-close'})),nodeId:'table-end'},{condition:all(flag('morning-defer'),not({kind:'reward',id:'morning-defer-close'})),nodeId:'defer-end'},{condition:flag('morning-ended'),nodeId:'after'},{condition:all(flag('morning-played'),not(flag('chen-at-table')),not({kind:'reward',id:'ning-ready-bye'})),nodeId:'counter-busy'},{condition:all(flag('morning-played'),not(flag('chen-at-table'))),nodeId:'invite'},{condition:flag('morning-played'),nodeId:'table'},{condition:flag('morning-listened'),nodeId:'counter-busy'}],nodes:father.map(node=>scriptNode({...node,versions:node.id==='opening'?[{condition:{kind:'reward',id:'arrival-ate'},beats:chenScripts.opening!.map(beat=>beat.kind==='speech'&&beat.speaker==='小满'&&beat.text==='还没。'?{...beat,text:'吃了一点，还能吃你这儿的。'}:beat)}]:node.id==='knee'?[{condition:flag('chen-has-seat'),beats:chenKneeSeated}]:node.id==='counter-busy'?[{condition:flag('morning-played'),beats:chenWaitingForBreakfast}]:undefined},chenScripts[node.id])) },
 { id:'ning-talk',entry:'hello',entries:[{condition:flag('morning-ended'),nodeId:'after'},{condition:flag('morning-played'),nodeId:'ready'},{condition:flag('ning-heard'),nodeId:'school'}],nodes:daughter.map(node=>scriptNode({...node,versions:node.id==='after'?[{condition:all(laterJourney,flag('morning-plan')),beats:ningLaterFollowup(ningAfterTrial)},{condition:all(laterJourney,flag('morning-table')),beats:ningLaterFollowup(ningAfterTable)},{condition:all(laterJourney,flag('morning-defer')),beats:ningLaterFollowup(ningAfterDefer)},{condition:flag('morning-plan'),beats:ningAfterTrial},{condition:flag('morning-table'),beats:ningAfterTable},{condition:flag('morning-defer'),beats:ningAfterDefer}]:undefined},ningScripts[node.id])) },
];
export const morningGame: MinigameDefinition = {
  "id": "morning-game",
  "chapterId": "morning",
  "module": "breakfast",
  "title": "下一笼",
  "target": 75,
  "description": "先做五只：老周两只青菜，阿宁一只豆沙，陈伯和你各一只肉的。认馅、看火，再把两袋和饭碗分清。",
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "morning-listened"
      },
      {
        "kind": "flag",
        "id": "ning-heard"
      },
      {
        "kind": "any",
        "conditions": [
          {
            "kind": "reward",
            "id": "morning-return-stove"
          },
          {
            "kind": "reward",
            "id": "morning-back-to-talk"
          },
          {
            "kind": "flag",
            "id": "morning-played"
          }
        ]
      }
    ]
  },
  "unavailable": "先在后院问好阿宁的那份，再到灶间跟陈伯学包子。",
  "breakfast": {
    "fillings": [
      "青菜",
      "豆沙",
      "鲜肉"
    ],
    "orders": [
      {
        "id": "zhou",
        "person": "周叔带走",
        "hint": "给老伴，清淡些。",
        "filling": "青菜",
        "count": 2
      },
      {
        "id": "ning",
        "person": "阿宁的碗",
        "hint": "她从小爱吃甜的。",
        "filling": "豆沙",
        "count": 1
      },
      {
        "id": "chen",
        "person": "陈伯的碗",
        "hint": "留一只肉的，别全卖了。",
        "filling": "鲜肉",
        "count": 1
      },
      {
        "id": "xiaoman",
        "person": "小满的碗",
        "hint": "歪的那只自己吃，鲜肉馅。",
        "filling": "鲜肉",
        "count": 1
      }
    ],
    "packaging": [
      {
        "orderId": "zhou",
        "title": "老周的两只青菜",
        "choices": [
          {
            "id": "one-bag",
            "label": "两只装在同一袋"
          },
          {
            "id": "two-bags",
            "label": "两只分别装袋"
          }
        ],
        "expected": "two-bags",
        "wrong": "陈伯：“分开，两个袋。带回家的别让路上那只压扁，今天别叫你坏了规矩。”"
      },
      {
        "orderId": "chen",
        "title": "陈伯自己的肉包",
        "choices": [
          {
            "id": "bag",
            "label": "放进纸袋"
          },
          {
            "id": "bowl",
            "label": "留在碗里"
          }
        ],
        "expected": "bowl",
        "wrong": "阿宁：“爸的这只放碗里，咱们端去后院。”\n陈伯：“对，留我一份，忙完我就过来。”"
      }
    ],
    "copy": {
      "intro": "陈伯：“先留五只，老周两只青菜，阿宁豆沙，我和你各一只肉的。来，你认馅，我在这边看着。”",
      "fillings": {
        "青菜": "陈伯：“切细一点好收口，也不用剁成泥。来，挑一点看看，水先弄干爽，包的时候皮就稳当。”",
        "鲜肉": "陈伯：“这盆拌完，筷子一挑能带起来。你以后自己做两回，就知道差在哪儿。”\n小满：“今天真有点咸？”\n陈伯：“出锅自己尝，咸淡哪能光闻出来。”",
        "豆沙": "陈伯：“这只给阿宁。先放一小球，边上留出收口的地方。她喜欢甜，咱也得先包得住。”"
      },
      "wrongFillings": {
        "chen": "陈伯：“我这只留肉的，青菜是老周的。咱们换回来，再按人认一遍。”"
      },
      "checkOrders": "陈伯：“再数一遍。老周青菜两只，阿宁豆沙一只，咱俩各留只肉的，一共五只。”",
      "beforeSteam": "陈伯：“收口再捏紧点。包好了醒一会儿，再合盖上火。火我看着，你留意盖沿的白气，别一闻着香就揭。”",
      "early": "陈伯扶住盖沿：“这回还早，气还没上齐。先盖回去，我陪你看着，等它稳一点再揭。”",
      "late": "陈伯：“这回火急了，先关一下。头一回看还拿不准，咱们再试一回。”",
      "steamed": "笼盖揭开，热气涌出来，你往后让半步。陈伯将夹子递到你手边。\n陈伯：“先松开粘着的边。哎，你自己包那只也没破，挺好。”\n小满：“那我先给自己留着，等会儿尝尝。”",
      "helped": "陈伯扶着笼盖让你看：“白气到这样就差不多了。来，拿夹子，分装咱们再一份一份认。”",
      "packed": "阿宁端着碗过来：“老周两袋我拿去前头。爸，你这只留碗里，我们先摆着。”\n陈伯：“好，我递完这几袋就来。小满，你那只也趁热吃。”"
    }
  },
  "reward": {
    "id": "morning-game-reward",
    "label": "出笼了",
    "feedback": "五只都出笼了。老周两只青菜分两袋，阿宁的豆沙、陈伯的肉包和你自己那只各留在碗里。\n\n阿宁替你把碗端稳，叫你一起去后院。陈伯看了看你包的那只，笑着说：“留着自己尝，吃过一口，就知道这皮下回该怎么擀了。”",
    "effects": [
      {
        "kind": "flag",
        "id": "morning-played"
      },
      {
        "kind": "metric",
        "id": "listening",
        "amount": 1
      }
    ]
  }
};
