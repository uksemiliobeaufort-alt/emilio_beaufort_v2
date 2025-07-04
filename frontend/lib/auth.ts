import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export interface AuthUser {
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

export const auth = {
  user: null as AuthUser | null,

  login: async (email: string, password: string): Promise<AuthUser> => {
    try {
      // First, check if the user exists in admin_user table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_user')
        .select('id, email, password, created_at')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (adminError) {
        console.error('Database error:', adminError);
        throw new AuthError('An error occurred during login');
      }

      if (!adminUser) {
        throw new AuthError('Invalid email or password');
      }

      // Compare passwords
      if (adminUser.password !== password) {
        throw new AuthError('Invalid email or password');
      }

      // Sign in with Supabase Auth
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (signInError) {
        console.error('Supabase auth error:', signInError);
        
        // If the user doesn't exist in auth, create them
        if (signInError.message.includes('Invalid login credentials')) {
          const { data: { session: newSession }, error: signUpError } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password: password
          });

          if (signUpError) {
            console.error('Supabase signup error:', signUpError);
            throw new AuthError('Failed to create auth account');
          }

          if (!newSession) {
            throw new AuthError('Failed to create session');
          }
        } else {
          throw new AuthError('Authentication failed');
        }
      }

      const authenticatedUser: AuthUser = {
        id: adminUser.id,
        email: adminUser.email,
        created_at: adminUser.created_at
      };

      auth.user = authenticatedUser;
      return authenticatedUser;
    } catch (error) {
      console.error('Login process error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('An error occurred during login');
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      auth.user = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  init: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        auth.logout();
        return;
      }

      if (session?.user) {
        // Verify the user is still an admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_user')
          .select('id, email, created_at')
          .eq('email', session.user.email)
          .single();

        if (adminError || !adminUser) {
          console.error('Admin verification error:', adminError);
          auth.logout();
          return;
        }

        auth.user = {
          id: adminUser.id,
          email: adminUser.email,
          created_at: adminUser.created_at
        };
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      auth.logout();
    }
  },

  isAdmin: (): boolean => {
    return !!auth.user?.id;
  }
};