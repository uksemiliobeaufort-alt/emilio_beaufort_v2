import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Sidebar from './Sidebar';
import ProductPage from './ProductPage';
import ProductTransition from './ProductTransition';

const AdminPannel: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [showTransition, setShowTransition] = useState(false);
  const [pendingPage, setPendingPage] = useState<string | null>(null);

  const handleMenuSelect = (page: string) => {
    if (page === 'products') {
      setShowTransition(true);
      setPendingPage(page);
    } else {
      setActivePage(page);
    }
  };

  useEffect(() => {
    if (showTransition && pendingPage === 'products') {
      const timer = setTimeout(() => {
        setShowTransition(false);
        setActivePage('products');
        setPendingPage(null);
      }, 1000); // 3 seconds transition
      return () => clearTimeout(timer);
    }
  }, [showTransition, pendingPage]);

  return (
    <Box display="flex" minHeight="100vh" position="relative" overflow="hidden">
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          transition: 'transform 1s ease, filter 1s ease',
          transform: showTransition ? 'scale(1.05)' : 'scale(1)',
          filter: showTransition ? 'blur(4px)' : 'none',
        }}
      >
        <Sidebar onMenuSelect={handleMenuSelect} activePage={activePage} />
        <Box flexGrow={1} bgcolor="#f9f9f9">
          {activePage === 'products' ? (
            <ProductPage />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <Typography color="gray" textAlign="center" fontSize={20}>
                Select a section from the sidebar to begin.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {showTransition && <ProductTransition />}
    </Box>
  );
};

export default AdminPannel;
