import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    const name = (form.get('name') as string | null)?.trim() || '';
    const department = (form.get('department') as string | null)?.trim() || '';
    const designation = (form.get('designation') as string | null)?.trim() || '';
    const description = (form.get('description') as string | null)?.trim() || '';
    const linkedin = (form.get('linkedin') as string | null)?.trim() || null;
    const twitter = (form.get('twitter') as string | null)?.trim() || null;
    const instagram = (form.get('instagram') as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!name || !department || !designation || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert to WebP and resize to a sensible maximum for avatars
    const webpBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

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

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('team_members')
      .insert([
        {
          name,
          department,
          designation,
          description,
          image_url: publicUrl || null,
          linkedin: linkedin || null,
          twitter: twitter || null,
          instagram: instagram || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: inserted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


