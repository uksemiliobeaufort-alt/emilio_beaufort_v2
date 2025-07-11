"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BagItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

interface BagContextType {
  bagItems: BagItem[];
  addToBag: (item: Omit<BagItem, 'quantity'>, onLimitHit?: (msg?: string) => void) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
}

const BagContext = createContext<BagContextType | undefined>(undefined);

export const BagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bagItems, setBagItems] = useState<BagItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bagItems');
      if (stored) return JSON.parse(stored);
    }
    return [];
  });

  // Persist bagItems to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bagItems', JSON.stringify(bagItems));
    }
  }, [bagItems]);

  const addToBag = (item: Omit<BagItem, 'quantity'>, onLimitHit?: (msg?: string) => void) => {
    setBagItems(prev => {
      const totalQuantity = prev.reduce((sum, i) => sum + i.quantity, 0);
      const existing = prev.find(i => i.id === item.id);
      if (totalQuantity + 1 > 10) {
        if (onLimitHit) onLimitHit("You've reached the bag limit. Please purchase the items in your bag before adding more.");
        return prev;
      }
      if (existing) {
        if (existing.quantity >= 5) {
          return prev;
        }
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