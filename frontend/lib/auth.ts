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
    persistSession: false, // Disable Supabase Auth session management
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Custom session management
class AdminSession {
  private static SESSION_KEY = 'admin_session_v2';
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static create(user: AuthUser): void {
    const session = {
      user,
      timestamp: Date.now(),
      expires: Date.now() + this.SESSION_DURATION
    };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  static get(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.SESSION_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // Check if session has expired
      if (Date.now() > session.expires) {
        this.clear();
        return null;
      }

      return session.user;
    } catch (error) {
      console.warn('Failed to parse admin session:', error);
      this.clear();
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  static isValid(): boolean {
    return this.get() !== null;
  }
}

export const auth = {
  user: null as AuthUser | null,

  login: async (email: string, password: string): Promise<AuthUser> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log('🔐 Attempting admin login for:', normalizedEmail);
      
      // Verify credentials using our database function (real-time check)
      const { data: isValidPassword, error: verifyError } = await supabase
        .rpc('verify_admin_password', {
          user_email: normalizedEmail,
          user_password: password
        });

      if (verifyError) {
        console.error('❌ Password verification error:', verifyError);
        throw new AuthError('Authentication service error');
      }

      if (!isValidPassword) {
        console.log('❌ Invalid credentials for:', normalizedEmail);
        throw new AuthError('Invalid email or password');
      }

      console.log('✅ Credentials verified for:', normalizedEmail);

      // Get admin user details (real-time fetch)
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_user')
        .select('id, email, created_at, last_login, is_active')
        .eq('email', normalizedEmail)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        console.error('❌ Admin user fetch error:', adminError);
        throw new AuthError('Account not found or inactive');
      }

      console.log('✅ Admin user found:', adminUser.email);

      // Update last login time (real-time update)
      const { error: updateError } = await supabase
        .from('admin_user')
        .update({ last_login: new Date().toISOString() })
        .eq('email', normalizedEmail);

      if (updateError) {
        console.warn('⚠️ Failed to update last login:', updateError);
      }

      const authenticatedUser: AuthUser = {
        id: adminUser.id,
        email: adminUser.email,
        created_at: adminUser.created_at,
        last_login: new Date().toISOString()
      };

      // Set user and create session
      auth.user = authenticatedUser;
      AdminSession.create(authenticatedUser);
      
      console.log('🎉 Login successful for:', authenticatedUser.email);
      return authenticatedUser;
    } catch (error) {
      console.error('💥 Login process error:', error);
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError('An error occurred during login');
    }
  },

  logout: async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear our admin session
      auth.user = null;
      AdminSession.clear();
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Always clear local state even if something fails
      auth.user = null;
      AdminSession.clear();
    }
  },

  init: async () => {
    try {
      console.log('🔄 Initializing admin auth...');
      
      // Try to restore from our custom session
      const storedUser = AdminSession.get();
      if (storedUser) {
        console.log('📱 Found stored session for:', storedUser.email);
        
        // Verify user is still active (real-time check)
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_user')
          .select('id, email, created_at, last_login')
          .eq('email', storedUser.email)
          .eq('is_active', true)
          .single();

        if (!adminError && adminUser) {
          auth.user = {
            id: adminUser.id,
            email: adminUser.email,
            created_at: adminUser.created_at,
            last_login: adminUser.last_login
          };
          console.log('✅ Auth initialized from session');
          return;
        } else {
          console.log('❌ Stored user is no longer active');
          AdminSession.clear();
        }
      }

      // No valid session found
      auth.user = null;
      console.log('ℹ️ No valid session found');
      
    } catch (error) {
      console.error('💥 Error initializing auth:', error);
      await auth.logout();
    }
  },

  isAdmin: (): boolean => {
    return !!auth.user?.id;
  },

  // Real-time session validation
  checkSession: async (): Promise<boolean> => {
    try {
      if (!auth.user?.email) {
        return false;
      }

      // Real-time check: verify admin is still active
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_user')
        .select('id')
        .eq('email', auth.user.email)
        .eq('is_active', true)
        .single();

      const isValid = !adminError && !!adminUser;
      
      if (!isValid) {
        console.log('❌ Session invalid, logging out');
        await auth.logout();
      }

      return isValid;
    } catch (error) {
      console.error('❌ Session check error:', error);
      return false;
    }
  },

  // Real-time function to list admin users
  listAdminUsers: async () => {
    try {
      const { data, error } = await supabase.rpc('list_admin_users');
      if (error) {
        console.error('❌ Error listing admin users:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('💥 Error in listAdminUsers:', error);
      return [];
    }
  },

  // Real-time function to get all active admin emails
  getActiveAdminEmails: async (): Promise<string[]> => {
    try {
      const { data: adminUsers, error } = await supabase
        .from('admin_user')
        .select('email')
        .eq('is_active', true)
        .order('created_at');

      if (error) {
        console.error('❌ Error fetching admin emails:', error);
        return [];
      }

      return adminUsers.map(user => user.email);
    } catch (error) {
      console.error('💥 Error in getActiveAdminEmails:', error);
      return [];
    }
  },

  // Function to add new admin user dynamically
  addAdminUser: async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.rpc('create_admin_user_with_password', {
        user_email: email.toLowerCase().trim(),
        user_password: password
      });

      if (error) {
        console.error('❌ Error creating admin user:', error);
        return false;
      }

      console.log('✅ Admin user created:', email);
      return true;
    } catch (error) {
      console.error('💥 Error in addAdminUser:', error);
      return false;
    }
  }
};