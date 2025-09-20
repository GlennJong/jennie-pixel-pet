export const mappingWording = {
  drink: '讓角色喝水',
  write: '讓角色寫字',
  sleep: '讓角色睡覺/起床',
  battle_currycat: '角色戰鬥：currycat',
  battle_jennie: '角色戰鬥：jennie',
  battle_beibei: '角色戰鬥：貝貝',
  battle_shangshang: '角色戰鬥：上上',
  action: '遊戲內指令',
  matches: '觸發條件',
  content: '忠誠點數名稱',
  user: '兌換人'
}

export const mappingHideKey = [
  'action',
  'params',
  'sleep'
]

export const battleSceneWording = {
  battle_default_opponent: "預設敵方角色",
  battle_currycat_opponent: "敵方角色：currycat",
  battle_bbb_opponent: "敵方角色：BBB",
  battle_touching_opponent: "敵方角色：touching",
  battle_jennie_opponent: "敵方角色：jennie",
  battle_beibei_opponent: "敵方角色：貝貝",
  battle_shangshang_opponent: "敵方角色：上上",
  battle_afk_self: "我方角色：AFK君",
  base: "基本設定",
  actions: "行動",
  reactions: "反應",
  common: "一般",
  results: "結果",
  priority: "優先度（越高越容易觸發）",
  face: "表情",
  dialogues: "對話集",
  dialog: "對話",
  frame: "frame(angry, normal, sad)",
  text: "對話文字",
  effect: "效果",
  type: "類型",
  target: "對象",
  value: "數值",
  attack: "攻擊",
  damage: "受傷",
  recover: "恢復",
  start: "戰鬥開始",
  finish: "戰鬥結束",
}
export const battleSceneHideKey = [
  'key',
  'preload',
  'animations',
  'animation'
]
export const petSceneHideKey = [
  'key',
  'preload',
  'animations',
  'animation',
  'has_direction',
  'pet_room',
  'is_move'
]

export const petSceneWording = {
  consume: '扣血',
  recover: '回血',
  interval: '發生時間(ms)',
  idleActions: '靜止時行動',
  activities: '功能性行動',
  idle: '靜止',
  stare: '偷看',
  walk: '走路',
  wink: '扎眼睛',
  drink: '讓角色喝水',
  write: '讓角色寫字',
  battle: '讓角色戰鬥',
  sleep: '讓角色睡覺（停止自動扣血）',
  awake: '讓角色起床（啟動自動扣血）',
  point: "恢復血量",
  base: "基本設定",
  sentences: "對話句子",
  priority: "優先度（越高越容易觸發）",
  face: "表情",
  dialogues: "對話集",
  dialog: "對話",
  frame: "frame",
  text: "對話文字",
  start: "戰鬥開始",
  finish: "戰鬥結束",
  buy: "買東西（自動觸發）",
  win: "戰鬥結束：勝利",
  lose: "戰鬥結束：敗北",
}

export const templates = {
  sentencs: {
    face: {
      key: 'pet_afk',
      frame: 'face_normal'
    },
    text: '對話文字'
  }
}
