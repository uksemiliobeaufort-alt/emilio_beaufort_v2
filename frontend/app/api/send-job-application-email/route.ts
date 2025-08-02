import { NextRequest, NextResponse } from 'next/server';
import { sendJobApplicationEmails, JobApplicationEmailData } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const data: JobApplicationEmailData = await request.json();
    
    // Validate required fields
    if (!data.applicantName || !data.applicantEmail || !data.jobTitle || !data.jobId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.applicantEmail)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email configuration not set up. Skipping email sending.');
      console.log('📧 Environment check:', {
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
        EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Missing',
        ADMIN_EMAILS: process.env.ADMIN_EMAILS ? 'Set' : 'Missing'
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Application saved but email notifications are not configured. Please set up EMAIL_USER and EMAIL_PASSWORD in .env.local',
        applicantEmailSent: false,
        adminEmailSent: false,
        configMissing: true
      });
    }

    // Send emails with timeout to prevent hanging
    const emailPromise = sendJobApplicationEmails(data);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout')), 10000) // 10 second timeout
    );

    const emailResults = await Promise.race([emailPromise, timeoutPromise]) as any;
    
    console.log('📧 Email sending results:', emailResults);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job application emails sent successfully',
      ...emailResults
    });

  } catch (error) {
    console.error('❌ Error in send-job-application-email API:', error);
    // Return success even if email fails to not block the application
    return NextResponse.json({ 
      success: true,
      message: 'Application saved but email sending failed',
      applicantEmailSent: false,
      adminEmailSent: false
    });
  }
} 