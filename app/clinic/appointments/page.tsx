'use client';

import { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import { formatDate } from '../../../lib/utils';
import { Search, Calendar, Clock, User, AlertCircle } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAppointments() {
      try {
        const response = await fetch('/api/clinic/appointments');
        const result = await response.json();
        if (result.success) {
          setAppointments(result.data);
          setFilteredAppointments(result.data);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(appt =>
        `${appt.patients?.first_name} ${appt.patients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.patients?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.patients?.cell_phone?.includes(searchTerm) ||
        appt.appointment_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'no_show':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (datetime: string) => {
    try {
      return new Date(datetime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const noShowCount = appointments.filter(a => a.no_show).length;
  const cancelledCount = appointments.filter(a => a.cancelled).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Upcoming & Scheduled Appointments</p>
        </div>

        {/* Stats Cards */}
        {(noShowCount > 0 || cancelledCount > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {noShowCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-900">No-Shows</h3>
                    <p className="text-red-700 text-sm mt-1">{noShowCount} appointments not attended</p>
                  </div>
                </div>
              </div>
            )}
            {cancelledCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Cancellations</h3>
                    <p className="text-yellow-700 text-sm mt-1">{cancelledCount} appointments cancelled</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient name, email, phone, or appointment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            filteredAppointments.map(appt => (
              <div key={appt.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {appt.patients?.first_name} {appt.patients?.last_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(appt.status)}`}>
                        {appt.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {appt.no_show && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">No Show</span>}
                      {appt.cancelled && <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Cancelled</span>}
                    </div>

                    <p className="text-gray-600 font-medium mb-3">{appt.appointment_type}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(appt.appointment_date)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatTime(appt.appointment_date)}
                      </div>
                      {appt.doctors?.first_name && (
                        <div className="flex items-center text-gray-600">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {appt.doctors.first_name} {appt.doctors.last_name}
                        </div>
                      )}
                      {appt.appointment_mode && (
                        <div className="text-gray-600 capitalize">
                          {appt.appointment_mode.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>

                    {appt.patients?.cell_phone && (
                      <p className="text-sm text-gray-500 mt-3">{appt.patients.cell_phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
