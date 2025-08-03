"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { motion } from 'framer-motion';

// Import dashboard components
import QuizManagement from '../../../components/admin/QuizManagement';
import ScriptManagement from '../../../components/admin/ScriptManagement';
import SiteConfiguration from '../../../components/admin/SiteConfiguration';
import AdSlotManagement from '../../../components/admin/AdSlotManagement';
import RewardedPopupConfig from '../../../components/admin/RewardedPopupConfig';
import DataExport from '../../../components/admin/DataExport';
import ProfileSettings from '../../../components/admin/ProfileSettings';

export default function AdminDashboard() {
  const { adminUser, logout, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('quizzes');

  useEffect(() => {
    // Give more time for authentication to load
    const checkAuth = setTimeout(() => {
      if (!loading && !adminUser) {
        console.log('🔄 Dashboard: Redirecting to login - no admin user found');
        window.location.href = '/admin';
      }
    }, 1000); // Wait 1 second for context to stabilize
    
    return () => clearTimeout(checkAuth);
  }, [adminUser, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  // Show loading a bit longer to prevent flashing
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'quizzes', name: 'Quiz Management', icon: '📝' },
    { id: 'site-config', name: 'Site Configuration', icon: '⚙️' },
    { id: 'scripts', name: 'Scripts & Tracking', icon: '📊' },
    { id: 'ads', name: 'Ad Management', icon: '💰' },
    { id: 'rewards', name: 'Rewarded Popups', icon: '🎁' },
    { id: 'export', name: 'Data Export', icon: '💾' },
    { id: 'profile', name: 'Profile Settings', icon: '👤' },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'quizzes':
        return <QuizManagement />;
      case 'site-config':
        return <SiteConfiguration />;
      case 'scripts':
        return <ScriptManagement />;
      case 'ads':
        return <AdSlotManagement />;
      case 'rewards':
        return <RewardedPopupConfig />;
      case 'export':
        return <DataExport />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <QuizManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TechKwiz Admin</h1>
              <span className="ml-4 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">Welcome, {adminUser.username}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation - Fixed Width */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2 sticky top-24">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all text-sm ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 shadow-sm border border-gray-200'
                  }`}
                >
                  <span className="text-lg mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Main Content - Full Remaining Width */}
          <div className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 min-h-[600px] border border-gray-200 overflow-hidden"
            >
              {renderActiveTab()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}