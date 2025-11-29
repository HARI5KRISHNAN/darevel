import { Plan, PlanTier } from './types';

export const PLANS: Plan[] = [
  {
    id: 'plan_free',
    tier: PlanTier.FREE,
    name: 'Starter',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: ['5GB Storage', '1 User', 'Basic Support', 'Community Access'],
    limits: { storageGB: 5, users: 1, projects: 3 },
  },
  {
    id: 'plan_pro',
    tier: PlanTier.PRO,
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    trialDays: 14,
    features: ['100GB Storage', '5 Users', 'Priority Email Support', 'Advanced Analytics', 'API Access'],
    limits: { storageGB: 100, users: 5, projects: 50 },
  },
  {
    id: 'plan_ent',
    tier: PlanTier.ENTERPRISE,
    name: 'Enterprise',
    price: 99,
    currency: 'USD',
    interval: 'month',
    trialDays: 30,
    features: ['Unlimited Storage', 'Unlimited Users', '24/7 Phone Support', 'SSO & Audit Logs', 'Dedicated Manager'],
    limits: { storageGB: 10000, users: 1000, projects: 1000 },
  },
];

export const MOCK_ORG_ID = 'org_123456';
