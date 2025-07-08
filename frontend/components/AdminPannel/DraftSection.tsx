'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card } from '@mui/material';
import Image from 'next/image';
import { ProductType } from './AddProductModal';
import CloseIcon from '@mui/icons-material/Close';

export const defaultDrafts: ProductType[] = [
  {
    id: 1002,
    title: 'Sample Draft 2',
    description: 'Description for draft product 2',
    price: '$150',
    imageUrl: 'https://media.post.rvohealth.io/wp-content/uploads/2020/08/beauty-skin-care-cosmetics_thumb.jpg',
    category: 'Sample Category',
    brand: 'Draft Brand',
    rating: 0,
    expiration: '2026-01-15',
    sku: 'DRAFT-002',
    minStock: '10',
    variants: [{ weight: '200g', price: '$150' }],
  },
  {
    id: 1003,
    title: 'product1',
    description: 'Description for draft product 3',
    price: '$120',
    imageUrl: 'https://bsmedia.business-standard.com/_media/bs/img/article/2019-03/31/full/1554050813-9644.jpg?im=FeatureCrop,size=(826,465)',
    category: 'Sample Category',
    brand: 'Draft Brand',
    rating: 0,
    expiration: '2026-05-01',
    sku: 'DRAFT-003',
    minStock: '8',
    variants: [{ weight: '150g', price: '$120' }],
  },
  {
    id: 1004,
    title: 'Sample Draft 4',
    description: 'Description for draft product 4',
    price: '$90',
    imageUrl: 'https://www.pharmaadda.in/wp-content/uploads/2023/05/Cosmetic-Product-List-For-Business-Opportunity.jpg',
    category: 'Sample Category',
    brand: 'Draft Brand',
    rating: 0,
    expiration: '2025-11-20',
    sku: 'DRAFT-004',
    minStock: '7',
    variants: [{ weight: '120g', price: '$90' }],
  },
];

const fadeInStyle = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes clickPulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.96); }
  100% { transform: scale(1); }
}`;

if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = fadeInStyle;
  document.head.appendChild(style);
}

type DraftSectionProps = {
  drafts?: ProductType[];
  onUpload: (product: ProductType) => void;
  onDelete: (index: number) => void;
  open: boolean;
  onClose: () => void;
};

const DraftSection: React.FC<DraftSectionProps> = ({ drafts= defaultDrafts, onUpload, onDelete, open, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const middleIndex = Math.floor(drafts.length / 2);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          backgroundColor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
          borderRadius: 4,
          padding: 4,
          width: '90%',
          maxWidth: 1000,
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <Button onClick={onClose} sx={{ position: 'absolute', top: 10, right: 10 }}>
          <CloseIcon />
        </Button>

        <Typography variant="h4" align="center" mb={4} fontWeight={700}>
          Draft Section
        </Typography>

        {!expanded && (
          <Box sx={{ position: 'relative', height: 430, width: 330, mx: 'auto' }}>
            {drafts.map((draft, i) => {
              const offset = (i - middleIndex) * 14;
              const rotate = (i - middleIndex) * 6;

              return (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translateY(${offset}px) rotate(${rotate}deg)`,
                    zIndex: i === middleIndex ? drafts.length + 10 : i,
                    cursor: i === middleIndex ? 'pointer' : 'default'
                  }}
                  onClick={i === middleIndex ? () => setExpanded(true) : undefined}
                >
                  <Card
                    sx={{
                      width: 330,
                      height: 430,
                      overflow: 'hidden',
                      borderRadius: 3,
                    }}
                  >
                    <Image
                      src={draft.imageUrl}
                      alt={draft.title}
                      width={330}
                      height={430}
                      style={{ objectFit: 'cover' }}
                    />
                  </Card>
                </Box>
              );
            })}
          </Box>
        )}

        {expanded && (
          <Box display="flex" gap={3} overflow="auto">
            {drafts.map((draft, i) => (
              <Card
                key={i}
                onClick={() => {
                  setClickedIndex(i);
                  setTimeout(() => setClickedIndex(null), 300);
                }}
                sx={{
                  minWidth: 250,
                  p: 2,
                  borderRadius: 3,
                  transition: 'transform 0.3s ease',
                  animation: `${clickedIndex === i ? 'clickPulse 0.3s' : 'fadeIn 0.5s ease-in-out'} both`,
                  '&:hover': {
                    transform: 'perspective(600px) rotateY(5deg) scale(1.02)'
                  }
                }}
              >
                <Image
                  src={draft.imageUrl}
                  alt={draft.title}
                  width={250}
                  height={150}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
                <Typography fontWeight={600} mt={1}>{draft.title}</Typography>
                <Typography variant="body2">{draft.description}</Typography>
                <Box mt={1} display="flex" justifyContent="space-between">
                  <Button size="small" onClick={() => onUpload(draft)}>Upload</Button>
                  <Button size="small" color="error" onClick={() => onDelete(i)}>Delete</Button>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DraftSection;
