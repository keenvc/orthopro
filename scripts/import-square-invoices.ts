#!/usr/bin/env tsx
/**
 * Square Invoice Import Script
 * 
 * Imports Square invoices from CSV export into the database.
 * Handles patient matching/creation and invoice creation.
 * 
 * Usage:
 *   npx tsx scripts/import-square-invoices.ts <csv-file-path>
 *   npx tsx scripts/import-square-invoices.ts invoices-export.csv
 */

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface SquareInvoiceRow {
  'Invoice Token': string;
  'Invoice Date': string;
  'Time Zone': string;
  'Invoice ID': string;
  'Customer Name': string;
  'Customer Email': string;
  'Customer Phone': string;
  'Invoice Title': string;
  'Status': string;
  'Requested Amount': string;
  'Due Date': string;
  'Last Payment Date': string;
  'Amount Paid': string;
  'Recurring Series ID': string;
  'Invoice Delivery Method': string;
  'Number of Installments': string;
  'Tip Amount': string;
  'Automatic Payment Source': string;
  'Service date': string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse dollar amount string to cents integer
 * "$50.00" -> 5000
 * "$1.84" -> 184
 */
function parseAmountToCents(amount: string): number {
  if (!amount || amount.trim() === '') return 0;
  
  // Remove $ and any whitespace
  const cleaned = amount.replace(/[$,\s]/g, '');
  
  // Parse as float and convert to cents
  const dollars = parseFloat(cleaned);
  if (isNaN(dollars)) return 0;
  
  return Math.round(dollars * 100);
}

/**
 * Parse date string to Date object
 * Handles empty strings by returning null
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Normalize Square status to our internal status
 */
function normalizeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'Paid': 'paid',
    'Unpaid': 'unpaid',
    'Overdue': 'overdue',
    'Recurring': 'recurring',
    'Canceled': 'canceled',
    'Payment Pending': 'payment_pending'
  };
  
  return statusMap[status] || status.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Normalize delivery method
 */
function normalizeDeliveryMethod(method: string): string | null {
  if (!method || method.trim() === '') return null;
  
  const methodMap: Record<string, string> = {
    'Email': 'email',
    'Text Message': 'sms',
    'SMS': 'sms',
    'Mail': 'mail'
  };
  
  return methodMap[method] || method.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Normalize auto payment source
 */
function normalizeAutoPaymentSource(source: string): string | null {
  if (!source || source.trim() === '' || source === 'None') return null;
  
  const sourceMap: Record<string, string> = {
    'Card on File': 'card_on_file',
    'Bank Account': 'bank_account',
    'None': null
  };
  
  if (source in sourceMap) {
    return sourceMap[source];
  }
  
  return source.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Parse customer name into first and last name
 * "John Doe" -> { firstName: "John", lastName: "Doe" }
 * "Mary Jane Smith" -> { firstName: "Mary", lastName: "Jane Smith" }
 */
function parseCustomerName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName || fullName.trim() === '') {
    return { firstName: 'Unknown', lastName: 'Customer' };
  }
  
  const parts = fullName.trim().split(/\s+/);
  
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  
  return { firstName, lastName };
}

/**
 * Format phone number to E.164 format (best effort)
 * "+12039092944" -> "+12039092944"
 * "2039092944" -> "+12039092944"
 */
function formatPhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it already starts with +, keep it
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Assume US/Canada (+1) if 10 digits
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Otherwise, just add + to whatever we have
  return `+${digits}`;
}

// ============================================
// PATIENT OPERATIONS
// ============================================

/**
 * Find or create a patient based on email and/or phone
 * Priority: email match > phone match > create new
 */
async function upsertPatient(
  customerName: string,
  email: string,
  phone: string
): Promise<string> {
  const { firstName, lastName } = parseCustomerName(customerName);
  const formattedPhone = formatPhone(phone);
  const cleanEmail = email?.toLowerCase().trim() || null;
  
  // Try to find existing patient by email
  if (cleanEmail) {
    const existingByEmail = await prisma.patients.findFirst({
      where: { email: cleanEmail }
    });
    
    if (existingByEmail) {
      console.log(`  ✓ Found existing patient by email: ${cleanEmail}`);
      return existingByEmail.id;
    }
  }
  
  // Try to find by phone if email didn't match
  if (formattedPhone) {
    const existingByPhone = await prisma.patients.findFirst({
      where: { phone: formattedPhone }
    });
    
    if (existingByPhone) {
      console.log(`  ✓ Found existing patient by phone: ${formattedPhone}`);
      return existingByPhone.id;
    }
  }
  
  // Create new patient
  console.log(`  + Creating new patient: ${firstName} ${lastName}`);
  const newPatient = await prisma.patients.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email: cleanEmail,
      phone: formattedPhone,
      balance_cents: 0
    }
  });
  
  return newPatient.id;
}

// ============================================
// INVOICE OPERATIONS
// ============================================

/**
 * Create a Square invoice in the database
 */
