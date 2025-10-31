import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Square API Configuration
const SQUARE_API_BASE_URL = process.env.SQUARE_ENVIRONMENT === 'production' 
  ? 'https://connect.squareup.com'
  : 'https://connect.squareupsandbox.com';

// Initialize MXRoute email transporter
const transporter = nodemailer.createTransport({
  host: process.env.MXROUTE_SMTP_HOST || 'mail.mxroute.com',
  port: parseInt(process.env.MXROUTE_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MXROUTE_EMAIL || process.env.MXROUTE_USERNAME,
    pass: process.env.MXROUTE_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2',
  },
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const {
      patient_id,
      patient_name,
      patient_email,
      patient_phone,
      amount,
      send_email,
      send_text,
    } = await req.json();

    // Validate required fields
    if (!patient_id || !patient_name || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Square credentials
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      console.error('Square API credentials not configured');
      return NextResponse.json(
        { error: 'Square API not configured' },
        { status: 500 }
      );
    }

    // Validate MXRoute credentials if email is requested
    if (send_email && (!process.env.MXROUTE_EMAIL || !process.env.MXROUTE_PASSWORD)) {
      console.error('MXRoute credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    console.log('Creating Square invoice for:', {
      patient_name,
      amount,
      send_email,
      send_text,
    });

    // Create Square invoice
    const locationId = process.env.SQUARE_LOCATION_ID;
    
    if (!locationId) {
      return NextResponse.json(
        { error: 'Square location ID not configured' },
        { status: 500 }
      );
    }

    // Generate unique idempotency key
    const idempotencyKey = `invoice-${patient_id}-${Date.now()}`;

    // Prepare invoice data
    const invoiceData = {
      idempotency_key: idempotencyKey,
      invoice: {
        location_id: locationId,
        primary_recipient: {
          given_name: patient_name.split(' ')[0],
          family_name: patient_name.split(' ').slice(1).join(' ') || patient_name.split(' ')[0],
          email_address: patient_email || undefined,
          phone_number: patient_phone || undefined,
        },
        payment_requests: [
          {
            request_type: 'BALANCE',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0], // 7 days from now
            automatic_payment_source: 'NONE',
          },
        ],
        delivery_method: 'EMAIL',
        invoice_number: `COPAY-${Date.now()}`,
        title: 'Co-Pay Invoice',
        description: `Co-pay payment for ${patient_name}`,
        scheduled_at: new Date().toISOString(),
        accepted_payment_methods: {
          card: true,
          square_gift_card: false,
          bank_account: false,
        },
      },
    };

    // Create the invoice via REST API
    const createResponse = await fetch(`${SQUARE_API_BASE_URL}/v2/invoices`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...invoiceData,
        order: {
          location_id: locationId,
          line_items: [
            {
              name: 'Co-Pay',
              quantity: '1',
              base_price_money: {
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'USD',
              },
            },
          ],
        },
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error('Square API error:', errorData);
      throw new Error(errorData.errors?.[0]?.detail || 'Failed to create invoice');
    }

    const createData = await createResponse.json();
    const invoice = createData.invoice;
    console.log('Square invoice created:', invoice.id);

    // Publish the invoice (makes it viewable and payable)
    const publishResponse = await fetch(`${SQUARE_API_BASE_URL}/v2/invoices/${invoice.id}/publish`, {
      method: 'POST',
      headers: {
        'Square-Version': '2024-12-18',
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: invoice.version,
        idempotency_key: `publish-${idempotencyKey}`,
      }),
    });

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json();
      console.error('Square publish error:', errorData);
      throw new Error(errorData.errors?.[0]?.detail || 'Failed to publish invoice');
    }

    const publishData = await publishResponse.json();
    const publishedInvoice = publishData.invoice;
    const invoiceUrl = publishedInvoice?.public_url || '#';

    console.log('Invoice published:', invoiceUrl);

    // Send custom email via MXRoute if requested
    if (send_email && patient_email) {
      try {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice from ${process.env.CLINIC_NAME || 'Our Clinic'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Invoice Ready</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${patient_name},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your co-pay invoice is ready for payment. You can view and pay your invoice securely through Square.
    </p>
    
    <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Invoice Amount</p>
      <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0;">$${(amount).toFixed(2)}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${invoiceUrl}" 
         style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold;">
        View & Pay Invoice
      </a>
    </div>
    
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #1976d2;">
        <strong>💳 Payment Methods Accepted:</strong> Credit Card, Debit Card
      </p>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      If you have any questions about this invoice, please contact us.
    </p>
    
    <p style="font-size: 14px; color: #666;">
      Thank you,<br>
      <strong>${process.env.CLINIC_NAME || 'Our Clinic'}</strong>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p style="margin: 5px 0;">This is an automated message. Please do not reply to this email.</p>
    <p style="margin: 5px 0;">Invoice #${publishedInvoice?.invoice_number || 'N/A'}</p>
  </div>
</body>
</html>
        `;

        await transporter.sendMail({
          from: `"${process.env.CLINIC_NAME || 'Clinic'}" <${process.env.MXROUTE_EMAIL}>`,
          to: patient_email,
          subject: `Invoice Ready - $${(amount).toFixed(2)}`,
          html: emailHtml,
          text: `Hi ${patient_name},\n\nYour co-pay invoice for $${(amount).toFixed(2)} is ready.\n\nView and pay your invoice: ${invoiceUrl}\n\nThank you,\n${process.env.CLINIC_NAME || 'Our Clinic'}`,
        });

        console.log('Email sent successfully to:', patient_email);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the entire request if email fails
      }
    }

    // Send SMS via Twilio if requested
    if (send_text && patient_phone) {
      try {
        // Check if Twilio is configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
          console.error('Twilio credentials not configured');
        } else {
          const twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );

          const smsMessage = `Hi ${patient_name}, your co-pay invoice for $${(amount).toFixed(2)} is ready. View and pay here: ${invoiceUrl} - ${process.env.CLINIC_NAME || 'Advanced Care'}`;

          await twilioClient.messages.create({
            body: smsMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: patient_phone,
          });

          console.log('SMS sent successfully to:', patient_phone);
        }
      } catch (smsError) {
        console.error('Error sending SMS:', smsError);
        // Don't fail the entire request if SMS fails
      }
    }

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      invoice_url: invoiceUrl,
      invoice_number: publishedInvoice?.invoice_number,
      amount: amount,
      email_sent: send_email && patient_email ? true : false,
      text_sent: send_text && patient_phone && process.env.TWILIO_ACCOUNT_SID ? true : false,
    });

  } catch (error: any) {
    console.error('Error creating Square invoice:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create invoice',
        details: error.message || 'Unknown error',
        errors: error.errors || [],
      },
      { status: 500 }
    );
  }
}
