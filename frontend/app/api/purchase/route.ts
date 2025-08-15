import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendPurchaseEmails } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      personalName,
      email,
      phone,
      businessName,
      gstNumber,
      companyType,
      address,
      city,
      state,
      pincode,
      notes,
      items,
      total
    } = await req.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !personalName || !email || !phone) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate environment variables with detailed logging
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      supabaseUrlLength: supabaseUrl?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables:', {
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'Set' : 'Missing'
      });
      return NextResponse.json({ 
        error: 'Server configuration error - Missing Supabase credentials. Please check .env.local file.',
        details: 'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
      }, { status: 500 });
    }

    // Prepare purchase data with correct database field names from actual schema
    const purchaseData = {
      razorpay_order_id,
      razorpay_payment_id,
      name: personalName, // Using 'name' column as per actual schema
      email: email,
      phone: phone,
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      notes: notes || '',
      items: items || [],
      total: total || 0, // Using 'total' column as per actual schema
      business_name: businessName || '',
      gst_number: gstNumber || '',
      company_type: companyType || '',
      order_status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('Attempting to insert purchase data:', {
      ...purchaseData,
      items: Array.isArray(purchaseData.items) ? `${purchaseData.items.length} items` : 'not array'
    });

    // Insert purchase record into Supabase using admin client with timeout
    const insertPromise = supabaseAdmin
      .from('purchases')
      .insert([purchaseData])
      .select()
      .single();

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database request timeout')), 10000); // 10 second timeout
    });

    const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('Purchase data that failed:', purchaseData);
      return NextResponse.json({ 
        error: 'Failed to save purchase to database',
        details: error.message
      }, { status: 500 });
    }

    console.log('Purchase saved successfully:', {
      purchase_id: data.id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      customer: personalName,
      amount: total
    });

    // Send confirmation emails
    try {
      const emailData = {
        customerName: personalName,
        customerEmail: email,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        total: total || 0,
        items: items || [],
        businessName: businessName || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
        phone: phone || undefined
      };

      const emailResults = await sendPurchaseEmails(emailData);
      
      console.log('Email sending results:', {
        customerEmailSent: emailResults.customerEmailSent,
        adminEmailSent: emailResults.adminEmailSent
      });

      if (!emailResults.customerEmailSent) {
        console.warn('⚠️ Failed to send customer confirmation email');
      }
      if (!emailResults.adminEmailSent) {
        console.warn('⚠️ Failed to send admin notification email');
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation emails:', emailError);
      // Don't fail the purchase if email fails
    }

    return NextResponse.json({ 
      success: true, 
      purchase_id: data.id,
      message: 'Purchase saved successfully and confirmation emails sent' 
    });

  } catch (error) {
    console.error('Purchase API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json({ 
          error: 'Database connection timeout. Please try again.',
          details: error.message
        }, { status: 504 });
      }
      if (error.message.includes('fetch failed')) {
        return NextResponse.json({ 
          error: 'Network connection error. Please check your internet connection and try again.',
          details: error.message
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 