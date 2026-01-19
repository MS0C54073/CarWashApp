'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Cookies from 'js-cookie'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function CarWashDashboard() {
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const { data, isLoading } = useQuery({
    queryKey: ['carwash-dashboard'],
    queryFn: async () => {
      const token = Cookies.get('token')
      const response = await axios.get(`${API_URL}/carwash/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data.data
    },
  })

  const handleLogout = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">SUKA Car Wash Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/carwash/bookings" className="hover:text-gray-300">
              Bookings
            </Link>
            <Link href="/carwash/services" className="hover:text-gray-300">
              Services
            </Link>
            <button onClick={handleLogout} className="hover:text-gray-300">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold">{data?.totalBookings || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Pending</h3>
            <p className="text-3xl font-bold">{data?.pendingBookings || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">In Progress</h3>
            <p className="text-3xl font-bold">{data?.inProgressBookings || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Completed</h3>
            <p className="text-3xl font-bold">{data?.completedBookings || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow col-span-full">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">K{data?.totalRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
