# Clinic Data Setup - Complete Implementation Guide

## Status: Ready for Database Setup and Import

This guide will help you set up the clinical notes, patient surveys, and enhanced appointments functionality for the Centered Clinic.

## Step 1: Create Database Tables

### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase dashboard: https://supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Create a new query and paste the contents of `/root/CLINIC_DATA_SCHEMA_IMPLEMENTATION.sql`
5. Click "Run" to execute

### Option B: Using psql Command Line

```bash
psql -h your-db.supabase.co -U postgres -d postgres -f /root/CLINIC_DATA_SCHEMA_IMPLEMENTATION.sql
```

## Step 2: Import CSV Data

After creating the tables, import the clinic data:

1. Navigate to `/root` directory
2. Run the import script:
```bash
node import-clinic-data.js
```

## Step 3: Verify Import

Check that data was imported successfully:

1. Open Supabase SQL Editor
2. Run verification queries:

```sql
-- Check clinical notes
SELECT COUNT(*) as total_notes FROM clinical_notes;
SELECT COUNT(DISTINCT patient_id) as patients_with_notes FROM clinical_notes;

-- Check surveys
SELECT COUNT(*) as total_surveys FROM patient_surveys;
SELECT COUNT(DISTINCT patient_id) as patients_with_surveys FROM patient_surveys;
SELECT survey_type, COUNT(*) FROM patient_surveys GROUP BY survey_type;

-- Check appointments
SELECT COUNT(*) as total_appointments FROM appointments;
SELECT COUNT(*) as no_shows FROM appointments WHERE no_show = true;
SELECT COUNT(*) as cancelled FROM appointments WHERE cancelled = true;
```

## Step 4: Test Web App Pages

The new pages are now available:

1. **Clinic Dashboard**
   - URL: http://localhost:3000/clinic/dashboard
   - Shows stats and charts for clinic data

2. **Clinical Notes**
   - URL: http://localhost:3000/clinic/clinical-notes
   - Search and filter clinical notes

3. **Patient Surveys**
   - URL: http://localhost:3000/clinic/surveys
   - View mental health assessments and risk levels

4. **Appointments**
   - URL: http://localhost:3000/clinic/appointments
   - Manage upcoming and past appointments

## Data Summary

- **Total Records**: 11,760
- **Clinical Notes**: 4,282
- **Appointments**: 5,763
- **Patient Surveys**: 1,715
- **Unique Patients**: ~300+

## Features Implemented

### Clinical Notes
- Note type filtering (Medical SOAP, KAP, Psychotherapy, etc.)
- CPT code extraction and display
- Signed status tracking
- Patient association

### Patient Surveys
- Multiple survey types (PHQ-9, GAD-7, Y-BOCS, Mood Score)
- Severity level classification
- Risk assessment
- Trend tracking over time

### Appointments
- Appointment type classification
- Status tracking (scheduled, no-show, cancelled)
- Provider assignment
- Virtual/In-person mode
- Utilization analytics

## Environment Variables

Ensure these are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## API Endpoints

The following API endpoints are now available:

- `GET /api/clinic/clinical-notes` - Get clinical notes
- `GET /api/clinic/surveys` - Get patient surveys
- `GET /api/clinic/appointments` - Get appointments
- `GET /api/clinic/dashboard` - Get dashboard statistics

## Support

If you encounter any issues:

1. Check that the SQL schema was applied successfully
2. Verify environment variables are set
3. Ensure CSV files exist in `/root/centered_osmind_data/`
4. Check browser console for API errors
5. Review server logs for database connection issues

## Next Steps

1. Deploy to Render
2. Monitor performance with analytics
3. Customize dashboard visualizations as needed
4. Set up automated data refresh (if needed)
