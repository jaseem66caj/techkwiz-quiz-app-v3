"use client";

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion } from 'framer-motion';

export default function DataExport() {
  const { adminUser } = useAdmin();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001"}/api/admin/export/quiz-data`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create downloadable file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `techkwiz-quiz-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const handleImportData = async (file: File) => {
    setImporting(true);
    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001"}/api/admin/import/quiz-data`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Data imported successfully! The page will refresh.');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Failed to import data: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const exportFeatures = [
    {
      icon: '🗂️',
      title: 'Quiz Categories',
      description: 'All quiz categories with their settings, entry fees, and prize pools',
    },
    {
      icon: '❓',
      title: 'Quiz Questions',
      description: 'Complete question database with answers, fun facts, and difficulty levels',
    },
    {
      icon: '📅',
      title: 'Timestamps',
      description: 'Creation and modification dates for all data entries',
    },
    {
      icon: '🔗',
      title: 'Relationships',
      description: 'Category-question relationships and subcategory mappings',
    }
  ];

  const importNotes = [
    'Import will replace ALL existing quiz data',
    'Make sure to export current data as backup first',
    'File must be in valid JSON format',
    'Categories and questions will be completely overwritten',
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Data Export & Import</h2>
        <p className="text-gray-600 mt-1">Backup and restore your quiz data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Export Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-3">📤</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download your complete quiz database</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900">What's included:</h4>
            <div className="grid grid-cols-1 gap-3">
              {exportFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start">
                  <span className="text-xl mr-3 mt-1">{feature.icon}</span>
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{feature.title}</h5>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleExportData}
            disabled={exporting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Exporting...
              </div>
            ) : (
              'Export Quiz Data'
            )}
          </motion.button>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Tip:</strong> Export regularly to keep backups of your quiz content. The file will be named with today's date.
            </p>
          </div>
        </motion.div>

        {/* Import Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-3">📥</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Import Data</h3>
              <p className="text-sm text-gray-600">Restore from a previous export</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important Notes:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {importNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const confirmImport = confirm(
                    'Are you sure you want to import this data? This will replace ALL existing quiz content and cannot be undone.'
                  );
                  if (confirmImport) {
                    handleImportData(file);
                  }
                  e.target.value = ''; // Reset file input
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              disabled={importing}
            />

            {importing && (
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-2"></div>
                <span className="text-gray-700">Importing data...</span>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-800">
              <strong>Warning:</strong> Import will permanently delete all current quiz data. Make sure you have a backup before proceeding.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-medium text-gray-900 text-sm">Regular Backups</h4>
            <p className="text-xs text-gray-600 mt-1">Export your data weekly to prevent loss</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔄</div>
            <h4 className="font-medium text-gray-900 text-sm">Version Control</h4>
            <p className="text-xs text-gray-600 mt-1">Keep multiple export files with different dates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🧪</div>
            <h4 className="font-medium text-gray-900 text-sm">Test Imports</h4>
            <p className="text-xs text-gray-600 mt-1">Always test import files in a safe environment first</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}