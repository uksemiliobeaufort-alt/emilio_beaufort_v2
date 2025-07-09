import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  return (
    <button
      type="button"
      className="w-full text-left focus:outline-none"
      onClick={() => onViewDetails?.(product)}
      style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
    >
      <Card className="overflow-hidden group card-premium bg-white border-premium hover:border-gold shadow-premium text-base">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-premium group-hover:scale-105"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-premium"></div>
          {product.tags && product.tags.length > 0 && (
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
              {product.tags.map((tag, idx) => (
                <Badge key={tag + idx} className="bg-premium-dark text-white border-0 font-sans-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <h3 className="heading-premium text-lg text-premium mb-3 line-clamp-2">
            {product.name}
          </h3>
          <p className="body-premium text-base mb-4 line-clamp-2">
            {product.description}
          </p>
          <p className="text-xl font-sans-semibold text-premium">₹{product.price.toFixed(2)}</p>
        </CardContent>
      </Card>
    </button>
  );
} 