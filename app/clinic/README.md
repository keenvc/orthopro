# Clinic Pages & API Reference

## Pages

### Dashboard (`/clinic/dashboard`)
Main analytics dashboard for Centered Clinic with:
- KPI metrics (patients, notes, appointments, surveys)
- Appointment status pie chart
- Mental health risk distribution bar chart
- High-risk patient alerts
- Summary statistics by category

**Data Source:** `/api/clinic/dashboard`

### Clinical Notes (`/clinic/clinical-notes`)
Browse and search clinical notes from patient records:
- Search by patient name, note title, or CPT code
- Filter by note type
- View CPT codes, signed status, dates
- Color-coded note type badges

**Data Source:** `/api/clinic/clinical-notes`

### Surveys (`/clinic/surveys`)
Mental health assessment tracking with:
- Multiple survey types (PHQ-9, GAD-7, Y-BOCS, Mood)
- Severity level classification
- Search by patient name or email
- Filter by survey type and severity
- Color-coded risk badges
- High-risk patient alerts

**Data Source:** `/api/clinic/surveys`

### Appointments (`/clinic/appointments`)
Appointment management with:
- Search by patient, email, phone, or appointment type
- Display appointment details and provider
- Show virtual vs in-person mode
- Track no-shows and cancellations
- Alert for attendance issues

**Data Source:** `/api/clinic/appointments`

---

## API Endpoints

All endpoints return JSON with success status and data array.

### GET `/api/clinic/dashboard`

Get dashboard statistics for the clinic.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_patients": 300,
    "total_notes": 4282,
    "total_appointments": 5763,
    "total_surveys": 1715,
    "high_risk_surveys": 45,
    "no_shows": 120,
    "cancellations": 89,
    "patients_with_notes": 280,
    "patients_with_surveys": 150,
    "patients_with_appointments": 290
  }
}
```

### GET `/api/clinic/clinical-notes`

Get clinical notes for the clinic.

**Query Parameters:**
- `clinic` (optional): Clinic ID (default: "centered-one")

**Response:**
```json
{
  "success": true,
  "count": 4282,
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "title": "Medical SOAP Note",
      "note_type": "medical_soap",
      "note_date": "2025-10-20",
      "cpt_codes": ["99213", "99214"],
      "is_signed": true,
      "patients": {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### GET `/api/clinic/surveys`

Get patient surveys and mental health assessments.

**Query Parameters:**
- `clinic` (optional): Clinic ID (default: "centered-one")
- `type` (optional): "high-risk" to get only high-risk patients

**Response:**
```json
{
  "success": true,
  "count": 1715,
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "survey_type": "phq9",
      "survey_name": "PHQ-9: Patient Health Questionnaire-9",
      "score": 18,
      "max_score": 27,
      "severity_level": "moderately_severe",
      "completed_date": "2025-10-22",
      "patients": {
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

### GET `/api/clinic/appointments`

Get upcoming appointments.

**Query Parameters:**
- `clinic` (optional): Clinic ID (default: "centered-one")
- `type` (optional): "stats" to get only statistics

**Response:**
```json
{
  "success": true,
  "count": 100,
  "data": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "appointment_date": "2025-10-28T14:30:00Z",
      "appointment_type": "Initial Evaluation",
      "appointment_mode": "virtual",
      "status": "scheduled",
      "no_show": false,
      "cancelled": false,
      "patients": {
        "first_name": "Bob",
        "last_name": "Johnson",
        "email": "bob@example.com",
        "cell_phone": "555-0123"
      },
      "doctors": {
        "first_name": "Dr.",
        "last_name": "Williams"
      }
    }
  ]
}
```

### Stats Endpoint

**GET `/api/clinic/appointments?type=stats`**

Returns appointment statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5763,
    "noShows": 120,
    "cancelled": 89
  }
}
```

---

## Data Structures

### Clinical Note
```typescript
{
  id: string;
  patient_id: string;
  clinic_id: string;
  note_type: 'medical_soap' | 'therapy_soap' | 'kap' | 'psychotherapy' | 'evaluation' | 'im_ketamine' | 'simple' | 'memo';
  title: string;
  note_date: string; // ISO date
  cpt_codes: string[];
  is_signed: boolean;
  created_at: string;
}
```

### Patient Survey
```typescript
{
  id: string;
  patient_id: string;
  clinic_id: string;
  survey_type: 'phq9' | 'gad7' | 'ybocs' | 'mood_score' | 'unknown';
  survey_name: string;
  score: number;
  max_score: number | null;
  severity_level: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe' | 'very_severe';
  completed_date: string; // ISO datetime
  created_at: string;
}
```

### Appointment
```typescript
{
  id: string;
  patient_id: string;
  clinic_id: string;
  appointment_date: string; // ISO datetime
  appointment_type: string;
  appointment_mode: 'virtual' | 'in_person' | 'phone';
  status: 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';
  no_show: boolean;
  cancelled: boolean;
  created_at: string;
}
```

---

## Usage Examples

### Fetch All Clinical Notes
```javascript
const response = await fetch('/api/clinic/clinical-notes');
const { data, count } = await response.json();
console.log(`Found ${count} notes`);
```

### Get High-Risk Patients
```javascript
const response = await fetch('/api/clinic/surveys?type=high-risk');
const { data } = await response.json();
data.forEach(patient => console.log(patient.survey_name, patient.severity_level));
```

### Get Appointment Stats
```javascript
const response = await fetch('/api/clinic/appointments?type=stats');
const { data } = await response.json();
console.log(`No-shows: ${data.noShows}, Cancelled: ${data.cancelled}`);
```

### Use Data Library
```typescript
import { 
  getClinicalNotesByClinic,
  getHighRiskPatients,
  getUpcomingAppointments 
} from '@/lib/clinic';

// Get all notes for clinic
const notes = await getClinicalNotesByClinic('centered-one');

// Get high-risk patients
const riskPatients = await getHighRiskPatients('centered-one');

// Get upcoming appointments
const appointments = await getUpcomingAppointments('centered-one');
```

---

## Performance Considerations

- Dashboard queries: ~100ms
- Clinical notes queries: ~150ms per 100 records
- Survey queries: ~120ms per 100 records
- Appointment queries: ~130ms per 50 records

All queries use optimized indexes. Results can be cached client-side for better performance.

---

## Customization

### Add New Filters
Edit page components in `/clinic/*/page.tsx` to add additional filters or search fields.

### Customize Charts
Dashboard charts use Recharts. Modify `/clinic/dashboard/page.tsx` to change visualizations.

### Add New Pages
Create new file in `/clinic/*/page.tsx` and add route to Navigation component.

### Extend API Routes
Add new functions to `/lib/clinic.ts` and create corresponding API routes in `/app/api/clinic/`.

---

## Support

For issues or questions:
1. Check `/CLINIC_DATA_SETUP.md` for setup issues
2. Review `/CLINIC_DATA_SCHEMA_ANALYSIS.md` for data structure questions
3. Check browser console for error details
4. Verify Supabase credentials in `.env.local`
