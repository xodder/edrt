import { Box, BoxProps } from '@mui/material';

type DividerProps = BoxProps & {
  weight?: number;
  type?: string;
  vertical?: boolean;
};

function Divider({
  weight = 1,
  type = 'solid',
  color = 'default.200',
  vertical,
  ...props
}: DividerProps) {
  return (
    <Box
      height={!vertical ? '1px' : undefined}
      width={vertical ? '1px' : undefined}
      flexShrink={0}
      {...props}
      borderTop={!vertical ? `${weight}px ${type}` : undefined}
      borderLeft={vertical ? `${weight}px ${type}` : undefined}
      borderColor={color}
      bgcolor={color}
    />
  );
}

export default Divider;
