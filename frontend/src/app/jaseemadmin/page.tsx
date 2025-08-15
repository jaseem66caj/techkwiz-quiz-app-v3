'use client'

import { useAdminAuth } from '@/hooks/useAdminAuth'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboardV2 from '@/components/admin/v2/AdminDashboardV2'

export default function JaseemAdminPage() {
  const { isAuthenticated, isLoading } = useAdminAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return <AdminDashboardV2 />
}
