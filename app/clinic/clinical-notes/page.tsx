'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/app/components/Navigation';
import { formatDate } from '@/lib/utils';
import { Search, FileText, Filter } from 'lucide-react';

export default function ClinicalNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [noteTypeFilter, setNoteTypeFilter] = useState('all');

  useEffect(() => {
    async function loadNotes() {
      try {
        const response = await fetch('/api/clinic/clinical-notes');
        const result = await response.json();
        if (result.success) {
          setNotes(result.data);
          setFilteredNotes(result.data);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  useEffect(() => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note =>
        `${note.patients?.first_name} ${note.patients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.cpt_codes?.some((code: string) => code.includes(searchTerm))
      );
    }

    if (noteTypeFilter !== 'all') {
      filtered = filtered.filter(note => note.note_type === noteTypeFilter);
    }

    setFilteredNotes(filtered);
  }, [searchTerm, noteTypeFilter, notes]);

  const noteTypes = Array.from(new Set(notes.map(n => n.note_type)));

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clinical Notes</h1>
          <p className="text-gray-600 mt-2">Total: {filteredNotes.length} notes</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name, note title, or CPT code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={noteTypeFilter}
                onChange={(e) => setNoteTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {noteTypes.map(type => (
                  <option key={type} value={type}>
                    {type?.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No clinical notes found</p>
            </div>
          ) : (
            filteredNotes.map(note => (
              <div key={note.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {note.patients?.first_name} {note.patients?.last_name}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {note.note_type?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      {note.is_signed && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Signed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{note.title}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.cpt_codes?.map((code: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {code}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(note.note_date)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
