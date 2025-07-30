import { UnifiedProduct } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Star, ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: UnifiedProduct;
  onEdit: (product: UnifiedProduct) => void;
  onDelete: (product: UnifiedProduct) => void;
}

const statusColors = {
  'draft': 'bg-gray-100 text-gray-800 border-gray-200',
  'published': 'bg-green-100 text-green-800 border-green-200',
  'archived': 'bg-red-100 text-red-800 border-red-200'
};

const categoryLabels = {
  'cosmetics': 'Cosmetics',
  'hair-extension': 'Hair Extensions'
};

const formatPrice = (price?: number | string) => {
  if (price === undefined || price === null || price === "") return 'N/A';
  const num = typeof price === 'string' ? Number(price) : price;
  if (isNaN(num)) return 'N/A';
  return `₹${num.toLocaleString('en-IN')}`;
};

const isEmpty = (val: unknown) => val === undefined || val === null || val === '';

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  // Determine which price to show - prioritize virgin hair variants
  let displayPrice: number | string | undefined = product.price;
  let displayOriginalPrice: number | string | undefined = product.original_price;
  
  const hasVariants = Array.isArray((product as any).variants) && (product as any).variants.length > 0;
  const hasRemyVariants = Array.isArray((product as any).remyVariants) && (product as any).remyVariants.length > 0;
  const hasVirginVariants = Array.isArray((product as any).virginVariants) && (product as any).virginVariants.length > 0;
  
  if (isEmpty(displayPrice) && (hasVariants || hasRemyVariants || hasVirginVariants)) {
    // First try to get virgin hair variant
    if (hasVirginVariants) {
      displayPrice = (product as any).virginVariants[0]?.price;
      displayOriginalPrice = (product as any).virginVariants[0]?.original_price || (product as any).virginVariants[0]?.price;
    }
    // If no virgin variants, try remy variants
    else if (hasRemyVariants) {
      displayPrice = (product as any).remyVariants[0]?.price;
      displayOriginalPrice = (product as any).remyVariants[0]?.original_price || (product as any).remyVariants[0]?.price;
    }
    // Fall back to general variants
    else if (hasVariants) {
      displayPrice = (product as any).variants[0]?.price;
      displayOriginalPrice = (product as any).variants[0]?.original_price || (product as any).variants[0]?.price;
    }
  }

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300 h-full flex flex-col">
      {/* Image Section */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {product.main_image_url ? (
          <img
            src={product.main_image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {product.featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
              <Star className="w-3 h-3" /> Featured
            </Badge>
          </div>
        )}
        <Badge 
          className={`absolute top-2 right-2 ${statusColors[product.status as keyof typeof statusColors]}`}
        >
          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description || 'No description available'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <Badge variant="outline" className="text-sm">
              {categoryLabels[product.category as keyof typeof categoryLabels]}
            </Badge>
          </div>
          <div className="text-right">
            {displayPrice && displayOriginalPrice && displayOriginalPrice !== displayPrice ? (
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(displayPrice)}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(displayOriginalPrice)}
                </div>
              </div>
            ) : (
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(displayPrice)}
              </div>
            )}
          </div>
        </div>

        {/* Stock Status */}
        {product.stock_quantity !== undefined && product.stock_quantity !== null && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">
              Stock: {product.stock_quantity}
            </span>
            <span className={product.in_stock ? 'text-green-600' : 'text-red-600'}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        )}

        <div className="flex-1" />
        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
} 