import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    // Enhanced environment variable checking
    const envCheck = {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
    };

    // Debug information (safe to expose)
    const debugInfo = {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasSheetsId: !!process.env.GOOGLE_SHEETS_ID,
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '***' : 'MISSING',
      sheetsId: process.env.GOOGLE_SHEETS_ID ? '***' : 'MISSING',
    };

    const missingVars = Object.entries(envCheck)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing: missingVars,
        debugInfo
      }, { status: 500 });
    }

    // Handle private key formatting issues
    let privateKey = process.env.GOOGLE_PRIVATE_KEY!;
    
    // Common formatting fixes
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      return NextResponse.json({
        error: 'Invalid private key format',
        details: 'Private key must be in PEM format with BEGIN/END markers',
        debugInfo
      }, { status: 500 });
    }

    // Fix common newline issues
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Ensure proper formatting
    if (!privateKey.includes('\n')) {
      privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
      privateKey = privateKey.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
    }

    // Test Google Sheets API connection
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Try to access the spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID!
    });

    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful',
      spreadsheetTitle: response.data.properties?.title,
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      debugInfo
    });

  } catch (error) {
    console.error('Google Sheets test error:', error);
    
    // Enhanced error response
    const errorResponse = {
      error: 'Google Sheets connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      debugInfo: {
        hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
        hasSheetsId: !!process.env.GOOGLE_SHEETS_ID,
        privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
        serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '***' : 'MISSING',
        sheetsId: process.env.GOOGLE_SHEETS_ID ? '***' : 'MISSING',
      }
    };

    // Add specific error details
    if (error instanceof Error) {
      if (error.message.includes('invalid_grant')) {
        errorResponse.details = 'Service account authentication failed. Check your private key format.';
      } else if (error.message.includes('not found')) {
        errorResponse.details = 'Spreadsheet not found. Check your GOOGLE_SHEETS_ID.';
      } else if (error.message.includes('permission')) {
        errorResponse.details = 'Permission denied. Make sure the service account has access to the spreadsheet.';
      }
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 