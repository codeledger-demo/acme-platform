import { brand } from '@acme/design-tokens';

export interface Plan {
  id: string;
  name: string;
  priceCents: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted?: boolean;
}

export interface PlanSelectorProps {
  plans?: Plan[];
  currentPlanId?: string;
  onSelect: (planId: string) => void;
  isLoading?: boolean;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceCents: 2900,
    interval: 'month',
    features: ['5 team members', '10 GB storage', 'Basic analytics', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceCents: 7900,
    interval: 'month',
    highlighted: true,
    features: [
      '25 team members',
      '100 GB storage',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceCents: 29900,
    interval: 'month',
    features: [
      'Unlimited team members',
      'Unlimited storage',
      'Full analytics suite',
      'Dedicated CSM',
      'Custom SLAs',
      'SSO / SAML',
    ],
  },
];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function PlanSelector(props: PlanSelectorProps): JSX.Element {
  const { plans = DEFAULT_PLANS, currentPlanId, onSelect, isLoading = false } = props;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        const borderColor = plan.highlighted ? brand.primary : '#e5e7eb';

        return (
          <div
            key={plan.id}
            className="flex flex-col rounded-xl border-2 bg-white p-6"
            style={{ borderColor }}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold">
              {formatPrice(plan.priceCents)}
              <span className="text-base font-normal text-neutral-500">/{plan.interval}</span>
            </p>

            <ul className="mt-6 flex-1 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-neutral-700">
                  <span className="text-green-500">{'\u2713'}</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className="mt-6 w-full rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
              style={{
                backgroundColor: plan.highlighted ? brand.primary : '#f3f4f6',
                color: plan.highlighted ? '#fff' : '#374151',
              }}
              disabled={isLoading || isCurrent}
              onClick={() => onSelect(plan.id)}
            >
              {isCurrent ? 'Current plan' : 'Select plan'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
