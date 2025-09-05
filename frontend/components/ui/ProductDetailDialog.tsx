import {
  Dialog,
  DialogContent,
  DialogTitle,
  // DialogDescription, // Unused import
} from "@/components/ui/dialog";
import { Product } from "@/lib/api";
import { /* getProducts, */ isCosmeticsProduct, isHairExtensionsProduct, HairExtensionProduct, Cosmetics, UnifiedProduct, VariantType } from "@/lib/supabase";



import Image from "next/image";
import { X, Star, /* Package, */ ArrowLeft, ArrowRight, CheckCircle, Sparkles, Award, /* MessageCircle, */ Info, ShoppingBag, Heart, Share2, Shield, RotateCcw, Headphones, Box, Mail, Phone } from "lucide-react";
import confetti from 'canvas-confetti';
import { useBag } from '@/components/BagContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { productCardUtils } from '@/lib/utils';
import { getHairExtensionById } from "@/lib/firebase";

const hairColorOptions = [
  {
    name: "Natural Black",
    value: "natural-black",
    image: "https://m.media-amazon.com/images/I/616-QJ5oHML._UF1000,1000_QL80_.jpg",
  },
  {
    name: "Dark Brown",
    value: "dark-brown",
    image:
      "https://www.shutterstock.com/image-photo/brown-hair-closeup-background-womens-600nw-2220526961.jpg",
  },
  {
    name: "Medium Brown",
    value: "medium-brown",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUQpHBJjuNF7ggbA-UKOQXcZuhm7s1EGuFdw&s",
  },
  {
    name: "Light Brown",
    value: "light-brown",
    image:
      "https://www.shutterstock.com/image-photo/blond-hair-closeup-background-womens-260nw-2282714539.jpg",
  },
  {
    name: "Auburn",
    value: "auburn",
    image:
      "https://lh3.googleusercontent.com/VT4q6dvB-Bt8jnXQXd1NhZ9i4tpIHmBWKE4g7NUi69vdFmfuSjfJ5cWadyr5pFbOR-IYxYP_IwYN5CsWbOXnwA_VCCOCxEFf3JS_9MCl=w360-rw",
  },
];



// Types
type ColorType = {
  name: string;
  value?: string;
  image?: string;
};





interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showAddToCartButton?: boolean;
}

