'use client';

import React, { useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Typography, IconButton, Button, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { ProductType } from './AddProductModal'; // ensure correct import path

interface Props {
  products: ProductType[];
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
}

const ProductTable: React.FC<Props> = ({ products, setProducts }) => {
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const handleDelete = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleDetails = (product: ProductType) => {
    setSelectedProduct(product);
    setOpenDetails(true);
  };

  const extractWeights = (priceString: string) => {
    return priceString.split(',').map(p => p.split('for')[1]?.trim()).join(', ');
  };

  return (
    <Box mt={4}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Product</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Max Stock</strong></TableCell>
              <TableCell><strong>Price / Item</strong></TableCell>
              <TableCell><strong>Net Weight</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 40, height: 40, borderRadius: '50%',
                        overflow: 'hidden', border: '1px solid #ddd'
                      }}
                    >
                      <img src={product.imageUrl} alt={product.title} width="100%" height="100%" />
                    </Box>
                    <Typography>{product.title}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.minStock || '-'}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{extractWeights(product.price)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDetails(product)}><InfoIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Modal */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box display="flex" flexDirection="column" gap={2}>
              <img src={selectedProduct.imageUrl} alt={selectedProduct.title} style={{ maxHeight: 200, borderRadius: 12 }} />
              <Typography><strong>Name:</strong> {selectedProduct.title}</Typography>
              <Typography><strong>Description:</strong> {selectedProduct.description}</Typography>
              <Typography><strong>Category:</strong> {selectedProduct.category}</Typography>
              <Typography><strong>Brand:</strong> {selectedProduct.brand}</Typography>
              <Typography><strong>Price / Item:</strong> {selectedProduct.price}</Typography>
              <Typography><strong>Net Weights:</strong> {extractWeights(selectedProduct.price)}</Typography>
              <Typography><strong>SKU:</strong> {selectedProduct.sku}</Typography>
              <Typography><strong>Min Stock:</strong> {selectedProduct.minStock}</Typography>
              <Typography><strong>Expiration Date:</strong> {selectedProduct.expiration}</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProductTable;


