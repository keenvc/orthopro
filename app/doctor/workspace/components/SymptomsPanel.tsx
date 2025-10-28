'use client';

import { Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface SymptomsPanelProps {
  data: any;
}

export default function SymptomsPanel({ data }: SymptomsPanelProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>Loading symptoms...</p>
      </div>
    );
  }

  const painLevel = data.pain_level || 0;
  const symptoms = data.symptoms || [];
  const affectedBodyParts = data.affected_body_parts || [];

  const getPainEmoji = (level: number) => {
    if (level <= 2) return '😊';
    if (level <= 4) return '🙂';
    if (level <= 6) return '😐';
    if (level <= 8) return '😣';
    return '😫';
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return 'text-green-600 bg-green-100';
    if (level <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPainSeverity = (level: number) => {
    if (level <= 3) return 'Mild';
    if (level <= 6) return 'Moderate';
    return 'Severe';
  };

  return (
    <div className="space-y-6">
      {/* Pain Level Gauge */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Pain Level Assessment
        </label>
        <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 rounded-lg p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-6xl mb-2">{getPainEmoji(painLevel)}</div>
              <div className="text-3xl font-bold text-gray-900">{painLevel}/10</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getPainColor(painLevel)}`}>
                {getPainSeverity(painLevel)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Pain Scale</div>
              <div className="space-y-1 text-xs text-gray-500">
                <div>1-3: Mild</div>
                <div>4-6: Moderate</div>
                <div>7-10: Severe</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Affected Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Affected Body Parts ({affectedBodyParts.length})
        </label>
        {affectedBodyParts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {affectedBodyParts.map((part: string, idx: number) => (
              <span
                key={idx}
                className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200"
              >
                {part}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No body parts specified</p>
        )}
      </div>

      {/* Symptom List */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Reported Symptoms ({symptoms.length})
        </label>
        {symptoms.length > 0 ? (
          <div className="space-y-2">
            {symptoms.map((symptom: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">{symptom}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No symptoms reported</p>
        )}
      </div>

      {/* Injury Description */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          Patient's Description of Injury
        </label>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            {data.injury_description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* Clinical Notes Area */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Clinical Observations (Add Notes)
        </label>
        <textarea
          rows={3}
          placeholder="Add your clinical observations here..."
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
