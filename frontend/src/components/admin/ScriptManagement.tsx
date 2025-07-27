"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ScriptInjection {
  id: string;
  name: string;
  script_code: string;
  placement: 'header' | 'footer';
  is_active: boolean;
  created_at: string;
}

export default function ScriptManagement() {
  const { adminUser } = useAdmin();
  const [scripts, setScripts] = useState<ScriptInjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddScript, setShowAddScript] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptInjection | null>(null);

  const [newScript, setNewScript] = useState({
    name: '',
    script_code: '',
    placement: 'header' as 'header' | 'footer',
    is_active: true
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com"}/api/admin/scripts`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setScripts(data);
      }
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddScript = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com"}/api/admin/scripts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newScript)
      });

      if (response.ok) {
        await fetchScripts();
        setShowAddScript(false);
        setNewScript({
          name: '',
          script_code: '',
          placement: 'header',
          is_active: true
        });
      }
    } catch (error) {
      console.error('Failed to add script:', error);
    }
  };

  const handleUpdateScript = async (scriptId: string, updates: Partial<ScriptInjection>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com"}/api/admin/scripts/${scriptId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchScripts();
        setEditingScript(null);
      }
    } catch (error) {
      console.error('Failed to update script:', error);
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    if (confirm('Are you sure you want to delete this script?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://6617dc70-8b2e-4e8f-97a1-db89d2a8d414.preview.emergentagent.com"}/api/admin/scripts/${scriptId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          await fetchScripts();
        }
      } catch (error) {
        console.error('Failed to delete script:', error);
      }
    }
  };

  const toggleScriptActive = async (script: ScriptInjection) => {
    await handleUpdateScript(script.id, { is_active: !script.is_active });
  };

  const commonScriptTemplates = [
    {
      name: 'Google Analytics 4',
      placement: 'header' as 'header' | 'footer',
      code: `<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>`
    },
    {
      name: 'Facebook Pixel',
      placement: 'header' as 'header' | 'footer',
      code: `<!-- Facebook Pixel -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>`
    },
    {
      name: 'Google Tag Manager',
      placement: 'header' as 'header' | 'footer',
      code: `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->`
    }
  ];

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
          <h2 className="text-2xl font-bold text-gray-900">Scripts & Tracking</h2>
          <p className="text-gray-600 mt-1">Manage Google Analytics, Facebook Pixel, and custom scripts</p>
        </div>
        <button
          onClick={() => setShowAddScript(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span>
          Add Script
        </button>
      </div>

      {/* Scripts List */}
      <div className="space-y-4">
        {scripts.map((script) => (
          <motion.div
            key={script.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border rounded-xl p-6 hover:shadow-md transition-all ${
              script.is_active ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">{script.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    script.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {script.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {script.placement}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Added {new Date(script.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleScriptActive(script)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    script.is_active
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {script.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setEditingScript(script)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteScript(script.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {script.script_code}
              </pre>
            </div>
          </motion.div>
        ))}
      </div>

      {scripts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scripts Added</h3>
          <p className="text-gray-600">Start by adding Google Analytics, Facebook Pixel, or custom tracking scripts.</p>
        </div>
      )}

      {/* Add Script Modal */}
      <AnimatePresence>
        {showAddScript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddScript(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6">Add New Script</h3>
              
              {/* Quick Templates */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Quick Templates</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {commonScriptTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setNewScript({
                          name: template.name,
                          script_code: template.code,
                          placement: template.placement,
                          is_active: true
                        });
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left transition-all"
                    >
                      <h5 className="font-medium text-gray-900">{template.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">Click to use template</p>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAddScript} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Script Name</label>
                    <input
                      type="text"
                      value={newScript.name}
                      onChange={(e) => setNewScript({ ...newScript, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Google Analytics"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Placement</label>
                    <select
                      value={newScript.placement}
                      onChange={(e) => setNewScript({ ...newScript, placement: e.target.value as 'header' | 'footer' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="header">Header</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Script Code</label>
                  <textarea
                    value={newScript.script_code}
                    onChange={(e) => setNewScript({ ...newScript, script_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={12}
                    placeholder="Paste your script code here..."
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newScript.is_active}
                    onChange={(e) => setNewScript({ ...newScript, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Activate immediately
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddScript(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Script
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Script Modal */}
      <AnimatePresence>
        {editingScript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setEditingScript(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6">Edit Script</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateScript(editingScript.id, {
                  name: formData.get('name') as string,
                  script_code: formData.get('script_code') as string,
                  placement: formData.get('placement') as 'header' | 'footer',
                  is_active: formData.get('is_active') === 'on'
                });
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Script Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingScript.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Placement</label>
                    <select
                      name="placement"
                      defaultValue={editingScript.placement}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="header">Header</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Script Code</label>
                  <textarea
                    name="script_code"
                    defaultValue={editingScript.script_code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    rows={12}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="edit_is_active"
                    defaultChecked={editingScript.is_active}
                    className="mr-2"
                  />
                  <label htmlFor="edit_is_active" className="text-sm font-medium">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setEditingScript(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Update Script
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