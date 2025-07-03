import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface AdminUser {
  id: number;
  email: string;
  created_at: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function verifyCredentials(email: string, password: string): Promise<AdminUser> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookies().set(name, value, options);
        },
        remove(name: string, options: any) {
          cookies().set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: adminUser, error: dbError } = await supabase
    .from('admin_user')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();

  if (dbError) {
    console.error('Database error:', dbError);
    throw new AuthError('Database connection error');
  }

  if (!adminUser) {
    throw new AuthError('Invalid email or password');
  }

  if (adminUser.password !== password) {
    throw new AuthError('Invalid email or password');
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    created_at: adminUser.created_at,
  };
} 