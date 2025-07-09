import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/lib/api";
import { Product as SupabaseProduct, getProducts, isCosmeticsProduct, isHairExtensionsProduct } from "@/lib/supabase";
import Image from "next/image";
import { X, Star, Package, Truck, Shield, ArrowLeft, ArrowRight, Heart, Share2, CheckCircle, XCircle, Info, ShoppingBag, MessageCircle } from "lucide-react";
import confetti from 'canvas-confetti';
import { useBag } from '@/components/BagContext';
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showAddToCartButton?: boolean;
}

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center gap-1">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      ))}
      {/* Half star */}
      {hasHalfStar && (
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 opacity-50" />
      )}
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  showAddToCartButton = true,
}: ProductDetailDialogProps) {
  // All useState hooks must be at the top, before any early returns
  const [detailedProduct, setDetailedProduct] = useState<SupabaseProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [bagContextAvailable, setBagContextAvailable] = useState(false);
  const [addToBag, setAddToBag] = useState<(() => void) | ((item: any) => void)>(() => () => {});

  // Fetch detailed product information
  useEffect(() => {
    if (!product || !open) return;

    const fetchDetailedProduct = async () => {
      setLoading(true);
      try {
        const products = await getProducts();
        const fullProduct = products.find(p => p.id === product.id);
        console.log('Product data for dialog:', fullProduct);
        console.log('Image URL:', fullProduct?.main_image_url);
        console.log('Gallery URLs:', fullProduct?.gallery_urls);
        console.log('Mapped product imageUrl:', product.imageUrl);
        setDetailedProduct(fullProduct || null);
      } catch (error) {
        console.error('Failed to fetch detailed product:', error);
        setDetailedProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedProduct();
  }, [product, open]);

  // Safely use the bag context with error handling
  useEffect(() => {
    try {
      const bagContext = useBag();
      setAddToBag(() => bagContext.addToBag);
      setBagContextAvailable(true);
    } catch (error) {
      console.warn('BagContext not available:', error);
      setAddToBag(() => () => {});
      setBagContextAvailable(false);
    }
  }, []);

  // Early return after all hooks
  if (!product) return null;
  
  const images = [detailedProduct?.main_image_url || product.imageUrl, ...(detailedProduct?.gallery_urls || [])].filter(Boolean);

  const handleAddToBag = () => {
    if (product.isSoldOut) return;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
    });
    
    for (let i = 0; i < quantity; i++) {
      addToBag({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
      });
    }
    
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => 
        toast.success(`${quantity} × ${product.name} added to cart!`, {
          duration: 3000,
        })
      );
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => 
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-6xl max-h-[90vh] p-0 overflow-hidden rounded-lg shadow-2xl bg-white md:w-full"
        showCloseButton={false}
      >
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">
          {product.name} - Product Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about {product.name}, including price, description, and product specifications.
        </DialogDescription>

        {/* Close Button */}
        <button
          className="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-1.5 md:p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
        </button>
        
                         <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Section - Images */}
          <div className="w-full lg:w-1/2 bg-gray-50 p-3 md:p-6 flex flex-col min-h-[40vh] lg:min-h-[75vh] justify-center overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
             {/* Main Image */}
             <div className="relative bg-white rounded-lg shadow-sm overflow-hidden mb-4 h-[300px] md:h-[400px] lg:h-[500px] flex justify-center items-center p-4 md:p-8 -mt-32 md:-mt-48 lg:-mt-64">
                                {images.length > 0 ? (
                   <div className="relative w-full h-full max-w-[250px] md:max-w-[350px] lg:max-w-[450px] max-h-[250px] md:max-h-[350px] lg:max-h-[450px] flex items-center justify-center">
                   <Image
                     src={images[selectedImageIndex]}
                     alt={product.name}
                     fill
                     className="object-contain"
                     priority
                     onError={(e) => {
                       console.error('Failed to load product image:', images[selectedImageIndex]);
                       e.currentTarget.style.display = 'none';
                       e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden');
                     }}
                   />
                 </div>
               ) : null}
              
              {/* Fallback */}
              <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${images.length > 0 ? 'hidden' : ''}`}>
                <div className="text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm font-medium break-words px-2">{product.name}</p>
                  <p className="text-gray-400 text-xs mt-1">Image not available</p>
                </div>
              </div>

              {/* Image navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 p-1.5 md:p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1">
                {detailedProduct?.original_price && detailedProduct.original_price > product.price && (
                  <Badge className="bg-red-500 text-white border-0 text-xs font-bold">
                    SALE
                  </Badge>
                )}
                {detailedProduct?.featured && (
                  <Badge className="bg-amber-500 text-white border-0 text-xs font-bold">
                    FEATURED
                  </Badge>
                )}
              </div>
            </div>

            {/* Professional Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-700 mb-2">Product Gallery</p>
                <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-black shadow-md' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Image 
                        src={image} 
                        alt={`${product.name} view ${index + 1}`} 
                        fill 
                        className="object-cover" 
                      />
                      {selectedImageIndex === index && (
                        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-lg"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Product Details */}
          <div className="w-full lg:w-1/2 overflow-y-auto max-h-[50vh] lg:max-h-[90vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 pb-8 md:pb-12 lg:pb-16">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-4 text-gray-600 font-medium">Loading product details...</span>
                </div>
              ) : (
                <>
                  {/* Beauty-Focused Product Header */}
                  <div className="space-y-4 md:space-y-5">
                    {/* Brand & Category */}
                    <div className="border-b border-gray-200 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">
                          Brand: <span className="font-semibold text-black">Emilio Beaufort</span>
                        </p>
                        <Badge variant="outline" className="text-xs font-medium px-3 py-1 text-gray-700 border-gray-300 bg-gray-50 rounded-full">
                          {product.category === 'COSMETICS' ? 'Professional Beauty' : 'Hair Care Essentials'}
                        </Badge>
                      </div>
                      {detailedProduct?.status && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Status: {detailedProduct.status}</span>
                          {detailedProduct.created_at && (
                            <>
                              <span>•</span>
                              <span>Added: {new Date(detailedProduct.created_at).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Title */}
                    <div className="space-y-3">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-black leading-tight break-words tracking-tight">
                        {product.name}
                      </h1>
                      
                      {/* Product Featured Badge */}
                      {detailedProduct?.featured && (
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-black text-white px-3 py-1 text-xs font-medium rounded-full">
                            Featured Product
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${product.isSoldOut ? 'text-red-600' : 'text-green-600'}`}>
                          {product.isSoldOut ? 'Out of Stock' : 'In Stock'}
                        </span>
                        {detailedProduct?.stock_quantity && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                              {detailedProduct.stock_quantity} available
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Credentials */}
                    {detailedProduct && isCosmeticsProduct(detailedProduct) && (detailedProduct.dermatologist_tested || detailedProduct.cruelty_free || detailedProduct.organic_natural) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          {detailedProduct.dermatologist_tested && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-black" />
                              <span className="text-gray-700 font-medium">Dermatologist Tested</span>
                            </div>
                          )}
                          {detailedProduct.cruelty_free && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-black" />
                              <span className="text-gray-700 font-medium">Cruelty Free</span>
                            </div>
                          )}
                          {detailedProduct.organic_natural && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-black" />
                              <span className="text-gray-700 font-medium">Organic & Natural</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Luxury Price Presentation */}
                  <div className="bg-white border border-gray-300 rounded-lg p-5 md:p-6 shadow-sm">
                    <div className="space-y-4">
                      {/* Deal Information */}
                      {detailedProduct?.original_price && detailedProduct.original_price > product.price && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-black text-white px-3 py-1 text-sm font-medium rounded">
                              Special Offer
                            </Badge>
                            <span className="text-xs text-gray-600">Limited time</span>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">
                            Save ₹{detailedProduct.original_price - product.price}
                          </span>
                        </div>
                      )}
                      
                      {/* Main Price Display */}
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-3">
                          <div className="flex items-baseline">
                            <span className="text-sm text-gray-600 font-medium">₹</span>
                            <span className="text-4xl md:text-5xl font-light text-black tracking-tight">
                              {product.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {detailedProduct?.original_price && detailedProduct.original_price > product.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">M.R.P.</span>
                              <span className="text-xl text-gray-400 line-through">
                                ₹{detailedProduct.original_price.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Value Propositions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-black" />
                            <span className="text-gray-700">All taxes included</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-black" />
                            <span className="text-gray-700">Secure packaging</span>
                          </div>
                        </div>
                        
                        {/* Payment Options */}
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">EMI from ₹{Math.floor(product.price / 12)}/month</span>
                            <span className="text-gray-500 ml-1">• No cost EMI available</span>
                          </div>
                        </div>
                        
                        {/* Free Delivery */}
                        {product.price > 500 && (
                          <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                            <Truck className="w-4 h-4 text-black" />
                            <span className="text-black font-medium">Free delivery</span>
                            <span className="text-gray-600">• Express shipping available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Professional Product Information */}
                  <div className="lg:col-span-3 space-y-6 md:space-y-8">
                    {/* About This Product */}
                    {(product.description || detailedProduct?.detailed_description || (detailedProduct && isCosmeticsProduct(detailedProduct) && detailedProduct.product_benefits)) && (
                      <div className="bg-white border border-gray-300 rounded-lg p-5 md:p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-black mb-4 border-b border-gray-200 pb-3">
                          About This Product
                        </h3>
                        
                        {/* Product Benefits */}
                        {detailedProduct && isCosmeticsProduct(detailedProduct) && detailedProduct.product_benefits && (
                          <div className="space-y-4 mb-6">
                            <h4 className="font-medium text-black text-base">Key Benefits</h4>
                            <div className="prose prose-gray max-w-none">
                              <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                                {detailedProduct.product_benefits}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Description */}
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-700 leading-relaxed text-base">
                            {detailedProduct?.detailed_description || product.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Product Specifications */}
                    <div className="bg-white border border-gray-300 rounded-lg p-5 md:p-6 shadow-sm">
                      <h3 className="text-xl font-semibold text-black mb-4 border-b border-gray-200 pb-3">
                        Product Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Category</span>
                            <span className="text-sm text-black">{product.category === 'COSMETICS' ? 'Beauty & Personal Care' : 'Hair Extensions'}</span>
                          </div>
                          {detailedProduct?.weight && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-700">Weight</span>
                              <span className="text-sm text-black">{detailedProduct.weight}g</span>
                            </div>
                          )}
                          {detailedProduct?.dimensions && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-700">Dimensions</span>
                              <span className="text-sm text-black">{detailedProduct.dimensions}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Stock Status</span>
                            <span className={`text-sm font-medium ${product.isSoldOut ? 'text-gray-500' : 'text-black'}`}>
                              {product.isSoldOut ? 'Out of Stock' : 'In Stock'}
                            </span>
                          </div>
                          {detailedProduct?.stock_quantity && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-700">Quantity Available</span>
                              <span className="text-sm text-black">{detailedProduct.stock_quantity} units</span>
                            </div>
                          )}
                          {detailedProduct?.status && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-700">Status</span>
                              <span className="text-sm text-black capitalize">{detailedProduct.status}</span>
                            </div>
                          )}
                          {detailedProduct?.created_at && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm font-medium text-gray-700">Added</span>
                              <span className="text-sm text-black">{new Date(detailedProduct.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cosmetics-Specific Information */}
                    {detailedProduct && isCosmeticsProduct(detailedProduct) && (
                      <div className="bg-white border border-gray-300 rounded-lg p-5 md:p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-black mb-4 border-b border-gray-200 pb-3">
                          Beauty Product Details
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ingredients */}
                            {detailedProduct.ingredients && (
                              <div>
                                <h4 className="font-medium text-black mb-3">Ingredients</h4>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {detailedProduct.ingredients}
                                </p>
                              </div>
                            )}
                            
                            {/* Product Details */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-black mb-3">Product Information</h4>
                              {detailedProduct.skin_type && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Suitable for:</span>
                                  <span className="text-sm text-black">{detailedProduct.skin_type}</span>
                                </div>
                              )}
                              {detailedProduct.volume_size && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Volume:</span>
                                  <span className="text-sm text-black">{detailedProduct.volume_size}</span>
                                </div>
                              )}
                              {detailedProduct.spf_level && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">SPF Level:</span>
                                  <span className="text-sm text-black">{detailedProduct.spf_level}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Special Features */}
                          {(detailedProduct.dermatologist_tested || detailedProduct.cruelty_free || detailedProduct.organic_natural) && (
                            <div className="pt-4 border-t border-gray-200">
                              <h4 className="font-medium text-black mb-3">Special Features</h4>
                              <div className="flex flex-wrap gap-2">
                                {detailedProduct.dermatologist_tested && (
                                  <Badge className="bg-gray-100 text-black px-3 py-1 text-xs">Dermatologist Tested</Badge>
                                )}
                                {detailedProduct.cruelty_free && (
                                  <Badge className="bg-gray-100 text-black px-3 py-1 text-xs">Cruelty Free</Badge>
                                )}
                                {detailedProduct.organic_natural && (
                                  <Badge className="bg-gray-100 text-black px-3 py-1 text-xs">Organic & Natural</Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hair Extensions-Specific Information */}
                    {detailedProduct && isHairExtensionsProduct(detailedProduct) && (
                      <div className="bg-white border border-gray-300 rounded-lg p-5 md:p-6 shadow-sm">
                        <h3 className="text-xl font-semibold text-black mb-4 border-b border-gray-200 pb-3">
                          Hair Extension Details
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Hair Specifications */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-black mb-3">Hair Specifications</h4>
                              {detailedProduct.hair_type && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Hair Type:</span>
                                  <span className="text-sm text-black">{detailedProduct.hair_type}</span>
                                </div>
                              )}
                              {detailedProduct.hair_texture && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Texture:</span>
                                  <span className="text-sm text-black">{detailedProduct.hair_texture}</span>
                                </div>
                              )}
                              {detailedProduct.hair_length && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Length:</span>
                                  <span className="text-sm text-black">{detailedProduct.hair_length}</span>
                                </div>
                              )}
                              {detailedProduct.hair_weight && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Weight:</span>
                                  <span className="text-sm text-black">{detailedProduct.hair_weight}</span>
                                </div>
                              )}
                              {detailedProduct.hair_color_shade && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Color:</span>
                                  <span className="text-sm text-black">{detailedProduct.hair_color_shade}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Application & Care */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-black mb-3">Application & Care</h4>
                              {detailedProduct.installation_method && (
                                <div>
                                  <span className="text-sm text-gray-600 block mb-1">Installation Method:</span>
                                  <p className="text-sm text-black">{detailedProduct.installation_method}</p>
                                </div>
                              )}
                              {detailedProduct.quantity_in_set && (
                                <div className="flex justify-between items-center py-1">
                                  <span className="text-sm text-gray-600">Quantity in Set:</span>
                                  <span className="text-sm text-black">{detailedProduct.quantity_in_set}</span>
                                </div>
                              )}
                              {detailedProduct.care_instructions && (
                                <div>
                                  <span className="text-sm text-gray-600 block mb-1">Care Instructions:</span>
                                  <p className="text-sm text-black leading-relaxed whitespace-pre-wrap">
                                    {detailedProduct.care_instructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professional Purchase Actions */}
                  {showAddToCartButton && (
                    <div className="space-y-4 md:space-y-5">
                      {/* Sample & Trial Options */}
                      <div className="bg-white border border-gray-300 rounded-lg p-4 md:p-5 shadow-sm">
                        <div className="space-y-4">
                          {/* Sample Request */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-700" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-black">Request a sample</span>
                                <p className="text-xs text-gray-600">Try before you buy • Free with any order</p>
                              </div>
                            </div>
                            <Button variant="outline" className="h-8 text-xs px-3 border-gray-300 hover:border-black">
                              Request
                            </Button>
                          </div>
                          
                          {/* Quantity & Size Selection */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-black">Quantity:</span>
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                <button
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                  className="px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-300"
                                  disabled={product.isSoldOut}
                                >
                                  <span className="text-lg font-medium text-gray-600">−</span>
                                </button>
                                <span className="px-6 py-2 min-w-[60px] text-center font-medium text-black">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => setQuantity(quantity + 1)}
                                  className="px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-300"
                                  disabled={product.isSoldOut}
                                >
                                  <span className="text-lg font-medium text-gray-600">+</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Size Options for Hair Extensions */}
                            {product.category === 'HAIR' && (
                              <div className="space-y-2">
                                <span className="text-sm font-medium text-black">Length:</span>
                                <div className="grid grid-cols-4 gap-2">
                                  {['12"', '14"', '16"', '18"'].map((length) => (
                                    <Button
                                      key={length}
                                      variant="outline"
                                      className="h-8 text-xs border-gray-300 hover:border-black hover:bg-gray-50"
                                    >
                                      {length}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Main Purchase Actions */}
                      <div className="bg-white border border-gray-300 rounded-lg p-4 md:p-5 shadow-sm">
                        <div className="space-y-3">
                          {/* Professional Add to Cart */}
                          <Button
                            onClick={handleAddToBag}
                            disabled={product.isSoldOut}
                            className="w-full bg-black hover:bg-gray-800 text-white h-12 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            {product.isSoldOut ? 'Currently unavailable' : 'Add to Professional Cart'}
                          </Button>
                          
                          {/* Expert Consultation */}
                          <Button
                            variant="outline"
                            className="w-full h-12 border-2 border-gray-300 hover:border-black hover:bg-gray-50 text-black font-medium rounded-lg transition-all duration-200"
                          >
                            <MessageCircle className="w-5 h-5 mr-3" />
                            Consult with Beauty Expert
                          </Button>
                          
                          {/* Buy Now with Express */}
                          <Button
                            onClick={() => {
                              handleAddToBag();
                              if (typeof window !== 'undefined') {
                                import('sonner').then(({ toast }) => 
                                  toast.success('Redirecting to express checkout...', { duration: 2000 })
                                );
                              }
                            }}
                            disabled={product.isSoldOut}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-black h-10 text-sm font-medium rounded-lg border border-gray-300 transition-all duration-200"
                          >
                            Express Checkout
                          </Button>
                        </div>
                        
                        {/* Professional Assurance */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex items-center gap-2">
                              <Shield className="w-3 h-3 text-black" />
                              <span className="text-gray-700">Certified authentic</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-black" />
                              <span className="text-gray-700">Quality guaranteed</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Professional beauty products • Shipped by Emilio Beaufort
                          </p>
                        </div>
                      </div>
                      
                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={handleWishlist}
                          className="h-10 border-gray-300 hover:border-black hover:bg-gray-50 transition-all duration-200 rounded-lg text-black"
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isWishlisted ? 'fill-black text-black' : 'text-gray-600'}`} />
                          <span className="font-medium text-sm">{isWishlisted ? 'Saved' : 'Save'}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-10 border-gray-300 hover:border-black hover:bg-gray-50 transition-all duration-200 rounded-lg text-black"
                        >
                          <Share2 className="w-4 h-4 mr-2 text-gray-600" />
                          <span className="font-medium text-sm">Share</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Professional Services & Guarantees */}
                  <div className="bg-white border border-gray-300 rounded-lg p-4 md:p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-black mb-4 border-b border-gray-200 pb-2">
                      Professional Services & Guarantees
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                            <Truck className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-black block">Expert Delivery</span>
                            <span className="text-sm text-gray-600">
                              {product.price > 500 
                                ? "Complimentary professional packaging & delivery" 
                                : `₹50 delivery (FREE on orders ₹500+)`
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <span className="font-medium text-black block">Satisfaction Promise</span>
                            <span className="text-sm text-gray-600">30-day professional guarantee</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <span className="font-medium text-black block">Beauty Consultation</span>
                            <span className="text-sm text-gray-600">Free expert advice & tutorials</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-gray-700" />
                          </div>
                          <div>
                            <span className="font-medium text-black block">Luxury Packaging</span>
                            <span className="text-sm text-gray-600">Professional-grade protective packaging</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



