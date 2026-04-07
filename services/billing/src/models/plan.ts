import { NotFoundError, Logger } from '@acme/shared-utils';

const logger = new Logger({ service: 'plan-store' });

export type BillingInterval = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: BillingInterval;
  features: string[];
  trialDays: number;
  active: boolean;
}

const SEED_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    description: 'For small teams getting started',
    amount: 2900,
    currency: 'usd',
    interval: 'monthly',
    features: ['5 team members', '10 projects', 'Basic analytics', 'Email support'],
    trialDays: 14,
    active: true,
  },
  {
    id: 'plan_professional',
    name: 'Professional',
    description: 'For growing teams that need more power',
    amount: 9900,
    currency: 'usd',
    interval: 'monthly',
    features: ['25 team members', 'Unlimited projects', 'Advanced analytics', 'Priority support', 'API access', 'Custom integrations'],
    trialDays: 14,
    active: true,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    amount: 29900,
    currency: 'usd',
    interval: 'monthly',
    features: ['Unlimited team members', 'Unlimited projects', 'Enterprise analytics', 'Dedicated support', 'API access', 'Custom integrations', 'SSO / SAML', 'Audit logs', 'SLA guarantee'],
    trialDays: 30,
    active: true,
  },
];

export class PlanStore {
  private plans: Map<string, Plan> = new Map();

  constructor() {
    this.seed();
  }

  private seed(): void {
    for (const plan of SEED_PLANS) {
      this.plans.set(plan.id, { ...plan });
    }
    logger.info('Plan store seeded', { count: SEED_PLANS.length });
  }

  getById(id: string): Plan {
    const plan = this.plans.get(id);
    if (!plan) {
      throw new NotFoundError(`Plan ${id} not found`);
    }
    return plan;
  }

  listActive(): Plan[] {
    return Array.from(this.plans.values()).filter((p) => p.active);
  }

  listAll(): Plan[] {
    return Array.from(this.plans.values());
  }
}
