import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { Box, Button } from '@mui/material';

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
  {
    id: 6,
    name: 'Toner',
    desc: 'Refresh and hydrate skin',
    price: '$60',
    image: '/images/product1.jpg',
  },
  {
    id: 7,
    name: 'Moisturizer',
    desc: 'Long-lasting hydration formula',
    price: '$95',
    image: '/images/product2.jpg',
  },
  {
    id: 8,
    name: 'Face Wash',
    desc: 'Gentle cleanser for all skin types',
    price: '$40',
    image: '/images/product1.jpg',
  },
];

const Cards = () => {
  const [viewMore, setViewMore] = useState(false);

  const displayedProducts = viewMore ? products : products.slice(0, 6);

  return (
    <Box
      sx={{
        // ✅ Scroll sirf viewMore ke baad enable
        maxHeight: viewMore ? '65vh' : 'none',
        overflowY: viewMore ? 'auto' : 'visible',
        px: 2,
        pb: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Product rows - always 3 per row */}
      {Array.from({ length: Math.ceil(displayedProducts.length / 3) }, (_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          {displayedProducts
            .slice(rowIndex * 3, rowIndex * 3 + 3)
            .map((product) => (
              <Box key={product.id}>
                <ProductCard
                  title={product.name}
                  price={product.price}
                  desc={product.desc}
                  image={product.image}
                />
              </Box>
            ))}
        </Box>
      ))}

      {/* View More Button */}
      {!viewMore && (
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" onClick={() => setViewMore(true)}>
            View More
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Cards;



