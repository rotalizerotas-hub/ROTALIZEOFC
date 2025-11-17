'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm } from '@/components/auth/LoginForm'
import { DriversManagement } from '@/components/drivers/DriversManagement'

export default function MotoboyPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">R</span>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <DriversManagement />
}