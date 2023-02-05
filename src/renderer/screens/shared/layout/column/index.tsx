import React from 'react';
import FlexItem, { FlexItemProps } from '../flex-item';

export type ColumnProps<C extends React.ElementType> = Omit<
  FlexItemProps<C>,
  'direction'
>;

function Column<C extends React.ElementType>(
  props: ColumnProps<C>,
  ref: React.Ref<unknown>
) {
  return <FlexItem ref={ref} {...props} direction="column" />;
}

export default React.forwardRef(Column);
