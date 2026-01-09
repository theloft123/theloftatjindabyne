import { Resend } from "resend";

const resendKey = process.env.RESEND_KEY;

if (!resendKey) {
  console.warn("RESEND_KEY is not set. Email functionality will be disabled.");
}

export const resend = resendKey ? new Resend(resendKey) : null;
