"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState, useEffect } from "react";
import { getProducts, Product } from "@/lib/api";
import { ProductDetailDialog } from "@/components/ui/ProductDetailDialog";
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function CosmeticsCollectionGrid({ open, onOpenChange }: { open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all products (not just cosmetics) when dialog opens
  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchProducts();
    }
  }, [dialogOpen]);

  // Set up real-time subscription when dialog is open
  useEffect(() => {
    if (!dialogOpen) return;

    let subscription: RealtimeChannel;
    
    const setupSubscription = async () => {
      subscription = supabase
        .channel('cosmetics_collection_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'cosmetics'
          },
          async (payload) => {
            console.log('Cosmetics products update received in collection grid:', payload);
            // Show refreshing state and refresh products when cosmetics table changes
            setRefreshing(true);
            await fetchProducts();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'hair_extensions'
          },
          async (payload) => {
            console.log('Hair extensions products update received in collection grid:', payload);
            // Show refreshing state and refresh products when hair_extensions table changes
            setRefreshing(true);
            await fetchProducts();
          }
        )
        .subscribe();

      console.log('Real-time subscription established for cosmetics collection grid');
    };

    setupSubscription();

    // Cleanup subscription when dialog closes or component unmounts
    return () => {
      if (subscription) {
        console.log('Cleaning up cosmetics collection grid real-time subscription');
        supabase.removeChannel(subscription);
      }
    };
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="w-screen max-w-none h-screen flex flex-col bg-white p-8 overflow-y-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <DialogTitle>Products</DialogTitle>
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
              <span>Updating...</span>
            </div>
          )}
        </div>
        <DialogDescription>Browse all our premium products below.</DialogDescription>
        <h2 className="text-3xl font-bold mb-8 text-center">Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} onViewDetails={(p) => { setSelectedProduct(p); setDetailDialogOpen(true); setInternalOpen(false); }} />
          ))}
        </div>
      </DialogContent>
      <ProductDetailDialog product={selectedProduct} open={detailDialogOpen} onOpenChange={(open) => { setDetailDialogOpen(open); if (!open) setInternalOpen(true); }} />
    </Dialog>
  );
} 