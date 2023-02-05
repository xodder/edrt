import { Box, BoxProps, useTheme } from '@mui/material';

type Spacing = BoxProps['width'] | BoxProps['height'];

export type SpacerProps = Partial<{
  sx: Spacing;
  sy: Spacing;
}>;

function Spacer({ sx, sy }: SpacerProps) {
  const theme = useTheme();

  function unwrap(prop: Spacing): Spacing {
    if (!prop) {
      return undefined;
    } else if (typeof prop === 'number') {
      return theme.spacing(prop);
    } else if (Array.isArray(prop)) {
      return prop.map((x) => unwrap(x ?? '') as never);
    } else if (typeof prop === 'object') {
      const keys = Object.keys(prop);
      return keys.reduce(
        (res, key) => ({
          ...res,
          [key]: unwrap(prop[key] ?? ''),
        }),
        {}
      );
    } else {
      return prop;
    }
  }

  return <Box width={unwrap(sx)} height={unwrap(sy)} flexShrink={0} />;
}

export default Spacer;
