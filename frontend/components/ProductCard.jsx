import React from 'react';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography
} from '@mui/material';

export default function ProductCard({ title, price, image, desc }) {
  return (
    <Card
      sx={{
        width: 320,                 
        height: 370,                
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <CardActionArea sx={{ height: '100%' }}>
        <CardMedia
          component="img"
          height="180"              
          image={image}
          alt={title}
          sx={{ objectFit: 'cover' }}
        />

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 'calc(100% - 180px)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
            }}
          >
            {desc}
          </Typography>

          <Typography
            variant="subtitle2"
            color="primary"
            fontWeight="bold"
          >
            {price}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
