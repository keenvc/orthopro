'use client';

import { useState } from 'react';
import Navigation from '../../components/Navigation';
import { Download, FileJson, FileText, Calendar, CheckCircle } from 'lucide-react';

export default function DataExportPage() {
  const [exportType, setExportType] = useState('intakes');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exporting, setExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportComplete(false);
    
    try {
      const response = await fetch('/api/rcm/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportType, format, dateRange })
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportType}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Export
          </h1>
          <p className="text-gray-600">
            Export patient intake records, claims data, and other information
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-8">
            {/* Export Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What would you like to export?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ExportTypeButton
                  type="intakes"
                  label="Intake Submissions"
                  description="All worker injury intake forms"
                  icon={<FileText className="w-6 h-6" />}
                  selected={exportType === 'intakes'}
                  onClick={() => setExportType('intakes')}
                />
                <ExportTypeButton
                  type="claims"
                  label="Eligibility Checks"
                  description="VOB and eligibility verifications"
                  icon={<CheckCircle className="w-6 h-6" />}
                  selected={exportType === 'claims'}
                  onClick={() => setExportType('claims')}
                />
                <ExportTypeButton
                  type="notes"
                  label="Doctor Notes"
                  description="Prescriptions and treatment plans"
                  icon={<FileText className="w-6 h-6" />}
                  selected={exportType === 'notes'}
                  onClick={() => setExportType('notes')}
                />
              </div>
            </div>
            
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormat('csv')}
                  className={`p-6 border-2 rounded-lg transition ${
                    format === 'csv'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  <p className="font-semibold text-gray-900">CSV</p>
                  <p className="text-xs text-gray-500 mt-1">Comma-Separated Values</p>
                  <p className="text-xs text-gray-500">Excel compatible</p>
                </button>
                
                <button
                  onClick={() => setFormat('json')}
                  className={`p-6 border-2 rounded-lg transition ${
                    format === 'json'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileJson className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  <p className="font-semibold text-gray-900">JSON</p>
                  <p className="text-xs text-gray-500 mt-1">JavaScript Object Notation</p>
                  <p className="text-xs text-gray-500">API/Developer friendly</p>
                </button>
              </div>
            </div>
            
            {/* Date Range (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range (Optional)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Leave empty to export all records
              </p>
            </div>

            {/* Export Summary */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Type:</strong> {exportType === 'intakes' ? 'Intake Submissions' : exportType === 'claims' ? 'Eligibility Checks' : 'Doctor Notes'}</p>
                <p><strong>Format:</strong> {format.toUpperCase()}</p>
                <p><strong>Date Range:</strong> {dateRange.start && dateRange.end ? `${dateRange.start} to ${dateRange.end}` : 'All records'}</p>
              </div>
            </div>
            
            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting || exportComplete}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Generating Export...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-3" />
                  Export Complete!
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 mr-3" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Information Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3">About Data Exports</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>CSV format:</strong> Best for importing into Excel, Google Sheets, or other spreadsheet applications</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>JSON format:</strong> Best for developers, APIs, or custom data processing</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Data Privacy:</strong> Exported files contain PHI. Handle securely and follow HIPAA guidelines</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Mock Data:</strong> This is a demonstration. Production would export real database records</span>
            </li>
          </ul>
        </div>

        {/* Recent Exports (Mock) */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
          <div className="space-y-3">
            <RecentExportItem
              type="Intake Submissions"
              format="CSV"
              date={new Date(Date.now() - 2 * 60 * 60 * 1000)}
              records={23}
            />
            <RecentExportItem
              type="Eligibility Checks"
              format="JSON"
              date={new Date(Date.now() - 24 * 60 * 60 * 1000)}
              records={47}
            />
            <RecentExportItem
              type="Doctor Notes"
              format="CSV"
              date={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
              records={15}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportTypeButton({ type, label, description, icon, selected, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 border-2 rounded-lg transition text-left ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-lg ${selected ? 'bg-blue-100' : 'bg-gray-100'}`}>
          {icon}
        </div>
      </div>
      <p className="font-semibold text-gray-900 mb-1">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </button>
  );
}

function RecentExportItem({ type, format, date, records }: any) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-green-100 rounded-lg">
          {format === 'CSV' ? (
            <FileText className="w-5 h-5 text-green-600" />
          ) : (
            <FileJson className="w-5 h-5 text-green-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{type}</p>
          <p className="text-sm text-gray-600">{records} records • {format}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-900">{date.toLocaleDateString()}</p>
        <p className="text-xs text-gray-500">{date.toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
