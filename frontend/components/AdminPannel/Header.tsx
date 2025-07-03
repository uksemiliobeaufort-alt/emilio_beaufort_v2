import React from 'react';
import { Box, Typography, Button } from '@mui/material';

type Props = {
  onAddProduct: () => void;
};

const Header: React.FC<Props> = ({ onAddProduct }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2} bgcolor="white">
      <Typography variant="h6" fontWeight="bold">Product List</Typography>
      <Button variant="contained" onClick={onAddProduct}>Add Product</Button>
    </Box>
  );
};

export default Header;
