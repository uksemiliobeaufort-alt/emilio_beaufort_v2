"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, Product } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ProductDetailDialog } from '@/components/ui/ProductDetailDialog';
import { RippleButton } from '@/components/ui/RippleButton';
import MyBagButton from '@/components/MyBagButton';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LIPSTICKS' | 'FOUNDATIONS' | 'POWDERS' | 'SERUM' | 'MOISTURIZER'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await api.getProducts();
        setProducts(allProducts);
      } catch {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = (selectedCategory === 'ALL' 
    ? products 
    : products.filter(product => product.category && product.category.toLowerCase() === selectedCategory.toLowerCase())
  ).filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <MyBagButton />
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8">
            PRODUCTS
          </h1>
          <form
            className="flex justify-center"
            onSubmit={e => {
              e.preventDefault();
              setSearch(searchInput);
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={e => {
                setSearchInput(e.target.value);
                // Optionally, for real-time search, uncomment the next line:
                // setSearch(e.target.value);
              }}
              placeholder="Search products..."
              className="w-full max-w-2xl px-5 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-premium text-lg shadow-sm"
            />
            <button
              type="submit"
              className="px-8 py-2 bg-black text-white font-semibold rounded-r-lg border border-black hover:bg-white hover:text-black transition-colors duration-200 text-lg shadow-sm"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4">
            {[
              { value: 'ALL', label: 'All Products' },
              { value: 'LIPSTICKS', label: 'Lipsticks' },
              { value: 'FOUNDATIONS', label: 'Foundations' },
              { value: 'POWDERS', label: 'Powders' },
              { value: 'SERUM', label: 'Serum' },
              { value: 'MOISTURIZER', label: 'Moisturizer' },
            ].map((category) => (
              <RippleButton
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value as 'ALL' | 'LIPSTICKS' | 'FOUNDATIONS' | 'POWDERS' | 'SERUM' | 'MOISTURIZER')}
                className={
                  (selectedCategory === category.value
                    ? 'bg-black text-white shadow-lg scale-105 border-[#B7A16C]'
                    : 'bg-white text-black border border-gray-300 hover:border-[#B7A16C] hover:scale-110') +
                  ' rounded-full px-6 py-2 font-semibold transition-all duration-200'
                }
              >
                {category.label}
              </RippleButton>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <ProductCard product={product} onViewDetails={(p) => { setSelectedProduct(p); setDetailDialogOpen(true); }} />
            </motion.div>
          ))}
        </div>
        <ProductDetailDialog 
          product={selectedProduct} 
          open={detailDialogOpen} 
          onOpenChange={setDetailDialogOpen} 
          showAddToCartButton
        />
      </div>
    </div>
  );
} 