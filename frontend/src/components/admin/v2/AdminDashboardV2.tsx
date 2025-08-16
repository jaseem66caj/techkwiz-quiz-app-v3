'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import DashboardOverview from './sections/dashboard/DashboardOverview'
import EnhancedDashboardOverview from './sections/dashboard/EnhancedDashboardOverview'
import QuizManagementDashboard from './sections/quiz-management/QuizManagementDashboard'
import RewardConfigDashboard from './sections/reward-config/RewardConfigDashboard'

import SettingsDashboard from './sections/settings/SettingsDashboard'
import EnhancedSettingsDashboard from './sections/settings/EnhancedSettingsDashboard'
import GoogleAnalyticsSettings from './sections/settings/GoogleAnalyticsSettings'
import FileManagementDashboard from './sections/file-management/FileManagementDashboard'
import ComprehensiveSyncDashboard from './sections/sync/ComprehensiveSyncDashboard'
import { quizDataManager } from '@/utils/quizDataManager'
import { rewardDataManager } from '@/utils/rewardDataManager'
import { realTimeSyncService } from '@/utils/realTimeSync'
import ConfirmationDialog from './common/ConfirmationDialog'
import AdminErrorBoundary from './common/AdminErrorBoundary'

export type AdminSectionId =
  | 'dashboard'
  | 'enhanced-dashboard'
  | 'quiz-management'
  | 'reward-config'
  | 'settings'
  | 'enhanced-settings'
  | 'google-analytics'
  | 'file-management'
  | 'sync-management'

interface AdminSection {
  id: AdminSectionId
  name: string
  icon: React.ReactNode
  badge?: string | number
}

