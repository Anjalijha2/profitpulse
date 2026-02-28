import nodemailer from 'nodemailer';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
    const mailOptions = {
        from: `"ProfitPulse" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Password Reset Request — ProfitPulse',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 8px;">
                <h2 style="color: #0f172a; margin-bottom: 8px;">Password Reset Request</h2>
                <p style="color: #475569;">You requested a password reset for your ProfitPulse account.</p>
                <p style="color: #475569;">Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
                <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #0ea5e9; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600;">
                    Reset Password
                </a>
                <p style="color: #94a3b8; font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #94a3b8; font-size: 13px; word-break: break-all;">${resetUrl}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${toEmail}`);
};
