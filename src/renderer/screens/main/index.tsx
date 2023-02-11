import { colord } from 'colord';
import ScrollBox from '~/renderer/screens/shared/scroll-box';
import _get from 'lodash/get';
import _debounce from 'lodash/debounce';
import {
  alpha,
  lighten,
  Box,
  Button,
  Typography,
  IconButton,
  InputBase,
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
import { Plus, PlusCircle, PlusBox, Close } from 'mdi-material-ui';
import { useDrag, useDrop } from 'react-dnd';
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';
import MainScreenProvider, {
  useMainScreenXeate,
  useAddNewItem,
  useUpdateItem,
  useRemoveItem,
  useActiveItem,
  useMoveItemInState,
} from './provider';

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
          <ItemContentSection />
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
        <Column height={1}>
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
  item: Item;
  selected: boolean;
  onClick: () => void;
};

function XListItem({ label, item, selected, onClick }: XListItemProps) {
  const ref = React.useRef<HTMLDivElement | undefined>();
  const [editMode, setEditMode] = React.useState(false);
  const [draftItemName, setDraftItemName] = React.useState(item.name);
  const { isDragging, isOver } = useItemDragAndDrop(ref, item, !editMode);

  const updateItem = useUpdateItem();
  const c = useThemeColor();
  const tint = editMode
    ? c('warning.main', { a: 0.75 })
    : selected
    ? 'primary.main'
    : 'text.secondary';

  function handleInputKeyDown(e: KeyboardEvent<unknown>) {
    if (e.key === 'Enter') {
      updateItemNameAndExitEditMode();
    } else if (e.key === 'Escape') {
      revertDraftItemNameAndExitEditMode();
    }
  }

  function revertDraftItemNameAndExitEditMode() {
    setDraftItemName(item.name);
    setEditMode(false);
  }

  function handleInputBlur(e: InputEvent<HTMLInputElement>) {
    // don't lose focus if input is empty
    if (draftItemName.trim().length === 0) {
      e.target.focus();
      return;
    }

    updateItemNameAndExitEditMode();
  }

  function updateItemNameAndExitEditMode() {
    const newName = draftItemName.trim();

    if (newName.length > 0) {
      if (item.name !== newName) {
        updateItem(item.id, { name: newName });
      }

      setEditMode(false);
    }
  }

  return (
    <Row
      ref={ref}
      px={2}
      py={1.45}
      gap={2}
      position="relative"
      crossAxisAlignment="center"
      onClick={onClick}
      color={tint}
      sx={{
        cursor: 'pointer',
        opacity: isDragging ? 0 : 1,
        '&:hover': {
          color: !selected ? 'text.primary' : undefined,
          '&::before': {
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          opacity: selected ? 1 : 0,
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: 'translateY(-50%)',
          width: 6,
          height: 4,
          bgcolor: tint,
        },
      }}
    >
      <Box
        position="relative"
        flexShrink={0}
        sx={{
          '&:hover': when(!editMode, {
            '.icon': {
              opacity: 0,
            },
            '.remove': {
              display: 'block',
              opacity: 1,
            },
          }),
        }}
      >
        <ItemIcon className="icon" item={item} tint={tint} />
        <ItemRemoveButton className="remove" item={item} />
      </Box>
      {!editMode && (
        <Typography
          color="inherit"
          sx={{ WebkitUserSelect: 'none' }}
          onDoubleClick={() => setEditMode(true)}
          title={item.name.length > 16 ? item.name : undefined}
          noWrap
        >
          {item.name}
        </Typography>
      )}
      {editMode && (
        <InputBase
          value={draftItemName}
          onChange={(e) => setDraftItemName(e.target.value)}
          onBlur={handleInputBlur}
          inputProps={{ style: { padding: 0, height: 'unset' } }}
          onKeyDown={handleInputKeyDown}
          sx={{ lineHeight: 1.5, caretColor: tint }}
          autoFocus
        />
      )}
    </Row>
  );
}

function useItemDragAndDrop(
  elRef: React.MutableRefObject<unknown>,
  item: Item,
  enabled: boolean
) {
  const xeate = useMainScreenXeate();
  const moveItemInState = useMoveItemInState();

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'item',
      canDrag: enabled,
      item: { id: item.id, index: item.index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (droppedItem, monitor) => {
        if (!monitor.didDrop()) {
          // go back to original position,
          // since the drop was done outside the container
          moveItemInState(droppedItem.id, droppedItem.index);
        }
      },
    }),
    [item, moveItemInState]
  );

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'item',
      hover: (draggedItem) => {
        if (draggedItem.id !== item.id) {
          moveItemInState(draggedItem.id, item.index);
        }
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
      drop: () => {
        // push updates to backend
        void window.api.item.updateAll(xeate.current.items);
      },
    }),
    [item, moveItemInState]
  );

  drag(drop(elRef));

  return { isDragging, isOver };
}

function when(condition: boolean, value: any) {
  return condition ? value : undefined;
}

type ItemIconProps = BoxProps & {
  item: Item;
  tint: string;
};

