// AddProductModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog, DialogContent, Box, IconButton, Typography,
  Button, TextField, Snackbar, CircularProgress, Chip, InputLabel, MenuItem, Select, OutlinedInput
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export type ProductType = {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  brand: string;
  expiration: string;
  sku: string;
  minStock: string;
  variants: { weight: string; price: string }[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: ProductType) => void;
  productToEdit?: ProductType | null;
};

const AddProductModal: React.FC<Props> = ({ open, onClose, onAddProduct, productToEdit }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', brand: '', expiration: '', sku: '', minStock: ''
  });
  const [variants, setVariants] = useState([{ weight: '', price: '' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (productToEdit) {
      setForm({
        title: productToEdit.title,
        description: productToEdit.description,
        category: productToEdit.category,
        brand: productToEdit.brand,
        expiration: productToEdit.expiration,
        sku: productToEdit.sku,
        minStock: productToEdit.minStock,
      });
      setVariants(productToEdit.variants);
      setPreview(productToEdit.imageUrl);
    } else {
      resetForm();
    }
  }, [productToEdit]);

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setForm({
      title: '', description: '', category: '', brand: '', expiration: '', sku: '', minStock: ''
    });
    setVariants([{ weight: '', price: '' }]);
    setTags([]);
  };

  const handleUpload = () => {
    if (!form.title || !form.description || !preview) {
      setToast('Please fill all fields and upload an image.');
      return;
    }

    const variantPriceText = variants
      .filter(v => v.weight && v.price)
      .map(v => `$${v.price} for ${v.weight}`)
      .join(', ');

    setLoading(true);
    const newProduct: ProductType = {
      id: productToEdit?.id || Date.now(),
      title: form.title,
      description: form.description,
      category: form.category,
      brand: form.brand,
      expiration: form.expiration,
      sku: form.sku,
      minStock: form.minStock,
      price: variantPriceText,
      imageUrl: preview,
      variants: variants,
    };

    setTimeout(() => {
      onAddProduct(newProduct);
      resetForm();
      setLoading(false);
      onClose();
      setToast(productToEdit ? 'Product updated successfully!' : 'Product added successfully!');
    }, 1000);
  };

  const handleVariantChange = (index: number, field: 'weight' | 'price', value: string) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariant = () => setVariants([...variants, { weight: '', price: '' }]);

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const updated = [...variants];
      updated.splice(index, 1);
      setVariants(updated);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2} borderBottom="1px solid #eee">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onClose}><ArrowBackIcon /></IconButton>
            <Typography variant="h6" fontWeight={600}>{productToEdit ? 'Edit Product' : 'Add New Product'}</Typography>
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
                  border: '2px dashed #ccc', borderRadius: 3, backgroundColor: '#fafafa',
                  height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', cursor: 'pointer', transition: 'background 0.3s',
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
              <Button variant="text" sx={{ color: '#C4A35A', textTransform: 'none', fontWeight: 500 }}>+ Add Another Image</Button>
            </Box>

            {/* Right: Form */}
            <Box flex={2} display="flex" flexDirection="column" gap={2} minWidth={400}>
              <TextField label="Product Name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
              <Box display="flex" gap={2}>
                <TextField label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth />
                <TextField label="Product Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} fullWidth />
              </Box>

              <Typography fontWeight={600} mt={1}>Product Variants (Weight & Price)</Typography>
              {variants.map((v, i) => (
                <Box key={i} display="flex" gap={2} alignItems="center">
                  <TextField label="Weight (e.g. 50ml)" value={v.weight} onChange={e => handleVariantChange(i, 'weight', e.target.value)} fullWidth />
                  <TextField label="Price ($)" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} fullWidth />
                  <IconButton color="error" onClick={() => removeVariant(i)}><RemoveIcon /></IconButton>
                </Box>
              ))}
              <Button onClick={addVariant} startIcon={<AddIcon />} variant="outlined" sx={{ width: 'fit-content' }}>Add Variant</Button>

              <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={3} />
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
              disabled={loading || !form.title || !form.description || !preview}
              sx={{
                backgroundColor: '#C4A35A', color: 'white', borderRadius: '10px', px: 4, py: 1,
                fontWeight: 600, fontSize: '16px', textTransform: 'none',
                '&:hover': { backgroundColor: '#b7964f' },
              }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : productToEdit ? 'Update Product' : 'Upload Product'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} message={toast} onClose={() => setToast('')} />
    </>
  );
};

export default AddProductModal;
