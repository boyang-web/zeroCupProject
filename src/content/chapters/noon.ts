import type { Chapter, Condition, Dialogue, Hotspot, MinigameDefinition } from '../../core/contracts.ts';
import { scriptNode, type DialogueSeed } from '../narrative.ts';
import { qinScripts, chuanScripts, tianScripts } from '../scripts/noon.ts';
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
      "text": "面是一整碗，葱漂在汤面，筷子横在桌边，外面的纸还没拆。你起初以为田姨吃了一点不想要了，凑近才发现，碗边连挑出来的一片葱都没有。\n\n田姨见你看，马上指了指碗，说她点半份不要葱，端过来这碗，哪一样都跟说好的不一样。她没将碗推到过路的地方，只把杯子往里挪，给人重新端来时留位置。\n\n出餐口又响起报号，她回头等了等，听清不是自己的，才接着说琴妹答应重做了，新的还没上。肩上的包带也没摘，她一只手搭在上面，像怕真等久了，起身还得收拾一遍。\n\n你问要不要先把这碗收走，她说收里面就行，别拿过去又算成她已经吃过。她还得吃完再回对面，等的可不只是重新端上来这一步。",
      "versions": [
        {
          "condition": {
            "kind": "flag",
            "id": "noon-ended"
          },
          "text": "碗里剩着一圈汤迹，筷子并排放在旁边，包已经不在凳子上。隔着窗看，对街的门还开着，田姨已经回去接她手上的活。\n\n这次是吃完了，跟刚来时筷子没拆的样子不同。你把空碗往桌里侧收，杯子也一起让开，给后面的人留出坐下的位置，没有再等她回来接着吃。"
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
      "text": "粉笔字从整碗一直排到小菜，半份也做塞在两行之间，后头还有个箭头，指向不够可以添。你站远一点读，先看见的全是大字，那条小的要凑近才找得准。\n\n你把板子翻过去，背面留着没擦干净的旧价。琴姐说半份做很久了，后来重写菜单，下面不够排，她就顺手添在中间，想着熟客反正都知道，哪想到手机上也就跟着没这一项。\n\n你问是不是现在加的，她摇头，说早就有，不够吃再添就行，可柜边忙起来，要的哪一种没传到灶上，光让人家点了也没用。\n\n你照箭头又读一遍，小字就在两行中间。板子放回去时，一点粉笔蹭到指头上，你用纸擦净，免得等会儿翻书，也将半份这两个字带到书页边。",
      "exhibit": {
        "kind": "note",
        "kicker": "菜单背面 · 琴姐添的字",
        "title": "半份也做",
        "lines": [
          "半份，照样现煮。",
          "忌口写在单上。",
          "中午不够吃，可以再添。"
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
      "text": "杯底剩着一点茶色，壶放在你这边，田姨没起身够。你问要不要续，她先看面碗，笑着说一点就好，别给她拿喝水算一顿饭。\n\n她将杯子往外推，给你腾出倒水的地方，不必越过那碗没动的面。你提壶时停了一下，想起她还在等重做的，杯子可以添，面却不能就这样没人再问。\n\n田姨见你看她，抬抬手说水够了，有空就去灶边问面。她把杯子留在外侧，先给碗腾出地方，包带仍挎着，一时没往凳上放。",
      "versions": [
        {
          "condition": {
            "kind": "flag",
            "id": "noon-ended"
          },
          "text": "田姨已经提包回对面，杯子留在窗边，里面那一点没喝完的茶还温着。你把它和空碗一块儿往里侧让，收的时候不用伸过别人面前。\n\n她没留在这里等再续一杯，对街还有活要做。桌沿空出来，后面的人放包、拆筷子，都不用先替她搬这一套用过的碗杯。"
        },
        {
          "condition": {
            "kind": "flag",
            "id": "tian-tea"
          },
          "text": "茶没有添满，杯口留着能捧的地方。田姨用手试试温度，先往里挪，把碗要放下的那块地方空出来。\n\n你刚想问还要什么，她就说水够了，让你去问面。话说得不急，却没有把自己真在等的那一件忘掉，包也仍放在伸手就能提的位置。"
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
          "feedback": "田姨将杯子往外让，等你倒一点就叫够了。她把杯子收回碗旁，指了指出餐口：“水够了，你去问面，半份那两个字也替我带进去。”",
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
      "text": "门帘右下角接过一条边，针脚沿着旧折线走了一段，又在新的布边拐回去。你捏住背面，能摸到几处不同的锁边，像拆开过，又照着门实际的宽窄改过。\n\n琴姐说对面的田姐补了三回，头一次她嫌麻烦，拿旧数叫人锁一下，带回来挂，右边还是长，开门擦着脚，最后还得请人来量。旧布洗过会缩，新接上去的那截没有缩，拿在手里看着齐，挂起来又差一点。\n\n你刚问后来怎么处理，她说到早知道就该，锅里先滚起来，后半句只好留着。你松开手，补过的那一角落回门边，比原来的边窄一点。\n\n琴姐往灶前走了，剩下的得找做活的人问。田姨的铺子就在对面，手上还忙着改衣服，等她有空，可以拿这道锁边请她认一认。",
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
      "text": "田姨卸下包带，顺手把折着的纸放在桌边。你伸手想替她夹到传菜单上，见最上头写着袖口，又停住了。\n\n纸上记着裤脚留边、袖口收一点，下午试衣圈了两道。田姨说这个得自己带回对面，别替她收走，来试的人还要照着认。她把杯子往旁边让，没拿带着茶水的杯底压纸。\n\n你将原来的折痕合回去，放到她伸手拿得到的地方。这张跟半份不葱不是一回事，要问下午赶着做什么，等她先把面那句讲完。",
      "exhibit": {
        "kind": "note",
        "kicker": "田姨随身带的改衣单",
        "title": "下午来试",
        "lines": [
          "裤脚：留边。",
          "袖口：收一点，先别缝死。",
          "下午来试，见人再定。"
        ],
        "footer": "她看完带回对面。"
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
      "text": "夹子上的三张单只有窗边那张是手写，字大一些，后面标着半份不葱。另一张印着外送的尾号，取餐交接也要算在八分钟里，第三张写后来的一桌，整份，可以等。\n\n你拿下来重新按人对一遍，才发现忙的时候一听谁说急，很容易把刚才哪张已经在等忘掉。纸上只写要求，两口锅什么时候空、做完还要去哪儿交，得另找地方记，不能光把先做两个字往哪张上面一画就算排过。\n\n夹子上也没有熟客先放着的空位，田姨那份同样得有前后。你将三张按原来的朝向夹回去，先没递往灶边，打算跟阿川把人和时间都对清，再让琴姐动手。\n\n纸角有一点卷，压平了能读见下面的字。你把外送那张的备注整个露出来，免得一夹又把交接两字遮住。",
      "exhibit": {
        "kind": "note",
        "kicker": "手写的堂食单",
        "title": "窗边 · 半份，不葱",
        "lines": [
          "先问田姨还剩多少时间。",
          "门口的外送也要记交接时间。",
          "后来的一桌，说可以等。"
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
      "text": "案上留着一团做半份的小面，看着没多少，揉开、撒粉、转过来擀，动作却没有跟着少一半。琴姐擀到一边停下，你以为要切了，她又翻过来，将厚的地方补了两下。\n\n她说一头厚一头薄，入锅就有的硬有的烂，不是捞晚一点能补回来。你要记半份三分钟，得先让案上的活做完，别把从揉到擀都算成抬一下手，等到锅边才发现面还在这里。\n\n你顺着她的动作看，手要从哪边扶、案面哪里该再撒点粉，都比站门口想的具体。她将擀好的面放到干处，拿走刮下来的碎末，才给下一团留位置。\n\n锅在旁边滚着，琴姐将面放好，又伸手去拿漏勺。你在纸上补了从案板到锅边这一段，写到最后才抬头，她已经在问下一张要下哪份。",
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
    "x": 53.3,
    "y": 53.6,
    "cameraView": "seasoning",
    "icon": "look",
    "sprite": {
      "asset": "seasoning",
      "width": 8,
      "height": 12,
      "z": 6
    },
    "interaction": {
      "kind": "inspect",
      "text": "圆肚子那瓶是老醋，细长的装生抽，两只瓶子挨着，你站远了只看得出高矮。提起老醋时，瓶底带出一角收据，原来底下垫过纸，裁出的边正好露着台面那个圆印。\n\n琴姐没看你拿的是哪瓶，先叫放回原来的印上。她忙着用时伸手就摸，临时挪一个地方，后头取到的可能就是另一味。你问纸湿了换不换，她说能换，位置别跟着换。\n\n你将收据压平，把瓶底照着那一圈放下。琴姐转身伸手，正好摸到圆肚子那只，看也没看就拿稳了，等你说原来你认这个，她才往台面瞥一眼，说手摸熟的，换了地方就得重新找。"
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
      "text": "出餐架多留了一双筷子，没套进外送那种餐具里，也没搭在刚洗的碗上。你以为谁漏拿，伸手要收，琴姐从门里说别动，是你的。\n\n你说现在还没点，她叫你等会儿点，不是非得先有人喊半份整份，才能给你留一双。奶奶让你来问做法，又没叫你端半天碗，最后空着肚子回去。\n\n你把筷子放回原处，她路过时又拿出一双短一点的，搁在架子另一头。你问那是谁的，她只说自己用，不用放进装盒子的那一堆，收台面时看见了就能找得到。\n\n架上忽然有两份都还没开吃的餐具。你记住自己这一双在哪儿，免得一忙，又替人装走了。"
    }
  },
  {
    "id": "noon-tasting",
    "label": "尝清汤的小碟",
    "x": 74.5,
    "y": 51.1,
    "cameraView": "serving",
    "icon": "look",
    "sprite": {
      "asset": "night-empty-bowl",
      "width": 4,
      "height": 2.9,
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
      "text": "你在柜边抄的那份，放到干处，原纸仍给阿川留着。下锅后头还有捞面、兑汤、装盒和交到谁手里，空着的那一格没有被你补成零。\n\n琴姐看一遍，先指调汤，又朝门外扬了扬下巴，说端去以后还得找对人。你在交接后头再画一条横线，刚才在柜边说过的，这会儿到面案才看见究竟绕哪一趟。",
      "exhibit": {
        "kind": "note",
        "kicker": "小满抄的，原纸在柜边",
        "title": "锅里之后还有几步",
        "lines": [
          "下锅 → 捞面 → 兑汤",
          "堂食端到桌；外送装盒",
          "叫号码，认人，再交出去"
        ],
        "footer": "没填的数，等琴姐和阿川一起核对。"
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
      "text": "机器吐的新纸还卷着，底下压着一张算到半截的草纸。阿川写了下锅、捞面、兑汤、装盒，前两项有数，后两项只剩加号，十五分钟外头圈着问号。\n\n你提起一角，底下还有昨天那半张。他说不是忘了扔，是今天一对，漏的还是那几步。装好盒子总得叫对人，出去认一趟号码，手里的这一碗又不能跟着耽搁。\n\n原纸要留给阿川，晚上还得跟琴姐一起看。你若怕从柜边讲到面案又漏一句，可以抄一份，没填的地方照着留白，别顺手替他算成零。",
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
          "feedback": "阿川把原纸按住，另给你一张空的：“这张你拿着。原来没填的别替我填，问清了我自己改。”你抄好下锅后头的几项，背面留空，等会儿还能接着记。",
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
      "text": "屏幕上仍是同时接五单，满额暂停没有启用，旁边那张手写的二却贴得很显眼。便签揭下又贴回过，边角已经不牢，阿川拿一小段胶带压住，让它不至于每次碰手机就翘起来。\n\n你将手机拿近，列表里只有整份，没有半份那一项。小字的备注能写不要葱，却不能替人把一整碗改小，菜单没加进去，端到灶上的要求也就跟着少了一截。\n\n阿川见你看那张便签，先说二是自己想改的数，还没定。他得让姨知道满的时候怎么回客人，堂食算不算进去，不能自己按了一个数，手写的又从旁边接着加。\n\n手机放回去时，便签边又翘起一点。阿川拿手指压住，看了一眼屏幕，叫你先把算锅那张纸给他，改数之前，他还想把漏的几步补上。",
      "exhibit": {
        "kind": "note",
        "kicker": "琴记 · 接单设置",
        "title": "同时接单",
        "lines": [
          "上限：5 单",
          "满额暂停：未启用",
          "便签：先算两口锅"
        ],
        "footer": "阿川的手机 · 待核对"
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
            "footer": "已保存 · 先试一周"
          },
          "text": "同时接单已经改成二，堂食也算进排队，阿川把保存过的页面停着，让琴姐随时能看。原先那张便签没扔，还压在手机旁，等一周后拿账重新对。\n\n你看见上面添了满了先告知等候，不再只剩一个二。改过的数有人看过，外头要等多久也得跟着说明，这些都留在看得见的地方。"
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
            "footer": "备注已更新"
          },
          "text": "半份和忌口已经加进接单备注，阿川把新打印出来的字也对过一遍，免得只在手机上看得见，传到灶边又没了。\n\n同时接单的数量还没改。他说这件晚上收摊再算，纸留在外头，不跟空盒一起收走。你没把菜单已改记成所有事都定了，数量那栏仍是要接着问的。"
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
      "text": "旧账本按名字写了不少小字，田姨半份不葱，阿宁醋少一点，奶奶后面画了一只小碗，添着尝了再加。你认出名字，原来每个人来吃饭时总说的那两句，也会被人这样记下来。\n\n并不是一条写过就再不动，有的旧偏好划掉，旁边标着日子。琴姐说那人从前一点辣都不要，后来连着三回来自己添，她才将旧字改了，省得下次想当然替人拦着。\n\n你说照这个看，熟客一来就知道要什么，琴姐却叫你别只看名字。今天想多吃一点，哪天嗓子不舒服，人都可以改口，记着是为了少漏一句，不是以后替他把每次都点完。\n\n她让你将簿子留在柜边，拿新单去问眼前的人。你合好时特意没夹进食谱，免得奶奶的米酒做法旁边，又混进去一页别人今天吃什么。",
      "exhibit": {
        "kind": "book",
        "kicker": "琴记 · 点单簿",
        "title": "点单簿",
        "lines": [
          "田姨：半份，不葱。",
          "阿宁：醋少一点。",
          "阿婆：小碗，醋少一点。"
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
      "text": "承诺十五分钟，取消时已经过了半小时。纸底有一圈汤印，漫上来挡住半个时间，你把它往窗前提了提，透着光还能看出原来的数字。\n\n阿川没将退单夹回新的那摞，在背面写了哪一锅先空，哪里等着装盒。最后那行写到再加就停了，像临时被叫去接人，回来却忘了原先还要加什么。\n\n你问留着做什么，他说怕明天又以为一共只有锅里的几分钟。等面的人能看见手机上过了多久，可他在店里忙起来，常只记得自己一直没有停，还觉得怎么就过了半小时。\n\n他让你看完先留着，别顺手撕成记零钱的小片。你将折起的一角摊开，背面的字仍读得出来，等他有空拿笔，这句再加后头还留得下几行。",
      "exhibit": {
        "kind": "note",
        "kicker": "阿川留下的退单",
        "title": "答应的十五分钟",
        "lines": [
          "客人已经等过一回。",
          "面回来时，汤也凉了。",
          "这张没有夹回新单里。"
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
  "exitLabel": "晚些时候，再出门",
  "exitHint": "这几张单还没理顺，琴姐也有话要说。",
  "exit": {
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
          "x": 80.2,
          "y": 50.8,
          "width": 5.3,
          "height": 4.7,
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
          "x": 80.2,
          "y": 50.8,
          "width": 5.3,
          "height": 4.7,
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
            "x": 53.3,
            "y": 48,
            "zoom": 1.75
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
        "label": "也是。先把能做多少算清楚。",
        "next": "decision",
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
        "id": "chuan-back-story",
        "label": "你刚才说，回来没多久？",
        "next": "returned",
        "effects": []
      },
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
    ]
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
        "label": "你先教我认单子。算清这几张再说。",
        "next": "count",
        "effects": [
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
        "label": "放心，原的给你，我拿抄过的。",
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
        "label": "好，先把这三张放稳，一张一张算。",
        "next": "count",
        "effects": [
          {
            "kind": "clue",
            "id": "chuan-return"
          }
        ]
      }
    ]
  }
];
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
        "id": "tian-order-close",
        "label": "我把时间和半份一起写到单上。",
        "effects": [
          {
            "kind": "clue",
            "id": "tian-order"
          }
        ]
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
      }
    ]
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
        "label": "好，你还剩多少时间，我一起记上。",
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
        "next": "break",
        "onceKey": "tian-listen",
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
      }
    ]
  }
];
export const noonDialogues: Dialogue[] = [
  {id:'noon-talk',entry:'opening',entries:[{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"noon-limited"},{"kind":"not","condition":{"kind":"reward","id":"noon-limit-record"}}]},"nodeId":"limited-end"},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"noon-counter"},{"kind":"not","condition":{"kind":"reward","id":"noon-counter-record"}}]},"nodeId":"counter-end"},{"condition":{"kind":"all","conditions":[{"kind":"flag","id":"noon-overload"},{"kind":"not","condition":{"kind":"reward","id":"noon-overload-record"}}]},"nodeId":"overload-end"},{"condition":{"kind":"flag","id":"noon-limited"},"nodeId":"after-limit"},{"condition":{"kind":"flag","id":"noon-counter"},"nodeId":"after-counter"},{"condition":{"kind":"flag","id":"noon-overload"},"nodeId":"after-overload"},{"condition":{"kind":"flag","id":"noon-ended"},"nodeId":"after"},{"condition":{"kind":"flag","id":"noon-played"},"nodeId":"decision"},{"condition":{"kind":"flag","id":"noon-listened"},"nodeId":"preparing"}],nodes:qinNodes.map(n=>scriptNode({portrait:'qin',...n},qinScripts[n.id]))},
  {id:'chuan-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'after'},{condition:flag('chuan-heard'),nodeId:'count'}],nodes:chuanNodes.map(n=>scriptNode({portrait:'chuan',...n},chuanScripts[n.id]))},
  {id:'tian-talk',entry:'opening',entries:[{condition:flag('noon-played'),nodeId:'served'},{condition:flag('tian-heard'),nodeId:'break'}],nodes:tianNodes.map(n=>scriptNode({portrait:'tian',...n},tianScripts[n.id]))},
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
      "intro": "琴姐把三张夹到你面前：“你排，我先不下。两口都煮面，一口里前头没捞完，后头就得接着等。田姐那份也别忘了改。”",
      "tickets": {
        "delivery": "阿川：“这张门口取，盒装。报完尾号再给，别问谁的，头一个应声的你就递。”",
        "tian": "田姨：“半份，不葱。从下锅起六分钟端来，吃面的工夫另留。别给我一碗热的，又叫我马上走。”",
        "inside": "琴姐：“后来这一桌问过了，可以等。不是不用做，给他们也留个排得到的地方。”"
      },
      "missing": "琴姐往夹子上看：“还剩一张呢，别下面空了，上面就当做完。先把谁等着认全。”",
      "wrongHalf": "田姨：“半份，你这张还是整的。别想着快点端来，份量也跟着忘。”",
      "wrongScallion": "琴姐伸手拦了拦：“先看不葱那两个字。这会儿改，总比端出去再挑省事。”",
      "orderError": "阿川顺着纸上的时间加一遍：“同一口得接着算。你看这里，前一份占着，后一份就晚了，还能换到另一口试。”",
      "help": "琴姐把田姨那张夹到前头，外送放另一口：“这两个先并着做，能等的跟在后头。你自己再认一遍半份、不葱，别光看我挪纸。”",
      "ready": "你把三张按人再念一遍，琴姐才点头：“行，就照这个下。你盯田姐那碗，阿川认外送的号码，我捞后头那份，别都挤在一个地方。”"
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
