'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { Users, Clock, CheckCircle, AlertCircle, ArrowRight, Brain, Calendar } from 'lucide-react';

export default function DoctorDashboard() {
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, in_review: 0, completed: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchIntakes();
  }, []);

  const fetchIntakes = async () => {
    try {
      const response = await fetch('/api/intake?limit=50');
      if (response.ok) {
        const result = await response.json();
        setIntakes(result.data || []);
        
        // Calculate stats
        const pending = result.data.filter((i: any) => i.status === 'pending').length;
        const in_review = result.data.filter((i: any) => i.status === 'in_review').length;
        const completed = result.data.filter((i: any) => i.status === 'completed').length;
        setStats({ pending, in_review, completed });
      }
    } catch (error) {
      console.error('Failed to fetch intakes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userEmail="doctor@orthopro.com" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Doctor Dashboard
          </h1>
          <p className="text-gray-600">
            Review worker injury intakes and manage patient care
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={<Clock className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="In Review"
            value={stats.in_review}
            icon={<AlertCircle className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Intakes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Intakes</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading intakes...</p>
            </div>
          ) : intakes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No intakes submitted yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {intakes.map((intake) => (
                <IntakeRow
                  key={intake.id}
                  intake={intake}
                  onClick={() => router.push(`/doctor/workspace/${intake.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function IntakeRow({ intake, onClick }: any) {
  const statusColors: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    in_review: 'In Review',
    completed: 'Completed'
  };

  // Get primary body part and top diagnosis
  const primaryBodyPart = intake.affected_body_parts?.[0] || 'N/A';
  const topDiagnosis = intake.ai_diagnoses?.[0]?.name || 'No diagnosis';
  const painLevel = intake.pain_level || 0;

  return (
    <button
      onClick={onClick}
      className="w-full px-6 py-4 hover:bg-gray-50 transition text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[intake.status]}`}>
              {statusLabels[intake.status]}
            </span>
            <span className="text-xs text-gray-500">
              ID: {intake.id.slice(0, 8)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Submitted
              </p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(intake.submitted_at).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Affected Area</p>
              <p className="text-sm font-medium text-gray-900">{primaryBodyPart}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Top AI Diagnosis
              </p>
              <p className="text-sm font-medium text-gray-900 truncate">{topDiagnosis}</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Pain Level</p>
              <p className="text-sm font-medium text-gray-900">
                {painLevel}/10
                <span className="ml-2">
                  {painLevel <= 3 ? '😊' : painLevel <= 6 ? '😐' : '😣'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="ml-4">
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </button>
  );
}
