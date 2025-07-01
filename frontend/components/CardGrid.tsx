'use client';
import React, { useState } from 'react';
import { Card, CardContent, Typography } from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import Cards from './Cards';

export default function CardGrid() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cardData = [
    { title: "Cosmetics", link: "" },
    { title: "Hair", link: "/products/hair" },
    { title: "Emilio Global", desc: "This is the third card.", link: "" },
    { title: "Journal", desc: "This is the fourth card.", link: "" },
  ];

  return (
    <>
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

      {/* ✅ Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-[90%] max-w-4xl rounded-xl shadow-lg p-6 relative">
            <h2 className="text-2xl font-bold mb-4 text-center">Cosmetics Collection</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-yellow-500 text-white px-4 py-1 rounded"
            >
              Close
            </button>
            <Cards /> {/* 👈 product image grid inside modal */}
          </div>
        </div>
      )}
    </>
  );
}
