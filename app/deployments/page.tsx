'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DeploymentStats {
  stat_date: string;
  uptime_percentage: number;
  response_time_ms: number;
  error_count: number;
  success_count: number;
  total_requests: number;
}

interface DeploymentLog {
  id: string;
  log_type: string;
  message: string;
  created_at: string;
}

interface Deployment {
  id: string;
  name: string;
  display_name: string;
  url: string;
  health_check_url?: string;
  platform: string;
  repository_url?: string;
  branch: string;
  status: string;
  health_status: string;
  last_deployed_at?: string;
  last_health_check?: string;
  environment: string;
  notes?: string;
  deployment_logs: DeploymentLog[];
  deployment_stats: DeploymentStats[];
}

export default function DeploymentsPage() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    url: '',
    health_check_url: '',
    platform: 'render',
    repository_url: '',
    branch: 'main',
    environment: 'production',
    notes: '',
  });

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(() => fetchDeployments(), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeployments = async () => {
    try {
      const response = await fetch('/api/deployments');
      if (response.ok) {
        const data = await response.json();
        setDeployments(data);
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async (id: string) => {
    try {
      const response = await fetch(`/api/deployments/${id}/health-check`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchDeployments();
      }
    } catch (error) {
      console.error('Error running health check:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          display_name: '',
          url: '',
          health_check_url: '',
          platform: 'render',
          repository_url: '',
          branch: 'main',
          environment: 'production',
          notes: '',
        });
        await fetchDeployments();
      }
    } catch (error) {
      console.error('Error creating deployment:', error);
    }
  };

  const deleteDeployment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deployment?')) return;

    try {
      const response = await fetch(`/api/deployments/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchDeployments();
      }
    } catch (error) {
      console.error('Error deleting deployment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'unhealthy':
        return '✗';
      case 'degraded':
        return '⚠';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading deployments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deployment Monitor</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Deployment
          </button>
        </div>

        {deployments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No deployments configured yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Deployment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deployments.map((deployment) => (
              <div key={deployment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{deployment.display_name}</h2>
                    <p className="text-sm text-gray-500">{deployment.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deployment.health_status)}`}>
                    {getStatusIcon(deployment.health_status)} {deployment.health_status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">URL:</span>
                    <a
                      href={deployment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {deployment.url}
                    </a>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Platform:</span>
                    <span className="ml-2 text-gray-900 capitalize">{deployment.platform}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Environment:</span>
                    <span className="ml-2 text-gray-900 capitalize">{deployment.environment}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Branch:</span>
                    <span className="ml-2 text-gray-900">{deployment.branch}</span>
                  </div>
                </div>

                {deployment.deployment_stats.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Last 7 Days Stats</h3>
                    {deployment.deployment_stats.slice(0, 1).map((stat) => (
                      <div key={stat.stat_date} className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Uptime:</span>
                          <span className="ml-1 font-medium">{Number(stat.uptime_percentage).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Response:</span>
                          <span className="ml-1 font-medium">{stat.response_time_ms}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Success:</span>
                          <span className="ml-1 font-medium">{stat.success_count}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Errors:</span>
                          <span className="ml-1 font-medium">{stat.error_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {deployment.last_health_check && (
                  <div className="text-xs text-gray-500 mb-4">
                    Last checked: {new Date(deployment.last_health_check).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => runHealthCheck(deployment.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Check Health
                  </button>
                  <button
                    onClick={() => setSelectedDeployment(deployment)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteDeployment(deployment.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add New Deployment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name (slug)</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="orthopro"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="OrthoPro Clinic"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="https://orthopro.advancedcare.co"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Health Check URL (optional)</label>
                  <input
                    type="url"
                    value={formData.health_check_url}
                    onChange={(e) => setFormData({ ...formData, health_check_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="https://orthopro.advancedcare.co/api/health"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Platform</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="render">Render</option>
                      <option value="vercel">Vercel</option>
                      <option value="netlify">Netlify</option>
                      <option value="aws">AWS</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch</label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="main"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Environment</label>
                    <select
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Repository URL (optional)</label>
                  <input
                    type="url"
                    value={formData.repository_url}
                    onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                    placeholder="Additional notes about this deployment..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Deployment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedDeployment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedDeployment.display_name}</h2>
                <button
                  onClick={() => setSelectedDeployment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="text-gray-900">{selectedDeployment.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Health Status</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDeployment.health_status)}`}>
                      {getStatusIcon(selectedDeployment.health_status)} {selectedDeployment.health_status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">URL</h3>
                    <a href={selectedDeployment.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedDeployment.url}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Platform</h3>
                    <p className="text-gray-900 capitalize">{selectedDeployment.platform}</p>
                  </div>
                </div>

                {selectedDeployment.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                    <p className="text-gray-900">{selectedDeployment.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-2">Recent Logs</h3>
                  <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
                    {selectedDeployment.deployment_logs.map((log) => (
                      <div key={log.id} className="mb-2 text-sm">
                        <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded text-xs">{log.log_type}</span>
                        <p className="text-gray-900 mt-1">{log.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Statistics (Last 7 Days)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Uptime</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Response Time</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Requests</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Success</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedDeployment.deployment_stats.map((stat) => (
                          <tr key={stat.stat_date}>
                            <td className="px-4 py-2 text-sm">{new Date(stat.stat_date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{Number(stat.uptime_percentage).toFixed(1)}%</td>
                            <td className="px-4 py-2 text-sm">{stat.response_time_ms}ms</td>
                            <td className="px-4 py-2 text-sm">{stat.total_requests}</td>
                            <td className="px-4 py-2 text-sm text-green-600">{stat.success_count}</td>
                            <td className="px-4 py-2 text-sm text-red-600">{stat.error_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
