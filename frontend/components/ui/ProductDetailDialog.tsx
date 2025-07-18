import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/lib/api";
import { supabase } from '@/lib/supabase';
import { Product as SupabaseProduct, getProducts, isCosmeticsProduct, isHairExtensionsProduct } from "@/lib/supabase";
import Image from "next/image";
import { X, Star, Package, Truck, Shield, ArrowLeft, ArrowRight, Heart, Share2, CheckCircle, XCircle, Info, ShoppingBag, MessageCircle, Sparkles, Award, Clock, Zap, Headphones, RotateCcw, Box } from "lucide-react";
import confetti from 'canvas-confetti';
import type { Variant } from "@/lib/supabase";
import { useBag } from '@/components/BagContext';
import { useState, useEffect, useContext } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productCardUtils } from '@/lib/utils';

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
  // State for About This Product see more/less
  const [showFullDescription, setShowFullDescription] = useState(false);
  // State for Care Instructions see more/less
  const [showFullCare, setShowFullCare] = useState(false);
  // State for Beauty Details ingredients see more/less
  const [showFullIngredients, setShowFullIngredients] = useState(false);
  // State for Beauty Details product benefits see more/less
  const [showFullBenefits, setShowFullBenefits] = useState(false);
  // State for showing add-to-bag alert
  const [addedCount, setAddedCount] = useState(0);
  const [showAddedAlert, setShowAddedAlert] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  
  // Properly use the bag context
  let bagContext;
  try {
    bagContext = useBag();
  } catch (error) {
    console.warn('BagContext not available:', error);
    bagContext = null;
  }

  // Fetch detailed product information
// 1. Fetch full product details when product or open changes
useEffect(() => {
  if (!product || !open) return;

  const fetchDetailedProduct = async () => {
    setLoading(true);
    try {
      const products = await getProducts();
      const fullProduct = products.find((p) => p.id === product.id);
      console.log("Product data for dialog:", fullProduct);
      console.log("Image URL:", fullProduct?.main_image_url);
      console.log("Gallery URLs:", fullProduct?.gallery_urls);
      console.log("Mapped product imageUrl:", product.imageUrl);
      setDetailedProduct(fullProduct || null);
    } catch (error) {
      console.error("Failed to fetch detailed product:", error);
      setDetailedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  fetchDetailedProduct();
}, [product, open]);

// 2. Fetch variants when product ID changes
useEffect(() => {
  const fetchVariants = async () => {
    if (!product?.id) return;

    const { data, error } = await supabase
      .from("variants")
      .select("*")
      .eq("product_id", product.id);

    if (error) {
      console.error("Error fetching variants:", error.message);
    } else {
      setVariants(data || []);
      console.log("Fetched variants:", data);
    }
  };

  fetchVariants();
}, [product?.id]);


// ✅ Safe early return — after all hooks
if (!product) return null;

// ✅ Safe image array creation
const images = [
  detailedProduct?.main_image_url || product.imageUrl,
  ...(detailedProduct?.gallery_urls || []),
].filter(Boolean);

// ✅ Add to Bag handler with toast + confetti
const handleAddToBag = (variant: Variant) => {
  if (!bagContext || !detailedProduct) return;

  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.6 },
  });

  setAddedCount((prev) => prev + 1);
  setShowAddedAlert(true);
  setTimeout(() => setShowAddedAlert(false), 2500);

  if (typeof window !== 'undefined') {
    import('sonner').then(({ toast }) =>
      toast.success(`${detailedProduct.name} added to bag!`)
    );
  }

  // Optional: send to context here if needed
  // bagContext.addToBag(...)
};

