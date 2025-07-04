"use client";

import React, { createContext, useContext, useState } from 'react';

export interface BagItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface BagContextType {
  bagItems: BagItem[];
  addToBag: (item: Omit<BagItem, 'quantity'>) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
}

const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bagItems, setBagItems] = useState<BagItem[]>([]);

  const addToBag = (item: Omit<BagItem, 'quantity'>) => {
    setBagItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromBag = (id: string) => {
    setBagItems(prev => prev.filter(i => i.id !== id));
  };

  const clearBag = () => setBagItems([]);

  return (
    <BagContext.Provider value={{ bagItems, addToBag, removeFromBag, clearBag }}>
      {children}
    </BagContext.Provider>
  );
};

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used within a BagProvider');
  return ctx;
} 