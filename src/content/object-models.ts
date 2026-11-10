// 本工程程序化模型；材质与造型来源见 docs/art/物件3D交互.md。
export type ObjectModelKind = 'spool' | 'slip' | 'photo' | 'book' | 'letter' | 'calendar' | 'cup' | 'phone' | 'key' | 'bag';
export const objectModels: Record<string, ObjectModelKind> = {
  'home-thread': 'spool', 'home-grocery-slip': 'slip', 'family-photo': 'photo',
  'old-book': 'book', 'home-letter': 'letter', 'home-calendar': 'calendar',
  'home-tea': 'cup', 'my-phone': 'phone', 'baiwei-book': 'book',
  'small-key': 'key', 'insulated-bag': 'bag',
};