export default function AdminDashboardV2() {
  const [currentSection, setCurrentSection] = useState<AdminSectionId>('enhanced-dashboard')
  // Desktop-first: Start expanded on desktop, collapsed on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { logout, session } = useAdminAuth()

  // Logout confirmation state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Mobile navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const questionCount = quizDataManager.getQuestions().length

  const sections: AdminSection[] = [
    {
      id: 'enhanced-dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      id: 'quiz-management',
      name: 'Quiz Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: questionCount.toString()
    },
    {
      id: 'reward-config',
      name: 'Reward Configuration',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },

    {
      id: 'enhanced-settings',
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      badge: '5'
    },
    {
      id: 'file-management',
      name: 'File Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      badge: '3'
    },
    {
      id: 'sync-management',
      name: 'Data Sync',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      badge: 'NEW'
    }
  ]

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false)
    logout()
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <AdminErrorBoundary
            fallbackTitle="Dashboard Error"
            fallbackMessage="Unable to load the dashboard. Please try refreshing."
          >
            <DashboardOverview />
          </AdminErrorBoundary>
        )
      case 'enhanced-dashboard':
        return (
          <AdminErrorBoundary
            fallbackTitle="Enhanced Dashboard Error"
            fallbackMessage="Unable to load the enhanced dashboard. Please try refreshing."
          >
            <EnhancedDashboardOverview onNavigateToSection={setCurrentSection} />
          </AdminErrorBoundary>
        )
      case 'quiz-management':
        return (
          <AdminErrorBoundary
            fallbackTitle="Quiz Management Error"
            fallbackMessage="Unable to load the quiz management section. Please try refreshing or check your data."
          >
            <QuizManagementDashboard />
          </AdminErrorBoundary>
        )
      case 'reward-config':
        return (
          <AdminErrorBoundary
            fallbackTitle="Reward Configuration Error"
            fallbackMessage="Unable to load the reward configuration section. Please try refreshing."
          >
            <RewardConfigDashboard />
          </AdminErrorBoundary>
        )

      case 'settings':
        return (
          <AdminErrorBoundary
            fallbackTitle="Settings Error"
            fallbackMessage="Unable to load the settings section. Please try refreshing."
          >
            <SettingsDashboard />
          </AdminErrorBoundary>
        )
      case 'enhanced-settings':
        return (
          <AdminErrorBoundary
            fallbackTitle="Enhanced Settings Error"
            fallbackMessage="Unable to load the enhanced settings section. Please try refreshing."
          >
            <EnhancedSettingsDashboard />
          </AdminErrorBoundary>
        )
      case 'google-analytics':
        return (
          <AdminErrorBoundary
            fallbackTitle="Google Analytics Error"
            fallbackMessage="Unable to load the Google Analytics settings. Please try refreshing."
          >
            <GoogleAnalyticsSettings />
          </AdminErrorBoundary>
        )
      case 'file-management':
        return (
          <AdminErrorBoundary
            fallbackTitle="File Management Error"
            fallbackMessage="Unable to load the file management section. Please try refreshing."
          >
            <FileManagementDashboard />
          </AdminErrorBoundary>
        )
      case 'sync-management':
        return (
          <AdminErrorBoundary
            fallbackTitle="Sync Management Error"
            fallbackMessage="Unable to load the sync management section. Please try refreshing."
          >
            <ComprehensiveSyncDashboard onNavigateToSection={setCurrentSection} />
          </AdminErrorBoundary>
        )
      default:
        return (
          <div className="p-8 lg:p-12 space-y-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              {sections.find(s => s.id === currentSection)?.name || 'Section'}
            </h1>
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100">
              <p className="text-lg text-gray-600">
                This section is under development. The {sections.find(s => s.id === currentSection)?.name} functionality will be implemented here.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex">
      {/* Desktop Sidebar - Fixed width, collapsible */}
      <div className={`bg-white/10 backdrop-blur-lg shadow-xl border-r border-white/20 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-80'
      } lg:relative lg:flex hidden lg:block`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h2 className="text-2xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz Admin
              </h2>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`w-full flex items-center px-4 py-4 text-left rounded-xl transition-all duration-200 group ${
                currentSection === section.id
                  ? 'bg-white/20 border border-white/30 text-white shadow-sm backdrop-blur-sm'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
              title={sidebarCollapsed ? section.name : undefined}
            >
              <span className={`flex-shrink-0 transition-colors ${
                currentSection === section.id ? 'text-white' : 'text-blue-300 group-hover:text-white'
              }`}>
                {section.icon}
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="ml-4 font-medium text-base">{section.name}</span>
                  {section.badge && (
                    <span className={`ml-auto px-2.5 py-1 text-xs font-medium rounded-full ${
                      currentSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      {section.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-4 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-200 group"
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="ml-4 font-medium text-base">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">
            <span className="text-orange-400">Tech</span>Kwiz Admin
          </h1>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Drawer */}
          <div className="fixed top-0 left-0 h-full w-80 bg-white/10 backdrop-blur-lg border-r border-white/20 transform transition-transform duration-300 ease-in-out">
            {/* Mobile Sidebar Header */}
            <div className="p-6 border-b border-white/20 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                <span className="text-orange-400">Tech</span>Kwiz Admin
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setCurrentSection(section.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-4 text-left rounded-xl transition-all duration-200 group ${
                    currentSection === section.id
                      ? 'bg-white/20 border border-white/30 text-white shadow-sm backdrop-blur-sm'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${
                    currentSection === section.id ? 'text-white' : 'text-blue-300 group-hover:text-white'
                  }`}>
                    {section.icon}
                  </span>
                  <span className="ml-4 font-medium text-base">{section.name}</span>
                  {section.badge && (
                    <span className={`ml-auto px-2.5 py-1 text-xs font-medium rounded-full ${
                      currentSection === section.id
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-500/20 text-blue-200'
                    }`}>
                      {section.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Logout Button */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center px-4 py-4 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-200 group"
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="ml-4 font-medium text-base">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto lg:pt-0 pt-16">
          {renderContent()}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access the admin dashboard."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}
