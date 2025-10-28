'use client';

import { User, Calendar, Briefcase, FileText, AlertTriangle, Clock, MapPin } from 'lucide-react';

interface PersonalInfoPanelProps {
  data: any;
}

export default function PersonalInfoPanel({ data }: PersonalInfoPanelProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>Loading patient information...</p>
      </div>
    );
  }

  const allergies = data.allergies ? data.allergies.split(',').map((a: string) => a.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-4">
      {/* Incident Information */}
      <div className="pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2 text-blue-600" />
          Incident Details
        </h4>
        <div className="space-y-2">
          <InfoRow 
            icon={<Calendar className="w-4 h-4" />}
            label="Date of Injury" 
            value={data.injury_date ? new Date(data.injury_date).toLocaleDateString() : 'Not provided'} 
          />
          <InfoRow 
            icon={<Clock className="w-4 h-4" />}
            label="Time" 
            value={data.injury_time || 'Not provided'} 
          />
          <InfoRow 
            icon={<MapPin className="w-4 h-4" />}
            label="Location" 
            value={data.injury_location || 'Not provided'} 
          />
        </div>
      </div>

      {/* Employer Information */}
      <div className="pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
          Employment
        </h4>
        <InfoRow label="Employer" value={data.employer_name || 'Not provided'} />
        <InfoRow label="WC Claim #" value={data.workers_comp_claim_number || 'Not provided'} />
      </div>

      {/* Injury Description */}
      <div className="pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">How Injury Occurred</h4>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
          {data.injury_description || 'No description provided'}
        </p>
      </div>

      {/* Medical History */}
      <div className="pb-4 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">Medical History</h4>
        <p className="text-sm text-gray-700">
          {data.medical_history || 'No significant medical history reported'}
        </p>
      </div>

      {/* Previous Injuries */}
      {data.previous_injuries && (
        <div className="pb-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Previous Injuries</h4>
          <p className="text-sm text-gray-700">
            {data.previous_injuries}
          </p>
        </div>
      )}

      {/* Current Medications */}
      {data.current_medications && (
        <div className="pb-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Current Medications</h4>
          <p className="text-sm text-gray-700">
            {data.current_medications}
          </p>
        </div>
      )}

      {/* Allergies - Highlighted */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Allergies
        </h4>
        {allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-red-200 text-red-900 text-sm font-medium rounded-full">
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-red-700">No known allergies</p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-1">
      <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
        {icon}
        {label}:
      </span>
      <span className="text-sm text-gray-900 text-right flex-1 ml-4">{value}</span>
    </div>
  );
}
