import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
  Snackbar,
  Grid
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  Email,
  Phone,
  Edit,
  Verified,
  Security,
  Cancel,
  Badge,
  CalendarToday,
  FiberManualRecord,
  WbSunny,
  CheckCircle,
  LocalPhone,
  MailOutline,
  PersonOutline,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    contact: '',
    avatar: '',
    role: 'Premium Member',
    memberSince: 'Active User',
    lastActive: 'Just now',
    userId: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const token = localStorage.getItem('token');
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      setInitialLoading(true);
      try {
        const response = await fetch(`${API}/profile`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        });
        const data = await response.json();
        
        // Get first letter for avatar
        const firstLetter = data.username ? data.username.charAt(0).toUpperCase() : 'U';
        
        setFormData({
          username: data.username || '',
          email: data.email || '',
          contact: data.contact || '',
          avatar: `https://ui-avatars.com/api/?name=${firstLetter}&background=2563EB&color=fff&size=200&bold=true&length=1&font-size=0.6`,
          role: "Premium Member",
          memberSince: "January 2026",
          lastActive: "Just now",
          userId: data._id ? data._id.substring(0, 8) : 'dnyanda'
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await fetch(`${API}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          username: formData.username,
          contact: formData.contact
        })
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setOpenSnackbar(true);
      setIsEditing(false);
      
      // Update avatar with new first letter
      const firstLetter = formData.username.charAt(0).toUpperCase();
      setFormData(prev => ({
        ...prev,
        avatar: `https://ui-avatars.com/api/?name=${firstLetter}&background=2563EB&color=fff&size=200&bold=true&length=1&font-size=0.6`,
        lastActive: 'Just now'
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Refetch original data
    window.location.reload();
  };

  if (initialLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#2563EB', size: 60 }} />
          <Typography sx={{ mt: 2, color: '#64748B', fontWeight: 500 }}>
            Loading profile...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Get first letter for avatar
  const firstLetter = formData.username ? formData.username.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-container">
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/home')}
            sx={{ 
              transition: 'all 0.2s',
              '&:hover': { 
                transform: 'scale(1.1)',
                backgroundColor: 'rgba(37, 99, 235, 0.08)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              ml: 2, 
              fontWeight: 800,
              color: '#0F172A',
              fontSize: '1.35rem',
              letterSpacing: '-0.5px'
            }}
          >
            Profile Settings
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Weather Card */}
            
            
            <Chip 
              icon={<FiberManualRecord sx={{ fontSize: 14 }} />}
              label="Active Now"
              className="status-active"
              sx={{
                backgroundColor: '#10B981',
                color: 'white',
                fontWeight: 700,
                px: 1,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
            
            {!isEditing && (
              <Button
                variant="contained"
                startIcon={<Edit sx={{ fontSize: 20 }} />}
                onClick={() => setIsEditing(true)}
                sx={{
                  borderRadius: '40px',
                  px: 3.5,
                  py: 1.2,
                  background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)',
                  color: 'white',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #047857 100%)',
                    boxShadow: '0 12px 28px rgba(37, 99, 235, 0.45)',
                    transform: 'translateY(-3px)'
                  }
                }}
              >
                Edit Profile
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Centered Container - This centers everything beautifully */}
      <Container className="centered-container">
        <Grid container spacing={4} className="full-height-grid" alignItems="center">
          
          {/* Left Column - Profile Card */}
          <Grid item xs={12} md={5} lg={4} sx={{ height: 'fit-content' }}>
            <Paper elevation={0} className="glass-effect" sx={{ 
              p: 4, 
              borderRadius: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative gradient background */}
              <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%)',
                zIndex: 0
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                {/* Avatar with Ring */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <div className="avatar-ring"></div>
                  <Avatar
                    src={formData.avatar}
                    className="premium-avatar"
                    sx={{
                      width: 160,
                      height: 160,
                      fontSize: '64px',
                      fontWeight: 'bold',
                      bgcolor: '#2563EB',
                      background: 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    }}
                  >
                    {firstLetter}
                  </Avatar>
                  <div className="avatar-badge">
                    <CheckCircle sx={{ fontSize: 22, color: 'white' }} />
                  </div>
                </Box>

                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: '#0F172A', 
                  mb: 1,
                  fontSize: '2rem',
                  letterSpacing: '-0.5px'
                }}>
                  {formData.username || 'User'}
                </Typography>

                <Chip
                  icon={<Star sx={{ fontSize: 18 }} />}
                  label={formData.role}
                  className="role-chip"
                  sx={{ 
                    mb: 3,
                    px: 1,
                    fontSize: '0.9rem'
                  }}
                />

                {/* Contact Information Card */}
                <Box className="info-card" sx={{ mb: 2, textAlign: 'left' }}>
                  <Typography variant="overline" sx={{ 
                    color: '#2563EB', 
                    fontWeight: 800, 
                    letterSpacing: 1.5,
                    fontSize: '0.75rem'
                  }}>
                    CONTACT INFORMATION
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                      <MailOutline sx={{ fontSize: 22, color: '#2563EB', mr: 2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          {formData.email}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                      <LocalPhone sx={{ fontSize: 22, color: '#2563EB', mr: 2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                          Phone
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          {formData.contact || 'Not provided'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Badge sx={{ fontSize: 22, color: '#2563EB', mr: 2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                          User ID
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          {formData.userId}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Account Details Card */}
                <Box className="info-card" sx={{ textAlign: 'left' }}>
                  <Typography variant="overline" sx={{ 
                    color: '#2563EB', 
                    fontWeight: 800, 
                    letterSpacing: 1.5,
                    fontSize: '0.75rem'
                  }}>
                    ACCOUNT DETAILS
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                      <CalendarToday sx={{ fontSize: 22, color: '#2563EB', mr: 2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                          Member Since
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          {formData.memberSince}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FiberManualRecord sx={{ fontSize: 22, color: '#10B981', mr: 2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 600 }}>
                          Status
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600 }}>
                          {formData.lastActive}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Profile Information */}
          <Grid item xs={12} md={7} lg={8} sx={{ height: 'fit-content' }}>
            <Paper elevation={0} className="glass-effect" sx={{ 
              p: 4, 
              borderRadius: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative gradient background */}
              <Box sx={{
                position: 'absolute',
                bottom: -50,
                left: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(5,150,105,0.08) 0%, transparent 70%)',
                zIndex: 0
              }} />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h3" 
                  className="gradient-text" 
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Profile Information
                </Typography>

                <Typography variant="body1" sx={{ 
                  color: '#64748B', 
                  mb: 4, 
                  fontSize: '1.1rem',
                  fontWeight: 500
                }}>
                  View and manage your account details
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <Box className="field-container">
                    <Box className="field-label">
                      <Box className="field-label-icon">
                        <PersonOutline sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: '#0F172A', 
                        fontWeight: 700, 
                        flex: 1,
                        fontSize: '1.1rem'
                      }}>
                        Username <span style={{ color: '#EF4444' }}>*</span>
                      </Typography>
                    </Box>
                    {!isEditing ? (
                      <Box className="field-value">
                        {formData.username || 'User'}
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        sx={{ 
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: '#F8FAFC',
                            '&:hover fieldset': {
                              borderColor: '#2563EB'
                            }
                          }
                        }}
                      />
                    )}
                  </Box>

                  {/* Email Field */}
                  <Box className="field-container">
                    <Box className="field-label">
                      <Box className="field-label-icon">
                        <MailOutline sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: '#0F172A', 
                        fontWeight: 700, 
                        flex: 1,
                        fontSize: '1.1rem'
                      }}>
                        Email Address <span style={{ color: '#EF4444' }}>*</span>
                      </Typography>
                    </Box>
                    <Box className="field-value" sx={{ mb: 1.5 }}>
                      {formData.email}
                    </Box>
                    
                  </Box>

                  {/* Contact Number Field */}
                  <Box className="field-container">
                    <Box className="field-label">
                      <Box className="field-label-icon">
                        <LocalPhone sx={{ fontSize: 24 }} />
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: '#0F172A', 
                        fontWeight: 700, 
                        flex: 1,
                        fontSize: '1.1rem'
                      }}>
                        Contact Number
                      </Typography>
                    </Box>
                    {!isEditing ? (
                      <Box className="field-value">
                        {formData.contact || 'Not provided'}
                      </Box>
                    ) : (
                      <TextField
                        fullWidth
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="+1 (555) 000-0000"
                        sx={{ 
                          mt: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '16px',
                            backgroundColor: '#F8FAFC',
                            '&:hover fieldset': {
                              borderColor: '#2563EB'
                            }
                          }
                        }}
                      />
                    )}
                  </Box>

                  {/* Edit Mode Buttons */}
                  {isEditing && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        sx={{
                          py: 1.8,
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)',
                          color: 'white',
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1D4ED8 0%, #047857 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 14px 28px rgba(37, 99, 235, 0.45)'
                          }
                        }}
                      >
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        onClick={handleCancel}
                        startIcon={<Cancel />}
                        sx={{
                          py: 1.8,
                          borderRadius: '20px',
                          borderColor: '#CBD5E1',
                          borderWidth: 2,
                          color: '#475569',
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          '&:hover': {
                            borderColor: '#94A3B8',
                            borderWidth: 2,
                            backgroundColor: '#F8FAFC',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}

                  {/* Help Message - Only when not editing */}
                  {!isEditing && (
                    <Box className="help-card">
                      <Typography variant="h6" sx={{ 
                        color: '#0F172A', 
                        fontWeight: 700, 
                        mb: 1.5,
                        fontSize: '1.25rem'
                      }}>
                        ✨ Need to make changes?
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: '#64748B',
                        fontSize: '1rem',
                        fontWeight: 500
                      }}>
                        Click the "Edit Profile" button above to update your personal information.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={message.type || 'info'}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: '16px',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
            fontWeight: 600,
            fontSize: '0.95rem',
            backdropFilter: 'blur(8px)'
          }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;