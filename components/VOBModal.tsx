'use client';

import { X, CheckCircle, XCircle, Calendar, DollarSign, Shield, User, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface VOBModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification: any;
  patientName: string;
}

export default function VOBModal({ isOpen, onClose, verification, patientName }: VOBModalProps) {
  if (!isOpen) return null;

  const response = verification?.verification_response || {};
  const eligibilityInfo = response.eligibilityInfo || [];
  const subscriber = response.subscriber || {};
  const payer = response.payer || {};
  const planInfo = response.planInformation || [];

  // Extract key information
  const isEligible = verification?.is_eligible || false;
  const verifiedAt = verification?.verified_at || verification?.created_at;
  const copayAmount = verification?.copay_amount;

  // Find benefits information
  const benefits = eligibilityInfo.flatMap((info: any) => info.benefits || []);

  // Extract deductibles
  const deductibles = benefits.filter((b: any) => 
    b.code?.toLowerCase().includes('deduct') || 
    b.name?.toLowerCase().includes('deduct')
  );

  // Extract copays
  const copays = benefits.filter((b: any) =>
    b.code?.toLowerCase().includes('copay') ||
    b.name?.toLowerCase().includes('copay')
  );

  // Extract out-of-pocket max
  const oopMax = benefits.find((b: any) =>
    b.code?.toLowerCase().includes('out') ||
    b.name?.toLowerCase().includes('out-of-pocket')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Verification of Benefits (VOB)</h2>
            <p className="text-blue-100 text-sm mt-1">{patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Eligibility Status */}
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            isEligible 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {isEligible ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-yellow-600" />
              )}
              <div>
                <h3 className="text-lg font-semibold">
                  {isEligible ? 'Benefits Verified' : 'Verification Status Unknown'}
                </h3>
                <p className="text-sm text-gray-600">
                  Verified on {formatDate(verifiedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Key Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Payer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Insurance Payer</h4>
              </div>
              <p className="text-gray-700">{verification?.payer_name || payer.name || 'N/A'}</p>
              {payer.payerIdentificationNumber && (
                <p className="text-sm text-gray-500 mt-1">ID: {payer.payerIdentificationNumber}</p>
              )}
            </div>

            {/* Member ID */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Member ID</h4>
              </div>
              <p className="text-gray-700">{verification?.member_id || subscriber.memberId || 'N/A'}</p>
              {subscriber.groupNumber && (
                <p className="text-sm text-gray-500 mt-1">Group: {subscriber.groupNumber}</p>
              )}
            </div>

            {/* Primary Care Copay */}
            {copayAmount && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold">Primary Care Copay</h4>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(copayAmount * 100)}
                </p>
              </div>
            )}

            {/* Verification Date */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold">Verification Date</h4>
              </div>
              <p className="text-gray-700">{formatDate(verifiedAt)}</p>
              <p className="text-sm text-gray-500 mt-1">Source: Stedi Healthcare API</p>
            </div>
          </div>

          {/* Benefits Details */}
          {eligibilityInfo.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Coverage Details
              </h3>

              {/* Deductibles */}
              {deductibles.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Deductibles</h4>
                  <div className="space-y-2">
                    {deductibles.map((deduct: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {deduct.name || deduct.code || 'Deductible'}
                          </span>
                          {deduct.amount && (
                            <span className="font-semibold">
                              ${parseFloat(deduct.amount).toFixed(2)}
                            </span>
                          )}
                        </div>
                        {deduct.timeQualifier && (
                          <span className="text-xs text-gray-500">
                            {deduct.timeQualifier}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Copays */}
              {copays.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Copayments</h4>
                  <div className="space-y-2">
                    {copays.map((copay: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {copay.name || copay.serviceTypes?.join(', ') || 'Copay'}
                          </span>
                          {copay.amount && (
                            <span className="font-semibold text-green-700">
                              ${parseFloat(copay.amount).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Out-of-Pocket Max */}
              {oopMax && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Out-of-Pocket Maximum</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Maximum OOP</span>
                      {oopMax.amount && (
                        <span className="font-semibold">
                          ${parseFloat(oopMax.amount).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Coverage Level */}
              {eligibilityInfo[0]?.coverageLevel && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Coverage Level</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-sm capitalize">
                      {eligibilityInfo[0].coverageLevel}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plan Information */}
          {planInfo.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Plan Information</h3>
              {planInfo.map((plan: any, idx: number) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg mb-2">
                  {plan.planName && (
                    <p className="font-medium">{plan.planName}</p>
                  )}
                  {plan.planNumber && (
                    <p className="text-sm text-gray-600">Plan #: {plan.planNumber}</p>
                  )}
                  {plan.planDateInformation && (
                    <p className="text-sm text-gray-600">
                      Effective: {formatDate(plan.planDateInformation.beginDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Raw Response (Collapsible) */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              View Raw API Response
            </summary>
            <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
