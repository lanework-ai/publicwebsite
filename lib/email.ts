import { Resend } from 'resend';
import { prisma } from './prisma';
import { RR_LOGO_WHITE_BASE64 } from './email-logo';

// Inline CID logo attachment. Referenced in HTML as `cid:rrlogo`, so the header
// logo is embedded in the message itself (no external URL, no broken images,
// no filesystem dependency in serverless). Add to the `attachments` of any send
// whose HTML uses the emailShell header.
const LOGO_CID = 'rrlogo'
function inlineLogoAttachment() {
  return { filename: 'rapid-relay.png', content: RR_LOGO_WHITE_BASE64, contentId: LOGO_CID }
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const LOGO_URL = `${process.env.NEXT_PUBLIC_SITE_URL!}/rapid-relay-logo.png`;

// =============================================================================
// Bulletproof email building blocks
// -----------------------------------------------------------------------------
// Email clients (especially desktop Outlook, which renders with Word) ignore CSS
// gradients, CSS `width` on <img>, flexbox, and most modern CSS. These helpers
// build table-based, bgcolor-attribute, VML-bulletproof markup that renders
// consistently across Gmail, Apple Mail, Outlook, and dark-mode clients.
// Brand palette: navy #0f2740 / primary #235784 / cyan #40a8c4.
// =============================================================================

/**
 * <style> block that stops dark-mode clients (new Outlook / Outlook.com, which
 * tag recolored nodes with data-ogsc/data-ogsb) from turning the white button
 * text dark on the blue fill. Include once in every email's <head>.
 */
const DARK_MODE_STYLE = `<style>
  :root { color-scheme: light only; supported-color-schemes: light only; }
  .btn-cell, [data-ogsb] .btn-cell { background-color:#235784 !important; }
  .btn-link, [data-ogsc] .btn-link { color:#ffffff !important; }
</style>`

/**
 * Core bulletproof CTA. Padding lives on the <td> (which Word/Outlook respects),
 * so the button always grows to fit its label, no matter how long, and never
 * clips text. White text is forced with inline !important + a <font> tag + the
 * data-ogsc override in DARK_MODE_STYLE so it stays legible even when a client
 * (e.g. new Outlook) recolors text in dark mode.
 * Tradeoff: border-radius is ignored by classic Word-Outlook (square corners
 * there only); every modern client renders rounded.
 */
function emailButtonCore(label: string, href: string): string {
  return `
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td class="btn-cell" align="center" bgcolor="#235784" style="background-color:#235784;border-radius:8px;padding:15px 34px;">
          <a class="btn-link" href="${href}" style="display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.1;color:#ffffff !important;text-decoration:none;white-space:nowrap;"><font color="#ffffff" style="color:#ffffff !important;">${label}</font></a>
        </td>
      </tr>
    </table>`
}

/** Bulletproof button as a table ROW (for use inside emailShell body tables).
 *  Equal top/bottom padding so the gap above and below the button matches. */
function emailButtonRow(label: string, href: string): string {
  return `<tr><td align="center" style="padding:24px 40px 24px 40px;">${emailButtonCore(label, href)}</td></tr>`
}

/** Bulletproof button as a standalone centered BLOCK (for plain email bodies). */
function emailButtonBlock(label: string, href: string): string {
  return `<div style="text-align:center;margin:18px 0;">${emailButtonCore(label, href)}</div>`
}

/** Human inbox that replies should land in (shown to recipients). */
const REPLY_TO = process.env.SALES_REPLY_TO || 'support@rapidrelay.ai'

/** Named sender for the final personal 1:1 nurture email. */
const PERSONAL_SENDER = {
  name: 'Ahmed',
  title: 'Co-founder and Head Nerd (aka, Research and Development)',
  email: process.env.PERSONAL_SENDER_EMAIL || 'aali@rapidrelay.ai',
}

/**
 * RFC 8058 one-click List-Unsubscribe headers (required by Gmail/Yahoo 2024
 * bulk-sender rules). The endpoint must support both GET (visible link) and
 * POST (Gmail's one-click button); see app/api/newsletter/unsubscribe.
 */
function unsubscribeHeaders(recipientEmail: string): Record<string, string> {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
  return {
    'List-Unsubscribe': `<${url}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

/**
 * Wraps body rows in a full email document: light-locked head, preheader,
 * centered 600px white card, navy header band with logo + heading, and footer.
 * `body` must be a sequence of <tr>...</tr> rows.
 */
function emailShell(opts: {
  title: string
  preheader: string
  heading: string
  body: string
  recipientEmail?: string
  unsubscribeUrl?: string
  // 'marketing' (default) shows the unsubscribe footer; 'internal' is for
  // team-facing emails (lead alerts) and omits unsubscribe/marketing copy.
  footerVariant?: 'marketing' | 'internal'
}): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${opts.title}</title>
  <!--[if mso]><style>body,table,td,a{font-family:'Segoe UI',Arial,sans-serif !important;}</style><![endif]-->
  <style>
    :root { color-scheme: light only; supported-color-schemes: light only; }
    body { margin:0; padding:0; width:100% !important; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a { text-decoration:none; }
    /* Keep the CTA button readable when dark-mode clients recolor it. */
    .btn-cell, [data-ogsb] .btn-cell { background-color:#235784 !important; }
    .btn-link, [data-ogsc] .btn-link { color:#ffffff !important; }
    @media only screen and (max-width:600px) {
      .container { width:100% !important; }
      .px { padding-left:24px !important; padding-right:24px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef2f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#eef2f5;">${opts.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#eef2f5" style="background-color:#eef2f5;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;">

        <!-- Header band -->
        <tr><td bgcolor="#0f2740" align="center" style="background-color:#0f2740;border-radius:14px 14px 0 0;padding:32px 40px 30px 40px;">
          <img src="cid:${LOGO_CID}" alt="Rapid Relay" width="240" height="64" style="width:240px;height:64px;display:block;margin:0 auto;" />
        </td></tr>
        <tr><td bgcolor="#235784" align="center" style="background-color:#235784;padding:18px 40px;">
          <h1 style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;">${opts.heading}</h1>
        </td></tr>
        <tr><td bgcolor="#40a8c4" style="background-color:#40a8c4;font-size:0;line-height:0;height:4px;">&nbsp;</td></tr>

        <!-- Body card -->
        <tr><td bgcolor="#ffffff" style="background-color:#ffffff;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="px">
            ${opts.body}
            <tr><td style="padding:0 40px 36px 40px;">&nbsp;</td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td bgcolor="#f4f6f8" align="center" style="background-color:#f4f6f8;border-radius:0 0 14px 14px;padding:24px 40px 28px 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          ${opts.footerVariant === 'internal'
            ? `<p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#94a3b8;">Internal lead notification from rapidrelay.ai</p>`
            : `<p style="margin:0 0 4px 0;font-size:12px;line-height:1.6;color:#94a3b8;">You're receiving this because you requested a download from rapidrelay.ai.</p>`}
          <p style="margin:0 0 4px 0;font-size:12px;line-height:1.6;color:#b6c0cc;">&copy; ${new Date().getFullYear()} Rapid Relay Technologies. All rights reserved.</p>
          ${opts.footerVariant !== 'internal' ? `<p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;"><a href="${opts.unsubscribeUrl}" style="color:#94a3b8;text-decoration:underline;">Stop these emails</a></p>` : ''}
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim()
}

// Escapes user-supplied values before interpolating into email HTML (these emails
// carry raw form input straight to the admin inbox).
function escHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const EMAIL_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"

// Contact form notification email — built on the bulletproof emailShell (embedded
// CID logo with real width/height, table layout, light-locked against dark-mode).
function getContactNotificationHtml(data: {
  name: string;
  email: string;
  company: string;
  fleetSize: string;
  message?: string | null;
}) {
  const receivedAt = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })
  const showTrucks = data.fleetSize && data.fleetSize !== 'N/A'

  const detailRow = (label: string, valueHtml: string) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #eef2f5;font-family:${EMAIL_FONT};font-size:13px;color:#64748b;font-weight:600;vertical-align:top;width:120px;">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid #eef2f5;font-family:${EMAIL_FONT};font-size:14px;line-height:1.5;color:#0f172a;">${valueHtml}</td>
    </tr>`

  const body = `
    <tr><td class="px" style="padding:30px 40px 4px 40px;">
      <p style="margin:0 0 22px 0;font-family:${EMAIL_FONT};font-size:15px;line-height:1.6;color:#334155;">A new contact request just came in through rapidrelay.ai.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${detailRow('Name', escHtml(data.name))}
        ${detailRow('Email', `<a href="mailto:${escHtml(data.email)}" style="color:#235784;text-decoration:underline;">${escHtml(data.email)}</a>`)}
        ${detailRow('Company', escHtml(data.company))}
        ${detailRow('Fleet size', `${escHtml(data.fleetSize)}${showTrucks ? ' trucks' : ''}`)}
      </table>
    </td></tr>
    ${data.message ? `
    <tr><td class="px" style="padding:24px 40px 0 40px;">
      <p style="margin:0 0 10px 0;font-family:${EMAIL_FONT};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#94a3b8;">Message</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td style="background-color:#f4f6f8;border-left:4px solid #40a8c4;border-radius:0 8px 8px 0;padding:16px 18px;font-family:${EMAIL_FONT};font-size:14px;line-height:1.65;color:#0f172a;white-space:pre-wrap;">${escHtml(data.message)}</td>
      </tr></table>
    </td></tr>` : ''}
    <tr><td class="px" style="padding:26px 40px 0 40px;">
      <p style="margin:0;font-family:${EMAIL_FONT};font-size:13px;line-height:1.6;color:#94a3b8;">Received ${receivedAt}. Reply within 24 hours to keep lead quality high.</p>
    </td></tr>`

  return emailShell({
    title: 'New contact request',
    preheader: `${escHtml(data.name)} from ${escHtml(data.company)} just reached out`,
    heading: 'New contact request',
    body,
    footerVariant: 'internal',
  })
}

// Newsletter subscription notification email template
function getNewsletterNotificationHtml(email: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Newsletter Subscription</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <div style="display: inline-block; background: white; padding: 15px 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <img src="${LOGO_URL}" alt="Rapid Relay" style="width: 200px; height: auto; display: block;" />
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px;">New Newsletter Subscriber</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Rapid Relay Blog</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #1a1a2e; margin-top: 0; font-size: 22px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Subscription Details</h2>

      <div style="margin: 20px 0;">
        <p style="margin: 8px 0;"><strong style="color: #667eea; display: inline-block; width: 120px;">Email:</strong> <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></p>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          A new subscriber has joined your newsletter mailing list.
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
      <p>This email was sent from Rapid Relay website</p>
      <p style="margin-top: 5px;">Subscribed at ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Newsletter welcome email template for subscriber
function getNewsletterWelcomeHtml(email: string) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Rapid Relay Newsletter</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
    <div style="display: inline-block; background: white; padding: 20px 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <img src="${LOGO_URL}" alt="Rapid Relay" style="width: 240px; height: auto; display: block;" />
    </div>
    <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Rapid Relay!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">Thanks for subscribing to our newsletter</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi there,</p>

      <p style="font-size: 16px; color: #1a1a2e;">
        Thank you for subscribing to the Rapid Relay newsletter! We're excited to have you join our community of logistics and transportation professionals.
      </p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
        <h3 style="color: #1a1a2e; margin-top: 0; font-size: 18px;">What to Expect:</h3>
        <ul style="margin: 10px 0; padding-left: 20px; color: #4b5563;">
          <li style="margin: 3px 0;">Industry insights and best practices</li>
          <li style="margin: 3px 0;">Updates on relay network optimization</li>
          <li style="margin: 3px 0;">Case studies from successful implementations</li>
          <li style="margin: 3px 0;">Product updates and new features</li>
        </ul>
      </div>

      <p style="font-size: 16px; color: #1a1a2e;">
        We typically send updates 1-2 times per month, and we promise to keep the content valuable and relevant to your business.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/blog"
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Read Our Latest Articles
        </a>
      </div>

      <p style="font-size: 16px; color: #1a1a2e;">
        Best regards,<br>
        <strong>The Rapid Relay Team</strong>
      </p>
    </div>

    <div style="text-align: center; margin-top: 25px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 13px; margin: 5px 0;">
        You're receiving this email because you subscribed to the Rapid Relay newsletter.
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
        <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
        © ${new Date().getFullYear()} Rapid Relay. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Send contact form notification to admin
export async function sendContactNotification(contactData: {
  name: string;
  email: string;
  company: string;
  fleetSize: string;
  message?: string | null;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Admin Notification <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New Contact Request from ${contactData.company}`,
      html: getContactNotificationHtml(contactData),
      attachments: [inlineLogoAttachment()],
    });

    if (error) {
      console.error('Failed to send contact notification:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending contact notification:', error);
    return { success: false, error };
  }
}

