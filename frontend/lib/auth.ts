// Mock admin credentials - In a real app, this would be in a secure backend
const ADMIN_CREDENTIALS = {
  email: 'admin@emiliobeaufort.com',
  password: 'admin123'
};

export interface AuthUser {
  email: string;
  isAdmin: boolean;
}

export const auth = {
  user: null as AuthUser | null,

  login: async (email: string, password: string): Promise<AuthUser> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const user = { email, isAdmin: true };
      auth.user = user;
      // Store in session storage so it persists during page refreshes
      sessionStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid credentials');
  },

  logout: () => {
    auth.user = null;
    sessionStorage.removeItem('user');
  },

  // Initialize auth state from session storage
  init: () => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      auth.user = JSON.parse(storedUser);
    }
  },

  // Check if user is authenticated and is an admin
  isAdmin: (): boolean => {
    return !!auth.user?.isAdmin;
  }
}; 