type BattleParams = { opponent?: string }
type AwardParams = { coin?: number }

// Message queue item
export type Message = {
  user: string;
  content: string;
};

export type Task = {
  user: string;
  action: string;
  params?: BattleParams & AwardParams & { [key: string]: string | number };
  callback?: () => void
};

export type TaskMappingItem = {
  action: string,
  matches: { [key: string]: string[]}
  params: { [key: string]: string | number }
}
