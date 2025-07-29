import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { getProducts } from "@/lib/supabase";
import { getHairExtensionsFromFirebase } from "@/lib/firebase";
import { productCardUtils } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState<any>(null);

  // Fetch detailed product information for price logic
  useEffect(() => {
    const fetchDetailedProduct = async () => {
      try {
        // Check if it's a hair extension product
        const category = product.category?.toLowerCase();
        if (category === "hair" || category === "hair-extension") {
          // Fetch from Firebase for hair extensions
          console.log("Fetching hair product from Firebase for card:", product.id);
          const allHairProducts = await getHairExtensionsFromFirebase();
          const hairProduct = allHairProducts.find(p => p.id === product.id);
          console.log("Found hair product in Firebase for card:", hairProduct);
          setDetailedProduct(hairProduct || null);
        } else {
          // Fetch from Supabase for cosmetics
          const products = await getProducts();
          const fullProduct = products.find(p => p.id === product.id);
          setDetailedProduct(fullProduct || null);
        }
      } catch (error) {
        console.error('Failed to fetch detailed product:', error);
        setDetailedProduct(null);
      }
    };

    fetchDetailedProduct();
  }, [product.id]);

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };

  // Determine default variant and price for hair extension products
  const getDefaultVariantPrice = () => {
    if (!detailedProduct || !detailedProduct.variants) {
      return productCardUtils.getDisplayPrice(product, detailedProduct);
    }

    const allVariants = detailedProduct.variants;
    const virginVariants = allVariants.filter((v: any) => v.type === 'virgin');
    const remyVariants = allVariants.filter((v: any) => v.type === 'remy');

    let defaultVariant;
    if (virginVariants.length > 0) {
      // Always prioritize virgin hair variants for pricing
      defaultVariant = virginVariants[0];
    } else if (remyVariants.length > 0) {
      // Only use remy if no virgin variants exist
      defaultVariant = remyVariants[0];
    } else if (allVariants.length > 0) {
      // Fallback to first available variant
      defaultVariant = allVariants[0];
    }

    if (defaultVariant) {
      // Use the default variant's price with enhanced logic
      const variantPriceInfo = productCardUtils.getDisplayPrice(
        { ...product, price: defaultVariant.price, original_price: defaultVariant.original_price },
        { ...detailedProduct, price: defaultVariant.price, original_price: defaultVariant.original_price }
      );
      
      return variantPriceInfo;
    }

    // Fallback to original price logic
    return productCardUtils.getDisplayPrice(product, detailedProduct);
  };

  // Use default variant price logic for hair products, original logic for others
  const priceInfo = product.category?.toLowerCase() === "hair" || product.category?.toLowerCase() === "hair-extension" 
    ? getDefaultVariantPrice() 
    : productCardUtils.getDisplayPrice(product, detailedProduct);

  // Use shared text truncation
  const truncatedName = productCardUtils.truncateProductName(product.name);
  const truncatedDescription = product.description ? productCardUtils.truncateProductDescription(product.description) : '';

  return (
    <Card
      className="group relative bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 hover:border-gray-300 cursor-pointer overflow-hidden rounded-2xl h-full flex flex-col"
      onClick={handleViewDetails}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex items-center justify-center">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-110 p-6"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ImageIcon className="w-20 h-20 text-gray-400" />
            </div>
          )}
          {/* Sale Badge */}
          {priceInfo.hasDiscount && (
            <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse ${
              priceInfo.isSignificantDiscount 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : priceInfo.isModerateDiscount 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-green-500 to-green-600'
            }`}>
              {productCardUtils.formatDiscountPercentage(priceInfo.discountPercentage)}
            </div>
          )}
        </div>
        {/* Content Section - Flex grow to fill available space */}
        <div className="p-6 space-y-3 flex-grow flex flex-col justify-between w-full">
          <div className="space-y-3 w-full">
            {/* Product Name - Word-based truncation */}
            <div className="min-h-[3rem] flex items-start w-full">
              <h3 className={`font-bold text-gray-900 text-lg leading-tight group-hover:text-gray-700 transition-colors duration-300 ${productCardUtils.textWrapClasses} line-clamp-2 w-full`}>
                {truncatedName}
              </h3>
            </div>

            {/* Description - Word-based truncation with flexible height */}
            {product.description && (
              <div className="min-h-[3.5rem] flex items-start w-full">
                <p className={`text-sm text-gray-600 leading-relaxed ${productCardUtils.textWrapClasses} line-clamp-3 w-full`}>
                  {truncatedDescription}
                </p>
              </div>
            )}
          </div>

          {/* Price and Status Section - Always at bottom */}
          <div className="space-y-3 mt-auto pt-2 w-full">
            {/* Price Section */}
            <div className="space-y-1 w-full">
              <div className="flex items-center gap-3 flex-wrap w-full">
                <span className={`text-xl font-bold text-gray-900 ${productCardUtils.textWrapClasses}`}>
                  {productCardUtils.formatPrice(priceInfo.displayPrice)}
                </span>
                {priceInfo.hasDiscount && priceInfo.originalPrice && (
                  <span className={`text-sm text-gray-400 line-through ${productCardUtils.textWrapClasses}`}>
                    {productCardUtils.formatPrice(priceInfo.originalPrice)}
                  </span>
                )}
              </div>
              {priceInfo.hasDiscount && priceInfo.savings > 0 && (
                <div className={`text-xs font-semibold ${productCardUtils.textWrapClasses} w-full ${
                  priceInfo.isSignificantDiscount 
                    ? 'text-red-600' 
                    : priceInfo.isModerateDiscount 
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}>
                  Save {productCardUtils.formatPrice(priceInfo.savings)} ({priceInfo.discountPercentage}% off)
                </div>
              )}
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 w-full">
              <div className={`flex items-center gap-2 text-xs font-medium ${product.isSoldOut ? 'text-red-600' : 'text-green-600'
                } flex-shrink-0`}>
                <div className={`w-2 h-2 rounded-full ${product.isSoldOut ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                <span className={`${productCardUtils.textWrapClasses}`}>
                  {product.isSoldOut ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
              <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap flex-shrink-0">
                View Details →
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// New: ProductListItem for mobile list view
export function ProductListItem({ product, onViewDetails }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [detailedProduct, setDetailedProduct] = useState<any>(null);

  useEffect(() => {
    const fetchDetailedProduct = async () => {
      try {
        // Check if it's a hair extension product
        const category = product.category?.toLowerCase();
        if (category === "hair" || category === "hair-extension") {
          // Fetch from Firebase for hair extensions
          console.log("Fetching hair product from Firebase for list item:", product.id);
          const allHairProducts = await getHairExtensionsFromFirebase();
          const hairProduct = allHairProducts.find(p => p.id === product.id);
          console.log("Found hair product in Firebase for list item:", hairProduct);
          setDetailedProduct(hairProduct || null);
        } else {
          // Fetch from Supabase for cosmetics
          const products = await getProducts();
          const fullProduct = products.find(p => p.id === product.id);
          setDetailedProduct(fullProduct || null);
        }
      } catch (error) {
        console.error('Failed to fetch detailed product for list item:', error);
        setDetailedProduct(null);
      }
    };
    fetchDetailedProduct();
  }, [product.id]);

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };

  // Determine default variant and price for hair extension products (same logic as ProductCard)
  const getDefaultVariantPrice = () => {
    if (!detailedProduct || !detailedProduct.variants) {
      return productCardUtils.getDisplayPrice(product, detailedProduct);
    }

    const allVariants = detailedProduct.variants;
    const virginVariants = allVariants.filter((v: any) => v.type === 'virgin');
    const remyVariants = allVariants.filter((v: any) => v.type === 'remy');

    let defaultVariant;
    if (virginVariants.length > 0) {
      // Always prioritize virgin hair variants for pricing
      defaultVariant = virginVariants[0];
    } else if (remyVariants.length > 0) {
      // Only use remy if no virgin variants exist
      defaultVariant = remyVariants[0];
    } else if (allVariants.length > 0) {
      // Fallback to first available variant
      defaultVariant = allVariants[0];
    }

    if (defaultVariant) {
      // Use the default variant's price with enhanced logic
      const variantPriceInfo = productCardUtils.getDisplayPrice(
        { ...product, price: defaultVariant.price, original_price: defaultVariant.original_price },
        { ...detailedProduct, price: defaultVariant.price, original_price: defaultVariant.original_price }
      );
      
      return variantPriceInfo;
    }

    // Fallback to original price logic
    return productCardUtils.getDisplayPrice(product, detailedProduct);
  };

  // Use default variant price logic for hair products, original logic for others
  const priceInfo = product.category?.toLowerCase() === "hair" || product.category?.toLowerCase() === "hair-extension" 
    ? getDefaultVariantPrice() 
    : productCardUtils.getDisplayPrice(product, detailedProduct);
  const truncatedName = productCardUtils.truncateProductName(product.name);
  const truncatedDescription = product.description ? productCardUtils.truncateProductDescription(product.description) : '';

  return (
    <div
      className="flex items-center gap-4 bg-white rounded-xl shadow-sm border border-gray-200 mb-4 p-3 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleViewDetails}
    >
      <div className="flex-shrink-0 w-20 h-20 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {product.imageUrl && !imageError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="80px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base truncate w-2/3">{truncatedName}</h3>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {product.isSoldOut ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>
        <div className="text-sm text-gray-600 truncate w-full">{truncatedDescription}</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{productCardUtils.formatPrice(priceInfo.displayPrice)}</span>
          {priceInfo.hasDiscount && priceInfo.originalPrice && (
            <span className="text-xs text-gray-400 line-through">{productCardUtils.formatPrice(priceInfo.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
} 