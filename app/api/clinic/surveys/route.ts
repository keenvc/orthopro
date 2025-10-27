import { NextResponse } from 'next/server';
import { getPatientSurveysByClinic, getHighRiskPatients } from '../../../../lib/clinic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic = searchParams.get('clinic') || 'centered-one';
    const type = searchParams.get('type');

    if (type === 'high-risk') {
      const patients = await getHighRiskPatients(clinic);
      return NextResponse.json({
        success: true,
        count: patients.length,
        data: patients
      });
    }

    const surveys = await getPatientSurveysByClinic(clinic);

    return NextResponse.json({
      success: true,
      count: surveys.length,
      data: surveys
    });
  } catch (error) {
    console.error('Error fetching surveys:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}
