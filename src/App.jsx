import React from 'react';
import { 
  Container, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  ThemeProvider,
  createTheme,
  IconButton,
  Tabs,
  Tab,
  useMediaQuery
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import PatientRegistration from './components/PatientRegistration';
import SQLQueryTool from './components/SQLQueryTool';
import { useState, useMemo } from 'react';

// Create a BroadcastChannel for cross-tab communication with fallback
let channel;
try {
  channel = new BroadcastChannel('patient-updates');
} catch (error) {
  console.warn('BroadcastChannel not supported in this browser. Cross-tab sync will be disabled.');
  channel = {
    postMessage: () => {},
    close: () => {}
  };
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0 for registration, 1 for SQL
  const isMobile = useMediaQuery('(max-width:600px)');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1d9bf0', // Twitter blue
          },
          background: {
            default: darkMode ? '#15202b' : '#f5f5f5', // Twitter dark blue background
            paper: darkMode ? '#192734' : '#ffffff',
          },
        },
        components: {
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  backgroundColor: darkMode ? '#253341' : '#ffffff',
                },
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 120,
                '&.Mui-selected': {
                  color: '#1d9bf0',
                },
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const handlePatientAdded = () => {
    try {
      channel.postMessage({ type: 'PATIENT_UPDATED' });
    } catch (error) {
      console.warn('Failed to broadcast patient update:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Patient Management System
            </Typography>
            <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            centered
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              backgroundColor: theme.palette.background.paper,
              '& .MuiTabs-indicator': {
                backgroundColor: '#1d9bf0',
              },
            }}
          >
            <Tab label="Patient Registration" />
            <Tab label="SQL Query Tool" />
          </Tabs>
        </AppBar>

        <Container sx={{ flex: 1, py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {activeTab === 0 ? (
              <PatientRegistration onPatientAdded={handlePatientAdded} />
            ) : (
              <SQLQueryTool />
            )}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
