export type Item = {
  id: string;
  name: string;
  index: number;
  emoji?: string;
  state?: any;
  language?: string;
  filePath?: string;
};

export type UpdatableItem = {
  content?: string;
  language?: string;
};
