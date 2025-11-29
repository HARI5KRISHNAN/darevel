import React from 'react';
import { Invoice } from '../types';
import { Download, FileText } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Download</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(invoice.amount / 100).toLocaleString('en-US', { style: 'currency', currency: invoice.currency.toUpperCase() })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.created).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a href={invoice.pdfUrl} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1">
                  <Download className="w-4 h-4" /> PDF
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {invoices.length === 0 && <div className="p-8 text-center text-gray-500 text-sm">No invoices found.</div>}
    </div>
  );
};
