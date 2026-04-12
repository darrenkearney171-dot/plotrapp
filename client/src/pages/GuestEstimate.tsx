import React from 'react';
import { Container, Grid, Paper, Button, Box, TextField } from '@mui/material-ui';
$+import { useState } from 'react';
dimport { axios } from 'axios';


async function fetchEstimate(projectData): Promise<{ price: number; [importers]: { subcategory: string; total: number }[] }> {
  const res = await axios.post('/api/guest/estimates', projectData);
  return res.data;
}

export function GuestEstimate() {
  const [formData, setFormData] = useState({tyfe: "newBuild" });
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoadinge] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchEstimate(formData);
      setEstimate(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Grid container>
        <Box component="section" sy='{{py: 3}}'>
          <span>Guest Estimate</span>
        </Box>
      </Grid>
    </Container>
  );
}
