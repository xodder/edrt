import { contextBridge, ipcRenderer } from 'electron';
import { Item, UpdatableItem } from '~/shared/types';

declare global {
  interface Window {
    api: WindowApi;
  }
}

interface WindowApi {
  item: ItemApi;
}

interface ItemApi {
  getAll: () => Promise<Item[]>;
  updateAll: (items: Item[]) => Promise<void>;
  new: () => Promise<Item>;
  update: (itemId: string, updates: UpdatableItem) => Promise<Item>;
  getContent: (itemId: string) => Promise<string>;
  remove: (itemId: string) => Promise<void>;
}

const itemMethods: (keyof ItemApi)[] = [
  'getAll' as const,
  'updateAll' as const,
  'new' as const,
  'update' as const,
  'getContent' as const,
  'remove' as const,
];

const windowApi: WindowApi = {
  item: itemMethods.reduce<any>((acc, method) => {
    return {
      ...acc,
      [method]: (...args: unknown[]) =>
        ipcRenderer.invoke('item', method, ...args),
    };
  }, {}),
};

contextBridge.exposeInMainWorld('api', windowApi);
