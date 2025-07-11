import { toast } from 'sonner';
import { getImageUrl } from './supabase';

// Razorpay configuration
export const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_your_test_key_here';

// Load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Payment options interface
interface PaymentOptions {
  amount: number;
  currency?: string;
  name: string;
  description: string;
  userInfo?: {
    name?: string;
    contact?: string;
    email?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  onSuccess: (response: any) => void;
  onFailure?: (error: any) => void;
  orderId?: string; // Optional order ID if already created
}

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (options: PaymentOptions) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error('Failed to load payment gateway. Please try again.');
      return;
    }

    // Get favicon from Supabase house bucket
    const supabaseFaviconUrl = getImageUrl('house', 'favicon.ico');

    // Prepare Razorpay options (remove problematic order_id for now)
    const razorpayOptions = {
      key: RAZORPAY_KEY,
      amount: Math.round(options.amount * 100), // Convert to paise
      currency: 'INR', // Indian market only
      name: options.name,
      description: options.description,
      image: supabaseFaviconUrl || '/favicon.ico', // Use Supabase favicon, fallback to local
      handler: function (response: any) {
        // Payment successful
        toast.success('Payment successful!');
        options.onSuccess(response);
      },
      prefill: {
        name: options.userInfo?.name || '',
        contact: options.userInfo?.contact || '',
        email: options.userInfo?.email || '',
      },

      customer_id: null, // Force new customer creation
      // Customer data saving
      save: 1, // Save customer details for future use
      send_sms_hash: true, // Send SMS for mobile verification
      theme: {
        color: '#B7A16C', // Your brand color
      },
      modal: {
        ondismiss: function() {
          toast.info('Payment cancelled');
          if (options.onFailure) {
            options.onFailure({ reason: 'cancelled', description: 'Payment was cancelled by user' });
          }
        }
      },
      retry: {
        enabled: true,
        max_count: 3
      },
      config: {
        display: {
          blocks: {
            card: {
              name: "Credit/Debit Cards",
              instruments: [
                {
                  method: "card"
                  // Removed issuer restrictions to allow all Indian banks
                }
              ]
            },
            upi: {
              name: "UPI",
              instruments: [
                {
                  method: "upi"
                }
              ]
            },
            netbanking: {
              name: "Net Banking",
              instruments: [
                {
                  method: "netbanking",
                  banks: ["HDFC", "ICIC", "SBIN", "UTIB", "KKBK", "YESB", "INDB"] // Major Indian banks
                }
              ]
            },
            wallet: {
              name: "Wallets",
              instruments: [
                {
                  method: "wallet"
                }
              ]
            }
          },
          hide: [],
          sequence: ["block.upi", "block.card", "block.netbanking", "block.wallet"], // UPI first for Indian users
          preferences: {
            show_default_blocks: true
          }
        }
      },
      // Indian market specific settings
      allow_rotation: false,
      remember_customer: true, // Remember for faster checkouts and force customer details
      timeout: 600, // 10 minutes (shorter for better UX)
      readonly: {
        email: false,
        contact: false,
        name: false
      },
      // Additional notes for order tracking
      notes: {
        order_type: 'ecommerce',
        platform: 'web'
      }
    };

    // Create and open Razorpay instance
    const razorpay = new (window as any).Razorpay(razorpayOptions);
    
    razorpay.on('payment.failed', function (response: any) {
      console.log('Payment failed response:', response);
      
      if (options.onFailure) {
        // Handle the error more safely
        const errorData = response?.error || response || { description: 'Payment failed' };
        options.onFailure(errorData);
      } else {
        // Fallback error message if no onFailure handler
        toast.error('Payment failed. Please try again.');
      }
    });

    razorpay.open();
  } catch (error) {
    console.error('Payment initialization error:', error);
    toast.error('Failed to initialize payment. Please try again.');
    if (options.onFailure) {
      options.onFailure(error);
    }
  }
};

// Generate order ID (you can implement backend integration here)
export const createOrder = async (amount: number): Promise<string> => {
  try {
    // Try to create a proper Razorpay order (this would require backend in production)
    // For now, return a mock order ID with proper format
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log order creation for debugging
    console.log('Order created:', {
      amount: amount,
      currency: 'INR',
      orderId: orderId,
      timestamp: new Date().toISOString()
    });
    
    return orderId;
  } catch (error) {
    console.error('Order creation error:', error);
    // Fallback to simple order ID
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Verify payment (should be done on backend)
export const verifyPayment = async (paymentData: any): Promise<boolean> => {
  // In production, send this to your backend for verification
  console.log('Payment data to verify:', paymentData);
  
  // Mock verification for now
  return paymentData.razorpay_payment_id ? true : false;
}; 