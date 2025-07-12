declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  userInfo: {
    name: string;
    contact: string;
    email: string;
  };
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

// Create order on server using official Razorpay API
export const createOrder = async (amount: number): Promise<string> => {
  try {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`, // Unique receipt ID
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    const data = await response.json();
    return data.orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error; // Don't fallback to fake order ID
  }
};

// Verify payment on server using official Razorpay signature verification
export const verifyPayment = async (response: any): Promise<boolean> => {
  try {
    const verifyResponse = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    if (!verifyResponse.ok) {
      console.warn('Payment verification failed on server');
      return false;
    }

    const data = await verifyResponse.json();
    return data.verified;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};

// Initialize Razorpay payment with Indian cards only
export const initiateRazorpayPayment = async (options: RazorpayOptions): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure Razorpay script is loaded
      if (typeof window === 'undefined' || !window.Razorpay) {
        reject(new Error('Razorpay not loaded'));
        return;
      }

      // Create order on server first
      const total = options.amount;
      const orderId = await createOrder(total);

      const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere',
        amount: Math.round(options.amount * 100), // Convert to paise
        currency: options.currency,
        name: options.name,
        description: options.description,
        order_id: orderId, // Use server-generated order ID
        handler: function (response: any) {
          console.log('Payment successful:', response);
          options.onSuccess(response);
          resolve();
        },
        prefill: {
          name: options.userInfo.name,
          contact: options.userInfo.contact,
          email: options.userInfo.email,
        },
        notes: {
          address: 'Emilio Beaufort Corporate Office',
          merchant_order_id: orderId,
        },
        theme: {
          color: '#B7A16C', // Emilio Beaufort brand color
        },
        modal: {
          ondismiss: function() {
            options.onFailure({ reason: 'cancelled', description: 'Payment was cancelled' });
            reject(new Error('Payment cancelled'));
          }
        },
        // Configure payment options with Indian cards only
        config: {
          display: {
            blocks: {
              // UPI Block
              upi: {
                name: "Pay via UPI",
                instruments: [
                  {
                    method: "upi"
                  }
                ]
              },
              // Cards Block - Indian cards only
              cards: {
                name: "Pay using Indian Cards",
                instruments: [
                  {
                    method: "card",
                    issuers: [
                      // Major Indian Banks
                      "HDFC", "ICICI", "AXIS", "SBI", "KOTAK", "YES", "IDBI", "PNB", "BOB", 
                      "CBI", "UNION", "CANARA", "IOB", "UCO", "PSB", "BANK OF INDIA", 
                      "BANK OF BARODA", "PUNJAB NATIONAL BANK", "INDIAN BANK", 
                      "CENTRAL BANK OF INDIA", "UCO BANK", "BANK OF MAHARASHTRA", 
                      "PUNJAB & SIND BANK", "ANDHRA BANK", "CORPORATION BANK", 
                      "VIJAYA BANK", "DENA BANK", "UNITED BANK OF INDIA", 
                      "ORIENTAL BANK OF COMMERCE", "ALLAHABAD BANK", "SYNDICATE BANK", 
                      "CANARA BANK", "INDIAN OVERSEAS BANK", "IDBI BANK", "UNION BANK OF INDIA",
                      // Additional Indian Banks
                      "FEDERAL BANK", "SOUTH INDIAN BANK", "KARNATAKA BANK", 
                      "KARUR VYSYA BANK", "TAMILNAD MERCANTILE BANK", "CITY UNION BANK",
                      "LAKSHMI VILAS BANK", "DCB BANK", "RBL BANK", "CSB BANK",
                      "DBS BANK INDIA", "CITI BANK", "HSBC", "STANDARD CHARTERED",
                      "DEUTSCHE BANK", "BARCLAYS", "AMERICAN EXPRESS BANK",
                      // Axis Bank variations
                      "UTIB", "AXIS BANK", "AXIS",
                      // Other common bank codes
                      "HDFC BANK", "ICICI BANK", "STATE BANK OF INDIA", "SBI BANK",
                      "PUNJAB NATIONAL BANK", "PNB BANK", "BANK OF BARODA", "BOB BANK",
                      "CANARA BANK", "UNION BANK", "INDIAN BANK", "CENTRAL BANK",
                      "UCO BANK", "BANK OF MAHARASHTRA", "PUNJAB & SIND BANK",
                      "ANDHRA BANK", "CORPORATION BANK", "VIJAYA BANK", "DENA BANK",
                      "UNITED BANK OF INDIA", "ORIENTAL BANK OF COMMERCE", 
                      "ALLAHABAD BANK", "SYNDICATE BANK", "INDIAN OVERSEAS BANK",
                      "IDBI BANK", "FEDERAL BANK", "SOUTH INDIAN BANK", 
                      "KARNATAKA BANK", "KARUR VYSYA BANK", "TAMILNAD MERCANTILE BANK",
                      "CITY UNION BANK", "LAKSHMI VILAS BANK", "DCB BANK", "RBL BANK",
                      "CSB BANK", "DBS BANK", "CITI", "HSBC BANK", "STANDARD CHARTERED BANK",
                      "DEUTSCHE BANK", "BARCLAYS BANK", "AMEX", "AMERICAN EXPRESS"
                    ]
                  }
                ]
              },
              // Net Banking Block
              netbanking: {
                name: "Pay using Net Banking",
                instruments: [
                  {
                    method: "netbanking",
                    banks: ["HDFC", "ICICI", "AXIS", "SBI", "KOTAK", "YES", "IDBI", "PNB", "BOB", "CBI", "UNION", "CANARA", "IOB", "UCO", "PSB", "BANK OF INDIA", "BANK OF BARODA", "PUNJAB NATIONAL BANK", "INDIAN BANK", "CENTRAL BANK OF INDIA", "UCO BANK", "BANK OF MAHARASHTRA", "PUNJAB & SIND BANK", "ANDHRA BANK", "CORPORATION BANK", "VIJAYA BANK", "DENA BANK", "UNITED BANK OF INDIA", "ORIENTAL BANK OF COMMERCE", "ALLAHABAD BANK", "SYNDICATE BANK", "CANARA BANK", "INDIAN OVERSEAS BANK", "IDBI BANK", "UNION BANK OF INDIA"]
                  }
                ]
              },
              // Wallets Block
              wallets: {
                name: "Pay using Wallets",
                instruments: [
                  {
                    method: "wallet",
                    wallets: ["paytm", "phonepe", "amazonpay", "freecharge", "mobikwik", "olamoney", "airtel", "jio", "idea", "vodafone", "bsnl", "mtnl"]
                  }
                ]
              }
            },
            sequence: ["block.upi", "block.cards", "block.netbanking", "block.wallets"],
            preferences: {
              show_default_blocks: true
            }
          }
        }
      };

      const rzp = new window.Razorpay(razorpayOptions);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        options.onFailure(response.error);
        reject(new Error(response.error.description));
      });

      rzp.open();
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      options.onFailure({ reason: 'initialization_failed', description: 'Failed to initialize payment' });
      reject(error);
    }
  });
};

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.head.appendChild(script);
  });
}; 