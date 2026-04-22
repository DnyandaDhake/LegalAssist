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
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  Gavel,
  Shield,
  CheckCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();

  const steps = ['Personal Info', 'Security', 'Complete'];

  const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

const isValidContact = (contact) => {
  if (!contact) return true; // optional field
  const regex = /^[6-9]\d{9}$/;
  return regex.test(contact);
};



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
    if (!formData.username || !formData.email) {
    setError('Please fill in all required fields');
    return;
  }

  

      if (!isValidEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    if (!isValidContact(formData.contact)) {
    setError('Please enter a valid 10-digit mobile number');
    return;
  }

    if (activeStep === 1 && (!formData.password || !formData.confirmPassword)) {
      setError('Please fill in password fields');
      return;
    }
    if (activeStep === 1 && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (activeStep === 1 && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep === 2) {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/register', {
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
          setError(data.msg || 'Registration failed');
          setActiveStep(0);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setError('Network error. Please try again.');
        setActiveStep(0);
      } finally {
        setLoading(false);
      }
    } else {
      handleNext();
    }
  };

  // ... rest of the Register component remains the same as your original
  // Only the handleSubmit function needs to be updated

  return (
    <div className="premium-register-container">
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
        <div className="float-element element-6">🎯</div>
      </div>

      <Container component="main" maxWidth="md">
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
            <Paper elevation={24} className="premium-glass-card register-card">
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 4, position: 'relative' }}>
                <div className="logo-glow">
                  <Gavel sx={{ fontSize: 64, color: '#00D4AA' }} />
                  <Shield sx={{ fontSize: 48, color: '#2E5BFF', position: 'absolute', top: 8, right: 60 }} />
                </div>
                <Typography variant="h2" component="h1" className="premium-gradient-text" gutterBottom>
                  Join LegalAssist
                </Typography>
                <Typography variant="h6" component="h2" className="premium-subtitle">
                  Create your account and unlock legal intelligence
                </Typography>
              </Box>

              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }} className="premium-stepper">
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.8)' } }}>
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} className="premium-alert">
                  {error}
                </Alert>
              )}
              
              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                {activeStep === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      name="username"
                      autoComplete="username"
                      value={formData.username}
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
                      sx={inputStyles}
                    />
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      className="premium-input"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#2E5BFF' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                   <TextField
  fullWidth
  id="contact"
  label="Contact Number"
  name="contact"
  autoComplete="tel"
  value={formData.contact}
  onChange={handleChange}
  variant="outlined"
  className="premium-input"
  error={
    formData.contact.length > 0 &&
    !isValidContact(formData.contact)
  }
  helperText={
    formData.contact.length > 0 &&
    !isValidContact(formData.contact)
      ? 'Enter a valid 10-digit Indian mobile number'
      : ''
  }
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Phone sx={{ color: '#2E5BFF' }} />
      </InputAdornment>
    ),
  }}
  sx={inputStyles}
/>

                  </Box>
                )}
                {activeStep === 1 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="new-password"
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
                      sx={inputStyles}
                    />
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              sx={{ color: 'rgba(255,255,255,0.7)', minWidth: 'auto' }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                      sx={inputStyles}
                    />
                    
                    {/* Password Strength Indicator */}
                    <Box className="password-strength">
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        Password Strength:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {[1, 2, 3, 4].map((item) => (
                          <Box
                            key={item}
                            className={`strength-bar ${formData.password.length > item * 2 ? 'active' : ''}`}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}
                {activeStep === 2 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ fontSize: 80, color: '#00D4AA', mb: 3, filter: 'drop-shadow(0 0 20px rgba(0, 212, 170, 0.5))' }} />
                    <Typography variant="h4" className="premium-gradient-text" gutterBottom>
                      Welcome to LegalAssist
                      !
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                      Your account has been created successfully. Get ready to experience AI-powered legal analysis.
                    </Typography>
                    
                    {/* User Summary */}
                    <Paper className="user-summary" sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>Account Details</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, textAlign: 'left' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Username:</Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>{formData.username}</Typography>
                        
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Email:</Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>{formData.email}</Typography>
                        
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Contact:</Typography>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: '600' }}>{formData.contact || 'Not provided'}</Typography>
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    variant="outlined"
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: '#00D4AA',
                        backgroundColor: 'rgba(0, 212, 170, 0.1)',
                      }
                    }}
                  >
                    Back
                  </Button>
                  
                  <Button
                    type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                    onClick={activeStep === steps.length - 1 ? null : handleNext}
                    variant="contained"
                    className="premium-button"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{
                      px: 4,
                      py: 1.5,
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
                    {loading ? 'Creating Account...' : activeStep === steps.length - 1 ? 'Start Legal Analysis' : 'Continue'}
                  </Button>
                </Box>

                {activeStep === 0 && (
                  <Box textAlign="center" sx={{ mt: 3 }}>
                    <Link 
                      href="/login" 
                      variant="body2"
                      className="premium-link"
                    >
                      Already have an account? Sign In
                    </Link>
                  </Box>
                )}
              </Box>

              {/* Features Grid */}
              {activeStep !== 2 && (
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', mb: 2 }}>
                    Why join LegalAssist?
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      🚀 Instant Analysis
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      🛡️ Risk Detection
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                      📄 Report Generation
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </Fade>
      </Container>
    </div>
  );
};

const inputStyles = {
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
};

export default Register;