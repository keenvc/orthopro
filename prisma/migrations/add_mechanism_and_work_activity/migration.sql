-- Add mechanism of injury and work activity fields to intake_submissions table
ALTER TABLE intake_submissions
ADD COLUMN IF NOT EXISTS mechanism_of_injury VARCHAR(50),
ADD COLUMN IF NOT EXISTS work_activity VARCHAR(100);

-- Add index for mechanism of injury for analytics
CREATE INDEX IF NOT EXISTS idx_intake_mechanism ON intake_submissions(mechanism_of_injury);
