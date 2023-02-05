import { Box, BoxProps } from '@mui/material';
import React from 'react';

type ScreenProps = BoxProps;

function Screen(props: ScreenProps, ref: React.Ref<unknown>) {
  return (
    <Box
      {...props}
      ref={ref}
      position="absolute"
      width={1}
      height={1}
      overflow="hidden auto"
    />
  );
}

export default React.forwardRef(Screen);
