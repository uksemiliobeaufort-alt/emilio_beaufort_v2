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

export interface PurchaseEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  paymentId: string;
  total: number;
  items: any[];
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASSWORD, // Your regular email password
    },
    // Allow less secure apps (for regular password without 2FA)
    secure: false,
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Email template for purchase confirmation
export const generatePurchaseConfirmationEmail = (data: PurchaseEmailData) => {
  const itemsList = data.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left;">${item.name || 'Product'}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px; text-align: right;">₹${item.price || 0}</td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmation - Emilio Beaufort (Order #${data.orderId})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; color:#222;">
        <div style="background: linear-gradient(135deg, #B7A16C 0%, #8B7355 100%); padding: 22px; border-radius: 12px; margin-bottom: 22px;">
          <h1 style="color: #ffffff; margin: 0; text-align: center; font-size: 22px; letter-spacing: 0.3px;">Emilio Beaufort</h1>
          <p style="color: #ffffff; margin: 6px 0 0 0; text-align: center; font-size: 12px; opacity: 0.95;">Luxury Beauty & Wellness</p>
        </div>
        
        <h2 style="color: #2b2b2b; margin: 0 0 16px 0; font-size: 20px;">Order Confirmation</h2>
        
        <!-- Professional green callout -->
        <div style="display:flex; align-items:flex-start; gap:12px; background:#eafaf1; border:1px solid #2ecc71; border-radius:12px; padding:16px 18px; margin: 10px 0 20px 0;">
          <div style="flex:0 0 auto; width:28px; height:28px; border-radius:50%; background:#2ecc71; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:16px; line-height:28px;">✓</div>
          <div style="flex:1;">
            <p style="margin:0; font-size:14px; line-height:1.6; color:#1e4620;">
              Dear <strong>${data.customerName}</strong>, thank you for your order. We have successfully received your request. Our sales team will connect with you within <strong>24 hours</strong> to confirm details and arrange delivery.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 18px; border-radius: 10px; margin: 18px 0;">
          <h3 style="color: #2b2b2b; margin: 0 0 10px 0; font-size: 16px;">Order Details</h3>
          <ul style="color: #444; line-height: 1.8; padding-left:18px; margin:0;">
            <li><strong>Order ID:</strong> ${data.orderId}</li>
            <li><strong>Payment ID:</strong> ${data.paymentId || 'PENDING'}</li>
            <li><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</li>
            <li><strong>Total Amount:</strong> ₹${data.total}</li>
          </ul>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; margin: 18px 0; overflow:hidden;">
          <h3 style="color: #2b2b2b; margin: 0; padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-size: 16px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size:13px;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; font-size:13px;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-size:13px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
                <td style="padding: 12px; text-align: right;">₹${data.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${data.businessName ? `
        <div style="background: #e8f4fd; padding: 14px 16px; border-radius: 10px; margin: 18px 0;">
          <h4 style="color: #2b2b2b; margin: 0 0 8px 0; font-size: 15px;">Business Information</h4>
          <ul style="color: #444; line-height: 1.8; padding-left:18px; margin:0;">
            <li><strong>Business Name:</strong> ${data.businessName}</li>
            <li><strong>Phone:</strong> ${data.phone || 'Not provided'}</li>
          </ul>
        </div>
        ` : ''}

        ${data.address ? `
        <div style="background: #fffbea; padding: 14px 16px; border-radius: 10px; margin: 18px 0;">
          <h4 style="color: #2b2b2b; margin: 0 0 8px 0; font-size: 15px;">Shipping Address</h4>
          <p style="color: #444; line-height: 1.7; margin: 0;">
            ${data.address}<br/>
            ${data.city}, ${data.state} ${data.pincode}
          </p>
        </div>
        ` : ''}
        
        <div style="background: #eef5ff; padding: 14px 16px; border-radius: 10px; margin: 18px 0;">
          <h4 style="color: #2b2b2b; margin: 0 0 8px 0; font-size: 15px;">What's Next?</h4>
          <ul style="color: #444; line-height: 1.8; padding-left:18px; margin:0;">
            <li>Our sales team will contact you within 24 hours</li>
            <li>We will confirm delivery options and your preferences</li>
            <li>Your order will be processed and shipped as per your requirements</li>
            <li>Tracking information will be shared once dispatched</li>
          </ul>
        </div>

        <div style="background: #d4edda; padding: 14px 16px; border-radius: 10px; margin: 18px 0; border: 1px solid #c3e6cb;">
          <h4 style="color: #155724; margin: 0 0 8px 0; font-size: 15px;">Need Immediate Assistance?</h4>
          <p style="color: #155724; line-height: 1.7; margin: 0;">
            For urgent queries, please email <strong>support@emilio-beaufort.com</strong> or call <strong>+91-XXXXXXXXXX</strong>.
          </p>
        </div>
        
        <p style="color: #444; line-height: 1.7; margin: 16px 0 0 0;">
          Thank you for choosing Emilio Beaufort. We appreciate your business and look forward to serving you.
        </p>
        
        <p style="color: #444; line-height: 1.7;">
          Best regards,<br/>
          <strong>The Emilio Beaufort Team</strong>
        </p>
        
        <div style="text-align: center; margin-top: 26px; padding-top: 16px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin:0;">
            This is an automated message. Please do not reply to this email.<br/>
            For support, contact us at support@emilio-beaufort.com
          </p>
        </div>
      </div>
    `,
  };
};

// Email template for admin purchase notification
export const generateAdminPurchaseEmail = (data: PurchaseEmailData) => {
  const itemsList = data.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px; text-align: left;">${item.name || 'Product'}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px; text-align: right;">₹${item.price || 0}</td>
    </tr>
  `).join('');

  return {
    subject: `New Purchase Order - ${data.customerName} (₹${data.total})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #B7A16C 0%, #8B7355 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; text-align: center;">New Purchase Order</h1>
        </div>
        
        <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Customer Information:</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li><strong>Name:</strong> ${data.customerName}</li>
            <li><strong>Email:</strong> ${data.customerEmail}</li>
            <li><strong>Phone:</strong> ${data.phone || 'Not provided'}</li>
            <li><strong>Order ID:</strong> ${data.orderId}</li>
            <li><strong>Payment ID:</strong> ${data.paymentId}</li>
            <li><strong>Total Amount:</strong> ₹${data.total}</li>
            <li><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
        </div>

        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0; padding: 15px; border-bottom: 1px solid #ddd;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="2" style="padding: 12px; text-align: right;">Total:</td>
                <td style="padding: 12px; text-align: right;">₹${data.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${data.businessName ? `
        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Business Information:</h4>
          <ul style="color: #666; line-height: 1.6;">
            <li><strong>Business Name:</strong> ${data.businessName}</li>
          </ul>
        </div>
        ` : ''}

        ${data.address ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #333; margin-top: 0;">Shipping Address:</h4>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ${data.address}<br>
            ${data.city}, ${data.state} ${data.pincode}
          </p>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; font-size: 14px;">
            Please contact the customer within 24 hours to discuss delivery options.
          </p>
        </div>
      </div>
    `,
  };
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

// Send purchase confirmation email to customer
export const sendPurchaseConfirmationEmail = async (data: PurchaseEmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const emailContent = generatePurchaseConfirmationEmail(data);
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.customerEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log('✅ Purchase confirmation email sent to:', data.customerEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending purchase confirmation email:', error);
    return false;
  }
};

// Send purchase notification email to admin
export const sendAdminPurchaseEmail = async (data: PurchaseEmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const emailContent = generateAdminPurchaseEmail(data);
    
    // Get admin emails from environment or use default
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [process.env.EMAIL_USER];
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmails.join(', '),
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log('✅ Admin purchase notification email sent to:', adminEmails);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin purchase email:', error);
    return false;
  }
};

// Send both purchase emails
export const sendPurchaseEmails = async (data: PurchaseEmailData): Promise<{
  customerEmailSent: boolean;
  adminEmailSent: boolean;
}> => {
  const [customerEmailSent, adminEmailSent] = await Promise.allSettled([
    sendPurchaseConfirmationEmail(data),
    sendAdminPurchaseEmail(data),
  ]);
  
  return {
    customerEmailSent: customerEmailSent.status === 'fulfilled' && customerEmailSent.value,
    adminEmailSent: adminEmailSent.status === 'fulfilled' && adminEmailSent.value,
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