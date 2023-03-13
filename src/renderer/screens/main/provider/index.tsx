import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import { Item } from '~/shared/types';
import { makeXeate } from '~/renderer/utils/xeate';

type MainScreenProviderProps = React.PropsWithChildren<unknown>;

type MainScreenXeateValues = {
  activeItemId: string;
  items: Item[];
  editorState: EditorState;
};

type EditorState = {
  lineCount: number;
  position: monaco.IPosition;
};

const [XeateProvider, useXeate] = makeXeate<MainScreenXeateValues>();

function MainScreenProvider({ children }: MainScreenProviderProps) {
  const initialValues: MainScreenXeateValues = {
    activeItemId: '',
    items: [], // window.api.item.getAll(), //load items from db
    editorState: {
      lineCount: 0,
      position: { column: 0, lineNumber: 0 },
    },
  };

  return (
    <XeateProvider initialValues={initialValues}>
      {children}
      <UpdateXeate />
    </XeateProvider>
  );
}

function UpdateXeate(): JSX.Element {
  const xeate = useXeate();
  const items = xeate.get('items') as typeof xeate.current.items;
  const itemCount = items.length;

  React.useEffect(() => {
    async function init() {
      let items = await window.api.item.getAll();

      // add new item
      if (!items.length) {
        items = [await window.api.item.new()];
      }

      xeate.setMulti({
        activeItemId: items[0].id,
        items: items,
      });
    }

    if (itemCount === 0) void init();
  }, [itemCount]);

  return null;
}

export function useActiveItem() {
  const xeate = useXeate();
  const items = xeate.get('items') as typeof xeate.current.items;
  const activeItemId = xeate.get(
    'activeItemId'
  ) as typeof xeate.current.activeItemId;

  if (!activeItemId) {
    return undefined;
  }

  return items.find((item) => item.id === activeItemId);
}

export function useAddNewItem() {
  const xeate = useXeate();
  const autoSelectNewItem = true;

  return async () => {
    const item = await window.api.item.new();

    xeate.setMulti({
      activeItemId: autoSelectNewItem ? item.id : xeate.current.activeItemId,
      items: await window.api.item.getAll(),
    });
  };
}

export function useUpdateItem() {
  const xeate = useXeate();

  return async (
    itemId: string,
    updates: Partial<Item>,
    refreshState = true
  ) => {
    await window.api.item.update(itemId, updates);

    if (refreshState) {
      xeate.set('items', await window.api.item.getAll());
    }
  };
}

export function useRemoveItem() {
  const xeate = useXeate();

  return async (itemId: string) => {
    await window.api.item.remove(itemId);

    xeate.setMulti({
      activeItemId: (value: string) => {
        if (value !== itemId) return value;

        const items = xeate.current.items;
        const index = items.findIndex((x) => x.id === itemId);
        const inc = index < items.length - 1 ? 1 : -1;
        const nextIndex = Math.min(index + inc, items.length - 1);

        return items[nextIndex]?.id || '';
      },
      items: await window.api.item.getAll(),
    });
  };
}

export function useMoveItemInState() {
  const xeate = useXeate();

  return (itemId: string, toIndex: number) => {
    const items = xeate.current.items;
    const fromIndex = items.findIndex((x) => x.id === itemId);

    let updated = [...items];

    updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, items[fromIndex]);
    updated = updated.map((item, index) => ({ ...item, index }));

    xeate.set('items', updated);
  };
}

export function useEditorState() {
  const xeate = useXeate();

  return xeate.get('editorState') as EditorState;
}

export const useMainScreenXeate = useXeate;

export default MainScreenProvider;
