import { NextRequest, NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'path';
import fs from 'fs';

export async function GET(req: NextRequest) {
  try {
    // Construct credentials from environment variables
    const credentials = {
      type: process.env.GA4_TYPE,
      project_id: process.env.GA4_PROJECT_ID,
      private_key_id: process.env.GA4_PRIVATE_KEY_ID,
      private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GA4_CLIENT_EMAIL,
      client_id: process.env.GA4_CLIENT_ID,
      auth_uri: process.env.GA4_AUTH_URI,
      token_uri: process.env.GA4_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.GA4_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.GA4_CLIENT_X509_CERT_URL,
      universe_domain: process.env.GA4_UNIVERSE_DOMAIN,
    };
    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

    // Set your GA4 property ID (replace with your actual property ID or use env var)
    const propertyId = process.env.GA4_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json({ error: 'GA4 property ID not set in environment variables' }, { status: 500 });
    }

    // Parse query params for custom date range
    const { searchParams } = new URL(req.url);
    let startDate = searchParams.get('startDate');
    let endDate = searchParams.get('endDate');
    if (!startDate || !endDate) {
      // Default to last 7 days
      const d = new Date();
      endDate = d.toISOString().slice(0, 10);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    }

    // Query daily page views for the date range
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }],
    });

    const data = response.rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value,
      pageViews: row.metricValues?.[0]?.value,
    })) || [];

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
} 