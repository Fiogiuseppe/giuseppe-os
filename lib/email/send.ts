export type SendEmailInput = {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
};

export type SendEmailResult = {
  id: string;
};

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailConfigurationError';
  }
}

export class EmailDeliveryError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'EmailDeliveryError';
    this.status = status;
  }
}

export function resolveResendApiKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new EmailConfigurationError('RESEND_API_KEY is not configured.');
  }
  return key;
}

export function resolveWeeklyLetterRecipients(): string[] {
  const raw = process.env.WEEKLY_LETTER_TO?.trim();
  if (!raw) {
    throw new EmailConfigurationError('WEEKLY_LETTER_TO is not configured.');
  }

  return raw
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);
}

export function resolveWeeklyLetterFrom(): string {
  const from = process.env.WEEKLY_LETTER_FROM?.trim();
  if (!from) {
    throw new EmailConfigurationError('WEEKLY_LETTER_FROM is not configured.');
  }
  return from;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = resolveResendApiKey();
  const to = Array.isArray(input.to) ? input.to : [input.to];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: input.from,
      to,
      subject: input.subject,
      html: input.html
    })
  });

  const payload = (await response.json().catch(() => ({}))) as { id?: string; message?: string };

  if (!response.ok) {
    throw new EmailDeliveryError(payload.message ?? 'Email delivery failed.', response.status);
  }

  if (!payload.id) {
    throw new EmailDeliveryError('Email provider returned no message id.', response.status);
  }

  return { id: payload.id };
}

export async function sendWeeklyLetterEmail(subject: string, html: string): Promise<SendEmailResult> {
  return sendEmail({
    from: resolveWeeklyLetterFrom(),
    to: resolveWeeklyLetterRecipients(),
    subject,
    html
  });
}