// Helper function to sanitize text for display
const sanitizeDisplayText = (text: any): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Remove any non-printable characters and encoding artifacts
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  showAddToCartButton = true,
}: ProductDetailDialogProps) {
  const [detailedProduct, setDetailedProduct] = useState<HairExtensionProduct | Cosmetics | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant/Color state
  const [variants, setVariants] = useState<VariantType[]>([]);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullCare, setShowFullCare] = useState(false);
  const [showFullIngredients, setShowFullIngredients] = useState(false);
  const [showFullBenefits, setShowFullBenefits] = useState(false);
  const [showAddedAlert, setShowAddedAlert] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeVariantType, setActiveVariantType] = useState<"remy" | "virgin">("virgin");
  const [allVariants, setAllVariants] = useState<VariantType[]>([]);

  // 1. Add state for selected hair textures
  const [selectedHairTextures, setSelectedHairTextures] = useState<string[]>([]);

  // 2. List of available hair textures
  const hairTextureOptions = [
    { value: 'straight', label: 'Straight' },
    { value: 'body-wave', label: 'Body Wave' },
    { value: 'loose-wave', label: 'Loose Wave' },
    { value: 'deep-wave', label: 'Deep Wave' },
    { value: 'curly', label: 'Curly' },
    { value: 'kinky-curly', label: 'Kinky Curly' },
  ];


  let bagContext;
  try {
    bagContext = useBag();
  } catch {
    bagContext = null;
  }
  // Wishlist handler
  const handleWishlist = () => {
    setIsWishlisted(prev => !prev);
  };

  // Check authentication before adding to bag
  const handleAddToBag = () => {
    if (!product) return;
    if (product.isSoldOut || !bagContext) return;
    
    // Check if user is authenticated (with fallback to localStorage)
    const isUserLoggedIn = user || (typeof window !== 'undefined' && localStorage.getItem('authUser'));
    
    console.log('🔍 Add to Bag Debug:', {
      user: user,
      localStorageUser: typeof window !== 'undefined' ? localStorage.getItem('authUser') : 'N/A',
      isUserLoggedIn: isUserLoggedIn
    });
    
    if (!isUserLoggedIn) {
      // Store product information for automatic addition after login
      const productToAdd = {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: selectedVariant?.price ?? product.price,
        variant: `${selectedVariant?.length} ${selectedVariant?.topper_size}`,
        color: selectedColor?.name,
        quantity: quantity
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingProduct', JSON.stringify(productToAdd));
      }
      
      onOpenChange(false); // Close the product detail dialog
      router.push('/auth?from=products'); // Redirect to auth page
      return;
    }
    
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    const price = selectedVariant?.price ?? product.price;
    for (let i = 0; i < quantity; i++) {
      bagContext.addToBag({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price,
        variant: `${selectedVariant?.length} ${selectedVariant?.topper_size}`,
        color: selectedColor?.name,
      });
    }
    setAddedCount(quantity);
    setShowAddedAlert(true);
    setTimeout(() => setShowAddedAlert(false), 2500);
  };




  useEffect(() => {
    console.log("🧪 Product received in dialog:", product);
    
    const fetchDetailedProduct = async () => {
      if (!product) return;

      const category = product.category?.toLowerCase();
      if (category === "hair" || category === "hair-extension") {
        if (!product.id) {
          console.error("Product ID is missing. Cannot fetch Firebase data.");
          return;
        }
        const hairProduct = await getHairExtensionById(product.id);
        console.log("Fetched from Firebase:", hairProduct);
        if (hairProduct) {
          
          console.log("Fetched hair product from Firebase:", hairProduct);
          setDetailedProduct(hairProduct as HairExtensionProduct);

          // Handle Firebase data structure - check for both possible structures
          const remyVariants = (hairProduct as any).remyVariants || [];
          const virginVariants = (hairProduct as any).virginVariants || [];

          console.log("Remy:", remyVariants);
          console.log("Virgin:", virginVariants);

          const combinedVariants = [
            ...remyVariants.map((v: any) => ({ ...v, type: "remy" as const })), 
            ...virginVariants.map((v: any) => ({ ...v, type: "virgin" as const }))
          ];
          setAllVariants(combinedVariants);

        } else {
          setAllVariants([]);
        }
      } else {
        
        const allProducts = await getProducts();
        const fullProduct = allProducts.find((p: UnifiedProduct) => p.id === product.id);

   
        setDetailedProduct(fullProduct || null);
        setAllVariants((fullProduct as HairExtensionProduct)?.variants || []);
      }
    };

    fetchDetailedProduct();
  }, [product, open]);

  useEffect(() => {
    const filtered = allVariants.filter(v => v.type === activeVariantType);
    setVariants(filtered);
    setSelectedVariantIdx(0); // Reset selected variant when tab changes
  }, [allVariants, activeVariantType]);




  // On variant change: reset color selection to first
  useEffect(() => {
    setSelectedColorIdx(0);
  }, [selectedVariantIdx]);

  if (!product) return null;

  const images = [
    detailedProduct?.main_image_url || product.imageUrl,
    ...(detailedProduct?.gallery_urls || []),
  ].filter(Boolean);

  // Filter variants based on active type (no useEffect needed)
  const currentVariants = allVariants.filter(v => v.type === activeVariantType);
  const currentSelectedVariant = currentVariants[selectedVariantIdx] || currentVariants[0] || ({} as VariantType);

  // Selected variant or fallback to empty object
  const selectedVariant =
    variants[selectedVariantIdx] !== undefined
      ? variants[selectedVariantIdx]
      : ({} as VariantType);

  // Get price info based on selected variant
  const getSelectedVariantPrice = () => {
    try {
      if (!product) {
        console.warn("No product provided to getSelectedVariantPrice");
        return {
          displayPrice: 0,
          hasDiscount: false,
          originalPrice: 0,
          savings: 0
        };
      }

      if (selectedVariant && selectedVariant.price) {
        // Use the selected variant's pricing
        const variantPriceInfo = productCardUtils.getDisplayPrice(
          { 
            ...product, 
            price: selectedVariant.price, 
            original_price: selectedVariant.original_price || selectedVariant.price 
          },
          { 
            ...detailedProduct, 
            price: selectedVariant.price, 
            original_price: selectedVariant.original_price || selectedVariant.price 
          }
        );
        return variantPriceInfo;
      }
      
      // Fallback to product-level pricing
      return productCardUtils.getDisplayPrice(product, detailedProduct);
    } catch (error) {
      console.error("Error in getSelectedVariantPrice:", error);
      // Return a safe fallback
      return {
        displayPrice: product?.price || 0,
        hasDiscount: false,
        originalPrice: product?.price || 0,
        savings: 0
      };
    }
  };

  const selectedVariantPriceInfo = getSelectedVariantPrice();
  
  console.log("Price debugging:", {
    selectedVariant,
    selectedVariantPriceInfo,
    product: product?.price,
    detailedProduct: detailedProduct?.price
  });

  // Create a typed Map for color lookup:
  const colorMap: Record<string, typeof hairColorOptions[0]> = {};
  hairColorOptions.forEach((opt) => {
    if (opt.name) colorMap[opt.name.trim().toLowerCase()] = opt;
    if (opt.value) colorMap[opt.value.trim().toLowerCase()] = opt;
  });

  // Map colors with fallback images
  const mappedColors: ColorType[] =
    selectedVariant?.colors?.map((c) => {
      if (!c.name) return { ...c, image: "", value: "" };
      const key = c.name.trim().toLowerCase();
      const matched = colorMap[key];
      return {
        ...c,
        image: matched?.image || "",
        value: matched?.value || "",
      };
    }) || [];

  const selectedColor =
    mappedColors[selectedColorIdx] !== undefined
      ? mappedColors[selectedColorIdx]
      : ({} as ColorType);

  console.log("Rendering with variants:", variants);


  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-full max-w-4xl md:max-w-6xl lg:max-w-[1100px] max-h-screen p-0 overflow-y-auto
          rounded-3xl shadow-2xl bg-white/95 backdrop-blur-sm border border-gray-100"
        showCloseButton={false}
      >
        {/* Accessibility */}
        <DialogTitle className="sr-only">{product.name} - Product Details</DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about {product.name}, including price, description,
          and product specifications.
        </DialogDescription>

        {/* Close Button */}
        <button
          className="absolute top-6 right-6 z-30 p-3 rounded-full bg-white/90
            backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Layout: Left - Images, Right - Details */}
        <div className="flex flex-col lg:flex-row h-full overflow-hidden">

          {/* Left: Images */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8 lg:p-10">
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden mb-8
              h-[400px] lg:h-[500px] flex items-center justify-center border border-gray-100">
              {images.length > 0 ? (
                <div className="relative w-full h-full max-w-[350px] lg:max-w-[450px] max-h-[350px] lg:max-h-[450px]
                  flex items-center justify-center p-8">
                  {/* Check if the image URL is from Firebase Storage and use regular img tag as fallback */}
                  {images[selectedImageIndex].includes('firebasestorage.googleapis.com') || images[selectedImageIndex].includes('emilio-beaufort.firebasestorage.app') ? (
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        console.error(
                          "Failed to load product image:",
                          images[selectedImageIndex]
                        );
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  ) : (
                    <Image
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-500 hover:scale-105"
                      priority
                      onError={(e) => {
                        console.error(
                          "Failed to load product image:",
                          images[selectedImageIndex]
                        );
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement?.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Image not available</p>
                </div>
              )}

              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        (prev) => (prev > 0 ? prev - 1 : images.length - 1)
                      )
                    }
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl
                      hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        (prev) => (prev < images.length - 1 ? prev + 1 : 0)
                      )
                    }
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl
                      hover:bg-white hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2
                  bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div
            className="w-full lg:w-1/2 overflow-y-auto max-h-[50vh] lg:max-h-[98vh]
                              scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent"
          >
            <div className="p-8 lg:p-10 space-y-8">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-3 border-black border-t-transparent"></div>
                  <span className="ml-6 text-gray-600 font-medium text-lg">
                    Loading product details...
                  </span>
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
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${product.isSoldOut
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${product.isSoldOut ? 'bg-red-500' : 'bg-green-500'
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
                  {/* Price & Tax */}
                  <div
                    className="bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-3xl p-8
                      border border-gray-200 shadow-lg"
                  >
                    <div className="space-y-6">
                      <div className="flex items-baseline gap-4">
                        <span className="text-lg text-gray-600 font-medium">₹</span>
                        <span className="text-5xl lg:text-6xl font-light text-black">
                          {selectedVariantPriceInfo.displayPrice.toLocaleString("en-IN")}
                        </span>
                        {(() => {
                          // Use selected variant price info for discount display
                          if (selectedVariantPriceInfo.hasDiscount) {
                            return (
                              <div className="flex flex-col items-start">
                                <span className="text-xl text-gray-400 line-through">
                                  ₹{selectedVariantPriceInfo.originalPrice.toLocaleString("en-IN")}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-green-600">
                                    Save ₹{selectedVariantPriceInfo.savings.toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full font-bold bg-green-100 text-green-700">
                                    SALE
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium">All taxes included</span>
                    </div>
                  </div>

                  {/* Variant + Color Section */}
                  {detailedProduct &&
                    isHairExtensionsProduct(detailedProduct) &&
                    allVariants.length > 0 && (

                      <div
                        className="mt-6 bg-gradient-to-br from-gray-50 via-white to-gray-100
      rounded-3xl p-8 border border-gray-200 shadow-lg"
                      >
                        {/* Tab Buttons - Only show if both types exist */}
                        {(() => {
                          const remyCount = allVariants.filter(v => v.type === 'remy').length;
                          const virginCount = allVariants.filter(v => v.type === 'virgin').length;
                          const hasBothTypes = remyCount > 0 && virginCount > 0;
                          
                          return hasBothTypes ? (
                            <div className="flex gap-4 mb-6">
                              <button
                                onClick={() => setActiveVariantType("virgin")}
                                className={`px-4 py-2 rounded-t-lg border-b-2 ${activeVariantType === "virgin"
                                    ? "border-black font-semibold"
                                    : "border-transparent text-gray-500"
                                  }`}
                              >
                                Virgin Hair
                              </button>
                              <button
                                onClick={() => setActiveVariantType("remy")}
                                className={`px-4 py-2 rounded-t-lg border-b-2 ${activeVariantType === "remy"
                                    ? "border-black font-semibold"
                                    : "border-transparent text-gray-500"
                                  }`}
                              >
                                Remy Hair
                              </button>
                            </div>
                          ) : null;
                        })()}
                        <div className="space-y-6">
                          {/* Variant Section */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              LENGTH:{" "}
                              <span className="font-semibold">
                                {selectedVariant?.length} Inch{"\u00A0\u00A0"}{selectedVariant?.topper_size}
                              </span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {variants.map((variant, idx) => (
                                <button
                                  type="button"
                                  key={variant.id}
                                  onClick={() => {
                                    setSelectedVariantIdx(idx);
                                  }}
                                  className={`px-4 py-2 border text-sm min-w-[140px] text-center transition-all rounded-sm
                ${idx === selectedVariantIdx
                                      ? "border-black font-semibold bg-white shadow-sm"
                                      : "border-gray-300 bg-white hover:border-black"
                                    }`}
                                >
                                  {variant.length}Inch{"\u00A0"} {variant.topper_size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color Section */}
                          {mappedColors.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                COLOR:{" "}
                                <span className="font-semibold">
                                  {mappedColors[selectedColorIdx]?.name}
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-3">
                                {mappedColors.map((color, idx) => {
                                  const isSelected = idx === selectedColorIdx;
                                  return (
                                    <button
                                      type="button"
                                      key={`${color.value || color.name}-${idx}`}

                                      onClick={() => setSelectedColorIdx(idx)}
                                      className={`w-12 h-12 rounded-full border-4 transition-all duration-200 ${isSelected
                                          ? "border-[#D4AF37] scale-110 shadow-lg"
                                          : "border-gray-300 hover:border-gray-400"
                                        }`}
                                      style={{
                                        backgroundImage: `url(${color.image})`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                      }}
                                      title={color.name}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                  {/* Bulk Order Contact Line */}
                  <div className="text-center py-6">
                    <button
                      onClick={() => setShowContactDialog(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B7A16C] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Sales Team for Bulk Orders
                    </button>
                  </div>

                  {/* Enhanced Product Description with See More/Less */}
                  {(product.description || detailedProduct?.detailed_description) && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-black flex items-center gap-3">
                        <Info className="w-5 h-5 text-gray-600" />
                        About This Product
                      </h3>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        {(() => {
                          const desc = sanitizeDisplayText(detailedProduct?.detailed_description) || sanitizeDisplayText(product.description) || '';
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
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-black flex items-center gap-3">
                          <Award className="w-5 h-5 text-gray-600" />
                          Hair Details
                        </h3>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                          {/* Hair Type Section */}
                          {detailedProduct.hair_type && (
                            <div className="mb-8">
                              <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">Hair Type</span>
                                </div>
                                <span className="text-sm font-bold text-black bg-white px-4 py-2 rounded-lg border border-gray-200">
                                  {sanitizeDisplayText(detailedProduct.hair_type).charAt(0).toUpperCase() + sanitizeDisplayText(detailedProduct.hair_type).slice(1)}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Hair Texture Section */}
                          <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <Award className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">Hair Texture</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {hairTextureOptions.map(option => {
                                const isSelected = selectedHairTextures.includes(option.value);
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setSelectedHairTextures(prev =>
                                        prev.includes(option.value)
                                          ? prev.filter(t => t !== option.value)
                                          : [...prev, option.value]
                                      );
                                    }}
                                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 w-full min-h-[48px] flex items-center justify-center
                                      ${isSelected 
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25' 
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-md'
                                      }`}
                                  >
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                            {/* Selected textures display */}
                            {selectedHairTextures.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {selectedHairTextures.map((texture, idx) => (
                                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                                    {hairTextureOptions.find(opt => opt.value === texture)?.label || texture}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedHairTextures(prev => prev.filter(t => t !== texture))}
                                      className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Installation Method Section - Aligned with Hair Texture */}
                          {detailedProduct.installation_method && (
                            <div className="mb-8">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                  <Package className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Installation Method</span>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <button
                                  type="button"
                                  className="px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 w-full min-h-[48px] flex items-center justify-center bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:shadow-md"
                                >
                                  {sanitizeDisplayText(detailedProduct.installation_method).charAt(0).toUpperCase() + sanitizeDisplayText(detailedProduct.installation_method).slice(1)}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Additional Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {detailedProduct.weight && (
                              <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">Weight</span>
                                </div>
                                <span className="text-sm font-bold text-black bg-white px-4 py-2 rounded-lg border border-gray-200">
                                  {detailedProduct.weight}g
                                </span>
                              </div>
                            )}
                            {detailedProduct.hair_color_shade && (
                              <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                    <Award className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">Color</span>
                                </div>
                                <span className="text-sm font-bold text-black bg-white px-4 py-2 rounded-lg border border-gray-200">
                                  {sanitizeDisplayText(detailedProduct.hair_color_shade).charAt(0).toUpperCase() + sanitizeDisplayText(detailedProduct.hair_color_shade).slice(1)}
                                </span>
                              </div>
                            )}
                            {detailedProduct.stock_quantity && (
                              <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <Box className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="text-sm font-semibold text-gray-700">Quantity</span>
                                </div>
                                <span className="text-sm font-bold text-black bg-white px-4 py-2 rounded-lg border border-gray-200">
                                  {detailedProduct.stock_quantity}
                                </span>
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
                              const care = sanitizeDisplayText(detailedProduct.care_instructions) || '';
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
                      {/* <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-black block text-sm">Free Delivery</span>
                          <span className="text-xs text-gray-600">On orders ₹500+</span>
                        </div>
                      </div> */}

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

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md mx-auto p-6">
          <DialogTitle className="text-xl font-bold text-black mb-4">
            Contact Sales Team
          </DialogTitle>
          <DialogDescription className="text-gray-600 mb-6 text-justify">
            Get in touch with our sales team for bulk orders and special pricing.
          </DialogDescription>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-black block text-sm">Email</span>
                <span className="text-sm text-gray-600">hello@emiliobeaufort.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-[#B7A16C] to-[#D4AF37] rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-black block text-sm">Phone</span>
                <span className="text-sm text-gray-600">+91 8962648358</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Available 24/7
            </p>
          </div>
        </DialogContent>
      </Dialog>


    </Dialog>
  );
}


