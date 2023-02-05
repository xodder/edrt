import React from 'react';
import FlexItem, { FlexItemProps } from '../flex-item';

export type CenterProps<C extends React.ElementType> = Omit<
  FlexItemProps<C>,
  'crossAxisAlignment' | 'mainAxisAlignment'
>;

function Center<C extends React.ElementType>(
  props: CenterProps<C>,
  ref: React.Ref<unknown>
) {
  return (
    <FlexItem
      ref={ref}
      {...props}
      crossAxisAlignment="center"
      mainAxisAlignment="center"
    />
  );
}

export default React.forwardRef(Center);
