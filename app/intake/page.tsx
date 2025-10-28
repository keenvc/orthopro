'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepProgress from './components/StepProgress';
import Step1Incident from './components/Step1Incident';
import Step2History from './components/Step2History';
import Step3Symptoms from './components/Step3Symptoms';
import ConfirmationScreen from './components/ConfirmationScreen';

interface IntakeFormData {
  // Step 1
  injuryDate: string;
  injuryTime: string;
  injuryLocation: string;
  mechanismOfInjury: string;
  workActivity: string;
  injuryDescription: string;
  employerName: string;
  claimNumber: string;
  // Step 2
  previousInjuries: string;
  currentMedications: string;
  allergies: string;
  medicalHistory: string;
  // Step 3
  painLevel: number;
  symptoms: string[];
  affectedBodyParts: string[];
}

export default function IntakePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<IntakeFormData>({
    // Step 1
    injuryDate: '',
    injuryTime: '',
    injuryLocation: '',
    mechanismOfInjury: '',
    workActivity: '',
    injuryDescription: '',
    employerName: '',
    claimNumber: '',
    // Step 2
    previousInjuries: '',
    currentMedications: '',
    allergies: '',
    medicalHistory: '',
    // Step 3
    painLevel: 5,
    symptoms: [],
    affectedBodyParts: []
  });
  const [aiDiagnoses, setAiDiagnoses] = useState<any>(null);
  const [intakeId, setIntakeId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit intake');
      }
      
      const result = await response.json();
      setAiDiagnoses(result.diagnoses);
      setIntakeId(result.intakeId);
      setCurrentStep(4); // Confirmation screen
    } catch (error) {
      console.error('Intake submission error:', error);
      alert('Failed to submit intake. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://advancedcare.com/lovable-uploads/76b12c1f-21c2-4dce-bd93-b74bb2fcf46a.png" 
            alt="AdvancedCare Logo" 
            className="h-12 w-auto mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Worker Injury Intake
          </h1>
          <p className="text-gray-600">
            Please complete all steps to submit your injury report
          </p>
        </div>
        
        {currentStep < 4 && <StepProgress currentStep={currentStep} />}
        
        {currentStep === 1 && (
          <Step1Incident
            data={formData}
            onChange={setFormData}
            onNext={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <Step2History
            data={formData}
            onChange={setFormData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <Step3Symptoms
            data={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(2)}
            submitting={submitting}
          />
        )}
        {currentStep === 4 && aiDiagnoses && (
          <ConfirmationScreen
            diagnoses={aiDiagnoses}
            intakeData={formData}
            intakeId={intakeId}
          />
        )}
      </div>
    </div>
  );
}
