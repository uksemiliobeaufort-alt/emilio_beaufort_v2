import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import BagModal from './BagModal';
import { useBag } from './BagContext';

export default function MyBagButton() {
  const [open, setOpen] = useState(false);
  
  // Get the real bag count from context
  let bagItems = [];
  let totalItems = 0;
  try {
    const { bagItems: items } = useBag();
    bagItems = items;
    totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  } catch (error) {
    // Bag context not available, use empty state
  }

  return (
    <>
    {!open && (
      <button
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
        }}
        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#B7A16C] hover:text-black border-2 border-[#B7A16C] transition-all duration-200 text-lg font-semibold relative hover:shadow-2xl hover:scale-105"
        onClick={() => setOpen(true)}
      >
        <ShoppingBag className="w-6 h-6" />
        <span>My Bag</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    )}
    <BagModal open={open} onClose={() => setOpen(false)} />
    </>
  );
} 