'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogContent, Box, IconButton, Typography,
  Button, TextField, Snackbar, CircularProgress, Chip, InputLabel, MenuItem, Select, OutlinedInput
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export type ProductType = {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: ProductType) => void;
};

const AddProductModal: React.FC<Props> = ({ open, onClose, onAddProduct }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', price: '', discount: '',
    productType: '', productMerk: '', expiration: '', sku: '', minStock: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setForm({
      title: '', description: '', price: '', discount: '',
      productType: '', productMerk: '', expiration: '', sku: '', minStock: ''
    });
    setTags([]);
  };

  const handleUpload = () => {
    if (!form.title || !form.description || !form.price || !preview) {
      setToast('Please fill all fields and upload an image.');
      return;
    }

    setLoading(true);
    const newProduct: ProductType = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      price: form.price,
      imageUrl: preview,
    };

    setTimeout(() => {
      onAddProduct(newProduct);
      resetForm();
      setLoading(false);
      onClose();
      setToast('Product added successfully!');
    }, 1000);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2} borderBottom="1px solid #eee">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onClose}><ArrowBackIcon /></IconButton>
            <Typography variant="h6" fontWeight={600}>Add New Product</Typography>
          </Box>
          <Button variant="outlined" sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}>Save to Draft</Button>
        </Box>

        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box display="flex" gap={4} flexWrap="wrap">
            {/* Left: Image & Tags */}
            <Box flex={1} display="flex" flexDirection="column" gap={2} minWidth={320}>
              <InputLabel sx={{ fontWeight: 600 }}>Tags</InputLabel>
              <Select
                multiple
                value={tags}
                onChange={(e) => setTags(e.target.value as string[])}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => <Chip key={value} label={value} variant="outlined" />)}
                  </Box>
                )}
              >
                {['Sunscreen', 'Sun', 'Moisturizer', 'New'].map(tag => (
                  <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                ))}
              </Select>

              {/* Image Upload */}
              <Box
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 3,
                  backgroundColor: '#fafafa',
                  height: 260,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview" style={{ maxHeight: 200, borderRadius: 12 }} />
                    <Box mt={2} display="flex" gap={1}>
                      <Button component="label" variant="outlined" size="small">Replace<input type="file" hidden onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImage(file);
                          setPreview(URL.createObjectURL(file));
                        }
                      }} /></Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => {
                        setImage(null);
                        setPreview(null);
                      }}>Remove</Button>
                    </Box>
                  </>
                ) : (
                  <Button component="label" variant="outlined" sx={{ textTransform: 'none' }}>
                    Upload Image
                    <input type="file" hidden onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImage(file);
                        setPreview(URL.createObjectURL(file));
                      }
                    }} />
                  </Button>
                )}
              </Box>

              <Button variant="text" sx={{ color: '#C4A35A', textTransform: 'none', fontWeight: 500 }}>
                + Add Another Image
              </Button>
            </Box>

            {/* Right: Form */}
            <Box flex={2} display="flex" flexDirection="column" gap={2} minWidth={400}>
              <TextField label="Product Name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
              <Box display="flex" gap={2}>
                <TextField label="Product Type" value={form.productType} onChange={(e) => setForm({ ...form, productType: e.target.value })} fullWidth />
                <TextField label="Product Merk" value={form.productMerk} onChange={(e) => setForm({ ...form, productMerk: e.target.value })} fullWidth />
              </Box>
              <Box display="flex" gap={2}>
                <TextField label="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} fullWidth />
                <TextField label="Discount (%)" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} fullWidth />
                <TextField label="Discount Price" value={
                  (form.price && form.discount)
                    ? (Number(form.price) - Number(form.price) * Number(form.discount) / 100).toFixed(2)
                    : ''
                } fullWidth disabled />
              </Box>
              <TextField label="Business Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
              <TextField label="Expiration Date" placeholder="DD/MM/YYYY" value={form.expiration} onChange={(e) => setForm({ ...form, expiration: e.target.value })} fullWidth />
            </Box>
          </Box>

          {/* Manage Stock Section */}
          <Box mt={5} pt={3} borderTop="1px solid #eee" display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle1" fontWeight={600}>Manage Stock</Typography>
            <Box display="flex" gap={2}>
              <TextField label="Stock Keeping Unit (SKU)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} fullWidth />
              <TextField label="Minimum Stock" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} fullWidth />
            </Box>
          </Box>

          {/* Upload Button */}
          <Box mt={4} textAlign="right">
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={loading || !form.title || !form.price || !form.description || !preview}
              sx={{
                backgroundColor: '#C4A35A',
                color: 'white',
                borderRadius: '10px',
                px: 4,
                py: 1,
                fontWeight: 600,
                fontSize: '16px',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#b7964f' },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Upload Product'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} message={toast} onClose={() => setToast('')} />
    </>
  );
};

export default AddProductModal;
