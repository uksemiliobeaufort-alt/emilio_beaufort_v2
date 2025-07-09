import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import BagModal from './BagModal';

export default function MyBagButton() {
  // For demo, use a static count. Replace with real cart state as needed.
  const [open, setOpen] = useState(false);
  // You can get the real count from the bag context if desired
  // For now, open the modal on click

  return (
    <>
    <button
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#B7A16C] hover:text-black border-2 border-[#B7A16C] transition-all duration-200 text-lg font-semibold"
      onClick={() => setOpen(true)}
    >
      <ShoppingBag className="w-6 h-6" />
      <span>My Bag</span>
    </button>
    <BagModal open={open} onClose={() => setOpen(false)} />
    </>
  );
} 