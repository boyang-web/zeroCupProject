// Domain contracts contain no Vue, browser or renderer dependencies.
export type QuestStatus = 'active' | 'completed' | 'failed';
export type Condition =
  | { kind: 'flag'; id: string }
  | { kind: 'clue'; id: string }
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
export interface DialogueChoice extends Action { next?: string; decision?: string }
export interface DialogueNode { id: string; speaker: string; text: string; choices: DialogueChoice[]; portrait?: string; direction?: string }
export interface Dialogue { id: string; entry: string; entries?: { condition: Condition; nodeId: string }[]; nodes: DialogueNode[] }
export interface Exhibit { kind: 'book' | 'letter' | 'photo' | 'note'; kicker: string; title: string; lines: string[]; caption?: string }
export type Interaction =
  | { kind: 'inspect'; text: string; action?: Action; options?: Action[]; exhibit?: Exhibit; activityId?: string; versions?: { condition: Condition; text: string }[] }
  | { kind: 'dialogue'; dialogueId: string }
  | { kind: 'minigame'; gameId: string };
export interface Hotspot {
  id: string; label: string; x: number; y: number; icon: string;
  interaction: Interaction; condition?: Condition; completed?: Condition;
  sprite?: { asset: string; width: number; height: number; z?: number };
  variants?: { condition: Condition; x?: number; y?: number; asset?: string }[];
}
export interface SceneLink { sceneId: string; label: string; condition?: Condition; unavailable?: string }
export interface SceneDefinition {
  id: string; title: string; description: string; asset: string; hotspots: Hotspot[];
  links: SceneLink[]; position?: string; tint?: string;
}
export interface Chapter {
  id: string; number: number; title: string; subtitle: string; time: string;
  description: string; asset: string; position: string; tint: string;
  objective: string; questId: string; metricIds: string[]; hotspots: Hotspot[];
  next?: string; exit?: Condition; exitHint?: string;
  character?: { asset: string; x: number; y: number; width: number; height: number };
  beats?: { label: string; condition: Condition }[]; exitLabel?: string;
  scenes?: SceneDefinition[]; firstScene?: string;
}
export interface Entry { id: string; title: string; text: string }
export interface Item extends Entry { icon: string }
export interface QuestDefinition extends Entry { chapterId: string; autoStart?: boolean }
export interface Achievement extends Entry { condition: Condition; annotation?: string }
export interface Ending extends Entry { condition?: Condition }
export interface MinigameDefinition {
  id: string; chapterId: string; module: string; title: string; description: string;
  target: number; assistedItem?: string; reward: Action;
  condition?: Condition; unavailable?: string;
  itinerary?: { slips: { id: string; title: string; detail: string; slot: string }[]; slots: { id: string; label: string; time: string }[] };
  breakfast?: { fillings: string[]; orders: { id: string; person: string; hint: string; filling: string; count: number }[] };
  service?: { pots: number; tickets: { id: string; person: string; cook: number; deadline: number; note: string; half?: boolean; noScallion?: boolean }[] };
}
export interface Asset { url: string; label: string; source: string; placeholder: boolean; region?: { x: number; y: number; width: number; height: number; canvasWidth: number; canvasHeight: number }; alphaCutoff?: number }
export interface ContentPack {
  id: string; version: number; firstChapter: string;
  chapters: Chapter[]; dialogues: Dialogue[]; minigames: MinigameDefinition[];
  clues: Entry[]; items: Item[]; metrics: Entry[]; quests: QuestDefinition[]; achievements: Achievement[];
  endings: Ending[]; assets: Record<string, Asset>;
}
export interface GameState {
  schemaVersion: 2; contentId: string; contentVersion: number;
  phase: 'title' | 'playing' | 'ending'; chapterId: string;
  visited: string[]; flags: string[]; clues: string[]; inventory: Record<string, number>;
  metrics: Record<string, number>; quests: Record<string, QuestStatus>;
  rewards: string[]; decisions: Record<string, string>; achievements: string[];
  dialogue: { id: string; nodeId: string } | null;
  sceneId: string; seenScenes: string[];
}
export type Command =
  | { type: 'start' } | { type: 'travel' }
  | { type: 'move'; sceneId: string }
  | { type: 'inspect'; hotspotId: string }
  | { type: 'interact'; hotspotId: string; actionId: string }
  | { type: 'talk'; hotspotId: string }
  | { type: 'choose'; choiceId: string }
  | { type: 'close-dialogue' }
  | { type: 'finish-minigame'; gameId: string; result: MinigameResult };
export type MinigameResult = { status: 'completed'; score: number; assisted: boolean } | { status: 'cancelled' };
export interface Transition { state: GameState; changed: boolean; message: string }
