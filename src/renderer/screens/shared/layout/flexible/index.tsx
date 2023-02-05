import { Box, BoxProps } from '@mui/material';

function Flexible({ flex = 1, ...props }: BoxProps) {
  return <Box {...props} flex={flex} />;
}

export default Flexible;
