import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Product } from "@/lib/api";
import Image from "next/image";
import { X, Star, StarHalf } from "lucide-react";
import confetti from 'canvas-confetti';
import { useBag } from '@/components/BagContext';

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showAddToCartButton?: boolean;
}

const USAGE =
  "Apply a small amount to clean, dry skin. Use morning and night for best results.";
const KEY_BENEFITS = [
  "Deeply nourishes and hydrates skin",
  "Improves skin texture and radiance",
];
const INGREDIENTS = [
  "Aloe Vera Extract",
  "Vitamin C",
  "Hyaluronic Acid",
];

function renderStars(rating: number) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      ))}
      {halfStar && (
        <StarHalf className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      )}
      <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
    </div>
  );
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  showAddToCartButton,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const { addToBag } = useBag();
  const rating = 4.5;
  const isBestSeller = product.price > 80;
  const hasFreeShipping = product.price > 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-5xl w-full h-[80vh] p-0 overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-white via-[#f8f6f1] to-[#f3e9d2]"
        showCloseButton={false}
      >
        <div className="flex h-full relative">
          {/* Left - Image */}
          <div className="relative w-1/2 h-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover rounded-l-2xl"
              placeholder="blur"
              blurDataURL="/images/placeholder.jpg"
            />
            {isBestSeller && (
              <span className="absolute top-4 left-4 bg-yellow-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Best Seller
              </span>
            )}
            {hasFreeShipping && (
              <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                Free Shipping
              </span>
            )}
          </div>

          {/* Right - Panel with fixed close button and scrollable content */}
          <div className="w-1/2 h-full flex flex-col relative">
            {/* Manual Close Button - fixed at top right of right panel */}
            <button
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 pt-16 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <h2 className="text-3xl font-bold text-premium-dark">
                {product.name}
              </h2>

              <p className="text-lg text-gray-700">{product.description}</p>

              {renderStars(rating)}

              <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl font-bold text-premium">
                  ₹{product.price.toFixed(2)}
                </span>
                {product.isSoldOut && (
                  <span className="text-red-500 font-semibold">Sold Out</span>
                )}
              </div>

              {showAddToCartButton && (
                <button
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-lg shadow hover:bg-gray-800 transition"
                  onClick={() => {
                    confetti({
                      particleCount: 60,
                      spread: 70,
                      origin: { y: 0.7 },
                      colors: ['#B7A16C', '#fff', '#000'],
                    });
                    // Add to bag
                    addToBag({
                      id: product.id,
                      name: product.name,
                      imageUrl: product.imageUrl,
                      price: product.price,
                    });
                    // Show a toast notification
                    if (typeof window !== 'undefined') {
                      import('sonner').then(({ toast }) => toast.success('Added to Bag!'));
                    }
                  }}
                >
                  Add To Bag
                </button>
              )}

              <hr className="border-t border-gray-200" />

              <div>
                <h3 className="font-semibold text-premium-dark mb-1">Usage</h3>
                <p className="text-gray-600 text-sm">{USAGE}</p>
              </div>

              <hr className="border-t border-gray-200" />

              <div>
                <h3 className="font-semibold text-premium-dark mb-1">
                  Key Benefits
                </h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {KEY_BENEFITS.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <hr className="border-t border-gray-200" />

              <div>
                <h3 className="font-semibold text-premium-dark mb-1">
                  Ingredients
                </h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {INGREDIENTS.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
