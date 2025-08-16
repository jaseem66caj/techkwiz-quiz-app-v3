'use client'

import { RewardMetrics, TimeRange } from '@/types/admin'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import { CHART_COLORS } from '@/types/admin'

interface RewardAnalyticsProps {
  data: RewardMetrics
  timeRange: TimeRange
}

export function RewardAnalytics({ data, timeRange }: RewardAnalyticsProps) {
  // Prepare chart data
  const coinDistributionData = [
    { name: 'Correct Answers', value: data.coinDistribution.correct, color: CHART_COLORS.primary },
    { name: 'Incorrect Answers', value: data.coinDistribution.incorrect, color: CHART_COLORS.secondary },
    { name: 'Bonus Questions', value: data.coinDistribution.bonus, color: CHART_COLORS.accent },
    { name: 'Achievements', value: data.coinDistribution.achievements, color: CHART_COLORS.purple }
  ]

  const rewardTrendsData = data.rewardTrends.slice(-14).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    coinsEarned: item.coinsEarned,
    achievementsUnlocked: item.achievementsUnlocked,
    activeUsers: item.activeUsers
  }))

  const formatTooltip = (value: any, name: string) => {
    if (name === 'coinsEarned') return [`${value} coins`, 'Coins Earned']
    if (name === 'achievementsUnlocked') return [`${value}`, 'Achievements Unlocked']
    if (name === 'activeUsers') return [`${value}`, 'Active Users']
    return [value, name]
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat().format(value)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Reward System Analytics</h3>
        <p className="text-gray-600">
          Track coin distribution, achievement progress, and user engagement for {timeRange.label.toLowerCase()}.
        </p>
      </div>

      {/* Reward Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Total Coins Earned</p>
              <p className="text-3xl font-bold">{formatCurrency(data.totalCoinsEarned)}</p>
            </div>
            <div className="bg-yellow-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Achievements Unlocked</p>
              <p className="text-3xl font-bold">{data.achievementsUnlocked}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Users</p>
              <p className="text-3xl font-bold">{data.activeUsers}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Engagement Rate</p>
              <p className="text-3xl font-bold">{Math.round(data.engagementRate)}%</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coin Distribution Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Coin Distribution by Source</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coinDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {coinDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${formatCurrency(value as number)} coins`, 'Coins']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coin Distribution Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Coin Sources Breakdown</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coinDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${formatCurrency(value as number)} coins`, 'Coins']} />
                <Bar dataKey="value" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reward Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Reward System Trends (Last 14 Days)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rewardTrendsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={formatTooltip} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="coinsEarned" 
                stackId="1"
                stroke={CHART_COLORS.primary} 
                fill={CHART_COLORS.primary}
                fillOpacity={0.6}
                name="Coins Earned"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="achievementsUnlocked" 
                stroke={CHART_COLORS.purple} 
                strokeWidth={2}
                name="Achievements Unlocked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reward System Health and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coin Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Coin Statistics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">💰</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Average Coins per Session</p>
                  <p className="text-sm text-gray-500">Per active user session</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(data.averageCoinsPerSession)}
                </p>
                <p className="text-sm text-gray-500">coins</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.coinDistribution.correct)}</p>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.coinDistribution.bonus)}</p>
                <p className="text-sm text-gray-600">Bonus Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Achievement System Health</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🏆</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Unlocks</p>
                  <p className="text-sm text-gray-500">Across all achievements</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{data.achievementsUnlocked}</p>
                <p className="text-sm text-gray-500">unlocks</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Engagement Rate</span>
                <span className="text-sm text-gray-600">{Math.round(data.engagementRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${data.engagementRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{data.activeUsers}</p>
                <p className="text-xs text-gray-600">Active Users</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-orange-600">
                  {data.activeUsers > 0 ? Math.round(data.achievementsUnlocked / data.activeUsers * 100) / 100 : 0}
                </p>
                <p className="text-xs text-gray-600">Avg per User</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-yellow-900 mb-3">Reward System Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-yellow-800">Total Value:</span>
            <p className="text-yellow-700">{formatCurrency(data.totalCoinsEarned)} coins</p>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Most Rewarding:</span>
            <p className="text-yellow-700">
              {coinDistributionData.reduce((max, current) => 
                current.value > max.value ? current : max
              ).name}
            </p>
          </div>
          <div>
            <span className="font-medium text-yellow-800">User Participation:</span>
            <p className="text-yellow-700">{Math.round(data.engagementRate)}% engaged</p>
          </div>
          <div>
            <span className="font-medium text-yellow-800">Time Period:</span>
            <p className="text-yellow-700">{timeRange.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
