import React, { useState } from 'react';
import { Plan, PlanTier } from '../types';
import { Check, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { BillingService } from '../services/billingService';

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanId: string;
  onPlanChange: () => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({ plans, currentPlanId, onPlanChange }) => {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const handleUpgrade = async (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation();
    if (plan.id === currentPlanId) return;

    setLoadingPlanId(plan.id);
    try {
      const { checkoutUrl } = await BillingService.createSubscription(plan.id);
      setTimeout(() => {
        alert('Redirecting to Stripe checkout... (Mock)');
        onPlanChange();
        setLoadingPlanId(null);
      }, 1000);
    } catch (err) {
      console.error('Failed to upgrade', err);
      setLoadingPlanId(null);
    }
  };

  const toggleExpand = (planId: string) => {
    setExpandedPlanId((prev) => (prev === planId ? null : planId));
  };

  const currentPlan = plans.find((p) => p.id === currentPlanId);

  const ComparisonRow = ({ label, current, target, highlight }: { label: string; current: string | number; target: string | number; highlight: boolean }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 line-through decoration-gray-300 text-xs">{current}</span>
        <ArrowRight className="w-3 h-3 text-gray-400" />
        <span className={`font-semibold ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{target}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlanId;
        const isPopular = plan.tier === PlanTier.PRO;
        const isExpanded = expandedPlanId === plan.id;
        const hasTrial = plan.trialDays && plan.trialDays > 0;

        return (
          <div
            key={plan.id}
            onClick={() => toggleExpand(plan.id)}
            className={`relative rounded-2xl border bg-white p-6 shadow-sm flex flex-col cursor-pointer transition-all duration-200
              ${isCurrent ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}
              ${isPopular && !isCurrent ? 'shadow-lg border-indigo-200' : ''}
              ${isExpanded ? 'ring-1 ring-indigo-100 bg-gray-50/30' : ''}
            `}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
                MOST POPULAR
              </div>
            )}

            <div className="mb-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                {isCurrent ? (
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-md font-medium">Active</span>
                ) : hasTrial ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">{plan.trialDays}-day free trial</span>
                ) : null}
              </div>
              <div className="mt-4 flex items-baseline text-gray-900">
                <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
                <span className="ml-1 text-sm font-semibold text-gray-500">/mo</span>
              </div>
              <p className="mt-3 text-sm text-gray-500 min-h-[40px]">
                {plan.tier === PlanTier.FREE ? 'Perfect for hobbyists.' : plan.tier === PlanTier.PRO ? 'For growing teams.' : 'For large scale orgs.'}
              </p>
            </div>

            <button
              onClick={(e) => handleUpgrade(e, plan)}
              disabled={isCurrent || loadingPlanId !== null}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors mb-6 relative z-20
                ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'}
              `}
            >
              {loadingPlanId === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : hasTrial ? `Start ${plan.trialDays}-day free trial` : 'Upgrade'}
            </button>

            <ul className="space-y-3 mb-4">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-sm text-gray-600">
                  <Check className="h-5 w-5 text-indigo-500 mr-2 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto flex justify-center pt-2 text-gray-400">
              {isExpanded ? (
                <div className="flex items-center gap-1 text-xs uppercase font-semibold tracking-wide">
                  Less <ChevronUp className="w-4 h-4" />
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs uppercase font-semibold tracking-wide group-hover:text-indigo-600 transition-colors">
                  Compare <ChevronDown className="w-4 h-4" />
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isCurrent ? (
                  <div className="text-sm text-gray-500 text-center py-2">Your current plan limits are active.</div>
                ) : (
                  currentPlan && (
                    <>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">vs {currentPlan.name} Plan</h4>
                      <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                        <ComparisonRow label="Storage" current={`${currentPlan.limits.storageGB}GB`} target={`${plan.limits.storageGB}GB`} highlight={plan.limits.storageGB > currentPlan.limits.storageGB} />
                        <ComparisonRow label="Users" current={currentPlan.limits.users} target={plan.limits.users} highlight={plan.limits.users > currentPlan.limits.users} />
                        <ComparisonRow label="Projects" current={currentPlan.limits.projects} target={plan.limits.projects} highlight={plan.limits.projects > currentPlan.limits.projects} />
                      </div>
                    </>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
