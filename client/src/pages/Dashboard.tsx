import React from 'react';
import { Grid, Paper, Card, CardContent } from '@mui/material-ui';
export function Dashboard() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Paper>
          <Card>
            <CardContent>Projects</CardContent>
          </Card>
        </Paper>
      </Grid>
    </Grid>
  );
}
