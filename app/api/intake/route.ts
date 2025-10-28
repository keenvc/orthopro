import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

// Mock AI diagnosis generator based on symptoms and body parts
function generateMockDiagnoses(formData: any) {
  const { symptoms, affectedBodyParts, painLevel } = formData;
  
  // Diagnosis database with conditions based on body parts
  const diagnosisDatabase: any = {
    'Shoulder': [
      { name: 'Rotator Cuff Strain', icd10: 'S46.011A', baseConfidence: 0.85 },
      { name: 'Subacromial Bursitis', icd10: 'M75.5', baseConfidence: 0.72 },
      { name: 'Biceps Tendinitis', icd10: 'M75.20', baseConfidence: 0.65 },
      { name: 'Glenohumeral Joint Instability', icd10: 'M25.311', baseConfidence: 0.43 }
    ],
    'Lower Back': [
      { name: 'Lumbar Strain/Sprain', icd10: 'S39.012A', baseConfidence: 0.88 },
      { name: 'Herniated Lumbar Disc', icd10: 'M51.26', baseConfidence: 0.74 },
      { name: 'Lumbar Facet Joint Syndrome', icd10: 'M47.816', baseConfidence: 0.61 },
      { name: 'Sacroiliac Joint Dysfunction', icd10: 'M53.3', baseConfidence: 0.52 }
    ],
    'Knee': [
      { name: 'Meniscal Tear', icd10: 'S83.241A', baseConfidence: 0.81 },
      { name: 'Patellar Tendinitis', icd10: 'M76.50', baseConfidence: 0.69 },
      { name: 'Anterior Cruciate Ligament Sprain', icd10: 'S83.511A', baseConfidence: 0.58 },
      { name: 'Patellofemoral Pain Syndrome', icd10: 'M22.2X1', baseConfidence: 0.47 }
    ],
    'Wrist': [
      { name: 'Carpal Tunnel Syndrome', icd10: 'G56.00', baseConfidence: 0.83 },
      { name: 'Wrist Sprain', icd10: 'S63.501A', baseConfidence: 0.76 },
      { name: 'De Quervain\'s Tenosynovitis', icd10: 'M65.4', baseConfidence: 0.64 },
      { name: 'Scaphoid Fracture', icd10: 'S62.001A', baseConfidence: 0.51 }
    ],
    'Neck': [
      { name: 'Cervical Strain', icd10: 'S13.4XXA', baseConfidence: 0.86 },
      { name: 'Cervical Radiculopathy', icd10: 'M54.12', baseConfidence: 0.71 },
      { name: 'Cervical Disc Herniation', icd10: 'M50.20', baseConfidence: 0.62 },
      { name: 'Whiplash Injury', icd10: 'S13.4XXA', baseConfidence: 0.49 }
    ]
  };

  // Default diagnoses for unspecified areas
  const defaultDiagnoses = [
    { name: 'Musculoskeletal Strain', icd10: 'M62.838', baseConfidence: 0.75 },
    { name: 'Soft Tissue Injury', icd10: 'M79.9', baseConfidence: 0.68 },
    { name: 'Contusion', icd10: 'S80.01XA', baseConfidence: 0.55 },
    { name: 'Overuse Injury', icd10: 'M70.90', baseConfidence: 0.42 }
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
    
    // Save to database
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('intake_submissions')
      .insert({
        injury_date: body.injuryDate,
        injury_time: body.injuryTime,
        injury_location: body.injuryLocation,
        injury_description: body.injuryDescription,
        employer_name: body.employerName,
        workers_comp_claim_number: body.claimNumber,
        previous_injuries: body.previousInjuries,
        current_medications: body.currentMedications,
        allergies: body.allergies,
        medical_history: body.medicalHistory,
        pain_level: body.painLevel,
        symptoms: body.symptoms,
        affected_body_parts: body.affectedBodyParts,
        ai_diagnoses: diagnoses,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      intakeId: data.id,
      diagnoses: diagnoses,
      message: 'Intake submitted successfully'
    });
  } catch (error: any) {
    console.error('Intake submission error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to submit intake',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const supabase = getSupabaseClient();
    
    if (id) {
      // Get specific intake
      const { data, error } = await supabase
        .from('intake_submissions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return NextResponse.json({ success: true, data });
    } else {
      // Get all intakes (with pagination)
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');
      
      const { data, error, count } = await supabase
        .from('intake_submissions')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      
      return NextResponse.json({ success: true, data, total: count });
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
