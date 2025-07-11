import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !name || !email || !phone || !address || !city || !state || !pincode || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('purchases')
    .insert([
      {
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
      }
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, data });
} 