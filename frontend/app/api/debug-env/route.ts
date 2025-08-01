import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Safe debug information (no sensitive data exposed)
    const debugInfo = {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasSheetsId: !!process.env.GOOGLE_SHEETS_ID,
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '***' : 'MISSING',
      sheetsId: process.env.GOOGLE_SHEETS_ID ? '***' : 'MISSING',
      privateKeyStartsWith: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) || 'MISSING',
      privateKeyEndsWith: process.env.GOOGLE_PRIVATE_KEY?.substring(-30) || 'MISSING',
      hasNewlines: process.env.GOOGLE_PRIVATE_KEY?.includes('\n') || false,
      hasBackslashN: process.env.GOOGLE_PRIVATE_KEY?.includes('\\n') || false,
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables debug info',
      debugInfo
    });

  } catch (error) {
    console.error('Debug env error:', error);
    return NextResponse.json({
      error: 'Failed to get debug info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 