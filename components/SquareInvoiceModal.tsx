'use client';

import { X, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface SquareInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sendEmail: boolean, sendText: boolean) => void;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  copayAmount: number;
}

export default function SquareInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  patientName,
  patientEmail,
  patientPhone,
  copayAmount
}: SquareInvoiceModalProps) {
  const [sendEmail, setSendEmail] = useState(true);
  const [sendText, setSendText] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(sendEmail, sendText);
      onClose();
    } catch (error) {
      console.error('Error sending invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded">
              <Image
                src="https://mira.au/wp-content/uploads/2023/02/square-invert.png"
                alt="Square"
                width={24}
                height={24}
                className="w-6 h-6"
              />
            </div>
            <h2 className="text-xl font-bold">Send Square Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-gray-700 rounded-full p-2 transition"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <p className="text-lg text-gray-800 mb-2">
              Send Square invoice to{' '}
              <span className="font-semibold text-blue-600">{patientName}</span>?
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Invoice Amount:</span>
                <span className="text-xl font-bold text-blue-700">
                  {formatCurrency(copayAmount * 100)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-6">
            {/* Email Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">Email</span>
                  {!patientEmail && (
                    <span className="text-xs text-red-500">(No email on file)</span>
                  )}
                </div>
                {patientEmail && (
                  <span className="text-sm text-gray-500">{patientEmail}</span>
                )}
              </div>
            </label>

            {/* Text/SMS Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={sendText}
                onChange={(e) => setSendText(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">Text Message</span>
                  {!patientPhone && (
                    <span className="text-xs text-red-500">(No phone on file)</span>
                  )}
                </div>
                {patientPhone && (
                  <span className="text-sm text-gray-500">{patientPhone}</span>
                )}
              </div>
            </label>
          </div>

          {/* Warning if neither selected */}
          {!sendEmail && !sendText && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please select at least one delivery method
              </p>
            </div>
          )}

          {/* Warning if no contact info */}
          {((sendEmail && !patientEmail) || (sendText && !patientPhone)) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                {sendEmail && !patientEmail && 'Email address is missing. '}
                {sendText && !patientPhone && 'Phone number is missing.'}
                <br />
                Please update patient contact information first.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md transition"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (!sendEmail && !sendText) ||
              (sendEmail && !patientEmail) ||
              (sendText && !patientPhone)
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                Send Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
