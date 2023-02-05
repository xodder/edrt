import { Box, BoxProps } from '@mui/material';
import { Row } from '../layout';

type DottedDividerProps = BoxProps & {
  dotSize?: number;
  dotCount?: number;
  dotColor?: string;
};

function DottedDivider({
  dotSize = 3,
  dotCount = 36,
  dotColor,
  ...props
}: DottedDividerProps) {
  return (
    <Row my={4} {...props} mainAxisAlignment="space-between">
      {Array.from({ length: dotCount }, (_, i) => (
        <Box
          key={i}
          width={dotSize}
          height={dotSize}
          bgcolor={dotColor || 'rgb(212, 220, 227)'}
          borderRadius="50%"
        />
      ))}
    </Row>
  );
}

export default DottedDivider;
