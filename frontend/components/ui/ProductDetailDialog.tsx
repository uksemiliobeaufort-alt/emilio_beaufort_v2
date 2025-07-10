import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/lib/api";
import { Product as SupabaseProduct, getProducts, isCosmeticsProduct, isHairExtensionsProduct } from "@/lib/supabase";
import Image from "next/image";
import { X, Star, Package, Truck, Shield, ArrowLeft, ArrowRight, Heart, Share2, CheckCircle, XCircle, Info, ShoppingBag, MessageCircle, Sparkles, Award, Clock, Zap } from "lucide-react";
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

  // Properly use the bag context
  let bagContext;
  try {
    bagContext = useBag();
  } catch (error) {
    console.warn('BagContext not available:', error);
    bagContext = null;
  }

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

  // Early return after all hooks
  if (!product) return null;
  
  const images = [detailedProduct?.main_image_url || product.imageUrl, ...(detailedProduct?.gallery_urls || [])].filter(Boolean);

  const handleAddToBag = () => {
    if (product.isSoldOut || !bagContext) return;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
    });
    
    for (let i = 0; i < quantity; i++) {
      bagContext.addToBag({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
      });
    }
    
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => 
        toast.success(`${quantity} × ${product.name} added to bag!`, {
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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-7xl max-h-[98vh] p-0 overflow-hidden rounded-3xl shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-100 md:w-full"
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
                {detailedProduct?.original_price && detailedProduct.original_price > product.price && (
                  <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">
                    <Sparkles className="w-3 h-3 mr-1" />
                    SALE
                  </Badge>
                )}
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
                        <span className="text-5xl lg:text-6xl font-light text-black">
                          {product.price.toLocaleString('en-IN')}
                        </span>
                        {detailedProduct?.original_price && detailedProduct.original_price > product.price && (
                          <div className="flex flex-col items-start">
                            <span className="text-xl text-gray-400 line-through">
                              ₹{detailedProduct.original_price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-red-600 font-semibold">
                              Save ₹{(detailedProduct.original_price - product.price).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Value Propositions */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">All taxes included</span>
                        </div>
                        {product.price > 500 && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                            <Truck className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium">Free delivery</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Product Description */}
                  {(product.description || detailedProduct?.detailed_description) && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-black flex items-center gap-3">
                        <Info className="w-5 h-5 text-gray-600" />
                        About This Product
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {detailedProduct?.detailed_description || product.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Product Specifications */}
                  {detailedProduct && (
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
                          {detailedProduct.sku && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">SKU</span>
                              <span className="text-sm font-bold">{detailedProduct.sku}</span>
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
                          {detailedProduct.ingredients && (
                            <div className="md:col-span-2">
                              <span className="text-sm font-bold text-gray-600 block mb-2">Ingredients</span>
                              <p className="text-sm text-gray-700 leading-relaxed">{detailedProduct.ingredients}</p>
                            </div>
                          )}
                          {detailedProduct.skin_type && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Suitable for</span>
                              <span className="text-sm font-bold">{detailedProduct.skin_type}</span>
                            </div>
                          )}
                          {detailedProduct.volume_size && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Volume</span>
                              <span className="text-sm font-bold">{detailedProduct.volume_size}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {detailedProduct && isHairExtensionsProduct(detailedProduct) && (
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
                          {detailedProduct.hair_length && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Length</span>
                              <span className="text-sm font-bold">{detailedProduct.hair_length}</span>
                            </div>
                          )}
                          {detailedProduct.hair_color_shade && (
                            <div className="flex justify-between py-3 border-b border-gray-100">
                              <span className="text-sm text-gray-600 font-medium">Color</span>
                              <span className="text-sm font-bold">{detailedProduct.hair_color_shade}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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

                      {/* Enhanced Action Buttons */}
                      <div className="space-y-4">
                        <Button
                          onClick={handleAddToBag}
                          disabled={product.isSoldOut}
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
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Free Delivery</span>
                          <span className="text-xs text-gray-600">On orders ₹500+</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Quality Guarantee</span>
                          <span className="text-xs text-gray-600">30-day return policy</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Expert Support</span>
                          <span className="text-xs text-gray-600">Free consultation</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-white" />
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



