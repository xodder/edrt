import {
  Typography,
  Button,
  BoxProps,
  IconProps,
  ButtonProps,
  TypographyProps,
} from '@mui/material';
import { Center, Spacer } from '../layout';
import React from 'react';

type InfoBoxProps<C extends React.ElementType> = BoxProps &
  Partial<{
    icon: any;
    Icon: any;
    IconProps: Partial<Omit<IconProps, 'name'>>;
    title: string;
    titleProps: Partial<TypographyProps>;
    hint: string;
    hintProps: Partial<TypographyProps>;
    buttonLabel: string;
    buttonProps: Partial<
      ButtonProps<C, { component?: C }> & React.ComponentProps<C>
    >;
    delayed?: boolean;
  }>;

function InfoBox<C extends React.ElementType>({
  icon,
  Icon,
  IconProps = {},
  title,
  titleProps = {},
  hint,
  hintProps = {},
  buttonLabel,
  buttonProps = {},
  ...props
}: InfoBoxProps<C>) {
  return (
    <Center
      direction="column"
      height="100%"
      p={3}
      maxWidth={540}
      mx="auto"
      {...props}
    >
      {icon}
      {Icon && (
        <>
          <Icon
            color="disabled"
            {...IconProps}
            style={{
              fontSize: '5rem',
              ...IconProps.style,
            }}
          />
          <Spacer sy={1} />
        </>
      )}
      <Typography
        variant="h5"
        color="textSecondary"
        align="center"
        gutterBottom
        {...titleProps}
        sx={{ fontWeight: 600, ...titleProps.sx }}
      >
        {title}
      </Typography>
      {hint && (
        <Typography
          variant="body1"
          color="textSecondary"
          align="center"
          {...hintProps}
          sx={{ opacity: 0.4, ...hintProps.sx }}
        >
          {hint}
        </Typography>
      )}
      {buttonLabel && (
        <>
          <Spacer sy={!hint ? 2 : 3} />
          <Button color="primary" variant="contained" {...buttonProps}>
            {buttonLabel}
          </Button>
        </>
      )}
    </Center>
  );
}

export default InfoBox;
