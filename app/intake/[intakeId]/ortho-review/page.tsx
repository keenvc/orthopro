'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { UserMd, CheckCircle, FileText, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

export default function OrthoReviewPage() {
  const router = useRouter();
  const params = useParams();
  const intakeId = params.intakeId as string;
  
  const [saving, setSaving] = useState(false);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [reviewData, setReviewData] = useState({
    finalDiagnosis: '',
    icd10Codes: [] as string[],
    cptCodes: [] as string[],
    treatmentPlan: '',
    workRestrictions: '',
    followUpDate: '',
    referralNeeded: false,
    referralSpecialty: '',
    estimatedRecoveryTime: '',
    workStatus: 'Light Duty',
    additionalNotes: ''
  });

  useEffect(() => {
    // Load intake data
    fetch(`/api/intake?id=${intakeId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIntakeData(data.data);
        }
      })
      .catch(err => console.error('Failed to load intake:', err));
  }, [intakeId]);

  const handleComplete = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/intake/${intakeId}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'ortho_review',
          data: reviewData,
          status: 'completed'
        })
      });
      
      if (!response.ok) throw new Error('Failed to complete review');
      
      alert('Orthopedic review completed successfully!');
      router.push('/doctor');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                <UserMd className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Orthopedic Physician Review</h1>
                <p className="text-indigo-100">Intake ID: {intakeId.slice(0, 8)}</p>
              </div>
            </div>
            <div className="text-sm bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              Step 4 of 4 - Final Review
            </div>
          </div>
        </div>

        {/* AI Diagnoses Review */}
        {intakeData?.ai_diagnoses && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
              AI-Suggested Diagnoses (For Reference)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {intakeData.ai_diagnoses.slice(0, 4).map((diag: any, idx: number) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{diag.name}</span>
                    <span className="text-sm text-gray-600">{Math.round(diag.confidence * 100)}%</span>
                  </div>
                  <p className="text-sm text-gray-600">ICD-10: {diag.icd10}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Diagnosis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Diagnosis</h2>
          <textarea
            value={reviewData.finalDiagnosis}
            onChange={(e) => setReviewData({ ...reviewData, finalDiagnosis: e.target.value })}
            rows={4}
            placeholder="Enter the final orthopedic diagnosis..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ICD-10 Codes (comma separated)
              </label>
              <input
                type="text"
                placeholder="M25.511, S43.001A"
                value={reviewData.icd10Codes.join(', ')}
                onChange={(e) => setReviewData({
                  ...reviewData,
                  icd10Codes: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPT Codes (comma separated)
              </label>
              <input
                type="text"
                placeholder="99213, 20610"
                value={reviewData.cptCodes.join(', ')}
                onChange={(e) => setReviewData({
                  ...reviewData,
                  cptCodes: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Treatment Plan
          </h2>
          <textarea
            value={reviewData.treatmentPlan}
            onChange={(e) => setReviewData({ ...reviewData, treatmentPlan: e.target.value })}
            rows={6}
            placeholder="Detailed treatment plan including medications, physical therapy, procedures, etc..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Work Status & Restrictions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
            Work Status & Restrictions
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Status
            </label>
            <select
              value={reviewData.workStatus}
              onChange={(e) => setReviewData({ ...reviewData, workStatus: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Full Duty">Full Duty - No Restrictions</option>
              <option value="Light Duty">Light Duty - Modified Work</option>
              <option value="Temporary Total Disability">Temporary Total Disability - Off Work</option>
              <option value="Permanent Partial Disability">Permanent Partial Disability</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Work Restrictions
            </label>
            <textarea
              value={reviewData.workRestrictions}
              onChange={(e) => setReviewData({ ...reviewData, workRestrictions: e.target.value })}
              rows={4}
              placeholder="No lifting over 10 lbs, no repetitive bending, etc..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Follow-up & Recovery */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Follow-up & Recovery
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Date
              </label>
              <input
                type="date"
                value={reviewData.followUpDate}
                onChange={(e) => setReviewData({ ...reviewData, followUpDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Recovery Time
              </label>
              <input
                type="text"
                placeholder="4-6 weeks"
                value={reviewData.estimatedRecoveryTime}
                onChange={(e) => setReviewData({ ...reviewData, estimatedRecoveryTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <label className="flex items-center mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={reviewData.referralNeeded}
              onChange={(e) => setReviewData({ ...reviewData, referralNeeded: e.target.checked })}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="ml-3 text-gray-900 font-medium">
              Referral to Specialist Needed
            </span>
          </label>
          
          {reviewData.referralNeeded && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referral Specialty
              </label>
              <input
                type="text"
                placeholder="Physical Therapy, Pain Management, etc."
                value={reviewData.referralSpecialty}
                onChange={(e) => setReviewData({ ...reviewData, referralSpecialty: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            value={reviewData.additionalNotes}
            onChange={(e) => setReviewData({ ...reviewData, additionalNotes: e.target.value })}
            rows={4}
            placeholder="Any additional observations or recommendations..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg flex items-center justify-center group disabled:opacity-50"
        >
          <CheckCircle className="w-6 h-6 mr-3" />
          Complete Orthopedic Review & Close Case
        </button>
      </div>
    </div>
  );
}
