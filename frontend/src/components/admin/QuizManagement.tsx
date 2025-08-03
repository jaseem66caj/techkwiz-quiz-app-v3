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
    if (adminUser?.token) {
      fetchCategories();
      fetchQuestions();
    }
  }, [adminUser]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${adminUser?.token || ''}`,
    'Content-Type': 'application/json'
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/questions`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        ...newCategory,
        subcategories: newCategory.subcategories.split(',').map(s => s.trim())
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData)
      });
      
      if (response.ok) {
        setShowAddCategory(false);
        setNewCategory({
          name: '', icon: '', color: '', description: '', subcategories: '',
          entry_fee: 100, prize_pool: 2000
        });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newQuestion)
      });
      
      if (response.ok) {
        setShowAddQuestion(false);
        setNewQuestion({
          question: '', options: ['', '', '', ''], correct_answer: 0,
          difficulty: 'beginner', fun_fact: '', category: '', subcategory: ''
        });
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const getQuestionCount = (categoryId: string) => {
    return questions.filter(q => q.category === categoryId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading quiz data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your quiz categories and questions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-sm text-gray-500">Total Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
          <div className="text-sm text-gray-500">Total Questions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{questions.filter(q => q.difficulty === 'beginner').length}</div>
          <div className="text-sm text-gray-500">Beginner Questions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{questions.filter(q => q.difficulty === 'advanced').length}</div>
          <div className="text-sm text-gray-500">Advanced Questions</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveSubTab('questions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'questions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Questions ({questions.length})
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="max-w-lg">
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowAddCategory(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories
              .filter(category => 
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((category) => (
              <div key={category.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Entry Fee</dt>
                      <dd className="text-lg font-semibold text-green-600">{category.entry_fee} coins</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Questions</dt>
                      <dd className="text-lg font-semibold text-indigo-600">{getQuestionCount(category.id)}</dd>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeSubTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {questions
                .filter(question => {
                  if (selectedCategory !== 'all' && question.category !== selectedCategory) return false;
                  if (selectedDifficulty !== 'all' && question.difficulty !== selectedDifficulty) return false;
                  if (searchTerm && !question.question.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                  return true;
                })
                .map((question) => (
                <li key={question.id}>
                  <div className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 mb-2">{question.question}</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-2 rounded border ${
                                idx === question.correct_answer
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
              className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategories</label>
                  <input
                    type="text"
                    value={newCategory.subcategories}
                    onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
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
              className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Add New Question</h3>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fun Fact</label>
                  <textarea
                    value={newQuestion.fun_fact}
                    onChange={(e) => setNewQuestion({ ...newQuestion, fun_fact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://978348f0-0d46-419d-a947-ead723510d24.preview.emergentagent.com"}/api/admin/categories`, {
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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://978348f0-0d46-419d-a947-ead723510d24.preview.emergentagent.com"}/api/admin/questions`, {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://978348f0-0d46-419d-a947-ead723510d24.preview.emergentagent.com"}/api/admin/categories`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://978348f0-0d46-419d-a947-ead723510d24.preview.emergentagent.com"}/api/admin/questions`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://978348f0-0d46-419d-a947-ead723510d24.preview.emergentagent.com"}/api/admin/categories/${categoryId}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://978348f0-0d46-419d-a947-ead723510d24.preview.emergentagent.com"}/api/admin/questions/${questionId}`, {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">Quiz Management</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your quiz categories and questions</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
          <div className="text-sm text-gray-500">Total Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
          <div className="text-sm text-gray-500">Total Questions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{questions.filter(q => q.difficulty === 'beginner').length}</div>
          <div className="text-sm text-gray-500">Beginner Questions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{questions.filter(q => q.difficulty === 'advanced').length}</div>
          <div className="text-sm text-gray-500">Advanced Questions</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveSubTab('questions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'questions'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Questions ({questions.length})
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="max-w-lg">
                <label htmlFor="search" className="sr-only">Search categories</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">🔍</span>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddCategory(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="mr-2">✨</span>
                Add Category
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories
              .filter(category => 
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((category) => (
              <div
                key={category.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{category.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="ml-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Entry Fee</dt>
                      <dd className="text-lg font-semibold text-green-600">{category.entry_fee} coins</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Prize Pool</dt>
                      <dd className="text-lg font-semibold text-blue-600">{category.prize_pool} coins</dd>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Questions</dt>
                    <dd className="text-lg font-semibold text-indigo-600">{getQuestionCount(category.id)}</dd>
                  </div>
                  
                  <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Topics</dt>
                    <div className="flex flex-wrap gap-1">
                      {category.subcategories.slice(0, 2).map((sub, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {sub}
                        </span>
                      ))}
                      {category.subcategories.length > 2 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          +{category.subcategories.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeSubTab === 'questions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="question-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Questions
                </label>
                <input
                  type="text"
                  id="question-search"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category-filter"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty-filter"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowAddQuestion(true)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <span className="mr-2">➕</span>
                  Add Question
                </button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {questions
                .filter(question => {
                  if (selectedCategory !== 'all' && question.category !== selectedCategory) return false;
                  if (selectedDifficulty !== 'all' && question.difficulty !== selectedDifficulty) return false;
                  if (searchTerm && !question.question.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                  return true;
                })
                .map((question) => (
                <li key={question.id}>
                  <div className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            question.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {categories.find(c => c.id === question.category)?.name || question.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-2">{question.question}</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {question.options.map((option, idx) => (
                            <div
                              key={idx}
                              className={`text-xs p-2 rounded border ${
                                idx === question.correct_answer
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              <span className="font-medium mr-1">{String.fromCharCode(65 + idx)}.</span>
                              {option}
                            </div>
                          ))}
                        </div>
                        {question.fun_fact && (
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {question.fun_fact}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
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