import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import History from './components/History';
import Profile from './components/Profile';
import LegalDashboard from "./components/LegalDashboard";



import './App.css';

// Create a modern theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E5BFF',
      light: '#5677FF',
      dark: '#1A3FB5',
    },
    secondary: {
      main: '#00D4AA',
      light: '#33DDBA',
      dark: '#00947A',
    },
    background: {
      default: '#F8F9FC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E384D',
      secondary: '#8798AD',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#2E384D',
    },
    h5: {
      fontWeight: 600,
      color: '#2E384D',
    },
    h6: {
      fontWeight: 600,
      color: '#2E384D',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: '0 2px 6px rgba(46, 91, 255, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(46, 91, 255, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E0E6F5',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/dashboard" element={<LegalDashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;