'use client';

import { ArrowRight, ArrowLeft, FileText, Pill, AlertTriangle, Heart } from 'lucide-react';

interface Step2Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2History({ data, onChange, onNext, onBack }: Step2Props) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 2: Patient History
      </h2>
      
      <div className="space-y-6">
        {/* Previous Injuries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Previous Injuries or Similar Incidents
          </label>
          <textarea
            value={data.previousInjuries}
            onChange={(e) => handleChange('previousInjuries', e.target.value)}
            rows={3}
            placeholder="Have you had similar injuries before? If yes, please describe..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Current Medications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Pill className="w-4 h-4 mr-2" />
            Current Medications
          </label>
          <textarea
            value={data.currentMedications}
            onChange={(e) => handleChange('currentMedications', e.target.value)}
            rows={3}
            placeholder="List all medications you're currently taking (prescription and over-the-counter)..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Include dosages if known. Example: Ibuprofen 200mg, Lisinopril 10mg
          </p>
        </div>

        {/* Allergies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
            Allergies (Required)
          </label>
          <textarea
            value={data.allergies}
            onChange={(e) => handleChange('allergies', e.target.value)}
            rows={2}
            placeholder="List any allergies to medications, foods, or other substances..."
            className="w-full border border-red-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50"
          />
          <p className="mt-1 text-sm text-red-600 font-medium">
            Please list all known allergies.
          </p>
        </div>

        {/* Medical History */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Relevant Medical History
          </label>
          <textarea
            value={data.medicalHistory}
            onChange={(e) => handleChange('medicalHistory', e.target.value)}
            rows={4}
            placeholder="Any chronic conditions, past surgeries, or relevant medical conditions? (e.g., diabetes, heart disease, previous surgeries)..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center"
        >
          Next Step
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        All fields are optional but recommended for better care
      </p>
    </div>
  );
}
