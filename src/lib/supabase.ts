import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jbuleoraakjzhtrrvlit.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidWxlb3JhYWtqemh0cnJ2bGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNTc2MTksImV4cCI6MjEwNjgzMzYxOX0.aBCQ9HEMThJOCc6a0fK4qrkdLbEIbFYwAgklnE6UEME';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
