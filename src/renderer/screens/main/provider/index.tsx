import React from 'react';
import { makeXeate } from '~/renderer/utils/xeate';
import genStr from '~/renderer/utils/generate-random-str';

type MainScreenProviderProps = React.PropsWithChildren<unknown>;

type MainScreenXeateValues = {
  activeItemId: string;
  items: Item[];
};

const [XeateProvider, useXeate] = makeXeate<MainScreenXeateValues>();

function MainScreenProvider({ children }: MainScreenProviderProps) {
  const initialValues: MainScreenXeateValues = (function () {
    const item = newItem(0);

    return {
      activeItemId: item.id,
      items: [item], //load items from db
    };
  })();

  return (
    <XeateProvider initialValues={initialValues}>{children}</XeateProvider>
  );
}

export function useAddNewItem() {
  const xeate = useXeate();
  const autoSelectNewItem = true;

  return () => {
    const items = xeate.current.items;
    const item = (function () {
      const lastIndex = items
        .filter((item) => item.name.startsWith('Untitled'))
        .reduce<number>((lastIndex, item) => {
          const index = Number(item.name.replace(/Untitled\s?/, '').trim());
          return !isNaN(index) && index > lastIndex ? index : lastIndex;
        }, 1);

      return newItem(lastIndex);
    })(); 
    
    xeate.setMulti({
      activeItemId: autoSelectNewItem ? item.id : xeate.current.activeItemId,
      items: [...items, item], 
    });
  };
}

export function useUpdateItem() {
  const xeate = useXeate();

  return (itemId: string, updates: Partial<Item>) => {
    const index = xeate.current.items.findIndex(item => item.id === itemId);
    xeate.set(`items.${index}`, (item) => ({ ...item, ...updates }));
  };
}

function newItem(index: number) {
  return {
    id: genStr(5),
    name: `Untitled ${index + 1}`,
    emoji: '', // randomEmoji(),
    type: '',
    content: '',
  };
}

export const useMainScreenXeate = useXeate;

export default MainScreenProvider;
