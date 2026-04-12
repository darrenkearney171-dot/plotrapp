import React from 'react';
import { Container, Grid, Paper, Button, Typography } from '@mui/material-ui';

export interface PricingPlan {
  name: string;
  price: number;
  features: string[];
  description?: string;
}

const pricingPlans : PricingPlan[] = [
   {
     name: "Starter",
     price: 99,   
     features: ["Essential coresEstimate", "Basic report"],
     description: "For individual users"
   },
   {
     name: "Big",
     price: 299,
     features: ["All Essential from Basic",
                "Advanced report", "Plus 77 examples - residential styles"
     ]
   },
   {
     name: "Plus",
     price: 499,
     features: ["All from Big", "Custom courte plan"],   
     description: "For small build projects"
   }
  ];
