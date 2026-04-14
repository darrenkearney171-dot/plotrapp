import nodemailer from "nodemailer";

const OWNER_EMAIL = "Buildwiththekearneys@outlook.com";
const APP_URL = "https://renolab.co.uk";

// âââ Shared transporter ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

function getTransporter() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) return null;

  return nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { ciphers: "SSLv3" },
  });
}

async function sendEmail(to: string, from: string, subject: string, body: string): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Email] SMTP credentials not configured — skipping email.");
    return false;
  }
  try {
    await transporter.sendMail({ from, to, subject, text: body });
    console.log(`[Email] Sent to ${to}: ${subject}`);
    return true;
  } catch (error) {
    console.warn(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}

// âââ Owner notifications âââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function sendOwnerEmail(subject: string, body: string): Promise<void> {
  const smtpUser = process.env.SMTP_USER;
  await sendEmail(OWNER_EMAIL, `"Renolab Alerts" <${smtpUser}>`, `[Renolab] ${subject}`, body);
}

// âââ User emails âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const fromDarren = () => `"Darren at Renolab" <${process.env.SMTP_USER}>`;

/** Waitlist welcome — sent when someone joins the waitlist */
export async function sendUserConfirmationEmail(toEmail: string): Promise<void> {
  const subject = "You're in — welcome to Renolab";
  const body = `Hey — thanks for joining the Renolab waitlist.

You're one of the first people on here and that matters to us.

We're putting the finishing touches on the platform and you'll be among the first to know when we go live. As a founding member you'll get early access and special pricing before we open to everyone.

In the meantime go try the free estimate tool at ${APP_URL} — it's live right now and completely free to use.

Darren — Founder, Renolab`;

  await sendEmail(toEmail, fromDarren(), subject, body);
}

/** Quote request confirmation — sent to the person who submitted a formal quote request */
export async function sendQuoteConfirmationEmail(toEmail: string, name: string, category: string, estimateRange?: string): Promise<void> {
  const subject = "Your Renolab quote request has been received";
  const body = `Hi ${name},

Thanks for requesting a formal quote through Renolab.

Here's what we've received:
- Category: ${category.replace(/_/g, " ")}${estimateRange ? `\n- Estimate range: ${estimateRange}` : ""}

What happens next:
1. We review your project details within 1 business day.
2. If we need any more info, we'll be in touch by email or phone.
3. You'll receive a detailed quote based on your specification.

If you have any questions in the meantime, just reply to this email.

Darren — Founder, Renolab
${APP_URL}`;

  await sendEmail(toEmail, fromDarren(), subject, body);
}

/** Estimate follow-up — sent after someone completes a guest estimate */
export async function sendEstimateFollowUpEmail(toEmail: string, firstName: string | null, estimateType: string, leadId: number): Promise<void> {
  const name = firstName || "there";
  const resultUrl = estimateType === "new_build"
    ? `${APP_URL}/new-build-result/${leadId}`
    : `${APP_URL}/estimate/result/${leadId}`;

  const subject = "Your Renolab estimate is ready";
  const body = `Hi ${name},

Your ${estimateType.replace(/_/g, " ")} estimate is ready to view:

${resultUrl}

This link will take you straight back to your estimate result any time.

Want the full materials list, PDF export, and supplier discounts? Upgrade to Pro from just £9.99/month.

Need a formal quote for fitted furniture or a kitchen? Use our kitchen estimator at ${APP_URL}/kitchen-estimator — it's free to try.

Darren — Founder, Renolab`;

  await sendEmail(toEmail, fromDarren(), subject, body);
}

/** Trade application confirmation — sent when a tradesperson applies */
export async function sendTradeApplicationConfirmationEmail(toEmail: string, name: string, trade: string): Promise<void> {
  const subject = "Your Renolab trade application has been received";
  const body = `Hi ${name},

Thanks for applying to join the Renolab trade network as a ${trade.replace(/_/g, " ")}.

We're building our founding network of tradespeople across the island of Ireland. We review every application personally and will be in touch once we're ready to onboard the next group.

As a founding trade member you'll get priority listing and special rates.

Darren — Founder, Renolab
${APP_URL}`;

  await sendEmail(toEmail, fromDarren(), subject, body);
}
