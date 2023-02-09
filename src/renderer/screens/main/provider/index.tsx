import React from 'react';
import { makeXeate } from '~/renderer/utils/xeate';

type MainScreenProviderProps = React.PropsWithChildren<unknown>;

type MainScreenXeateValues = {
  activeItemId: string;
  items: Item[];
};

const [XeateProvider, useXeate] = makeXeate<MainScreenXeateValues>();

function MainScreenProvider({ children }: MainScreenProviderProps) {
  const initialValues: MainScreenXeateValues = {
    activeItemId: '-',
    items: [], //load items from db
  };

  return (
    <XeateProvider initialValues={initialValues}>{children}</XeateProvider>
  );
}

export default MainScreenProvider;
