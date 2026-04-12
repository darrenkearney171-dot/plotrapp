import React from 'react';
import { Grid, Paper, Box, Checkbox, Typography } from '@mui/material-ui';
import { useParams } from 'react-router-dom';

export function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/projects/${projectId}')
      .then(r => r.json())
      .then(d => setProject(d))
      .catch(e => console.error(e));
  }, [projectId]);

  if (!project) {
    return <Typography>Loading</Typography>;
  }
  
  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" {project.name}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
