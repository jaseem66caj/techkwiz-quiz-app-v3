"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminUser {
  username: string;
  token: string;
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored admin token on mount
    const storedToken = localStorage.getItem('admin_token');
    const storedUsername = localStorage.getItem('admin_username');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com';
    
    if (storedToken && storedUsername) {
      // Verify token with backend (but don't block main app)
      verifyToken(storedToken, storedUsername);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string, username: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com';
      const response = await fetch(`${backendUrl}/api/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setAdminUser({ username, token });
      } else {
        // Token expired or invalid, clear storage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com';
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        
        // Store credentials
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_username', username);
        
        setAdminUser({ username, token });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setAdminUser(null);
  };

  const value = {
    adminUser,
    isAuthenticated: !!adminUser,
    login,
    logout,
    loading
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};