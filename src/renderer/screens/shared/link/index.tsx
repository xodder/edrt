import type { LinkProps as MuiLinkProps } from '@mui/material';
import { Link as MuiLink, styled } from '@mui/material';
import { MUIStyledCommonProps, Theme } from '@mui/system';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import React from 'react';

type StyledLinkProps = {
  mui: true;
} & Omit<MuiLinkProps, 'href'>;

type UnStyledLinkProps = {
  mui?: false;
} & Omit<AnchorProps, 'href'>;

type AnchorProps = MUIStyledCommonProps<Theme> &
  React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;

type ComponentProps = StyledLinkProps | UnStyledLinkProps;

export type LinkProps = NextLinkProps & ComponentProps;

// Add support for the sx prop for consistency.
const Anchor = styled('a')({});

const Link = React.forwardRef(function LinkInner(props: LinkProps, ref: any) {
  const nextLinkProps = extractNextLinkProps(props);
  const { mui, ...componentProps } = extractComponentProps(props);

  const Component = !mui ? Anchor : MuiLink;

  return (
    <NextLink {...nextLinkProps} passHref>
      <Component ref={ref} {...componentProps} />
    </NextLink>
  );
});

const __nextLinkProps__ = [
  'as',
  'href',
  'replace',
  'scroll',
  'shallow',
  'passHref',
  'prefetch',
  'locale',
] as const;

const extractNextLinkProps = (props: LinkProps): NextLinkProps =>
  pick(props, __nextLinkProps__);

const extractComponentProps = (props: LinkProps) =>
  omit(props, __nextLinkProps__) as any;

export default Link;
