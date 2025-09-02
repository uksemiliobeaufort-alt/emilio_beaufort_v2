import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const memberId = params.id;
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;

    const updates: Record<string, any> = {};
    const setIfPresent = (key: string, value: FormDataEntryValue | null) => {
      if (value !== null && value !== undefined) {
        const str = (value as string).trim();
        updates[key] = str === '' ? null : str;
      }
    };

    setIfPresent('name', form.get('name'));
    setIfPresent('department', form.get('department'));
    setIfPresent('designation', form.get('designation'));
    // description can be empty string intentionally
    if (form.has('description')) {
      const desc = (form.get('description') as string | null) ?? '';
      updates.description = desc;
    }
    setIfPresent('linkedin', form.get('linkedin'));
    setIfPresent('twitter', form.get('twitter'));
    setIfPresent('instagram', form.get('instagram'));

    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
      }
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);
      const webpBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      const fileName = `${crypto.randomUUID()}.webp`;
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
      updates.image_url = data?.publicUrl ?? null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('team_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const memberId = params.id;
    const { error } = await supabaseAdmin.from('team_members').delete().eq('id', memberId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


