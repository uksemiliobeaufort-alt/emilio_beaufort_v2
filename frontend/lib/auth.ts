import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with special headers to bypass RLS
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
});

export interface AuthUser {
  id: number;
  password: string;
  created_at: string;
  email: string;
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
      // First, let's see what's in the database
      const { data: allUsers, error: dbError } = await supabase
        .from('admin_user')
        .select('*');

      console.log('Database connection:', {
        url: supabaseUrl,
        hasKey: !!supabaseAnonKey,
        error: dbError,
        tableData: allUsers,
        firstUser: allUsers?.[0] // Log the first user's data
      });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new AuthError('Database connection error');
      }

      if (!allUsers || allUsers.length === 0) {
        console.log('No users found in admin_user table');
        throw new AuthError('Database is empty');
      }

      // First try to find by email only to debug
      const { data: emailCheck, error: emailError } = await supabase
        .from('admin_user')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      console.log('Email check:', {
        foundUser: !!emailCheck,
        error: emailError,
        attemptedEmail: email.toLowerCase().trim(),
        userData: emailCheck // Log the found user data
      });

      if (emailError) {
        console.error('Email check error:', emailError);
        throw new AuthError('Database error occurred');
      }

      // If email exists, try with password
      if (!emailCheck) {
        console.log('No user found with this email');
        throw new AuthError('Invalid email or password');
      }

      // Now check password
      if (emailCheck.password !== password) {
        console.log('Password mismatch:', {
          provided: password,
          stored: emailCheck.password
        });
        throw new AuthError('Invalid email or password');
      }

      const authenticatedUser: AuthUser = {
        id: emailCheck.id,
        password: emailCheck.password,
        created_at: emailCheck.created_at,
        email: emailCheck.email
      };

      auth.user = authenticatedUser;
      
      // Store in session storage with expiry (24 hours)
      const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
      sessionStorage.setItem('user', JSON.stringify({ 
        ...authenticatedUser,
        expiryTime 
      }));
      
      return authenticatedUser;
    } catch (error) {
      console.error('Login process error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('An error occurred during login');
    }
  },

  logout: () => {
    auth.user = null;
    sessionStorage.removeItem('user');
  },

  // Initialize auth state from session storage
  init: () => {
    try {
      const storedData = sessionStorage.getItem('user');
      if (storedData) {
        const { expiryTime, ...userData } = JSON.parse(storedData);
        
        // Check if the session has expired
        if (Date.now() > expiryTime) {
          auth.logout();
          return;
        }

        auth.user = userData;
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      auth.logout();
    }
  },

  // Check if user is authenticated and is an admin
  isAdmin: (): boolean => {
    return !!auth.user?.id;
  }
}; 