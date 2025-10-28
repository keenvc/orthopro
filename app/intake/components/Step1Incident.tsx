'use client';

import { ArrowRight, Calendar, Clock, MapPin, Briefcase, FileText } from 'lucide-react';

interface Step1Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export default function Step1Incident({ data, onChange, onNext }: Step1Props) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = () => {
    return data.injuryDate && data.injuryLocation && data.injuryDescription;
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Step 1: Incident Details
      </h2>
      
      <div className="space-y-6">
        {/* Injury Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Date of Injury *
          </label>
          <input
            type="date"
            value={data.injuryDate}
            onChange={(e) => handleChange('injuryDate', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Injury Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Time of Injury
          </label>
          <input
            type="time"
            value={data.injuryTime}
            onChange={(e) => handleChange('injuryTime', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Injury Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location Where Injury Occurred *
          </label>
          <input
            type="text"
            value={data.injuryLocation}
            onChange={(e) => handleChange('injuryLocation', e.target.value)}
            placeholder="e.g., Warehouse, Construction Site, Office"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Injury Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Description of Injury *
          </label>
          <textarea
            value={data.injuryDescription}
            onChange={(e) => handleChange('injuryDescription', e.target.value)}
            rows={4}
            placeholder="Please describe how the injury occurred and what you were doing at the time..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Be as detailed as possible. Include what activity you were performing and what caused the injury.
          </p>
        </div>

        {/* Employer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            Employer Name
          </label>
          <input
            type="text"
            value={data.employerName}
            onChange={(e) => handleChange('employerName', e.target.value)}
            placeholder="Company or Organization Name"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Workers Comp Claim Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workers' Compensation Claim Number (if available)
          </label>
          <input
            type="text"
            value={data.claimNumber}
            onChange={(e) => handleChange('claimNumber', e.target.value)}
            placeholder="e.g., WC-2025-12345"
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid()}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        >
          Next Step
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        * Required fields
      </p>
    </div>
  );
}
