import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api";
import { Star, ShoppingBag, Eye, ImageIcon, Heart, Share2, Truck } from "lucide-react";
import { useBag } from '@/components/BagContext';
import confetti from 'canvas-confetti';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const categoryLabels = {
  'COSMETICS': 'Beauty & Personal Care',
  'HAIR': 'Hair Care & Extensions'
};

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Safely use the bag context with error handling
  let addToBag;
  try {
    const bagContext = useBag();
    addToBag = bagContext.addToBag;
  } catch (error) {
    console.warn('BagContext not available:', error);
    addToBag = () => {};
  }

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (product.isSoldOut) return;
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'],
    });
    
    addToBag({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
    });
    
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => 
        toast.success(`${product.name} added to bag!`, {
          duration: 3000,
        })
      );
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (typeof window !== 'undefined') {
      import('sonner').then(({ toast }) => 
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
      );
    }
  };

  const rating = 4.2 + Math.random() * 0.6; // Simulated rating between 4.2-4.8
  const reviewCount = Math.floor(Math.random() * 2000) + 100;
  const discount = product.price > 100 ? Math.floor(Math.random() * 30) + 10 : 0;
  const originalPrice = discount > 0 ? Math.floor(product.price * (1 + discount / 100)) : null;

  return (
    <Card 
      className="group relative bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-gray-300 cursor-pointer overflow-hidden"
      onClick={handleViewDetails}
    >
      <CardContent className="p-0">
                 {/* Image Container */}
         <div className="relative aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
           {product.imageUrl && !imageError ? (
             <Image
               src={product.imageUrl}
               alt={product.name}
               fill
               className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
               placeholder="blur"
               blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               onError={() => setImageError(true)}
             />
           ) : (
             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
               <ImageIcon className="w-16 h-16 text-gray-400" />
             </div>
           )}
          
          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white border-0 text-xs font-bold">
                {discount}% OFF
              </Badge>
            )}
            {product.price > 100 && (
              <Badge className="bg-amber-500 text-white border-0 text-xs font-bold">
                PREMIUM
              </Badge>
            )}
          </div>

          {/* Wishlist and Share buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </button>
            <button className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Stock status */}
          <div className="absolute bottom-2 left-2">
            <Badge 
              className={`text-xs font-medium ${
                product.isSoldOut 
                  ? 'bg-red-100 text-red-800 border-red-200' 
                  : 'bg-green-100 text-green-800 border-green-200'
              }`}
            >
              {product.isSoldOut ? 'Out of Stock' : 'In Stock'}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
              {categoryLabels[product.category]}
            </Badge>
            {product.price > 500 && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Truck className="w-3 h-3" />
                <span>Free Delivery</span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-5 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                <Star className="w-3 h-3 fill-current mr-1" />
                {rating.toFixed(1)}
              </div>
              <span className="text-xs text-gray-500">({reviewCount.toLocaleString()})</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              onClick={handleViewDetails}
            >
              <Eye className="w-3 h-3 mr-1" />
              Quick View
            </Button>
            <Button
              size="sm"
              className={`flex-1 h-9 text-xs ${
                product.isSoldOut 
                  ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              onClick={handleAddToBag}
              disabled={product.isSoldOut}
            >
              <ShoppingBag className="w-3 h-3 mr-1" />
              {product.isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 