import React from 'react';
import { Grid, Paper, Box, Typography } from '@mui/material-ui';
import { ProjectEstimate, ProjectPhase } from '../types';

interface NewBuildResultProps {
  projectId: string;
  estimate: ProjectEstimate;
}

export function NewBuildResult({ projectId, estimate }: NewBuildResultProps) {
  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Typography variant="h5">P	2: Total Cost: À¢Â 2 +a`