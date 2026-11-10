import type { Chapter, Condition, Dialogue, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { qinScripts, chuanScripts, tianScripts, chuanAfterMeal } from '../scripts/noon.ts';
const flag = (id: string): Condition => ({ kind: 'flag', id });
const clue = (id: string): Condition => ({ kind: 'clue', id });
const all = (...conditions: Condition[]): Condition => ({ kind: 'all', conditions });
const any = (...conditions: Condition[]): Condition => ({ kind: 'any', conditions });
const not = (condition: Condition): Condition => ({ kind: 'not', condition });
const ateOwnBowl = any(clue('noon-record'), clue('noon-unfinished'));
const laterJourney: Condition = any(...(['active','completed','failed'] as const).map(status => ({ kind: 'quest' as const, id: 'night', status })));
const chuanAtFront = all(flag('noon-played'), not(laterJourney));
const front: Hotspot[] = [
  {
    "id": "chuan-front",
    "label": "阿川",
    "x": 60.4,
    "y": 84,
    "cameraView": "front-chuan",
    "icon": "talk",
    "sprite": {
      "asset": "chuan",
      "width": 18,
      "height": 61,
      "z": 7
    },
    "condition": {
      "kind": "all",
      "conditions": [
        {
          "kind": "flag",
          "id": "noon-played"
        },
        {
          "kind": "not",
          "condition": {
            "kind": "any",
            "conditions": [
              {
                "kind": "quest",
                "id": "night",
                "status": "active"
              },
              {
                "kind": "quest",
                "id": "night",
                "status": "completed"
              },
              {
                "kind": "quest",
                "id": "night",
                "status": "failed"
              }
            ]
          }
        }
      ]
    },
    "interaction": {
      "kind": "dialogue",
      "dialogueId": "chuan-talk"
    }
  },
  {
    "id": "noon-person",
    "label": "琴姐",
    "x": 71.1,
    "y": 84,
    "cameraView": "qin",
    "icon": "talk",
    "sprite": {
      "asset": "qin",
      "width": 14,
      "height": 58,
      "z": 7
    },
    "interaction": {
      "kind": "dialogue",
      "dialogueId": "noon-talk"
    }
  },
  {
    "id": "tian",
    "label": "田姨",
    "x": 32.5,
    "y": 97,
    "cameraView": "tian",
    "icon": "talk",
    "sprite": {
      "asset": "tian",
      "width": 20.5,
      "height": 60,
      "z": 7
    },
    "condition": {
      "kind": "not",
      "condition": {
        "kind": "flag",
        "id": "noon-ended"
      }
    },
    "interaction": {
      "kind": "dialogue",
      "dialogueId": "tian-talk"
    }
  },
  {
  "id": "untouched-bowl",
  "label": "窗边的碗",
  "x": 18.9,
  "y": 66.2,
  "cameraView": "window-table",
  "icon": "look",
  "sprite": {
    "asset": "noon-bowl-wrong",
    "width": 5.8,
    "height": 5.2,
    "z": 8
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "noon-ended"
      },
      "asset": "noon-bowl-empty"
    },
    {
      "condition": {
        "kind": "flag",
        "id": "noon-played"
      },
      "asset": "plain-noodle"
    }
  ],
  "interaction": {
    "kind": "inspect",
    "text": "你走近窗桌，才看清那是一整碗面，葱花浮在汤上，筷子外面的纸却连口也没撕。刚才站在门边，你还以为田姨吃不下剩着了，现在碗边连挑出来的一片葱也没有，你伸到一半的手便收回来。\n\n她指给你看，说自己要的是半份，不放葱，在柜边已经说过。你没急着替店里解释，先听她把话说全。半碗她能吃完，满满这一碗，她舍不得剩，吃完又得耽搁回去的工夫。\n\n出餐口有人报号，她抬头等了一下，听清不是自己的，又将肩上的包带捋顺。你看见她还给新碗留着一块空桌面，便问已经答应重做了没有，心里想着这回得把准话带回来，不能再替谁回一句马上就好。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "noon-ended"
        },
        "text": "窗边留下空碗，筷子并着搁在碗沿，刚才没拆的那层纸团在旁边。对街的门还开着，田姨已经回去接手上的活，桌上这一份确实吃过了。\n\n你站在原来替她问话的位置，想起自己差点将没动过的也当剩下的收走。琴姐说等这阵忙过就来收，你便把自己的书拿开，给端碗的人留一块干处，没有再替田姨续水。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "noon-played"
        },
        "text": "端来的是半份，汤面没有葱。田姨用筷尖卷起一口，先吹了吹，看到你还在旁边站着，就叫你去忙自己的，不用守着她吃。\n\n包从肩上卸下来了，搁在里侧，她拿杯子时胳膊也能松开。刚才她总往出餐口看，这会儿才顾得上把碗转到顺手的一边，慢慢尝第一口。"
      }
    ],
    "action": {
      "id": "read-untouched-bowl",
      "label": "看一看",
      "condition": {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "noon-played"
        }
      },
      "effects": [
        {
          "kind": "clue",
          "id": "wrong-bowl"
        }
      ]
    }
  }
},
  {
  "id": "front-menu",
  "label": "手写菜单",
  "x": 47.5,
  "y": 33.5,
  "cameraView": "menu",
  "icon": "look",
  "sprite": {
    "asset": "noon-menu",
    "width": 16,
    "height": 15.5,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "half-portion"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你站在门口找半份，眼睛先顺着大字看了两遍，才在两行之间找到那一小句。琴姐说有，一直都有，自己写菜单时下面不够排，就往中间添，老客来了会喊，她以为没什么妨碍。\n\n你想起自己刚才也是先看整碗的价钱，差一点替田姨猜成不合口味。半份做了这么久，不知道的人却得先问出来。琴姐伸手指那行，指头蹭上一点粉笔，她又将手收回，说等忙完得重写，别下次还是叫人站在门口找。",
    "exhibit": {
      "kind": "note",
      "kicker": "菜单背面 · 琴姐添的字",
      "title": "半份也做",
      "lines": [
        "清汤面：整份、半份。",
        "葱花按口味添。",
        "半份不够，可以再添。"
      ]
    },
    "action": {
      "id": "read-front-menu",
      "label": "看清菜单的小字",
      "effects": [
        {
          "kind": "clue",
          "id": "half-portion"
        }
      ]
    }
  }
},
  {
  "id": "window-cup",
  "label": "窗边的茶",
  "x": 13.5,
  "y": 65.8,
  "cameraView": "window-table",
  "icon": "tea",
  "sprite": {
    "asset": "noon-cup-empty",
    "width": 3.3,
    "height": 4.6,
    "z": 8
  },
  "variants": [
    {
      "condition": {
        "kind": "flag",
        "id": "noon-ended"
      },
      "asset": "noon-cup-empty"
    },
    {
      "condition": {
        "kind": "flag",
        "id": "tian-tea"
      },
      "asset": "noon-cup-filled"
    }
  ],
  "completed": {
    "kind": "flag",
    "id": "tian-tea"
  },
  "interaction": {
    "kind": "inspect",
    "text": "田姨杯底还留着一点水，茶壶在你这边。你看她一直没起身去够，便先将壶提起来试了试，壶身温着，不算重。她见你拿，笑着说添一点就好，杯子不用倒满，待会儿面来了还得挪。\n\n你把杯子往桌外让开一点，没越过她面前那碗没动的面。她向对街看了一眼，又回过头等你，等的是面还有多久的准话，你在心里也将这一句放在前头。",
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "noon-ended"
        },
        "text": "窗桌只留着用过的杯子，田姨的包已带回对面。你看杯里还有一点茶，便没将旁边那只壶又提起来。门口有人经过时，琴姐抬头应了一声，叫这边碗杯先放着，她腾出手一起收。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "tian-tea"
        },
        "text": "田姨将杯子往里让了一点，给新端来的面留地方。你问还要不要添，她摆摆手说这些够，接着将刚才说的半份不葱又念给你听。你点头，把壶放稳，没再拿倒水的工夫替她拖着那句准信。"
      }
    ],
    "options": [
      {
        "id": "pour-tian-tea",
        "label": "续一点茶",
        "condition": {
          "kind": "not",
          "condition": {
            "kind": "flag",
            "id": "noon-ended"
          }
        },
        "unavailable": "田姨已经回对面做活了。",
        "feedback": "你给她添了一点温水。田姨接稳杯子，朝你笑了笑：“这样就够，谢谢。你去问问面吧，我在这儿等。”她给杯子挪出位置，手仍留在随时能提起包的那一边。",
        "effects": [
          {
            "kind": "flag",
            "id": "tian-tea"
          }
        ]
      }
    ]
  }
},
  {
  "id": "patched-curtain",
  "label": "补过的门帘",
  "x": 63.6,
  "y": 25.7,
  "cameraView": "curtain",
  "icon": "look",
  "sprite": {
    "asset": "noon-curtain",
    "width": 13.2,
    "height": 7.8,
    "z": 6
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你侧身过门帘，衣袖被右下角那截布轻轻带了一下。接边的针脚比上头细，翻到背面，还能摸到拆过的旧针眼。你小时候进这种门，总爱掀着一边荡过去，奶奶在后头叫看脚下，你多半只顾往灶上找吃的。\n\n琴姐看见你捏着那块，隔着面案说田姐补了三回。头一次她嫌麻烦，叫人照旧数锁边，挂回来才发现右边扫地，最后还是得拿尺来量。话说到早知道，锅里先滚起来了，她只好提着漏勺过去。\n\n你松开手，让布沿顺着原来的位置落下。窗边田姨包里露着一截软尺，你记住了这几道针脚，没再隔着帘子追着琴姐问。",
    "exhibit": {
      "kind": "note",
      "kicker": "门帘反面 · 细密的锁边",
      "title": "田姨补过三回",
      "lines": [
        "旧针眼一行挨着一行。",
        "琴姐说，对面的田姐认得这块布。",
        "新换的边，她下午再带来。"
      ]
    },
    "action": {
      "id": "read-patched-curtain",
      "label": "记住这处针脚",
      "effects": [
        {
          "kind": "clue",
          "id": "tian-curtain"
        }
      ]
    }
  }
},
  {
  "id": "tian-work-slip",
  "label": "田姨的改衣单",
  "x": 22.9,
  "y": 67.5,
  "cameraView": "window-table",
  "icon": "look",
  "sprite": {
    "asset": "noon-work-slip",
    "width": 4.5,
    "height": 3.6,
    "z": 8
  },
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "tian-heard"
      },
      {
        "kind": "not",
        "condition": {
          "kind": "flag",
          "id": "noon-ended"
        }
      }
    ]
  },
  "completed": {
    "kind": "clue",
    "id": "tailor-job"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "田姨从包外层摸出一张小纸，沿着折痕展在桌边。你差点顺手把它拿去跟传菜单夹在一起，低头看见袖口两个字，才停住。纸上记着裤脚留边，袖口先别缝死，下午来试圈了两道。\n\n她说这张得自己带回去，试衣的人来了，还要当面看哪里收。你替她压平折起的一角，忽然有点不好意思。刚进店时觉得每个人都在催一碗面，手里拿的也都是单子，凑近了，一张纸后头等着的事却各不相同。你将改衣单放回她手边，没有再跟店里的混放。",
    "exhibit": {
      "kind": "note",
      "kicker": "田姨随身带的改衣单",
      "title": "下午来试",
      "lines": [
        "裤脚：留边。",
        "袖口：收一点，先别缝死。",
        "下午来试，见人再定。"
      ]
    },
    "action": {
      "id": "read-tian-work-slip",
      "label": "看清这是改衣单",
      "effects": [
        {
          "kind": "clue",
          "id": "tailor-job"
        }
      ]
    }
  }
}
];
const kitchen: Hotspot[] = [
  {
    "id": "qin-kitchen",
    "label": "面案旁的琴姐",
    "x": 61,
    "y": 93,
    "cameraView": "teacher",
    "icon": "talk",
    "sprite": {
      "asset": "qin",
      "width": 16.5,
      "height": 57,
      "z": 7
    },
    "condition": {
      "kind": "all",
      "conditions": [
        {
          "kind": "flag",
          "id": "noon-listened"
        },
        {
          "kind": "not",
          "condition": {
            "kind": "flag",
            "id": "noon-played"
          }
        }
      ]
    },
    "interaction": {
      "kind": "dialogue",
      "dialogueId": "noon-talk",
      "entry": "before-service"
    }
  },
  {
    "id": "noon-object",
    "label": "排单，出面",
    "x": 80.3,
    "y": 39,
    "cameraView": "service-rail",
    "icon": "look",
    "sprite": {
      "asset": "noon-order-rail",
      "width": 9.5,
      "height": 8.5,
      "z": 6
    },
    "interaction": {
      "kind": "minigame",
      "gameId": "noon-game"
    },
    "completed": {
      "kind": "flag",
      "id": "noon-played"
    }
  },
  {
  "id": "noon-note",
  "label": "传菜夹上的单子",
  "x": 41.3,
  "y": 48.1,
  "cameraView": "tickets",
  "icon": "look",
  "sprite": {
    "asset": "morning-prep",
    "width": 5,
    "height": 14.5,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "orders"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你将三张单并着看了一遍。田姨那张是手写，半份、不葱占着两行；外送印着号码，旁边记了取餐的时间；后来的一桌在末尾添着可以等。刚才隔着门听，只觉得都是在叫面，纸真的摆到一处，才分得清哪一句属于谁。\n\n你怕传过去又漏掉，拿笔照着人名和号码各描了一小记。琴姐伸手时，你没有再说先做急的，就将田姨那张摆到最上头，把问来的工夫一块念给她听。她应一声，又看了一遍不葱，才伸手去拿面。",
    "exhibit": {
      "kind": "note",
      "kicker": "手写的堂食单",
      "title": "窗边 · 半份，不葱",
      "lines": [
        "窗边田姐：半份，不葱。",
        "门口外送：按尾号交接。",
        "后来的一桌：整份，可以等。"
      ]
    },
    "action": {
      "id": "read-noon-note",
      "label": "把三张单看清楚",
      "effects": [
        {
          "kind": "clue",
          "id": "orders"
        }
      ]
    }
  }
},
  {
  "id": "noon-board",
  "label": "案上的擀面杖",
  "x": 35.4,
  "y": 72.6,
  "cameraView": "kneading",
  "icon": "look",
  "sprite": {
    "asset": "morning-board",
    "width": 22,
    "height": 11,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "two-pots"
  },
  "interaction": {
    "kind": "inspect",
    "text": "你跟着琴姐的手看，半份的那团面明明很小，翻、压、撒粉却一样没少。擀到一头，她又揭起来摸了摸，你以为已经够薄，她说这一块还厚，入锅以后中间硬，边上先软，不能靠晚捞一会儿补。\n\n她把擀面杖让给你，你轻轻推了一下，面跟着杖往前跑，差点卷上去。她没替你接完，只叫你手松一点，另一边转着走。你照着再推，慢是慢，面倒留在案上了。\n\n刚才你还在纸上算能省几分钟，这会儿轮到自己，两只手各该放哪里都要重新找。你把那一小片搁回干处，先等她看看厚薄，没急着往书里添会了两个字。",
    "action": {
      "id": "read-noon-board",
      "label": "记在页边",
      "effects": [
        {
          "kind": "clue",
          "id": "two-pots"
        }
      ]
    }
  }
},
  {
  "id": "noon-seasoning",
  "label": "调味罐",
  "x": 51.2,
  "y": 53.2,
  "cameraView": "seasoning",
  "icon": "look",
  "sprite": {
    "asset": "seasoning",
    "width": 4.5,
    "height": 7,
    "z": 6
  },
  "interaction": {
    "kind": "inspect",
    "text": "你提起圆肚子的老醋，瓶底带出一角垫着的旧收据。琴姐没回头，就叫你放回那个圆印上。你本来想给她换到台边，听见这一声，才低头将纸角捋平，照着原处放好。\n\n她转身伸手，果然先摸到瓶肚子，另一只细长的生抽没动。你问她是不是都不用看，她笑，说忙的时候眼睛还得看锅，手摸不着熟悉的地方，人就要愣一下。你在旁边站着，忽然不敢再凭自己觉得方便，替她把这几只瓶子排得整整齐齐。"
  }
},
  {
  "id": "noon-chopsticks",
  "label": "多留的一双筷子",
  "x": 84.6,
  "y": 51.7,
  "cameraView": "serving",
  "icon": "look",
  "sprite": {
    "asset": "noon-chopsticks",
    "width": 6.2,
    "height": 3.2,
    "z": 6
  },
  "interaction": {
    "kind": "inspect",
    "text": "你以为出餐架上这双筷子是谁漏拿了，伸手想收，琴姐看见便叫住，说给你的，先放着。她从你进门起就说要留面，你一直忙着答别人要什么，倒将自己这一份听过去了。\n\n你将筷子往里让一点，留下那块干地方，心里盘算等这三份端好，自己真得坐下吃。奶奶让你来尝原汤，要是站一中午，最后只带回几行别人说的字，回去她问好不好吃，你又得从头解释。",
    "versions": [
      {
        "condition": {
          "kind": "any",
          "conditions": [
            {
              "kind": "clue",
              "id": "noon-record"
            },
            {
              "kind": "clue",
              "id": "noon-unfinished"
            }
          ]
        },
        "text": "你用过的那双筷子已经和碗收在一起，出餐架还留着琴姐自己那份。她将短一点的那双往里让，给刚洗好的碗腾位置。\n\n你问她什么时候吃，她说这几张收好了就下，面还留着。她也给自己放着餐具，看见了，总好想起来坐一会儿。"
      }
    ]
  },
  "condition": {
    "kind": "not",
    "condition": {
      "kind": "any",
      "conditions": [
        {
          "kind": "clue",
          "id": "noon-record"
        },
        {
          "kind": "clue",
          "id": "noon-unfinished"
        }
      ]
    }
  }
},
  {
    "id": "noon-tasting",
    "label": "尝清汤的小碟",
    "x": 55.1,
    "y": 53.2,
    "cameraView": "tasting",
    "icon": "look",
    "sprite": {
      "asset": "night-empty-bowl",
      "width": 2.8,
      "height": 2.2,
      "z": 8
    },
    "condition": {
      "kind": "flag",
      "id": "noon-played"
    },
    "completed": {
      "kind": "clue",
      "id": "qin-tasting"
    },
    "interaction": {
      "kind": "dialogue",
      "dialogueId": "noon-talk",
      "entry": "tasting"
    }
  },
  {
  "id": "noon-timing-copy",
  "label": "抄给琴姐的草纸",
  "x": 45.5,
  "y": 54.5,
  "cameraView": "timing-copy",
  "icon": "look",
  "sprite": {
    "asset": "noon-work-slip",
    "width": 5.5,
    "height": 2.4,
    "z": 8
  },
  "condition": {
    "kind": "flag",
    "id": "noon-timing-copy"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你在柜边抄的纸放到面案外侧，空着的一格仍没填。琴姐看见捞面后头的加号，先让你跟着端一趟空盒，走到门口，再回到出餐架旁。等你站回来，她手里的漏勺已经提起放下过一回。\n\n你把这段路也画进去，原来柜边那句还得交给人，到了这里，才知道人得离开哪一口锅。原纸留给阿川，手里这一张你自己又添了两道箭头，没将留白挤成一个看着好交代的零。",
    "exhibit": {
      "kind": "note",
      "kicker": "小满抄的，原纸在柜边",
      "title": "锅里之后还有几步",
      "lines": [
        "下锅 → 捞面 → 兑汤",
        "堂食端到桌；外送装盒",
        "叫号码，认人，再交出去"
      ]
    }
  }
}
];
const corner: Hotspot[] = [
  {
    "id": "chuan",
    "label": "阿川",
    "x": 72,
    "y": 93.5,
    "cameraView": "chuan",
    "icon": "talk",
    "sprite": {
      "asset": "chuan",
      "width": 17,
      "height": 59.5,
      "z": 7
    },
    "condition": {
      "kind": "not",
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "flag",
            "id": "noon-played"
          },
          {
            "kind": "not",
            "condition": {
              "kind": "any",
              "conditions": [
                {
                  "kind": "quest",
                  "id": "night",
                  "status": "active"
                },
                {
                  "kind": "quest",
                  "id": "night",
                  "status": "completed"
                },
                {
                  "kind": "quest",
                  "id": "night",
                  "status": "failed"
                }
              ]
            }
          }
        ]
      }
    },
    "interaction": {
      "kind": "dialogue",
      "dialogueId": "chuan-talk"
    }
  },
  {
  "id": "receipt-printer",
  "label": "吐单机",
  "x": 29,
  "y": 62.5,
  "cameraView": "printer",
  "icon": "look",
  "sprite": {
    "asset": "printer",
    "width": 9.5,
    "height": 9.4,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "capacity"
  },
  "interaction": {
    "kind": "inspect",
    "text": "新吐出的票纸往外卷，阿川用手背按了一下，底下那张草纸便露出来。两口锅各画一个圈，下锅、捞面写了数，到了兑汤和装盒，只剩几个加号，十五分钟旁边还有个问号。\n\n你以为是今天才没写完，他将下面半张也抽出来，说昨天就卡在这里。门口一喊，他出去，回来又有新单，纸上的空处就一直空着。他说到这儿自己也不好意思，将笔拿起来，又先问琴姐那边捞一碗究竟得腾出几次手。\n\n原纸上已经挤不下，旁边倒还有空白的。你想带一份去面案对，阿川便指指那一叠，让原的给他留着，今晚还要看。他将笔推近，自己替你按住往外卷的票纸，等着你动笔。",
    "action": {
      "id": "read-receipt-printer",
      "label": "记在页边",
      "effects": [
        {
          "kind": "clue",
          "id": "capacity"
        }
      ]
    },
    "options": [
      {
        "id": "copy-noon-timing",
        "label": "抄一份，拿去面案一起看",
        "condition": {
          "kind": "flag",
          "id": "chuan-heard"
        },
        "unavailable": "先问阿川，这张算到哪里了。",
        "feedback": "阿川替你按着纸，你把两口锅和后面几步照着抄下，空着的仍留空。原纸还他，手里的这一张，你用笔又标了兑汤和交接，准备拿去面案跟琴姐对。",
        "effects": [
          {
            "kind": "flag",
            "id": "noon-timing-copy"
          }
        ]
      }
    ]
  }
},
  {
  "id": "order-phone",
  "label": "接单手机",
  "x": 45,
  "y": 62.2,
  "cameraView": "phone",
  "icon": "look",
  "sprite": {
    "asset": "phone-stand",
    "width": 4.3,
    "height": 12,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "order-limit"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "phone",
    "text": "你把手机拿近，先看见同时接五单，旁边贴着的便签却只有一个二。阿川见你看那张纸，先说还没改，数字是自己想试的，得跟姨一块算过。便签已经揭下又贴过，角上搭着一截新胶带，你没有伸手去替他按那个设置。\n\n菜单往下只有整份，没有半份。你想起田姨面前那碗，刚才在柜上说过的要求，到了纸上竟还是另一份。阿川将备注那栏翻出来给你看，里面能写不要葱，却没把半碗的份量加进去，他自己也重新停下来认了一遍。\n\n你原先很想顺手帮他把两处一起改好，好让眼前立刻有点进展。可琴姐还在灶边，哪个数算不算堂食、满了怎么回人，都不能只在这个屏幕上按完。你先将手机放稳，把算过的纸给他留出来。",
    "exhibit": {
      "kind": "note",
      "kicker": "琴记 · 接单设置",
      "title": "同时接单",
      "lines": [
        "上限：5 单",
        "满额暂停：未启用",
        "便签：先算两口锅"
      ],
      "footer": "阿川的手机 · 待核对",
      "phone": {
        "heading": "琴记 · 接单",
        "view": "orders"
      }
    },
    "versions": [
      {
        "condition": {
          "kind": "flag",
          "id": "noon-limited"
        },
        "exhibit": {
          "kind": "note",
          "kicker": "琴记 · 接单设置",
          "title": "先按两单试",
          "lines": [
            "上限：2 单",
            "堂食也计入排队",
            "满额先告知等待"
          ],
          "footer": "已保存 · 先试一周",
          "phone": {
            "heading": "琴记 · 接单",
            "view": "orders"
          }
        },
        "text": "阿川给琴姐看过保存的页面，又将手机转向你。数字改成二，下面另写着堂食也计入排队，满额先告知等候。你没有再去碰那个数，他今晚还要记走了几单、哪一张没做成，原先的便签也留在旁边。\n\n刚才门口那个人等不起，已经去别家吃了。阿川低头看一眼空出来的接单栏，又去补纸上的时间。你把手机放回他顺手的位置，没替他将那张只写一个二的旧便签撕掉。"
      },
      {
        "condition": {
          "kind": "flag",
          "id": "noon-counter"
        },
        "exhibit": {
          "kind": "note",
          "kicker": "琴记 · 接单备注",
          "title": "半份也记上",
          "lines": [
            "菜单已加入半份",
            "忌口随单传到灶上",
            "接单量：饭后再算"
          ],
          "footer": "备注已更新",
          "phone": {
            "heading": "琴记 · 接单",
            "view": "orders"
          }
        },
        "text": "阿川将新打的单子压在屏幕旁边，半份、不葱，两边各认了一遍。他说这回纸上也有，省得端到门里，又得追着人喊一句。你往灶边望，琴姐正把手写那张夹到单独的夹子上，没有混在新单下面。\n\n同时接几单还没改，他和琴姐说好晚上再算。你将自己的纸往外收，不替他们把这一栏也填上，省得回去念给奶奶听，倒将还在商量的说成已经定好的。"
      }
    ],
    "action": {
      "id": "read-order-phone",
      "label": "核对接单设置",
      "effects": [
        {
          "kind": "clue",
          "id": "order-limit"
        }
      ]
    }
  }
},
  {
  "id": "old-ledger",
  "label": "旧点单簿",
  "x": 39,
  "y": 64,
  "cameraView": "ledger",
  "icon": "look",
  "sprite": {
    "asset": "morning-ledger-flat",
    "width": 12.5,
    "height": 4.5,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "familiar-names"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "book",
    "text": "你翻到奶奶的名字，旁边画着一只小碗，另添一句醋自己放。你从小跟她吃面，只记得她那口酸，倒没想到琴姐连最后这一点都替她留着，等她来了自己拿主意。\n\n田姨写半份不葱，阿宁醋少些，还有几个名字旁划掉旧字，标了日子。琴姐看你指那处，说那人现在自己添辣，以前的一点不要就得改，不能下回人没开口，她先替人把辣碟收了。\n\n你本来想照着名字找一找自己，翻到页尾又停下。今天想吃什么，你刚才也一直没答她，倒先忙着替所有人对单。你将簿子放回柜边，想好等她下你那碗时，自己说清葱吃不吃、醋先不添。",
    "exhibit": {
      "kind": "book",
      "kicker": "琴记 · 点单簿",
      "title": "点单簿",
      "lines": [
        "田姨：半份，不葱。",
        "阿宁：醋少一点。",
        "阿婆：小碗，醋自己添。"
      ]
    },
    "action": {
      "id": "read-old-ledger",
      "label": "记住熟客的这一页",
      "effects": [
        {
          "kind": "clue",
          "id": "familiar-names"
        }
      ]
    }
  }
},
  {
  "id": "rejected-slip",
  "label": "取消的一单",
  "x": 60,
  "y": 46.4,
  "cameraView": "rejected",
  "icon": "look",
  "sprite": {
    "asset": "morning-prep",
    "width": 5.5,
    "height": 14.5,
    "z": 6
  },
  "completed": {
    "kind": "clue",
    "id": "cancelled-order"
  },
  "interaction": {
    "kind": "inspect",
    "manipulation": "flip",
    "text": "你先认出十五分钟，底下的取消时间却隔了半个多钟头。汤印漫过半个字，阿川拿到光下给你看，说那天客人回到门口时，他还想解释已经在做，话出口，看见那人还攥着没拆的筷子，又说不下去了。\n\n他将纸留下，在背面补哪一锅先空、哪里等装盒，最后几个加号又没填完。你听他说一直没停过，倒想起自己等饭时也只看手机上的数，两边都觉得工夫不够，却不是多应一句快好了，就能从纸上省出来。\n\n你把折进去的那角摊开，没有替他誊成一张干净的。今晚琴姐还得看，原来答应了什么、哪一步没算，留在同一张上才认得出来。",
    "exhibit": {
      "kind": "note",
      "kicker": "阿川留下的退单",
      "title": "答应的十五分钟",
      "lines": [
        "承诺出餐：15 分钟。",
        "已等待：超过 30 分钟。",
        "订单状态：已取消。"
      ]
    },
    "action": {
      "id": "read-rejected-slip",
      "label": "看过这张退单",
      "effects": [
        {
          "kind": "clue",
          "id": "cancelled-order"
        }
      ]
    }
  }
}
];
export const noon: Chapter = {
  "id": "noon",
  "number": 3,
  "location": "琴记",
  "title": "窗边那一桌",
  "subtitle": "午休还剩一刻钟。",
  "time": "正午 · 琴记面馆",
  "asset": "noon-front",
  "position": "center",
  "tint": "day",
  "questId": "noon",
  "metricIds": [
    "research"
  ],
  "hotspots": [],
  "next": "night",
  "firstScene": "noon-front",
  "description": "你带着奶奶的书来问面汤怎么做，琴姐却先让开身子，端碗的人从你旁边过。窗边田姨的面一口没动，灶上还在报下一张单，柜边机器跟着响。你得先问清那一碗怎么了，才知道这会儿谁在等谁。",
  "revisitDescription": "琴记的锅和窗桌还在，柜边留着先前用过的单子。来吃面的人各有去处，想问做法或接上没说完的几句，还能找琴姐聊。",
  "objective": "先问清窗边那碗面，再帮琴姐理顺眼前的三张单。",
  "exitLabel": "去夜饭小馆",
  "exitHint": "三张单理顺后，和琴姐把话说完，再坐下来吃自己的那碗面。",
  "exit": {
  "kind": "all",
  "conditions": [
    {
      "kind": "any",
      "conditions": [
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
    },
    {
      "kind": "any",
      "conditions": [
        {
          "kind": "clue",
          "id": "noon-record"
        },
        {
          "kind": "clue",
          "id": "noon-unfinished"
        }
      ]
    }
  ]
},
  "beats": [
    {
      "label": "问问琴姐",
      "condition": {
        "kind": "flag",
        "id": "noon-listened"
      }
    },
    {
      "label": "听清两头的难处",
      "condition": {
        "kind": "all",
        "conditions": [
          {
            "kind": "flag",
            "id": "chuan-heard"
          },
          {
            "kind": "flag",
            "id": "tian-heard"
          }
        ]
      }
    },
    {
      "label": "安排出餐",
      "condition": {
        "kind": "flag",
        "id": "noon-played"
      }
    },
    {
      "label": "说定明天的办法",
      "condition": {
        "kind": "flag",
        "id": "noon-ended"
      }
    },
    {
      "label": "坐下来吃自己的面",
      "condition": { "kind": "any", "conditions": [{ "kind": "clue", "id": "noon-record" }, { "kind": "clue", "id": "noon-unfinished" }] }
    }
  ],
  "scenes": [
    {
      "id": "noon-front",
      "title": "店堂",
      "time": "正午 · 窗桌与取餐",
      "description": "琴姐站在出餐口，一喊号码就有人抬头。窗桌能看见对街，田姨的包靠着身边，面却没动。你将书往自己这边收，给端着热碗走过的人让开。",
      "asset": "noon-front",
      "hotspots": front,
      "decorations": [
        {
          "id": "tian-empty-seat",
          "asset": "noon-empty-seat",
          "x": 33.2,
          "y": 95.5,
          "width": 8.2,
          "height": 23,
          "z": 7,
          "condition": {
            "kind": "flag",
            "id": "noon-ended"
          }
        }
      ],
      "camera": {
        "views": [
          {
            "id": "front-chuan",
            "label": "阿川走近说话",
            "x": 60.4,
            "y": 43,
            "zoom": 1.45
          },
          {
            "id": "qin",
            "label": "出餐通道",
            "x": 71.1,
            "y": 44,
            "zoom": 1.45
          },
          {
            "id": "tian",
            "label": "田姨的座位",
            "x": 32.5,
            "y": 50.5,
            "zoom": 1.45
          },
          {
            "id": "window-table",
            "label": "窗边的碗",
            "x": 18.9,
            "y": 63.5,
            "zoom": 1.85
          },
          {
            "id": "menu",
            "label": "半份菜单",
            "x": 47.5,
            "y": 25.8,
            "zoom": 1.8
          },
          {
            "id": "curtain",
            "label": "门帘上的针脚",
            "x": 63.6,
            "y": 22,
            "zoom": 1.8
          }
        ]
      },
      "links": [
        {
          "sceneId": "noon-kitchen",
          "label": "穿过门帘，去面案",
          "condition": {
            "kind": "flag",
            "id": "noon-listened"
          },
          "unavailable": "先跟琴姐打个招呼。"
        },
        {
          "sceneId": "noon-corner",
          "label": "去接单柜看看"
        }
      ]
    },
    {
      "id": "noon-kitchen",
      "title": "面案",
      "time": "正午 · 揉面与煮制",
      "description": "案板靠窗，擀好的面先留在干处，两口锅的水都在滚。纸单挂在不沾水的那面墙上，熟面捞起要送往另一头，漏勺和空碗不能随手堆在一处。",
      "asset": "noon-kitchen",
      "hotspots": kitchen,
      "decorations": [
        {
          "id": "player-noodles-ready",
          "asset": "plain-noodle",
          "x": 81.4,
          "y": 49.6,
          "width": 4.3,
          "height": 3.8,
          "z": 6,
          "condition": {
            "kind": "all",
            "conditions": [
              {
                "kind": "flag",
                "id": "noon-played"
              },
              {
                "kind": "not",
                "condition": {
                  "kind": "any",
                  "conditions": [
                    {
                      "kind": "clue",
                      "id": "noon-record"
                    },
                    {
                      "kind": "clue",
                      "id": "noon-unfinished"
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "id": "player-noodles-finished",
          "asset": "noon-bowl-empty",
          "x": 81.4,
          "y": 49.6,
          "width": 4.3,
          "height": 3.8,
          "z": 6,
          "condition": {
            "kind": "any",
            "conditions": [
              {
                "kind": "clue",
                "id": "noon-record"
              },
              {
                "kind": "clue",
                "id": "noon-unfinished"
              }
            ]
          }
        }
      ],
      "camera": {
        "views": [
          {
            "id": "service-rail",
            "label": "三张单的木夹",
            "x": 80.3,
            "y": 35.3,
            "zoom": 1.8
          },
          {
            "id": "tickets",
            "label": "手写堂食单",
            "x": 41.3,
            "y": 40,
            "zoom": 1.8
          },
          {
            "id": "kneading",
            "label": "揉面案",
            "x": 35.4,
            "y": 68.5,
            "zoom": 1.6
          },
          {
            "id": "seasoning",
            "label": "灶边调味位",
            "x": 51.2,
            "y": 49,
            "zoom": 1.75
          },
          {
            "id": "tasting",
            "label": "灶旁干净台面的小碟",
            "x": 55.1,
            "y": 52,
            "zoom": 1.8
          },
          {
            "id": "serving",
            "label": "洁净出餐架",
            "x": 82.5,
            "y": 48.5,
            "zoom": 1.8
          },
          {
            "id": "teacher",
            "label": "面案旁，先认手边的活",
            "x": 61,
            "y": 61,
            "zoom": 1.35
          },
          {"id":"timing-copy","label":"干台面上的草纸","x":45.5,"y":53.6,"zoom":1.8}
        ]
      },
      "links": [
        {
          "sceneId": "noon-front",
          "label": "回店堂"
        },
        {
          "sceneId": "noon-corner",
          "label": "绕去接单柜"
        }
      ]
    },
    {
      "id": "noon-corner",
      "title": "接单柜",
      "time": "正午 · 收单与核对",
      "description": "手机、机器和点单簿都搁在干柜上，新吐出的纸还卷着一角。阿川拿笔将旧的压住，抬眼能看见田姨对街的铺子，低头又得先对眼前的号码。",
      "asset": "noon-corner",
      "hotspots": corner,
      "variants": [
        {
          "condition": {
            "kind": "all",
            "conditions": [
              {
                "kind": "flag",
                "id": "noon-played"
              },
              {
                "kind": "not",
                "condition": {
                  "kind": "any",
                  "conditions": [
                    {
                      "kind": "quest",
                      "id": "night",
                      "status": "active"
                    },
                    {
                      "kind": "quest",
                      "id": "night",
                      "status": "completed"
                    },
                    {
                      "kind": "quest",
                      "id": "night",
                      "status": "failed"
                    }
                  ]
                }
              }
            ]
          },
          "description": "手机和算过的单留在干柜上，阿川拿着便签去了店堂。窗外对面的机器，又接着响起来。"
        }
      ],
      "camera": {
        "views": [
          {
            "id": "chuan",
            "label": "阿川身旁",
            "x": 72,
            "y": 48,
            "zoom": 1.45
          },
          {
            "id": "printer",
            "label": "吐单机",
            "x": 29,
            "y": 57.5,
            "zoom": 1.8
          },
          {
            "id": "phone",
            "label": "接单手机",
            "x": 45,
            "y": 55.5,
            "zoom": 1.8
          },
          {
            "id": "ledger",
            "label": "熟客的点单簿",
            "x": 39,
            "y": 62.5,
            "zoom": 1.8
          },
          {
            "id": "rejected",
            "label": "退回的那一单",
            "x": 60,
            "y": 39.5,
            "zoom": 1.8
          }
        ]
      },
      "links": [
        {
          "sceneId": "noon-front",
          "label": "回店堂"
        },
        {
          "sceneId": "noon-kitchen",
          "label": "去面案"
        }
      ]
    }
  ]
};

const qinNodes: DialogueSeed[] = [
  {
    "portrait": "qin",
    "id": "ning-lunchbox",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-ning-lunchbox-close",
        "label": "好，我就照这句带回去。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "opening",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-listen",
        "label": "我去认单，哪几张还没做？",
        "next": "rush",
        "effects": [
          {
            "kind": "flag",
            "id": "noon-listened"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          },
          {
            "kind": "flag",
            "id": "noon-life-lesson"
          }
        ]
      },
      {
        "id": "noon-bye",
        "label": "我在这儿等一会儿。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "阿宁还没托你带这句话。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "rush",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-thanks",
        "label": "我去问阿川怎么排。",
        "effects": []
      },
      {
        "id": "noon-qin-cost",
        "label": "田姨点的时候，你们记下了没有？",
        "next": "half",
        "condition": {
          "kind": "clue",
          "id": "wrong-bowl"
        },
        "unavailable": "窗边有一碗没动过的面。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "half",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-half-close",
        "label": "我去看单子，她那张先别丢。",
        "effects": [
          {
            "kind": "clue",
            "id": "half-missed"
          }
        ]
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "preparing",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-qin-return",
        "label": "窗边那碗，我还想问一句。",
        "next": "half",
        "condition": {
          "kind": "clue",
          "id": "wrong-bowl"
        },
        "unavailable": "窗边有一碗没动过的面。",
        "effects": []
      },
      {
        "id": "noon-before-game-close",
        "label": "好，我去面案。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message-preparing",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "这句话还没托给你，或已经带到。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "decision",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-show-limit",
        "label": "阿川，把算过的时间拿来，跟琴姐一起看。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "capacity"
            },
            {
              "kind": "clue",
              "id": "order-limit"
            },
            {
              "kind": "flag",
              "id": "chuan-heard"
            }
          ]
        },
        "unavailable": "先问阿川，再看看接单手机和那几张小票。",
        "next": "limit",
        "effects": []
      },
      {
        "id": "noon-write-counter",
        "label": "接多少晚些再算，先让半份和忌口跟着单子走。",
        "next": "counter",
        "effects": []
      },
      {
        "id": "noon-promise-fast",
        "label": "先照十五分钟接着，我再帮一阵。",
        "next": "overload",
        "effects": []
      },
      {
        "id": "noon-decide-later",
        "label": "我再核对一下。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message-decision",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "这句话还没托给你，或已经带到。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chuan",
    "id": "limit",
    "speaker": "阿川",
    "choices": [
      {
        "id": "noon-limit-ask-qin",
        "label": "琴姐，你看呢？",
        "next": "limit-qin",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "limit-qin",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-agree",
        "label": "把今天这张留下，一周后照着核对。",
        "decision": "noon",
        "next": "limited-end",
        "effects": [
          {
            "kind": "quest",
            "id": "noon",
            "status": "completed"
          },
          {
            "kind": "flag",
            "id": "noon-limited"
          },
          {
            "kind": "flag",
            "id": "noon-ended"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          }
        ]
      }
    ]
  },
  {
    "portrait": "chuan",
    "id": "limited-end",
    "speaker": "阿川",
    "choices": [
      {
        "id": "noon-limit-record",
        "label": "趁这会儿，吃那碗面。",
        "effects": [
          {
            "kind": "clue",
            "id": "noon-record"
          }
        ]
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "counter",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-counter-agree",
        "label": "给堂食单也腾出一只夹子。",
        "decision": "noon",
        "next": "counter-end",
        "effects": [
          {
            "kind": "quest",
            "id": "noon",
            "status": "completed"
          },
          {
            "kind": "flag",
            "id": "noon-counter"
          },
          {
            "kind": "flag",
            "id": "noon-ended"
          }
        ]
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "counter-end",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-counter-record",
        "label": "我把书放旁边，先吃。",
        "effects": [
          {
            "kind": "clue",
            "id": "noon-record"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chuan",
    "id": "overload",
    "speaker": "阿川",
    "choices": [
      {
        "id": "noon-overpromise",
        "label": "先接着，我再帮一阵。",
        "decision": "noon",
        "next": "overload-end",
        "effects": [
          {
            "kind": "quest",
            "id": "noon",
            "status": "failed"
          },
          {
            "kind": "flag",
            "id": "noon-overload"
          },
          {
            "kind": "flag",
            "id": "noon-ended"
          }
        ]
      },
      {
        "id": "noon-reconsider",
        "label": "也是，先把堂食单传清楚，接多少晚些再算。",
        "next": "counter",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "overload-end",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-overload-record",
        "label": "把多出的那几分钟写下来。",
        "effects": [
          {
            "kind": "clue",
            "id": "noon-unfinished"
          }
        ]
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "after",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-ask-recipe",
        "label": "这碗清汤的做法，我还想问两句。",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-bye",
        "label": "我回去誊好，改天再来。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message-after",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "这句话还没托给你，或已经带到。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "after-limit",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-after-limit-recipe",
        "label": "这碗清汤，怎么和煮面的水分开？",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-limit-bye",
        "label": "我把这一页带回去，给奶奶念念。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message-after-limit",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "这句话还没托给你，或已经带到。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "after-counter",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-after-counter-recipe",
        "label": "做法里，我还想把清汤这一条问准。",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-counter-bye",
        "label": "你们晚上算。我先把菜谱带回去。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message-after-counter",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "这句话还没托给你，或已经带到。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "after-overload",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-after-overload-recipe",
        "label": "我想把这碗面的做法记完整。",
        "next": "qin-recipe",
        "effects": []
      },
      {
        "id": "noon-after-overload-bye",
        "label": "算过的纸留给你们，书我带着。",
        "effects": []
      },
      {
        "id": "noon-pass-ning-message-after-overload",
        "label": "阿宁托我带一句饭盒的事。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "clue",
              "id": "ning-lunchbox"
            },
            {
              "kind": "not",
              "condition": {
                "kind": "reward",
                "id": "noon-ning-lunchbox-close"
              }
            }
          ]
        },
        "unavailable": "这句话还没托给你，或已经带到。",
        "next": "ning-lunchbox",
        "effects": []
      }
    ]
  },
  {
    "portrait": "qin",
    "id": "qin-recipe",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-record-qin-recipe",
        "label": "把清汤和煮面分开这一条，写在页边。",
        "effects": [
          {
            "kind": "clue",
            "id": "qin-recipe-tip"
          }
        ]
      }
    ]
  },
  {
    "id": "before-service",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-service-start",
        "label": "人和单都对过了，我来排。",
        "condition": {
          "kind": "all",
          "conditions": [
            {
              "kind": "flag",
              "id": "chuan-heard"
            },
            {
              "kind": "flag",
              "id": "tian-heard"
            }
          ]
        },
        "unavailable": "先问阿川和田姨，认清这三张是谁的。",
        "activityId": "noon-game",
        "effects": []
      },
      {
        "id": "noon-service-look",
        "label": "我记住了，再核对一下单子。",
        "effects": []
      }
    ]
  },
  {
    "id": "tasting",
    "speaker": "琴姐",
    "choices": [
      {
        "id": "noon-taste-close",
        "label": "先尝原汤，醋等会儿自己添。",
        "effects": [
          {
            "kind": "clue",
            "id": "qin-tasting"
          }
        ]
      }
    ]
  }
];
const chuanNodes: DialogueSeed[] = [
  {
    "portrait": "chuan",
    "id": "opening",
    "speaker": "阿川",
    "choices": [
      {
        "id": "chuan-listen",
        "label": "外送什么时候开始接的？",
        "next": "why-online",
        "effects": [
          {
            "kind": "flag",
            "id": "chuan-heard"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          }
        ]
      },
      {
        "id": "chuan-bye",
        "label": "我看看柜上的单子。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chuan",
    "id": "why-online",
    "speaker": "阿川",
    "choices": [
      {
        "id": "chuan-ask-limit",
        "label": "能不能少接一点？",
        "next": "count",
        "effects": []
      },
      {
        "id": "chuan-ask-back",
        "label": "你回来多久了？",
        "next": "returned",
        "effects": []
      }
    ]
  },
  {
  "portrait": "chuan",
  "id": "count",
  "speaker": "阿川",
  "choices": [
    {
      "id": "chuan-count-close",
      "label": "先看看两口锅到底赶得上几张单。",
      "effects": [
        {
          "kind": "clue",
          "id": "chuan-count"
        }
      ]
    }
  ],
},
  {
    "portrait": "chuan",
    "id": "returned",
    "speaker": "阿川",
    "choices": [
      {
        "id": "chuan-share-job-gap",
        "label": "我也有一份没改完的简历。",
        "condition": {
          "kind": "clue",
          "id": "job-gap"
        },
        "unavailable": "还没翻过自己手机里的草稿。",
        "next": "shared-counter",
        "effects": []
      },
      {
        "id": "chuan-return-close",
        "label": "原纸先给你留着，咱们把眼前这几张认清。",
        "next": "count", "effects": [
          {
            "kind": "clue",
            "id": "chuan-return"
          }
        ]
      }
    ]
  },
  {
    "portrait": "chuan",
    "id": "after",
    "speaker": "阿川",
    "choices": [
      {
        "id": "chuan-after-bye",
        "label": "放心，原的给你，我回书里慢慢记。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "chuan",
    "id": "shared-counter",
    "speaker": "阿川",
    "choices": [
      {
        "id": "chuan-shared-counter-close",
        "label": "好，先忙眼前的，别的咱们回头再聊。",
        "next": "count", "effects": [
          {
            "kind": "clue",
            "id": "chuan-return"
          }
        ]
      }
    ]
  }
,
{
  "id": "details",
  "speaker": "阿川",
  "choices": [
    {
      "id": "chuan-back-story",
      "label": "你刚才说，回来没多久？",
      "next": "returned",
      "effects": []
    },
    {
      "id": "chuan-details-close",
      "label": "我去面案对清这几份，原纸给你留着。",
      "effects": []
    }
  ]
}];
const tianNodes: DialogueSeed[] = [
  {
    "portrait": "tian",
    "id": "opening",
    "speaker": "田姨",
    "choices": [
      {
        "id": "tian-listen",
        "label": "你还等得及吗？",
        "next": "break",
        "effects": [
          {
            "kind": "flag",
            "id": "tian-heard"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          }
        ]
      },
      {
        "id": "tian-ask-curtain",
        "label": "厨房门上那几道针脚，是你补的？",
        "condition": {
          "kind": "clue",
          "id": "tian-curtain"
        },
        "unavailable": "先看看门帘反面的针脚。",
        "next": "curtain-story",
        "effects": []
      },
      {
        "id": "tian-bye",
        "label": "我去问问还要多久。",
        "effects": []
      },
      {
        "id": "tian-ask-work",
        "label": "这张下午来试的单，也要给你带回去？",
        "condition": {
          "kind": "clue",
          "id": "tailor-job"
        },
        "unavailable": "先看看田姨桌边的那张纸。",
        "next": "work-ticket",
        "effects": []
      }
    ]
  },
  {
  "portrait": "tian",
  "id": "break",
  "speaker": "田姨",
  "choices": [
    {
      "id": "tian-order-close",
      "label": "我把时间和半份一起写到单上。",
      "effects": [
        {
          "kind": "clue",
          "id": "tian-order"
        }
      ]
    }
  ],
},
  {
    "portrait": "tian",
    "id": "served",
    "speaker": "田姨",
    "choices": [
      {
        "id": "tian-served-close",
        "label": "知道，半份的钱照收。你先吃。",
        "effects": []
      }
    ]
  },
  {
    "portrait": "tian",
    "id": "curtain-story",
    "speaker": "田姨",
    "choices": [
      {
        "id": "tian-curtain-story-close",
        "onceKey": "tian-listen",
        "label": "我先去问你的面，帘子的事回头接着聊。",
        "next": "break", "effects": [
          {
            "kind": "flag",
            "id": "tian-heard"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          }
        ]
      }
    ]
  },
  {
    "id": "work-ticket",
    "speaker": "田姨",
    "choices": [
      {
        "id": "tian-work-close",
        "label": "你的单放这里，我去找店里的那张。",
        "onceKey": "tian-listen",
        "next": "break", "effects": [
          {
            "kind": "flag",
            "id": "tian-heard"
          },
          {
            "kind": "metric",
            "id": "research",
            "amount": 1
          }
        ]
      }
    ]
  }
,
{
  "id": "details",
  "speaker": "田姨",
  "choices": [
    {
      "id": "tian-break-curtain",
      "label": "门帘反面那几道针脚，我刚才看见了。",
      "condition": {
        "kind": "clue",
        "id": "tian-curtain"
      },
      "unavailable": "先看看厨房门帘反面的针脚。",
      "next": "curtain-story",
      "effects": []
    },
    {
      "id": "tian-break-work",
      "label": "这张下午来试的单，也要给你带回去？",
      "condition": {
        "kind": "clue",
        "id": "tailor-job"
      },
      "unavailable": "先看看田姨桌边的那张纸。",
      "next": "work-ticket",
      "effects": []
    },
    {
      "id": "tian-details-close",
      "label": "我去灶间把这几份对清。",
      "effects": []
    }
  ]
}];
export const noonDialogues: Dialogue[] = [
  {id:'noon-talk',entry:'opening',entries:[{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"noon-limited"},{"kind":"not","condition":{"kind":"reward","id":"noon-limit-record"}}]},"nodeId":"limited-end"},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"noon-counter"},{"kind":"not","condition":{"kind":"reward","id":"noon-counter-record"}}]},"nodeId":"counter-end"},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"noon-overload"},{"kind":"not","condition":{"kind":"reward","id":"noon-overload-record"}}]},"nodeId":"overload-end"},{"condition":{"kind":"flag","id":"noon-limited"},"nodeId":"after-limit"},{"condition":{"kind":"flag","id":"noon-counter"},"nodeId":"after-counter"},{"condition":{"kind":"flag","id":"noon-overload"},"nodeId":"after-overload"},{"condition":{"kind":"flag","id":"noon-ended"},"nodeId":"after"},{"condition":{"kind":"flag","id":"noon-played"},"nodeId":"decision"},{"condition":{"kind":"flag","id":"noon-listened"},"nodeId":"preparing"}],nodes:qinNodes.map(n=>scriptNode({portrait:'qin',...n},qinScripts[n.id]))},
  {id:'chuan-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'after'},{condition:all(flag('chuan-heard'),clue('chuan-count')),nodeId:'details'},{condition:flag('chuan-heard'),nodeId:'count'}],nodes:chuanNodes.map(n=>scriptNode({portrait:'chuan',...n,versions:n.id==='after'?[{condition:ateOwnBowl,beats:chuanAfterMeal}]:undefined},chuanScripts[n.id]))},
  {id:'tian-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'served'},{condition:all(flag('tian-heard'),{kind:'reward',id:'tian-order-close'}),nodeId:'details'},{condition:flag('tian-heard'),nodeId:'break'}],nodes:tianNodes.map(n=>scriptNode({portrait:'tian',...n},tianScripts[n.id]))},
];
export const noonGame: MinigameDefinition = {
  "id": "noon-game",
  "chapterId": "noon",
  "module": "service-queue",
  "title": "两口锅，三张单",
  "target": 100,
  "description": "田姨半份不葱，外送认号码，后来的一桌可以等。两口锅的顺序先排在纸上，核对好了再下。",
  "condition": {
    "kind": "all",
    "conditions": [
      {
        "kind": "flag",
        "id": "noon-listened"
      },
      {
        "kind": "flag",
        "id": "chuan-heard"
      },
      {
        "kind": "flag",
        "id": "tian-heard"
      },
      {
        "kind": "any",
        "conditions": [
          {
            "kind": "reward",
            "id": "noon-service-start"
          },
          {
            "kind": "reward",
            "id": "noon-service-look"
          },
          {
            "kind": "flag",
            "id": "noon-played"
          },
          {
            "kind": "all",
            "conditions": [
              {
                "kind": "not",
                "condition": {
                  "kind": "flag",
                  "id": "noon-life-lesson"
                }
              },
              {
                "kind": "reward",
                "id": "noon-before-game-close"
              }
            ]
          }
        ]
      }
    ]
  },
  "unavailable": "先问齐三个人，再找面案旁的琴姐认一遍手边的活。",
  "service": {
    "pots": 2,
    "tickets": [
      {
        "id": "delivery",
        "person": "门口的外送",
        "cook": 4,
        "deadline": 8,
        "note": "从下锅起算，八分钟内交出去。"
      },
      {
        "id": "tian",
        "person": "窗边田姨",
        "cook": 3,
        "deadline": 6,
        "note": "从下锅起算，六分钟内做好。半份，不要葱。",
        "half": true,
        "noScallion": true
      },
      {
        "id": "inside",
        "person": "后来的一桌",
        "cook": 5,
        "deadline": 12,
        "note": "刚坐下，说可以等。"
      }
    ],
    "copy": {
      "intro": "琴姐将三张单夹到你面前：“来，你先排，我看着。两口都煮面，一口里前头没捞完，后头就得接着等。田姐那份单独认一下。”",
      "tickets": {
        "delivery": "阿川：“这张门口取，盒装。交出去之前报一下尾号，对清了再给，我跟你一块认。”",
        "tian": "田姨：“半份，不葱。从下锅起六分钟端来，吃饭的工夫另留，照刚才说好的就行。”",
        "inside": "琴姐：“后来这一桌问过了，可以等。不是不用做，给他们也留个排得到的地方。”"
      },
      "missing": "琴姐指了指木夹：“还剩一张，咱们先给它也留好位置，再一起往下算。”",
      "wrongHalf": "田姨：“我这份要半份，纸上还是整的，麻烦你再改一下。”",
      "wrongScallion": "琴姐：“不葱这两个字也勾上，咱们在下锅前认准，端出去就是对的。”",
      "orderError": "阿川顺着纸上的时间加一遍：“同一口得接着算。你看这里，前一份占着，后一份就晚了，还能换到另一口试。”",
      "help": "琴姐将田姨那张夹在前头，外送放另一口：“这两个先并着做，能等的跟后头。你再认认半份、不葱，咱们一块对好。”",
      "ready": "你将三张按人再念一遍。琴姐点点头：“行，就照这个下。你留意田姐那碗，阿川认外送号码，后头那份我捞，咱们各接一头。”"
    }
  },
  "reward": {
    "id": "noon-game-reward",
    "label": "面端出去了",
    "feedback": "田姨那碗半份没有葱，先在窗桌放稳了。阿川将外送的尾号念给门口的人听，对过了才递盒子，后来那桌也应了一声。琴姐把空下来的夹子往外挪，问你的面点了没有。你想说等会儿，见她已经伸手拿碗，先把书放到了干处。",
    "effects": [
      {
        "kind": "flag",
        "id": "noon-played"
      },
      {
        "kind": "metric",
        "id": "research",
        "amount": 1
      }
    ]
  }
};
