'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, IconButton, Button, Collapse, MenuItem,
  Select, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AddProductModal from './AddProductModal';

type Product = {
  id: number;
  title: string;
  productType: string;
  description: string;
  price: string;
  discount: string;
  imageUrl: string;
  expiration?: string;
  sku?: string;
  minStock?: string;
  size?: string;
};

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [openDetailId, setOpenDetailId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [id: number]: number }>({});
  const [sizes, setSizes] = useState<{ [id: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleDetails = (id: number) => {
    setOpenDetailId(prev => (prev === id ? null : id));
  };

  const handleQtyChange = (id: number, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + change),
    }));
  };

  const handleSizeChange = (id: number, value: string) => {
    setSizes(prev => ({ ...prev, [id]: value }));
  };

  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleEditProduct = (product: Product) => {
    setAddModalOpen(true); // Optional: Implement prefill logic if needed
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Products</Typography>
        <Button variant="contained" onClick={() => setAddModalOpen(true)} sx={{ backgroundColor: '#C4A35A' }}>Add Product</Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography variant="h6" color="text.secondary">No products found.</Typography>
        </Box>
      ) : (
        products.map((product) => {
          const price = Number(product.price);
          const discount = Number(product.discount);
          const discountPrice = isNaN(price) || isNaN(discount)
            ? '0.00'
            : (price - price * discount / 100).toFixed(2);
          const quantity = quantities[product.id] || 1;
          const selectedSize = sizes[product.id] || '50 ml';

          return (
            <Box
              key={product.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom="1px solid #eee"
              py={2}
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" gap={2}>
                <Box width={80} height={80}>
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                  />
                </Box>
                <Box>
                  <Typography fontWeight={600}>{product.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{product.productType}</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography fontWeight={600}>${discountPrice}</Typography>
                    <Typography color="text.secondary" sx={{ textDecoration: 'line-through' }}>${product.price}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Select
                      size="small"
                      value={selectedSize}
                      onChange={(e) => handleSizeChange(product.id, e.target.value)}
                      sx={{ minWidth: 90 }}
                    >
                      {['50 ml', '100 ml', '200 ml'].map((size) => (
                        <MenuItem key={size} value={size}>{size}</MenuItem>
                      ))}
                    </Select>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontSize={14}>Qty:</Typography>
                      <IconButton size="small" onClick={() => handleQtyChange(product.id, -1)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography>{quantity}</Typography>
                      <IconButton size="small" onClick={() => handleQtyChange(product.id, 1)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                <Box>
                  <IconButton onClick={() => handleEditProduct(product)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)}><DeleteIcon /></IconButton>
                </Box>
                <Button
                  variant="text"
                  size="small"
                  endIcon={openDetailId === product.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => toggleDetails(product.id)}
                >
                  Details
                </Button>
              </Box>

              <Collapse in={openDetailId === product.id} timeout="auto" unmountOnExit sx={{ width: '100%', mt: 2 }}>
                <Box p={2} border="1px solid #eee" borderRadius={2} bgcolor="#fafafa">
                  <Typography><strong>Description:</strong> {product.description}</Typography>
                  <Typography><strong>Expiration:</strong> {product.expiration || 'N/A'}</Typography>
                  <Typography><strong>SKU:</strong> {product.sku || 'N/A'}</Typography>
                  <Typography><strong>Min Stock:</strong> {product.minStock || 'N/A'}</Typography>
                </Box>
              </Collapse>
            </Box>
          );
        })
      )}

      <AddProductModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </Box>
  );
};

export default ProductPage;
