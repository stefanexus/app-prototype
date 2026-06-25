import '@fontsource-variable/inter';
import '@fontsource-variable/dm-sans';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';

import { router } from './routes/router';
import { createAppTheme } from './theme';

const theme = createAppTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="dark">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{ style: { background: '#1B2138', border: '1px solid rgba(255,255,255,0.08)', color: '#F3F4F8' } }}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );
}
