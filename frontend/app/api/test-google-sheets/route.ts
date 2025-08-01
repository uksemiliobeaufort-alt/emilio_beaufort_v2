import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const envCheck = {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
    };

    const missingVars = Object.entries(envCheck)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      return NextResponse.json({
        error: 'Missing environment variables',
        missing: missingVars,
        envCheck
      }, { status: 500 });
    }

    // Test Google Sheets API connection
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
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
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    });

  } catch (error) {
    console.error('Google Sheets test error:', error);
    return NextResponse.json({
      error: 'Google Sheets connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
        GOOGLE_SHEETS_ID: !!process.env.GOOGLE_SHEETS_ID,
      }
    }, { status: 500 });
  }
} 