'use client';

import React, { useState,useRef } from 'react';
import ProductDetailsModal from './ProductDetailsModal';
import ExpandedCardRow from './ExpandedCardRow';
import DraftSection from './DraftSection';
import { defaultDrafts } from './DraftSection';

import {
  Box, Typography, Button, TextField,
  MenuItem, Select, InputLabel, FormControl, Snackbar
} from '@mui/material';
import AddProductModal, { ProductType } from './AddProductModal';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const defaultProducts: ProductType[] = [
  {
    id: 1,
    title: "HairOil",
    description: "Raw natural oil from Himachal make silky and smooth hair",
    category: "Oil",
    imageUrl: "/images/product1.jpg",
    variants: [{ weight: "250g", price: "$149" }],
    brand: "Emilio Cosmetics",
    price: "$149",
    sku: "HON-250",
    minStock: '10',
    rating:4.8,
    expiration: "2025-12-31",
  },
  {
    id: 2,
    title: "Almond Facecream",
    description: "Creamy almond facecream for glowing skin",
    category: "Facecream",
    imageUrl: "/images/product2.jpg",
    variants: [{ weight: "500g", price: "$349" }],
    rating: 4.6,
   
    brand: "Emilio Cosmetics",
    price: "$349",
    sku: "AB-500",
    minStock: '5',
    expiration: "2026-01-10",
  },
  { 
    id: 3,
    title: "Turmeric Facewash",
    description: "High-quality Lakadong turmeric for pimple free skin",
    category: "FaceWash",
    imageUrl: "/images/product1.jpg",
    variants: [{ weight: "100g", price: "$99" }],
    rating: 4.9,
    brand: "Emilio Cosmetics",
    price: "$99",
    sku: "TUR-100",
    minStock: '8',
    expiration: "2025-10-15",
  },
];

const ProductPage = () => {
  const [productList, setProductList] = useState<ProductType[]>(defaultProducts);
  const [drafts, setDrafts] = useState<ProductType[]>([...defaultDrafts]);

  const [toast, setToast] = useState('');
  const toastRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [showExpandedView, setShowExpandedView] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterWeight, setFilterWeight] = useState('');
  const [showDraftSection, setShowDraftSection] = useState(false);
  
  const handleAddProduct = (product: ProductType) => {
  setProductList(prev => [product, ...prev]); // ⬅️ Adds new product at the top
  setToast('Product added successfully!');
  setTimeout(() => {
    toastRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, 300);
};


  const filteredProducts = productList.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterCategory === '' || product.category === filterCategory) &&
    (filterWeight === '' || product.variants.some(v => v.weight === filterWeight))
  );

  const categoryOptions = Array.from(new Set(productList.map(p => p.category)));
  const weightOptions = Array.from(new Set(productList.flatMap(p => p.variants.map(v => v.weight))));

  return (
    <Box px={4} py={3} bgcolor="#f9fafb" minHeight="100vh">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold">Products</Typography>
         <Button
      variant="outlined"
      sx={{ textTransform: 'none' }}
      onClick={() => setShowDraftSection(prev => !prev)}
    >
      Draft Section
    </Button>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#f73378', textTransform: 'none' }}
          onClick={() => {
            setEditingProduct(null);
            setOpenModal(true);
          }}
        >
          + Add a product
        </Button>
      </Box>

      {/* Filters */}
      <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
        <TextField
          placeholder="Search product or category"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>All net weight</InputLabel>
          <Select
            label="All net weight"
            value={filterWeight}
            onChange={(e) => setFilterWeight(e.target.value)}
          >
            <MenuItem value="">All net weight</MenuItem>
            {weightOptions.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>All category</InputLabel>
          <Select
            label="All category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <MenuItem value="">All category</MenuItem>
            {categoryOptions.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Product Cards */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        columnGap={0}
        rowGap={12}
      >
        {filteredProducts.map((card, index) => (
          <Card
            key={index}
            onClick={() => {
                setSelectedProduct(card);
              
            }}

            className="overflow-hidden bg-white border-0 shadow-lg transition-all duration-500 hover:shadow-xl group-hover:border-[#B7A16C]"
            style={{
              height: '393px',
              width: '29%',
              borderRadius: '0px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* IMAGE */}
            <div style={{ height: '190px', width: '100%', position: 'relative' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <Image
                src={card.imageUrl}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            </div>

            {/* CONTENT */}
            <CardContent className="relative z-20 bg-white/95 px-3 py-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{card.brand}</p>
                <h3 className="text-sm font-semibold text-gray-900 leading-tight">{card.title}</h3>
                <p className="text-gray-600 text-xs line-clamp-2 leading-snug">{card.description}</p>
                <p className="text-gray-800 font-medium text-sm">₹ {card.variants[0].price}</p>
                <p className="text-gray-500 text-xs">Weight: {card.variants[0].weight}</p>
                <p className="text-yellow-500 text-xs">⭐ {card.rating}</p>
              </div>
              <Button
                variant="contained"
                size="small"
                sx={{
                  marginTop: '10px',
                  backgroundColor: '#000',color: '#fff',
                  width: '100%',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  padding: '6px 12px'
                }}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
      <DraftSection
  drafts={drafts}
  open={showDraftSection}
  onClose={() => setShowDraftSection(false)}
  onUpload={(draft) => {
    setProductList(prev => [draft, ...prev]);       // Move to product list
    setDrafts(prev => prev.filter(d => d.id !== draft.id));  // Remove from draft
    setToast('Draft uploaded!');
  }}
  onDelete={(index) => {
    setDrafts(prev => prev.filter((_, i) => i !== index));  // Remove draft
    setToast('Draft deleted!');
  }}
/>



<AddProductModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  onAddProduct={handleAddProduct}
  productToEdit={editingProduct}
  onSaveToDraft={(draft) => {
    setDrafts(prev => [...prev, draft]);
    setToast('Draft saved!');
    setShowDraftSection(true);
  }}
/>

      <Snackbar
         open={!!toast}
         autoHideDuration={3000}
         message={toast}
         onClose={() => setToast('')}
      />
      <div ref={toastRef} />
         

      <ProductDetailsModal
  open={!!selectedProduct}
  onClose={() => setSelectedProduct(null)}
  product={selectedProduct}
  />
    <ExpandedCardRow
    open={showExpandedView}
     onClose={() => setShowExpandedView(false)}
  products={productList}
  />

    </Box>
    


  );
};

export default ProductPage;
