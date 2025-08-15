'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { User as FirebaseUser, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../lib/firebase';

export type MinimalUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  address?: string;    
};

type AuthContextType = {
  user: MinimalUser | null;
  loading: boolean;
  updateUser: (updates: Partial<MinimalUser>) => void;
  clearUserCache: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  updateUser: () => {},
  clearUserCache: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MinimalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Try to read cached user to show instantly (optimistic)
    try {
      const cached = localStorage.getItem('authUser');
      if (cached) {
        const parsed = JSON.parse(cached) as MinimalUser;
        setUser(parsed);
        // keep loading true until firebase confirms current state
        console.log(' AuthContext: loaded cached user', parsed);
      }
    } catch (err) {
      console.warn('AuthContext: failed to read cached user', err);
      localStorage.removeItem('authUser');
    }

    // Ensure persistence so sessions survive reloads
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('AuthContext: persistence setup failed:', err);
    });

    // Listen for firebase auth changes. This is the source of truth.
    const unsubscribe = onAuthStateChanged(auth, (u: FirebaseUser | null) => {
      if (u) {
        const minimal: MinimalUser = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          phoneNumber: u.phoneNumber,
        };
        localStorage.setItem('authUser', JSON.stringify(minimal));
        // 🔹 Broadcast login event
        try { window.dispatchEvent(new Event('auth-updated')); } catch {}
        setUser(minimal);
      } else {
        localStorage.removeItem('authUser');
        // 🔹 Broadcast logout event
        try { window.dispatchEvent(new Event('auth-updated')); } catch {}
        setUser(null);
      }
      // Once firebase responded, we're no longer loading
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update cached + state instantly (useful after profile/name/photo update)
  const updateUser = (updates: Partial<MinimalUser>) => {
    setUser((prev) => {
      // Always allow setting user, even if prev is null
      const updated = prev ? { ...prev, ...updates } : { ...updates } as MinimalUser;
      try {
        localStorage.setItem('authUser', JSON.stringify(updated));
        // 🔹 Broadcast update event
        try { window.dispatchEvent(new Event('auth-updated')); } catch {}
      } catch (err) {
        console.warn('AuthContext: failed to write cache', err);
      }
      return updated;
    });
  };

  const clearUserCache = () => {
    try {
      localStorage.removeItem('authUser');
      // 🔹 Broadcast clear event
      try { window.dispatchEvent(new Event('auth-updated')); } catch {}
    } catch (err) {
      console.warn('AuthContext: failed to clear cache', err);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, clearUserCache }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
