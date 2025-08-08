"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequestJson } from '../../utils/api';

interface RewardedPopupConfigModel {
  id?: string;
  trigger_after_questions: number;
  coin_reward: number;
  is_active: boolean;
  show_on_insufficient_coins: boolean;
  show_during_quiz: boolean;
  enable_analytics: boolean;
  category_id?: string | null;
  category_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  entry_fee: number;
}

export default function RewardedPopupConfig() {
  const { adminUser } = useAdmin();
  const [activeTab, setActiveTab] = useState<'homepage' | 'categories'>('homepage');

  // Homepage config state
  const [homeConfig, setHomeConfig] = useState<RewardedPopupConfigModel | null>(null);
  const [homeTemp, setHomeTemp] = useState<RewardedPopupConfigModel | null>(null);
  const [homeLoading, setHomeLoading] = useState(true);
  const [savingHome, setSavingHome] = useState(false);

  // Categories tab state
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [catSearch, setCatSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<QuizCategory | null>(null);
  const [catConfig, setCatConfig] = useState<RewardedPopupConfigModel | null>(null);
  const [catTemp, setCatTemp] = useState<RewardedPopupConfigModel | null>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [savingCat, setSavingCat] = useState(false);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token}`,
    'Content-Type': 'application/json'
  });

  // Fetch homepage config
  useEffect(() => {
    const loadHome = async () => {
      setHomeLoading(true);
      try {
        const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
        const res = await fetch(`${backend}/api/admin/rewarded-config/homepage`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data: RewardedPopupConfigModel = await res.json();
          // Ensure enable_analytics default
          const withDefaults = { enable_analytics: true, trigger_after_questions: 5, coin_reward: 100, is_active: true, show_on_insufficient_coins: true, show_during_quiz: true, ...data };
          setHomeConfig(withDefaults);
          setHomeTemp(withDefaults);
        }
      } catch (e) {
        console.error('Failed to load homepage rewarded config', e);
      } finally {
        setHomeLoading(false);
      }
    };
    loadHome();
  }, []);

  // Fetch categories for Category tab
  useEffect(() => {
    if (activeTab !== 'categories') return;
    const loadCategories = async () => {
      try {
        const cats = await apiRequestJson<QuizCategory[]>(`/api/quiz/categories`);
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    loadCategories();
  }, [activeTab]);

  const filteredCategories = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(q));
  }, [categories, catSearch]);

  // Load selected category config
  const loadCategoryConfig = async (cat: QuizCategory) => {
    setSelectedCat(cat);
    setCatLoading(true);
    setCatConfig(null);
    setCatTemp(null);
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
      const res = await fetch(`${backend}/api/admin/rewarded-config/${cat.id}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data: RewardedPopupConfigModel = await res.json();
        const withDefaults = { enable_analytics: true, trigger_after_questions: 5, coin_reward: 100, is_active: true, show_on_insufficient_coins: true, show_during_quiz: true, ...data };
        setCatConfig(withDefaults);
        setCatTemp(withDefaults);
      }
    } catch (e) {
      console.error('Failed to load category rewarded config', e);
    } finally {
      setCatLoading(false);
    }
  };

  // Save homepage config
  const saveHome = async () => {
    if (!homeTemp) return;
    setSavingHome(true);
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
      const res = await fetch(`${backend}/api/admin/rewarded-config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(homeTemp)
      });
      if (res.ok) {
        const updated = await res.json();
        setHomeConfig(updated);
        setHomeTemp(updated);
      }
    } catch (e) {
      console.error('Failed to save homepage rewarded config', e);
    } finally {
      setSavingHome(false);
    }
  };

  // Save category config
  const saveCategory = async () => {
    if (!catTemp || !selectedCat) return;
    setSavingCat(true);
    try {
      const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
      const res = await fetch(`${backend}/api/admin/rewarded-config/${selectedCat.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...catTemp, category_id: selectedCat.id, category_name: selectedCat.name })
      });
      if (res.ok) {
        const updated = await res.json();
        setCatConfig(updated);
        setCatTemp(updated);
      }
    } catch (e) {
      console.error('Failed to save category rewarded config', e);
    } finally {
      setSavingCat(false);
    }
  };

  const HomeForm = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {!homeTemp ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading homepage configuration…</p>
        </div>
      ) : (
        <>
          {/* Toggles row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleRow
              title="Rewarded Popups"
              subtitle="Enable or disable all rewarded popups on homepage"
              checked={!!homeTemp.is_active}
              onChange={(v) => setHomeTemp({ ...homeTemp, is_active: v })}
            />
            <ToggleRow
              title="Ad Analytics"
              subtitle="Record ad start/complete events for reporting"
              checked={!!homeTemp.enable_analytics}
              onChange={(v) => setHomeTemp({ ...homeTemp, enable_analytics: v })}
            />
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <NumberField
              label="Coin reward amount"
              value={homeTemp.coin_reward}
              onChange={(v) => setHomeTemp({ ...homeTemp, coin_reward: v })}
              min={50}
              step={50}
              suffix="coins"
            />
            <NumberField
              label="Show popup after every X correct answers"
              value={homeTemp.trigger_after_questions}
              onChange={(v) => setHomeTemp({ ...homeTemp, trigger_after_questions: v })}
              min={1}
              step={1}
              suffix="questions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <ToggleRow
              title="Show during quiz gameplay"
              subtitle="Display popup during quiz after correct answers"
              checked={!!homeTemp.show_during_quiz}
              onChange={(v) => setHomeTemp({ ...homeTemp, show_during_quiz: v })}
            />
            <ToggleRow
              title="Show when user has insufficient coins"
              subtitle="Display popup on category page when user can't afford entry"
              checked={!!homeTemp.show_on_insufficient_coins}
              onChange={(v) => setHomeTemp({ ...homeTemp, show_on_insufficient_coins: v })}
            />
          </div>

          <div className="flex justify-end mt-8 border-t pt-6">
            <button onClick={saveHome} disabled={savingHome} className={`px-6 py-2 rounded-lg font-medium ${savingHome ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
              {savingHome ? 'Saving…' : 'Save Homepage Configuration'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const CategoryForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Category picker */}
      <div className="bg-white rounded-xl shadow-sm border p-4 lg:col-span-1">
        <div className="mb-3">
          <input
            value={catSearch}
            onChange={(e) => setCatSearch(e.target.value)}
            placeholder="Search categories…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="max-h-[60vh] overflow-auto divide-y">
          {filteredCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => loadCategoryConfig(c)}
              className={`w-full text-left px-3 py-3 hover:bg-purple-50 ${selectedCat?.id === c.id ? 'bg-purple-100' : ''}`}
            >
              <div className="font-semibold text-gray-900">{c.icon} {c.name}</div>
              <div className="text-xs text-gray-500">Entry: 🪙 {c.entry_fee}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Config editor */}
      <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
        {!selectedCat ? (
          <div className="text-center py-12 text-gray-600">Select a category to configure its rewarded popup</div>
        ) : catLoading || !catTemp ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading {selectedCat.name} configuration…</p>
          </div>
        ) : (
          <>
            <div className="mb-2 text-sm text-gray-500">Category: <span className="font-semibold text-gray-800">{selectedCat.name}</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ToggleRow title="Rewarded Popups" subtitle="Enable or disable for this category" checked={!!catTemp.is_active} onChange={(v) => setCatTemp({ ...catTemp, is_active: v })} />
              <ToggleRow title="Ad Analytics" subtitle="Record ad events" checked={!!catTemp.enable_analytics} onChange={(v) => setCatTemp({ ...catTemp, enable_analytics: v })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <NumberField label="Coin reward amount" value={catTemp.coin_reward} onChange={(v) => setCatTemp({ ...catTemp, coin_reward: v })} min={50} step={50} suffix="coins" />
              <NumberField label="Show popup after every X correct answers" value={catTemp.trigger_after_questions} onChange={(v) => setCatTemp({ ...catTemp, trigger_after_questions: v })} min={1} step={1} suffix="questions" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <ToggleRow title="Show during quiz gameplay" subtitle="Display popup after correct answers" checked={!!catTemp.show_during_quiz} onChange={(v) => setCatTemp({ ...catTemp, show_during_quiz: v })} />
              <ToggleRow title="Show when user has insufficient coins" subtitle="Display popup on category page" checked={!!catTemp.show_on_insufficient_coins} onChange={(v) => setCatTemp({ ...catTemp, show_on_insufficient_coins: v })} />
            </div>

            <div className="flex justify-end mt-8 border-t pt-6">
              <button onClick={saveCategory} disabled={savingCat} className={`px-6 py-2 rounded-lg font-medium ${savingCat ? 'bg-gray-300 text-gray-500' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}>
                {savingCat ? 'Saving…' : `Save ${selectedCat.name} Configuration`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rewarded Popups</h2>
        <p className="text-gray-600 mt-1">Control when and how rewarded ads appear across homepage and categories</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex bg-gray-100 p-1 rounded-xl">
          <TabButton active={activeTab==='homepage'} onClick={() => setActiveTab('homepage')}>Homepage</TabButton>
          <TabButton active={activeTab==='categories'} onClick={() => setActiveTab('categories')}>Categories</TabButton>
        </div>
      </div>

      {activeTab === 'homepage' ? <HomeForm /> : <CategoryForm />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded-lg font-medium ${active ? 'bg-white shadow text-purple-700' : 'text-gray-700 hover:text-purple-700'}`}>
      {children}
    </button>
  )
}

function ToggleRow({ title, subtitle, checked, onChange }: { title: string, subtitle?: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
      <div>
        <div className="font-semibold text-gray-900">{title}</div>
        {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
      </div>
      <button onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

function NumberField({ label, value, onChange, min = 0, step = 1, suffix }: { label: string, value: number, onChange: (v: number) => void, min?: number, step?: number, suffix?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <input type="number" value={value} min={min} step={step} onChange={(e) => onChange(parseInt(e.target.value || '0'))} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
        {suffix && <span className="text-sm text-gray-600">{suffix}</span>}
      </div>
    </div>
  )
}