// Send newsletter subscription notifications
export async function sendNewsletterNotifications(email: string) {
  try {
    // Send notification to admin
    const adminNotification = await resend.emails.send({
      from: `Admin Notification <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: 'New Newsletter Subscription',
      html: getNewsletterNotificationHtml(email),
    });

    // Send welcome email to subscriber
    const welcomeEmail = await resend.emails.send({
      from: `Rapid Relay Team <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to Rapid Relay Newsletter',
      html: getNewsletterWelcomeHtml(email),
    });

    if (adminNotification.error || welcomeEmail.error) {
      console.error('Failed to send newsletter notifications:', {
        adminError: adminNotification.error,
        welcomeError: welcomeEmail.error,
      });
      throw new Error('Failed to send one or more newsletter emails');
    }

    return {
      success: true,
      data: {
        adminNotification: adminNotification.data,
        welcomeEmail: welcomeEmail.data,
      },
    };
  } catch (error) {
    console.error('Error sending newsletter notifications:', error);
    return { success: false, error };
  }
}

// Blog post newsletter email template
function getBlogNewsletterHtml(data: {
  title: string
  excerpt: string
  slug: string
  readTime?: string
  categories?: string[]
  mainImageUrl?: string
  subscriberEmail: string
}) {
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/blog/${data.slug}`
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/api/newsletter/unsubscribe?email=${encodeURIComponent(data.subscriberEmail)}`

  // Generate image HTML
  let imageHtml = ''
  if (data.mainImageUrl) {
    imageHtml = `
      <div style="margin: 30px 0;">
        <img src="${data.mainImageUrl}"
             alt="${data.title}"
             style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;" />
      </div>
    `
  }

  const categoriesHtml = data.categories && data.categories.length > 0
    ? `
      <div style="margin: 20px 0;">
        ${data.categories.map(cat => `
          <span style="display: inline-block; background: rgba(102, 126, 234, 0.1); color: #667eea; padding: 4px 12px; border-radius: 4px; font-size: 12px; margin-right: 8px;">
            ${cat}
          </span>
        `).join('')}
      </div>
    `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <div style="display: inline-block; background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      <img src="${LOGO_URL}" alt="Rapid Relay" style="width: 220px; height: auto; display: block;" />
    </div>
    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: normal;">New Blog Post Published</h1>
  </div>

  <div style="background: white; padding: 40px 30px;">
    ${categoriesHtml}

    <h2 style="color: #1a1a2e; margin: 20px 0; font-size: 28px; line-height: 1.3;">
      ${data.title}
    </h2>

    ${data.readTime ? `
      <p style="color: #6b7280; font-size: 14px; margin: 10px 0;">
        ⏱ ${data.readTime}
      </p>
    ` : ''}

    ${imageHtml}

    <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 25px 0;">
      ${data.excerpt}
    </p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${postUrl}"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
        Read Full Article
      </a>
    </div>

    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 40px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
        Stay tuned for more insights on freight optimization, relay operations, and trucking industry trends.
      </p>
    </div>
  </div>

  <div style="background: #f9fafb; padding: 30px 20px; text-align: center;">
    <p style="color: #6b7280; font-size: 13px; margin: 5px 0;">
      You're receiving this email because you subscribed to the Rapid Relay newsletter.
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
      <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 10px 0;">
      © ${new Date().getFullYear()} Rapid Relay. All rights reserved.
    </p>
  </div>
</body>
</html>
  `.trim()
}

// =============================================================================
// Gated content (white papers + benchmarks): download email
// =============================================================================

function getGatedContentDownloadHtml(data: {
  name: string
  contentTitle: string
  contentTypeLabel: string // "white paper" | "benchmark"
  downloadUrl: string
  resourceUrl: string // public detail page where they signed up
  recipientEmail: string
}) {
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/api/newsletter/unsubscribe?email=${encodeURIComponent(data.recipientEmail)}`
  return emailShell({
    title: `Your ${data.contentTypeLabel}: ${data.contentTitle}`,
    preheader: `Your copy of "${data.contentTitle}" is ready to download.`,
    heading: `Your ${data.contentTypeLabel} is ready`,
    body: `
      <tr><td style="padding:36px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#1a2b3c;">
        <p style="margin:0 0 14px 0;">Hi ${firstName(data.name)},</p>
        <p style="margin:0;">Thanks for requesting to read our ${data.contentTypeLabel === 'benchmark' ? 'benchmark' : 'research'}, &#8216;<strong>${data.contentTitle}</strong>.&#8217; Your download is one click away.</p>
      </td></tr>

      ${emailButtonRow('Download the PDF', data.downloadUrl)}

      <tr><td style="padding:0 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#64748b;text-align:center;">
        Button not working? Paste this link into your browser:<br>
        <a href="${data.downloadUrl}" style="color:#235784;word-break:break-all;">${data.downloadUrl}</a>
      </td></tr>

      <tr><td style="padding:22px 40px 0 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f0f7fa" style="background-color:#f0f7fa;border-radius:8px;">
          <tr>
            <td width="4" bgcolor="#40a8c4" style="background-color:#40a8c4;border-radius:8px 0 0 8px;">&nbsp;</td>
            <td style="padding:14px 18px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#235784;">
              <strong>Heads up:</strong> this link expires in 24 hours. If it stops working, you can <a href="${data.resourceUrl}" style="color:#235784;font-weight:700;text-decoration:underline;">grab a fresh one here</a>.
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:22px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a2b3c;">
        <p style="margin:0 0 2px 0;color:#1a2b3c;">Thanks again,</p>
        <p style="margin:0 0 56px 0;color:#0f2740;font-size:16px;">The Rapid Relay Team</p>
      </td></tr>
    `,
    recipientEmail: data.recipientEmail,
    unsubscribeUrl,
  })
}

