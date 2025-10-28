'use client';

import { useState } from 'react';
import { Brain, TrendingUp, CheckCircle, Info } from 'lucide-react';

interface DiagnosesPanelProps {
  diagnoses: any[];
}

export default function DiagnosesPanel({ diagnoses }: DiagnosesPanelProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string | null>(null);

  if (!diagnoses || diagnoses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Brain className="w-12 h-12 mb-2 opacity-50" />
        <p>No AI diagnoses available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-purple-600">
          <Brain className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">AI-Generated Diagnoses</span>
        </div>
        <span className="text-xs text-gray-500">Top {diagnoses.length} matches</span>
      </div>

      {/* Diagnoses List */}
      <div className="space-y-3">
        {diagnoses.map((diagnosis: any, idx: number) => {
          const isSelected = selectedDiagnosis === diagnosis.icd10;
          const confidence = diagnosis.confidence || 0;
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedDiagnosis(isSelected ? null : diagnosis.icd10)}
              className={`w-full text-left p-4 border-2 rounded-lg transition ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  {/* Rank Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {idx + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {diagnosis.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        ICD-10: {diagnosis.icd10}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Confidence Badge */}
                <ConfidenceBadge confidence={confidence} />
              </div>
              
              {/* Reasoning */}
              <div className="mt-3 ml-11">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {diagnosis.reasoning}
                  </p>
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="mt-3 ml-11 flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Selected for final diagnosis</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Summary */}
      {selectedDiagnosis && (
        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h5 className="text-sm font-semibold text-blue-900 mb-2">Primary Diagnosis Selected:</h5>
          <p className="text-sm text-blue-800">
            {diagnoses.find((d: any) => d.icd10 === selectedDiagnosis)?.name}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            ICD-10: {selectedDiagnosis}
          </p>
        </div>
      )}

      {/* Action Note */}
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-xs text-purple-800">
          💡 <strong>Note:</strong> These are AI-suggested diagnoses. Please review patient history, 
          symptoms, and clinical findings before confirming final diagnosis.
        </p>
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  
  const getColor = () => {
    if (confidence >= 0.8) return 'text-green-700 bg-green-100 border-green-300';
    if (confidence >= 0.6) return 'text-yellow-700 bg-yellow-100 border-yellow-300';
    return 'text-orange-700 bg-orange-100 border-orange-300';
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getColor()}`}>
      <TrendingUp className="w-3 h-3" />
      {percentage}%
    </div>
  );
}
