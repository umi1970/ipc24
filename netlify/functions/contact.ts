import type { Handler } from '@netlify/functions';
import { ConvexHttpClient } from 'convex/browser';
import { Resend } from 'resend';
import { api } from '../../convex/_generated/api';

const HONEYPOT_FIELD = 'website';

interface ContactPayload {
  name: string;
  email: string;
  message: string;
  website?: string;
}

function validate(body: unknown): body is ContactPayload {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === 'string' &&
    typeof b.email === 'string' &&
    typeof b.message === 'string' &&
    b.name.length > 1 &&
    b.email.includes('@') &&
    b.message.length > 5
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const convexUrl = process.env.CONVEX_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const contactTo = process.env.CONTACT_TO;
  const contactFrom = process.env.CONTACT_FROM;
  if (!convexUrl || !resendKey || !contactTo || !contactFrom) {
    return { statusCode: 503, body: 'Contact service not configured' };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }
  if (!validate(payload)) {
    return { statusCode: 400, body: 'Invalid payload' };
  }

  if (payload[HONEYPOT_FIELD]) {
    return { statusCode: 204, body: '' };
  }

  const convex = new ConvexHttpClient(convexUrl);
  const resend = new Resend(resendKey);
  const receivedAt = Date.now();

  try {
    await convex.mutation(api.contact.create, {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      receivedAt,
    });
    await resend.emails.send({
      from: contactFrom,
      to: contactTo,
      subject: `Neue Kontaktanfrage von ${payload.name}`,
      text: `Von: ${payload.name} <${payload.email}>\n\n${payload.message}`,
      replyTo: payload.email,
    });
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('contact handler error', err);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
