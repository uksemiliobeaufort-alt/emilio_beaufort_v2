'use client';
import React, { useState, useEffect } from 'react';
import DraftSection from './DraftSection';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import {
  Dialog, DialogContent, Box, IconButton, Typography,
  Button, TextField, Snackbar, CircularProgress, Chip,
  InputLabel, MenuItem, Select, OutlinedInput, Card, CardContent,
  Paper
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
  rating: number;
  expiration: string;
  sku: string;
  minStock: string;
  variants: { weight: string; price: string }[];
  
};

type Props = {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: ProductType) => void;
  onSaveToDraft: (product: ProductType) => void; 
  productToEdit?: ProductType | null;
};


const AddProductModal: React.FC<Props> = ({ open, onClose, onAddProduct,onSaveToDraft, productToEdit }) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', category: '', brand: '', expiration: '', sku: '', minStock: ''
  });
  const [variants, setVariants] = useState([{ weight: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const [showDraftSection, setShowDraftSection] = useState(false);

  

  const IMAGE_URL = 'https://media.licdn.com/dms/image/v2/D4D12AQGI52m0Ux9gJg/article-cover_image-shrink_720_1280/B4DZX8a1hfG8AI-/0/1743696648779?e=1756944000&v=beta&t=uXo4EeoOqMU0D-RbxpECXpCyLYHanIHL2Qa20KzjkNA';

  useEffect(() => {
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
      rating: 5,
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


  const handleSaveToDraft = () => {
  if (!form.title || !form.description || !preview) {
    setToast('Please fill all fields and upload an image.');
    return;
  }

  const variantPriceText = variants
    .filter(v => v.weight && v.price)
    .map(v => `$${v.price} for ${v.weight}`)
    .join(', ');

  const draftCard: ProductType = {
    id: Date.now(),
    title: form.title,
    description: form.description,
    category: form.category,
    brand: form.brand,
    expiration: form.expiration,
    sku: form.sku,
    minStock: form.minStock,
    price: variantPriceText,
    imageUrl: preview,
    rating: 0,
    variants,
  };
  onSaveToDraft(draftCard); 
  setToast('Draft saved!');
  onClose(); 
  setShowDraftSection(true);

};
  return (
    <>
      <Dialog
         open={open}
         onClose={onClose}
         fullWidth
         maxWidth="md"
        PaperProps={{
        sx: {
        width: '70vw',
        height: '100vh',
        borderRadius: 3,
        overflow: 'hidden',
    },
  }}
      >

        <Box display="flex" justifyContent="space-between" alignItems="center" px={3} py={2} borderBottom="1px solid #e0e0e0">
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={onClose}><ArrowBackIcon /></IconButton>
            <Typography variant="h6" fontWeight={600}>{productToEdit ? 'Edit Product' : 'Add New Product'}</Typography>
          </Box>
          

        </Box>

        <DialogContent
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%',
    bgcolor: 'rgba(0, 0, 0, 0.1)',
    px: 2,
    py: 2,
  }}
>
  {/* PRODUCT INFO SECTION */}
  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle1" fontWeight={600} fontSize="14px" mb={1}>Product Information</Typography>

    <TextField
      size="small"
      label="Product Name"
      value={form.title}
      onChange={(e) => setForm({ ...form, title: e.target.value })}
      fullWidth
      sx={{ mb: 1 }}
    />

    <Box display="flex" gap={1} mb={1}>
      <TextField
        size="small"
        label="Category"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        fullWidth
      />
      <TextField
        size="small"
        label="Product Brand"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        fullWidth
      />
    </Box>

    <Typography fontSize="13px" fontWeight={600} mb={0.5}>Variants (Weight & Price)</Typography>
    {variants.map((v, i) => (
      <Box key={i} display="flex" gap={1} alignItems="center" mb={1}>
        <TextField size="small" label="Weight" value={v.weight} onChange={e => handleVariantChange(i, 'weight', e.target.value)} fullWidth />
        <TextField size="small" label="Price" value={v.price} onChange={e => handleVariantChange(i, 'price', e.target.value)} fullWidth />
        <IconButton size="small" color="error" onClick={() => removeVariant(i)}><RemoveIcon fontSize="small" /></IconButton>
      </Box>
    ))}

    <Button size="small" onClick={addVariant} startIcon={<AddIcon fontSize="small" />} variant="outlined" sx={{ width: 'fit-content', mb: 2, fontSize: '12px' }}>
      Add Variant
    </Button>

    <TextField
      size="small"
      label="Description"
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
      fullWidth
      multiline
      rows={2}
      sx={{ mb: 1 }}
    />
    <TextField size="small" label="Expiration Date" value={form.expiration} onChange={(e) => setForm({ ...form, expiration: e.target.value })} fullWidth sx={{ mb: 1 }} />
    <TextField size="small" label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} fullWidth sx={{ mb: 1 }} />
    <TextField size="small" label="Minimum Stock" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} fullWidth />
  </Paper>

  {/* IMAGE & TAG SECTION */}
  

    {/* IMAGE PREVIEW/UPLOAD SECTION */}
<Paper elevation={2} sx={{ p: 2, borderRadius: 2, mt: 2 }}>
  <Typography variant="subtitle1" fontWeight={600} fontSize="14px" mb={1}>
    Product Image
  </Typography>

  <Box
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        setImage(file);
        setPreview(URL.createObjectURL(file));
      }
    }}
    sx={{
      border: '2px dashed #ccc',
      borderRadius: 2,
      height: 200,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      cursor: 'pointer',
      textAlign: 'center',
      '&:hover': { backgroundColor: '#f5f5f5' },
    }}
  >
    {preview ? (
      <>
        <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 8 }} />
        <Box mt={1} display="flex" gap={1}>
          <Button variant="outlined" size="small" component="label">
            Replace
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => {
              setImage(null);
              setPreview(null);
            }}
          >
            Remove
          </Button>
        </Box>
      </>
    ) : (
      <>
        <CloudUploadIcon fontSize="large" sx={{ color: '#999', mb: 1 }} />
        <Typography fontSize="14px" color="text.secondary">
          Drag & drop product image here, or
        </Typography>
        <Button
          variant="outlined"
          size="small"
          component="label"
          sx={{ mt: 1 }}
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
        </Button>
      </>
    )}
  </Box>
</Paper>

  

  {/* ACTION BUTTONS */}
  <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
    <Button size="small" variant="outlined" color="info" onClick={handleSaveToDraft}>
      Save to Draft
    </Button>
    <Button
      size="small"
      variant="contained"
      onClick={handleUpload}
      disabled={loading || !form.title || !form.description || !preview}
      sx={{
        backgroundColor: '#C4A35A',
        color: 'white',
        borderRadius: '8px',
        px: 3,
        fontSize: '13px',
        '&:hover': { backgroundColor: '#b7964f' },
      }}
    >
      {loading ? <CircularProgress size={16} color="inherit" /> : productToEdit ? 'Update' : 'Upload'}
    </Button>

  </Box>
</DialogContent>


      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={3000} message={toast} onClose={() => setToast('')} />
    </>
  );
};

export default AddProductModal;
