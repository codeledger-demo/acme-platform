import { describe, it, expect, beforeEach } from 'vitest';
import { SubscriptionStore } from '../src/models/subscription.js';
import type { CreateSubscriptionInput } from '../src/models/subscription.js';

describe('SubscriptionStore', () => {
  let store: SubscriptionStore;

  beforeEach(() => {
    store = new SubscriptionStore();
  });

  it('should create a subscription with active status', () => {
    const input: CreateSubscriptionInput = { customerId: 'cus_001', planId: 'plan_starter' };
    const sub = store.create(input);
    expect(sub.id).toMatch(/^sub_/);
    expect(sub.status).toBe('active');
    expect(sub.customerId).toBe('cus_001');
    expect(sub.cancelAtPeriodEnd).toBe(false);
  });

  it('should create a trialing subscription when trialDays is provided', () => {
    const input: CreateSubscriptionInput = { customerId: 'cus_002', planId: 'plan_pro', trialDays: 14 };
    const sub = store.create(input);
    expect(sub.status).toBe('trialing');
  });

  it('should retrieve a subscription by id', () => {
    const created = store.create({ customerId: 'cus_003', planId: 'plan_starter' });
    const fetched = store.getById(created.id);
    expect(fetched.id).toBe(created.id);
  });

  it('should throw NotFoundError for unknown id', () => {
    expect(() => store.getById('sub_nonexistent')).toThrow('not found');
  });

  it('should list subscriptions by customer', () => {
    store.create({ customerId: 'cus_010', planId: 'plan_starter' });
    store.create({ customerId: 'cus_010', planId: 'plan_pro' });
    store.create({ customerId: 'cus_011', planId: 'plan_starter' });
    const list = store.listByCustomer('cus_010');
    expect(list).toHaveLength(2);
  });

  it('should transition status from active to past_due', () => {
    const sub = store.create({ customerId: 'cus_020', planId: 'plan_starter' });
    const updated = store.updateStatus(sub.id, 'past_due');
    expect(updated.status).toBe('past_due');
  });

  it('should reject invalid status transitions', () => {
    const sub = store.create({ customerId: 'cus_021', planId: 'plan_starter' });
    store.updateStatus(sub.id, 'canceled');
    expect(() => store.updateStatus(sub.id, 'active')).toThrow('Invalid status transition');
  });

  it('should cancel a subscription at period end', () => {
    const sub = store.create({ customerId: 'cus_030', planId: 'plan_starter' });
    const canceled = store.cancel(sub.id);
    expect(canceled.cancelAtPeriodEnd).toBe(true);
  });
});
