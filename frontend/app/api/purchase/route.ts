import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      notes,
      items,
      total
    } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !name || !email || !phone) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Prepare purchase data with exact table field names
    const purchaseData = {
      razorpay_order_id,
      razorpay_payment_id,
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      notes: notes || '',
      items, // Store as JSONB directly
      total,
      created_at: new Date().toISOString()
    };

    // Insert purchase record into Supabase
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error, '\nData:', purchaseData);
      return NextResponse.json({ 
        error: 'Failed to save purchase to database' 
      }, { status: 500 });
    }

    console.log('Purchase saved successfully:', {
      purchase_id: data.id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      customer: name,
      amount: total
    });

    return NextResponse.json({ 
      success: true, 
      purchase_id: data.id,
      message: 'Purchase saved successfully' 
    });

  } catch (error) {
    console.error('Purchase API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 