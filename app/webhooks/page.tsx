'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { getWebhookEvents, subscribeToWebhookEvents } from '../../lib/supabase';
import { formatDateTime } from '../../lib/utils';
import { CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

export default function WebhooksPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getWebhookEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error loading webhook events:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();

    // Subscribe to real-time updates
    const subscription = subscribeToWebhookEvents((payload) => {
      setEvents(prev => [payload.new, ...prev]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            </div>
            <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto">
              {events.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <p>No webhook events yet.</p>
                  <p className="text-sm mt-2">Send a test webhook from the Inbox Health portal.</p>
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`px-6 py-4 cursor-pointer hover:bg-gray-50 ${
                      selectedEvent?.id === event.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                            {event.event_type}
                          </span>
                          {event.processing_status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {event.processing_status === 'pending' && (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          {event.processing_status === 'failed' && (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          ID: {event.inbox_health_event_id}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(event.received_at)}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event Detail */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
            </div>
            {selectedEvent ? (
              <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Event Type</label>
                    <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">
                      {selectedEvent.event_type}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        selectedEvent.processing_status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedEvent.processing_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedEvent.processing_status}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Inbox Health Event ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.inbox_health_event_id}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Signature Verified</label>
                    <p className="mt-1 text-sm">
                      {selectedEvent.signature_verified ? (
                        <span className="text-green-600">✓ Yes</span>
                      ) : (
                        <span className="text-red-600">✗ No</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Received At</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedEvent.received_at)}</p>
                  </div>

                  {selectedEvent.processed_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Processed At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedEvent.processed_at)}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Retry Count</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.retry_count || 0}</p>
                  </div>

                  {selectedEvent.error_message && (
                    <div>
                      <label className="text-sm font-medium text-red-700">Error Message</label>
                      <p className="mt-1 text-sm text-red-900 bg-red-50 p-2 rounded">
                        {selectedEvent.error_message}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Raw Payload</label>
                    <pre className="mt-1 text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                      {JSON.stringify(selectedEvent.raw_payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Select an event to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
