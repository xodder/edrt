import { Box, BoxProps, Fade } from '@mui/material';
import React from 'react';

type LoadableContentProps = BoxProps & {
  state: {
    empty: boolean;
    loading: boolean;
    error: boolean;
  };
  debug?: boolean;
  LoadedContent: React.ComponentType<any>;
  LoadedContentProps?: Record<string, unknown>;
  LoadingContent: React.ComponentType<any>;
  LoadingContentProps?: Record<string, unknown>;
  EmptyContent?: React.ComponentType<any>;
  EmptyContentProps?: Record<string, unknown>;
  ErrorContent?: React.ComponentType<any>;
  ErrorContentProps?: Record<string, unknown>;
};

function LoadableContent({
  state,
  debug,
  LoadedContent,
  LoadedContentProps,
  LoadingContent,
  LoadingContentProps,
  EmptyContent,
  EmptyContentProps,
  ErrorContent,
  ErrorContentProps,
  ...props
}: LoadableContentProps) {
  return (
    <Box position="relative" {...props}>
      <Fade in={!state.empty} timeout={800} mountOnEnter unmountOnExit>
        <Box width={1} height={1}>
          <ConditionalRenderer render={!state.empty}>
            <LoadedContent {...LoadedContentProps} />
          </ConditionalRenderer>
        </Box>
      </Fade>
      {debug && (
        <Box
          position={state.loading ? 'relative' : 'absolute'}
          top={0}
          left={0}
          width={1}
          height={1}
          style={{ opacity: 0.8 }}
        >
          <LoadingContent {...LoadingContentProps} />
        </Box>
      )}
      <Fade in={state.loading && !debug} timeout={600} unmountOnExit>
        <Box
          position={state.loading && state.empty ? 'relative' : 'absolute'}
          top={0}
          left={0}
          width={1}
          height={1}
        >
          <ConditionalRenderer render={state.loading}>
            <LoadingContent {...LoadingContentProps} />
          </ConditionalRenderer>
        </Box>
      </Fade>
      {EmptyContent && (
        <Fade
          in={state.empty && !state.loading && !state.error}
          timeout={600}
          unmountOnExit
        >
          <Box
            position={state.empty || state.loading ? 'relative' : 'absolute'}
            top={0}
            left={0}
            width={1}
            height={1}
          >
            <ConditionalRenderer render={state.empty || state.loading}>
              <EmptyContent {...EmptyContentProps} />
            </ConditionalRenderer>
          </Box>
        </Fade>
      )}
      {ErrorContent && (
        <Fade in={state.empty && state.error} timeout={600} unmountOnExit>
          <Box
            position={state.error ? 'relative' : 'absolute'}
            top={0}
            left={0}
            width={1}
            height={1}
          >
            <ConditionalRenderer render={state.error}>
              <ErrorContent {...ErrorContentProps} />
            </ConditionalRenderer>
          </Box>
        </Fade>
      )}
    </Box>
  );
}

function ConditionalRenderer({ render, children }: any) {
  if (!render) {
    return null;
  }
  return children;
}

export default LoadableContent;
