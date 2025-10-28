'use client';

import { ArrowRight, Calendar, Clock, MapPin, Briefcase, FileText, AlertTriangle } from 'lucide-react';

interface Step1Props {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

const mechanismOptions = [
  { value: 'lift', label: 'Lifting/Carrying Heavy Object', icon: '🏋️' },
  { value: 'fall', label: 'Fall/Slip/Trip', icon: '⚠️' },
  { value: 'repetitive', label: 'Repetitive Motion/Overuse', icon: '🔄' },
  { value: 'struck', label: 'Struck By Object', icon: '💥' },
  { value: 'caught', label: 'Caught In/Between Objects', icon: '⚙️' },
  { value: 'vehicle', label: 'Vehicle/Forklift Accident', icon: '🚗' },
  { value: 'awkward', label: 'Awkward Position/Twisting', icon: '🤸' },
  { value: 'other', label: 'Other/Multiple', icon: '❓' }
];

const activityOptions = [
  'Manual Labor/Construction',
  'Office/Desk Work',
  'Manufacturing/Assembly',
  'Healthcare/Patient Care',
  'Retail/Service',
  'Transportation/Driving',
  'Warehouse/Logistics',
  'Other'
];

export default function Step1Incident({ data, onChange, onNext }: Step1Props) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = () => {
    return data.injuryDate && data.injuryLocation && data.injuryDescription && data.mechanismOfInjury;
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

        {/* Mechanism of Injury */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            How Did the Injury Occur? *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mechanismOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('mechanismOfInjury', option.value)}
                className={`p-4 border-2 rounded-lg transition text-left ${
                  data.mechanismOfInjury === option.value
                    ? 'border-red-600 bg-red-50 text-red-900'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Work Activity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type of Work Activity
          </label>
          <select
            value={data.workActivity || ''}
            onChange={(e) => handleChange('workActivity', e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select work activity...</option>
            {activityOptions.map(activity => (
              <option key={activity} value={activity}>{activity}</option>
            ))}
          </select>
        </div>

        {/* Injury Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Detailed Description of Injury *
          </label>
          <textarea
            value={data.injuryDescription}
            onChange={(e) => handleChange('injuryDescription', e.target.value)}
            rows={4}
            placeholder="Please describe in detail how the injury occurred, what you were doing, and any immediate symptoms..."
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Include: What activity were you doing? What position were you in? Did you hear/feel anything pop or snap?
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
