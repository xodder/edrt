import { ipcMain, IpcMainInvokeEvent } from 'electron';
import ItemManager from './manager';

class ItemManagerBridge {
  static init() {
    ipcMain.handle('item', this.handleRequest);
  }

  private static handleRequest(_: IpcMainInvokeEvent, method: string, ...args: unknown[]): unknown {
    const manager = ItemManager.getInstance();
   
    switch (method) {
      case 'getAll':
        return manager.getAll();
      case 'updateAll':
        return manager.updateAll.apply(null, args);
      case 'new':
        return manager.new();
      case 'update':
        return manager.update.apply(null, args);
      case 'getContent':
        return manager.getContent.apply(null, args);
      case 'remove':
        return manager.remove.apply(null, args);
      default:
        throw new Error(`unknown method '${method}'`);
    }
  }
}

export default ItemManagerBridge;

