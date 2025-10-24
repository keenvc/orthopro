'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from './components/Navigation';
import { getDashboardStats, getWebhookEvents } from '@/lib/supabase';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Users, FileText, CreditCard, Webhook, DollarSign, Activity } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, eventsData] = await Promise.all([
          getDashboardStats(),
          getWebhookEvents()
        ]);
        setStats(statsData);
        setRecentEvents(eventsData.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Patients"
            value={stats.patientCount}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            href="/patients"
          />
          <StatCard
            title="Invoices"
            value={stats.invoiceCount}
            icon={<FileText className="w-6 h-6" />}
            color="purple"
            href="/invoices"
          />
          <StatCard
            title="Payments"
            value={stats.paymentCount}
            icon={<CreditCard className="w-6 h-6" />}
            color="green"
            href="/payments"
          />
          <StatCard
            title="Webhook Events"
            value={stats.webhookCount}
            icon={<Webhook className="w-6 h-6" />}
            color="orange"
            href="/webhooks"
          />
          <StatCard
            title="Total Balance"
            value={formatCurrency(stats.totalBalanceCents)}
            icon={<DollarSign className="w-6 h-6" />}
            color="red"
          />
          <StatCard
            title="Sync Status"
            value="100%"
            icon={<Activity className="w-6 h-6" />}
            color="teal"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Webhook Events</h2>
          </div>
          <div className="divide-y">
            {recentEvents.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No webhook events yet. Send a test webhook from the Inbox Health portal.
              </div>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          event.processing_status === 'completed' ? 'bg-green-100 text-green-800' :
                          event.processing_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.event_type}
                        </span>
                        {event.signature_verified && (
                          <span className="text-xs text-green-600">✓ Verified</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Event ID: {event.inbox_health_event_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">{formatDateTime(event.received_at)}</p>
                      <p className="text-xs text-gray-500">
                        {event.processing_status === 'completed' ? 'Processed' : 'Processing'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t">
            <Link href="/webhooks" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all events →
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusItem label="Webhook Endpoint" value="https://ih003.advancedcare.ai/webhook/" status="operational" />
            <StatusItem label="Database" value="Supabase PostgreSQL" status="operational" />
            <StatusItem label="SSL Certificate" value="Valid until 2026-01-20" status="operational" />
            <StatusItem label="Last Sync" value="Active (5 min intervals)" status="operational" />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, href }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    teal: 'bg-teal-500'
  };

  const content = (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function StatusItem({ label, value, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-1">{value}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs font-medium text-gray-600">
          {status === 'operational' ? 'Operational' : 'Down'}
        </span>
      </div>
    </div>
  );
}
