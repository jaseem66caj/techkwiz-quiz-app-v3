"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequestJson, apiRequest } from '../utils/api';

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
    
    if (storedToken && storedUsername) {
      console.log('🔄 Found stored credentials, setting admin user immediately');
      // Set user immediately to prevent redirect loops
      setAdminUser({ username: storedUsername, token: storedToken });
      
      // Verify token with backend (non-blocking - don't wait for this)
      verifyToken(storedToken, storedUsername).catch(console.error);
    } else {
      // No stored credentials, set loading to false
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string, username: string) => {
    try {
      console.log('🔐 Verifying admin token for:', username);
      
      const response = await apiRequest('/api/admin/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Admin token verified successfully');
        setLoading(false);
      } else {
        console.log('❌ Admin token verification failed');
        // Clear invalid token
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        setAdminUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Admin token verification error:', error);
      // Clear potentially invalid token
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      setAdminUser(null);
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔍 Admin login attempt:', username);
      
      const loginData = await apiRequestJson('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      const token = loginData.access_token;
      console.log('✅ Admin login successful, token received');
      
      // Store credentials
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_username', username);
      
      setAdminUser({ username, token });
      return true;
    } catch (error) {
      console.error('❌ Admin login error:', error);
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