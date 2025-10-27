'use client';

import { useEffect, useState } from 'react';
import Navigation from '../../components/Navigation';
import { formatDate } from '../../../lib/utils';
import { Search, TrendingUp, AlertCircle, Filter } from 'lucide-react';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyTypeFilter, setSurveyTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    async function loadSurveys() {
      try {
        const response = await fetch('/api/clinic/surveys');
        const result = await response.json();
        if (result.success) {
          setSurveys(result.data);
          setFilteredSurveys(result.data);
        }
      } catch (error) {
        console.error('Error loading surveys:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSurveys();
  }, []);

  useEffect(() => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey =>
        `${survey.patients?.first_name} ${survey.patients?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.patients?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (surveyTypeFilter !== 'all') {
      filtered = filtered.filter(survey => survey.survey_type === surveyTypeFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(survey => survey.severity_level === severityFilter);
    }

    setFilteredSurveys(filtered);
  }, [searchTerm, surveyTypeFilter, severityFilter, surveys]);

  const surveyTypes = Array.from(new Set(surveys.map(s => s.survey_type)));
  const severityLevels = Array.from(new Set(surveys.map(s => s.severity_level))).filter(Boolean);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
      case 'very_severe':
        return 'bg-red-100 text-red-700';
      case 'moderate':
      case 'moderately_severe':
        return 'bg-orange-100 text-orange-700';
      case 'mild':
        return 'bg-yellow-100 text-yellow-700';
      case 'minimal':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSurveyLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'phq9': 'PHQ-9 (Depression)',
      'gad7': 'GAD-7 (Anxiety)',
      'ybocs': 'Y-BOCS (OCD)',
      'mood_score': 'Mood Score'
    };
    return labels[type] || type;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Patient Surveys</h1>
          <p className="text-gray-600 mt-2">Mental Health Assessment Tracking</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={surveyTypeFilter}
                onChange={(e) => setSurveyTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Survey Types</option>
                {surveyTypes.map(type => (
                  <option key={type} value={type}>
                    {getSurveyLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severity</option>
              {severityLevels.map(level => (
                <option key={level} value={level}>
                  {level?.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* High-Risk Alert */}
        {filteredSurveys.some(s => s.severity_level === 'severe' || s.severity_level === 'very_severe') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">High-Risk Patients</h3>
                <p className="text-red-700 text-sm mt-1">
                  {filteredSurveys.filter(s => s.severity_level === 'severe' || s.severity_level === 'very_severe').length} patients showing severe assessment scores
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Surveys Grid */}
        <div className="space-y-4">
          {filteredSurveys.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No survey responses found</p>
            </div>
          ) : (
            filteredSurveys.map(survey => (
              <div key={survey.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {survey.patients?.first_name} {survey.patients?.last_name}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {getSurveyLabel(survey.survey_type)}
                      </span>
                      {survey.severity_level && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSeverityColor(survey.severity_level)}`}>
                          {survey.severity_level?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      Score: <span className="font-semibold text-lg">{survey.score}</span>
                      {survey.max_score && <span className="text-gray-500"> / {survey.max_score}</span>}
                    </p>
                    {survey.interpretation && (
                      <p className="text-gray-700 mb-3 bg-blue-50 p-3 rounded">{survey.interpretation}</p>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <p>{formatDate(survey.completed_date)}</p>
                      {survey.patients?.email && (
                        <p className="text-gray-400">{survey.patients.email}</p>
                      )}
                    </div>
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
