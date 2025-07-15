import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  try {
    const { user_id, event_type, event_data } = await req.json();
    const user_agent = req.headers.get('user-agent') || '';

    if (!user_id || !event_type) {
      return NextResponse.json({ error: 'Missing user_id or event_type' }, { status: 400 });
    }

    const { error } = await supabase.from('activity_events').insert([
      {
        user_id,
        event_type,
        event_data,
        user_agent,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 