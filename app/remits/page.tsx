'use client';

import { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../lib/utils';
import { FileText, DollarSign, Calendar, Building2, Search, Download, ExternalLink, Filter, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface RemittanceDocument {
  id: string;
  original_pdf_file: string;
  parsed_json_file: string;
  transaction_date: string;
  total_pages: number;
  imported_at: string;
  check?: {
    id: string;
    payer_name: string;
    payee_name: string;
    check_eft_trace_number: string;
    check_eft_date: string;
    payment_amount: number;
  };
  claim_count?: number;
  patient_names?: string[];
  claim_numbers?: string[];
  total_patient_responsibility?: number;
}

type SortColumn = 'date' | 'payer' | 'payee' | 'check' | 'amount' | 'patient' | 'responsibility' | 'claim_number' | 'claims';
type SortDirection = 'asc' | 'desc';

export default function RemitsPage() {
  const [remits, setRemits] = useState<RemittanceDocument[]>([]);
  const [filteredRemits, setFilteredRemits] = useState<RemittanceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [payerFilter, setPayerFilter] = useState('all');
  const [payers, setPayers] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showInboxHealthModal, setShowInboxHealthModal] = useState(false);
  const [selectedRemit, setSelectedRemit] = useState<RemittanceDocument | null>(null);
  const [stats, setStats] = useState({
    totalRemits: 0,
    totalAmount: 0,
    checksWithPayments: 0,
    totalClaims: 0
  });

  useEffect(() => {
    async function loadRemits() {
      try {
        // Fetch remittance documents with related check data
        const { data: documents, error: docsError } = await supabase
          .from('remittance_documents')
          .select(`
            id,
            original_pdf_file,
            parsed_json_file,
            transaction_date,
            total_pages,
            imported_at
          `)
          .order('transaction_date', { ascending: false });

        if (docsError) throw docsError;

        // Fetch checks
        const { data: checks, error: checksError } = await supabase
          .from('remittance_checks')
          .select('*');

        if (checksError) throw checksError;

        // Fetch claims with patient information
        const { data: claims, error: claimsError } = await supabase
          .from('remittance_claims')
          .select('id, check_id, patient_name, claim_number, patient_responsibility');

        if (claimsError) throw claimsError;

        // Build claim aggregation maps
        const claimCountMap = new Map<string, number>();
        const patientNamesMap = new Map<string, string[]>();
        const claimNumbersMap = new Map<string, string[]>();
        const patientRespMap = new Map<string, number>();
        
        claims?.forEach(claim => {
          const checkId = claim.check_id;
          
          // Count claims
          const count = claimCountMap.get(checkId) || 0;
          claimCountMap.set(checkId, count + 1);
          
          // Collect patient names (unique)
          if (claim.patient_name) {
            const names = patientNamesMap.get(checkId) || [];
            if (!names.includes(claim.patient_name)) {
              names.push(claim.patient_name);
            }
            patientNamesMap.set(checkId, names);
          }
          
          // Collect claim numbers (unique)
          if (claim.claim_number) {
            const numbers = claimNumbersMap.get(checkId) || [];
            if (!numbers.includes(claim.claim_number)) {
              numbers.push(claim.claim_number);
            }
            claimNumbersMap.set(checkId, numbers);
          }
          
          // Sum patient responsibility
          if (claim.patient_responsibility) {
            const total = patientRespMap.get(checkId) || 0;
            patientRespMap.set(checkId, total + claim.patient_responsibility);
          }
        });

        // Build check map
        const checkMap = new Map(checks?.map(c => [c.document_id, c]) || []);

        // Combine data
        const combined = documents?.map(doc => {
          const check = checkMap.get(doc.id);
          const checkId = check?.id;
          return {
            ...doc,
            check: check ? {
              id: check.id,
              payer_name: check.payer_name || 'Unknown',
              payee_name: check.payee_name || 'Unknown',
              check_eft_trace_number: check.check_eft_trace_number || '',
              check_eft_date: check.check_eft_date || '',
              payment_amount: check.payment_amount || 0
            } : undefined,
            claim_count: checkId ? claimCountMap.get(checkId) || 0 : 0,
            patient_names: checkId ? patientNamesMap.get(checkId) || [] : [],
            claim_numbers: checkId ? claimNumbersMap.get(checkId) || [] : [],
            total_patient_responsibility: checkId ? patientRespMap.get(checkId) || 0 : 0
          };
        }) || [];

        setRemits(combined);
        setFilteredRemits(combined);

        // Extract unique payers
        const uniquePayers = Array.from(new Set(
          combined
            .map(r => r.check?.payer_name)
            .filter((p): p is string => !!p && p !== 'Unknown')
        )).sort();
        setPayers(uniquePayers);

        // Calculate stats
        const totalChecks = combined.filter(r => r.check).length;
        const totalAmt = combined.reduce((sum, r) => sum + (r.check?.payment_amount || 0), 0);
        const checksWithAmt = combined.filter(r => r.check && r.check.payment_amount > 0).length;
        const totalClaimsCount = combined.reduce((sum, r) => sum + (r.claim_count || 0), 0);

        setStats({
          totalRemits: combined.length,
          totalAmount: totalAmt,
          checksWithPayments: checksWithAmt,
          totalClaims: totalClaimsCount
        });
      } catch (error) {
        console.error('Error loading remits:', error);
        setRemits([]);
        setFilteredRemits([]);
      } finally {
        setLoading(false);
      }
    }
    loadRemits();
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => {
    const isActive = sortColumn === column;
    return (
      <th 
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none transition-colors"
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          {isActive ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )
          ) : (
            <ChevronsUpDown className="w-4 h-4 opacity-30" />
          )}
        </div>
      </th>
    );
  };

  useEffect(() => {
    let filtered = remits;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(remit => {
        const searchLower = searchTerm.toLowerCase();
        const patientNamesMatch = remit.patient_names?.some(name => 
          name?.toLowerCase().includes(searchLower)
        ) || false;
        const claimNumbersMatch = remit.claim_numbers?.some(number => 
          number?.toLowerCase().includes(searchLower)
        ) || false;
        return (
          remit.check?.payer_name?.toLowerCase().includes(searchLower) ||
          remit.check?.payee_name?.toLowerCase().includes(searchLower) ||
          remit.check?.check_eft_trace_number?.toLowerCase().includes(searchLower) ||
          remit.original_pdf_file?.toLowerCase().includes(searchLower) ||
          patientNamesMatch ||
          claimNumbersMatch
        );
      });
    }

    // Apply payer filter
    if (payerFilter !== 'all') {
      filtered = filtered.filter(remit => remit.check?.payer_name === payerFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortColumn) {
        case 'date':
          aVal = a.transaction_date || '';
          bVal = b.transaction_date || '';
          break;
        case 'payer':
          aVal = (a.check?.payer_name || '').toLowerCase();
          bVal = (b.check?.payer_name || '').toLowerCase();
          break;
        case 'payee':
          aVal = (a.check?.payee_name || '').toLowerCase();
          bVal = (b.check?.payee_name || '').toLowerCase();
          break;
        case 'check':
          aVal = a.check?.check_eft_trace_number || '';
          bVal = b.check?.check_eft_trace_number || '';
          break;
        case 'amount':
          aVal = a.check?.payment_amount || 0;
          bVal = b.check?.payment_amount || 0;
          break;
        case 'patient':
          aVal = (a.patient_names?.[0] || '').toLowerCase();
          bVal = (b.patient_names?.[0] || '').toLowerCase();
          break;
        case 'responsibility':
          aVal = a.total_patient_responsibility || 0;
          bVal = b.total_patient_responsibility || 0;
          break;
        case 'claim_number':
          aVal = (a.claim_numbers?.[0] || '').toLowerCase();
          bVal = (b.claim_numbers?.[0] || '').toLowerCase();
          break;
        case 'claims':
          aVal = a.claim_count || 0;
          bVal = b.claim_count || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredRemits(filtered);
  }, [searchTerm, payerFilter, remits, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Remittance Advice (ERA)</h2>
          <p className="text-gray-600 mt-2">Insurance payment remittances and claims data</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalRemits}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(stats.totalAmount * 100)}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Checks</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.checksWithPayments}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg text-white">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalClaims}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg text-white">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-[10] relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by payer, patient, claim number, check number, or file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={payerFilter}
                onChange={(e) => setPayerFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Payers</option>
                {payers.map(payer => (
                  <option key={payer} value={payer}>{payer}</option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600 flex items-center flex-shrink-0 whitespace-nowrap">
              Showing {filteredRemits.length} of {remits.length} remits
            </div>
          </div>
        </div>

        {/* Remits Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Remittance Documents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader column="date">Date</SortableHeader>
                  <SortableHeader column="payer">Payer Name</SortableHeader>
                  <SortableHeader column="patient">Patient Name</SortableHeader>
                  <SortableHeader column="responsibility">Patient Responsibility</SortableHeader>
                  <SortableHeader column="claim_number">Claim Number</SortableHeader>
                  <SortableHeader column="payee">Payee</SortableHeader>
                  <SortableHeader column="check">Check #</SortableHeader>
                  <SortableHeader column="amount">Amount</SortableHeader>
                  <SortableHeader column="claims">Claims</SortableHeader>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PDF File
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRemits.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium">No remits found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || payerFilter !== 'all' 
                          ? 'Try adjusting your search or filters' 
                          : 'Remit data will appear here once imported'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRemits.map((remit) => (
                    <tr key={remit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(remit.transaction_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {remit.check?.payer_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {remit.patient_names && remit.patient_names.length > 0
                            ? remit.patient_names.length === 1
                              ? remit.patient_names[0]
                              : remit.patient_names.length === 2
                                ? remit.patient_names.join(', ')
                                : `${remit.patient_names[0]} +${remit.patient_names.length - 1} more`
                            : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold text-orange-600">
                            {remit.total_patient_responsibility && remit.total_patient_responsibility > 0
                              ? formatCurrency(remit.total_patient_responsibility * 100)
                              : '$0.00'}
                          </div>
                          {remit.total_patient_responsibility && remit.total_patient_responsibility > 0.01 && (
                            <button
                              onClick={() => {
                                setSelectedRemit(remit);
                                setShowInboxHealthModal(true);
                              }}
                              className="hover:opacity-80 transition-opacity"
                              title="Send to Inbox Health"
                            >
                              <img
                                src="https://gust-production.s3.amazonaws.com/uploads/startup/logo_image/62346/Inbox_20Social_20Logo.png"
                                alt="Inbox Health"
                                className="w-6 h-6 rounded"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {remit.claim_numbers && remit.claim_numbers.length > 0
                            ? remit.claim_numbers.length === 1
                              ? remit.claim_numbers[0]
                              : remit.claim_numbers.length === 2
                                ? remit.claim_numbers.join(', ')
                                : `${remit.claim_numbers[0]} +${remit.claim_numbers.length - 1} more`
                            : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {remit.check?.payee_name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-500">
                          {remit.check?.check_eft_trace_number || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {remit.check?.payment_amount 
                            ? formatCurrency(remit.check.payment_amount * 100)
                            : '$0.00'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {remit.claim_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`/api/remits/pdf?path=${encodeURIComponent(remit.original_pdf_file)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                          title={remit.original_pdf_file}
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          <span>View PDF</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">About Remits</h3>
              <div className="mt-2 text-sm text-blue-800">
                <p>
                  Electronic Remittance Advice (ERA) provides detailed payment information from insurance companies
                  and payers. This page displays all remittance data including payment amounts, check numbers,
                  and processing status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Inbox Health Modal */}
      {showInboxHealthModal && selectedRemit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4">
              <img
                src="https://gust-production.s3.amazonaws.com/uploads/startup/logo_image/62346/Inbox_20Social_20Logo.png"
                alt="Inbox Health"
                className="w-12 h-12 rounded"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Send to Inbox Health
                </h3>
                <p className="text-gray-700">
                  Would you like to send this patient responsibility for{' '}
                  <span className="font-semibold text-gray-900">
                    {selectedRemit.patient_names && selectedRemit.patient_names.length > 0
                      ? selectedRemit.patient_names[0]
                      : 'this patient'}
                  </span>{' '}
                  to Inbox Health?
                </p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Amount: <span className="font-semibold text-orange-600">
                    {formatCurrency((selectedRemit.total_patient_responsibility || 0) * 100)}
                  </span></p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowInboxHealthModal(false);
                  setSelectedRemit(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement actual send to Inbox Health functionality
                  console.log('Sending to Inbox Health:', selectedRemit);
                  setShowInboxHealthModal(false);
                  setSelectedRemit(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Send to Inbox Health
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
