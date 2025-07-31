import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable Supabase Auth session management
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// Debug log to confirm Supabase client is initialized
console.log('✅ Supabase client initialized successfully');

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  permissions?: Record<string, boolean>;
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
      
      // Check if Supabase client is properly initialized
      if (!supabase) {
        console.error('❌ Supabase client is not initialized');
        throw new AuthError('Authentication service unavailable');
      }
      
      // Verify credentials using our database function (real-time check)
      console.log('🔍 Calling verify_admin_password_plain_text RPC...');
      const { data: isValidPassword, error: verifyError } = await supabase
        .rpc('verify_admin_password_plain_text', {
          user_email: normalizedEmail,
          user_password: password
        });

      console.log('📋 RPC result:', { isValidPassword, verifyError });

      if (verifyError) {
        console.error('❌ Password verification error:', verifyError);
        console.error('❌ Error details:', JSON.stringify(verifyError, null, 2));
        throw new AuthError(`Authentication service error: ${verifyError.message || 'Unknown error'}`);
      }

      if (!isValidPassword) {
        console.log('❌ Invalid credentials for:', normalizedEmail);
        throw new AuthError('Invalid email or password');
      }

      console.log('✅ Credentials verified for:', normalizedEmail);

      // Get admin user details (real-time fetch)
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_user')
        .select('id, email, role, first_name, last_name, department, permissions, created_at, is_active')
        .eq('email', normalizedEmail)
        .eq('is_active', true)
        .single();

      if (adminError || !adminUser) {
        console.error('❌ Admin user fetch error:', adminError);
        throw new AuthError('Account not found or inactive');
      }

      console.log('✅ Admin user found:', adminUser.email);

      // Note: last_login column doesn't exist in your table structure
      // Skipping last login update

      const authenticatedUser: AuthUser = {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        department: adminUser.department,
        permissions: adminUser.permissions || {},
        created_at: adminUser.created_at,
        last_login: new Date().toISOString()
      };

      // Set user and create session
      auth.user = authenticatedUser;
      AdminSession.create(authenticatedUser);
      
      // Update last login timestamp
      await auth.updateLastLogin();
      
      console.log('🎉 Login successful for:', authenticatedUser.email);
      return authenticatedUser;
    } catch (error) {
      console.error('💥 Login process error:', error);
      
      // If it's already an AuthError, throw it as-is
      if (error instanceof AuthError) {
        throw error;
      }
      
      // Handle different types of errors
      if (error instanceof Error) {
        console.error('💥 Error name:', error.name);
        console.error('💥 Error message:', error.message);
        console.error('💥 Error stack:', error.stack);
        
        // Check for specific error types
        if (error.message.includes('fetch')) {
          throw new AuthError('Network error: Unable to connect to authentication service');
        } else if (error.message.includes('JSON')) {
          throw new AuthError('Data format error: Invalid response from authentication service');
        } else if (error.message.includes('timeout')) {
          throw new AuthError('Timeout error: Authentication service is taking too long to respond');
        }
        
        throw new AuthError(`Authentication error: ${error.message}`);
      }
      
      // Fallback for unknown errors
      console.error('💥 Unknown error type:', typeof error);
      throw new AuthError('An unexpected error occurred during login');
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
        
        // Verify user still exists (real-time check)
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_user')
          .select('id, email, role, first_name, last_name, department, permissions, created_at, is_active')
          .eq('email', storedUser.email)
          .eq('is_active', true)
          .single();

        if (!adminError && adminUser) {
          auth.user = {
            id: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            first_name: adminUser.first_name,
            last_name: adminUser.last_name,
            department: adminUser.department,
            permissions: adminUser.permissions || {},
            created_at: adminUser.created_at,
            last_login: undefined
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

      // Real-time check: verify admin still exists
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_user')
        .select('id')
        .eq('email', auth.user.email)
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

  // Real-time function to get all admin emails
  getActiveAdminEmails: async (): Promise<string[]> => {
    try {
      const { data: adminUsers, error } = await supabase
        .from('admin_user')
        .select('email')
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
  },





  // Function to check if user has permission
  hasPermission: async (permission: string): Promise<boolean> => {
    try {
      if (!auth.user?.email) {
        return false;
      }

      const { data: hasPermission, error } = await supabase.rpc('check_admin_permission', {
        user_email: auth.user.email,
        required_permission: permission
      });

      if (error) {
        console.error('❌ Error checking permission:', error);
        return false;
      }

      return !!hasPermission;
    } catch (error) {
      console.error('💥 Error in hasPermission:', error);
      return false;
    }
  },

  // Function to get user role
  getUserRole: (): string => {
    return auth.user?.role || 'viewer';
  },

  // Function to check if user is super admin
  isSuperAdmin: (): boolean => {
    return auth.user?.role === 'super_admin';
  },

  // Function to check if user is admin or higher
  isAdminOrHigher: (): boolean => {
    const role = auth.user?.role;
    return role === 'super_admin' || role === 'admin';
  },

  // Function to update last login
  updateLastLogin: async (): Promise<void> => {
    try {
      if (!auth.user?.email) {
        return;
      }

      const { error } = await supabase.rpc('update_admin_last_login', {
        user_email: auth.user.email
      });

      if (error) {
        console.error('❌ Error updating last login:', error);
      }
    } catch (error) {
      console.error('💥 Error in updateLastLogin:', error);
    }
  }
};