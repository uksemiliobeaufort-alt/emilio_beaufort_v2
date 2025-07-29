// Google Sheets API integration for live application updates

// Declare gapi types for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}

interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
}

interface ApplicationData {
  id: string;
  fullName: string;
  email: string;
  jobTitle: string;
  jobId: string;
  linkedin: string;
  github: string;
  portfolio: string;
  coverLetter: string;
  hearAbout: string;
  resumeUrl: string;
  status: 'Pending' | 'Shortlisted' | 'Rejected';
  createdAt: string;
  updatedAt?: string;
}

class GoogleSheetsManager {
  private config: GoogleSheetsConfig;
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    this.spreadsheetId = config.spreadsheetId;
  }

  // Initialize Google Sheets API
  async initialize() {
    try {
      // Load Google Sheets API
      await this.loadGoogleSheetsAPI();
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
      return false;
    }
  }

  // Load Google Sheets API script
  private async loadGoogleSheetsAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', () => {
          window.gapi.client.init({
            apiKey: this.config.apiKey,
            clientId: this.config.clientId,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: 'https://www.googleapis.com/auth/spreadsheets'
          }).then(() => {
            resolve(true);
          }).catch(reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Create or update spreadsheet with headers
  async setupSpreadsheet() {
    try {
      const headers = [
        'ID',
        'Full Name',
        'Email',
        'Job Title',
        'Job ID',
        'LinkedIn',
        'GitHub',
        'Portfolio',
        'Cover Letter',
        'How did you hear',
        'Resume URL',
        'Status',
        'Created At',
        'Updated At'
      ];

      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'A1:N1',
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to setup spreadsheet:', error);
      return false;
    }
  }

  // Add new application to Google Sheets
  async addApplication(application: ApplicationData) {
    try {
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
        application.status,
        application.createdAt,
        application.updatedAt || ''
      ];

      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'A:N',
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [row]
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to add application to Google Sheets:', error);
      return false;
    }
  }

  // Update application status in Google Sheets
  async updateApplicationStatus(applicationId: string, newStatus: string) {
    try {
      // First, find the row with the application ID
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:A'
      });

      const values = response.result.values;
      if (!values) return false;

      // Find the row index for the application ID
      let rowIndex = -1;
      for (let i = 0; i < values.length; i++) {
        if (values[i][0] === applicationId) {
          rowIndex = i + 1; // Sheets rows are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) return false;

      // Update the status column (L column)
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `L${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[newStatus]]
        }
      });

      // Update the updated_at column (N column)
      const updatedAt = new Date().toISOString();
      await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `N${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[updatedAt]]
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to update application status in Google Sheets:', error);
      return false;
    }
  }

  // Get all applications from Google Sheets
  async getApplications(): Promise<ApplicationData[]> {
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:N'
      });

      const values = response.result.values;
      if (!values || values.length < 2) return [];

      // Skip header row and convert to ApplicationData objects
      const applications: ApplicationData[] = [];
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row.length >= 13) {
          applications.push({
            id: row[0] || '',
            fullName: row[1] || '',
            email: row[2] || '',
            jobTitle: row[3] || '',
            jobId: row[4] || '',
            linkedin: row[5] || '',
            github: row[6] || '',
            portfolio: row[7] || '',
            coverLetter: row[8] || '',
            hearAbout: row[9] || '',
            resumeUrl: row[10] || '',
            status: (row[11] as 'Pending' | 'Shortlisted' | 'Rejected') || 'Pending',
            createdAt: row[12] || '',
            updatedAt: row[13] || ''
          });
        }
      }

      return applications;
    } catch (error) {
      console.error('Failed to get applications from Google Sheets:', error);
      return [];
    }
  }

  // Sync Firestore data to Google Sheets
  async syncFromFirestore(firestoreApplications: any[]) {
    try {
      // Clear existing data (except headers)
      await window.gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: 'A2:N'
      });

      // Add all applications
      const rows = firestoreApplications.map(app => [
        app.id,
        app.fullName,
        app.email,
        app.jobTitle,
        app.jobId,
        app.linkedin,
        app.github,
        app.portfolio,
        app.coverLetter,
        app.hearAbout,
        app.resumeUrl,
        app.status || 'Pending',
        app.createdAt?.toDate?.()?.toISOString() || app.createdAt,
        app.updatedAt?.toDate?.()?.toISOString() || app.updatedAt
      ]);

      if (rows.length > 0) {
        await window.gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: 'A:N',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: rows
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to sync from Firestore:', error);
      return false;
    }
  }
}

// Export function to create Google Sheets manager
export const createGoogleSheetsManager = (config: GoogleSheetsConfig) => {
  return new GoogleSheetsManager(config);
};

// Export types
export type { ApplicationData, GoogleSheetsConfig }; 