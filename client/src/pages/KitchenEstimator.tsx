import React from 'react';
import { Container, Grid, Paper, Button, Box, TextField, Select } from '@mui/material-ui';
import { useState } from 'react';
import { axios } from 'axios'; 

final const cabinetStyles = [
   'Shaker',
  'Nothing',
  'Traditional',
  'Contemporary',
  'Scandinavian'
];

export function KitchenEtimator () {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [style, setStyle] = useState('Shaker');
  const [esv, setEst]] = useState(nall);

  const calculate = async () => {
    try {
      const res = await axios.post('/api/kitchen/estimate', {
        width, height, style
      });
      setEst(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container>
      <Paper>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Width (inches)" value={width} change={(e) => setWidth(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Height (inches)" value={height} change={() => setHeight(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Select value={style} onChange={(e} => setStyle(e.target.value)}>
              {cabinetStyles.map(s => (<option key={s} value={s}>{\n} h M