'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navigation from '@/app/components/Navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, CreditCard, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SquareTransaction {
  id: string;
  square_id?: string;
  amount_cents: number;
  tip_amount_cents: number;
  total_cents: number;
  status?: string;
  payment_method?: string;
  receipt_url?: string;
  transaction_date: string;
}

interface PatientDetail {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  balance_cents: number;
  square_transactions?: SquareTransaction[];
  clinical_notes?: any[];
  patient_surveys?: any[];
  invoices?: any[];
  payments?: any[];
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        const response = await fetch(`/api/patients/${patientId}`);
        if (response.ok) {
          const data = await response.json();
          setPatient(data);
        }
      } catch (error) {
        console.error('Error loading patient:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [patientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500">Patient not found</p>
            <Link href="/patients" className="text-blue-600 hover:text-blue-700 mt-4">
              Back to Patients
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const totalSquareTransactions = patient.square_transactions?.length || 0;
  const totalSquareAmount = (patient.square_transactions || []).reduce((sum, t) => sum + t.total_cents, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/patients" className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-gray-600 mt-2">{patient.email}</p>
        </div>

        {/* Patient Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Phone</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{patient.phone || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Account Balance</p>
            <p className={`text-xl font-bold mt-2 ${patient.balance_cents < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(patient.balance_cents)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Square Transactions</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{totalSquareTransactions}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Square Amount</p>
            <p className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(totalSquareAmount)}</p>
          </div>
        </div>

        {/* Square Transactions Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Square Transactions</h2>
          </div>

          {totalSquareTransactions === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tip</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(patient.square_transactions || [])
                    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
                    .map((transaction: SquareTransaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(new Date(transaction.transaction_date).toISOString())}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount_cents)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.tip_amount_cents > 0 ? formatCurrency(transaction.tip_amount_cents) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(transaction.total_cents)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {transaction.payment_method || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            transaction.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {transaction.status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {transaction.receipt_url ? (
                            <a href={transaction.receipt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                              View
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Clinical Notes Section */}
        {patient.clinical_notes && patient.clinical_notes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recent Clinical Notes</h2>
            </div>

            <div className="space-y-4">
              {patient.clinical_notes.slice(0, 5).map((note: any) => (
                <div key={note.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{note.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(note.note_date)}</p>
                      {note.cpt_codes && note.cpt_codes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {note.cpt_codes.map((code: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {code}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {note.is_signed && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Signed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surveys Section */}
        {patient.patient_surveys && patient.patient_surveys.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Recent Surveys</h2>
            </div>

            <div className="space-y-4">
              {patient.patient_surveys.slice(0, 5).map((survey: any) => (
                <div key={survey.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{survey.survey_name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(survey.completed_date)} • Score: {survey.score}
                        {survey.max_score && ` / ${survey.max_score}`}
                      </p>
                    </div>
                    {survey.severity_level && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        survey.severity_level === 'severe' || survey.severity_level === 'very_severe' ? 'bg-red-100 text-red-700' :
                        survey.severity_level === 'moderate' || survey.severity_level === 'moderately_severe' ? 'bg-orange-100 text-orange-700' :
                        survey.severity_level === 'mild' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {survey.severity_level?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
