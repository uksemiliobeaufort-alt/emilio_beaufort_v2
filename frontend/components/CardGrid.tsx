'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Modal,
  Box
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Cards from './Cards';

export default function CardGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardData = [
    { title: 'Cosmetics', link: '' },
    { title: 'Hair', link: '/products/hair' },
    { title: 'Emilio Global', desc: 'This is the third card.', link: '' },
    { title: 'Journal', desc: 'This is the fourth card.', link: '' },
  ];

  return (
    <>
      {/* Main Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="relative group transition-transform duration-300 transform hover:scale-105 border border-black hover:border-yellow-500 rounded-xl overflow-hidden min-h-[280px] hover:shadow-lg hover:shadow-yellow-500/30 p-4"
          >
            <Card className="bg-transparent shadow-none h-full">
              <CardContent>
                <Typography variant="h5" className="font-bold">
                  {card.title}
                </Typography>
              </CardContent>

              {card.title === 'Cosmetics' ? (
                <div
                  onClick={() => setIsModalOpen(true)}
                  className="absolute bottom-4 right-4 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-yellow-500 hover:text-yellow-600 cursor-pointer"
                >
                  <ArrowForward />
                </div>
              ) : (
                <a
                  href={card.link}
                  className="absolute bottom-4 right-4 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-yellow-500 hover:text-yellow-600"
                >
                  <ArrowForward />
                </a>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* ✅ Modal Popup with Mac OS header */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            width: '90vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: '5vh auto',
            backgroundColor: 'white',
            borderRadius: 2,
            p: 4,
            boxShadow: 24,
          }}
        >
          {/* Mac OS Style Header */}
          <Box mb={4}>
            {/* Mac-style top-left dots */}
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {/* Red - close modal */}
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#ff5f57',
                  cursor: 'pointer',
                }}
                onClick={() => setIsModalOpen(false)}
              />
              {/* Yellow & Green - visual only */}
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#ffbd2e',
                }}
              />
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#28ca41',
                }}
              />
            </Box>

            {/* Centered title */}
            <Typography variant="h4" align="center">
              Cosmetics Collection
            </Typography>
          </Box>

          {/* Product Grid */}
          <Cards />
        </Box>
      </Modal>
    </>
  );
}

