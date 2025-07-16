import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AnalyticsService {
  private analyticsDataClient: BetaAnalyticsDataClient;
  private propertyId: string;
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || ''
  );

  constructor() {
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
    this.analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    // Set your GA4 property ID here (from Google Analytics admin)
    this.propertyId = process.env.GA4_PROPERTY_ID || '';
    if (!this.propertyId) {
      throw new InternalServerErrorException('GA4 property ID not set in environment variables');
    }
  }

  async getDailyPageViewsLast7Days() {
    const [response] = await this.analyticsDataClient.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'screenPageViews' }],
    });
    return response.rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value,
      pageViews: row.metricValues?.[0]?.value,
    })) || [];
  }

  async trackEvent(type: string, data?: any) {
    const { error } = await this.supabase.from('tracking_events').insert([
      { type, data }
    ]);
    if (error) {
      throw new InternalServerErrorException('Failed to insert tracking event: ' + error.message);
    }
    return { success: true };
  }
} 