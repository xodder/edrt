import stringToRGB from '~/renderer/utils/string-to-rgb';
import { colord } from 'colord';
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
import { Plus } from 'mdi-material-ui';
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';

loader.config({ monaco });

const APPBAR_HEIGHT = 48;

const files = [
  { name: 'Untitled 1', type: '', content: '' },
  { name: 'Untitled 2', type: '', content: '' },
  { name: 'Untitled 3', type: '', content: '' },
  { name: 'Untitled 4', type: '', content: '' },
];

function MainScreen() {
  useSetMonacoTheme();

  return (
    <Screen>
      <AppBar />
      <Row width={1} height={1}>
        <Column bgcolor="background.main" width={180} flexShrink={0}>
          <Row px={1} crossAxisAlignment="center" height={APPBAR_HEIGHT}>
            <Flexible />
            <IconButton color="primary">
              <Plus />
            </IconButton>
          </Row>
          <Divider
            weight={6}
            width={72}
            color="divider"
            borderRadius="0 8px 8px 0"
          />
          <Spacer sy={2} />
          <XList />
        </Column>
        <Column flex={1}>
          <Box height={APPBAR_HEIGHT} />
          {/* <Divider width={1} color="divider" /> */}
          <Editor
            defaultLanguage="text/plain"
            defaultValue="// some comment"
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
      sx={{ '-webkit-app-region': 'drag' }}
    />
  );
}

function XList() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
    <Column height={1}>
      {files.map((file, index) => (
        <XListItem
          key={index}
          label={file.name}
          selected={selectedIndex === index}
          onClick={() => setSelectedIndex(index)}
        />
      ))}
    </Column>
  );
}

type XListItemProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

function XListItem({ label, selected, onClick }: XListItemProps) {
  const c = useThemeColor();
  const theme = useTheme();
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
          bgcolor: theme.palette.primary.main,
        },
      }}
    >
      <Box
        width={20}
        height={20}
        borderRadius="50%"
        bgcolor={tint}
      />
      <Typography color="inherit">{label}</Typography>
    </Row>
  );
}

function useSetMonacoTheme() {
  const theme = useTheme();
  const c = useThemeColor();

  React.useEffect(() => {
    monaco.editor.defineTheme('dtheme', {
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
        'editor.selectionHighlightBackground': c('secondary.main', { a: 0.05 }),
        // 'scrollbarSlider.background': undefined,
        // 'scrollbarSlider.hoverBackground': undefined,
        // 'scrollbarSlider.activeBackground': undefined,
        // 'editorGutter.background': '',
        //
      },
    });
    
    monaco.editor.setTheme('dtheme');
  });
}

function useThemeColor() {
  const theme = useTheme();

  return (key: string, config: { a:number, d: number, l: number } = {}) => {
    const color = _get(theme.palette, key);

    if (!color) return undefined;

    let result = colord(color);

    if (config.a) result = result.alpha(config.a);
    if (config.d) result = result.darken(config.d);
    if (config.l) result = result.lighten(config.l);

    return result.toHex();
  }
}

export default MainScreen;
