import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ 
        error: 'Missing required payment verification fields' 
      }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ 
        error: 'Razorpay secret key not configured' 
      }, { status: 500 });
    }

    // Verify the payment signature using official Razorpay method
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    const isAuthentic = signature === razorpay_signature;

    if (isAuthentic) {
      console.log('Payment verified successfully:', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
      
      return NextResponse.json({ 
        verified: true, 
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });
    } else {
      console.warn('Payment verification failed:', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        expected_signature: signature,
        received_signature: razorpay_signature
      });
      
      return NextResponse.json({ 
        verified: false, 
        message: 'Payment verification failed' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ 
      verified: false, 
      message: 'Payment verification error' 
    }, { status: 500 });
  }
} 