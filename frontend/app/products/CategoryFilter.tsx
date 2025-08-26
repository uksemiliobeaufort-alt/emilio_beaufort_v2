
// components/products/CategoryTabs.tsx

import { RippleButton } from "@/components/ui/RippleButton";



interface CategoryTabsProps {
  selectedCategory: 'COSMETICS' | 'HAIR';
  onSelectCategory: (category: 'COSMETICS' | 'HAIR') => void;
}

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const categories = [
    { value: 'HAIR', label: 'Hair' },
    { value: 'COSMETICS', label: 'Cosmetics' },
  ] as const;

  return (
    <div className="flex justify-center mb-12">
      <div className="flex space-x-4">
        {categories.map((category) => (
          <RippleButton
            key={category.value}
            type="button"
            onClick={() => onSelectCategory(category.value)}
            className={
              (selectedCategory === category.value
                ? 'bg-black text-white shadow-lg scale-105 border-[#B7A16C]'
                : 'bg-white text-black border border-gray-300 hover:border-[#B7A16C] hover:scale-110') +
              ' rounded-full px-6 py-2 font-semibold transition-all duration-200'
            }
          >
            {category.label}
          </RippleButton>
        ))}
      </div>
    </div>
  );
}
