// Domain contracts contain no Vue, browser or renderer dependencies.
export type QuestStatus = 'active' | 'completed' | 'failed';
// Execution context stays outside GameState and save files.
export interface RuleOptions { developer?: boolean }
export type Condition =
  | { kind: 'flag'; id: string }
  | { kind: 'clue'; id: string }
  | { kind: 'reward'; id: string }
  | { kind: 'item'; id: string; count?: number }
  | { kind: 'metric'; id: string; min: number }
  | { kind: 'quest'; id: string; status: QuestStatus }
  | { kind: 'all' | 'any'; conditions: Condition[] }
  | { kind: 'not'; condition: Condition };
export type Effect =
  | { kind: 'flag' | 'clue'; id: string }
  | { kind: 'item' | 'metric'; id: string; amount: number }
  | { kind: 'quest'; id: string; status: QuestStatus };
export interface Action {
  id: string; label: string; effects: Effect[];
  condition?: Condition; unavailable?: string; onceKey?: string; feedback?: string;
}
export interface DialogueChoice extends Action { next?: string; decision?: string; activityId?: string }
export interface DialogueBeat { kind: 'speech' | 'narration'; text: string; speaker?: string; portrait?: string; direction?: string }
export interface DialogueNode { id: string; speaker: string; text: string; choices: DialogueChoice[]; portrait?: string; direction?: string; beats?: DialogueBeat[]; versions?: { condition: Condition; beats: DialogueBeat[] }[] }
export interface Dialogue { id: string; entry: string; entries?: { condition: Condition; nodeId: string }[]; nodes: DialogueNode[] }
export interface Exhibit { kind: 'book' | 'letter' | 'photo' | 'note'; kicker: string; title: string; lines: string[]; caption?: string; footer?: string; phone?: { time: string; heading: string; footer: string } }
export type Interaction =
  | { kind: 'inspect'; text: string; action?: Action; options?: Action[]; exhibit?: Exhibit; activityId?: string; journalLink?: boolean; manipulation?: 'book' | 'flip' | 'unfold' | 'phone'; versions?: { condition: Condition; text: string; exhibit?: Exhibit }[]; }
  | { kind: 'dialogue'; dialogueId: string; entry?: string }
  | { kind: 'minigame'; gameId: string };
