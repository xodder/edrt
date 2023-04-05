/* eslint-disable prefer-spread */
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ItemManager from './manager';

class ItemManagerBridge {
  static init() {
    ipcMain.handle('item', ItemManagerBridge.handleRequest);
  }

  private static handleRequest(
    this: void,
    _: IpcMainInvokeEvent,
    method: string,
    ...args: unknown[]
  ): unknown {
    const manager = ItemManager.getInstance();

    switch (method) {
      case 'getAll':
        return manager.getAll();
      case 'updateAll':
        return manager.updateAll.apply(manager, args);
      case 'new':
        return manager.new();
      case 'update':
        return manager.update.apply(manager, args);
      case 'getContent':
        return manager.getContent.apply(manager, args);
      case 'remove':
        return manager.remove.apply(manager, args);
      default:
        throw new Error(`unknown method '${method}'`);
    }
  }
}

export default ItemManagerBridge;
