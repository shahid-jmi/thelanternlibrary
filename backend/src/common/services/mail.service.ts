import nodemailer from 'nodemailer';
import env from '../../config/env.js';
import logger from '../utils/logger.js';

// SMTP is optional in dev/test — if it isn't configured we log the email
// instead of throwing, so local development and CI never need real
// credentials. Production deploys should set SMTP_* to actually deliver mail.
const transporter = env.smtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
    })
  : null;

export const sendPasswordResetEmail = async (to: string, resetUrl: string): Promise<void> => {
  if (!transporter) {
    logger.warn(
      { to, resetUrl },
      'SMTP is not configured; logging the password reset link instead of emailing it'
    );
    return;
  }

  await transporter.sendMail({
    from: env.smtp!.from,
    to,
    subject: 'Reset your password — The Lantern Library',
    text: `We received a request to reset your admin password. This link expires in 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<p>We received a request to reset your admin password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
  });
};
