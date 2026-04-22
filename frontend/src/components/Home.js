import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
  Snackbar,
  Switch
} from '@mui/material';
import {
  AccountCircle,
  History,
  Logout,
  Upload,
  Description,
  Download,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import GaugeChart from "react-gauge-chart";

const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentDocId, setCurrentDocId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Apply dark mode class to container
  useEffect(() => {
    const container = document.querySelector('.home-container');
    if (container) {
      if (darkMode) {
        container.classList.add('dark-mode');
      } else {
        container.classList.remove('dark-mode');
      }
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchAnalysisById = async (docId) => {
    try {
      setIsProcessing(true);

      const response = await fetch(`http://localhost:5000/result/${docId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        showSnackbar('Failed to load analysis', 'error');
        return;
      }

      const data = await response.json();

      setCurrentDocId(docId);
      setAnalysisResult({
        summary: data.summary || '',
        clauses: data.clauses || [],
        risks: data.risks || []
      });

      showSnackbar('Analysis loaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showSnackbar('Error loading analysis', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (location.state?.fromHistory && location.state?.docId) {
      fetchAnalysisById(location.state.docId);
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      setAnalysisResult(null);
      setCurrentDocId(null);
      setIsProcessing(false);
      setSelectedFile(null);
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setAnalysisResult(null);
      setCurrentDocId(null);
    } else {
      showSnackbar('Please select a PDF file only.', 'error');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showSnackbar('Please select a PDF file first.', 'error');
      return;
    }

    if (!token) {
      showSnackbar('Please login again.', 'error');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setAnalysisResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentDocId(data.doc_id);
        showSnackbar('Document uploaded successfully! Processing started...', 'success');
        pollForResults(data.doc_id);
      } else {
        showSnackbar(data.msg || 'Upload failed', 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showSnackbar('Network error. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const pollForResults = async (docId) => {
    const checkStatus = async () => {
      try {
        const statusResponse = await fetch(`http://localhost:5000/status/${docId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            await fetchResults(docId);
          } else if (statusData.status === 'error') {
            showSnackbar('Error processing document', 'error');
            setIsProcessing(false);
          } else {
            setTimeout(checkStatus, 2000);
          }
        }
      } catch (error) {
        console.error('Status check error:', error);
        setIsProcessing(false);
      }
    };

    checkStatus();
  };

  const fetchResults = async (docId) => {
    try {
      const response = await fetch(`http://localhost:5000/result/${docId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();

        setAnalysisResult({
          summary: data.summary || "",
          clauses: data.clauses || [],
          risks: data.risks || [],
          sections_explained: data.sections_explained || []
          
        });

        showSnackbar('Analysis completed successfully!', 'success');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.msg || 'Failed to fetch results', 'error');
      }
    } catch (error) {
      console.error('Fetch results error:', error);
      showSnackbar('Network error fetching results.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!currentDocId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/download/${currentDocId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        showSnackbar('Download failed', 'error');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Legal_Analysis_Report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showSnackbar('Report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showSnackbar('Network error during download', 'error');
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    showSnackbar('Logged out successfully', 'success');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleHistory = () => {
    navigate('/history');
    handleMenuClose();
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    showSnackbar(`${!darkMode ? 'Dark' : 'Light'} mode activated`, 'info');
  };

  // Direct logout handler
  const handleDirectLogout = () => {
    handleLogout();
    handleMenuClose();
  };

  return (
    <div className="home-container">
      <AppBar position="static" className="app-bar">
  <Toolbar sx={{ position: 'relative' }}>
    {/* Left spacer - takes up same space as right icons to balance center */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      visibility: 'hidden', // Hidden but maintains layout balance
      mr: 'auto'
    }}>
      <IconButton color="inherit" sx={{ visibility: 'hidden' }}>
        <Brightness4 />
      </IconButton>
      <IconButton color="inherit" sx={{ visibility: 'hidden' }}>
        <History />
      </IconButton>
      <IconButton color="inherit" sx={{ visibility: 'hidden' }}>
        <AccountCircle />
      </IconButton>
      <Button 
        color="inherit"
        startIcon={<Logout />}
        sx={{ 
          border: '1px solid',
          visibility: 'hidden'
        }}
      >
        Logout
      </Button>
    </Box>

    {/* Centered Logo */}
    <Typography 
      variant="h4" 
      component="div" 
      sx={{ 
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        fontWeight: 700,
        whiteSpace: 'nowrap'
      }}
    >
      ⚖️ LegalAssist
      
    </Typography>

    {/* Right side - Actual icons */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      ml: 'auto'
    }}>
      <IconButton 
        color="inherit" 
        onClick={handleThemeToggle}
        className="theme-toggle"
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
      
      <IconButton color="inherit" onClick={handleHistory}>
        <History />
      </IconButton>
      
      <IconButton color="inherit" onClick={handleMenuOpen}>
        <AccountCircle />
      </IconButton>
      
      <Button 
        color="inherit" 
        onClick={handleDirectLogout}
        startIcon={<Logout />}
        className="logout-button"
        sx={{ 
          ml: 1,
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          }
        }}
      >
        Logout
      </Button>
    </Box>

    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfile}>
        <AccountCircle sx={{ mr: 1 }} /> Profile
      </MenuItem>
      <MenuItem onClick={handleDirectLogout}>
        <Logout sx={{ mr: 1 }} /> Logout
      </MenuItem>
    </Menu>
  </Toolbar>
</AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom className="gradient-text">
              Welcome back, {user.username || 'User'}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Upload your legal document for AI-powered analysis
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 4 }}>
          {/* Left Column - File Upload */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom>
                Document Upload
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload your PDF legal document for analysis
              </Typography>

              <div 
                className="file-upload-area"
                onClick={() => document.getElementById('file-input').click()}
              >
                <Upload sx={{ fontSize: 48, color: '#2E5BFF', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {selectedFile ? selectedFile.name : 'Click to upload PDF'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedFile ? 'File selected' : 'Only PDF files are accepted'}
                </Typography>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {selectedFile && (
                <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                  PDF file selected: {selectedFile.name}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleAnalyze}
                disabled={!selectedFile || isProcessing}
                startIcon={isProcessing ? <CircularProgress size={20} /> : <Description />}
                sx={{ mt: 3, py: 1.5 }}
              >
                {isProcessing ? 'Analyzing Document...' : 'Analyze Document'}
              </Button>
            </CardContent>
          </Card>

          {/* Right Column - Results */}
          <Card>
            <CardContent sx={{ p: 4, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" align="left">
                  Analysis Results
                </Typography>
                {analysisResult && (
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownload}
                  >
                    Download Report
                  </Button>
                )}
              </Box>

              {isProcessing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                  <CircularProgress size={60} sx={{ mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    AI is analyzing your document
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Extracting text, identifying clauses, and assessing risks...
                  </Typography>
                </Box>
              ) : analysisResult ? (
                <Box sx={{ maxHeight: '600px', overflow: 'auto' }}>
                  
                  {/* Summary Section */}
                  <Section title="Document Summary" icon="📄">
                    <Box sx={{ textAlign: 'left' }}> 

                      {analysisResult.sections_explained?.length > 0 && (
  <div style={{ marginTop: "20px" }}>
    <h3>📘 Legal Sections Explained</h3>

    {analysisResult.sections_explained.map((sec, index) => (
      <div key={index} style={{
        background: "#F9FAFB",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "10px",
        border: "1px solid #E5E7EB"
      }}>
        <strong>{sec.section} – {sec.act}</strong>
        <p style={{ marginTop: "5px" }}>
          {sec.explanation}
        </p>
      </div>
    ))}
  </div>
)}
                      {analysisResult.summary &&
                        analysisResult.summary
                          .split('\n')
                          .filter(line => line.trim() !== '')
                          .map((point, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                mb: 1.8
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: '1.2rem',
                                  lineHeight: '1.6',
                                  mr: 1,
                                  color: '#2E5BFF'
                                }}
                              >
                                •
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  lineHeight: 1.7,
                                  fontSize: '1.1rem',
                                  color: '#2E384D',
                                  fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}
                              >
                                {point.split('**').map((part, i) =>
                                  i % 2 === 1 ? (
                                    <strong key={i} style={{ color: '#2E5BFF', fontWeight: 600 }}>
                                      {part}
                                    </strong>
                                  ) : (
                                    part
                                  )
                                )}
                              </Typography>
                            </Box>
                          ))}
                          
                    </Box>
                  </Section>

                  {/* Clauses Section */}
                  <Section title="Identified Clauses" titleSize="2rem" icon="🔍">
                    <Box sx={{ textAlign: 'left' }}>
                      {analysisResult.clauses.map((clause, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: 2.5,
                            borderRadius: 2.5,
                            border: '1px solid #E0E6F5',
                            borderLeft: '6px solid #2E5BFF',
                            backgroundColor: '#FAFBFF',
                            transition: 'all 0.25s ease-in-out',
                            cursor: 'default',
                            '&:hover': {
                              backgroundColor: '#F3F6FF',
                              boxShadow: '0 8px 24px rgba(46, 91, 255, 0.15)',
                              transform: 'translateY(-4px)',
                              borderLeft: '6px solid #1A3FB5'
                            }
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: '#2E5BFF',
                              mb: 0.5,
                              transition: 'color 0.25s ease'
                            }}
                          >
                            Clause {index + 1}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              fontSize: '1.2rem',
                              mb: 0.75,
                              color: '#2E384D',
                              transition: 'color 0.25s ease',
                              '&:hover': {
                                color: '#1A3FB5'
                              }
                            }}
                          >
                            {clause.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.75,
                              fontSize: '0.95rem'
                            }}
                          >
                            {clause.description}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Section>

                  {/* Risks Section */}
                  <Section title="Risk Assessment" icon="⚠️">
                    <Box sx={{ textAlign: 'left' }}>
                      {analysisResult.risks.map((risk, index) => (
                        <Paper
                          key={index}
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: 2.5,
                            borderRadius: 2.5,
                            border: '1px solid #E0E6F5',
                            borderLeft:
                              risk.risk_level === 'High'
                                ? '6px solid #D32F2F'
                                : risk.risk_level === 'Medium'
                                ? '6px solid #ED6C02'
                                : '6px solid #2E7D32',
                            backgroundColor: '#FAFBFF',
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              backgroundColor: '#F3F6FF',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                              transform: 'translateY(-3px)'
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 1
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                color: '#2E384D'
                              }}
                            >
                              {risk.risk}
                            </Typography>
                            <Chip
                              label={risk.risk_level}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                color: 'white',
                                backgroundColor:
                                  risk.risk_level === 'High'
                                    ? '#D32F2F'
                                    : risk.risk_level === 'Medium'
                                    ? '#ED6C02'
                                    : '#2E7D32'
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              lineHeight: 1.6,
                              color: '#2E384D'
                            }}
                          >
                            🛡️ <strong>Mitigation Strategy:</strong> {risk.mitigation}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Section>
                </Box>
              ) : (
                <EmptyAnalysisState />
              )}
              
              
             
            </CardContent>
          </Card>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

// Helper Components
const Section = ({ title, icon, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <span>{icon}</span> {title}
    </Typography>
    {children}
  </Box>
);

const EmptyAnalysisState = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 10,
      px: 3,
      color: '#6B7280'
    }}
  >
    <Description sx={{ fontSize: 72, color: '#CBD5E1', mb: 2 }} />
    <Typography variant="h6" gutterBottom>
      No analysis available
    </Typography>
    <Typography variant="body2" sx={{ maxWidth: 420, mx: 'auto' }}>
      Upload a PDF legal document to generate a summary, clause identification, and risk assessment.
    </Typography>
  </Box>
);

export default Home;