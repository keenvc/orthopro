'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Brain, TrendingUp } from 'lucide-react';

interface ConfirmationScreenProps {
  diagnoses: any[];
  intakeData: any;
  intakeId: string | null;
}

export default function ConfirmationScreen({ diagnoses, intakeData, intakeId }: ConfirmationScreenProps) {
  const router = useRouter();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Intake Submitted Successfully
        </h2>
        <p className="text-gray-600">
          Thank you for completing your worker injury intake. Our AI has analyzed your symptoms.
        </p>
        {intakeId && (
          <p className="mt-2 text-sm text-gray-500">
            Reference ID: <span className="font-mono font-semibold">{intakeId.slice(0, 8)}</span>
          </p>
        )}
      </div>

      {/* AI Diagnoses Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-purple-600" />
          AI-Suggested Diagnoses
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on your symptoms, our AI system has identified the following potential diagnoses. 
          A healthcare provider will review these and provide a final assessment.
        </p>
        
        <div className="space-y-4">
          {diagnoses.map((diagnosis, idx) => (
            <DiagnosisCard
              key={idx}
              rank={idx + 1}
              diagnosis={diagnosis.name}
              confidence={diagnosis.confidence}
              icd10={diagnosis.icd10}
              reasoning={diagnosis.reasoning}
              cptCodes={diagnosis.cptCodes}
            />
          ))}
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-900 mb-3">What Happens Next?</h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span><strong>Nurse Physical Exam</strong> - Initial assessment of injury</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span><strong>MRI/X-rays (if needed)</strong> - Imaging to confirm diagnosis</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span><strong>Orthopedic Review</strong> - Final diagnosis and treatment plan</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>You will be contacted with appointment scheduling and next steps</span>
          </li>
        </ol>
      </div>

      {/* Clinical Staff Access Note */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-purple-900">
          <strong>For Clinical Staff:</strong> This intake is now ready for the Nurse Physical Exam.
          Access the clinical pipeline from the doctor dashboard.
        </p>
      </div>

      {/* Route to Doctor CTA */}
      <button
        onClick={() => router.push('/intake/status/' + intakeId)}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition shadow-lg flex items-center justify-center group"
      >
        View Intake Status
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Additional Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition"
        >
          Print Summary
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

function DiagnosisCard({ rank, diagnosis, confidence, icd10, reasoning, cptCodes }: DiagnosisCardProps) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-600 bg-green-100 border-green-300';
    if (conf >= 0.6) return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    return 'text-orange-600 bg-orange-100 border-orange-300';
  };

  const getRankColor = (r: number) => {
    if (r === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white';
    if (r === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white';
    if (r === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-4">
          {/* Rank Badge */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${getRankColor(rank)}`}>
            #{rank}
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{diagnosis}</h4>
            <p className="text-sm text-gray-600">ICD-10: <span className="font-mono">{icd10}</span></p>
          </div>
        </div>
        
        {/* Confidence Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getConfidenceColor(confidence)}`}>
          <TrendingUp className="w-3 h-3" />
          {Math.round(confidence * 100)}%
        </div>
      </div>
      
      {/* Reasoning */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-medium">AI Reasoning: </span>
          {reasoning}
        </p>
      </div>
    </div>
  );
}

interface DiagnosisCardProps {
  rank: number;
  diagnosis: string;
  confidence: number;
  icd10: string;
  reasoning: string;
  cptCodes?: Array<{code: string, description: string}>;
}
