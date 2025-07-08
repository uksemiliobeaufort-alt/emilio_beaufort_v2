"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Sparkles } from 'lucide-react';

interface CategorySelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onCategorySelect: (category: 'cosmetics' | 'hair-extension') => void;
}

const categories = [
  {
    id: 'cosmetics' as const,
    name: 'Cosmetics',
    description: 'Beauty products, skincare, makeup, and grooming essentials',
    icon: <Sparkles className="h-12 w-12" />,
    gradient: 'from-pink-400 to-purple-600',
    hoverGradient: 'from-pink-500 to-purple-700',
    bgImage: '💄',
  },
  {
    id: 'hair-extension' as const,
    name: 'Hair Extension',
    description: 'Premium hair extensions, wigs, and hair care products',
    icon: <Package className="h-12 w-12" />,
    gradient: 'from-amber-400 to-orange-600',
    hoverGradient: 'from-amber-500 to-orange-700',
    bgImage: '💇‍♀️',
  },
];

export default function CategorySelectionDialog({ 
  open, 
  onClose, 
  onCategorySelect 
}: CategorySelectionDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<'cosmetics' | 'hair-extension' | null>(null);

  const handleCategoryClick = (categoryId: 'cosmetics' | 'hair-extension') => {
    setSelectedCategory(categoryId);
    // Small delay for visual feedback
    setTimeout(() => {
      onCategorySelect(categoryId);
      setSelectedCategory(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Choose Product Category
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select the category for your new product to get started
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                selectedCategory === category.id ? 'scale-95' : ''
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} group-hover:${category.hoverGradient} transition-all duration-300`} />
              
              {/* Background decoration */}
              <div className="absolute top-4 right-4 text-6xl opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
                {category.bgImage}
              </div>

              {/* Content */}
              <div className="relative p-8 h-48 flex flex-col justify-between text-white">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{category.name}</h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-white/90 text-sm leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center space-x-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-1 w-8 bg-white/60 rounded-full" />
                    <span className="text-xs font-medium">Click to select</span>
                  </div>
                </div>

                {/* Selection indicator */}
                {selectedCategory === category.id && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2">
                      <div className="h-6 w-6 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-10 -left-10 h-20 w-20 bg-white/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute top-1/2 right-0 h-32 w-1 bg-gradient-to-b from-transparent via-white/30 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              You can change the category later in the product form
            </p>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 