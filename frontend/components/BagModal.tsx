"use client";
import { useBag } from './BagContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Script from 'next/script';
import { Sheet, SheetContent, SheetClose } from './ui/sheet';

export default function BagModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { bagItems, removeFromBag, clearBag, addToBag } = useBag();
  const [limitMessage, setLimitMessage] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'debit'>();

  const handleLimit = (msg?: string) => {
    setLimitMessage(msg || "You've hit the limit for this item. To add more, please purchase the items in your bag first.");
    setShowLimitModal(true);
  };

  // Razorpay handler
  const handleRazorpay = () => {
    const total = bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const options = {
      key: 'rzp_test_YourTestKeyHere', // Replace with your Razorpay test key
      amount: Math.round(total * 100), // in paise
      currency: 'INR',
      name: 'Emilio Beaufort',
      description: 'Order Payment',
      handler: function (response: any) {
        alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
        clearBag();
        setShowPayment(false);
        setShowPaymentForm(false);
        setSelectedMethod(undefined);
        onClose();
      },
      prefill: {
        name: userName,
        contact: userPhone,
        email: ''
      },
      theme: {
        color: '#B7A16C'
      }
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userPhone.trim()) {
      setFormError('Please enter your name and phone number.');
      return;
    }
    setFormError('');
    setShowPayment(true);
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
              onClick={() => setShowLimitModal(false)}
              aria-label="Close popup"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-bold mb-4 text-premium">Bag Limit</h3>
            <div className="mb-6 text-premium-dark">You have hit the bag limit.<br />{limitMessage}</div>
            <button
              className="bg-premium text-white px-6 py-2 rounded-lg font-semibold hover:bg-premium-dark transition"
              onClick={() => setShowLimitModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
        <SheetContent side="right" className="p-0 max-w-lg w-full">
          <div className="p-6">
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
                      <div className="text-gray-600 text-sm">₹{item.price.toFixed(2)} x {item.quantity}</div>
                    </div>
                    <button
                      className="text-green-500 hover:text-green-700 text-sm font-bold px-2 border border-green-500 rounded-full ml-2"
                      onClick={() => addToBag(
                        { id: item.id, name: item.name, imageUrl: item.imageUrl, price: item.price },
                        handleLimit
                      )}
                      title="Add one more"
                    >
                      +
                    </button>
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
              <div className="mt-6 flex flex-col gap-2">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-lg text-premium-dark">
                    Total: ₹{bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-4 w-full">
                  <button
                    className="flex-1 px-8 py-2 rounded-lg font-bold text-lg"
                    style={{ background: '#000', color: '#fff', border: 'none', outline: 'none', boxShadow: 'none' }}
                    onClick={clearBag}
                  >
                    Clear Bag
                  </button>
                  <button
                    className="flex-1 px-8 py-2 rounded-lg font-bold text-lg"
                    style={{ background: '#000', color: '#fff', border: 'none', outline: 'none', boxShadow: 'none' }}
                    onClick={() => setShowPaymentForm(true)}
                  >
                    Buy
                  </button>
                </div>
              </div>
            )}
            {showPaymentForm && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative animate-fadeIn text-center">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
                    onClick={() => { setShowPaymentForm(false); setFormError(''); setUserName(''); setUserPhone(''); setSelectedMethod(undefined); setShowPayment(false); }}
                    aria-label="Close popup"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-premium">Checkout</h3>
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-premium"
                      value={userName}
                      onChange={e => setUserName(e.target.value)}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-premium"
                      value={userPhone}
                      onChange={e => setUserPhone(e.target.value)}
                    />
                    {formError && <div className="text-red-500 text-sm">{formError}</div>}
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-2 rounded-lg font-semibold mt-2"
                    >
                      Continue
                    </button>
                  </form>
                  {showPayment && (
                    <div className="mt-6">
                      <h4 className="font-bold mb-2">Select Payment Method</h4>
                      <div className="flex flex-col gap-3">
                        <button
                          className={`w-full py-2 rounded-lg font-semibold border ${selectedMethod === 'razorpay' ? 'bg-premium-dark text-white' : 'bg-gray-100 text-black'}`}
                          onClick={() => setSelectedMethod('razorpay')}
                          type="button"
                        >
                          Razorpay
                        </button>
                        <button
                          className={`w-full py-2 rounded-lg font-semibold border ${selectedMethod === 'debit' ? 'bg-premium-dark text-white' : 'bg-gray-100 text-black'}`}
                          onClick={() => setSelectedMethod('debit')}
                          type="button"
                        >
                          Debit Card
                        </button>
                      </div>
                      {selectedMethod === 'razorpay' && (
                        <button
                          className="w-full bg-black text-white py-2 rounded-lg font-bold mt-4"
                          onClick={handleRazorpay}
                        >
                          Pay with Razorpay
                        </button>
                      )}
                      {selectedMethod === 'debit' && (
                        <div className="mt-4 text-gray-500">Debit Card payment coming soon.</div>
                      )}
                    </div>
                  )}
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