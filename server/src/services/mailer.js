// dotenv must run BEFORE we read process.env below. ESM hoists imports to the
// top of the file, so this import here (above the `process.env` reads) ensures
// RESEND_API_KEY etc. are loaded even when this module is imported from app.js
// (where dotenv is configured a few lines down).
import 'dotenv/config';

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.MAIL_FROM || 'onboarding@resend.dev';
const FROM_NAME = process.env.MAIL_FROM_NAME || 'Ledgerly';

let client = null;
if (RESEND_API_KEY) {
  client = new Resend(RESEND_API_KEY);
}

export const isMailerConfigured = () => Boolean(client);

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export const sendPasswordResetEmail = async ({ to, name, resetUrl, locale = 'ar' }) => {
  if (!client) {
    throw new Error(
      'Email service is not configured. Set RESEND_API_KEY (and optionally MAIL_FROM) in the server environment.',
    );
  }

  const isAr = String(locale).startsWith('ar');
  const safeName = escapeHtml(name || (isAr ? 'المستخدم' : 'there'));
  const safeUrl = escapeHtml(resetUrl);

  const subject = isAr
    ? 'إعادة تعيين كلمة المرور — Ledgerly'
    : 'Reset your Ledgerly password';

  const html = isAr
    ? `<!doctype html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1f2937;">
    <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#0073ff,#0050b3);padding:28px;color:#fff;">
        <div style="font-size:22px;font-weight:700;">إعادة تعيين كلمة المرور</div>
        <div style="font-size:13px;opacity:.85;margin-top:4px;">Ledgerly · منصة إدارة المكتب المحاسبي</div>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px 0;font-size:15px;">مرحباً <strong>${safeName}</strong>،</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#374151;">
          تلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك. اضغط على الزر بالأسفل لتعيين كلمة مرور جديدة.
        </p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${safeUrl}" style="display:inline-block;background:#0073ff;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
            تعيين كلمة مرور جديدة
          </a>
        </p>
        <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280;line-height:1.7;">
          أو انسخ والصق الرابط التالي في المتصفح:
        </p>
        <p style="word-break:break-all;background:#f3f4f6;padding:10px 12px;border-radius:8px;font-size:12px;color:#374151;margin:0 0 24px 0;">
          ${safeUrl}
        </p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;line-height:1.7;">
          ينتهي صلاحية الرابط خلال ساعة واحدة. إذا لم تطلب إعادة التعيين يمكنك تجاهل هذه الرسالة.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          هذه رسالة آلية، يُرجى عدم الرد عليها.
        </p>
      </div>
    </div>
  </body>
</html>`
    : `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Arial,sans-serif;color:#1f2937;">
    <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#0073ff,#0050b3);padding:28px;color:#fff;">
        <div style="font-size:22px;font-weight:700;">Reset your password</div>
        <div style="font-size:13px;opacity:.85;margin-top:4px;">Ledgerly · accounting practice platform</div>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px 0;font-size:15px;">Hi <strong>${safeName}</strong>,</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.7;color:#374151;">
          We received a request to reset the password for your account. Click the button below to choose a new one.
        </p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${safeUrl}" style="display:inline-block;background:#0073ff;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
            Choose a new password
          </a>
        </p>
        <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280;line-height:1.7;">
          Or copy and paste this link into your browser:
        </p>
        <p style="word-break:break-all;background:#f3f4f6;padding:10px 12px;border-radius:8px;font-size:12px;color:#374151;margin:0 0 24px 0;">
          ${safeUrl}
        </p>
        <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;line-height:1.7;">
          This link expires in one hour. If you didn't request a reset, you can ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="margin:0;font-size:12px;color:#9ca3af;">
          This is an automated message — please do not reply.
        </p>
      </div>
    </div>
  </body>
</html>`;

  const text = isAr
    ? `مرحباً ${name || 'المستخدم'}،\n\nتلقّينا طلباً لإعادة تعيين كلمة المرور لحسابك.\nاضغط على الرابط التالي لتعيين كلمة مرور جديدة:\n${resetUrl}\n\nينتهي صلاحية الرابط خلال ساعة. إذا لم تطلب ذلك، يمكنك تجاهل الرسالة.`
    : `Hi ${name || 'there'},\n\nWe received a request to reset your password.\nUse the link below to choose a new one:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`;

  return client.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  });
};
