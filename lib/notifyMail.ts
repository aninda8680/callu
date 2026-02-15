import { Resend } from "resend";

export type NotifyMailParams = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Retry logic with exponential backoff
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendNotifyMail = async (
  { to, subject, text, html }: NotifyMailParams,
  maxRetries = 3
) => {
  const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;
  
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    throw new Error("Email service is not configured: Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
  }

  if (!isValidEmail(to)) {
    throw new Error(`Invalid email address: ${to}`);
  }

  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      const response = await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to,
        subject,
        text,
        html,
      });

      // Check if Resend returned an error
      if (response.error) {
        const errorMsg = JSON.stringify(response.error);
        console.error(`[OTP_SEND] Resend rejected email to ${to}:`, errorMsg);
        throw new Error(`Resend error: ${errorMsg}`);
      }

      // Successful send
      if (response.data?.id) {
        console.log(`[OTP_SEND] Email sent successfully to ${to}, ID: ${response.data.id}`);
        return response;
      }

      throw new Error("Resend response missing email ID");
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      console.error(
        `[OTP_SEND] Attempt ${attempt + 1}/${maxRetries} failed for ${to}: ${errorMsg}`
      );

      // Check if error is retryable (not a 422/400 client error)
      if (error?.status === 422 || error?.status === 400 || errorMsg.includes("Invalid")) {
        // Don't retry on permanent client errors
        throw error;
      }

      // Retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        console.log(`[OTP_SEND] Retrying in ${delayMs}ms...`);
        await sleep(delayMs);
      }
    }
  }

  throw new Error(
    `Failed to send email after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`
  );
};
