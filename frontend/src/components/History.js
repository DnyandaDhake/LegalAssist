import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Delete,
  Download,
  Description
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Visibility } from '@mui/icons-material';


const History = () => {
  const navigate = useNavigate();  
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, msg: '', type: 'info' });

  const token = localStorage.getItem('token');

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5000/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDocs(data);
    } catch {
      setSnackbar({ open: true, msg: 'Failed to load history', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async (docId) => {
    const res = await fetch(`http://localhost:5000/download/${docId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Legal_Analysis_Report.pdf';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document permanently?')) return;

    await fetch(`http://localhost:5000/delete/${docId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    setDocs(docs.filter(d => d._id !== docId));
    setSnackbar({ open: true, msg: 'Document deleted', type: 'success' });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📜 Analysis History
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : docs.length === 0 ? (
        <Typography>No documents found</Typography>
      ) : (
        docs.map(doc => (
          <Card key={doc._id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography fontWeight={600}>
                    <Description sx={{ mr: 1 }} />
                    {doc.original_filename}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uploaded on {new Date(doc.uploaded_at).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
  <Chip
    label={doc.status}
    color={doc.status === 'completed' ? 'success' : 'warning'}
    size="small"
    sx={{ mr: 1 }}
  />

  <IconButton
    title="View Analysis"
    onClick={() =>
      navigate('/home', {
  state: {
    docId: doc._id,
    fromHistory: true   // ✅ THIS IS THE KEY
  }
})

    }
  >
    <Visibility />
  </IconButton>

  <IconButton
    title="Download Report"
    onClick={() => handleDownload(doc._id)}
  >
    <Download />
  </IconButton>

  <IconButton
    title="Delete"
    color="error"
    onClick={() => handleDelete(doc._id)}
  >
    <Delete />
  </IconButton>
</Box>


              </Box>
            </CardContent>
          </Card>
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default History;
