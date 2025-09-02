"use client";

import { useEffect, useState, useCallback, useRef } from 'react';

export interface ProductsPageState {
  currentPage: number;
  selectedCategory: 'COSMETICS' | 'HAIR';
  search: string;
  searchInput: string;
  scrollPosition: number;
  selectedProductId: string | null;
  detailDialogOpen: boolean;
}

const STORAGE_KEY = 'products-page-state';

const DEFAULT_STATE: ProductsPageState = {
  currentPage: 1,
  selectedCategory: 'HAIR',
  search: '',
  searchInput: '',
  scrollPosition: 0,
  selectedProductId: null,
  detailDialogOpen: false
};

export function useProductsPageState() {
  const [state, setState] = useState<ProductsPageState>(DEFAULT_STATE);
  const isInitialized = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load state from localStorage on mount (only once)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Validate the parsed state
          if (parsedState && typeof parsedState === 'object') {
            setState({
              ...DEFAULT_STATE,
              ...parsedState
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse saved products page state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
      isInitialized.current = true;
    }
  }, []);

  // Debounced save function
  const saveToStorage = useCallback((newState: ProductsPageState) => {
    if (typeof window !== 'undefined') {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch (error) {
          console.error('Failed to save state to localStorage:', error);
        }
      }, 100);
    }
  }, []);

  // Update state function
  const updateState = useCallback((newState: Partial<ProductsPageState>) => {
    setState(prevState => {
      const updatedState = { ...prevState, ...newState };
      saveToStorage(updatedState);
      return updatedState;
    });
  }, [saveToStorage]);

  // Clear saved state
  const clearState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState(DEFAULT_STATE);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    updateState,
    clearState
  };
}
