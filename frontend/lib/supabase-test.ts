import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Environment variables:', {
    supabaseUrl: supabaseUrl ? 'Set' : 'Not set',
    supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Not set'
  });

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('partnership_inquiries')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('Supabase connection successful');
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Unexpected error testing Supabase:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test function that can be called from browser console
(window as any).testSupabase = testSupabaseConnection; 