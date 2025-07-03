import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzvuuvtckcimzemivltz.supabase.co/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dnV1dnRja2NpbXplbWl2bHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MjY3MzAsImV4cCI6MjA2NzAwMjczMH0.EoYjbK9iNuCxxqh1SEkwgee6PC3ROTMO2-RF5vKVPGI'; // paste your full anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
