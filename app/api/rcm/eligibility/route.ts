import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabase';

// Mock eligibility checker
// In production, this would integrate with:
// - Change Healthcare
// - Availity
// - Waystar (formerly Zirmed)
// - Your clearinghouse API

function generateMockEligibility(formData: any) {
  const { payerName, memberId, dob, firstName, lastName } = formData;
  
  // Simulate eligibility based on member ID pattern
  // Even member IDs ending in even numbers = eligible
  // Odd = not eligible (for demo purposes)
  const lastDigit = parseInt(memberId.slice(-1));
  const isEligible = lastDigit % 2 === 0 || memberId.toLowerCase().includes('wc');
  
  if (isEligible) {
    return {
      eligible: true,
      payerName,
      memberId,
      planType: 'Workers Compensation',
      copay: Math.random() > 0.5 ? 0 : 25,
      deductible: Math.random() > 0.3 ? 0 : 500,
      deductibleMet: Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 300),
      officeVisitsCovered: true,
      physicalTherapyCovered: true,
      imagingCovered: true,
      surgeryCovered: true,
      prescriptionCovered: true,
      requiresAuth: Math.random() > 0.7,
      effectiveDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  } else {
    return {
      eligible: false,
      payerName,
      memberId,
      reason: 'Member ID not found in payer system. Please verify the policy number and try again.'
    };
  }
}

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payerName, memberId, dob, firstName, lastName } = body;
    
    if (!payerName || !memberId || !dob) {
      return NextResponse.json(
        { error: 'Missing required fields: payerName, memberId, and dob are required' },
        { status: 400 }
      );
    }
    
    // Generate mock eligibility result
    const result = generateMockEligibility(body);
    
    // Save to database
    const supabase = getSupabaseClient();
    await supabase
      .from('claims_eligibility')
      .insert({
        payer_name: payerName,
        member_id: memberId,
        dob: dob,
        eligible: result.eligible,
        copay_amount: result.copay || 0,
        deductible_amount: result.deductible || 0,
        deductible_met: result.deductibleMet || 0,
        reason: result.reason || null,
        checked_at: new Date().toISOString()
      });
    
    console.log('✅ [MOCK] Eligibility check:', {
      payerName,
      memberId,
      eligible: result.eligible,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Eligibility check error:', error);
    return NextResponse.json(
      { error: 'Failed to check eligibility', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('claims_eligibility')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error: any) {
    console.error('Eligibility history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eligibility history', details: error.message },
      { status: 500 }
    );
  }
}
