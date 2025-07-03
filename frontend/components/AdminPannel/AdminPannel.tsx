import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Sidebar from './Sidebar';
import ProductPage from './ProductPage';

const AdminPannel: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');

  return (
    <Box display="flex" minHeight="100vh">
      <Sidebar onMenuSelect={setActivePage} activePage={activePage} />
      <Box flexGrow={1} bgcolor="#f9f9f9">
        {/* Header area with title */}
        <Box p={4} textAlign="center" borderBottom="1px solid #ddd">
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#000"
            fontFamily="serif"
          >
            Emilio Beaufort
          </Typography>
          <Typography
            variant="h6"
            mt={1}
            fontWeight={500}
            color="gray"
          >
            Welcome to the Admin Panel
          </Typography>
        </Box>

        {/* Page Content */}
        <Box p={3}>
          {activePage === 'products' ? (
            <ProductPage />
          ) : (
            <Typography color="gray" textAlign="center" mt={10}>
              Select a section from the sidebar to begin.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPannel;

