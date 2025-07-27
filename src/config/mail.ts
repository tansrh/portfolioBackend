
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
// Configure transporter for Brevo (formerly Sendinblue)
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_USER, // Your Brevo SMTP username
    pass: process.env.BREVO_PASS, // Your Brevo SMTP password
  },
});

/**
 * Send an email using Brevo SMTP
 * @param to Recipient email address
 * @param name Recipient name (for personalization)
 * @param subject Email subject
 * @param html HTML content for the email body
 * @returns Promise with Nodemailer info
 */
export async function sendMail({ to, name, subject, html }: { to: string; name: string; subject: string; html: string }) {
  const mailOptions = {
    from: process.env.BREVO_FROM || 'Your Name <your@email.com>',
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
}



// Interpolator: replaces {{variable}} with values from data object
function interpolateTemplate(template: string, data: Record<string, string>) {
  return template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
}

// Read and parse HTML template from file, interpolating variables
export function getHtml(fileName: string, extraData: Record<string, string> = {}) {
  const templatePath = path.join(__dirname, 'emailTemplates', `${fileName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');
  html = interpolateTemplate(html, { ...extraData });
  return html;
}

/*
How to use and test:

// In your route/controller:
import { sendMail, getTestHtml } from './config/mail';

// Example usage:
await sendMail({
  to: 'recipient@example.com',
  name: 'Recipient Name',
  subject: 'Test Email',
  html: getTestHtml('Recipient Name'),
});

// To test the HTML, you can:
// 1. Use getTestHtml(name) and paste the output into an online HTML email previewer (e.g., https://putsmail.com/ or https://www.mail-tester.com/)
// 2. Send a test email to your own address and view it in your email client.
*/
