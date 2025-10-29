import { NextResponse } from 'next/server';

/**
 * Mock Intake API - Fallback when database is unavailable
 * This allows testing the full intake flow without database connection
 */

// In-memory storage for testing (will be lost on server restart)
const mockStorage: any[] = [];
let nextId = 1;

// Mock AI diagnosis generator
function generateMockDiagnoses(formData: any) {
  const { affectedBodyParts, painLevel, symptoms } = formData;
  
  const diagnoses = [
    {
      name: 'Work-Related Musculoskeletal Strain',
      icd10: 'M62.838',
      confidence: 0.82,
      reasoning: `Based on ${affectedBodyParts?.join(', ')} involvement and pain level ${painLevel}/10`,
      cptCodes: [
        { code: '99203', description: 'Office Visit - New Patient (30 min)' },
        { code: '97110', description: 'Therapeutic exercises' }
      ]
    },
    {
      name: 'Soft Tissue Injury',
      icd10: 'M79.9',
      confidence: 0.71,
      reasoning: 'Secondary consideration based on symptom presentation',
      cptCodes: [
        { code: '99203', description: 'Office Visit - New Patient' },
        { code: '97140', description: 'Manual therapy' }
      ]
    }
  ];
  
  return diagnoses;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Generate mock diagnoses
    const diagnoses = generateMockDiagnoses(body);
    
    // Store in memory
    const intakeId = `mock-${nextId++}`;
    mockStorage.push({
      id: intakeId,
      ...body,
      diagnoses,
      status: 'pending',
      submitted_at: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      intakeId: intakeId,
      diagnoses: diagnoses,
      message: 'Intake submitted successfully (MOCK MODE - No database)',
      mock: true
    });
  } catch (error: any) {
    console.error('Mock intake submission error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit intake',
        details: error.message,
        mock: true
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const intake = mockStorage.find(i => i.id === id);
      if (!intake) {
        return NextResponse.json(
          { success: false, error: 'Intake not found', mock: true },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: intake, mock: true });
    } else {
      return NextResponse.json({
        success: true,
        data: mockStorage,
        total: mockStorage.length,
        mock: true
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch intake',
        details: error.message,
        mock: true
      },
      { status: 500 }
    );
  }
}
