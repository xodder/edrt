import { contextBridge, ipcRenderer } from 'electron';

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
  new: () => Promise<Item>;
  update: (itemId: string, updates: UpdatableItem) => Promise<Item>;
  getContent: (itemId: string) => Promise<string>;
  remove: (itemId: string) => Promise<void>;
}

const itemMethods: keyof ItemApi[] = ['getAll', 'new', 'update', 'getContent', 'remove'];

const windowApi: WindowApi = {
  item: itemMethods.reduce((acc, method) => {
    return {
      ...acc,
      [method]: (...args: unknown[]) => ipcRenderer.invoke('item', method, ...args),
    };
  }, {}),
};

contextBridge.exposeInMainWorld('api', windowApi);

