'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogContent, Box, IconButton, Typography,
  Button, TextField, Paper, Fade
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export type ProductType = {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  brand: string;
  rating: number;
  expiration: string;
  sku: string;
  minStock: string;
  variants: { weight: string; price: string }[];
};

const defaultDrafts: ProductType[] = [
  {
    id: 1001,
    title: 'Sample Draft 1',
    description: 'Description for draft product 1',
    price: '$100',
    imageUrl: '/images/sample1.jpg',
    category: 'Sample Category',
    brand: 'Draft Brand',
    rating: 0,
    expiration: '2025-12-31',
    sku: 'DRAFT-001',
    minStock: '5',
    variants: [{ weight: '100g', price: '100' }],
  },
  {
    id: 1002,
    title: 'Sample Draft 2',
    description: 'Description for draft product 2',
    price: '$150',
    imageUrl: '/images/sample2.jpg',
    category: 'Sample Category',
    brand: 'Draft Brand',
    rating: 0,
    expiration: '2026-01-15',
    sku: 'DRAFT-002',
    minStock: '10',
    variants: [{ weight: '200g', price: '150' }],
  },
];

const ProductDetailsModal = ({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductType | null;
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'howToUse'>('details');
  const [detailsContent, setDetailsContent] = useState('');
  const [howToUseContent, setHowToUseContent] = useState('');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingHowToUse, setIsEditingHowToUse] = useState(false);

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth TransitionComponent={Fade}>
      <DialogContent
        sx={{
          bgcolor: '#f9f9f9',
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          padding: 0,
        }}
      >
        {/* Back Button Header */}
        <Box display="flex" alignItems="center" px={2} py={1} borderBottom="1px solid #ccc">
          <IconButton onClick={onClose}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} ml={1}>
            Product Details
          </Typography>
        </Box>

        {/* Top Section */}
        <Paper elevation={3} sx={{ display: 'flex', gap: 2, p: 3, m: 2, borderRadius: 2, border: '1px solid #ccc' }}>
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            <img src={product.imageUrl} alt={product.title} style={{ maxHeight: 250, width: 'auto', borderRadius: 8 }} />
          </Box>
          <Box width="1px" bgcolor="#ccc" mx={2} />
          <Box flex={2}>
            <Typography variant="h6" fontWeight={600}>{product.title}</Typography>
            <Typography variant="body2" color="textSecondary" mb={1}>{product.brand}</Typography>
            <Typography variant="body1" gutterBottom>{product.description}</Typography>
            <Typography variant="body2">Price: ₹{product.variants[0].price}</Typography>
            <Typography variant="body2">Weight: {product.variants[0].weight}</Typography>
            <Typography variant="body2">Category: {product.category}</Typography>
            <Typography variant="body2">SKU: {product.sku}</Typography>
            <Typography variant="body2">Min Stock: {product.minStock}</Typography>
            <Typography variant="body2">Expiration: {product.expiration}</Typography>
            <Button
              variant="contained"
              sx={{ mt: 2, backgroundColor: '#000', color: '#fff', textTransform: 'none', borderRadius: 2 }}
            >
              Add to Bag
            </Button>
          </Box>
        </Paper>

        {/* Bottom Section */}
        <Paper elevation={3} sx={{ borderRadius: 2, p: 3, m: 2, border: '1px solid #ccc' }}>
          <Box display="flex" gap={2} mb={2}>
            <Button
              variant={activeTab === 'details' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('details')}
              sx={{ textTransform: 'none' }}
            >
              Details
            </Button>
            <Button
              variant={activeTab === 'howToUse' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('howToUse')}
              sx={{ textTransform: 'none' }}
            >
              How to Use
            </Button>
          </Box>

          <Box display="flex" gap={3}>
            <Box flex={2}>
              {activeTab === 'details' ? (
                isEditingDetails ? (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={detailsContent}
                      onChange={(e) => setDetailsContent(e.target.value)}
                    />
                    <Box mt={1} textAlign="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setIsEditingDetails(false)}
                        sx={{ textTransform: 'none' }}
                      >
                        Save
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box
                    onClick={() => setIsEditingDetails(true)}
                    sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, cursor: 'pointer', minHeight: 100 }}
                  >
                    {detailsContent || <Typography color="textSecondary">+ Add Content</Typography>}
                  </Box>
                )
              ) : (
                isEditingHowToUse ? (
                  <>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      value={howToUseContent}
                      onChange={(e) => setHowToUseContent(e.target.value)}
                    />
                    <Box mt={1} textAlign="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setIsEditingHowToUse(false)}
                        sx={{ textTransform: 'none' }}
                      >
                        Save
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box
                    onClick={() => setIsEditingHowToUse(true)}
                    sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, cursor: 'pointer', minHeight: 100 }}
                  >
                    {howToUseContent || <Typography color="textSecondary">+ Add Content</Typography>}
                  </Box>
                )
              )}
            </Box>
            <Box flex={1} display="flex" alignItems="center" justifyContent="center">
              <img src={product.imageUrl} alt={product.title} style={{ maxHeight: 200, width: 'auto', borderRadius: 8 }} />
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;
