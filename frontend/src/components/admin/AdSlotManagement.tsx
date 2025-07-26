"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AdSlot {
  id: string;
  name: string;
  ad_unit_id: string;
  ad_code: string;
  placement: string;
  ad_type: 'adsense' | 'adx' | 'prebid';
  is_active: boolean;
  created_at: string;
}

export default function AdSlotManagement() {
  const { adminUser } = useAdmin();
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);

  const [newSlot, setNewSlot] = useState({
    name: '',
    ad_unit_id: '',
    ad_code: '',
    placement: 'header',
    ad_type: 'adsense' as const,
    is_active: true
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchAdSlots();
  }, []);

  const fetchAdSlots = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/ad-slots`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAdSlots(data);
      }
    } catch (error) {
      console.error('Failed to fetch ad slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/ad-slots`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSlot)
      });

      if (response.ok) {
        await fetchAdSlots();
        setShowAddSlot(false);
        setNewSlot({
          name: '',
          ad_unit_id: '',
          ad_code: '',
          placement: 'header',
          ad_type: 'adsense',
          is_active: true
        });
      }
    } catch (error) {
      console.error('Failed to add ad slot:', error);
    }
  };

  const handleUpdateSlot = async (slotId: string, updates: Partial<AdSlot>) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/ad-slots/${slotId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchAdSlots();
        setEditingSlot(null);
      }
    } catch (error) {
      console.error('Failed to update ad slot:', error);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Are you sure you want to delete this ad slot?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/ad-slots/${slotId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          await fetchAdSlots();
        }
      } catch (error) {
        console.error('Failed to delete ad slot:', error);
      }
    }
  };

  const toggleSlotActive = async (slot: AdSlot) => {
    await handleUpdateSlot(slot.id, { is_active: !slot.is_active });
  };

  const adTypeColors = {
    adsense: 'bg-blue-100 text-blue-800',
    adx: 'bg-purple-100 text-purple-800',
    prebid: 'bg-green-100 text-green-800'
  };

  const commonAdPlacements = [
    { id: 'header', name: 'Header Banner - Top of the page' },
    { id: 'sidebar', name: 'Sidebar Right - Right side of the page' },
    { id: 'between-questions', name: 'Between Questions - Between quiz questions' },
    { id: 'footer', name: 'Footer Banner - Bottom of the page' },
    { id: 'popup', name: 'Popup Interstitial - In-game pop-ups' },
    { id: 'quiz-result', name: 'Quiz Result - After quiz completion' },
    { id: 'category-top', name: 'Category Page Top - Top of category page' },
    { id: 'category-bottom', name: 'Category Page Bottom - Bottom of category page' }
  ];

  const adTypeExamples = {
    adsense: {
      name: 'Google AdSense',
      example: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXX"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXX"
     data-ad-slot="XXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`
    },
    adx: {
      name: 'Google AdX',
      example: `<script async src="https://securepubads.g.doubleclick.net/tag/js/gpt.js"></script>
<script>
  window.googletag = window.googletag || {cmd: []};
  googletag.cmd.push(function() {
    googletag.defineSlot('/XXXXXXX/slot_name', [728, 90], 'div-gpt-ad').addService(googletag.pubads());
    googletag.pubads().enableSingleRequest();
    googletag.enableServices();
  });
</script>
<div id='div-gpt-ad'>
  <script>googletag.cmd.push(function() { googletag.display('div-gpt-ad'); });</script>
</div>`
    },
    prebid: {
      name: 'Prebid Header Bidding',
      example: `<script>
var adUnits = [{
  code: 'div-gpt-ad',
  mediaTypes: {
    banner: {
      sizes: [[300, 250], [728, 90]]
    }
  },
  bids: [{
    bidder: 'appnexus',
    params: {
      placementId: 13144370
    }
  }]
}];
</script>`
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ad Slot Management</h2>
          <p className="text-gray-600 mt-1">Configure AdSense, AdX, and Prebid ad placements</p>
        </div>
        <button
          onClick={() => setShowAddSlot(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span>
          Add Ad Slot
        </button>
      </div>

      {/* Ad Slots List */}
      <div className="space-y-4">
        {adSlots.map((slot) => (
          <motion.div
            key={slot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all ${
              slot.is_active ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{slot.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    slot.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {slot.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${adTypeColors[slot.ad_type]}`}>
                    {slot.ad_type.toUpperCase()}
                  </span>
                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {slot.placement}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Ad Unit ID:</strong> {slot.ad_unit_id}</div>
                  <div><strong>Added:</strong> {new Date(slot.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSlotActive(slot)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    slot.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {slot.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setEditingSlot(slot)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {slot.ad_code}
              </pre>
            </div>
          </motion.div>
        ))}
      </div>

      {adSlots.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ad Slots Created</h3>
          <p className="text-gray-600">Start monetizing by adding AdSense, AdX, or Prebid ad slots.</p>
        </div>
      )}

      {/* Add Ad Slot Modal */}
      <AnimatePresence>
        {showAddSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddSlot(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6">Add New Ad Slot</h3>
              
              {/* Ad Type Examples */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Ad Type Examples</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(adTypeExamples).map(([type, info]) => (
                    <div
                      key={type}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        newSlot.ad_type === type
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setNewSlot({
                          ...newSlot,
                          ad_type: type as any,
                          ad_code: info.example
                        });
                      }}
                    >
                      <h5 className="font-medium text-gray-900">{info.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">Click to use template</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Slot Name</label>
                    <input
                      type="text"
                      value={newSlot.name}
                      onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Header Banner"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Unit ID</label>
                    <input
                      type="text"
                      value={newSlot.ad_unit_id}
                      onChange={(e) => setNewSlot({ ...newSlot, ad_unit_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="ca-pub-XXXXXXXXX/XXXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Placement</label>
                    <select
                      value={newSlot.placement}
                      onChange={(e) => setNewSlot({ ...newSlot, placement: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {commonAdPlacements.map((placement) => (
                        <option key={placement.id} value={placement.id}>
                          {placement.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Type</label>
                    <select
                      value={newSlot.ad_type}
                      onChange={(e) => setNewSlot({ ...newSlot, ad_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="adsense">Google AdSense</option>
                      <option value="adx">Google AdX</option>
                      <option value="prebid">Prebid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ad Code</label>
                  <textarea
                    value={newSlot.ad_code}
                    onChange={(e) => setNewSlot({ ...newSlot, ad_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={12}
                    placeholder="Paste your ad code here..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ad_is_active"
                    checked={newSlot.is_active}
                    onChange={(e) => setNewSlot({ ...newSlot, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="ad_is_active" className="text-sm font-medium">
                    Activate immediately
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddSlot(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Ad Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Ad Slot Modal */}
      <AnimatePresence>
        {editingSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setEditingSlot(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6">Edit Ad Slot</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateSlot(editingSlot.id, {
                  name: formData.get('name') as string,
                  ad_unit_id: formData.get('ad_unit_id') as string,
                  ad_code: formData.get('ad_code') as string,
                  placement: formData.get('placement') as string,
                  ad_type: formData.get('ad_type') as any,
                  is_active: formData.get('is_active') === 'on'
                });
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Slot Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingSlot.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Unit ID</label>
                    <input
                      type="text"
                      name="ad_unit_id"
                      defaultValue={editingSlot.ad_unit_id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Placement</label>
                    <select
                      name="placement"
                      defaultValue={editingSlot.placement}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {commonAdPlacements.map((placement) => (
                        <option key={placement.id} value={placement.id}>
                          {placement.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ad Type</label>
                    <select
                      name="ad_type"
                      defaultValue={editingSlot.ad_type}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="adsense">Google AdSense</option>
                      <option value="adx">Google AdX</option>
                      <option value="prebid">Prebid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ad Code</label>
                  <textarea
                    name="ad_code"
                    defaultValue={editingSlot.ad_code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={12}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="edit_ad_is_active"
                    defaultChecked={editingSlot.is_active}
                    className="mr-2"
                  />
                  <label htmlFor="edit_ad_is_active" className="text-sm font-medium">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setEditingSlot(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Update Ad Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}