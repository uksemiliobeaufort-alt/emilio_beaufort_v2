import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency, receipt } = await req.json();

    // Validate required fields
    if (!amount || !currency) {
      return NextResponse.json({ 
        error: 'Amount and currency are required' 
      }, { status: 400 });
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ 
        error: 'Razorpay credentials not configured' 
      }, { status: 500 });
    }

    const basicAuth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

    // Create order using official Razorpay API
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount, // in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
        notes: {
          source: 'Emilio Beaufort Website',
          merchant_order_id: `order_${Date.now()}`
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Razorpay API error:', errorData);
      return NextResponse.json({ 
        error: errorData.error?.description || 'Failed to create order' 
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Order created successfully:', data.id);
    
    return NextResponse.json({ 
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 