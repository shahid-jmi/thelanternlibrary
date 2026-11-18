import env from '../../config/env.js';
import logger from '../../common/utils/logger.js';
import { sendMail } from '../../common/services/mail.service.js';

const send = async (to: string, subject: string, intro: string, url: string, outro: string) => {
  // Without SMTP (local development) the link is logged so the flow can
  // still be tested by hand.
  if (!env.smtp) {
    logger.warn({ to, url }, `SMTP is not configured; link for "${subject}"`);
    return;
  }
  await sendMail({
    to,
    subject,
    text: `${intro}\n\n${url}\n\n${outro}`,
    html: `<p>${intro}</p><p><a href="${url}">${url}</a></p><p>${outro}</p>`,
  });
};

export const sendVerificationEmail = (to: string, rawToken: string): Promise<void> =>
  send(
    to,
    'Confirm your email — The Lantern Library',
    'Welcome to The Lantern Library! Please confirm your email address. This link expires in 48 hours.',
    `${env.frontendUrl}/account/verify-email?token=${rawToken}`,
    'If you did not create an account, you can ignore this email.'
  );

export const sendCustomerPasswordResetEmail = (to: string, rawToken: string): Promise<void> =>
  send(
    to,
    'Reset your password — The Lantern Library',
    'We received a request to reset your password. This link expires in 30 minutes.',
    `${env.frontendUrl}/account/reset-password?token=${rawToken}`,
    'If you did not request this, you can ignore this email.'
  );
