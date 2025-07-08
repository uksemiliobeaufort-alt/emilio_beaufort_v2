'use client';

import { ProductType } from './AddProductModal';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

type Props = {
  open: boolean;
  onClose: () => void;
  products: ProductType[];
};

const ExpandedCardRow: React.FC<Props> = ({ open, onClose, products }) => {
  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <Box sx={{ p: 3, bgcolor: '#f0f0f0', height: '100vh', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {/* Close Button */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h5" fontWeight="bold">Product Overview</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Animated Product Cards Row */}
        <Box display="flex" gap={4} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {products.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Box
                sx={{
                  width: 300,
                  height: 400,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'white',
                  boxShadow: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 2,
                }}
              >
                <Box height={180} position="relative">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover"
                    style={{ borderRadius: 8 }}
                  />
                </Box>
                <Box mt={2}>
                  <Typography variant="subtitle1" fontWeight={600}>{product.title}</Typography>
                  <Typography variant="body2" color="textSecondary">{product.description}</Typography>
                  <Typography variant="body2" mt={1}>₹ {product.price}</Typography>
                  <Typography variant="caption">Weight: {product.variants[0].weight}</Typography>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Dialog>
  );
};

export default ExpandedCardRow;