function getGatedContentAdminNotificationHtml(data: {
  email: string
  name: string
  company: string
  contentTitle: string
  contentTypeLabel: string
  utm?: Record<string, string | null | undefined>
  dripNextSendAt?: Date | null
}) {
  const FF = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`
  const detailRow = (k: string, v: string) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eef2f5;font-family:${FF};font-size:13px;color:#64748b;width:120px;min-width:120px;vertical-align:top;text-transform:uppercase;letter-spacing:0.04em;">${k}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eef2f5;font-family:${FF};font-size:15px;color:#1a2b3c;font-weight:600;">${v}</td>
    </tr>`
  const UTM_LABELS: Record<string, string> = {
    utmSource: 'UTM Source',
    utmMedium: 'UTM Medium',
    utmCampaign: 'UTM Campaign',
    utmContent: 'UTM Content',
    utmTerm: 'UTM Term',
    referrer: 'Referrer',
    landingPage: 'Landing Page',
  }
  const utmRows = data.utm
    ? Object.entries(data.utm)
        .filter(([, v]) => v)
        .map(([k, v]) => detailRow(UTM_LABELS[k] ?? k, String(v)))
        .join('')
    : ''
  return emailShell({
    title: `New ${data.contentTypeLabel} lead: ${data.company}`,
    preheader: `${data.name} from ${data.company} downloaded ${data.contentTitle}.`,
    heading: `New ${data.contentTypeLabel} lead`,
    body: `
      <tr><td style="padding:34px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a2b3c;">
        <p style="margin:0 0 4px 0;"><strong style="color:#0f2740;">${data.name}</strong> from <strong style="color:#0f2740;">${data.company}</strong> just downloaded:</p>
        <p style="margin:0 0 4px 0;color:#235784;font-weight:600;">${data.contentTitle}</p>
      </td></tr>
      <tr><td style="padding:18px 40px 0 40px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${detailRow('Name', data.name)}
          ${detailRow('Email', `<a href="mailto:${data.email}" style="color:#235784;text-decoration:none;">${data.email}</a>`)}
          ${detailRow('Company', data.company)}
          ${detailRow('Resource', `${data.contentTitle} <span style="color:#64748b;font-weight:400;">(${data.contentTypeLabel})</span>`)}
        </table>
      </td></tr>
      <tr><td style="padding:22px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;">
        <a href="mailto:${data.email}" style="color:#235784;font-weight:700;text-decoration:none;">&rarr; Reply to ${firstName(data.name)}</a>
      </td></tr>
      ${data.dripNextSendAt ? (() => {
        const d2 = data.dripNextSendAt!
        const d5 = new Date(d2.getTime() + 3 * 24 * 60 * 60 * 1000)
        const d12 = new Date(d2.getTime() + 10 * 24 * 60 * 60 * 1000)
        const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        return `<tr><td style="padding:30px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <p style="margin:0 0 4px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:700;">Drip Campaign</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            ${detailRow('Day 2', fmt(d2))}
            ${detailRow('Day 5', fmt(d5))}
            ${detailRow('Day 12', fmt(d12) + ' <span style="color:#94a3b8;font-weight:400;">(final, from Ahmed)</span>')}
          </table>
        </td></tr>`
      })() : ''}
      ${utmRows ? `<tr><td style="padding:30px 40px 0 40px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <p style="margin:0 0 4px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;font-weight:700;">Attribution</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${utmRows}</table>
      </td></tr>` : ''}
    `,
    footerVariant: 'internal',
  })
}

