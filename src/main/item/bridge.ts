import { ipcMain } from 'electron';
import ItemManager from './manager';

class ItemManagerBridge {
  static init() {
    ipcMain.handle('item', this.handleRequest);
  }

  private static handleRequest(event: IpcMainInvokeEvent, method: string, ...args: unknown[]): Promise<unknown> {
    const manager = ItemManager.getInstance();
   
    switch (method) {
      case 'getAll':
        return manager.getAll();
      case 'updateAll':
        return manager.updateAll(...args);
      case 'new':
        return manager.new();
      case 'update':
        return manager.update(...args);
      case 'getContent':
        return manager.getContent(...args);
      case 'remove':
        return manager.remove(...args);
      default:
        throw new Error(`unknown method '${method}'`);
    }
  }
}

export default ItemManagerBridge;

