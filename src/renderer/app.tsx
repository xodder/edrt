import { CssBaseline, ThemeProvider, Button } from '@mui/material';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Screens from './screens';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <DndProvider backend={HTML5Backend}>
        <Screens />
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