export async function sendGatedContentDownloadEmail(payload: {
  to: string
  name: string
  company: string
  contentType: 'whitepaper' | 'benchmark'
  contentSlug: string
  contentTitle: string
  downloadUrl: string
  dripNextSendAt?: Date | null
  utm?: {
    utmSource?: string | null
    utmMedium?: string | null
    utmCampaign?: string | null
    utmContent?: string | null
    utmTerm?: string | null
    referrer?: string | null
    landingPage?: string | null
  }
}) {
  const contentTypeLabel = payload.contentType === 'whitepaper' ? 'white paper' : 'benchmark'
  const resourceBase = payload.contentType === 'whitepaper' ? 'white-papers' : 'benchmarks'
  const resourceUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rapidrelay.ai'}/${resourceBase}/${payload.contentSlug}`
  try {
    const userEmail = await resend.emails.send({
      from: `Rapid Relay <${FROM_EMAIL}>`,
      to: payload.to,
      replyTo: REPLY_TO,
      subject: `Your download: ${payload.contentTitle}`,
      headers: unsubscribeHeaders(payload.to),
      attachments: [inlineLogoAttachment()],
      html: getGatedContentDownloadHtml({
        name: payload.name,
        contentTitle: payload.contentTitle,
        contentTypeLabel,
        downloadUrl: payload.downloadUrl,
        resourceUrl,
        recipientEmail: payload.to,
      }),
    })

    const adminEmail = await resend.emails.send({
      from: `Lead Notification <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New ${contentTypeLabel} lead: ${payload.company} (${payload.contentTitle})`,
      attachments: [inlineLogoAttachment()],
      html: getGatedContentAdminNotificationHtml({
        email: payload.to,
        name: payload.name,
        company: payload.company,
        contentTitle: payload.contentTitle,
        contentTypeLabel,
        utm: payload.utm,
        dripNextSendAt: payload.dripNextSendAt,
      }),
    })

    if (userEmail.error || adminEmail.error) {
      console.error('Failed to send gated content emails:', { userError: userEmail.error, adminError: adminEmail.error })
      throw new Error('One or more gated content emails failed to send')
    }

    return { success: true, data: { userEmail: userEmail.data, adminEmail: adminEmail.data } }
  } catch (error) {
    console.error('Error sending gated content download email:', error)
    return { success: false, error }
  }
}

