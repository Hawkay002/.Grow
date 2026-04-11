import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

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
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // UPDATED: Using a hosted PNG icon for better compatibility than encoded SVG
    const treeIconUrl = "https://img.icons8.com/fluency/96/tree.png";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap');

          @font-face {
            font-family: 'Aestera';
            src: url('https://grow-voxly.vercel.app/fonts/Aestera.woff2') format('woff2'),
                 url('https://grow-voxly.vercel.app/fonts/Aestera.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }

          /* Force text selection/highlight color to match button green */
          ::selection { background: #059669; color: #ffffff; }
          ::-moz-selection { background: #059669; color: #ffffff; }

          .email-body {
            font-family: 'Raleway', Arial, sans-serif !important;
            color: #475569;
            font-size: 16px;
            line-height: 1.6;
          }

          .heading {
            font-family: 'Aestera', Georgia, serif !important;
            color: #064e3b !important;
            font-size: 32px;
            font-weight: normal;
            margin-bottom: 10px;
          }

          /* Custom link color fix */
          .green-link {
            color: #059669 !important;
            text-decoration: underline;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px; border-radius: 24px; text-align: center;">
          
          <img src="${treeIconUrl}" alt="Grow-Voxly Tree" width="64" height="64" style="margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;" />

          <h1 class="heading">Grow-Voxly</h1>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left;">
            <p class="email-body">
              Hi <strong>${email}</strong>,
            </p>
            <p class="email-body" style="margin-bottom: 30px;">
              We received a request to uproot your old password. Click the button below to plant a new one and regain access to your forest.
            </p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" style="display: inline-block; background-color: #059669; color: #ffffff; font-family: 'Raleway', sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.3);">
                Reset Password
              </a>
            </div>

            <p class="email-body" style="font-size: 13px; color: #94a3b8; margin-top: 30px; text-align: center;">
              If you didn't request a password reset, you can safely ignore this email. Your forest is safe.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

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
