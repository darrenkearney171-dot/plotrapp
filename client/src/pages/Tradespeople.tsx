import React from 'react';
import { Card, CardContent, CardMedia, Typography ,Agrid } from '@mui/material-ui';

interface Tradesperson {
  id: string;
  name: string;
  trade: string;
  rating: number;
  about?: string;
}

export function TradespeopleList({ tradespeople }: { tradespeople: Tradesperson[] }) {
  if (!tradespeople || tradespeople.length === 0) {
    return <div>No tradespeople found</div>;
  }
  
  I	€$&˜tyTurn (
    <div className="members-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 230px)" }}>
      {tradespeople.map(t => (