async function createSquareInvoice(row: SquareInvoiceRow): Promise<void> {
  const patientId = await upsertPatient(
    row['Customer Name'],
    row['Customer Email'],
    row['Customer Phone']
  );
  
  const amountCents = parseAmountToCents(row['Requested Amount']);
  const paidCents = parseAmountToCents(row['Amount Paid']);
  const balanceCents = amountCents - paidCents;
  const tipCents = parseAmountToCents(row['Tip Amount']);
  
  const invoiceDate = parseDate(row['Invoice Date']);
  const dueDate = parseDate(row['Due Date']);
  const serviceDate = parseDate(row['Service date']);
  const lastPaymentDate = parseDate(row['Last Payment Date']);
  
  const status = normalizeStatus(row['Status']);
  const deliveryMethod = normalizeDeliveryMethod(row['Invoice Delivery Method']);
  const autoPaymentSource = normalizeAutoPaymentSource(row['Automatic Payment Source']);
  
  const installmentsCount = parseInt(row['Number of Installments']) || 1;
  
  try {
    // Check if invoice already exists
    const existing = await prisma.invoices.findFirst({
      where: {
        processor: 'square',
        processor_invoice_id: row['Invoice Token']
      }
    });
    
    if (existing) {
      console.log(`  ⊘ Invoice already exists: ${row['Invoice ID']}`);
      return;
    }
    
    // Create invoice
    await prisma.invoices.create({
      data: {
        patient_id: patientId,
        processor: 'square',
        processor_invoice_id: row['Invoice Token'],
        invoice_number: row['Invoice ID'],
        invoice_title: row['Invoice Title'],
        invoice_date: invoiceDate,
        date_of_service: serviceDate,
        due_date: dueDate,
        last_payment_date: lastPaymentDate,
        amount_cents: amountCents,
        balance_cents: balanceCents,
        status: status,
        time_zone: row['Time Zone'],
        delivery_method: deliveryMethod,
        recurring_series_id: row['Recurring Series ID'] || null,
        installments_count: installmentsCount,
        tip_amount_cents: tipCents,
        auto_payment_source: autoPaymentSource
      }
    });
    
    console.log(`  ✓ Created invoice: ${row['Invoice ID']} - ${row['Invoice Title']} ($${(amountCents / 100).toFixed(2)})`);
    
    // If invoice is paid, create payment record
    if (status === 'paid' && paidCents > 0 && lastPaymentDate) {
      await createPaymentForInvoice(
        patientId,
        row['Invoice Token'],
        paidCents,
        tipCents,
        lastPaymentDate
      );
    }
    
  } catch (error: any) {
    console.error(`  ✗ Error creating invoice ${row['Invoice ID']}:`, error.message);
    throw error;
  }
}

/**
 * Create a payment record for a paid invoice
 */
async function createPaymentForInvoice(
  patientId: string,
  invoiceToken: string,
  amountCents: number,
  tipCents: number,
  paymentDate: Date
): Promise<void> {
  try {
    // Get the invoice ID
    const invoice = await prisma.invoices.findFirst({
      where: {
        processor: 'square',
        processor_invoice_id: invoiceToken
      }
    });
    
    if (!invoice) {
      console.warn(`    ⚠ Invoice not found for payment: ${invoiceToken}`);
      return;
    }
    
    // Create payment
    const payment = await prisma.payments.create({
      data: {
        patient_id: patientId,
        amount_cents: amountCents,
        tip_amount_cents: tipCents,
        payment_method: 'square',
        payment_date: paymentDate,
        status: 'completed',
        processor: 'square',
        processor_payment_id: `square_${invoiceToken}_payment`
      }
    });
    
    // Link payment to invoice
    await prisma.invoice_payments.create({
      data: {
        payment_id: payment.id,
        invoice_id: invoice.id,
        amount_cents: amountCents
      }
    });
    
    console.log(`    ✓ Created payment: $${(amountCents / 100).toFixed(2)}`);
    
  } catch (error: any) {
    console.error(`    ✗ Error creating payment:`, error.message);
  }
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

async function importSquareInvoices(csvPath: string): Promise<void> {
  console.log('\n🔄 Square Invoice Import Starting...\n');
  console.log(`📄 CSV File: ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }
  
  // Read and parse CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const records: SquareInvoiceRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  console.log(`📊 Found ${records.length} invoices to import\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Process each invoice
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    console.log(`\n[${i + 1}/${records.length}] Processing: ${row['Invoice ID']}`);
    
    try {
      await createSquareInvoice(row);
      successCount++;
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        skippedCount++;
      } else {
        errorCount++;
        console.error(`Error: ${error.message}`);
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary');
  console.log('='.repeat(60));
  console.log(`✓ Successfully imported: ${successCount}`);
  console.log(`⊘ Skipped (duplicates):  ${skippedCount}`);
  console.log(`✗ Errors:                ${errorCount}`);
  console.log(`📈 Total processed:      ${records.length}`);
  console.log('='.repeat(60) + '\n');
}

// ============================================
// CLI ENTRY POINT
// ============================================

async function main() {
  const csvPath = process.argv[2];
  
  if (!csvPath) {
    console.error('❌ Error: CSV file path required');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/import-square-invoices.ts <csv-file-path>');
    console.log('\nExample:');
    console.log('  npx tsx scripts/import-square-invoices.ts square-invoices.csv');
    process.exit(1);
  }
  
  try {
    await importSquareInvoices(csvPath);
    console.log('✅ Import completed successfully\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}
