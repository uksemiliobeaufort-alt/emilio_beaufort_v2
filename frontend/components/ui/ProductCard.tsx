import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/api";
import { ImageIcon } from "lucide-react";
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

const formatPrice = (price: number) => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleViewDetails = () => {
    onViewDetails?.(product);
  };

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
        </div>

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Product Name */}
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-4xl leading-5 min-h-[2.5rem]">
              {product.name}
            </h3>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 