import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert to WebP (you can tweak quality if needed)
    const webpBuffer = await sharp(inputBuffer).jpgp({ quality: 85 }).toBuffer();

    const fileName = `${crypto.randomUUID()}.jpgp`;
    const filePath = `team-members/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('teammembers')
      .upload(filePath, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from('teammembers').getPublicUrl(filePath);
    const publicUrl = data?.publicUrl ?? '';

    return NextResponse.json({ publicUrl, path: filePath }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


