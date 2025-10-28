'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Stethoscope, ArrowRight, Save, CheckCircle, Heart, Activity, Thermometer, Wind } from 'lucide-react';

export default function NurseExamPage() {
  const router = useRouter();
  const params = useParams();
  const intakeId = params.intakeId as string;
  
  const [saving, setSaving] = useState(false);
  const [examData, setExamData] = useState({
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: ''
    },
    physicalExam: {
      generalAppearance: '',
      rangeOfMotion: '',
      painOnPalpation: '',
      swelling: '',
      bruising: '',
      deformity: ''
    },
    functionalAssessment: {
      walkingAbility: '',
      gripStrength: '',
      mobilityLimitations: ''
    },
    nurseNotes: '',
    recommendImaging: false,
    imagingJustification: ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/intake/${intakeId}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'nurse_exam',
          data: examData
        })
      });
      
      if (!response.ok) throw new Error('Failed to save nurse exam');
      
      alert('Nurse exam saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    
    // If imaging is recommended, go to imaging page
    // Otherwise, skip to orthopedic review
    if (examData.recommendImaging) {
      router.push(`/intake/${intakeId}/imaging`);
    } else {
      router.push(`/intake/${intakeId}/ortho-review`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nurse Physical Examination</h1>
                <p className="text-sm text-gray-600">Intake ID: {intakeId.slice(0, 8)}</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step 2 of 4
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-red-600" />
            Vital Signs
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Pressure (mmHg)
              </label>
              <input
                type="text"
                placeholder="120/80"
                value={examData.vitalSigns.bloodPressure}
                onChange={(e) => setExamData({
                  ...examData,
                  vitalSigns: { ...examData.vitalSigns, bloodPressure: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heart Rate (bpm)
              </label>
              <input
                type="text"
                placeholder="72"
                value={examData.vitalSigns.heartRate}
                onChange={(e) => setExamData({
                  ...examData,
                  vitalSigns: { ...examData.vitalSigns, heartRate: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 inline mr-1" />
                Temperature (°F)
              </label>
              <input
                type="text"
                placeholder="98.6"
                value={examData.vitalSigns.temperature}
                onChange={(e) => setExamData({
                  ...examData,
                  vitalSigns: { ...examData.vitalSigns, temperature: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Wind className="w-4 h-4 inline mr-1" />
                Respiratory Rate (breaths/min)
              </label>
              <input
                type="text"
                placeholder="16"
                value={examData.vitalSigns.respiratoryRate}
                onChange={(e) => setExamData({
                  ...examData,
                  vitalSigns: { ...examData.vitalSigns, respiratoryRate: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                O2 Saturation (%)
              </label>
              <input
                type="text"
                placeholder="98"
                value={examData.vitalSigns.oxygenSaturation}
                onChange={(e) => setExamData({
                  ...examData,
                  vitalSigns: { ...examData.vitalSigns, oxygenSaturation: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Physical Examination */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Physical Examination</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Appearance
              </label>
              <textarea
                value={examData.physicalExam.generalAppearance}
                onChange={(e) => setExamData({
                  ...examData,
                  physicalExam: { ...examData.physicalExam, generalAppearance: e.target.value }
                })}
                rows={3}
                placeholder="Patient appears alert and oriented..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Range of Motion
              </label>
              <textarea
                value={examData.physicalExam.rangeOfMotion}
                onChange={(e) => setExamData({
                  ...examData,
                  physicalExam: { ...examData.physicalExam, rangeOfMotion: e.target.value }
                })}
                rows={3}
                placeholder="ROM assessment of affected area..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain on Palpation
                </label>
                <select
                  value={examData.physicalExam.painOnPalpation}
                  onChange={(e) => setExamData({
                    ...examData,
                    physicalExam: { ...examData.physicalExam, painOnPalpation: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Swelling
                </label>
                <select
                  value={examData.physicalExam.swelling}
                  onChange={(e) => setExamData({
                    ...examData,
                    physicalExam: { ...examData.physicalExam, swelling: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bruising
                </label>
                <select
                  value={examData.physicalExam.bruising}
                  onChange={(e) => setExamData({
                    ...examData,
                    physicalExam: { ...examData.physicalExam, bruising: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deformity
                </label>
                <select
                  value={examData.physicalExam.deformity}
                  onChange={(e) => setExamData({
                    ...examData,
                    physicalExam: { ...examData.physicalExam, deformity: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="None">None</option>
                  <option value="Present">Present</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Functional Assessment */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Functional Assessment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Walking Ability
              </label>
              <textarea
                value={examData.functionalAssessment.walkingAbility}
                onChange={(e) => setExamData({
                  ...examData,
                  functionalAssessment: { ...examData.functionalAssessment, walkingAbility: e.target.value }
                })}
                rows={2}
                placeholder="Ambulates with/without assistance..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grip Strength
              </label>
              <textarea
                value={examData.functionalAssessment.gripStrength}
                onChange={(e) => setExamData({
                  ...examData,
                  functionalAssessment: { ...examData.functionalAssessment, gripStrength: e.target.value }
                })}
                rows={2}
                placeholder="Grip strength assessment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobility Limitations
              </label>
              <textarea
                value={examData.functionalAssessment.mobilityLimitations}
                onChange={(e) => setExamData({
                  ...examData,
                  functionalAssessment: { ...examData.functionalAssessment, mobilityLimitations: e.target.value }
                })}
                rows={3}
                placeholder="Any limitations in mobility or daily activities..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Nurse Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nurse Notes</h2>
          <textarea
            value={examData.nurseNotes}
            onChange={(e) => setExamData({ ...examData, nurseNotes: e.target.value })}
            rows={6}
            placeholder="Additional observations, concerns, or notes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Imaging Recommendation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Imaging Recommendation</h2>
          
          <label className="flex items-center mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={examData.recommendImaging}
              onChange={(e) => setExamData({ ...examData, recommendImaging: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="ml-3 text-gray-900 font-medium">
              Recommend MRI/X-ray Imaging
            </span>
          </label>
          
          {examData.recommendImaging && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justification for Imaging
              </label>
              <textarea
                value={examData.imagingJustification}
                onChange={(e) => setExamData({ ...examData, imagingJustification: e.target.value })}
                rows={4}
                placeholder="Clinical reasoning for imaging recommendation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 border-2 border-purple-600 text-purple-600 py-4 rounded-lg font-semibold hover:bg-purple-50 transition flex items-center justify-center disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Progress
          </button>
          
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center group disabled:opacity-50"
          >
            {examData.recommendImaging ? 'Continue to Imaging' : 'Skip to Ortho Review'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
