'use client'

import { UserActivity, TimeRange } from '@/types/admin'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { CHART_COLORS } from '@/types/admin'

interface UserActivityAnalyticsProps {
  data: UserActivity
  timeRange: TimeRange
}

export function UserActivityAnalytics({ data, timeRange }: UserActivityAnalyticsProps) {
  // Prepare chart data
  const deviceData = [
    { name: 'Desktop', value: data.deviceTypes.desktop, color: CHART_COLORS.primary },
    { name: 'Mobile', value: data.deviceTypes.mobile, color: CHART_COLORS.secondary },
    { name: 'Tablet', value: data.deviceTypes.tablet, color: CHART_COLORS.accent }
  ]

  const geographicData = Object.entries(data.geographicData).map(([country, value]) => ({
    name: country,
    value,
    color: CHART_COLORS.primary
  }))

  const sessionDistributionData = data.sessionDistribution.map(item => ({
    name: item.duration,
    value: item.count,
    percentage: Math.round((item.count / data.totalSessions) * 100)
  }))

  const userJourneyData = data.userJourney.map(step => ({
    name: step.step,
    value: step.users,
    dropoff: step.dropoffRate
  }))

  const peakHoursData = Array.from({ length: 24 }, (_, hour) => ({
    hour: hour.toString().padStart(2, '0') + ':00',
    activity: data.peakUsageHours.includes(hour) ? Math.random() * 50 + 50 : Math.random() * 30 + 10
  }))

  const formatTooltip = (value: any, name: string) => {
    if (name === 'activity') return [`${Math.round(value)}%`, 'Activity Level']
    if (name === 'dropoff') return [`${value}%`, 'Dropoff Rate']
    return [value, name]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">User Activity Analytics</h3>
        <p className="text-gray-600">
          Analyze user behavior, session patterns, and engagement metrics for {timeRange.label.toLowerCase()}.
        </p>
      </div>

      {/* Activity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Total Sessions</p>
              <p className="text-3xl font-bold">{data.totalSessions.toLocaleString()}</p>
            </div>
            <div className="bg-indigo-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm font-medium">Avg Session Duration</p>
              <p className="text-3xl font-bold">{Math.round(data.averageSessionDuration)}m</p>
            </div>
            <div className="bg-teal-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">Return Rate</p>
              <p className="text-3xl font-bold">{Math.round(data.returnRate)}%</p>
            </div>
            <div className="bg-pink-400 bg-opacity-30 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Peak Hours</p>
              <p className="text-3xl font-bold">{data.peakUsageHours.length}</p>
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
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Device Usage Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Session Duration Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Duration Distribution</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'value' ? 'Sessions' : name]} />
                <Bar dataKey="value" fill={CHART_COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Peak Usage Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage Pattern (24 Hours)</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={peakHoursData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={formatTooltip} />
              <Area 
                type="monotone" 
                dataKey="activity" 
                stroke={CHART_COLORS.primary} 
                fill={CHART_COLORS.primary}
                fillOpacity={0.6}
                name="Activity Level"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Journey and Geographic Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Journey Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">User Journey Flow</h4>
          <div className="space-y-4">
            {userJourneyData.map((step, index) => {
              const percentage = index === 0 ? 100 : (step.value / userJourneyData[0].value) * 100
              return (
                <div key={step.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{step.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">{step.value} users</span>
                      <span className="text-xs text-gray-500 ml-2">({Math.round(percentage)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  {step.dropoff > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      {step.dropoff}% dropoff rate
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h4>
          <div className="space-y-3">
            {geographicData.slice(0, 6).map((country, index) => {
              const percentage = (country.value / geographicData.reduce((sum, c) => sum + c.value, 0)) * 100
              return (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                      index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{country.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{country.value}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Session Quality</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Duration</span>
              <span className="font-semibold text-gray-900">{Math.round(data.averageSessionDuration)} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Return Rate</span>
              <span className="font-semibold text-gray-900">{Math.round(data.returnRate)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <span className="font-semibold text-gray-900">{data.totalSessions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Peak Activity</h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Most active hours:</p>
            <div className="flex flex-wrap gap-2">
              {data.peakUsageHours.map(hour => (
                <span key={hour} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Device Preferences</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Desktop</span>
              <span className="font-semibold text-gray-900">{data.deviceTypes.desktop}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mobile</span>
              <span className="font-semibold text-gray-900">{data.deviceTypes.mobile}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tablet</span>
              <span className="font-semibold text-gray-900">{data.deviceTypes.tablet}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-indigo-900 mb-3">User Activity Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-indigo-800">Total Sessions:</span>
            <p className="text-indigo-700">{data.totalSessions.toLocaleString()}</p>
          </div>
          <div>
            <span className="font-medium text-indigo-800">Best Completion:</span>
            <p className="text-indigo-700">
              {userJourneyData.reduce((best, current) => 
                current.value > best.value ? current : best
              ).name}
            </p>
          </div>
          <div>
            <span className="font-medium text-indigo-800">Primary Device:</span>
            <p className="text-indigo-700">
              {deviceData.reduce((primary, current) => 
                current.value > primary.value ? current : primary
              ).name}
            </p>
          </div>
          <div>
            <span className="font-medium text-indigo-800">Time Period:</span>
            <p className="text-indigo-700">{timeRange.label}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
