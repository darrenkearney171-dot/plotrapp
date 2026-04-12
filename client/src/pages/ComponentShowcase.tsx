import React from 'react';
import { Container, Grid, Paper, Box, Card, CardContent, CardMedia, Typography } from '@mui/material-ui';

/* Showcase of components for design testing */
export function ComponentShowcase() {
  return (
    <Container>
      <Paper>
        <Typograph variant="h4">Component Showcase</Typography>
      </Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>Everything Cases</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )/

}
