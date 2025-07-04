'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Button, Avatar, IconButton,
  Tooltip, Dialog, DialogTitle, DialogContent, Card, CardContent
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddProductModal, { ProductType } from './AddProductModal';

const ProductPage = () => {
  const [productList, setProductList] = useState<ProductType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const handleAddProduct = (product: ProductType) => {
    setProductList(prev => {
      const updated = [...prev];
      const index = updated.findIndex(p => p.id === product.id);
      if (index >= 0) updated[index] = product;
      else updated.push(product);
      return updated;
    });
  };

  const handleDelete = (id: number) => {
    setProductList(prev => prev.filter(p => p.id !== id));
  };

  const extractWeights = (priceString: string) => {
    return priceString
      .split(',')
      .map(p => p.split('for')[1]?.trim())
      .join(', ');
  };

  const extractPrices = (priceString: string) => {
    return priceString
      .split(',')
      .map(p => p.trim().split(' ')[0])
      .join(', ');
  };

  return (
    <Box p={4}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight="bold">Emilio Beaufort</Typography>
      </Box>

      {/* Stats Row + Add Product */}
      <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" fontWeight="bold">Products</Typography>
        <Box display="flex" gap={3}>
          <Box>
            <Typography variant="subtitle2" color="gray">Product Sold (pcs)</Typography>
            <Typography fontWeight="bold">5,420 <span style={{ color: 'red' }}>▼ 8.6%</span></Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="gray">On Packaging (pcs)</Typography>
            <Typography fontWeight="bold">6,580 <span style={{ color: 'green' }}>▲ 9.2%</span></Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="gray">Average Order</Typography>
            <Typography fontWeight="bold">2,640 <span style={{ color: 'green' }}>▲ 7.4%</span></Typography>
          </Box>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#f73378', textTransform: 'none' }}
            onClick={() => { setEditingProduct(null); setOpenModal(true); }}
          >
            + Add a product
          </Button>
        </Box>
      </Box>

      {/* Product Table */}
      <Box mt={3}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
              <th></th>
              <th>Product</th>
              <th>Description</th>
              <th>Stock</th>
              <th>Price Per Item</th>
              <th>Net Weight</th>
              <th>Category</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {productList.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                <td><input type="checkbox" /></td>
                <td>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={product.imageUrl} alt={product.title} />
                    {product.title}
                  </Box>
                </td>
                <td>{product.description}</td>
                <td>{product.minStock || '-'}</td>
                <td>{extractPrices(product.price)}</td>
                <td>{product.variants.map(v => v.weight).join(', ')}</td>
                <td>{product.category}</td>
                <td>
                  <Tooltip title="See Details" arrow>
                    <IconButton onClick={() => { setSelectedProduct(product); setOpenDetails(true); }} sx={{ color: 'black' }}>
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit" arrow>
                    <IconButton onClick={() => { setEditingProduct(product); setOpenModal(true); }} sx={{ color: 'black' }}>
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      onClick={() => handleDelete(product.id)}
                      sx={{ color: 'black', '&:hover': { color: 'red' } }}
                    >
                      <DeleteOutlineOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Product Details Dialog */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid #ccc', fontWeight: 'bold' }}>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Card sx={{ border: '2px solid black', borderRadius: 2, p: 2, mt: 2 }} elevation={3}>
              <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ maxHeight: 200, borderRadius: 12 }} />
                  <Typography><strong>Name:</strong> {selectedProduct.title}</Typography>
                  <Typography><strong>Description:</strong> {selectedProduct.description}</Typography>
                  <Typography><strong>Category:</strong> {selectedProduct.category}</Typography>
                  <Typography><strong>Brand:</strong> {selectedProduct.brand}</Typography>
                  <Typography><strong>Price / Item:</strong> {extractPrices(selectedProduct.price)}</Typography>
                  <Typography><strong>Net Weights:</strong> {selectedProduct.variants.map(v => v.weight).join(', ')}</Typography>
                  <Typography><strong>SKU:</strong> {selectedProduct.sku}</Typography>
                  <Typography><strong>Min Stock:</strong> {selectedProduct.minStock}</Typography>
                  <Typography><strong>Expiration Date:</strong> {selectedProduct.expiration}</Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <AddProductModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onAddProduct={handleAddProduct}
        productToEdit={editingProduct}
      />
    </Box>
  );
};

export default ProductPage;