// =============================================================================
// Drip nurture sequence (Phase 2): Day 2, Day 5, Day 12 (final, from Ahmed)
// Triggered by /api/cron/drip when a lead's dripNextSendAt is in the past.
// =============================================================================

interface DripContext {
  to: string
  name: string
  company: string
  contentType: 'whitepaper' | 'benchmark'
  contentTitle: string
  contentSlug: string
}

function firstName(full: string): string {
  const first = (full || '').trim().split(/\s+/)[0] || 'there'
  // Capitalize so lowercase form entries (or email-prefix fallbacks) read like a name.
  return first.charAt(0).toUpperCase() + first.slice(1)
}

function dripFooter(recipientEmail: string, step: 1 | 2 | 3): string {
  // Step 3 is a personal note from Ahmed — no footer so it reads as a genuine 1:1 email.
  if (step === 3) return ''
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
  return `
    <div style="margin-top: 22px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 4px 0;">This is email ${step} of 2 in our short follow-up series. You're receiving it because you downloaded a Rapid Relay resource. After the last one, we stop.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 6px 0 2px 0;">&copy; ${new Date().getFullYear()} Rapid Relay Technologies. All rights reserved.</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;"><a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Stop these emails</a></p>
    </div>`
}

function getDripDay2Html(ctx: DripContext): string {
  const demoUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/connect?utm_source=drip&utm_medium=email&utm_campaign=drip_day2`
  const resourceBase = ctx.contentType === 'whitepaper' ? 'white-papers' : 'benchmarks'
  const resourceUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/${resourceBase}/${ctx.contentSlug}`
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">${DARK_MODE_STYLE}</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 22px 24px; background: #ffffff;">
  <p style="font-size: 16px; margin: 0 0 11px 0;">Hi ${firstName(ctx.name)},</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">A quick follow-up on our research, &#8220;<a href="${resourceUrl}" style="color:#235784;text-decoration:underline;">${ctx.contentTitle}</a>.&#8221; One number that reframes the conversation:</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">Carriers with fewer than 26 trucks average 27% annual driver turnover. Carriers with over 1,000 trucks average 72.3%.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">That's backwards. Bigger fleets, more resources, nearly three times the attrition. Our research finds the instinct to blame pay is wrong. Smaller fleets run shorter routes, and their network footprint produces better retention by default. At $12,800 per driver and $18.7 billion lost industry-wide each year, that math compounds fast.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">The fix isn't always a bigger paycheck. It's redesigning your network using data you already have access to.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">More soon,<br>The Rapid Relay team</p>
  ${dripFooter(ctx.to, 1)}
</body></html>`.trim()
}

function getDripDay5Html(ctx: DripContext): string {
  const demoUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/connect?utm_source=drip&utm_medium=email&utm_campaign=drip_day5`
  const resourceBase = ctx.contentType === 'whitepaper' ? 'white-papers' : 'benchmarks'
  const resourceUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/${resourceBase}/${ctx.contentSlug}`
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">${DARK_MODE_STYLE}</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 22px 24px; background: #ffffff;">
  <p style="font-size: 16px; margin: 0 0 11px 0;">${firstName(ctx.name)},</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">The second point in &#8220;<a href="${resourceUrl}" style="color:#235784;text-decoration:underline;">${ctx.contentTitle}</a>&#8221; is the one that tends to take a little longer to land: turnover is predictable before it happens.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">Not in a vague sense. Specifically: the route conditions that precede driver exits are measurable. Length of haul, home time frequency, mile variance week to week. When those variables cross certain thresholds, drivers leave, simple as that. That data already exists in ELD logs, dispatch systems, and payroll records. It just isn't being used as a retention signal.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">The industry measures turnover once a year, at the fleet level, after the fact. By the time that number shows up in a report, the decisions that caused it are six to twelve months old. Most operations teams are sitting on data worth millions. It's spread across ELD logs, dispatch records, and payroll systems. What's missing isn't the data. It's knowing how to connect it.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">More soon,<br>The Rapid Relay team</p>
  ${dripFooter(ctx.to, 2)}
</body></html>`.trim()
}

