import React from 'react';
import { PaymentMethod } from '../types';
import { CreditCard, Plus } from 'lucide-react';

interface PaymentMethodsProps {
  methods: PaymentMethod[];
}

export const PaymentMethods: React.FC<PaymentMethodsProps> = ({ methods }) => {
  const openStripePortal = () => {
    alert('In a real app, this redirects to the Stripe Customer Portal.');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div key={method.id} className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-md">
                  <CreditCard className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-500">Expires {method.expMonth}/{method.expYear}</p>
                </div>
              </div>
              {method.isDefault && <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">Default</span>}
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={openStripePortal} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Edit
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={openStripePortal}
          className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors h-40"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="font-medium">Add payment method</span>
        </button>
      </div>

      <p className="text-sm text-gray-500">Payments are securely processed by Stripe. We do not store your full card information.</p>
    </div>
  );
};
