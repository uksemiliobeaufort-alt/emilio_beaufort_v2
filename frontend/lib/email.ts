import nodemailer from 'nodemailer';

export interface JobApplicationEmailData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  jobId: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  coverLetter?: string;
  hearAbout: string;
  resumeUrl?: string;
}

export interface AdminNotificationData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  jobId: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  coverLetter?: string;
  hearAbout: string;
  resumeUrl?: string;
}

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
  });
};

// Email template for applicant confirmation
export const generateApplicantEmail = (data: JobApplicationEmailData) => {
  return {
    subject: `Application Received - ${data.jobTitle} at Emilio Beaufort`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #B7A16C 0%, #8B7355 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">Emilio Beaufort</h1>
        </div>
        
        <h2 style="color: #333; margin-bottom: 20px;">Application Received</h2>
        
        <p style="color: #666; line-height: 1.6;">Dear ${data.applicantName},</p>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your interest in the <strong>${data.jobTitle}</strong> position at Emilio Beaufort. 
          We have successfully received your application and our team will review it carefully.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Application Details:</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li><strong>Position:</strong> ${data.jobTitle}</li>
            <li><strong>Application ID:</strong> ${data.jobId}</li>
            <li><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          We will review your application and get back to you within 5-7 business days. 
          If you have any questions, please don't hesitate to reach out to us.
        </p>
        
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">What's Next?</h4>
          <ul style="color: #666; line-height: 1.6;">
            <li>Our team will review your application and portfolio</li>
            <li>If selected, we'll schedule an initial interview</li>
            <li>You'll receive updates via email throughout the process</li>
          </ul>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Best regards,<br>
          <strong>The Emilio Beaufort Team</strong>
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  };
};

// Email template for admin notification
export const generateAdminEmail = (data: AdminNotificationData) => {
  return {
    subject: `New Job Application - ${data.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #B7A16C 0%, #8B7355 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">New Job Application</h1>
        </div>
        
        <h2 style="color: #333; margin-bottom: 20px;">Application Details</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Applicant Information:</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li><strong>Name:</strong> ${data.applicantName}</li>
            <li><strong>Email:</strong> ${data.applicantEmail}</li>
            <li><strong>Position:</strong> ${data.jobTitle}</li>
            <li><strong>Job ID:</strong> ${data.jobId}</li>
            <li><strong>Applied on:</strong> ${new Date().toLocaleDateString()}</li>
            <li><strong>Heard about us via:</strong> ${data.hearAbout}</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Professional Links:</h4>
          <ul style="color: #666; line-height: 1.6;">
            <li><strong>GitHub:</strong> <a href="${data.githubUrl}" style="color: #B7A16C;">${data.githubUrl}</a></li>
            <li><strong>LinkedIn:</strong> <a href="${data.linkedinUrl}" style="color: #B7A16C;">${data.linkedinUrl}</a></li>
            ${data.portfolioUrl ? `<li><strong>Portfolio:</strong> <a href="${data.portfolioUrl}" style="color: #B7A16C;">${data.portfolioUrl}</a></li>` : ''}
            ${data.resumeUrl ? `<li><strong>Resume:</strong> <a href="${data.resumeUrl}" style="color: #B7A16C;">Download Resume</a></li>` : ''}
          </ul>
        </div>
        
        ${data.coverLetter ? `
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Cover Letter:</h4>
          <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${data.coverLetter}</p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            Please review this application in the admin panel.
          </p>
        </div>
      </div>
    `,
  };
};

// Send email to applicant
export const sendApplicantEmail = async (data: JobApplicationEmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const emailContent = generateApplicantEmail(data);
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.applicantEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log('✅ Applicant confirmation email sent to:', data.applicantEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending applicant email:', error);
    return false;
  }
};

// Send email to admin
export const sendAdminEmail = async (data: AdminNotificationData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const emailContent = generateAdminEmail(data);
    
    // Get admin emails from environment or use default
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [process.env.EMAIL_USER];
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmails.join(', '),
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log('✅ Admin notification email sent to:', adminEmails);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin email:', error);
    return false;
  }
};

// Send both emails for a job application
export const sendJobApplicationEmails = async (data: JobApplicationEmailData): Promise<{
  applicantEmailSent: boolean;
  adminEmailSent: boolean;
}> => {
  const [applicantEmailSent, adminEmailSent] = await Promise.allSettled([
    sendApplicantEmail(data),
    sendAdminEmail(data),
  ]);
  
  return {
    applicantEmailSent: applicantEmailSent.status === 'fulfilled' && applicantEmailSent.value,
    adminEmailSent: adminEmailSent.status === 'fulfilled' && adminEmailSent.value,
  };
}; 