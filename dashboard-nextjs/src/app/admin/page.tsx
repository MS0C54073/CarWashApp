'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Cookies from 'js-cookie'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const token = Cookies.get('token')
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
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
          <h1 className="text-xl font-bold">SUKA Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/admin/drivers" className="hover:text-gray-300">
              Drivers
            </Link>
            <Link href="/admin/bookings" className="hover:text-gray-300">
              Bookings
            </Link>
            <Link href="/admin/reports" className="hover:text-gray-300">
              Reports
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
            <h3 className="text-gray-600 text-sm uppercase mb-2">Pending Pickups</h3>
            <p className="text-3xl font-bold">{data?.pendingPickups || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Completed Washes</h3>
            <p className="text-3xl font-bold">{data?.completedWashes || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">K{data?.totalRevenue?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Clients</h3>
            <p className="text-3xl font-bold">{data?.totalClients || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Drivers</h3>
            <p className="text-3xl font-bold">{data?.totalDrivers || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm uppercase mb-2">Total Car Washes</h3>
            <p className="text-3xl font-bold">{data?.totalCarWashes || 0}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
