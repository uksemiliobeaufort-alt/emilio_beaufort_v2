"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, Product } from "@/lib/api";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'COSMETICS' | 'HAIR'>('ALL');

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

  const filteredProducts = selectedCategory === 'ALL' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8">
            The House
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our curated collection represents the pinnacle of grooming excellence. 
            Each product is designed to elevate your daily ritual.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4">
            {[
              { value: 'ALL', label: 'All Products' },
              { value: 'COSMETICS', label: 'Cosmetics' },
              { value: 'HAIR', label: 'Hair' }
            ].map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.value as 'ALL' | 'COSMETICS' | 'HAIR')}
                className={selectedCategory === category.value 
                  ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              >
                {category.label}
              </Button>
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
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 