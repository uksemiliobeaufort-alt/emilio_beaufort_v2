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

export default function CosmeticsCollectionGrid({ open, onOpenChange }: { open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined && onOpenChange !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Fetch all products (not just cosmetics) when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      getProducts().then(setProducts);
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="w-screen max-w-none h-screen flex flex-col bg-white p-8 overflow-y-auto">
        <DialogTitle>Products</DialogTitle>
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