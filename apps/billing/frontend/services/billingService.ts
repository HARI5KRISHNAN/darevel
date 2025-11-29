import { Invoice, PaymentMethod, Plan, Subscription, UsageMetrics, SubscriptionStatus } from '../types';
import { PLANS, MOCK_ORG_ID } from '../constants';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let currentSubscription: Subscription = {
  id: 'sub_123',
  orgId: MOCK_ORG_ID,
  planId: 'plan_pro',
  status: SubscriptionStatus.ACTIVE,
  currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
  cancelAtPeriodEnd: false,
};

export const BillingService = {
  getPlans: async (): Promise<Plan[]> => {
    await delay(500);
    return PLANS;
  },

  getSubscription: async (orgId: string): Promise<Subscription> => {
    await delay(600);
    return currentSubscription;
  },

  getUsage: async (orgId: string): Promise<UsageMetrics> => {
    await delay(800);
    const plan = PLANS.find((p) => p.id === currentSubscription.planId) || PLANS[0];
    const history = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        storage: Math.floor(Math.random() * (plan.limits.storageGB * 0.8)) + 10,
        apiCalls: Math.floor(Math.random() * 5000) + 1000,
      };
    });

    return {
      storageUsedGB: 45.5,
      storageLimitGB: plan.limits.storageGB,
      usersCount: 3,
      usersLimit: plan.limits.users,
      apiCalls: 125430,
      apiCallsLimit: 200000,
      history,
    };
  },

  getInvoices: async (orgId: string): Promise<Invoice[]> => {
    await delay(700);
    return [
      { id: 'inv_1', amount: 2900, currency: 'usd', status: 'paid', created: Date.now() - 1000 * 60 * 60 * 24 * 30, pdfUrl: '#' },
      { id: 'inv_2', amount: 2900, currency: 'usd', status: 'paid', created: Date.now() - 1000 * 60 * 60 * 24 * 60, pdfUrl: '#' },
      { id: 'inv_3', amount: 2900, currency: 'usd', status: 'paid', created: Date.now() - 1000 * 60 * 60 * 24 * 90, pdfUrl: '#' },
    ];
  },

  getPaymentMethods: async (orgId: string): Promise<PaymentMethod[]> => {
    await delay(600);
    return [{ id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2025, isDefault: true }];
  },

  createSubscription: async (planId: string): Promise<{ checkoutUrl: string }> => {
    await delay(1000);
    currentSubscription = {
      ...currentSubscription,
      planId,
      status: SubscriptionStatus.ACTIVE,
    };
    return { checkoutUrl: 'https://checkout.stripe.com/mock-checkout-session' };
  },

  cancelSubscription: async (subId: string): Promise<void> => {
    await delay(800);
    currentSubscription.cancelAtPeriodEnd = true;
  },
};
