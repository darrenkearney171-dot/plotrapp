import React from 'react';
import { Grid, Paper, Box, Checkbox, Typography, Button } from '@mui/material-ui';
import { Colors } from '../styles/colors';

interface KitchenEstimateResultProps {
  estimate: {
    totalCost: number;
    breakdown: {
      layout: number;
      cabinets: number;
      steel: number;
      worktop: number;
    };
    timeline: string[];
    notes?: string;
  };
}

export function KitchenEstimateResult({ estimate }: KitchenEstimateResultProps) {
  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4">Estimated Cost: À¢Â </Typography>
          <Typography variant="h3"> À¢Â  {
            Math.round(estimate.totalCost * 100) / 100
          }</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Breakdown:</Typography>
          <UL>
            <li>Layout:  À¢Â </li>
            <li>Cabinets: À¢Â </li>
          </UL>
        </Grid>
      </Grid>
  
  
        OUrtutn: 
  </Paper>
  )/

}