function ItemIcon({ item, tint, ...props }: ItemIconProps) {
  if (item.emoji) {
    return (
      <Box {...props}>
        <Typography dangerouslySetInnerHTML={{ __html: item.emoji }} />
      </Box>
    );
  }

  return (
    <Box
      {...props}
      width={20}
      height={20}
      borderRadius="50%"
      bgcolor={tint}
      flexShrink={0}
    />
  );
}

type ItemRemoveButtonProps = BoxProps & {
  item: Item;
};

function ItemRemoveButton({ item, ...props }: ItemRemoveButtonProps) {
  const removeItem = useRemoveItem();

  function handleClick(e: MouseEvent<unknown>) {
    e.stopPropagation();

    void removeItem(item.id);
  }

  return (
    <Box
      {...props}
      display="none"
      position="absolute"
      top="50%"
      left="50%"
      sx={{ transform: 'translate(-50%, -50%)', ...props.sx }}
    >
      <IconButton size="small" onClick={handleClick}>
        <Close sx={{ fontSize: '1.1rem' }} />
      </IconButton>
    </Box>
  );
}

function ItemContentSection() {
  const disposablesRef = React.useRef<{ dispose: () => void }[]>([]);
  const pendingContentRef = React.useRef<string>('');
  const editorRef = React.useRef<any>();
  const updateItem = useUpdateItem();

  const item = useActiveItem();

  // using itemRef because apparently editor-on-mount handler uses stale item
  // value, so introducing a reference version will allow us to always get the
  // current value of item.
  const itemRef = React.useRef<Item | undefined>(item);

  React.useEffect(() => {
    itemRef.current = item;
  }, [item]);

  // clear disposables
  React.useEffect(() => {
    return () => {
      disposablesRef.current.forEach((disposable) => disposable.dispose());
      disposablesRef.current = [];
    };
  }, []);

  React.useEffect(() => {
    async function init() {
      if (item?.id) {
        const hasContent = !!editorRef.current?.getValue();

        if (!hasContent) {
          const content = await window.api.item.getContent(item.id);

          if (editorRef.current) {
            editorRef.current.setValue(content);
          } else {
            pendingContentRef.current = content;
          }
        }

        editorRef.current?.restoreViewState(item.editorState || {});
        editorRef.current?.focus();
      }
    }

    void init();

    return () => {
      if (item?.id) {
        updateItem(item.id, {
          editorState: editorRef.current.saveViewState(),
        });
      }
    };
  }, [item?.id]);

  function handleEditorMount(editor: any) {
    editorRef.current = editor;

    disposablesRef.current.push(
      // autosave when cursor position changes
      editor.onDidChangeCursorPosition((data: any) => {
        if (!['model', 'restoreState'].includes(data.source)) {
          if (itemRef.current) {
            autoSave(itemRef.current.id);
          }
        }
      })
    );

    if (!!pendingContentRef.current) {
      editor.setValue(pendingContentRef.current);
      editor.restoreViewState(itemRef.current?.editorState || {});
      pendingContentRef.current = '';
    }

    editor.focus();
  }

  function handleEditorChange(value: string) {
    if (item) autoSave(item.id, value);
  }

  const autoSave = _debounce((itemId: string, value?: string) => {
    void updateItem(
      itemId,
      filtered({
        content: value,
        editorState: editorRef.current.saveViewState(),
      })
    );
  }, 1000);

  return (
    <Column flex={1}>
      <AppBarDelegate
        component={Row}
        crossAxisAlignment="center"
        px={1}
        divider={<Divider height={16} color="grey.200" vertical />}
        flexShrink={0}
      >
        <Row
          crossAxisAlignment="center"
          px={2}
          height={1}
          gap={0.5}
          sx={{
            position: 'relative',
            color: 'text.primary',
            '&::after': {
              content: "''",
              position: 'absolute',
              left: '50%',
              top: 0,
              height: 3,
              width: '100%',
              borderRadius: '0 0 4px 4px',
              transform: 'translateX(-50%)',
              bgcolor: 'text.secondary',
            },
            WebkitUserSelect: 'none',
          }}
        >
          <Typography variant="body2">Untitled 1</Typography>
        </Row>
        <IconButton
          size="small"
          sx={{ ml: 'auto', WebkitAppRegion: 'no-drag' }}
        >
          <PlusCircle fontSize="small" />
        </IconButton>
      </AppBarDelegate>
      <Editor
        defaultLanguage="text/plain"
        defaultValue=""
        onMount={handleEditorMount}
        onChange={handleEditorChange}
        path={item?.filePath || ''}
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
  );
}

function filtered<T extends Record<string, unknown>>(object: T) {
  return Object.keys(object).reduce<T>((acc, key) => {
    const value = object[key];

    if (value !== undefined && value !== null) {
      acc[key] = value;
    }

    return acc;
  }, {});
}

function useSetMonacoTheme() {
  const theme = useTheme();
  const themeMode = theme.palette.mode;
  const c = useThemeColor();

  React.useEffect(() => {
    const id = `theme-${themeMode}`; //Math.round(Math.random() * 1000).toString();

    monaco.editor.defineTheme(id, {
      base: themeMode === 'dark' ? 'vs-dark' : 'vs',
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

    setTimeout(() => monaco.editor.setTheme(id), 500);
  }, [themeMode]);
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
