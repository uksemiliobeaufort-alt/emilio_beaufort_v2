import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(req: NextRequest) {
  try {
    const { id, category } = await req.json();
    if (!id || !category) {
      return NextResponse.json({ error: 'Missing id or category' }, { status: 400 });
    }

    // Delete from category-specific table first
    const categoryTable = category === 'cosmetics' ? 'cosmetics' : 'hair_extensions';
    const { error: catError } = await supabaseAdmin
      .from(categoryTable)
      .delete()
      .eq('id', id);
    if (catError) {
      return NextResponse.json({ error: catError.message }, { status: 500 });
    }

    // Delete from main products table
    const { error: prodError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    if (prodError) {
      return NextResponse.json({ error: prodError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
} 