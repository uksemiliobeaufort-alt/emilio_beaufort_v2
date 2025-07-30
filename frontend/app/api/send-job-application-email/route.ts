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
      return NextResponse.json({ 
        success: true, 
        message: 'Application saved but email notifications are not configured',
        applicantEmailSent: false,
        adminEmailSent: false
      });
    }

    // Send emails
    const emailResults = await sendJobApplicationEmails(data);
    
    console.log('📧 Email sending results:', emailResults);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Job application emails sent successfully',
      ...emailResults
    });

  } catch (error) {
    console.error('❌ Error in send-job-application-email API:', error);
    return NextResponse.json({ 
      error: 'Failed to send job application emails' 
    }, { status: 500 });
  }
} 