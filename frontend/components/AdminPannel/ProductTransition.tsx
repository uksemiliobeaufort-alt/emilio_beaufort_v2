import React from 'react';
import { Box, Typography } from '@mui/material';

const ProductTransition: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 2000,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeOverlay 1s ease-in-out forwards',
        overflow: 'hidden',
      }}
    >
      {/* ✅ Fast Zoom-In Background */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: `url("/images/emilio.jpeg")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          animation: 'zoomInBackgroundFast 1s ease-in forwards',
          zIndex: 0,
        }}
      />

      {/* ✅ Dark Overlay */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 1,
        }}
      />

      {/* ✅ White Glowing Zooming Text (1s total) */}
      <Typography
        variant="h2"
        sx={{
          color: '#ffffff',
          fontWeight: 'bold',
          letterSpacing: 2,
          animation: 'glowText 1s ease-in-out, zoomTextOnce 1s ease-in-out forwards',
          zIndex: 2,
        }}
      >
        <h1>EMILIO Products</h1>
        <h5><center>Luxurious Products</center> </h5>
      </Typography>

      {/* ✅ Motion Grid */}
      <Box
        sx={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background:
            'radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          animation: 'moveBackground 40s linear infinite',
          opacity: 0.15,
          zIndex: 1,
        }}
      />

      {/* ✅ CSS Animations */}
      <style>
        {`
          @keyframes glowText {
            0%, 100% {
              text-shadow: 0 0 10px #ffffff, 0 0 20px #ffffff;
            }
            50% {
              text-shadow: 0 0 25px #eeeeee, 0 0 50px #eeeeee;
            }
          }

          @keyframes zoomTextOnce {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes moveBackground {
            0% {
              transform: translate(0, 0);
            }
            100% {
              transform: translate(-50px, -50px);
            }
          }

          @keyframes fadeOverlay {
            0% { opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }

          @keyframes zoomInBackgroundFast {
            0% {
              transform: scale(1);
            }
            100% {
              transform: scale(1.15);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ProductTransition;
