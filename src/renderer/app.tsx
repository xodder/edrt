import { CssBaseline, ThemeProvider, Button } from '@mui/material';
import React from 'react';
import Screens from './screens';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Screens />
    </ThemeProvider>
  );
}

export default App;

