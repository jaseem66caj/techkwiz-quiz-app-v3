"use client";

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion } from 'framer-motion';

export default function ProfileSettings() {
  const { adminUser } = useAdmin();
  const [loading, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: adminUser?.username || '',
    email: 'jaseem@adops.in',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.currentPassword) {
      setError('Current password is required');
      setSaving(false);
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setSaving(false);
      return;
    }

    try {
      const updateData: any = {
        current_password: formData.currentPassword
      };

      if (formData.username !== adminUser?.username) {
        updateData.username = formData.username;
      }

      if (formData.email !== 'jaseem@adops.in') {
        updateData.email = formData.email;
      }

      if (formData.newPassword) {
        updateData.new_password = formData.newPassword;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001"}/api/admin/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // If password was changed, user will need to login again
        if (formData.newPassword) {
          setTimeout(() => {
            alert('Password updated successfully! Please log in again.');
            window.location.href = '/admin';
          }, 2000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">Manage your admin account details and security</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Required to save any changes"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Leave empty to keep current"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Confirm new password"
                    minLength={8}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800"
            >
              Profile updated successfully!
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  username: adminUser?.username || '',
                  email: 'jaseem@adops.in',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setError('');
                setSuccess(false);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Reset Form
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </form>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">🔒 Security Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Only you have access to the admin dashboard</p>
            <p>• Sessions expire automatically for security</p>
            <p>• Password changes require re-authentication</p>
            <p>• Email changes affect password reset functionality</p>
          </div>
        </div>
      </div>
    </div>
  );
}