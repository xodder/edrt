import { createTheme } from '@mui/material';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';

const theme = createTheme({
  palette: {
    // mode: 'dark',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body': {
          margin: 0,
        },
        'html, body, #root': {
          overflow: 'hidden',
          height: '100%',
        },
        '#root': {
          overflow: 'hidden',
        },
      },
    },
  },
});

export default theme;
