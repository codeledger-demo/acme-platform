import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateUsername, validateUserCreate } from '../src/schemas/user.js';
import { validateCurrency, validateAmount, validateSubscriptionCreate, validateInvoice } from '../src/schemas/billing.js';
import { validateUrl, validateWebhookSecret, validateEventTypes, validateWebhookEndpoint } from '../src/schemas/webhook.js';

describe('User validation', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('alice@example.com')).toEqual({ valid: true, errors: [] });
  });

  it('rejects an invalid email', () => {
    const result = validateEmail('not-an-email');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates password strength', () => {
    expect(validatePassword('Str0ngPw')).toEqual({ valid: true, errors: [] });
    expect(validatePassword('weak').valid).toBe(false);
    expect(validatePassword('alllowercase1').valid).toBe(false);
  });

  it('validates username format', () => {
    expect(validateUsername('alice42').valid).toBe(true);
    expect(validateUsername('ab').valid).toBe(false);
    expect(validateUsername('has spaces').valid).toBe(false);
  });

  it('validates full user create payload', () => {
    const valid = validateUserCreate({ email: 'a@b.com', password: 'Abcdefg1', username: 'alice' });
    expect(valid.valid).toBe(true);

    const invalid = validateUserCreate({ email: '', password: '', username: '' });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Billing validation', () => {
  it('accepts supported currencies', () => {
    expect(validateCurrency('USD')).toEqual({ valid: true, errors: [] });
    expect(validateCurrency('XYZ').valid).toBe(false);
  });

  it('validates monetary amounts', () => {
    expect(validateAmount(10.99)).toEqual({ valid: true, errors: [] });
    expect(validateAmount(-5).valid).toBe(false);
    expect(validateAmount(0).valid).toBe(false);
  });

  it('validates subscription creation', () => {
    const result = validateSubscriptionCreate({
      planId: 'pro-monthly', currency: 'USD', amount: 29.99, interval: 'monthly',
    });
    expect(result.valid).toBe(true);
  });

  it('validates invoice with line items', () => {
    const result = validateInvoice({
      customerId: 'cust_1', currency: 'EUR',
      lineItems: [{ description: 'Seat license', amount: 10 }],
      dueDate: '2025-12-31',
    });
    expect(result.valid).toBe(true);

    const bad = validateInvoice({ customerId: '', currency: 'FAKE', lineItems: [], dueDate: 'nope' });
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Webhook validation', () => {
  it('requires HTTPS URLs', () => {
    expect(validateUrl('https://hooks.example.com/wh').valid).toBe(true);
    expect(validateUrl('http://hooks.example.com/wh').valid).toBe(false);
  });

  it('validates secret length', () => {
    expect(validateWebhookSecret('a'.repeat(32)).valid).toBe(true);
    expect(validateWebhookSecret('short').valid).toBe(false);
  });

  it('validates event types against allow-list', () => {
    expect(validateEventTypes(['invoice.created', 'user.created']).valid).toBe(true);
    expect(validateEventTypes(['not.a.real.event']).valid).toBe(false);
  });

  it('validates full webhook endpoint payload', () => {
    const result = validateWebhookEndpoint({
      url: 'https://hooks.example.com/wh',
      secret: 'a'.repeat(32),
      eventTypes: ['invoice.paid'],
    });
    expect(result.valid).toBe(true);
  });
});
