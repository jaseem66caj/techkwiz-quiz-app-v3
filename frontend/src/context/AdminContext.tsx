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
  const [loading, setLoading] = useState(false); // Don't block main app loading

  useEffect(() => {
    // Check for stored admin token on mount
    const storedToken = localStorage.getItem('admin_token');
    const storedUsername = localStorage.getItem('admin_username');
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://status-monitor-4.preview.emergentagent.com';
    
    if (storedToken && storedUsername) {
      // Verify token with backend (non-blocking - don't wait for this)
      verifyToken(storedToken, storedUsername).catch(console.error);
    }
    
    // Always set loading to false immediately to not block main app
    setLoading(false);
  }, []);

  const verifyToken = async (token: string, username: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://status-monitor-4.preview.emergentagent.com';
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
      console.log('🔍 Admin login attempt:', username);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://status-monitor-4.preview.emergentagent.com';
      console.log('🌐 Using backend URL:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log('📡 Login response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        console.log('✅ Login successful, token received');
        
        // Store credentials
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_username', username);
        
        setAdminUser({ username, token });
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Login failed:', response.status, errorData);
      }
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
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