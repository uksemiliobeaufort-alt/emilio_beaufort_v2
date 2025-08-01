import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Google Sheets API configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function POST(request: NextRequest) {
  try {
    const { application, action, applications } = await request.json();
    
    // Check required environment variables
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable');
      return NextResponse.json({ error: 'Google Service Account Email not configured' }, { status: 500 });
    }
    
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      console.error('Missing GOOGLE_PRIVATE_KEY environment variable');
      return NextResponse.json({ error: 'Google Private Key not configured' }, { status: 500 });
    }
    
    if (!process.env.GOOGLE_SHEETS_ID) {
      console.error('Missing GOOGLE_SHEETS_ID environment variable');
      return NextResponse.json({ error: 'Google Sheets ID not configured' }, { status: 500 });
    }
    
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;

    if (action === 'sync_all') {
      // Sync all applications to Google Sheets
      if (!applications || !Array.isArray(applications)) {
        return NextResponse.json({ error: 'No applications provided' }, { status: 400 });
      }

      try {
        // First, clear existing data (except headers)
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: 'A2:N'
        });

        // Prepare all rows
        const rows = applications.map(app => [
          app.id,
          app.fullName,
          app.email,
          app.jobTitle || '',
          app.jobId || '',
          app.linkedin || '',
          app.github || '',
          app.portfolio || '',
          app.coverLetter || '',
          app.hearAbout || '',
          app.resumeUrl || '',
          app.status || 'Pending',
          app.createdAt ? new Date(app.createdAt.seconds * 1000).toISOString() : new Date().toISOString(),
          '' // updatedAt column
        ]);

        // Add headers if sheet is empty
        const headers = [
          'ID', 'Full Name', 'Email', 'Job Title', 'Job ID', 'LinkedIn', 'GitHub', 
          'Portfolio', 'Cover Letter', 'Hear About', 'Resume URL', 'Status', 'Created At', 'Updated At'
        ];

        // Check if headers exist
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A1:N1'
        });

        if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
          // Add headers
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'A1:N1',
            valueInputOption: 'RAW',
            requestBody: {
              values: [headers]
            }
          });
        }

        // Add all applications
        if (rows.length > 0) {
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'A:N',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
              values: rows
            }
          });
        }

        return NextResponse.json({ success: true, message: `Synced ${rows.length} applications` });
      } catch (sheetsError) {
        console.error('Google Sheets API error:', sheetsError);
        return NextResponse.json({ 
          error: 'Failed to sync with Google Sheets', 
          details: sheetsError instanceof Error ? sheetsError.message : 'Unknown error'
        }, { status: 500 });
      }

    } else if (action === 'add') {
      try {
        // Add new application
        const row = [
          application.id,
          application.fullName,
          application.email,
          application.jobTitle,
          application.jobId,
          application.linkedin,
          application.github,
          application.portfolio,
          application.coverLetter,
          application.hearAbout,
          application.resumeUrl,
          'Pending',
          application.createdAt,
          ''
        ];

        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'A:N',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [row]
          }
        });
      } catch (sheetsError) {
        console.error('Google Sheets API error (add):', sheetsError);
        return NextResponse.json({ 
          error: 'Failed to add application to Google Sheets', 
          details: sheetsError instanceof Error ? sheetsError.message : 'Unknown error'
        }, { status: 500 });
      }

    } else if (action === 'update') {
      try {
        // Update application status
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'A:A'
        });

        const values = response.data.values;
        if (!values) {
          return NextResponse.json({ error: 'No data found' }, { status: 404 });
        }

        // Find the row index for the application ID
        let rowIndex = -1;
        for (let i = 0; i < values.length; i++) {
          if (values[i][0] === application.id) {
            rowIndex = i + 1; // Sheets rows are 1-indexed
            break;
          }
        }

        if (rowIndex === -1) {
          return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }

        // Update status and updated_at
        const updatedAt = new Date().toISOString();
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: [
              {
                range: `L${rowIndex}`,
                values: [[application.status]]
              },
              {
                range: `N${rowIndex}`,
                values: [[updatedAt]]
              }
            ]
          }
        });
      } catch (sheetsError) {
        console.error('Google Sheets API error (update):', sheetsError);
        return NextResponse.json({ 
          error: 'Failed to update application in Google Sheets', 
          details: sheetsError instanceof Error ? sheetsError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync with Google Sheets', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 