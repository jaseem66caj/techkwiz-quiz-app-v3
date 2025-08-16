'use client'

import { useState, useEffect, useCallback } from 'react'
import { SecuritySettings as SecuritySettingsType } from '@/types/admin'
import { settingsDataManager } from '@/utils/settingsDataManager'
import { twoFactorAuthService } from '@/utils/twoFactorAuth'

export default function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newIpAddress, setNewIpAddress] = useState('')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; qrCode: string; backupCodes: string[] } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const securitySettings = settingsDataManager.getSecuritySettings()
        setSettings(securitySettings)
        setIs2FAEnabled(twoFactorAuthService.is2FAEnabled())
      } catch (error) {
        console.error('Error loading security settings:', error)
        setSaveMessage({ type: 'error', text: 'Failed to load security settings' })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // 2FA Handlers
  const handle2FAToggle = useCallback(async () => {
    if (is2FAEnabled) {
      // Disable 2FA
      const confirmed = window.confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')
      if (confirmed) {
        const result = await twoFactorAuthService.disable2FA('password') // In real app, prompt for password
        if (result.success) {
          setIs2FAEnabled(false)
          setSaveMessage({ type: 'success', text: result.message })
        } else {
          setSaveMessage({ type: 'error', text: result.message })
        }
      }
    } else {
      // Enable 2FA - start setup
      try {
        const setup = await twoFactorAuthService.setup2FA('TechKwiz Admin')
        setTwoFactorSetup(setup)
        setShow2FASetup(true)
      } catch (error) {
        setSaveMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to setup 2FA' })
      }
    }
  }, [is2FAEnabled])

  const handleVerify2FASetup = useCallback(async () => {
    if (!verificationCode) {
      setSaveMessage({ type: 'error', text: 'Please enter the verification code' })
      return
    }

    try {
      const result = await twoFactorAuthService.verifySetup(verificationCode)
      if (result.success) {
        setIs2FAEnabled(true)
        setShow2FASetup(false)
        setTwoFactorSetup(null)
        setVerificationCode('')
        setSaveMessage({ type: 'success', text: result.message })
      } else {
        setSaveMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Verification failed' })
    }
  }, [verificationCode])

  const handleCancel2FASetup = useCallback(() => {
    setShow2FASetup(false)
    setTwoFactorSetup(null)
    setVerificationCode('')
  }, [])

  // Save settings
  const saveSettings = useCallback(async (updatedSettings: Partial<SecuritySettingsType>) => {
    if (!settings) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const success = settingsDataManager.saveSecuritySettings(updatedSettings)
      
      if (success) {
        const newSettings = settingsDataManager.getSecuritySettings()
        setSettings(newSettings)
        setSaveMessage({ type: 'success', text: 'Security settings saved successfully' })
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to save security settings' })
      }
    } catch (error) {
      console.error('Error saving security settings:', error)
      setSaveMessage({ type: 'error', text: 'An error occurred while saving settings' })
    } finally {
      setIsSaving(false)
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }, [settings])

  // Handle nested object changes
  const handleNestedChange = useCallback((parent: keyof SecuritySettingsType, field: string, value: any) => {
    if (!settings) return

    const updatedSettings = {
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: value
      }
    }
    setSettings(updatedSettings)
    saveSettings({ [parent]: updatedSettings[parent] })
  }, [settings, saveSettings])

  // Handle simple field changes
  const handleFieldChange = useCallback((field: keyof SecuritySettingsType, value: any) => {
    if (!settings) return

    const updatedSettings = { ...settings, [field]: value }
    setSettings(updatedSettings)
    saveSettings({ [field]: value })
  }, [settings, saveSettings])

  // Add IP to whitelist
  const addIpToWhitelist = useCallback(() => {
    if (!settings || !newIpAddress.trim()) return

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(newIpAddress.trim())) {
      setSaveMessage({ type: 'error', text: 'Please enter a valid IP address' })
      setTimeout(() => setSaveMessage(null), 3000)
      return
    }

    const updatedIpList = [...settings.ipWhitelist, newIpAddress.trim()]
    handleFieldChange('ipWhitelist', updatedIpList)
    setNewIpAddress('')
  }, [settings, newIpAddress, handleFieldChange])

  // Remove IP from whitelist
  const removeIpFromWhitelist = useCallback((ipToRemove: string) => {
    if (!settings) return

    const updatedIpList = settings.ipWhitelist.filter(ip => ip !== ipToRemove)
    handleFieldChange('ipWhitelist', updatedIpList)
  }, [settings, handleFieldChange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Loading security settings...</span>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load security settings</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h2>
        <p className="text-gray-600">
          Configure authentication policies, session management, and security controls.
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* Password Policy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Password Policy</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Length
            </label>
            <input
              type="number"
              min="6"
              max="32"
              value={settings.passwordPolicy.minLength}
              onChange={(e) => handleNestedChange('passwordPolicy', 'minLength', parseInt(e.target.value) || 6)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum password length (6-32 characters)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Expiration (days)
            </label>
            <input
              type="number"
              min="30"
              max="365"
              value={settings.passwordPolicy.expirationDays}
              onChange={(e) => handleNestedChange('passwordPolicy', 'expirationDays', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Days before password expires (30-365)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prevent Password Reuse
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.passwordPolicy.preventReuse}
              onChange={(e) => handleNestedChange('passwordPolicy', 'preventReuse', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Number of previous passwords to remember (1-10)</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="font-medium text-gray-900">Character Requirements</h4>
          {[
            { key: 'requireUppercase', name: 'Require Uppercase Letters', description: 'At least one uppercase letter (A-Z)' },
            { key: 'requireLowercase', name: 'Require Lowercase Letters', description: 'At least one lowercase letter (a-z)' },
            { key: 'requireNumbers', name: 'Require Numbers', description: 'At least one number (0-9)' },
            { key: 'requireSpecialChars', name: 'Require Special Characters', description: 'At least one special character (!@#$%^&*)' }
          ].map((requirement) => (
            <div key={requirement.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">{requirement.name}</h5>
                <p className="text-sm text-gray-600">{requirement.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.passwordPolicy[requirement.key as keyof typeof settings.passwordPolicy] as boolean}
                  onChange={(e) => handleNestedChange('passwordPolicy', requirement.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Session Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Management</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Concurrent Sessions
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.sessionSecurity.maxConcurrentSessions}
              onChange={(e) => handleNestedChange('sessionSecurity', 'maxConcurrentSessions', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum simultaneous sessions per user (1-10)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idle Timeout (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={settings.sessionSecurity.idleTimeout}
              onChange={(e) => handleNestedChange('sessionSecurity', 'idleTimeout', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Minutes of inactivity before logout (5-120)</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: 'forceLogoutOnPasswordChange', name: 'Force Logout on Password Change', description: 'Log out all sessions when password is changed' },
            { key: 'requireReauthForSensitive', name: 'Require Re-authentication', description: 'Require password for sensitive operations' }
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{option.name}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sessionSecurity[option.key as keyof typeof settings.sessionSecurity] as boolean}
                  onChange={(e) => handleNestedChange('sessionSecurity', option.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Login Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Login Security</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.loginAttempts.maxAttempts}
              onChange={(e) => handleNestedChange('loginAttempts', 'maxAttempts', parseInt(e.target.value) || 3)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Failed attempts before lockout (3-10)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lockout Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.loginAttempts.lockoutDuration}
              onChange={(e) => handleNestedChange('loginAttempts', 'lockoutDuration', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Minutes to lock account (5-60)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reset After (minutes)
            </label>
            <input
              type="number"
              min="30"
              max="300"
              value={settings.loginAttempts.resetAfter}
              onChange={(e) => handleNestedChange('loginAttempts', 'resetAfter', parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Reset attempt counter after (30-300)</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Notify on Lockout</h4>
              <p className="text-sm text-gray-600">Send notification when account is locked</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.loginAttempts.notifyOnLockout}
                onChange={(e) => handleNestedChange('loginAttempts', 'notifyOnLockout', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* IP Whitelist */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">IP Address Whitelist</h3>
        
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIpAddress}
              onChange={(e) => setNewIpAddress(e.target.value)}
              placeholder="Enter IP address (e.g., 192.168.1.1)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addIpToWhitelist}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add IP
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Add IP addresses that are always allowed to access the admin panel
          </p>
        </div>

        {settings.ipWhitelist.length > 0 ? (
          <div className="space-y-2">
            {settings.ipWhitelist.map((ip, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-mono text-sm">{ip}</span>
                <button
                  onClick={() => removeIpFromWhitelist(ip)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p>No IP addresses in whitelist</p>
            <p className="text-sm">Add IP addresses to restrict admin access</p>
          </div>
        )}
      </div>

      {/* Advanced Security */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Security</h3>
        
        <div className="space-y-4">
          {[
            { key: 'twoFactorAuth', name: 'Two-Factor Authentication', description: 'Require 2FA for admin login', color: 'green' },
            { key: 'auditLogging', name: 'Audit Logging', description: 'Log all admin actions for security auditing', color: 'blue' },
            { key: 'encryptionEnabled', name: 'Data Encryption', description: 'Encrypt sensitive data in storage', color: 'purple' }
          ].map((option) => (
            <div key={option.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{option.name}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={option.key === 'twoFactorAuth' ? is2FAEnabled : settings[option.key as keyof SecuritySettingsType] as boolean}
                  onChange={(e) => option.key === 'twoFactorAuth' ? handle2FAToggle() : handleFieldChange(option.key as keyof SecuritySettingsType, e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-${option.color}-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${option.color}-600`}></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && twoFactorSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Setup Two-Factor Authentication</h3>
                <button
                  onClick={handleCancel2FASetup}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Scan QR Code</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code:
                </p>
                <div className="flex justify-center mb-4">
                  <img src={twoFactorSetup.qrCode} alt="2FA QR Code" className="border border-gray-300 rounded-lg" />
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  <p className="font-mono bg-gray-100 p-2 rounded break-all">
                    Secret: {twoFactorSetup.secret}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code from your app:
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-800 mb-2">Backup Codes</h5>
                <p className="text-sm text-yellow-700 mb-3">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {twoFactorSetup.backupCodes.map((code, index) => (
                    <div key={index} className="bg-white p-2 rounded border text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancel2FASetup}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify2FASetup}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700">Saving security settings...</span>
          </div>
        </div>
      )}
    </div>
  )
}
