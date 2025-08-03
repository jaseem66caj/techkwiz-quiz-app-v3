"use client";

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subcategories: string[];
  entry_fee: number;
  prize_pool: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  fun_fact: string;
  category: string;
  subcategory: string;
}

export default function QuizManagement() {
  const { adminUser } = useAdmin();
  const [activeSubTab, setActiveSubTab] = useState('categories');
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    color: '',
    description: '',
    subcategories: '',
    entry_fee: 100,
    prize_pool: 2000
  });

  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    difficulty: 'beginner' as const,
    fun_fact: '',
    category: '',
    subcategory: ''
  });

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (adminUser?.token && isMounted) {
        console.log('🚀 QuizManagement: Starting data load');
        
        // Wait a moment for context to stabilize
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (isMounted) {
          // Load categories first, then questions
          await fetchCategories();
          
          if (isMounted) {
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
            await fetchQuestions();
          }
        }
      } else if (!adminUser?.token) {
        console.log('⚠️ QuizManagement: No admin token yet');
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [adminUser]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token || ''}`,
    'Content-Type': 'application/json'
  });

  const fetchCategoriesWithRetry = async (retryCount = 0) => {
    if (!adminUser?.token) {
      console.log('❌ No admin token available for categories fetch');
      return;
    }
    if (categoriesLoading) {
      console.log('⚠️ Categories already loading, skipping request');
      return;
    }
    try {
      setCategoriesLoading(true);
      console.log(`📦 Fetching categories... (attempt ${retryCount + 1})`);
      
      // Add delay to prevent request flooding
      await new Promise(resolve => setTimeout(resolve, 100 + (retryCount * 200)));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-monitor-4.preview.emergentagent.com"}/api/admin/categories`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        console.log(`✅ Loaded ${data.length} categories`);
      } else {
        console.error('❌ Categories fetch failed:', response.status);
        if (retryCount < 2 && response.status >= 500) {
          console.log(`🔄 Retrying categories fetch...`);
          setTimeout(() => fetchCategoriesWithRetry(retryCount + 1), 1000);
        }
      }
    } catch (error) {
      console.error('❌ Categories fetch error:', error);
      if (retryCount < 2) {
        console.log(`🔄 Retrying categories fetch after error...`);
        setTimeout(() => fetchCategoriesWithRetry(retryCount + 1), 1000);
      }
    } finally {
      if (retryCount === 0) {
        setCategoriesLoading(false);
        setLoading(false);
      }
    }
  };

  // Keep original function for backwards compatibility
  const fetchCategories = () => fetchCategoriesWithRetry(0);

  const fetchQuestionsWithRetry = async (retryCount = 0) => {
    if (!adminUser?.token) {
      console.log('❌ No admin token available for questions fetch');
      return;
    }
    if (questionsLoading) {
      console.log('⚠️ Questions already loading, skipping request');
      return;
    }
    try {
      setQuestionsLoading(true);
      console.log(`❓ Fetching questions... (attempt ${retryCount + 1})`);
      
      // Add delay to prevent request flooding
      await new Promise(resolve => setTimeout(resolve, 200 + (retryCount * 300)));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-monitor-4.preview.emergentagent.com"}/api/admin/questions`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        console.log(`✅ Loaded ${data.length} questions`);
      } else {
        console.error('❌ Questions fetch failed:', response.status);
        if (retryCount < 2 && response.status >= 500) {
          console.log(`🔄 Retrying questions fetch...`);
          setTimeout(() => fetchQuestionsWithRetry(retryCount + 1), 1000);
        }
      }
    } catch (error) {
      console.error('❌ Questions fetch error:', error);
      if (retryCount < 2) {
        console.log(`🔄 Retrying questions fetch after error...`);
        setTimeout(() => fetchQuestionsWithRetry(retryCount + 1), 1000);
      }
    } finally {
      if (retryCount === 0) {
        setQuestionsLoading(false);
      }
    }
  };

  // Keep original function for backwards compatibility
  const fetchQuestions = () => fetchQuestionsWithRetry(0);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...newCategory,
        subcategories: newCategory.subcategories.split(',').map(s => s.trim())
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-monitor-4.preview.emergentagent.com"}/api/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        await fetchCategories();
        setShowAddCategory(false);
        setNewCategory({
          name: '',
          icon: '',
          color: '',
          description: '',
          subcategories: '',
          entry_fee: 100,
          prize_pool: 2000
        });
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-monitor-4.preview.emergentagent.com"}/api/admin/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newQuestion)
      });

      if (response.ok) {
        await fetchQuestions();
        setShowAddQuestion(false);
        setNewQuestion({
          question: '',
          options: ['', '', '', ''],
          correct_answer: 0,
          difficulty: 'beginner',
          fun_fact: '',
          category: '',
          subcategory: ''
        });
      }
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all questions in this category.')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-monitor-4.preview.emergentagent.com"}/api/admin/categories/${categoryId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          await fetchCategories();
          await fetchQuestions();
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://status-monitor-4.preview.emergentagent.com"}/api/admin/questions/${questionId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          await fetchQuestions();
        }
      } catch (error) {
        console.error('Failed to delete question:', error);
      }
    }
  };

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Get questions count per category
  const getQuestionCount = (categoryId: string) => {
    return questions.filter(q => q.category === categoryId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading quiz data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-8">📚 Quiz Management Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white/20 rounded-xl p-6 text-center min-h-[100px] flex flex-col justify-center hover:bg-white/30 transition-all">
            <div className="text-4xl font-bold">{categories.length}</div>
            <div className="text-base opacity-90 mt-2">Total Categories</div>
          </div>
          <div className="bg-white/20 rounded-xl p-6 text-center min-h-[100px] flex flex-col justify-center hover:bg-white/30 transition-all">
            <div className="text-4xl font-bold">{questions.length}</div>
            <div className="text-base opacity-90 mt-2">Total Questions</div>
          </div>
          <div className="bg-white/20 rounded-xl p-6 text-center min-h-[100px] flex flex-col justify-center hover:bg-white/30 transition-all">
            <div className="text-4xl font-bold">{questions.filter(q => q.difficulty === 'beginner').length}</div>
            <div className="text-base opacity-90 mt-2">Beginner Questions</div>
          </div>
          <div className="bg-white/20 rounded-xl p-6 text-center min-h-[100px] flex flex-col justify-center hover:bg-white/30 transition-all">
            <div className="text-4xl font-bold">{questions.filter(q => q.difficulty === 'advanced').length}</div>
            <div className="text-base opacity-90 mt-2">Advanced Questions</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 bg-gray-100 p-3 rounded-xl">
        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-8 py-4 rounded-xl font-semibold text-base transition-all ${
            activeSubTab === 'categories'
              ? 'bg-white text-purple-700 shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          🏷️ Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`px-8 py-4 rounded-xl font-semibold text-base transition-all ${
            activeSubTab === 'questions'
              ? 'bg-white text-purple-700 shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          ❓ Questions ({questions.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeSubTab === 'categories' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">📋 Quiz Categories</h3>
            <button
              onClick={() => setShowAddCategory(true)}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl flex items-center font-semibold shadow-lg text-base"
            >
              <span className="mr-3 text-xl">✨</span>
              Add New Category
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 mb-12">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-purple-300 min-h-[320px] flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center flex-1">
                    <span className="text-5xl mr-5">{category.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-xl leading-tight">{category.name}</h4>
                      <p className="text-base text-gray-600 mt-2 line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700 text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors ml-3 flex-shrink-0 font-medium"
                  >
                    🗑️ Delete
                  </button>
                </div>
                
                <div className="space-y-5 flex-1">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">💰 Entry Fee:</span>
                        <span className="font-bold text-green-600 text-lg">{category.entry_fee} coins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">🏆 Prize Pool:</span>
                        <span className="font-bold text-blue-600 text-lg">{category.prize_pool} coins</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">📊 Questions:</span>
                      <span className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                        {getQuestionCount(category.id)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <span className="text-gray-700 font-semibold mb-3 block">🏷️ Topics:</span>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub, idx) => (
                        <span key={idx} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full font-medium">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeSubTab === 'questions' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">❓ Quiz Questions</h3>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl flex items-center font-semibold shadow-lg text-base"
            >
              <span className="mr-3 text-xl">➕</span>
              Add New Question
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Search Questions</label>
                <input
                  type="text"
                  placeholder="Search by question, category, or topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📂 Filter by Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">⚡ Filter by Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">🟢 Beginner</option>
                  <option value="intermediate">🟡 Intermediate</option>
                  <option value="advanced">🔴 Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
              <span className="text-blue-800 font-semibold text-base">
                📊 Showing {filteredQuestions.length} of {questions.length} questions
              </span>
            </div>
            
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 min-h-[200px]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        question.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {question.difficulty === 'beginner' ? '🟢' : question.difficulty === 'intermediate' ? '🟡' : '🔴'} {question.difficulty.toUpperCase()}
                      </span>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
                        {categories.find(c => c.id === question.category)?.name || question.category}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                        {question.subcategory}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-3">{question.question}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-red-500 hover:text-red-700 text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors ml-4"
                  >
                    🗑️ Delete
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {question.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        idx === question.correct_answer
                          ? 'bg-green-50 border-green-300 text-green-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + idx)}. {option}
                        {idx === question.correct_answer && ' ✅'}
                      </span>
                    </div>
                  ))}
                </div>
                
                {question.fun_fact && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <span className="text-blue-800 text-sm">
                      💡 <strong>Fun Fact:</strong> {question.fun_fact}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddCategory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="💻"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Color (Tailwind classes)</label>
                  <input
                    type="text"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="from-blue-500 to-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategories (comma separated)</label>
                  <input
                    type="text"
                    value={newCategory.subcategories}
                    onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="JavaScript, Python, Java"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Entry Fee</label>
                    <input
                      type="number"
                      value={newCategory.entry_fee}
                      onChange={(e) => setNewCategory({ ...newCategory, entry_fee: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prize Pool</label>
                    <input
                      type="number"
                      value={newCategory.prize_pool}
                      onChange={(e) => setNewCategory({ ...newCategory, prize_pool: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddQuestion(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Add New Question</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  {newQuestion.options.map((option, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={newQuestion.correct_answer === idx}
                        onChange={() => setNewQuestion({ ...newQuestion, correct_answer: idx })}
                        className="mr-3"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...newQuestion.options];
                          newOptions[idx] = e.target.value;
                          setNewQuestion({ ...newQuestion, options: newOptions });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subcategory</label>
                    <input
                      type="text"
                      value={newQuestion.subcategory}
                      onChange={(e) => setNewQuestion({ ...newQuestion, subcategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fun Fact</label>
                  <textarea
                    value={newQuestion.fun_fact}
                    onChange={(e) => setNewQuestion({ ...newQuestion, fun_fact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-20 resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddQuestion(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                  >
                    Add Question
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