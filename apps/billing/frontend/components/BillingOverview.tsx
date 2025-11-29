import React from 'react';
import { Plan, Subscription, SubscriptionStatus } from '../types';
import { CreditCard, Calendar } from 'lucide-react';

interface BillingOverviewProps {
  plan: Plan;
  subscription: Subscription;
  onManagePlan: () => void;
}

export const BillingOverview: React.FC<BillingOverviewProps> = ({ plan, subscription, onManagePlan }) => {
  const renewsDate = new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusColors = {
    [SubscriptionStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [SubscriptionStatus.TRIALING]: 'bg-blue-100 text-blue-800',
    [SubscriptionStatus.PAST_DUE]: 'bg-red-100 text-red-800',
    [SubscriptionStatus.CANCELED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{plan.name} Plan</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusColors[subscription.status]}`}>
              {subscription.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-500">
            {subscription.cancelAtPeriodEnd ? `Access until ${renewsDate}, then cancels.` : `Renews on ${renewsDate} for $${plan.price}.`}
          </p>
        </div>

        <div className="flex gap-3">
          {subscription.status === SubscriptionStatus.PAST_DUE && (
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors shadow-sm">
              Update Payment
            </button>
          )}
          <button
            onClick={onManagePlan}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Change Plan
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <CreditCard className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Payment Method</p>
            <p className="text-sm text-gray-500 mt-1">Visa ending in 4242</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Billing Interval</p>
            <p className="text-sm text-gray-500 mt-1">Monthly billing</p>
          </div>
        </div>
      </div>
    </div>
  );
};
