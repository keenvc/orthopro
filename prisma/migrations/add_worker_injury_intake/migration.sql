-- Add user role to support Patient/Doctor authentication
-- Note: If users table doesn't exist, this will need to be adjusted
-- For now, we'll create the intake-specific tables

-- Intake submissions table
CREATE TABLE IF NOT EXISTS intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending',
  
  -- Step 1: Incident Details
  injury_date DATE,
  injury_time TIME,
  injury_location TEXT,
  injury_description TEXT,
  employer_name VARCHAR(255),
  workers_comp_claim_number VARCHAR(100),
  
  -- Step 2: Patient History
  previous_injuries TEXT,
  current_medications TEXT,
  allergies TEXT,
  medical_history TEXT,
  
  -- Step 3: Current Symptoms
  pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 10),
  symptoms TEXT[],
  affected_body_parts TEXT[],
  
  -- AI Suggestions
  ai_diagnoses JSONB,
  
  -- Clinical Pipeline
  pipeline_status JSONB DEFAULT '{
    "history_complete": false,
    "nurse_exam_complete": false,
    "imaging_complete": false,
    "ortho_review_complete": false
  }'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Doctor notes table
CREATE TABLE IF NOT EXISTS doctor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_id UUID REFERENCES intake_submissions(id) ON DELETE CASCADE,
  doctor_id UUID,
  personal_info_notes TEXT,
  symptoms_notes TEXT,
  diagnosis_notes TEXT,
  prescription TEXT,
  erx_sent BOOLEAN DEFAULT false,
  secure_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Claims eligibility table
CREATE TABLE IF NOT EXISTS claims_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID,
  payer_name VARCHAR(255),
  member_id VARCHAR(100),
  dob DATE,
  eligible BOOLEAN,
  copay_amount DECIMAL(10,2),
  deductible_amount DECIMAL(10,2),
  deductible_met DECIMAL(10,2),
  reason TEXT,
  checked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_intake_patient_id ON intake_submissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_intake_status ON intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_intake_submitted_at ON intake_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_doctor_notes_intake_id ON doctor_notes(intake_id);
CREATE INDEX IF NOT EXISTS idx_claims_patient_id ON claims_eligibility(patient_id);

-- Add updated_at trigger for intake_submissions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_intake_submissions_updated_at
  BEFORE UPDATE ON intake_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_notes_updated_at
  BEFORE UPDATE ON doctor_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
