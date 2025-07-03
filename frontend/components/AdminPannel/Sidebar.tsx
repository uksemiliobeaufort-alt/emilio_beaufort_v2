import React from 'react';
import { Box, List, ListItemButton, ListItemText } from '@mui/material';

interface SidebarProps {
  onMenuSelect: (page: string) => void;
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onMenuSelect, activePage }) => {
  const menuItems = [
    { name: 'Dashboard', value: 'dashboard' },
    { name: 'Products', value: 'products' },
    { name: 'Blogs', value: 'blogs' },
  ];

  return (
    <Box
      width="240px"
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        height: '100vh',
        backdropFilter: 'blur(4px)',
        boxShadow: 3,
        pt: 2,
      }}
    >
      <List>
        <ListItemText
          primary="Emilio Beaufort"
          primaryTypographyProps={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textAlign: 'center',
            fontFamily: 'serif',
            color: 'white',
            mb: 2,
          }}
        />
        {menuItems.map((item) => (
          <ListItemButton
            key={item.name}
            onClick={() => onMenuSelect(item.value)}
            selected={activePage === item.value}
            sx={{
              color: 'white',
              pl: 3,
              borderLeft: activePage === item.value ? '4px solid gold' : '4px solid transparent',
              backgroundColor: activePage === item.value ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
