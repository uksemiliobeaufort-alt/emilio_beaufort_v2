import React, { useRef, useState } from 'react';
import ProductCard from './ProductCard';
import { Box, IconButton } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

const products = [
  {
    id: 1,
    name: 'Cleanser',
    desc: 'Deep clean formula with vitamin C',
    price: '$45',
    image: '/images/product1.jpg',
  },
  {
    id: 2,
    name: 'Gift Box',
    desc: 'Combo pack for glowing skin',
    price: '$100',
    image: '/images/product2.jpg',
  },
  {
    id: 3,
    name: 'Cleanser',
    desc: 'Deep clean formula with vitamin C',
    price: '$45',
    image: '/images/product1.jpg',
  },
  {
    id: 4,
    name: 'Gift Box',
    desc: 'Combo pack for glowing skin',
    price: '$100',
    image: '/images/product2.jpg',
  },
  {
    id: 5,
    name: 'Serum',
    desc: 'Brightening formula for night care',
    price: '$85',
    image: '/images/product2.jpg',
  },
];

const Cards = () => {
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0); // tracks current scroll group
  const visibleCards = 3;
  const cardWidth = 320 + 16; // card width + gap (16px)

  const scrollToIndex = (i) => {
    const scrollX = i * cardWidth;
    containerRef.current.scrollTo({
      left: scrollX,
      behavior: 'smooth',
    });
  };

  const handleNext = () => {
    if (index < products.length - visibleCards) {
      const newIndex = index + 1;
      setIndex(newIndex);
      scrollToIndex(newIndex);
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      scrollToIndex(newIndex);
    }
  };

  return (
    <Box sx={{ position: 'relative', maxWidth: 980, mx: 'auto' }}>
      {/* Scrollable Card Row */}
      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          overflowX: 'hidden', // hidden, controlled via buttons
          gap: 2,
          py: 2,
        }}
      >
        {products.map((product) => (
          <Box key={product.id} sx={{ flex: '0 0 auto' }}>
            <ProductCard
              title={product.name}
              price={product.price}
              desc={product.desc}
              image={product.image}
            />
          </Box>
        ))}
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          left: -30,
          transform: 'translateY(-50%)',
          zIndex: 2,
        }}
        disabled={index === 0}
      >
        <ArrowBackIos />
      </IconButton>

      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: -30,
          transform: 'translateY(-50%)',
          zIndex: 2,
        }}
        disabled={index >= products.length - visibleCards}
      >
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
};

export default Cards;
