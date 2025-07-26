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

export default function AdminDashboard() {
  const { adminUser, logout, loading } = useAdmin();
  const [activeTab, setActiveTab] = useState('quizzes');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !adminUser) {
      window.location.href = '/admin';
    }
  }, [adminUser, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect
  }

  const tabs = [
    { id: 'quizzes', name: 'Quiz Management', icon: '📝' },
    { id: 'site-config', name: 'Site Configuration', icon: '⚙️' },
    { id: 'scripts', name: 'Scripts & Tracking', icon: '📊' },
    { id: 'ads', name: 'Ad Management', icon: '💰' },
    { id: 'rewards', name: 'Rewarded Popups', icon: '🎁' },
    { id: 'export', name: 'Data Export', icon: '💾' },
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
      default:
        return <QuizManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">TechKwiz Admin</h1>
              <span className="ml-4 text-sm text-gray-500">Welcome, {adminUser.username}</span>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <span className="text-xl mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.name}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              {renderActiveTab()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}