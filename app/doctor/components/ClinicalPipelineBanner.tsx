'use client';

import { useState, useEffect } from 'react';
import { FileText, ClipboardCheck, Image, UserCheck, CheckCircle, ArrowRight } from 'lucide-react';

interface ClinicalPipelineBannerProps {
  intakeId: string;
}

export default function ClinicalPipelineBanner({ intakeId }: ClinicalPipelineBannerProps) {
  const [pipeline, setPipeline] = useState({
    history_complete: false,
    nurse_exam_complete: false,
    imaging_complete: false,
    ortho_review_complete: false
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Load pipeline status from database
    fetchPipelineStatus();
  }, [intakeId]);

  const fetchPipelineStatus = async () => {
    try {
      const response = await fetch(`/api/intake/${intakeId}/pipeline`);
      if (response.ok) {
        const data = await response.json();
        if (data.pipeline_status) {
          setPipeline(data.pipeline_status);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pipeline status:', error);
    }
  };

  const toggleStep = async (stepKey: string) => {
    setUpdating(true);
    const updated = { ...pipeline, [stepKey]: !pipeline[stepKey as keyof typeof pipeline] };
    setPipeline(updated);
    
    try {
      const response = await fetch(`/api/intake/${intakeId}/pipeline`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipeline: updated })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update pipeline');
      }
    } catch (error) {
      console.error('Failed to update pipeline:', error);
      // Revert on error
      setPipeline(pipeline);
    } finally {
      setUpdating(false);
    }
  };
  
  const steps = [
    { key: 'history_complete', label: 'History', icon: FileText },
    { key: 'nurse_exam_complete', label: 'Nurse Physical Exam', icon: ClipboardCheck },
    { key: 'imaging_complete', label: 'MRIs/X-rays', icon: Image },
    { key: 'ortho_review_complete', label: 'Orthopedic Review', icon: UserCheck }
  ];
  
  const completedCount = Object.values(pipeline).filter(Boolean).length;
  const progressPercentage = (completedCount / steps.length) * 100;
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ClipboardCheck className="w-5 h-5 mr-2" />
          Clinical Pipeline
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isComplete = pipeline[step.key as keyof typeof pipeline];
            
            return (
              <div key={step.key} className="relative">
                <button
                  onClick={() => toggleStep(step.key)}
                  disabled={updating}
                  className={`w-full relative p-4 rounded-lg transition disabled:opacity-50 ${
                    isComplete
                      ? 'bg-white/20 border-2 border-white shadow-lg'
                      : 'bg-white/10 border-2 border-white/30 hover:bg-white/15'
                  }`}
                >
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {idx + 1}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-6 h-6" />
                    {isComplete && (
                      <CheckCircle className="w-5 h-5 text-green-400 animate-pulse" />
                    )}
                  </div>
                  
                  <p className="font-medium text-sm text-left">{step.label}</p>
                </button>
                
                {/* Arrow between steps (hidden on mobile for last item) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-white/50" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-white/80 mt-2">
            {completedCount} of {steps.length} steps completed
            {completedCount === steps.length && ' 🎉'}
          </p>
        </div>
      </div>
    </div>
  );
}
