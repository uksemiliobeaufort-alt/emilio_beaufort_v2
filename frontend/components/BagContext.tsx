"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProducts } from '@/lib/supabase';
import { productCardUtils } from '@/lib/utils';

export interface BagItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  variantId?: string;
  weight?: number;
  length?: number;
}

// ✅ Reusable input type without quantity
export type AddToBagInput = Omit<BagItem, 'quantity'>;

interface BagContextType {
  bagItems: BagItem[];
  addToBag: (
    item: AddToBagInput,
    onLimitHit?: (msg?: string, context?: { item: AddToBagInput }) => void,
    forceAdd?: boolean
  ) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
}

interface AddToBagOptions {
  forceAdd?: boolean;
  onLimitHit?: (msg?: string, context?: { item: AddToBagInput }) => void;
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

  const addToBag = async (
    item: AddToBagInput,
    onLimitHit?: (msg?: string, context?: { item: AddToBagInput }) => void,
    forceAdd?: boolean
  ) => {
    const products = await getProducts();
    const detailedProduct = products.find((p: any) => p.id === item.id)
    const priceInfo = productCardUtils.getDisplayPrice(item, detailedProduct);
    const itemWithPrice = { ...item, price: priceInfo.displayPrice };

    setBagItems(prev => {
      const totalUnique = prev.length;
      const totalQuantity = prev.reduce((sum, i) => sum + i.quantity, 0);
      const existing = prev.find(i => i.id === item.id);

      if (!forceAdd && totalQuantity + 1 > 10) {
        if (onLimitHit) setTimeout(() => onLimitHit("You've reached the bag limit. Please purchase the items in your bag before adding more.", { item }), 0);
        return prev;
      }

      if (!forceAdd && !existing && totalUnique >= 5) {
        if (onLimitHit) setTimeout(() => onLimitHit("You have 5 different products in your bag. Please purchase or remove some before adding more.", { item }), 0);
        return prev;
      }

      if (existing) {
        if (!forceAdd && existing.quantity >= 5) {
          if (onLimitHit) setTimeout(() => onLimitHit("You can't add more than 5 of the same product.", { item }), 0);
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }

      return [...prev, { ...itemWithPrice, quantity: 1 }];
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
