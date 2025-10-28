'use client';

import { useState } from 'react';
import { Send, Mail, CheckCircle, FileText, Loader2 } from 'lucide-react';

interface PrescriptionPanelProps {
  intakeId: string;
}

export default function PrescriptionPanel({ intakeId }: PrescriptionPanelProps) {
  const [prescription, setPrescription] = useState('');
  const [erxSending, setErxSending] = useState(false);
  const [erxSent, setErxSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleErx = async () => {
    if (!prescription.trim()) {
      alert('Please enter a prescription before sending');
      return;
    }

    setErxSending(true);
    try {
      const response = await fetch('/api/doctor/erx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeId, prescription })
      });

      if (response.ok) {
        setErxSent(true);
        setTimeout(() => setErxSent(false), 3000);
      } else {
        throw new Error('Failed to send e-Rx');
      }
    } catch (error) {
      console.error('e-Rx error:', error);
      alert('Failed to send e-Rx. This is a stub endpoint.');
    } finally {
      setErxSending(false);
    }
  };

  const handleSecureEmail = async () => {
    if (!prescription.trim()) {
      alert('Please enter prescription details before sending');
      return;
    }

    setEmailSending(true);
    try {
      const response = await fetch('/api/doctor/secure-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeId, prescription })
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      } else {
        throw new Error('Failed to send secure email');
      }
    } catch (error) {
      console.error('Secure email error:', error);
      alert('Failed to send secure email. This is a stub endpoint.');
    } finally {
      setEmailSending(false);
    }
  };

  const saveDoctorNotes = async () => {
    try {
      await fetch('/api/doctor/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intakeId, prescription })
      });
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Prescription / Treatment Plan
        </label>
        <textarea
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
          onBlur={saveDoctorNotes}
          rows={8}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter prescription details, treatment plan, or follow-up instructions...

Example:
- Medication: Ibuprofen 600mg TID with food
- Physical therapy: 2x per week for 4 weeks
- Ice/heat therapy as needed
- Follow-up in 2 weeks
- Work restrictions: Light duty, no lifting >10 lbs"
        />
        <p className="mt-1 text-xs text-gray-500">
          Auto-saves as you type. Changes are saved to the patient's record.
        </p>
      </div>
      
      <div className="space-y-3">
        {/* e-Rx Button */}
        <button
          onClick={handleErx}
          disabled={erxSending || erxSent || !prescription.trim()}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center group"
        >
          {erxSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending e-Rx...
            </>
          ) : erxSent ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              e-Rx Sent Successfully!
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
              Send Electronic Prescription (e-Rx)
            </>
          )}
        </button>
        
        {/* Paubox Secure Email Button */}
        <button
          onClick={handleSecureEmail}
          disabled={emailSending || emailSent || !prescription.trim()}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center group"
        >
          {emailSending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Sending via Paubox...
            </>
          ) : emailSent ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Secure Email Sent!
            </>
          ) : (
            <>
              <Mail className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Send Secure Email (Paubox)
            </>
          )}
        </button>
      </div>

      {/* Info Boxes */}
      <div className="space-y-2 pt-2">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            <strong>e-Rx:</strong> Electronic prescription sent directly to patient's pharmacy
          </p>
        </div>
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-800">
            <strong>Paubox:</strong> HIPAA-compliant secure email delivery to patient
          </p>
        </div>
      </div>

      {/* Additional Actions */}
      <div className="pt-4 border-t border-gray-200 space-y-2">
        <button className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition">
          View Full Patient Chart →
        </button>
        <button className="w-full text-gray-600 hover:text-gray-700 font-medium text-sm py-2 hover:bg-gray-50 rounded-lg transition">
          Schedule Follow-up Appointment
        </button>
      </div>

      {/* Stub Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          ℹ️ <strong>Demo Mode:</strong> e-Rx and Paubox are stub implementations. 
          In production, these would integrate with real pharmacy and email systems.
        </p>
      </div>
    </div>
  );
}
