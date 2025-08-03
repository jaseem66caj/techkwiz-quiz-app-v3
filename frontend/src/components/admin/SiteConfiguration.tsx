"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion } from 'framer-motion';

interface SiteConfig {
  id: string;
  google_analytics_id?: string;
  google_search_console_id?: string;
  facebook_pixel_id?: string;
  google_tag_manager_id?: string;
  twitter_pixel_id?: string;
  linkedin_pixel_id?: string;
  tiktok_pixel_id?: string;
  snapchat_pixel_id?: string;
  ads_txt_content?: string;
  robots_txt_content?: string;
  created_at: string;
  updated_at: string;
}

export default function SiteConfiguration() {
  const { adminUser } = useAdmin();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('tracking');
  const [tempConfig, setTempConfig] = useState<Partial<SiteConfig>>({});

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchSiteConfig();
  }, []);

  const fetchSiteConfig = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://946adfbf-ff49-462e-bed5-8b7dac895607.preview.emergentagent.com"}/api/admin/site-config`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        setTempConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch site config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tempConfig) return;
    
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://946adfbf-ff49-462e-bed5-8b7dac895607.preview.emergentagent.com"}/api/admin/site-config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(tempConfig)
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        setTempConfig(updatedConfig);
        alert('Configuration saved successfully!');
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setTempConfig(config);
    }
  };

  const trackingPixels = [
    {
      id: 'google_analytics_id',
      name: 'Google Analytics 4',
      placeholder: 'G-XXXXXXXXXX',
      icon: '📊',
      description: 'Google Analytics measurement ID'
    },
    {
      id: 'google_search_console_id', 
      name: 'Google Search Console',
      placeholder: 'google-site-verification=xxxxxxxxxxxxxx',
      icon: '🔍',
      description: 'Google Search Console verification code'
    },
    {
      id: 'facebook_pixel_id',
      name: 'Facebook Pixel',
      placeholder: 'xxxxxxxxxxxxxxxxx',
      icon: '📘',
      description: 'Facebook Pixel ID for tracking conversions'
    },
    {
      id: 'google_tag_manager_id',
      name: 'Google Tag Manager',
      placeholder: 'GTM-XXXXXXX',
      icon: '🏷️',
      description: 'Google Tag Manager container ID'
    },
    {
      id: 'twitter_pixel_id',
      name: 'Twitter Pixel',
      placeholder: 'o-xxxxx',
      icon: '🐦',
      description: 'Twitter advertising pixel ID'
    },
    {
      id: 'linkedin_pixel_id',
      name: 'LinkedIn Insight',
      placeholder: 'xxxxxxx',
      icon: '💼',
      description: 'LinkedIn Insight Tag partner ID'
    },
    {
      id: 'tiktok_pixel_id',
      name: 'TikTok Pixel',
      placeholder: 'CXXXXXXXXXXXXXXXXX',
      icon: '🎵',
      description: 'TikTok advertising pixel ID'
    },
    {
      id: 'snapchat_pixel_id',
      name: 'Snapchat Pixel',
      placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      icon: '👻',
      description: 'Snapchat advertising pixel ID'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const hasChanges = JSON.stringify(config) !== JSON.stringify(tempConfig);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Site Configuration</h2>
        <p className="text-gray-600 mt-1">Manage tracking codes, pixels, and site files</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'tracking'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Tracking & Pixels
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'files'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📁 Site Files
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Codes & Pixels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trackingPixels.map((pixel) => (
                <div key={pixel.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{pixel.icon}</span>
                    <label className="block text-sm font-medium text-gray-700">
                      {pixel.name}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={tempConfig[pixel.id as keyof SiteConfig] || ''}
                    onChange={(e) => setTempConfig({ 
                      ...tempConfig, 
                      [pixel.id]: e.target.value 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={pixel.placeholder}
                  />
                  <p className="text-xs text-gray-500">{pixel.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Setup Instructions</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Google Analytics:</strong> Create property at analytics.google.com and copy Measurement ID</p>
                <p>• <strong>Search Console:</strong> Verify your site and copy the verification meta tag content</p>
                <p>• <strong>Facebook Pixel:</strong> Create pixel at business.facebook.com and copy the Pixel ID</p>
                <p>• <strong>Other Pixels:</strong> Get tracking IDs from respective advertising platforms</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Files</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🤖</span>
                  <label className="block text-sm font-medium text-gray-700">
                    ads.txt Content
                  </label>
                </div>
                <textarea
                  value={tempConfig.ads_txt_content || ''}
                  onChange={(e) => setTempConfig({ 
                    ...tempConfig, 
                    ads_txt_content: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows={8}
                  placeholder="google.com, pub-xxxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0
facebook.com, xxxxxxxxxxxxxxxxx, DIRECT
# Add more ad network entries here"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add authorized sellers for your ad networks. This helps prevent unauthorized inventory sales.
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">🕷️</span>
                  <label className="block text-sm font-medium text-gray-700">
                    robots.txt Content
                  </label>
                </div>
                <textarea
                  value={tempConfig.robots_txt_content || ''}
                  onChange={(e) => setTempConfig({ 
                    ...tempConfig, 
                    robots_txt_content: e.target.value 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows={8}
                  placeholder="User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

Sitemap: https://techkwiz.com/sitemap.xml"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Control how search engines crawl your site. Current robots.txt is auto-generated.
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📄 File Information</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p>• <strong>ads.txt:</strong> Accessible at /ads.txt - tells advertisers who can sell your ad inventory</p>
                <p>• <strong>robots.txt:</strong> Accessible at /robots.txt - guides search engine crawlers</p>
                <p>• Changes take effect immediately and are served at their respective URLs</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
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
  );
}