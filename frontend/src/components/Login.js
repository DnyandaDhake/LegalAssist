import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Fade,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  Gavel,
  Shield
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

  const API = process.env.REACT_APP_API_URL;
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!isValidEmail(formData.email)) {
    setError('Please enter a valid email address');
    return;
  }

  setLoading(true);

    

    try {
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/home');
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-login-container">
      {/* Animated Background */}
      <div className="bg-animation">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="float-element element-1">⚖️</div>
        <div className="float-element element-2">📄</div>
        <div className="float-element element-3">🔍</div>
        <div className="float-element element-4">⚡</div>
        <div className="float-element element-5">🛡️</div>
      </div>

      <Container component="main" maxWidth="sm">
        <Fade in={true} timeout={1000}>
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Main Card */}
            <Paper elevation={24} className="premium-glass-card">
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
                <div className="logo-glow">
                  <Gavel sx={{ fontSize: 64, color: '#00D4AA' }} />
                  <Shield sx={{ fontSize: 48, color: '#2E5BFF', position: 'absolute', top: 8, right: 60 }} />
                </div>
                <Typography variant="h2" component="h1" className="premium-gradient-text" gutterBottom>
                  LegalAssist
                  
                </Typography>
                <Typography variant="h6" component="h2" className="premium-subtitle">
                  AI-Powered Legal Intelligence Platform
                </Typography>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} className="premium-alert">
                  {error}
                </Alert>
              )}
              
              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  className="premium-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#2E5BFF' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00D4AA',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2E5BFF',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  className="premium-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#2E5BFF' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 'auto' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#00D4AA',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2E5BFF',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    }
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  className="premium-button"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                  sx={{
                    mt: 4,
                    mb: 3,
                    py: 1.8,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, #2E5BFF 0%, #00D4AA 100%)',
                    boxShadow: '0 8px 32px rgba(46, 91, 255, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1A3FB5 0%, #00947A 100%)',
                      boxShadow: '0 12px 40px rgba(46, 91, 255, 0.6)',
                      transform: 'translateY(-2px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    }
                  }}
                >
                  {loading ? 'Signing In...' : 'Access Legal Intelligence'}
                </Button>
                <Box textAlign="center">
                  <Link 
                    href="/register" 
                    variant="body2"
                    className="premium-link"
                  >
                    New to LegalAssist? Create your account
                  </Link>
                </Box>
              </Box>

              {/* Features Grid */}
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                    🔍 Smart Analysis
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                    ⚡ Instant Results
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                    🛡️ Risk Detection
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                    📄 Summarization
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </div>
  );
};

export default Login;