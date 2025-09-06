import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if email configuration is set up
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json({ 
        error: 'Email configuration not set up. Please add EMAIL_USER and EMAIL_PASSWORD to your environment variables.' 
      }, { status: 400 });
    }

    const { testEmail } = await request.json();
    
    if (!testEmail) {
      return NextResponse.json({ 
        error: 'Test email address is required' 
      }, { status: 400 });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Email Test - Emilio Beaufort Job Applications',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #B7A16C 0%, #8B7355 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; text-align: center;">Email Test Successful</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Email Configuration Working</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Congratulations! Your email configuration is working correctly. 
            Job application emails will now be sent automatically.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Configuration Details:</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li><strong>From Email:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>Test Sent To:</strong> ${testEmail}</li>
              <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            You can now remove this test API route for security.
          </p>
        </div>
      `,
    });
    
    console.log('✅ Test email sent successfully to:', testEmail);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent successfully',
      sentTo: testEmail
    });

  } catch (error) {
    console.error('❌ Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email. Please check your email configuration.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 