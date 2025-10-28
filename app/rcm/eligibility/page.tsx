'use client';

import { useState } from 'react';
import Navigation from '../../components/Navigation';
import { Search, CheckCircle, XCircle, DollarSign, Calendar, User, Building, Download } from 'lucide-react';

export default function EligibilityPage() {
  const [formData, setFormData] = useState({
    payerName: '',
    memberId: '',
    dob: '',
    firstName: '',
    lastName: ''
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCheck = async () => {
    if (!formData.payerName || !formData.memberId || !formData.dob) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/rcm/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      setResult(data);
      
      // Add to history
      setHistory([data, ...history].slice(0, 5));
    } catch (error) {
      console.error('Eligibility check failed:', error);
      alert('Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      payerName: '',
      memberId: '',
      dob: '',
      firstName: '',
      lastName: ''
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Claims & Eligibility Verification
          </h1>
          <p className="text-gray-600">
            Verify patient insurance eligibility and benefits in real-time
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Doe"
              />
            </div>

            {/* Payer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Insurance Payer Name *
              </label>
              <input
                type="text"
                value={formData.payerName}
                onChange={(e) => handleChange('payerName', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Blue Cross Blue Shield, Aetna, UnitedHealthcare"
                required
              />
            </div>

            {/* Member ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member ID / Policy Number *
              </label>
              <input
                type="text"
                value={formData.memberId}
                onChange={(e) => handleChange('memberId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., WC12345678"
                required
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking Eligibility...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Eligibility
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            * Required fields
          </p>
        </div>

        {/* VOB Result Card */}
        {result && (
          <VOBResultCard result={result} formData={formData} />
        )}

        {/* Recent Checks History */}
        {history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Checks</h3>
            <div className="space-y-3">
              {history.map((check, idx) => (
                <button
                  key={idx}
                  onClick={() => setResult(check)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{check.payerName}</p>
                      <p className="text-sm text-gray-600">Member ID: {check.memberId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      check.eligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {check.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VOBResultCard({ result, formData }: any) {
  const handleExportPDF = () => {
    alert('PDF export feature would be implemented here');
  };

  return (
    <div className={`border-2 rounded-lg p-6 shadow-lg ${
      result.eligible
        ? 'border-green-500 bg-green-50'
        : 'border-red-500 bg-red-50'
    }`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            {result.eligible ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                Eligible for Coverage
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600 mr-3" />
                Not Eligible
              </>
            )}
          </h3>
          <p className="text-sm text-gray-600">
            Verification Date: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Patient: {formData.firstName} {formData.lastName}
          </p>
        </div>
        
        <button
          onClick={handleExportPDF}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center bg-white px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Payer Information */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Insurance Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Payer</p>
            <p className="font-medium text-gray-900">{result.payerName}</p>
          </div>
          <div>
            <p className="text-gray-600">Member ID</p>
            <p className="font-medium text-gray-900">{result.memberId}</p>
          </div>
          <div>
            <p className="text-gray-600">Date of Birth</p>
            <p className="font-medium text-gray-900">{new Date(formData.dob).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Plan Type</p>
            <p className="font-medium text-gray-900">{result.planType || 'Workers Compensation'}</p>
          </div>
        </div>
      </div>
      
      {result.eligible ? (
        <>
          {/* Financial Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-sm text-gray-600">Copay</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ${result.copay?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Deductible</p>
              <p className="text-2xl font-bold text-gray-900">
                ${result.deductible?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Deductible Met</p>
              <p className="text-2xl font-bold text-gray-900">
                ${result.deductibleMet?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                ${((result.deductible || 0) - (result.deductibleMet || 0)).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Coverage Details */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Coverage Details</h4>
            <div className="space-y-2 text-sm">
              <CoverageItem label="Office Visits" covered={result.officeVisitsCovered !== false} />
              <CoverageItem label="Physical Therapy" covered={result.physicalTherapyCovered !== false} />
              <CoverageItem label="Imaging (X-ray, MRI)" covered={result.imagingCovered !== false} />
              <CoverageItem label="Surgery" covered={result.surgeryCovered !== false} />
              <CoverageItem label="Prescription Drugs" covered={result.prescriptionCovered !== false} />
            </div>
          </div>

          {/* Authorization Note */}
          {result.requiresAuth && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Prior Authorization Required:</strong> Some services may require pre-authorization from the insurance payer.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Reason for Ineligibility</h4>
          <p className="text-sm text-gray-700">
            {result.reason || 'Invalid member ID or coverage not active. Please verify the information and try again.'}
          </p>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Common Reasons:</p>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Incorrect member ID or policy number</li>
              <li>Coverage has expired or been terminated</li>
              <li>Patient information does not match insurance records</li>
              <li>Workers' compensation claim not yet approved</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function CoverageItem({ label, covered }: { label: string; covered: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      {covered ? (
        <span className="flex items-center text-green-600 font-medium">
          <CheckCircle className="w-4 h-4 mr-1" />
          Covered
        </span>
      ) : (
        <span className="flex items-center text-red-600 font-medium">
          <XCircle className="w-4 h-4 mr-1" />
          Not Covered
        </span>
      )}
    </div>
  );
}
