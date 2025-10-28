'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Scan, Upload, ArrowRight, Save, Image, FileText } from 'lucide-react';

export default function ImagingPage() {
  const router = useRouter();
  const params = useParams();
  const intakeId = params.intakeId as string;
  
  const [saving, setSaving] = useState(false);
  const [imagingData, setImagingData] = useState({
    imagingType: [] as string[],
    mriFindings: '',
    xrayFindings: '',
    ctScanFindings: '',
    radiologistNotes: '',
    uploadedFiles: [] as string[]
  });

  const imagingTypes = [
    { value: 'X-Ray', label: 'X-Ray' },
    { value: 'MRI', label: 'MRI' },
    { value: 'CT Scan', label: 'CT Scan' },
    { value: 'Ultrasound', label: 'Ultrasound' }
  ];

  const toggleImagingType = (type: string) => {
    if (imagingData.imagingType.includes(type)) {
      setImagingData({
        ...imagingData,
        imagingType: imagingData.imagingType.filter(t => t !== type)
      });
    } else {
      setImagingData({
        ...imagingData,
        imagingType: [...imagingData.imagingType, type]
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/intake/${intakeId}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'imaging',
          data: imagingData
        })
      });
      
      if (!response.ok) throw new Error('Failed to save imaging data');
      
      alert('Imaging data saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    router.push(`/intake/${intakeId}/ortho-review`);
  };

  const handleSkip = () => {
    if (confirm('Skip imaging step? You can return to this later.')) {
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Scan className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MRI / X-Ray Imaging</h1>
                <p className="text-sm text-gray-600">Intake ID: {intakeId.slice(0, 8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full font-medium">
                Optional
              </span>
              <span className="text-sm text-gray-500">
                Step 3 of 4
              </span>
            </div>
          </div>
        </div>

        {/* Imaging Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Imaging Type(s) Performed</h2>
          <p className="text-sm text-gray-600 mb-4">Select all imaging types that were performed</p>
          
          <div className="grid grid-cols-2 gap-4">
            {imagingTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => toggleImagingType(type.value)}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  imagingData.imagingType.includes(type.value)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{type.label}</span>
                  {imagingData.imagingType.includes(type.value) && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* X-Ray Findings */}
        {imagingData.imagingType.includes('X-Ray') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2 text-blue-600" />
              X-Ray Findings
            </h2>
            <textarea
              value={imagingData.xrayFindings}
              onChange={(e) => setImagingData({ ...imagingData, xrayFindings: e.target.value })}
              rows={6}
              placeholder="Describe X-Ray findings, bone alignment, fractures, etc..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* MRI Findings */}
        {imagingData.imagingType.includes('MRI') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Scan className="w-5 h-5 mr-2 text-blue-600" />
              MRI Findings
            </h2>
            <textarea
              value={imagingData.mriFindings}
              onChange={(e) => setImagingData({ ...imagingData, mriFindings: e.target.value })}
              rows={6}
              placeholder="Describe MRI findings, soft tissue damage, ligament tears, etc..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* CT Scan Findings */}
        {imagingData.imagingType.includes('CT Scan') && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Scan className="w-5 h-5 mr-2 text-blue-600" />
              CT Scan Findings
            </h2>
            <textarea
              value={imagingData.ctScanFindings}
              onChange={(e) => setImagingData({ ...imagingData, ctScanFindings: e.target.value })}
              rows={6}
              placeholder="Describe CT scan findings..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Radiologist Notes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            Radiologist Notes
          </h2>
          <textarea
            value={imagingData.radiologistNotes}
            onChange={(e) => setImagingData({ ...imagingData, radiologistNotes: e.target.value })}
            rows={6}
            placeholder="Overall radiologist interpretation and recommendations..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* File Upload Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2 text-gray-600" />
            Upload Imaging Files
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop imaging files here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Supported formats: DICOM, JPG, PNG, PDF (Max 50MB per file)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSkip}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Skip This Step
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 border-2 border-blue-600 text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center disabled:opacity-50"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Progress
          </button>
          
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center group disabled:opacity-50"
          >
            Continue to Ortho Review
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
