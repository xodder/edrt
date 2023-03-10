export type Item = {
  id: string;
  name: string;
  index: number;
  emoji?: string;
  state?: any;
  filePath?: string;
};

export type UpdatableItem = {
  content?: string;
  language?: string;
};
