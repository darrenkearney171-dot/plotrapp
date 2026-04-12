import React from 'react';
import { Grid, Paper, Box, Checkbox, Typography } from '@mui/material-ui';

export function EstimateResult({ estimate }) {
  const [price, setPrice] = React.useState(estimate.price);

  return (
    <Paper>
      <Grid container spacing={2}>
        {/* show all charges */}
      </Grid>
    </Paper>
  ;
}
