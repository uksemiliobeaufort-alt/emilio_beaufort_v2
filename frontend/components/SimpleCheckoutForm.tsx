"use client";
import React, { useState } from 'react';
import { X, Check, ChevronRight, ArrowLeft, CreditCard, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';
import { initiateRazorpayPayment, createOrder, verifyPayment } from '@/lib/razorpay';
import { useBag } from './BagContext';

interface SimpleCheckoutFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

type FormStep = 'customer' | 'shipping' | 'review';

interface FormData {
  // Customer Details
  name: string;
  email: string;
  phone: string;
  // Shipping Details
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Additional Notes
  notes: string;
}

export default function SimpleCheckoutForm({ open, onClose }: SimpleCheckoutFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('customer');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { bagItems, clearBag } = useBag();

  if (!open) return null;

  const steps = [
    { id: 'customer', title: 'Customer', shortTitle: 'Details', icon: User },
    { id: 'shipping', title: 'Shipping', shortTitle: 'Address', icon: MapPin },
    { id: 'review', title: 'Review', shortTitle: 'Payment', icon: CreditCard }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep === 'customer') {
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all customer details');
        return;
      }
      // Phone validation: must be exactly 10 digits
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error('Please enter a valid 10 digit phone number');
        return;
      }
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
        toast.error('Please fill in all shipping details');
        return;
      }
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'shipping') setCurrentStep('customer');
    if (currentStep === 'review') setCurrentStep('shipping');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only proceed if we're on the review step and user explicitly clicked Place Order
    if (currentStep !== 'review') {
      return;
    }
    
    setIsProcessingPayment(true);
    
    try {
      const total = bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const orderId = await createOrder(total);
      const orderSummary = bagItems.map(item => `${item.name} (×${item.quantity})`).join(', ');
      
      await initiateRazorpayPayment({
        amount: total,
        currency: 'INR',
        name: 'Emilio Beaufort',
        description: `Order: ${orderSummary}`,
        userInfo: {
          name: formData.name,
          contact: formData.phone,
          email: formData.email,
        },
        onSuccess: async (response: any) => {
          const isVerified = await verifyPayment(response);
          
          if (isVerified) {
            // Log complete order details with customer info
            console.log('Order completed:', {
              orderId,
              paymentId: response.razorpay_payment_id,
              amount: total,
              items: bagItems,
              customer: formData,
              razorpayResponse: response,
              timestamp: new Date().toISOString()
            });

            // Save purchase to Supabase via API
            try {
              const purchaseResponse = await fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  notes: formData.notes,
                  items: bagItems,
                  total
                })
              });

              if (purchaseResponse.ok) {
                const purchaseData = await purchaseResponse.json();
                console.log('Purchase saved to database:', purchaseData);
              } else {
                console.error('Failed to save purchase to database:', await purchaseResponse.text());
              }
            } catch (err) {
              console.error('Failed to save purchase to Supabase:', err);
            }

            toast.success('Order placed successfully!');
            toast.success('You will receive a confirmation shortly.');
            
            clearBag();
            onClose();
            setIsProcessingPayment(false);
            
            // Redirect to products page after success message is shown
            setTimeout(() => {
              window.location.href = '/products';
            }, 2000); // 2 second delay to ensure user sees success message
          } else {
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessingPayment(false);
          }
        },
        onFailure: (error: any) => {
          console.log('Payment failed details:', error);
          
          let errorMessage = 'Payment failed. Please try again.';
          
          if (error?.reason === 'international_transaction_not_allowed' || error?.description?.includes('International cards are not supported')) {
            errorMessage = 'Only Indian cards are supported. Please use an Indian card or UPI.';
            setTimeout(() => {
              toast.info('Try UPI payment or Indian test cards: 4111111111111111 (Visa) or 5555555555554444 (Mastercard)', {
                duration: 8000
              });
            }, 1000);
          } else if (error?.description?.includes('not supported') || error?.reason?.includes('card_not_supported')) {
            errorMessage = 'This card is not supported. Please try UPI, a different card, or net banking.';
            setTimeout(() => {
              toast.info('Recommended: Use UPI (success@razorpay) or try net banking from your bank', {
                duration: 6000
              });
            }, 1000);
          } else if (error?.description) {
            errorMessage = error.description;
          } else if (error?.reason === 'cancelled') {
            errorMessage = 'Payment was cancelled';
            onClose(); // Close the form if user cancels Razorpay
          } else if (error?.reason) {
            errorMessage = error.reason;
          }
          
          toast.error(errorMessage);
          setIsProcessingPayment(false);
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'customer':
        return (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="grid gap-4 sm:gap-5 md:gap-6">
              <div className="col-span-full">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">Phone Number</label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-3 sm:px-4 sm:py-3.5 md:py-4 border border-r-0 border-gray-200 bg-gray-50 text-gray-600 rounded-l-lg text-sm sm:text-base select-none">+91</span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={e => {
                        // Only allow digits, max 10
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 10) val = val.slice(0, 10);
                        setFormData(prev => ({ ...prev, phone: val }));
                      }}
                      className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                      placeholder="1234567890"
                      required
                      inputMode="numeric"
                      pattern="\\d{10}"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5 ml-1">Enter 10 digit mobile number</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="grid gap-4 sm:gap-5 md:gap-6">
              <div className="col-span-full">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                  placeholder="Enter your street address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                    placeholder="Enter your city"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                    placeholder="Enter your state"
                    required
                  />
                </div>
              </div>

              <div className="col-span-full sm:col-span-2 lg:col-span-1">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">PIN Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white"
                  placeholder="Enter PIN code"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
            <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Order Summary</h3>
              <div className="divide-y divide-gray-200">
                {bagItems.map(item => (
                  <div key={item.id} className="py-2.5 sm:py-3 md:py-4 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base md:text-lg truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm md:text-base text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base md:text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="py-2.5 sm:py-3 md:py-4">
                  <div className="flex justify-between items-center font-semibold text-base sm:text-lg md:text-xl text-gray-900">
                    <span>Total</span>
                    <span>₹{bagItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Shipping Details</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-5 text-xs sm:text-sm md:text-base">
                <div>
                  <p className="text-gray-500 font-medium">Name</p>
                  <p className="font-medium text-gray-900 truncate mt-0.5">{formData.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Contact</p>
                  <p className="font-medium text-gray-900 truncate mt-0.5">{formData.phone}</p>
                  <p className="font-medium text-gray-900 truncate">{formData.email}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-gray-500 font-medium">Address</p>
                  <p className="font-medium text-gray-900 break-words mt-0.5">{formData.address}</p>
                  <p className="font-medium text-gray-900">{formData.city}, {formData.state} {formData.pincode}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-3 sm:px-4 sm:py-3.5 md:px-4 md:py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B7A16C] focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-white resize-none"
                placeholder="Any special instructions for delivery?"
                rows={3}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-2 md:p-4 lg:p-6 xl:p-8 overflow-hidden"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white flex flex-col h-auto max-h-[85vh] w-full max-w-none sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto m-0 rounded-none shadow-none sm:rounded-lg md:rounded-xl lg:rounded-2xl sm:shadow-lg md:shadow-xl lg:shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-[#B7A16C] text-white px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 md:py-4 lg:px-8 lg:py-5 flex-shrink-0 w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold">Checkout</h2>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }} 
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <X size={20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 border-b border-gray-200 flex-shrink-0 w-full">
          <div className="flex items-center justify-between w-full">
            {steps.map((step, index) => {
              const currentStepIndex = steps.findIndex(s => s.id === currentStep);
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center flex-1 min-w-0">
                    <div 
                      className={`
                        w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 flex-shrink-0
                        ${currentStep === step.id 
                          ? 'border-[#B7A16C] bg-[#B7A16C] text-white' 
                          : currentStepIndex > index
                          ? 'border-[#B7A16C] bg-[#B7A16C] text-white'
                          : 'border-gray-300 text-gray-500'
                        }
                      `}
                    >
                      {currentStepIndex > index ? (
                        <Check size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      ) : (
                        <step.icon size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                      )}
                    </div>
                    <div className="ml-1.5 sm:ml-2 md:ml-3 min-w-0 flex-1">
                      <span className={`
                        block text-xs sm:text-sm md:text-base font-medium truncate
                        ${currentStep === step.id ? 'text-[#B7A16C]' : 'text-gray-500'}
                      `}>
                        <span className="hidden sm:inline">{step.title}</span>
                        <span className="sm:hidden">{step.shortTitle}</span>
                      </span>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-shrink-0 mx-1 sm:mx-2 md:mx-3">
                      <div className="h-[2px] w-4 sm:w-6 md:w-8 lg:w-12 bg-gray-200">
                        <div 
                          className={`h-full bg-[#B7A16C] transition-all duration-300 
                          ${currentStepIndex > index ? 'w-full' : 'w-0'}`} 
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto p-4 sm:p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 w-full">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-4 sm:pt-5 md:pt-6 w-full">
                {currentStep !== 'customer' && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium w-full sm:w-auto text-sm sm:text-base md:text-lg min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                    disabled={isProcessingPayment}
                  >
                    <ArrowLeft size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    Back
                  </button>
                )}
                {currentStep === 'review' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubmit(e as any);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 bg-[#B7A16C] text-white rounded-lg hover:bg-[#9A8756] transition-colors duration-200 font-medium disabled:opacity-50 w-full sm:w-auto text-sm sm:text-base md:text-lg min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 border-b-2 border-white"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Place Order
                        <CreditCard size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 bg-[#B7A16C] text-white rounded-lg hover:bg-[#9A8756] transition-colors duration-200 font-medium w-full sm:w-auto text-sm sm:text-base md:text-lg min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                    disabled={isProcessingPayment}
                  >
                    Continue
                    <ChevronRight size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 