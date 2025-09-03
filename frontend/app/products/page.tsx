"use client";
import { useEffect, useState, Suspense, useRef } from "react";
import { motion } from "framer-motion";
import { getProducts, UnifiedProduct as SupabaseProduct } from "@/lib/supabase";
import { Product } from "@/lib/api";
import { ProductCard, ProductListItem } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ProductDetailDialog } from '@/components/ui/ProductDetailDialog';
import { RippleButton } from '@/components/ui/RippleButton';
import MyBagButton from '@/components/MyBagButton';
import OrderFormModal from '@/components/OrderFormModal';
import { useSearchParams, useRouter } from 'next/navigation';
import { safeMap } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Package, Search } from 'lucide-react';
import { getHairExtensionsFromFirebase } from '@/lib/firebase';
import { firestore } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useProductsPageState } from '@/components/ProductsPageState';

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
  const [refreshing, setRefreshing] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Use the state management hook
  const { state, updateState, clearState } = useProductsPageState();
  const { currentPage, selectedCategory, search, searchInput, scrollPosition, selectedProductId, detailDialogOpen } = state;
  
  // Get selected product from products array based on saved ID
  const selectedProduct = products.find(p => p.id === selectedProductId) || null;
  
  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  // New: Bag and Checkout modal state
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Handler to open checkout and close bag
  const handleBuyNow = () => {
    // Check if user is authenticated (with fallback to localStorage)
    const isUserLoggedIn = user || (typeof window !== 'undefined' && localStorage.getItem('authUser'));
    
    console.log('🔍 Products Buy Now Debug:', {
      user: user,
      localStorageUser: typeof window !== 'undefined' ? localStorage.getItem('authUser') : 'N/A',
      isUserLoggedIn: isUserLoggedIn
    });
    
    if (!isUserLoggedIn) {
      // Redirect to auth page
      router.push('/auth?from=bag');
      return;
    }
    
    setBagOpen(false);
    setCheckoutOpen(true);
  };

  // Handler to close checkout
  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
  };

  // Check if user just returned from auth page and should open checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldOpenCheckout = localStorage.getItem('openCheckoutAfterAuth');
      if (shouldOpenCheckout === 'true') {
        localStorage.removeItem('openCheckoutAfterAuth');
        setCheckoutOpen(true);
      }
    }
  }, []);

  // Fetch products for selected category
  const fetchProducts = async () => {
    try {
      if (selectedCategory === 'COSMETICS') {
        const supabaseProducts = await getProducts();
        const mappedProducts = safeMap(supabaseProducts, mapSupabaseProductToAPIProduct);
        setProducts(mappedProducts);
      } else {
        const firebaseProducts = await getHairExtensionsFromFirebase();
        const mappedProducts = firebaseProducts.map((p: any) => ({
          id: p.id || '',
          name: p.name || '',
          description: p.description || '',
          price: Number(p.price) || 0,
          category: 'HAIR' as const,
          imageUrl: p.main_image_url || '',
          gallery: p.gallery_urls || [],
          isSoldOut: !p.in_stock,
          tags: [],
          createdAt: p.created_at || new Date().toISOString(),
          updatedAt: p.updated_at || new Date().toISOString(),
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // -------------------------
  // 🟢 FIX: Cosmetics loading effect
  useEffect(() => {
    if (selectedCategory === 'COSMETICS') {
      setLoading(true);
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);
  // -------------------------

  // Live updates for COSMETICS via Supabase
  useEffect(() => {
    let subscription: RealtimeChannel;

    const setupSubscription = async () => {
      if (selectedCategory !== 'COSMETICS') return;

      subscription = supabase
        .channel('products_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cosmetics' }, () => {
          setRefreshing(true);
          fetchProducts();
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
    // Only run for cosmetics!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Live updates for HAIR via Firestore
  useEffect(() => {
    if (selectedCategory !== 'HAIR') return;

    setLoading(true);
    const unsubscribe = onSnapshot(collection(firestore, 'hair_extensions'), (snapshot) => {
      const updatedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const mapped = updatedProducts.map((p: any) => ({
        id: p.id || '',
        name: p.name || '',
        description: p.description || '',
        price: Number(p.price) || 0,
        category: 'HAIR' as Product['category'],
        imageUrl: p.main_image_url || '',
        gallery: p.gallery_urls || [],
        isSoldOut: !p.in_stock,
        tags: [],
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
      }));

      setProducts(mapped);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Firestore onSnapshot error:', error);
      setProducts([]);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsubscribe();
  }, [selectedCategory]);

  // Read the `id` param once per render and use as a stable dependency
  const productIdParam = searchParams?.get('id') || null;

  // Sync dialog open/close with URL query parameter `id`
  useEffect(() => {
    const productId = productIdParam;
    // If there is an id in URL and products are ready, open dialog for that product
    if (productId && products.length > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        // Avoid redundant updates
        if (selectedProductId !== product.id || !detailDialogOpen) {
          updateState({
            selectedProductId: product.id,
            detailDialogOpen: true,
            selectedCategory: product.category,
          });
        }
      }
    }
    // If there is no id in URL but dialog is open, close it
    if (!productId && detailDialogOpen) {
      updateState({ detailDialogOpen: false, selectedProductId: null });
    }
     
  }, [productIdParam, products, detailDialogOpen, selectedProductId, updateState]);

  // No explicit popstate listener needed; `useSearchParams` effect above responds to history changes

  // Filter and paginate products
  const filteredProducts = products
    .filter(product =>
      product.category?.toLowerCase() === selectedCategory.toLowerCase()
    )
    .filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
    );

  // Pagination logic
  const productsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when search or category changes
  useEffect(() => {
    updateState({ currentPage: 1 });
  }, [search, selectedCategory, updateState]);

  // Save scroll position when user scrolls (throttled)
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateState({ scrollPosition: window.scrollY });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateState]);

  // Restore scroll position on initial load (but not when product dialog is being restored)
  useEffect(() => {
    if (scrollPosition > 0 && typeof window !== 'undefined' && isInitialLoad.current && !selectedProductId) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        isInitialLoad.current = false;
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [scrollPosition, selectedProductId]);

  // Scroll to top when page changes (but not on initial load)
  useEffect(() => {
    if (!isInitialLoad.current && currentPage > 1) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  // Mark initial load as complete after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Restore product detail dialog when products load and we have a saved product ID
  useEffect(() => {
    if (selectedProductId && products.length > 0 && !selectedProduct) {
      // Try to find the product in the current category
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        // Product found, ensure dialog is open and scroll to top
        updateState({ detailDialogOpen: true });
        // Scroll to top when restoring product dialog
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        // Mark initial load as complete since we're restoring a dialog
        isInitialLoad.current = false;
      } else {
        // Product not found in current category, clear the saved state
        updateState({ selectedProductId: null, detailDialogOpen: false });
      }
    }
  }, [products, selectedProductId, selectedProduct, updateState]);

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
              <OrderFormModal open={checkoutOpen} onClose={handleCheckoutClose} />
      <div className="max-w-7xl mx-auto px-6 sm:px-4 pt-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900">
              PRODUCTS
            </h1>
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
          <form
            className="flex justify-center"
            onSubmit={e => {
              e.preventDefault();
              updateState({ search: searchInput });
            }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={e => {
                updateState({ searchInput: e.target.value });
                // Optionally, for real-time search, uncomment the next line:
                // updateState({ search: e.target.value });
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
          {/* Reset button - only show if there's saved state */}
          {(search || currentPage > 1 || selectedCategory !== 'HAIR') && (
            <div className="mt-4">
              <button
                onClick={clearState}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
                title="Reset to default view"
              >
                Reset to default
              </button>
            </div>
          )}
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4">
            {[
              { value: 'HAIR', label: 'Hair' },
              { value: 'COSMETICS', label: 'Cosmetics' },
            ].map((category) => (
              <RippleButton
                key={category.value}
                type="button"
                onClick={() => updateState({ selectedCategory: category.value as 'COSMETICS' | 'HAIR' })}
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
          {currentProducts.length > 0 ? (
            currentProducts.map((product, index) => (
              <motion.div
                key={product.id || `product-${index}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <ProductListItem product={product} onViewDetails={(p) => { 
                  // push ?id= to URL so Back button will close dialog instead of leaving page
                  const url = new URL(window.location.href);
                  url.searchParams.set('id', p.id);
                  window.history.pushState({}, '', url);
                  updateState({ selectedProductId: p.id, detailDialogOpen: true }); 
                }} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-16"
            >
              <div className="mx-auto w-32 h-32 flex items-center justify-center mb-6 animate-fade-in">
                {/* SVG Gift Box with Sparkles */}
                <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="16" y="40" width="64" height="40" rx="8" fill="#FDE68A"/>
                  <rect x="28" y="40" width="8" height="40" fill="#F59E42"/>
                  <rect x="60" y="40" width="8" height="40" fill="#F59E42"/>
                  <rect x="16" y="32" width="64" height="16" rx="4" fill="#FBBF24"/>
                  <rect x="44" y="32" width="8" height="48" fill="#F59E42"/>
                  <circle cx="32" cy="32" r="8" fill="#F472B6"/>
                  <circle cx="64" cy="32" r="8" fill="#60A5FA"/>
                  <path d="M24 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M56 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                  <g>
                    <circle cx="20" cy="20" r="2" fill="#FBBF24"/>
                    <circle cx="76" cy="20" r="2" fill="#FBBF24"/>
                    <circle cx="48" cy="12" r="2" fill="#FBBF24"/>
                    <circle cx="32" cy="12" r="1.5" fill="#F472B6"/>
                    <circle cx="64" cy="12" r="1.5" fill="#60A5FA"/>
                  </g>
                  <g>
                    <circle cx="24" cy="60" r="2" fill="#F472B6"/>
                    <circle cx="72" cy="60" r="2" fill="#60A5FA"/>
                  </g>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {search
                  ? 'No products found'
                  : selectedCategory === 'COSMETICS'
                    ? 'Something Beautiful is Coming!'
                    : 'No products available'}
              </h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? `No products match "${search}" in ${selectedCategory === 'COSMETICS' ? 'Cosmetics' : 'Hair'} category`
                  : selectedCategory === 'COSMETICS'
                    ? 'Our cosmetics collection is launching soon. Stay tuned for a surprise!'
                    : `No ${selectedCategory.toLowerCase()} products are currently available`}
              </p>
              {search && (
                <button
                  onClick={() => {
                    updateState({ search: '', searchInput: '' });
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </div>
        {/* Grid View for sm and up */}
        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8 gap-y-8">
          {currentProducts.length > 0 ? (
            currentProducts.map((product, index) => (
              <motion.div
                key={product.id || `product-${index}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <ProductCard product={product} onViewDetails={(p) => { 
                  const url = new URL(window.location.href);
                  url.searchParams.set('id', p.id);
                  window.history.pushState({}, '', url);
                  updateState({ selectedProductId: p.id, detailDialogOpen: true }); 
                }} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="col-span-full text-center py-16"
            >
              <div className="mx-auto w-32 h-32 flex items-center justify-center mb-6 animate-fade-in">
                {/* SVG Gift Box with Sparkles */}
                <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="16" y="40" width="64" height="40" rx="8" fill="#FDE68A"/>
                  <rect x="28" y="40" width="8" height="40" fill="#F59E42"/>
                  <rect x="60" y="40" width="8" height="40" fill="#F59E42"/>
                  <rect x="16" y="32" width="64" height="16" rx="4" fill="#FBBF24"/>
                  <rect x="44" y="32" width="8" height="48" fill="#F59E42"/>
                  <circle cx="32" cy="32" r="8" fill="#F472B6"/>
                  <circle cx="64" cy="32" r="8" fill="#60A5FA"/>
                  <path d="M24 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#F472B6" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M56 24c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round"/>
                  <g>
                    <circle cx="20" cy="20" r="2" fill="#FBBF24"/>
                    <circle cx="76" cy="20" r="2" fill="#FBBF24"/>
                    <circle cx="48" cy="12" r="2" fill="#FBBF24"/>
                    <circle cx="32" cy="12" r="1.5" fill="#F472B6"/>
                    <circle cx="64" cy="12" r="1.5" fill="#60A5FA"/>
                  </g>
                  <g>
                    <circle cx="24" cy="60" r="2" fill="#F472B6"/>
                    <circle cx="72" cy="60" r="2" fill="#60A5FA"/>
                  </g>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {search
                  ? 'No products found'
                  : selectedCategory === 'COSMETICS'
                    ? 'Something Beautiful is Coming!'
                    : 'No products available'}
              </h3>
              <p className="text-gray-500 mb-4">
                {search
                  ? `No products match "${search}" in ${selectedCategory === 'COSMETICS' ? 'Cosmetics' : 'Hair'} category`
                  : selectedCategory === 'COSMETICS'
                    ? 'Our cosmetics collection is launching soon. Stay tuned for a surprise!'
                    : `No ${selectedCategory.toLowerCase()} products are currently available`}
              </p>
              {search && (
                <button
                  onClick={() => {
                    updateState({ search: '', searchInput: '' });
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center items-center gap-2 mt-12"
          >
            <button
              onClick={() => updateState({ currentPage: Math.max(1, currentPage - 1) })}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => updateState({ currentPage: pageNumber })}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isCurrentPage
                        ? 'bg-black text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => updateState({ currentPage: Math.min(totalPages, currentPage + 1) })}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </motion.div>
        )}

        <ProductDetailDialog
          product={selectedProduct}
          open={detailDialogOpen}
          onOpenChange={(open) => {
            // Keep URL in sync with dialog
            const url = new URL(window.location.href);
            if (open && selectedProductId) {
              url.searchParams.set('id', selectedProductId);
              window.history.pushState({}, '', url);
            } else {
              url.searchParams.delete('id');
              window.history.pushState({}, '', url);
            }
            updateState({ 
              detailDialogOpen: open,
              selectedProductId: open ? selectedProductId : null 
            });
          }}
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