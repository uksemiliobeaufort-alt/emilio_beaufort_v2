"use client";
import { useBag } from './BagContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { X } from 'lucide-react';
// import Script from 'next/script'; // Unused import
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';

interface BagModalProps {
  open: boolean;
  onClose: () => void;
  onBuyNow: () => void;
}

export default function BagModal({ open, onClose, onBuyNow }: BagModalProps) {
  const { bagItems, removeFromBag, clearBag, addToBag } = useBag();
  const { user } = useAuth();
  const router = useRouter();
  const [limitMessage, setLimitMessage] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingAddItem, setPendingAddItem] = useState<any>(null);

  // Enhanced handleLimit to receive context
  const handleLimit = (msg?: string, context?: { item: any }) => {
    setLimitMessage(msg || "You've hit the limit for this item. To add more, please purchase the items in your bag first.");
    setPendingAddItem(context?.item || null);
    setShowLimitModal(true);
  };

  // Handler for ignore & add anyway
  const handleIgnoreAndAdd = () => {
    if (pendingAddItem) {
      addToBag(pendingAddItem, undefined, true); // forceAdd = true
    }
    setShowLimitModal(false);
    setPendingAddItem(null);
  };

  // Check authentication before proceeding to checkout
  const handleBuyNow = () => {
    // Check if user is authenticated (with fallback to localStorage)
    const isUserLoggedIn = user || (typeof window !== 'undefined' && localStorage.getItem('authUser'));
    
    console.log('🔍 Bag Buy Now Debug:', {
      user: user,
      localStorageUser: typeof window !== 'undefined' ? localStorage.getItem('authUser') : 'N/A',
      isUserLoggedIn: isUserLoggedIn
    });
    
    if (!isUserLoggedIn) {
      onClose(); // Close the bag modal
      router.push('/auth?from=bag'); // Redirect to auth page
      return;
    }
    onBuyNow();
  };

  if (!open) return null;
  return (
    <>
      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      

      {showLimitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fadeIn text-center">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
              onClick={() => { setShowLimitModal(false); setPendingAddItem(null); }}
              aria-label="Close popup"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-premium">Bag Limit</h3>
            <div className="mb-6 text-premium-dark">You have hit the bag limit.<br />{limitMessage}</div>
            <div className="flex flex-col gap-3 mt-4">
                                <button
                    className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-premium-dark transition mb-2"
                    onClick={() => {
                      setShowLimitModal(false);
                      setPendingAddItem(null);
                      handleBuyNow();
                    }}
                  >
                    Fill Order Form
                  </button>
              <button
                className="w-full bg-gray-100 text-black py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-200 transition"
                onClick={handleIgnoreAndAdd}
              >
                Ignore & Add Anyway
              </button>
              <div className="text-xs text-gray-500 mt-1">Warning: You are bypassing the recommended bag limit. For best experience, please purchase or remove some items first.</div>
            </div>
          </div>
        </div>
      )}
      <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
        <SheetContent
          side="right"
          className="p-0 fixed right-0 top-0 w-full h-full bg-white z-[9999] sm:max-w-[80vw] md:max-w-lg lg:max-w-lg xl:max-w-lg min-h-screen sm:min-h-0 overflow-y-auto transition-all duration-300"
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/90 backdrop-blur shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 hover:scale-110"
            onClick={onClose}
            aria-label="Close bag"
            type="button"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          {/* Hidden accessibility elements */}
          <SheetTitle className="sr-only">
            My Shopping Bag
          </SheetTitle>
          <SheetDescription className="sr-only">
            View and manage items in your shopping bag, update quantities, and proceed to checkout.
          </SheetDescription>
          <div className="px-4 py-6 sm:p-6 md:p-8 lg:p-8 xl:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 text-premium">My Bag</h2>
            {bagItems.length === 0 ? (
              <div className="text-gray-500 text-center py-8 text-base">Your bag is empty.</div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {bagItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      width={60} 
                      height={60} 
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        // Hide the image on error and show a fallback
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // You could also show a fallback icon here
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-premium-dark text-base sm:text-base md:text-lg">{item.name}</div>
                      <div className="text-gray-600 text-xs sm:text-sm md:text-base">₹{item.price.toFixed(2)} x {item.quantity}</div>
                    </div>
                    <button
                      className="text-green-500 hover:text-green-700 text-xs sm:text-sm font-bold px-2 border border-green-500 rounded-full ml-2"
                      onClick={() => addToBag(
                        { id: item.id, name: item.name, imageUrl: item.imageUrl, price: item.price },
                        handleLimit,
                        false
                      )}
                      title="Add one more"
                    >
                      +
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-bold px-2"
                      onClick={() => removeFromBag(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {bagItems.length > 0 && (
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-base sm:text-lg text-premium-dark">
                    Total: ₹{bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full mt-2">
                  <button
                    className="w-full sm:w-auto flex-1 px-4 sm:px-8 py-2 rounded-lg font-bold text-base sm:text-lg mb-2 sm:mb-0"
                    style={{ background: '#000', color: '#fff', border: 'none', outline: 'none', boxShadow: 'none' }}
                    onClick={clearBag}
                  >
                    Clear Bag
                  </button>
                  <button
                    className="w-full sm:w-auto flex-1 px-4 sm:px-8 py-2 rounded-lg font-bold text-base sm:text-lg"
                    style={{ background: '#000', color: '#fff', border: 'none', outline: 'none', boxShadow: 'none' }}
                    onClick={handleBuyNow}
                  >
                    Fill Order Form
                  </button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
}