'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Activity, Brain, FileText } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import ClinicalPipelineBanner from '../../components/ClinicalPipelineBanner';
import PersonalInfoPanel from '../components/PersonalInfoPanel';
import SymptomsPanel from '../components/SymptomsPanel';
import DiagnosesPanel from '../components/DiagnosesPanel';
import PrescriptionPanel from '../components/PrescriptionPanel';

export default function DoctorWorkspace({ params }: { params: { intakeId: string } }) {
  const { intakeId } = params;
  const [intake, setIntake] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchIntakeData();
  }, [intakeId]);

  const fetchIntakeData = async () => {
    try {
      const response = await fetch(`/api/intake?id=${intakeId}`);
      if (response.ok) {
        const result = await response.json();
        setIntake(result.data);
      } else {
        throw new Error('Failed to fetch intake');
      }
    } catch (error) {
      console.error('Failed to load intake:', error);
      alert('Failed to load intake data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient intake...</p>
        </div>
      </div>
    );
  }

  if (!intake) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation userEmail="doctor@orthopro.com" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Intake Not Found</h2>
            <p className="text-gray-600 mb-4">The requested intake could not be found.</p>
            <button
              onClick={() => router.push('/doctor')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation userEmail="doctor@orthopro.com" />
      
      {/* Clinical Pipeline Banner */}
      <ClinicalPipelineBanner intakeId={intakeId} />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/doctor')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Intake List
        </button>

        {/* Patient Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Patient Intake Review
              </h1>
              <p className="text-sm text-gray-600">
                Submitted: {new Date(intake.submitted_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Intake ID: <span className="font-mono">{intakeId.slice(0, 8)}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                intake.status === 'completed' ? 'bg-green-100 text-green-800' :
                intake.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {intake.status === 'pending' ? 'Pending Review' :
                 intake.status === 'in_review' ? 'In Review' :
                 'Completed'}
              </span>
            </div>
          </div>
        </div>

        {/* 4-Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel 1: Personal Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h3>
            <PersonalInfoPanel data={intake} />
          </div>
          
          {/* Panel 2: Current Symptoms */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Current Symptoms
            </h3>
            <SymptomsPanel data={intake} />
          </div>
          
          {/* Panel 3: AI Diagnoses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              AI-Suggested Diagnoses
            </h3>
            <DiagnosesPanel diagnoses={intake.ai_diagnoses} />
          </div>
          
          {/* Panel 4: Prescription/Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900">
              <FileText className="w-5 h-5 mr-2 text-orange-600" />
              Prescription & Actions
            </h3>
            <PrescriptionPanel intakeId={intakeId} />
          </div>
        </div>
      </div>
    </div>
  );
}
