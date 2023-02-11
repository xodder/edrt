import _omit from 'lodash/omit';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import Store from 'electron-store';
import genStr from '~/shared/utils/generate-random-str';
import isNonNull from '~/shared/utils/is-non-null';
import { ModelOperations } from '@vscode/vscode-languagedetection';

const modelRootPath = path.resolve(
  'node_modules',
  '@vscode',
  'vscode-languagedetection',
  'model'
);

const modelOperations = new ModelOperations({
  modelJsonLoaderFunc: async () => {
    return fs.promises
      .readFile(path.resolve(modelRootPath, 'model.json'))
      .then((data) => JSON.parse(data.toString()));
  },
  weightsLoaderFunc: async () => {
    return fs.promises
      .readFile(path.resolve(modelRootPath, 'group1-shard1of1.bin'))
      .then((data) => data.buffer);
  },
});

const store = new Store();

class ItemManager {
  private static instance: ItemManager | null;

  static getInstance() {
    if (!ItemManager.instance) {
      ItemManager.instance = new ItemManager();
    }

    return ItemManager.instance;
  }

  root: string;

  constructor() {
    this.root = app.getPath('userData');
  }

  getAll() {
    return store.get('items', []);
  }

  updateAll(items: Item[]) {
    store.set('items', items || []);
  }

  async new() {
    const items = this.getAll();
    const index = items
      .filter((item) => item.name.startsWith('Untitled'))
      .reduce<number>((lastIndex, item) => {
        const index = Number(item.name.replace(/Untitled\s?/, '').trim());
        return !isNaN(index) && index > lastIndex ? index : lastIndex;
      }, 0);

    const id = genStr(5);
    const item = {
      id,
      name: `Untitled ${index + 1}`,
      language: 'text/plain',
      filePath: path.resolve(this.root, id),
      index,
    };

    // add record to store
    store.set('items', [...items, item]);

    // create physical file
    await fs.promises.writeFile(item.filePath, '');

    return item;
  }

  async update(itemId: string, updates: UpdatableItem) {
    const items = this.getAll();
    const index = items.findIndex((x) => x.id === itemId);

    if (index === -1) {
      return Promise.resolve(undefined);
    }

    const item = items[index];

    // this might be prevented
    store.set(`items.${index}`, { ...item, ..._omit(updates, 'content') });

    // content
    if (isNonNull(updates.content)) {
      const result = await modelOperations.runModel(updates.content);
      console.log(result);
      await fs.promises.writeFile(item.filePath, updates.content);
    }

    return store.get(`items.${index}`);
  }

  async getContent(itemId: string) {
    const item = this.getAll().find((x) => x.id === itemId);

    if (!item) {
      throw new Error(`item does not exist`);
    }

    return fs.promises
      .readFile(item.filePath)
      .then((buffer) => buffer.toString());
  }

  async remove(itemId: string) {
    const items = this.getAll();
    const index = items.findIndex((x) => x.id === itemId);

    if (index === -1) {
      return Promise.resolve(undefined);
    }

    const item = items[index];

    // remove from store
    store.set(
      'items',
      (() => {
        const updated = [...items];
        updated.splice(index, 1);
        return updated;
      })()
    );

    // delete actual file
    try {
      await fs.promises.unlink(item.filePath);
    } catch (e) {}
  }
}

export default ItemManager;
