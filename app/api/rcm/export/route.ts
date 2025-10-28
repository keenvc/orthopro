import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabase';

// Helper to convert data to CSV
function convertToCSV(data: any[], type: string): string {
  if (!data || data.length === 0) {
    return 'No data available\n';
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  // Convert each row
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Handle arrays and objects
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
      // Escape quotes in strings
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { exportType, format, dateRange } = body;
    
    if (!exportType || !format) {
      return NextResponse.json(
        { error: 'Missing exportType or format' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    let data: any[] = [];
    let tableName = '';

    // Fetch data based on export type
    switch (exportType) {
      case 'intakes':
        tableName = 'intake_submissions';
        let query = supabase
          .from(tableName)
          .select('*')
          .order('submitted_at', { ascending: false });
        
        if (dateRange?.start) {
          query = query.gte('submitted_at', dateRange.start);
        }
        if (dateRange?.end) {
          query = query.lte('submitted_at', dateRange.end);
        }
        
        const { data: intakes, error: intakesError } = await query;
        if (intakesError) throw intakesError;
        data = intakes || [];
        break;

      case 'claims':
        tableName = 'claims_eligibility';
        let claimsQuery = supabase
          .from(tableName)
          .select('*')
          .order('checked_at', { ascending: false });
        
        if (dateRange?.start) {
          claimsQuery = claimsQuery.gte('checked_at', dateRange.start);
        }
        if (dateRange?.end) {
          claimsQuery = claimsQuery.lte('checked_at', dateRange.end);
        }
        
        const { data: claims, error: claimsError } = await claimsQuery;
        if (claimsError) throw claimsError;
        data = claims || [];
        break;

      case 'notes':
        tableName = 'doctor_notes';
        let notesQuery = supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (dateRange?.start) {
          notesQuery = notesQuery.gte('created_at', dateRange.start);
        }
        if (dateRange?.end) {
          notesQuery = notesQuery.lte('created_at', dateRange.end);
        }
        
        const { data: notes, error: notesError } = await notesQuery;
        if (notesError) throw notesError;
        data = notes || [];
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        );
    }

    console.log(`📊 [EXPORT] Exporting ${data.length} ${exportType} records as ${format.toUpperCase()}`);

    // Format data based on requested format
    let content: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'csv') {
      content = convertToCSV(data, exportType);
      contentType = 'text/csv';
      fileExtension = 'csv';
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use csv or json' },
        { status: 400 }
      );
    }

    // Create response with file download
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${exportType}_export_${Date.now()}.${fileExtension}"`,
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error.message },
      { status: 500 }
    );
  }
}