function getDripFinalHtml(ctx: DripContext): string {
  // Merged final note: the gentle "quick question / happy to help" from the old
  // Day-10 + the courteous wind-down from the old Day-21, as one short, personal,
  // plain-text email from a named person. No CTA button (keep it conversational).
  const replyTo = PERSONAL_SENDER.email
  const resourceBase = ctx.contentType === 'whitepaper' ? 'white-papers' : 'benchmarks'
  const resourceUrl = `${process.env.NEXT_PUBLIC_SITE_URL!}/${resourceBase}/${ctx.contentSlug}`
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">${DARK_MODE_STYLE}</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a2e; max-width: 580px; margin: 0 auto; padding: 22px 24px; background: #ffffff;">
  <p style="font-size: 16px; margin: 0 0 11px 0;">${firstName(ctx.name)},</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">Wanted to reach out personally since you took the time to read &#8220;<a href="${resourceUrl}" style="color:#235784;text-decoration:underline;">${ctx.contentTitle}</a>.&#8221;</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">I'm curious whether your team has ever looked at your own lane structure through this kind of lens. Specifically: whether the routes that see the most turnover are also the ones with the longest runs, the least predictable schedules, the most deadhead. It's a different way of reading data that most operations teams already have sitting somewhere, but rarely get to look at this way.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">If that's something your team has thought about and you'd want to talk through what it might look like on your network, I'd genuinely enjoy that conversation.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">Thanks for giving us a read, and good luck with everything.</p>
  <p style="font-size: 16px; margin: 0 0 11px 0;">Best,<br>${PERSONAL_SENDER.name}<br><span style="color:#64748b;">${PERSONAL_SENDER.title}</span><br><a href="mailto:${replyTo}" style="color: #235784;">${replyTo}</a></p>
  ${dripFooter(ctx.to, 3)}
</body></html>`.trim()
}

/**
 * Send the next drip email for a given step (1, 2, or 3; the upcoming step).
 * Returns success/error. Caller is responsible for advancing the lead's state.
 */
export async function sendDripEmail(step: 1 | 2 | 3, ctx: DripContext) {
  const subjects: Record<typeof step, string> = {
    1: `Why bigger fleets lose more drivers`,
    2: `Your data already knows`,
    3: `One last note, ${firstName(ctx.name)}`,
  } as const
  const htmls: Record<typeof step, string> = {
    1: getDripDay2Html(ctx),
    2: getDripDay5Html(ctx),
    3: getDripFinalHtml(ctx),
  } as const
  // Step 3 (the final note) is a personal 1:1 message, so it comes from (and
  // replies go to) a named person rather than the shared support inbox.
  const from = step === 3
    ? `${PERSONAL_SENDER.name} at Rapid Relay <${PERSONAL_SENDER.email}>`
    : `Rapid Relay <${FROM_EMAIL}>`
  const replyTo = step === 3 ? PERSONAL_SENDER.email : REPLY_TO
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: ctx.to,
      replyTo,
      subject: subjects[step],
      html: htmls[step],
      headers: unsubscribeHeaders(ctx.to),
    })
    if (error) {
      console.error(`Drip step ${step} send failed:`, error)
      return { success: false as const, error }
    }
    return { success: true as const, data }
  } catch (error) {
    console.error(`Drip step ${step} exception:`, error)
    return { success: false as const, error }
  }
}

// Send blog newsletter to all subscribers
export async function sendBlogNewsletter(postData: {
  title: string
  excerpt: string
  slug: string
  readTime?: string
  categories?: string[]
  mainImageUrl?: string
}) {
  const emails = []
  // Rapid Relay broadcast goes to Rapid Relay subscribers only; Lanework-brand
  // subscribers get the Lanework broadcast (lib/labs-email.ts).
  const subscriberEmails = await prisma.newsletter.findMany({
    where: { brand: 'rapidrelay' },
    select: { email: true },
  })

  for (const subscriber of subscriberEmails) {
    emails.push({
      from: `Rapid Relay Blog <${FROM_EMAIL}>`,
      to: subscriber.email,
      subject: postData.title,
      html: getBlogNewsletterHtml({
        ...postData,
        subscriberEmail: subscriber.email,
      }),
    })
  }

  // Send in batches of 25 (Resend limit)
  const BATCH_SIZE = 25
  const results = {
    total: emails.length,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE)

    try {
      const { data, error } = await resend.batch.send(batch)

      if (error) {
        console.error(`Batch send error (batch ${i / BATCH_SIZE + 1}):`, error)
        results.failed += batch.length
        results.errors.push(error.message)
      } else {
        results.sent += batch.length
        console.log(`Batch ${i / BATCH_SIZE + 1} sent successfully:`, data?.length, 'emails')
      }
    } catch (error) {
      console.error(`Exception during batch send (batch ${i / BATCH_SIZE + 1}):`, error)
      results.failed += batch.length
      results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    // Rate limiting: Wait 1 second between batches to respect Resend's 2 req/sec limit
    if (i + BATCH_SIZE < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}
