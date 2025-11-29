import React from 'react';
import { LayoutDashboard, CreditCard, PieChart, FileText, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
}

const MENU_ITEMS = [
  { label: 'Overview', path: '/admin/billing', icon: LayoutDashboard },
  { label: 'Plans', path: '/admin/billing/plans', icon: CreditCard },
  { label: 'Usage', path: '/admin/billing/usage', icon: PieChart },
  { label: 'Invoices', path: '/admin/billing/invoices', icon: FileText },
  { label: 'Payment Methods', path: '/admin/billing/payment-methods', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children, activePath, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Darevel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Billing & Admin</div>
          {MENU_ITEMS.map((item) => {
            const isActive = activePath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">JD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">john@darevel.com</p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 w-full transition-colors rounded-lg hover:bg-gray-50">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <span className="font-bold text-gray-900">Darevel Billing</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};
