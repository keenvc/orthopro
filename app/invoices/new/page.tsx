'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  cpt_code?: string;
  service_date?: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    invoice_number: `INV-${Date.now()}`,
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0,
    },
  ]);

  // Load patients
  useEffect(() => {
    async function loadPatients() {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email')
        .order('last_name');
      
      if (data && !error) {
        setPatients(data);
      }
    }
    loadPatients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto-calculate amount when quantity or unit_price changes
          if (field === 'quantity' || field === 'unit_price') {
            updated.amount = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(items => items.filter(item => item.id !== id));
    }
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate line items
      if (lineItems.some(item => !item.description || item.amount <= 0)) {
        throw new Error('All line items must have a description and amount greater than 0');
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          line_items: lineItems.map(({ id, ...item }) => item),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      // Success - redirect to invoices list
      router.push('/invoices');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/invoices')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Invoices
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Details */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="patient_id"
                    required
                    value={formData.patient_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.last_name}, {patient.first_name} ({patient.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    required
                    value={formData.invoice_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="invoice_date"
                    required
                    value={formData.invoice_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={2}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Line Items</h2>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={item.id} className="p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Item {index + 1}</h3>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Service description"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Unit Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={item.amount.toFixed(2)}
                          readOnly
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          CPT Code (optional)
                        </label>
                        <input
                          type="text"
                          value={item.cpt_code || ''}
                          onChange={(e) => handleLineItemChange(item.id, 'cpt_code', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="99213"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Service Date (optional)
                        </label>
                        <input
                          type="date"
                          value={item.service_date || ''}
                          onChange={(e) => handleLineItemChange(item.id, 'service_date', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.push('/invoices')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || total <= 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
