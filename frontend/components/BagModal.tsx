"use client";
import { useBag } from './BagContext';
import Image from 'next/image';

export default function BagModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bagItems, removeFromBag, clearBag } = useBag();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-premium">My Bag</h2>
        {bagItems.length === 0 ? (
          <div className="text-gray-500 text-center py-8">Your bag is empty.</div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {bagItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 border-b pb-3">
                <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-premium-dark">{item.name}</div>
                  <div className="text-gray-600 text-sm">${item.price.toFixed(2)} x {item.quantity}</div>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 text-sm font-bold px-2"
                  onClick={() => removeFromBag(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        {bagItems.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              onClick={clearBag}
            >
              Clear Bag
            </button>
            <span className="font-bold text-lg text-premium-dark">
              Total: ${bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </span>
          </div>
        )}
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
} 