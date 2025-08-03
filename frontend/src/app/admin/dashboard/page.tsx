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
    <div className="min-h-screen bg-gray-50" style={{ width: '100vw', margin: 0, padding: 0 }}>
      {/* Full Width Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40" style={{ width: '100vw', margin: 0 }}>
        <div className="flex justify-between items-center px-8 py-4">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-gray-900">TechKwiz Admin Dashboard</h1>
            <span className="text-base text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Welcome, {adminUser.username}
            </span>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium text-base"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Full Width Content Area */}
      <div className="flex" style={{ width: '100vw', minHeight: 'calc(100vh - 80px)', margin: 0, padding: 0 }}>
        {/* Sidebar */}
        <div className="bg-white shadow-sm border-r border-gray-200 flex-shrink-0" style={{ width: '350px' }}>
          <nav className="p-6">
            <div className="space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-6 py-4 text-left rounded-xl transition-all text-base font-medium ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mr-4">{tab.icon}</span>
                  <span className="text-lg">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content Area - Full Remaining Width */}
        <div className="flex-1 bg-white" style={{ width: 'calc(100vw - 350px)', minHeight: '100%' }}>
          <div className="p-8 w-full">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {renderActiveTab()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}