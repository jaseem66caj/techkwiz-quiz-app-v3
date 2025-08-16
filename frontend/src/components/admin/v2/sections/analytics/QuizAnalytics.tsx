'use client'

import { QuizMetrics, TimeRange } from '@/types/admin'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { CHART_COLORS } from '@/types/admin'

interface QuizAnalyticsProps {
  data: QuizMetrics
  timeRange: TimeRange
}

export function QuizAnalytics({ data, timeRange }: QuizAnalyticsProps) {
  // Prepare chart data
  const categoryChartData = data.categoryPerformance.map(category => ({
    name: category.category,
    successRate: Math.round(category.successRate),
    questionsAnswered: category.questionsAnswered,
    averageTime: Math.round(category.averageTime)
  }))

  const difficultyChartData = [
    { name: 'Beginner', value: data.difficultyDistribution.beginner, color: CHART_COLORS.primary },
    { name: 'Intermediate', value: data.difficultyDistribution.intermediate, color: CHART_COLORS.secondary },
    { name: 'Advanced', value: data.difficultyDistribution.advanced, color: CHART_COLORS.accent }
  ]

  const timeBasedChartData = data.timeBasedPerformance.slice(-14).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    questionsAnswered: item.questionsAnswered,
    successRate: Math.round(item.successRate),
    activeUsers: item.activeUsers
  }))

  const formatTooltip = (value: any, name: string) => {
    if (name === 'successRate') return [`${value}%`, 'Success Rate']
    if (name === 'averageTime') return [`${value}s`, 'Avg Time']
    return [value, name]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Performance Analytics</h3>
        <p className="text-gray-600">
          Analyze quiz performance, category trends, and user engagement for {timeRange.label.toLowerCase()}.
        </p>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Questions</p>
              <p className="text-3xl font-bold">{data.totalQuestions}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold">{Math.round(data.successRate)}%</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Avg Session Time</p>
              <p className="text-3xl font-bold">{Math.round(data.averageSessionTime)}m</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Questions Answered</p>
              <p className="text-3xl font-bold">{data.questionsAnswered}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Performance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={formatTooltip} />
                <Bar dataKey="successRate" fill={CHART_COLORS.primary} name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Question Difficulty Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Time-based Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Activity Trends (Last 14 Days)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeBasedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={formatTooltip} />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="questionsAnswered" 
                stroke={CHART_COLORS.primary} 
                strokeWidth={2}
                name="Questions Answered"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="successRate" 
                stroke={CHART_COLORS.secondary} 
                strokeWidth={2}
                name="Success Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Popular Categories and Top Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Categories</h4>
          <div className="space-y-4">
            {data.popularCategories.map((category, index) => {
              const categoryData = data.categoryPerformance.find(c => c.category === category)
              return (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-sm text-gray-500">
                        {categoryData?.questionsAnswered || 0} questions answered
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {Math.round(categoryData?.successRate || 0)}%
                    </p>
                    <p className="text-sm text-gray-500">success rate</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Summary</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Category</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Answered</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Success</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {data.categoryPerformance.slice(0, 5).map((category) => (
                  <tr key={category.category} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-sm text-gray-900">{category.category}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 text-right">{category.questionsAnswered}</td>
                    <td className="py-2 px-3 text-sm text-gray-600 text-right">{Math.round(category.successRate)}%</td>
                    <td className="py-2 px-3 text-sm text-gray-600 text-right">{Math.round(category.averageTime)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">Quiz Analytics Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Total Correct:</span>
            <p className="text-blue-700">{data.correctAnswers} answers</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Total Incorrect:</span>
            <p className="text-blue-700">{data.incorrectAnswers} answers</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Best Category:</span>
            <p className="text-blue-700">
              {data.categoryPerformance.reduce((best, current) => 
                current.successRate > best.successRate ? current : best
              ).category}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Time Period:</span>
            <p className="text-blue-700">{timeRange.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
