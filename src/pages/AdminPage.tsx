import { useState, useEffect } from 'react';
import axios from 'axios';

interface DashboardStats {
  total_revenue: number;
  total_bookings: number;
  active_spots: number;
  utilization_rate: number;
}

interface Booking {
  id: string;
  booking_ref: string;
  customer_email: string;
  spot_id: string;
  booking_date: string;
  total_price: number;
  status: string;
}

const AdminPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        
        const statsRes = await axios.get(`${API_BASE}/api/v1/dashboard/stats`);
        setStats(statsRes.data);

        const bookingsRes = await axios.get(`${API_BASE}/api/v1/dashboard/recent-bookings`);
        setBookings(bookingsRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError("Failed to load dashboard data. Ensure Backend is running.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold font-mono">
            ₦{(stats?.total_revenue || 0).toLocaleString()}
          </p>
          </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-2xl font-bold">{stats?.total_bookings || 0}</p>
        </div>

        {/* Active Spots */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Active Spots</p>
          <p className="text-2xl font-bold">{stats?.active_spots || 0}</p>
        </div>

        {/* Utilization */}
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm">Utilization Rate</p>
          <p className="text-2xl font-bold">{stats?.utilization_rate || 0}%</p>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spot ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-600">
                      {booking.booking_ref}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.customer_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.spot_id ? `...${booking.spot_id.slice(-4)}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.booking_date}
                    </td>
                    {/* UPDATED: Uses Naira (₦) Symbol */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 font-mono">
                      ₦{(booking.total_price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No bookings found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;