import { Box, BoxProps } from '@mui/material';

function PumpedDivider(props: BoxProps) {
  return (
    <Box
      height={3}
      width={1}
      borderRadius="30% 40%"
      bgcolor="grey.200"
      {...props}
    />
  );
}

export default PumpedDivider;
