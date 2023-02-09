import { colord } from 'colord';
import ScrollBox from '~/renderer/screens/shared/scroll-box';
import _get from 'lodash/get';
import {
  alpha,
  lighten,
  Box,
  Button,
  Typography,
  IconButton,
  useTheme,
} from '@mui/material';
import React from 'react';
import Screen from '~/renderer/screens/shared/screen';
import {
  Column,
  Row,
  Center,
  Spacer,
  Flexible,
} from '~/renderer/screens/shared/layout';
import Divider from '~/renderer/screens/shared/divider';
import { Plus, PlusCircle } from 'mdi-material-ui';
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';
import MainScreenProvider, { useMainScreenXeate, useAddNewItem } from './provider';

loader.config({ monaco });

const APPBAR_HEIGHT = 48;

function MainScreen() {
  useSetMonacoTheme();

  return (
    <MainScreenProvider>
      <Screen>
        <AppBar />
        <Row width={1} height={1}>
          <ItemListSection />
          <Column flex={1}>
            <AppBarDelegate flexShrink={0} />
            <Editor
              defaultLanguage="text/plain"
              defaultValue=""
              options={{
                glyphMargin: false,
                // fontFamily: 'Times-Roman',
                fontSize: 14,
                lineNumbersMinChars: 3,
                lineDecorationsWidth: 0,
                wordWrap: 'on',
                wrappingIndent: 'same',
                lineNumbers: true,
                codeLens: false,
                minimap: { enabled: false },
                // renderFinalNewline: true,
                // renderIndentGuides: true,
                renderLineHighlight: 'all',
              }}
            />
          </Column>
        </Row>
      </Screen>
    </MainScreenProvider>
  );
}

function AppBar() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width={1}
      height={APPBAR_HEIGHT}
      sx={{ WebkitAppRegion: 'drag' }}
    />
  );
}

function AppBarDelegate(props: BoxProps) {
  return (
    <Box
      {...props}
      height={APPBAR_HEIGHT}
      sx={{ WebkitAppRegion: 'drag', ...props.sx }}
    />
  );
}

function ItemListSection() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const xeate = useMainScreenXeate();
  const items = xeate.get('items') as typeof xeate.current.items;
  const activeItemId = xeate.get('activeItemId');

  return (
    <Column bgcolor="background.main" width={180} height={1} flexShrink={0}>
      <AppBarDelegate component={Row} px={1} crossAxisAlignment="center">
        <Flexible />
        <NewItemButton />
      </AppBarDelegate>
      <Divider
        weight={3}
        width={48}
        color="divider"
        borderRadius="0 8px 8px 0"
      />
      <ScrollBox
        shadows="vertical"
        height={1}
        barColor="action.active"
        fillHeight
      >
        <Column>
          {items.map((item, index) => (
            <XListItem
              key={item.id}
              item={item}
              selected={activeItemId === item.id}
              onClick={() => xeate.set('activeItemId', item.id)}
            />
          ))}
        </Column>
      </ScrollBox>
    </Column>
  );
}

function NewItemButton() {
  const addNewItem = useAddNewItem();

  return (
    <IconButton
      color="primary"
      edge="end"
      onClick={() => addNewItem()}
      sx={{ WebkitAppRegion: 'no-drag', cursor: 'default' }}
    >
      <Plus fontSize="small" />
    </IconButton>
  );
}

type XListItemProps = {
  label: string;
  item: (typeof files)[number];
  selected: boolean;
  onClick: () => void;
};

function XListItem({ label, item, selected, onClick }: XListItemProps) {
  const c = useThemeColor();
  const tint = selected ? c('primary.main') : c('text.secondary');

  return (
    <Row
      px={2}
      py={1.45}
      gap={2}
      position="relative"
      crossAxisAlignment="center"
      onClick={onClick}
      color={tint}
      sx={{
        cursor: 'pointer',
        '&:hover': {
          color: !selected ? 'text.primary' : undefined,
        },
        '&::after': {
          content: '""',
          opacity: selected ? 1 : 0,
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          width: 6,
          height: 4,
          bgcolor: c('primary.main'),
        },
      }}
    >
      {item.emoji ? (
        <Typography dangerouslySetInnerHTML={{ __html: item.emoji }} />
      ) : (
        <Box width={20} height={20} borderRadius="50%" bgcolor={tint} />
      )}
      {/* <Typography dangerouslySetInnerHTML={{ __html: item.emoji }} /> */}
      <Typography color="inherit">{item.name}</Typography>
    </Row>
  );
}

function useSetMonacoTheme() {
  const theme = useTheme();
  const c = useThemeColor();

  React.useEffect(() => {
    const id = 'xtheme'; //Math.round(Math.random() * 1000).toString();

    monaco.editor.defineTheme(id, {
      base: theme.palette.mode === 'dark' ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [
        {
          background: c('background.default'), // 'EDF9FA',
          // fontStyle: '',
          // foreground: '',
          // token: '',
        },
      ],
      colors: {
        'editor.foreground': c('text.primary'),
        'editor.background': c('background.default'),
        'editorCursor.foreground': c('secondary.main'),
        'editor.lineHighlightBackground': c('primary.main', { a: 0.05 }),
        'editor.lineHighlightBorder': c('primary.main', { a: 0.05 }),
        'editorLineNumber.foreground': c('text.disabled'),
        'editorLineNumber.activeForeground': c('text.primary'),
        'editor.selectionBackground': c('secondary.main', { a: 0.2 }),
        'editor.inactiveSelectionBackground': c('secondary.main', { a: 0.1 }),
        'editor.selectionHighlightBackground': c('secondary.main', {
          a: 0.05,
        }),
        // 'scrollbarSlider.background': undefined,
        // 'scrollbarSlider.hoverBackground': undefined,
        // 'scrollbarSlider.activeBackground': undefined,
        // 'editorGutter.background': '',
        //
      },
    });

    monaco.editor.setTheme(id);
  });
}

function useThemeColor() {
  const theme = useTheme();

  return (key: string, config: { a: number; d: number; l: number } = {}) => {
    const color = _get(theme.palette, key);

    if (!color) return undefined;

    let result = colord(color);

    if (config.a) result = result.alpha(config.a);
    if (config.d) result = result.darken(config.d);
    if (config.l) result = result.lighten(config.l);

    return result.toHex();
  };
}

export default MainScreen;
