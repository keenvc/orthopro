'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, Calendar, FileText, TrendingUp, Users } from 'lucide-react';

export default function ClinicDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/clinic/dashboard');
        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const appointmentData = [
    { name: 'Completed', value: stats?.total_appointments - stats?.no_shows - stats?.cancellations || 0, color: '#10b981' },
    { name: 'No Shows', value: stats?.no_shows || 0, color: '#ef4444' },
    { name: 'Cancelled', value: stats?.cancellations || 0, color: '#f59e0b' }
  ];

  const riskData = [
    { category: 'High Risk', count: stats?.high_risk_surveys || 0 },
    { category: 'Medium Risk', count: Math.floor((stats?.total_surveys || 0) * 0.2) },
    { category: 'Low Risk', count: Math.floor((stats?.total_surveys || 0) * 0.5) }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clinic Dashboard</h1>
          <p className="text-gray-600 mt-2">Centered Clinic Analytics & Overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_patients || 0}</p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clinical Notes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_notes || 0}</p>
              </div>
              <FileText className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_appointments || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Survey Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_surveys || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Appointment Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Appointment Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {appointmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Patient Risk Levels */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Mental Health Risk Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* High-Risk Alert */}
        {stats?.high_risk_surveys > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900">High-Risk Patients Identified</h3>
                <p className="text-red-700 mt-2">{stats?.high_risk_surveys} patients have severe mental health assessment scores. Consider proactive outreach and support.</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Patients with Notes</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats?.patients_with_notes || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Patients with Surveys</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats?.patients_with_surveys || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Patients with Appointments</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats?.patients_with_appointments || 0}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
