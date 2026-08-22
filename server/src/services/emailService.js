const { Resend } = require('resend');

const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

let resendClient = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

// Never throws — a failed/unconfigured send is logged and swallowed so the
// forgot-password endpoint can still return its generic success response
// without leaking whether the send (or the account) actually worked.
async function sendOtpEmail(toEmail, otp, firstName) {
  const client = getClient();
  if (!client) {
    console.warn(`[emailService] RESEND_API_KEY not configured — OTP for ${toEmail} is: ${otp}`);
    return;
  }

  try {
    await client.emails.send({
      from: EMAIL_FROM,
      to: toEmail,
      subject: 'Your GlobeTrotter verification code',
      html: `
        <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #15161F;">Hi ${firstName || 'there'},</h2>
          <p style="color: #6B6B7B; font-size: 14px;">Use the code below to reset your GlobeTrotter password:</p>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 0.1em; color: #5B5BF6; background: #EEEEFE; padding: 16px 24px; border-radius: 12px; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #9797A8; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`[emailService] Failed to send OTP email to ${toEmail}:`, err.message || err);
    console.warn(`[emailService] OTP for ${toEmail} (email send failed, logging for dev visibility): ${otp}`);
  }
}

module.exports = { sendOtpEmail };
