import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden group card-premium bg-white border-premium hover:border-gold shadow-premium">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-premium group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-premium"></div>
        {product.category === 'COSMETICS' && (
          <Badge className="absolute top-4 right-4 bg-premium-dark text-white border-0 font-sans-medium">
            {product.category}
          </Badge>
        )}
        {product.category === 'HAIR' && (
          <Badge className="absolute top-4 right-4 bg-gold text-white border-0 font-sans-medium">
            {product.category}
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="heading-premium text-lg text-premium mb-3 line-clamp-2">
          {product.name}
        </h3>
        <p className="body-premium text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <p className="text-xl font-sans-semibold text-premium">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full btn-secondary-premium group-hover:bg-premium-dark group-hover:text-white group-hover:border-premium-dark">
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 