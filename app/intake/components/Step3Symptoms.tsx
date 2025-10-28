'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Activity, CheckCircle } from 'lucide-react';

interface Step3Props {
  data: any;
  onChange: (data: any) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}

const commonSymptoms = [
  'Sharp Pain', 'Dull Ache', 'Swelling', 'Bruising', 'Numbness',
  'Tingling', 'Weakness', 'Stiffness', 'Limited Range of Motion',
  'Burning Sensation', 'Throbbing', 'Radiating Pain'
];

const bodyParts = [
  'Shoulder', 'Elbow', 'Wrist', 'Hand', 'Fingers',
  'Neck', 'Upper Back', 'Lower Back', 'Hip', 'Knee',
  'Ankle', 'Foot', 'Toes', 'Head'
];

export default function Step3Symptoms({ data, onChange, onSubmit, onBack, submitting }: Step3Props) {
  const handlePainLevelChange = (level: number) => {
    onChange({ ...data, painLevel: level });
  };

  const toggleSymptom = (symptom: string) => {
    const symptoms = data.symptoms || [];
    if (symptoms.includes(symptom)) {
      onChange({ ...data, symptoms: symptoms.filter((s: string) => s !== symptom) });
    } else {
      onChange({ ...data, symptoms: [...symptoms, symptom] });
    }
  };

  const toggleBodyPart = (part: string) => {
    const parts = data.affectedBodyParts || [];
    if (parts.includes(part)) {
      onChange({ ...data, affectedBodyParts: parts.filter((p: string) => p !== part) });
    } else {
      onChange({ ...data, affectedBodyParts: [...parts, part] });
    }
  };

  const getPainEmoji = (level: number) => {
    if (level <= 2) return '😊';
    if (level <= 4) return '🙂';
    if (level <= 6) return '😐';
    if (level <= 8) return '😣';
    return '😫';
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isValid = () => {
    return data.symptoms?.length > 0 && data.affectedBodyParts?.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 3: Current Symptoms
      </h2>
      
      <div className="space-y-8">
        {/* Pain Level Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Pain Level (1-10) *
          </label>
          
          <div className="mb-4 text-center">
            <div className="text-6xl mb-2">{getPainEmoji(data.painLevel)}</div>
            <div className="text-3xl font-bold text-gray-900">{data.painLevel}/10</div>
          </div>
          
          <input
            type="range"
            min="1"
            max="10"
            value={data.painLevel}
            onChange={(e) => handlePainLevelChange(parseInt(e.target.value))}
            className="w-full h-3 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #fbbf24 50%, #ef4444 100%)`
            }}
          />
          
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Mild (1)</span>
            <span>Moderate (5)</span>
            <span>Severe (10)</span>
          </div>
        </div>

        {/* Symptoms Checklist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Your Symptoms * (Choose all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonSymptoms.map(symptom => (
              <button
                key={symptom}
                type="button"
                onClick={() => toggleSymptom(symptom)}
                className={`p-3 border-2 rounded-lg transition text-sm font-medium ${
                  data.symptoms?.includes(symptom)
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {data.symptoms?.includes(symptom) && (
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                )}
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Affected Body Parts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Affected Body Parts * (Choose all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {bodyParts.map(part => (
              <button
                key={part}
                type="button"
                onClick={() => toggleBodyPart(part)}
                className={`p-3 border-2 rounded-lg transition text-sm font-medium ${
                  data.affectedBodyParts?.includes(part)
                    ? 'border-orange-600 bg-orange-50 text-orange-900'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {data.affectedBodyParts?.includes(part) && (
                  <CheckCircle className="w-4 h-4 inline mr-1" />
                )}
                {part}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {isValid() && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Summary:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pain Level: {data.painLevel}/10</li>
              <li>• {data.symptoms.length} symptom(s) selected</li>
              <li>• {data.affectedBodyParts.length} body part(s) affected</li>
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          disabled={submitting}
          className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition flex items-center disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={onSubmit}
          disabled={!isValid() || submitting}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              Submit Intake
              <Send className="w-5 h-5 ml-2" />
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        * Required fields
      </p>
    </div>
  );
}
