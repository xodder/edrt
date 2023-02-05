import { Stack, StackProps } from '@mui/material';
import React from 'react';

export type FlexItemProps<C extends React.ElementType> = Partial<{
  crossAxisAlignment: string;
  mainAxisAlignment: string;
}> &
  Omit<
    StackProps<C, { component?: C }>,
    'display' | 'justifyContent' | 'alignItems'
  >;

function FlexItem<C extends React.ElementType>(
  props: FlexItemProps<C>,
  ref: React.Ref<unknown>
) {
  const { crossAxisAlignment, mainAxisAlignment, ...otherProps } = props;

  return (
    <Stack
      ref={ref}
      {...otherProps}
      justifyContent={mainAxisAlignment}
      alignItems={crossAxisAlignment}
    />
  );
}

export default React.forwardRef(FlexItem);
