import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

// Mock AI diagnosis generator with ICD-10 and CPT codes
function generateMockDiagnoses(formData: any) {
  const { symptoms, affectedBodyParts, painLevel, mechanismOfInjury } = formData;
  
  // Comprehensive diagnosis database with ICD-10 and CPT codes
  const diagnosisDatabase: any = {
    'Shoulder': [
      { 
        name: 'Rotator Cuff Strain', 
        icd10: 'S46.011A', 
        baseConfidence: 0.85,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient (30 min)' },
          { code: '73030', description: 'Radiologic exam, shoulder (X-ray)' },
          { code: '20610', description: 'Arthrocentesis/injection, major joint' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      },
      { 
        name: 'Subacromial Bursitis', 
        icd10: 'M75.5', 
        baseConfidence: 0.72,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73030', description: 'Shoulder X-ray' },
          { code: '20610', description: 'Shoulder injection' },
          { code: '97140', description: 'Manual therapy' }
        ]
      },
      { 
        name: 'Biceps Tendinitis', 
        icd10: 'M75.20', 
        baseConfidence: 0.65,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73030', description: 'Shoulder X-ray' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      },
      { 
        name: 'Glenohumeral Joint Instability', 
        icd10: 'M25.311', 
        baseConfidence: 0.43,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73030', description: 'Shoulder X-ray' },
          { code: '73221', description: 'MRI upper extremity' }
        ]
      }
    ],
    'Lower Back': [
      { 
        name: 'Lumbar Strain/Sprain', 
        icd10: 'S39.012A', 
        baseConfidence: 0.88,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72100', description: 'Lumbar spine X-ray (2-3 views)' },
          { code: '97110', description: 'Therapeutic exercises' },
          { code: '98940', description: 'Chiropractic manipulation' }
        ]
      },
      { 
        name: 'Herniated Lumbar Disc', 
        icd10: 'M51.26', 
        baseConfidence: 0.74,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72148', description: 'MRI lumbar spine without contrast' },
          { code: '64483', description: 'Epidural steroid injection' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      },
      { 
        name: 'Lumbar Facet Joint Syndrome', 
        icd10: 'M47.816', 
        baseConfidence: 0.61,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72100', description: 'Lumbar spine X-ray' },
          { code: '64493', description: 'Facet joint injection lumbar' }
        ]
      },
      { 
        name: 'Sacroiliac Joint Dysfunction', 
        icd10: 'M53.3', 
        baseConfidence: 0.52,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72100', description: 'Lumbar spine X-ray' },
          { code: '27096', description: 'SI joint injection' }
        ]
      }
    ],
    'Knee': [
      { 
        name: 'Meniscal Tear', 
        icd10: 'S83.241A', 
        baseConfidence: 0.81,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73562', description: 'Knee X-ray (3 views)' },
          { code: '73721', description: 'MRI lower extremity' },
          { code: '29881', description: 'Arthroscopy with meniscectomy' }
        ]
      },
      { 
        name: 'Patellar Tendinitis', 
        icd10: 'M76.50', 
        baseConfidence: 0.69,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73562', description: 'Knee X-ray' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      },
      { 
        name: 'Anterior Cruciate Ligament Sprain', 
        icd10: 'S83.511A', 
        baseConfidence: 0.58,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73562', description: 'Knee X-ray' },
          { code: '73721', description: 'MRI lower extremity' },
          { code: '29888', description: 'ACL reconstruction' }
        ]
      },
      { 
        name: 'Patellofemoral Pain Syndrome', 
        icd10: 'M22.2X1', 
        baseConfidence: 0.47,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73562', description: 'Knee X-ray' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      }
    ],
    'Wrist': [
      { 
        name: 'Carpal Tunnel Syndrome', 
        icd10: 'G56.00', 
        baseConfidence: 0.83,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '95860', description: 'Needle EMG study' },
          { code: '95900', description: 'Nerve conduction study' },
          { code: '64721', description: 'Carpal tunnel release' }
        ]
      },
      { 
        name: 'Wrist Sprain', 
        icd10: 'S63.501A', 
        baseConfidence: 0.76,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73100', description: 'Wrist X-ray (2 views)' },
          { code: '29125', description: 'Splint application, forearm' }
        ]
      },
      { 
        name: 'De Quervain\'s Tenosynovitis', 
        icd10: 'M65.4', 
        baseConfidence: 0.64,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '20550', description: 'Tendon sheath injection' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      },
      { 
        name: 'Scaphoid Fracture', 
        icd10: 'S62.001A', 
        baseConfidence: 0.51,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '73100', description: 'Wrist X-ray' },
          { code: '25628', description: 'Open treatment scaphoid fracture' }
        ]
      }
    ],
    'Neck': [
      { 
        name: 'Cervical Strain', 
        icd10: 'S13.4XXA', 
        baseConfidence: 0.86,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72040', description: 'Cervical spine X-ray (2-3 views)' },
          { code: '97110', description: 'Therapeutic exercises' },
          { code: '98940', description: 'Chiropractic manipulation' }
        ]
      },
      { 
        name: 'Cervical Radiculopathy', 
        icd10: 'M54.12', 
        baseConfidence: 0.71,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72141', description: 'MRI cervical spine without contrast' },
          { code: '64479', description: 'Cervical epidural injection' }
        ]
      },
      { 
        name: 'Cervical Disc Herniation', 
        icd10: 'M50.20', 
        baseConfidence: 0.62,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72141', description: 'MRI cervical spine' },
          { code: '64479', description: 'Cervical epidural injection' },
          { code: '63081', description: 'Cervical laminectomy' }
        ]
      },
      { 
        name: 'Whiplash Injury', 
        icd10: 'S13.4XXA', 
        baseConfidence: 0.49,
        cptCodes: [
          { code: '99203', description: 'Office Visit - New Patient' },
          { code: '72040', description: 'Cervical spine X-ray' },
          { code: '97110', description: 'Therapeutic exercises' }
        ]
      }
    ]
  };

  // Default diagnoses for unspecified areas
  const defaultDiagnoses = [
    { 
      name: 'Musculoskeletal Strain', 
      icd10: 'M62.838', 
      baseConfidence: 0.75,
      cptCodes: [
        { code: '99203', description: 'Office Visit - New Patient' },
        { code: '97110', description: 'Therapeutic exercises' }
      ]
    },
    { 
      name: 'Soft Tissue Injury', 
      icd10: 'M79.9', 
      baseConfidence: 0.68,
      cptCodes: [
        { code: '99203', description: 'Office Visit - New Patient' },
        { code: '97110', description: 'Therapeutic exercises' }
      ]
    },
    { 
      name: 'Contusion', 
      icd10: 'S80.01XA', 
      baseConfidence: 0.55,
      cptCodes: [
        { code: '99203', description: 'Office Visit - New Patient' },
        { code: '97035', description: 'Ultrasound therapy' }
      ]
    },
    { 
      name: 'Overuse Injury', 
      icd10: 'M70.90', 
      baseConfidence: 0.42,
      cptCodes: [
        { code: '99203', description: 'Office Visit - New Patient' },
        { code: '97110', description: 'Therapeutic exercises' }
      ]
    }
  ];

  // Select diagnoses based on affected body parts
  let selectedDiagnoses = defaultDiagnoses;
  
  if (affectedBodyParts && affectedBodyParts.length > 0) {
    const primaryBodyPart = affectedBodyParts[0];
    selectedDiagnoses = diagnosisDatabase[primaryBodyPart] || defaultDiagnoses;
  }

  // Adjust confidence based on pain level and symptoms
  const adjustedDiagnoses = selectedDiagnoses.map((diag: any) => {
    let confidence = diag.baseConfidence;
    
    // Higher pain increases confidence for more severe diagnoses
    if (painLevel >= 7) {
      confidence = Math.min(confidence * 1.1, 0.95);
    }
    
    // More symptoms increase overall confidence
    if (symptoms && symptoms.length >= 3) {
      confidence = Math.min(confidence * 1.05, 0.95);
    }
    
    return {
      ...diag,
      confidence: parseFloat(confidence.toFixed(2))
    };
  });

  // Add reasoning for each diagnosis
  const diagnosesWithReasoning = adjustedDiagnoses.map((diag: any, idx: number) => {
    let reasoning = '';
    
    if (idx === 0) {
      reasoning = `Primary diagnosis based on ${affectedBodyParts?.join(', ')} involvement, pain level ${painLevel}/10, and symptom presentation including ${symptoms?.slice(0, 2).join(' and ')}`;
    } else if (idx === 1) {
      reasoning = `Secondary consideration due to similar symptom overlap and anatomical proximity`;
    } else if (idx === 2) {
      reasoning = `Differential diagnosis to rule out based on mechanism of injury`;
    } else {
      reasoning = `Less likely but possible given the clinical presentation`;
    }
    
    return {
      ...diag,
      reasoning
    };
  });

  return diagnosesWithReasoning.slice(0, 4); // Return top 4
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate mock AI diagnoses
    const diagnoses = generateMockDiagnoses(body);
    
    // Save to database using pg pool
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        INSERT INTO intake_submissions (
          injury_date,
          injury_time,
          injury_location,
          injury_description,
          mechanism_of_injury,
          work_activity,
          employer_name,
          workers_comp_claim_number,
          previous_injuries,
          current_medications,
          allergies,
          medical_history,
          pain_level,
          symptoms,
          affected_body_parts,
          ai_diagnoses,
          status,
          submitted_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW()
        ) RETURNING id
      `, [
        body.injuryDate || null,
        body.injuryTime || null,
        body.injuryLocation || null,
        body.injuryDescription || null,
        body.mechanismOfInjury || null,
        body.workActivity || null,
        body.employerName || null,
        body.claimNumber || null,
        body.previousInjuries || null,
        body.currentMedications || null,
        body.allergies || null,
        body.medicalHistory || null,
        body.painLevel || null,
        body.symptoms || null,
        body.affectedBodyParts || null,
        JSON.stringify(diagnoses),
        'pending'
      ]);
      
      const intakeId = result.rows[0].id;
      
      return NextResponse.json({
        success: true,
        intakeId: intakeId,
        diagnoses: diagnoses,
        message: 'Intake submitted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Intake submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit intake',
        details: error.message,
        hasDbUrl: !!process.env.DATABASE_URL
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      if (id) {
        // Get specific intake
        const result = await client.query(
          'SELECT * FROM intake_submissions WHERE id = $1',
          [id]
        );
        
        if (result.rows.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Intake not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json({ success: true, data: result.rows[0] });
      } else {
        // Get all intakes (with pagination)
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        
        const countResult = await client.query('SELECT COUNT(*) FROM intake_submissions');
        const total = parseInt(countResult.rows[0].count);
        
        const dataResult = await client.query(
          'SELECT * FROM intake_submissions ORDER BY submitted_at DESC LIMIT $1 OFFSET $2',
          [limit, offset]
        );
        
        return NextResponse.json({ 
          success: true, 
          data: dataResult.rows, 
          total: total 
        });
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Intake fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch intake',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
