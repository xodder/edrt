import React from 'react';
import FlexItem, { FlexItemProps } from '../flex-item';

export type RowProps<C extends React.ElementType> = Omit<
  FlexItemProps<C>,
  'direction'
>;

function Row<C extends React.ElementType>(
  props: RowProps<C>,
  ref: React.Ref<unknown>
) {
  return <FlexItem ref={ref} {...props} direction="row" />;
}

export default React.forwardRef(Row);
