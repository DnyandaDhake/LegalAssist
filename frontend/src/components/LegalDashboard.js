import React, { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress
} from "@mui/material";

const LegalDashboard = () => {
  const [data, setData] = useState({
    overall_risk: 0,
    overall_compliance: 100,
    total_documents: 0,
    total_risks: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/dashboard/kpi", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Legal Risk Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Compliance Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h6">
                Overall Compliance
              </Typography>

              <GaugeChart
                id="compliance-gauge"
                percent={data.overall_compliance / 100}
                colors={["#FF4D4D", "#FFC107", "#4CAF50"]}
                arcWidth={0.3}
                textColor="#000"
              />

              <Typography variant="h5" sx={{ mt: 2 }}>
                {data.overall_compliance}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Card */}
        <Grid item xs={12} md={6}>
                <Card>
        <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h6">
            Overall Legal Risk
            </Typography>

            <Box sx={{ height: 250 }}>
            <GaugeChart
                id="risk-gauge"
                percent={Math.min(1, Math.max(0, data.overall_risk / 100))}
                colors={["#4CAF50", "#FFC107", "#FF4D4D"]}
                arcWidth={0.3}
                textColor="#000"
            />
            </Box>

            <Typography variant="h5" sx={{ mt: 2 }}>
            {data.overall_risk}%
            </Typography>
        </CardContent>
        </Card>

        </Grid>
      </Grid>

      {/* Stats Section */}
      <Box sx={{ mt: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Total Documents Analyzed
                </Typography>
                <Typography variant="h4" color="primary">
                  {data.total_documents}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Total Risks Identified
                </Typography>
                <Typography variant="h4" color="secondary">
                  {data.total_risks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LegalDashboard;
