import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BillingOverview } from './components/BillingOverview';
import { PlanSelector } from './components/PlanSelector';
import { UsageGraphs } from './components/UsageGraphs';
import { InvoicesTable } from './components/InvoicesTable';
import { PaymentMethods } from './components/PaymentMethods';
import { Alert } from './components/ui/Alerts';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { BillingService } from './services/billingService';
import { Plan, Subscription, UsageMetrics, Invoice, PaymentMethod, SubscriptionStatus } from './types';
import { MOCK_ORG_ID } from './constants';

type RoutePath = '/admin/billing' | '/admin/billing/plans' | '/admin/billing/invoices' | '/admin/billing/payment-methods' | '/admin/billing/usage';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<RoutePath>('/admin/billing');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageMetrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const refreshData = async () => {
    try {
      const [plansData, subData, usageData, invData, pmData] = await Promise.all([
        BillingService.getPlans(),
        BillingService.getSubscription(MOCK_ORG_ID),
        BillingService.getUsage(MOCK_ORG_ID),
        BillingService.getInvoices(MOCK_ORG_ID),
        BillingService.getPaymentMethods(MOCK_ORG_ID),
      ]);

      setPlans(plansData);
      setSubscription(subData);
      setUsage(usageData);
      setInvoices(invData);
      setPaymentMethods(pmData);
    } catch (error) {
      console.error('Failed to load billing data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const currentPlan = plans.find((p) => p.id === subscription?.planId) || plans[0];
  const isPastDue = subscription?.status === SubscriptionStatus.PAST_DUE;
  const isTrial = subscription?.status === SubscriptionStatus.TRIALING;
  const isStorageLimitReached = usage ? usage.storageUsedGB >= usage.storageLimitGB : false;

  const renderContent = () => {
    if (loading) return <LoadingSpinner />;
    if (!subscription || !usage) return <div>Error loading data.</div>;

    switch (currentPath) {
      case '/admin/billing':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing Overview</h1>
              <p className="text-gray-500 mt-1">Manage your plan, billing details, and view usage.</p>
            </div>
            <BillingOverview plan={currentPlan} subscription={subscription} onManagePlan={() => setCurrentPath('/admin/billing/plans')} />
            <UsageGraphs usage={usage} />
          </div>
        );
      case '/admin/billing/plans':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plans & Pricing</h1>
              <p className="text-gray-500 mt-1">Upgrade or downgrade your workspace plan.</p>
            </div>
            <PlanSelector plans={plans} currentPlanId={subscription.planId} onPlanChange={refreshData} />
          </div>
        );
      case '/admin/billing/invoices':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
              <p className="text-gray-500 mt-1">View and download your past invoices.</p>
            </div>
            <InvoicesTable invoices={invoices} />
          </div>
        );
      case '/admin/billing/payment-methods':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
              <p className="text-gray-500 mt-1">Manage your credit cards and billing details.</p>
            </div>
            <PaymentMethods methods={paymentMethods} />
          </div>
        );
      case '/admin/billing/usage':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detailed Usage</h1>
              <p className="text-gray-500 mt-1">Analyze your resource consumption.</p>
            </div>
            <UsageGraphs usage={usage} />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Layout activePath={currentPath} onNavigate={(path) => setCurrentPath(path as RoutePath)}>
      <div className="space-y-6">
        {isPastDue && (
          <Alert
            type="danger"
            title="Payment Failed"
            description="We couldn't process your last payment. Please update your card to continue using Darevel."
            action={
              <button
                onClick={() => setCurrentPath('/admin/billing/payment-methods')}
                className="text-sm font-semibold text-red-700 hover:text-red-900 underline"
              >
                Update Card
              </button>
            }
          />
        )}

        {isTrial && (
          <Alert
            type="info"
            title="Trial Ending Soon"
            description="Your trial ends in 2 days. Upgrade your workspace to prevent access loss."
            action={
              <button
                onClick={() => setCurrentPath('/admin/billing/plans')}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700"
              >
                Upgrade Now
              </button>
            }
          />
        )}

        {isStorageLimitReached && (
          <Alert
            type="warning"
            title="Storage Limit Reached"
            description="You have reached your storage limit. Some features may be restricted."
            action={
              <button
                onClick={() => setCurrentPath('/admin/billing/plans')}
                className="text-sm font-semibold text-yellow-800 hover:text-yellow-900 underline"
              >
                Upgrade Plan
              </button>
            }
          />
        )}

        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
