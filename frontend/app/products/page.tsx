"use client";
import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { getProducts, Product as SupabaseProduct } from "@/lib/supabase";
import { Product } from "@/lib/api";
import { ProductCard, ProductListItem } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ProductDetailDialog } from '@/components/ui/ProductDetailDialog';
import { RippleButton } from '@/components/ui/RippleButton';
import MyBagButton from '@/components/MyBagButton';
import SimpleCheckoutForm from '@/components/SimpleCheckoutForm';
import { useSearchParams, useRouter } from 'next/navigation';
import { safeMap } from "@/lib/utils";

// Mapping function to convert Supabase Product to API Product format
const mapSupabaseProductToAPIProduct = (supabaseProduct: SupabaseProduct): Product => {
  return {
    id: supabaseProduct.id,
    name: supabaseProduct.name,
    description: supabaseProduct.description || '',
    price: supabaseProduct.price || 0,
    category: supabaseProduct.category === 'cosmetics' ? 'COSMETICS' : 'HAIR',
    imageUrl: supabaseProduct.main_image_url || '',
    gallery: supabaseProduct.gallery_urls || [],
    isSoldOut: !supabaseProduct.in_stock,
    tags: [],
    createdAt: supabaseProduct.created_at || new Date().toISOString(),
    updatedAt: supabaseProduct.updated_at || new Date().toISOString(),
  };
};

function ProductsPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'COSMETICS' | 'HAIR'>('COSMETICS');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // New: Bag and Checkout modal state
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Handler to open checkout and close bag
  const handleBuyNow = () => {
    setBagOpen(false);
    setCheckoutOpen(true);
  };

  // Handler to close checkout
  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabaseProducts = await getProducts();
        if (supabaseProducts && Array.isArray(supabaseProducts)) {
          const mappedProducts = safeMap(supabaseProducts, mapSupabaseProductToAPIProduct);
          setProducts(mappedProducts);
        } else {
          console.error('getProducts returned invalid data:', supabaseProducts);
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle URL query parameter for product detail
  useEffect(() => {
    const productId = searchParams?.get('id');
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedProduct(product);
        setDetailDialogOpen(true);
        // Set the correct category filter
        setSelectedCategory(product.category);
        // Clear the URL parameter
        router.replace('/products', { scroll: false });
      }
    }
  }, [searchParams, products, router]);

  const filteredProducts = (selectedCategory === 'COSMETICS' 
    ? products.filter(product => product.category && product.category.toLowerCase() === 'cosmetics')
    : products.filter(product => product.category && product.category.toLowerCase() === 'hair')
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
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle, professional gradient bubbles */}
      {/* Top right large gradient bubble */}
      <div className="absolute top-0 right-0 w-[38rem] h-[38rem] rounded-full blur-3xl z-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 70% 30%, #f5e9c6 0%, #bfa14a 60%, transparent 100%)',
          transform: 'translate(30%,-30%)'
        }}
      />
      {/* Top left large gradient bubble */}
      <div className="absolute top-0 left-0 w-[32rem] h-[32rem] rounded-full blur-3xl z-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #e7dac7 0%, #bfa14a 50%, transparent 100%)',
          transform: 'translate(-30%,-30%)'
        }}
      />
      {/* Center faint gradient bubble */}
      <div className="absolute top-1/2 left-1/2 w-[28rem] h-[28rem] rounded-full blur-3xl z-0 pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(circle, #bfa14a 0%, transparent 80%)',
          transform: 'translate(-50%,-50%)'
        }}
      />
      <MyBagButton open={bagOpen} setOpen={setBagOpen} onBuyNow={handleBuyNow} />
      <SimpleCheckoutForm open={checkoutOpen} onClose={handleCheckoutClose} />
      <div className="max-w-7xl mx-auto px-6 sm:px-4 pt-28 relative z-10">
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
              { value: 'COSMETICS', label: 'Cosmetics' },
              { value: 'HAIR', label: 'Hairs' },
            ].map((category) => (
              <RippleButton
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value as 'COSMETICS' | 'HAIR')}
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
        {/* Mobile List View */}
        <div className="block sm:hidden">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <ProductListItem product={product} onViewDetails={(p) => { setSelectedProduct(p); setDetailDialogOpen(true); }} />
            </motion.div>
          ))}
        </div>
         {/* Grid View for sm and up */}
         <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 gap-y-8">
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

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-serif text-gray-900">Loading products...</div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
} 