"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion } from 'framer-motion';

interface RewardedPopupConfig {
  id: string;
  trigger_after_questions: number;
  coin_reward: number;
  is_active: boolean;
  show_on_insufficient_coins: boolean;
  show_during_quiz: boolean;
  created_at: string;
  updated_at: string;
}

export default function RewardedPopupConfig() {
  const { adminUser } = useAdmin();
  const [config, setConfig] = useState<RewardedPopupConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tempConfig, setTempConfig] = useState<Partial<RewardedPopupConfig>>({});

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001"}/api/admin/rewarded-config`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setTempConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tempConfig) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001"}/api/admin/rewarded-config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(tempConfig)
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        setTempConfig(updatedConfig);
      }
    } catch (error) {
      console.error('Failed to update config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setTempConfig(config);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Config Not Found</h3>
        <p className="text-gray-600">Failed to load rewarded popup configuration.</p>
      </div>
    );
  }

  const hasChanges = JSON.stringify(config) !== JSON.stringify(tempConfig);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rewarded Popup Configuration</h2>
        <p className="text-gray-600 mt-1">Control when and how rewarded video ads appear to users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="space-y-8">
          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rewarded Popups</h3>
              <p className="text-sm text-gray-600">Enable or disable rewarded video advertisements</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${tempConfig.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {tempConfig.is_active ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => setTempConfig({ ...tempConfig, is_active: !tempConfig.is_active })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  tempConfig.is_active ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    tempConfig.is_active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Trigger Configuration */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Trigger Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Show popup after every X correct answers
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={tempConfig.trigger_after_questions || 5}
                      onChange={(e) => setTempConfig({ 
                        ...tempConfig, 
                        trigger_after_questions: parseInt(e.target.value) || 5 
                      })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">questions</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 5-10 questions for better user experience
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coin reward amount
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      min="50"
                      max="1000"
                      step="50"
                      value={tempConfig.coin_reward || 200}
                      onChange={(e) => setTempConfig({ 
                        ...tempConfig, 
                        coin_reward: parseInt(e.target.value) || 200 
                      })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-600">coins</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Amount of coins users receive for watching ads
                  </p>
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Display Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show when user has insufficient coins
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Display popup on category page when user can't afford quiz entry
                      </p>
                    </div>
                    <button
                      onClick={() => setTempConfig({ 
                        ...tempConfig, 
                        show_on_insufficient_coins: !tempConfig.show_on_insufficient_coins 
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tempConfig.show_on_insufficient_coins ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tempConfig.show_on_insufficient_coins ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show during quiz gameplay
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Display popup during quiz after correct answers
                      </p>
                    </div>
                    <button
                      onClick={() => setTempConfig({ 
                        ...tempConfig, 
                        show_during_quiz: !tempConfig.show_during_quiz 
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tempConfig.show_during_quiz ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tempConfig.show_during_quiz ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
              <div className="bg-white rounded-lg p-4 max-w-sm mx-auto shadow-lg">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎁</div>
                  <h4 className="font-bold text-gray-900 mb-2">Watch Ad & Earn Coins!</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Watch a short video to earn {tempConfig.coin_reward} coins
                  </p>
                  <div className="space-y-2">
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium">
                      Watch Ad ({tempConfig.coin_reward} coins)
                    </button>
                    <button className="w-full text-gray-500 text-sm">
                      No thanks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 ${tempConfig.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {tempConfig.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Trigger Frequency:</span>
                  <span className="ml-2 text-gray-900">Every {tempConfig.trigger_after_questions} correct answers</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Coin Reward:</span>
                  <span className="ml-2 text-gray-900">{tempConfig.coin_reward} coins</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Insufficient Coins:</span>
                  <span className={`ml-2 ${tempConfig.show_on_insufficient_coins ? 'text-green-600' : 'text-red-600'}`}>
                    {tempConfig.show_on_insufficient_coins ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">During Quiz:</span>
                  <span className={`ml-2 ${tempConfig.show_during_quiz ? 'text-green-600' : 'text-red-600'}`}>
                    {tempConfig.show_during_quiz ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(config.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Changes
            </button>
            <motion.button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              whileHover={hasChanges ? { scale: 1.02 } : {}}
              whileTap={hasChanges ? { scale: 0.98 } : {}}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                hasChanges
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Configuration'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}