export interface Hotspot {
  id: string; label: string; x: number; y: number; icon: string;
  cameraView?: string;
  interaction: Interaction; condition?: Condition; completed?: Condition;
  sprite?: { asset: string; width: number; height: number; z?: number };
  variants?: { condition: Condition; x?: number; y?: number; asset?: string; width?: number; height?: number; cameraView?: string }[];
  drag?: { actionId: string; target: { x: number; y: number; width: number; height: number }; hint: string };
}
export interface SceneLink { sceneId: string; label: string; condition?: Condition; unavailable?: string }
// Framing is presentation data; camera position is never a saved narrative fact.
export interface SceneCameraView { id: string; label: string; x: number; y: number; zoom: number }
export interface SceneCamera { views: SceneCameraView[] }
export interface SceneDecoration { id: string; asset: string; x: number; y: number; width: number; height: number; z?: number; condition?: Condition }
export interface SceneDefinition {
  id: string; title: string; description: string; asset: string; hotspots: Hotspot[];
  links: SceneLink[]; position?: string; tint?: string;
  foreground?: { clipPath: string; z: number };
  camera?: SceneCamera;
  decorations?: SceneDecoration[];
  variants?: { condition: Condition; asset?: string; description?: string; time?: string; tint?: string }[];
  time?: string;
}
export interface Chapter {
  id: string; number: number; title: string; subtitle: string; time: string;
  description: string; asset: string; position: string; tint: string;
  objective: string; questId: string; metricIds: string[]; hotspots: Hotspot[];
  next?: string; exit?: Condition; exitHint?: string;
  character?: { asset: string; x: number; y: number; width: number; height: number };
  beats?: { label: string; condition: Condition }[]; exitLabel?: string;
  revisitDescription?: string;
  scenes?: SceneDefinition[]; firstScene?: string;
  foreground?: SceneDefinition['foreground']; variants?: SceneDefinition['variants'];
  camera?: SceneCamera;
  decorations?: SceneDecoration[];
}
export interface Entry { id: string; title: string; text: string; category?: 'life' | 'detail'; asset?: string; versions?: { condition: Condition; text: string }[] }
export type FeatureId = 'journal' | 'inventory' | 'objectHints' | 'chapterTrack' | 'lifeNotes' | 'collection' | 'revisit';
export interface GuideStep {
  id: string; chapterId: string; title: string; text: string;
  target?: string; control?: 'journal' | 'menu' | 'departure' | 'home';
  /** Focus restricts scene input while the expanded lesson is on screen. */
  focus?: boolean;
  chrome?: 'minimal' | 'book';
  condition?: Condition; complete: Condition;
}
export interface Recipe { id: string; title: string; subtitle: string; note?: string; ingredients: string[]; steps: string[]; asset: string; condition: Condition }
export interface CollectionEntry { id: string; title: string; asset: string; condition: Condition; description: string; detail: string; study?: Action }
export interface Item extends Entry { icon: string }
export interface QuestDefinition extends Entry { chapterId: string; autoStart?: boolean }
export interface Achievement extends Entry { condition: Condition; annotation?: string }
export interface Ending extends Entry { condition?: Condition }
export interface MinigameDefinition {
  id: string; chapterId: string; module: string; title: string; description: string;
  target: number; assistedItem?: string; reward: Action;
  condition?: Condition; unavailable?: string;
  itinerary?: { slips: { id: string; title: string; detail: string; slot: string }[]; slots: { id: string; label: string; time: string }[] };
  breakfast?: {
    fillings: string[];
    orders: { id: string; person: string; hint: string; filling: string; count: number }[];
    packaging?: { orderId: string; title: string; choices: { id: string; label: string }[]; expected: string; wrong: string }[];
    copy?: {
      intro: string; fillings: Record<string, string>; wrongFillings?: Record<string, string>;
      checkOrders: string; beforeSteam: string; early: string; late: string; steamed: string; helped: string; packed: string;
    };
  };
  service?: {
    pots: number;
    tickets: { id: string; person: string; cook: number; deadline: number; note: string; half?: boolean; noScallion?: boolean }[];
    copy?: {
      intro: string; tickets: Record<string, string>; missing: string;
      wrongHalf: string; wrongScallion: string; orderError: string; help: string; ready: string;
    };
  };
  packing?: { orders: { id: string; person: string; hint: string; vessel: 'bowl' | 'box'; sauce: 'rim' | 'cup'; utensils: 'beside' | 'outside' }[] };
}
export interface Asset { url: string; label: string; source: string; placeholder: boolean; region?: { x: number; y: number; width: number; height: number; canvasWidth: number; canvasHeight: number }; alphaCutoff?: number; inscription?: { lines: string[]; color?: string } }
export interface ContentPack {
  id: string; version: number; firstChapter: string;
  chapters: Chapter[]; dialogues: Dialogue[]; minigames: MinigameDefinition[];
  recipes?: Recipe[]; collection?: CollectionEntry[];
  progression?: { unlocks: Partial<Record<FeatureId, Condition>>; guides: GuideStep[] };
  clues: Entry[]; items: Item[]; metrics: Entry[]; quests: QuestDefinition[]; achievements: Achievement[];
  endings: Ending[]; assets: Record<string, Asset>;
}
export interface GameState {
  schemaVersion: 3; contentId: string; contentVersion: number;
  phase: 'title' | 'playing' | 'ending'; chapterId: string;
  visited: string[]; flags: string[]; clues: string[]; inventory: Record<string, number>;
  metrics: Record<string, number>; quests: Record<string, QuestStatus>;
  rewards: string[]; decisions: Record<string, string>; achievements: string[];
  dialogue: { id: string; nodeId: string } | null;
  sceneId: string; seenScenes: string[];
  journey: { chapterId: string; sceneId: string };
}
export type Command =
  | { type: 'dev-jump'; chapterId: string; sceneId?: string }
  | { type: 'dev-dialogue'; dialogueId: string; nodeId: string }
  | { type: 'start' } | { type: 'travel' }
  | { type: 'move'; sceneId: string }
  | { type: 'revisit'; chapterId: string } | { type: 'resume-journey' }
  | { type: 'study-collection'; entryId: string }
  | { type: 'inspect'; hotspotId: string }
  | { type: 'interact'; hotspotId: string; actionId: string }
  | { type: 'talk'; hotspotId: string }
  | { type: 'choose'; choiceId: string }
  | { type: 'close-dialogue' }
  | { type: 'finish-minigame'; gameId: string; result: MinigameResult };
export type MinigameResult = { status: 'completed'; score: number; assisted: boolean } | { status: 'cancelled' };
export interface Transition { state: GameState; changed: boolean; message: string }
