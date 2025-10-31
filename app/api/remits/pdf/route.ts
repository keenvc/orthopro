import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get the file path from query parameter
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Decode the path (in case it was URL encoded)
    let decodedPath = decodeURIComponent(filePath);

    // Handle path mapping - the database has old paths that need to be corrected
    // Map /root/availity_remits/ -> /root/remits/availity/
    if (decodedPath.startsWith('/root/availity_remits/')) {
      const fileName = path.basename(decodedPath);
      decodedPath = `/root/remits/availity/${fileName}`;
    }

    // Security: Ensure the path is within allowed directories
    const allowedBasePath = '/root/remits';
    if (!decodedPath.startsWith(allowedBasePath)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!existsSync(decodedPath)) {
      return NextResponse.json(
        { error: 'File not found', path: decodedPath },
        { status: 404 }
      );
    }

    // Read the PDF file
    const fileBuffer = await readFile(decodedPath);

    // Get filename for download
    const fileName = path.basename(decodedPath);

    // Return the PDF file
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
