"use client";
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerData {
  // Step 1: Personal Details
  name: string;
  email: string;
  phone: string;
  
  // Step 2: Address Details
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
}

interface MultiStepCheckoutProps {
  open: boolean;
  onClose: () => void;
  onProceedToPayment: (customerData: CustomerData) => void;
  totalAmount: number;
  itemCount: number;
}

export default function MultiStepCheckout({ 
  open, 
  onClose, 
  onProceedToPayment,
  totalAmount,
  itemCount
}: MultiStepCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });
  const [errors, setErrors] = useState<any>({});

  const validateStep1 = () => {
    const newErrors: any = {};

    // Name validation
    if (!customerData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (customerData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(customerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = customerData.phone.replace(/\s+/g, '');
    if (!customerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number (starting with 6-9)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: any = {};

    // Address validation
    if (!customerData.address.line1.trim()) {
      newErrors.address_line1 = 'Address line 1 is required';
    }
    if (!customerData.address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!customerData.address.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    // Pincode validation (Indian 6-digit)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!customerData.address.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!pincodeRegex.test(customerData.address.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        setErrors({});
      } else {
        toast.error('Please fill all required fields correctly');
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        // Proceed to payment
        onProceedToPayment(customerData);
      } else {
        toast.error('Please fill all address details correctly');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const updateField = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCustomerData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setCustomerData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    const errorKey = field.replace('.', '_');
    if (errors[errorKey]) {
      setErrors((prev: any) => ({ ...prev, [errorKey]: '' }));
    }
  };

  if (!open) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent modal from closing when clicking inside
    e.stopPropagation();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close when clicking the backdrop itself
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
            <p className="text-sm text-gray-600">
              {itemCount} item{itemCount > 1 ? 's' : ''} • ₹{totalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 1 ? 'text-green-600' : 'text-gray-500'
              }`}>
                Personal Details
              </span>
            </div>

            {/* Connector */}
            <div className={`flex-1 h-1 mx-4 rounded ${
              currentStep >= 2 ? 'bg-green-500' : 'bg-gray-200'
            }`} />

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 2 ? 'text-green-600' : 'text-gray-500'
              }`}>
                Address Details
              </span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                                 <input
                   type="text"
                   value={customerData.name}
                   onChange={(e) => {
                     e.stopPropagation();
                     updateField('name', e.target.value);
                   }}
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     errors.name ? 'border-red-500' : 'border-gray-300'
                   }`}
                   placeholder="Enter your full name"
                   autoFocus
                 />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                                 <input
                   type="email"
                   value={customerData.email}
                   onChange={(e) => {
                     e.stopPropagation();
                     updateField('email', e.target.value);
                   }}
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     errors.email ? 'border-red-500' : 'border-gray-300'
                   }`}
                   placeholder="Enter your email address"
                 />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                                 <input
                   type="tel"
                   value={customerData.phone}
                   onChange={(e) => {
                     e.stopPropagation();
                     updateField('phone', e.target.value);
                   }}
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     errors.phone ? 'border-red-500' : 'border-gray-300'
                   }`}
                   placeholder="Enter 10-digit mobile number"
                   maxLength={10}
                 />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                <p className="text-xs text-gray-500 mt-1">We'll send order updates via SMS</p>
              </div>
            </div>
          )}

          {/* Step 2: Address Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
              
              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 *
                </label>
                                 <input
                   type="text"
                   value={customerData.address.line1}
                   onChange={(e) => {
                     e.stopPropagation();
                     updateField('address.line1', e.target.value);
                   }}
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     errors.address_line1 ? 'border-red-500' : 'border-gray-300'
                   }`}
                   placeholder="House/Flat/Building Number, Street"
                   autoFocus
                 />
                {errors.address_line1 && <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                                 <input
                   type="text"
                   value={customerData.address.line2}
                   onChange={(e) => {
                     e.stopPropagation();
                     updateField('address.line2', e.target.value);
                   }}
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                   placeholder="Landmark, Area (Optional)"
                 />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                                     <input
                     type="text"
                     value={customerData.address.city}
                     onChange={(e) => {
                       e.stopPropagation();
                       updateField('address.city', e.target.value);
                     }}
                     onClick={(e) => e.stopPropagation()}
                     onFocus={(e) => e.stopPropagation()}
                     className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                       errors.city ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="City"
                   />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                                     <input
                     type="text"
                     value={customerData.address.state}
                     onChange={(e) => {
                       e.stopPropagation();
                       updateField('address.state', e.target.value);
                     }}
                     onClick={(e) => e.stopPropagation()}
                     onFocus={(e) => e.stopPropagation()}
                     className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                       errors.state ? 'border-red-500' : 'border-gray-300'
                     }`}
                     placeholder="State"
                   />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                                 <input
                   type="text"
                   value={customerData.address.pincode}
                   onChange={(e) => {
                     e.stopPropagation();
                     updateField('address.pincode', e.target.value);
                   }}
                   onClick={(e) => e.stopPropagation()}
                   onFocus={(e) => e.stopPropagation()}
                   className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                     errors.pincode ? 'border-red-500' : 'border-gray-300'
                   }`}
                   placeholder="6-digit pincode"
                   maxLength={6}
                 />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={customerData.address.country}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              currentStep === 1 ? onClose() : handleBack();
            }}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {currentStep === 1 ? (
              <X className="w-4 h-4 mr-2" />
            ) : (
              <ChevronLeft className="w-4 h-4 mr-2" />
            )}
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex items-center px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {currentStep === 1 ? 'Next' : 'Proceed to Payment'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
} 