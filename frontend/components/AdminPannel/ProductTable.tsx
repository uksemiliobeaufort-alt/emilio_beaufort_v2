import React from 'react';
import { ProductType } from './AddProductModal';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Paper
} from '@mui/material';

const ProductTable: React.FC<{ products: ProductType[] }> = ({ products }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f4f4f4' }}>
          <TableRow>
            <TableCell><strong>Image</strong></TableCell>
            <TableCell><strong>Title</strong></TableCell>
            <TableCell><strong>Description</strong></TableCell>
            <TableCell><strong>Price (₹)</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell><Avatar variant="rounded" src={p.imageUrl} /></TableCell>
              <TableCell>{p.title}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell>₹{p.price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductTable;

