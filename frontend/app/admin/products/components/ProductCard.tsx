import { Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Star, ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
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

const formatPrice = (price?: number) => {
  if (!price) return 'N/A';
  return `₹${price.toLocaleString('en-IN')}`;
};

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300">
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
          className={`absolute top-2 right-2 ${statusColors[product.status]}`}
        >
          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
        </Badge>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description || 'No description available'}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-sm">
              {categoryLabels[product.category]}
            </Badge>
          </div>
          <div className="text-right">
            {product.price ? (
              // Product has a discounted price
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(product.price)}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(product.original_price)}
                </div>
              </div>
            ) : (
              // Product only has original price
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(product.original_price)}
              </div>
            )}
          </div>
        </div>

        {/* Stock Status */}
        {product.stock_quantity !== undefined && product.stock_quantity !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Stock: {product.stock_quantity}
            </span>
            <span className={product.in_stock ? 'text-green-600' : 'text-red-600'}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
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