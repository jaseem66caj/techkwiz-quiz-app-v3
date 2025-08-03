"use client";

import React, { useState } from 'react';

export default function DirectAdminLogin() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const backendUrl = 'https://946adfbf-ff49-462e-bed5-8b7dac895607.preview.emergentagent.com';
      console.log('Testing login to:', `${backendUrl}/api/admin/login`);
      
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: 'admin', 
          password: 'password123' 
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`SUCCESS: Got token: ${data.access_token.substring(0, 50)}...`);
        
        // Store token and redirect
        localStorage.setItem('admin_token', data.access_token);
        localStorage.setItem('admin_username', 'admin');
        
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
        
      } else {
        setResult(`ERROR: ${data.detail || 'Login failed'}`);
      }
    } catch (error) {
      setResult(`ERROR: Network error - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setResult('Storage cleared');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Direct Admin Login Test</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-semibold">Test Credentials:</h3>
            <p>Username: admin</p>
            <p>Password: password123</p>
          </div>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing Login...' : 'Test Direct Login'}
          </button>
          
          <button
            onClick={clearStorage}
            className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Clear Storage
          </button>
          
          {result && (
            <div className={`p-4 rounded ${result.startsWith('SUCCESS') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}