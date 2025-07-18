import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(req: NextRequest) {
  // Get last 14 days
  const days = 14;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - days + 1);
  const startStr = startDate.toISOString().slice(0, 10);

  // Query daily event counts
  const { data, error } = await supabase.rpc('get_daily_activity_counts', {
    start_date: startStr,
    end_date: today.toISOString().slice(0, 10),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// If the RPC is not available, fallback to a query (for local dev):
// SELECT to_char(created_at, 'YYYY-MM-DD') as date, count(*) as count
// FROM activity_events
// WHERE created_at >= '2024-06-01'
// GROUP BY date
// ORDER BY date ASC; 