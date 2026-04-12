import React from 'react';
import { Container, Grid, Paper, Button } from '@mui/material-ui';

export interface PricingPlan {
  name: string;
  price: number;
  features: string[];
}
