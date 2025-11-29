export enum PlanTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  trialDays?: number;
  features: string[];
  limits: {
    storageGB: number;
    users: number;
    projects: number;
  };
}

export interface Subscription {
  id: string;
  orgId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface UsageMetrics {
  storageUsedGB: number;
  storageLimitGB: number;
  usersCount: number;
  usersLimit: number;
  apiCalls: number;
  apiCallsLimit: number;
  history: { date: string; storage: number; apiCalls: number }[];
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  created: number;
  pdfUrl: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}
