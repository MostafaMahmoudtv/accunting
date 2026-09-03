/**
 * Smoke-test the mailer service. Sends a single test email and exits.
 *
 * Run with: node src/scripts/testMailer.js you@example.com
 */
import 'dotenv/config';
import { sendPasswordResetEmail, isMailerConfigured } from '../services/mailer.js';

const to = process.argv[2];
if (!to) {
  console.error('Usage: node src/scripts/testMailer.js <recipient-email>');
  process.exit(1);
}

if (!isMailerConfigured()) {
  console.error(
    '❌ RESEND_API_KEY is not set. Add it to server/.env or server/.env.production first.',
  );
  process.exit(1);
}

const resetUrl = 'https://accunting-client.vercel.app/reset-password?token=test&lang=ar';

try {
  const result = await sendPasswordResetEmail({
    to,
    name: 'Test User',
    resetUrl,
    locale: 'ar',
  });
  console.log('✅ Email queued. Resend response:', JSON.stringify(result, null, 2));
} catch (err) {
  console.error('❌ send failed:', err.message);
  if (err.response) console.error('Resend API error:', err.response);
  process.exit(1);
}
