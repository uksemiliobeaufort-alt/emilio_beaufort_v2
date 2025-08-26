
import { NextResponse } from 'next/server';

import sharp from 'sharp';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('main_image') as File | null;

    const name = (form.get('name') as string)?.trim() || '';
    const description = (form.get('description') as string)?.trim() || '';
    const detailed_description = (form.get('detailed_description') as string)?.trim() || '';
    const price = Number(form.get('price'));
    const original_price = Number(form.get('original_price'));
    const category = (form.get('category') as string)?.trim() || '';
    const status = (form.get('status') as string)?.trim() || 'draft';
    const featured = form.get('featured') === 'true';
    const in_stock = form.get('in_stock') === 'true';
    const stock_quantity = Number(form.get('stock_quantity'));
    const sku = (form.get('sku') as string)?.trim() || '';
    const weight = (form.get('weight') as string)?.trim() || '';
    const dimensions = (form.get('dimensions') as string)?.trim() || '';
    const seo_title = (form.get('seo_title') as string)?.trim() || '';
    const seo_description = (form.get('seo_description') as string)?.trim() || '';
    const seo_keywords = (form.get('seo_keywords') as string)?.trim() || '';
    const gallery_images = JSON.parse(form.get('gallery_images') as string || '[]'); // Expecting array of URLs

    if (!file) {
      return NextResponse.json({ error: 'Main product image is required' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const optimizedImage = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1200, height: 1200, fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer();

    const fileName = `${crypto.randomUUID()}.webp`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, optimizedImage, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from('products').getPublicUrl(filePath);
    const main_image_url = data?.publicUrl || '';

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('products')
      .insert([
        {
          name,
          description,
          detailed_description,
          price,
          original_price,
          category,
          status,
          featured,
          in_stock,
          stock_quantity,
          sku,
          weight,
          dimensions,
          main_image_url,
          gallery_images,
          seo_title,
          seo_description,
          seo_keywords,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: inserted }, { status: 200 });

  } catch (error: any) {
    console.error('[PRODUCT_POST_ERROR]', error);
    return NextResponse.json({ error: error?.message || 'Something went wrong' }, { status: 500 });
  }
}

