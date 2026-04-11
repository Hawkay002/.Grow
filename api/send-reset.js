import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

// Initialize Firebase Admin (You will need to get your Service Account JSON from Firebase settings)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // 1. Generate the secure reset link using Firebase Admin
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // 2. Set up Nodemailer with your Email and App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or whatever email provider you use
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_APP_PASSWORD, // Your 16-character App Password
      },
    });

    // 3. The Beautiful HTML Email Template
    const emailHtml = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px; border-radius: 24px; text-align: center;">
        
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 20px;">
          <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/>
          <path d="M7 16v6"/><path d="M13 19v3"/>
          <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L14 3l-1.4 2.5"/>
        </svg>

        <h1 style="color: #064e3b; font-size: 28px; margin-bottom: 10px; font-weight: normal;">Grow-Voxly</h1>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left;">
          <p style="font-family: 'Arial', sans-serif; color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi <strong>${email}</strong>,
          </p>
          <p style="font-family: 'Arial', sans-serif; color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to uproot your old password. Click the button below to plant a new one and regain access to your forest.
          </p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" style="display: inline-block; background-color: #059669; color: #ffffff; font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 12px;">
              Reset Password
            </a>
          </div>

          <p style="font-family: 'Arial', sans-serif; color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 30px; text-align: center;">
            If you didn't request a password reset, you can safely ignore this email. Your forest is safe.
          </p>
        </div>
      </div>
    `;

    // 4. Send the Email
    await transporter.sendMail({
      from: `"Grow-Voxly" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Grow-Voxly Password',
      html: emailHtml,
    });

    res.status(200).json({ success: true, message: 'Reset email sent successfully' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
}