// ✅ Wishlist toggle handler
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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl md:max-w-6xl lg:max-w-[1100px] max-h-screen p-0 overflow-y-auto rounded-3xl shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-100"
        showCloseButton={false}
      >
        {/* Hidden accessibility elements */}
        <DialogTitle className="sr-only">
          {product.name} - Product Details
        </DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about {product.name}, including price, description, and product specifications.
        </DialogDescription>

        {/* Enhanced Close Button */}
        <button
          className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Enhanced Left Section - Images */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 lg:p-10">
            {/* Enhanced Main Image Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 h-[400px] lg:h-[500px] flex items-center justify-center border border-gray-100">
              {images.length > 0 ? (
                <div className="relative w-full h-full max-w-[350px] lg:max-w-[450px] max-h-[350px] lg:max-h-[450px] flex items-center justify-center p-8">
                  <Image
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-contain transition-transform duration-500 hover:scale-105"
                    priority
                    onError={(e) => {
                      console.error('Failed to load product image:', images[selectedImageIndex]);
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Image not available</p>
                </div>
              )}

              {/* Enhanced Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Enhanced Product Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                {(() => {
                  const hasDiscount = detailedProduct?.original_price && 
                                    detailedProduct.original_price > 0 && 
                                    product.price > 0 && 
                                    product.price < detailedProduct.original_price;
                  return hasDiscount && (
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">
                      <Sparkles className="w-3 h-3 mr-1" />
                      SALE
                    </Badge>
                  );
                })()}
                {detailedProduct?.featured && (
                  <Badge className="bg-gradient-to-r from-black to-gray-800 text-white px-4 py-2 text-sm font-bold shadow-lg">
                    <Award className="w-3 h-3 mr-1" />
                    FEATURED
                  </Badge>
                )}
              </div>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Enhanced Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-gray-800">Product Gallery</p>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 rounded-2xl border-2 overflow-hidden flex-shrink-0 transition-all duration-300 hover:scale-110 ${
                        selectedImageIndex === index 
                          ? 'border-black shadow-xl scale-110' 
                          : 'border-gray-300 hover:border-gray-400 shadow-md'
                      }`}
                    >
                      <Image 
                        src={image} 
                        alt={`${product.name} view ${index + 1}`} 
                        fill 
                        className="object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Right Section - Product Details */}
          <div className="w-full lg:w-1/2 overflow-y-auto max-h-[50vh] lg:max-h-[98vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="p-8 lg:p-10 space-y-8">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-black border-t-transparent"></div>
                  <span className="ml-6 text-gray-600 font-medium text-lg">Loading product details...</span>
                </div>
              ) : (
                <>
                  {/* Enhanced Product Header */}
                  <div className="space-y-6">
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-lg font-bold text-black">
                          Emilio Beaufort
                        </p>
                      </div>
                      <Badge variant="outline" className="text-sm px-4 py-2 border-2 font-semibold">
                        {product.category === 'COSMETICS' ? 'Beauty & Personal Care' : 'Hair Care'}
                      </Badge>
                    </div>

                    {/* Enhanced Product Title */}
                    <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight">
                      {product.name}
                    </h1>

                    {/* Enhanced Product Status */}
                    <div className="flex items-center gap-6">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                        product.isSoldOut 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          product.isSoldOut ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                        <span className="text-sm font-semibold">
                          {product.isSoldOut ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </div>
                      {detailedProduct?.stock_quantity && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{detailedProduct.stock_quantity} available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Price Section */}
                  <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-lg">
                    <div className="space-y-6">
                      {/* Enhanced Price Display */}
                      <div className="flex items-baseline gap-4">
                        <span className="text-lg text-gray-600 font-medium">₹</span>
                        {(() => {
                          // Determine which price to show as main price
                          const hasDiscount = detailedProduct?.original_price && 
                                            detailedProduct.original_price > 0 && 
                                            product.price > 0 && 
                                            product.price < detailedProduct.original_price;
                          
                          const displayPrice = hasDiscount ? product.price : (detailedProduct?.original_price || product.price);
                          
                          return (
                            <>
                              <span className="text-5xl lg:text-6xl font-light text-black">
                                {displayPrice.toLocaleString('en-IN')}
                              </span>
                              {hasDiscount && (
                                <div className="flex flex-col items-start">
                                  <span className="text-xl text-gray-400 line-through">
                                    ₹{detailedProduct.original_price?.toLocaleString('en-IN') ?? ''}
                                  </span>
                                  <span className="text-sm text-red-600 font-semibold">
                                   {detailedProduct.original_price &&
                                   `Save ₹${(detailedProduct.original_price - product.price).toLocaleString('en-IN')}`}
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>

                      {/* Enhanced Value Propositions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">All taxes included</span>
                        </div>
                        {(detailedProduct?.original_price || product.price) > 500 && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                            <Truck className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Free delivery</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Variant section*/}
                  {variants.length > 0 && (
  <div className="my-4">
    <h3 className="text-lg font-semibold mb-2">Select Variant</h3>
    <div className="grid grid-cols-2 gap-2">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => setSelectedVariant(variant)}
          className={`border rounded-md p-3 text-left ${
            selectedVariant?.id === variant.id ? 'border-black bg-gray-100' : 'border-gray-300'
          }`}
        >
          <div>Weight: {variant.weight}g</div>
          <div>Length: {variant.length}cm</div>
          <div>
            ₹ {variant.discount_price ?? variant.price}
            {variant.discount_price && (
              <span className="ml-2 text-sm line-through text-gray-500">
                ₹{variant.price}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  </div>
)}
            
                 <Button
                 onClick={() => selectedVariant && handleAddToBag(selectedVariant)}
                 disabled={!selectedVariant || product.isSoldOut}
                 className="w-full bg-gradient-to-r from-black to-gray-800 text-white h-16 text-lg font-bold rounded-2xl shadow-xl hover:scale-105"
                 >
                  Add to Bag
                 </Button>
                  {/* Enhanced Product Description with See More/Less */}
                  {(product.description || detailedProduct?.detailed_description) && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-black flex items-center gap-3">
                        <Info className="w-5 h-5 text-gray-600" />
                        About This Product
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        {(() => {
                          const desc = detailedProduct?.detailed_description || product.description || '';
                          const words = desc.split(' ');
                          const shouldTruncate = words.length > 40; // Roughly 3-4 lines worth of text
                          const truncatedText = words.slice(0, 40).join(' ');
                          
                          return (
                            <div className="space-y-2">
                              <p className="text-gray-700 leading-relaxed text-base break-words overflow-wrap-anywhere">
                                {showFullDescription || !shouldTruncate ? desc : `${truncatedText}...`}
                              </p>
                              {shouldTruncate && (
                                <button
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm focus:outline-none transition-colors duration-200"
                                  onClick={() => setShowFullDescription(prev => !prev)}
                                >
                                  {showFullDescription ? 'Show Less' : 'Read More'}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Enhanced Product Specifications */}
                  {detailedProduct && (detailedProduct.weight || detailedProduct.dimensions) && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-black flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-600" />
                        Product Details
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {detailedProduct.weight && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Weight</span>
                              <span className="text-sm font-bold">{detailedProduct.weight}g</span>
                            </div>
                          )}
                          {detailedProduct.dimensions && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Dimensions</span>
                              <span className="text-sm font-bold">{detailedProduct.dimensions}</span>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Category-Specific Information */}
                  {detailedProduct && isCosmeticsProduct(detailedProduct) && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-black flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-gray-600" />
                        Beauty Details
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Basic Information Fields */}
                          {detailedProduct.skin_type && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Skin Type</span>
                              <span className="text-sm font-bold break-words overflow-wrap-break-word">{detailedProduct.skin_type}</span>
                            </div>
                          )}
                          {detailedProduct.volume_size && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Volume</span>
                              <span className="text-sm font-bold break-words overflow-wrap-break-word">{detailedProduct.volume_size}</span>
                            </div>
                          )}
                          {detailedProduct.spf_level && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">SPF Level</span>
                              <span className="text-sm font-bold break-words overflow-wrap-break-word">{detailedProduct.spf_level}</span>
                            </div>
                          )}
                          {detailedProduct.weight && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Weight</span>
                              <span className="text-sm font-bold break-words overflow-wrap-break-word">{detailedProduct.weight}g</span>
                            </div>
                          )}
                          {detailedProduct.dimensions && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Dimensions</span>
                              <span className="text-sm font-bold break-words overflow-wrap-break-word">{detailedProduct.dimensions}</span>
                            </div>
                          )}
                          
                          {/* Product Benefits - Long text with read more */}
                          {detailedProduct.product_benefits && (
                            <div className="md:col-span-2 py-3 border-b border-gray-100">
                              <span className="text-sm font-bold text-gray-600 block mb-2">Product Benefits</span>
                              {(() => {
                                const benefits = detailedProduct.product_benefits || '';
                                const words = benefits.split(' ');
                                const shouldTruncate = words.length > 25;
                                const truncatedText = words.slice(0, 25).join(' ');
                                
                                return (
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-700 leading-relaxed break-words overflow-wrap-break-word">
                                      {showFullBenefits || !shouldTruncate ? benefits : `${truncatedText}...`}
                                    </p>
                                    {shouldTruncate && (
                                      <button
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm focus:outline-none transition-colors duration-200"
                                        onClick={() => setShowFullBenefits(prev => !prev)}
                                      >
                                        {showFullBenefits ? 'Show Less' : 'Read More'}
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                          
                          {/* Ingredients - Long text with read more */}
                          {detailedProduct.ingredients && (
                            <div className="md:col-span-2 py-3 border-b border-gray-100">
                              <span className="text-sm font-bold text-gray-600 block mb-2">Ingredients</span>
                              <div className="space-y-2">
                                <p className="text-sm text-gray-700 leading-relaxed break-words overflow-wrap-break-word">
                                  {(() => {
                                    const ingredients = detailedProduct.ingredients || '';
                                    const words = ingredients.split(' ');
                                    const shouldTruncate = words.length > 30;
                                    const truncatedText = words.slice(0, 30).join(' ');
                                    return showFullIngredients || !shouldTruncate ? ingredients : `${truncatedText}...`;
                                  })()}
                                </p>
                                {detailedProduct.ingredients.split(' ').length > 30 && (
                                  <button
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm focus:outline-none transition-colors duration-200"
                                    onClick={() => setShowFullIngredients(prev => !prev)}
                                  >
                                    {showFullIngredients ? 'Show Less' : 'Read More'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {detailedProduct && isHairExtensionsProduct(detailedProduct) && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-black flex items-center gap-3">
                          <Award className="w-5 h-5 text-gray-600" />
                          Hair Details
                        </h3>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {detailedProduct.hair_type && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Hair Type</span>
                                <span className="text-sm font-bold">{detailedProduct.hair_type}</span>
                              </div>
                            )}
                            {detailedProduct.hair_texture && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Hair Texture</span>
                                <span className="text-sm font-bold">{detailedProduct.hair_texture}</span>
                              </div>
                            )}
                            {detailedProduct.hair_length && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Hair Length</span>
                                <span className="text-sm font-bold">{detailedProduct.hair_length}</span>
                              </div>
                            )}
                            {detailedProduct.weight && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Weight</span>
                                <span className="text-sm font-bold">{detailedProduct.weight}g</span>
                              </div>
                            )}
                            {detailedProduct.hair_color_shade && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Color</span>
                                <span className="text-sm font-bold">{detailedProduct.hair_color_shade}</span>
                              </div>
                            )}
                            {detailedProduct.stock_quantity && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Quantity</span>
                                <span className="text-sm font-bold">{detailedProduct.stock_quantity}</span>
                              </div>
                            )}
                            {detailedProduct.installation_method && (
                              <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600 font-medium">Installation Method</span>
                                <span className="text-sm font-bold">{detailedProduct.installation_method}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Care Instructions Section */}
                      {detailedProduct.care_instructions && (
                        <div className="space-y-4 mt-6">
                          <h3 className="text-xl font-bold text-black flex items-center gap-3">
                            <Info className="w-5 h-5 text-gray-600" />
                            Care Instructions
                          </h3>
                          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            {(() => {
                              const care = detailedProduct.care_instructions || '';
                              const words = care.split(' ');
                              const shouldTruncate = words.length > 40; // Roughly 3-4 lines worth of text
                              const truncatedText = words.slice(0, 40).join(' ');
                              
                              return (
                                <div className="space-y-2">
                                  <p className="text-gray-700 leading-relaxed text-base break-words overflow-wrap-anywhere">
                                    {showFullCare || !shouldTruncate ? care : `${truncatedText}...`}
                                  </p>
                                  {shouldTruncate && (
                                    <button
                                      className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm focus:outline-none transition-colors duration-200"
                                      onClick={() => setShowFullCare(prev => !prev)}
                                    >
                                      {showFullCare ? 'Show Less' : 'Read More'}
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Enhanced Purchase Actions */}
                  {showAddToCartButton && (
                    <div className="space-y-8">
                      {/* Enhanced Quantity Selector */}
                      <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <span className="text-lg font-bold text-black">Quantity</span>
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-6 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 font-bold text-lg"
                            disabled={product.isSoldOut}
                          >
                            <span className="text-gray-600">−</span>
                          </button>
                          <span className="px-8 py-3 min-w-[80px] text-center font-bold text-black text-lg bg-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-6 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 font-bold text-lg"
                            disabled={product.isSoldOut}
                          >
                            <span className="text-gray-600">+</span>
                          </button>
                        </div>
                      </div>

                      {/* Added to Bag Alert */}
                      {showAddedAlert && (
                        <div className="w-full mb-2 flex items-center justify-center">
                          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-xl font-semibold text-base shadow-sm animate-fade-in">
                            {addedCount} {addedCount === 1 ? 'product' : 'products'} added to bag
                          </div>
                        </div>
                      )}
                      {/* Enhanced Action Buttons */}
                      <div className="space-y-4">
                        <Button
                        onClick={() => selectedVariant && handleAddToBag(selectedVariant)}
                        disabled={!selectedVariant || product.isSoldOut}
                        className="w-full bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white h-16 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                        >
                       <ShoppingBag className="w-6 h-6 mr-3" />
                       {product.isSoldOut ? 'Currently unavailable' : 'Add to Bag'}
                      </Button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant="outline"
                            onClick={handleWishlist}
                            className="h-14 border-2 border-gray-200 hover:border-black hover:bg-gray-50 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                          >
                            <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            {isWishlisted ? 'Saved' : 'Save'}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-14 border-2 border-gray-200 hover:border-black hover:bg-gray-50 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                          >
                            <Share2 className="w-5 h-5 mr-2 text-gray-600" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Services & Guarantees */}
                  <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl p-8 border border-gray-200 shadow-lg space-y-6">
                    <h3 className="text-xl font-bold text-black flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      Services & Guarantees
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Free Delivery</span>
                          <span className="text-xs text-gray-600">On orders ₹500+</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0">
                          <RotateCcw className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Quality Guarantee</span>
                          <span className="text-xs text-gray-600">30-day return policy</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Headphones className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Expert Support</span>
                          <span className="text-xs text-gray-600">Free consultation</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Box className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Secure Packaging</span>
                          <span className="text-xs text-gray-600">Professional protection</span>
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