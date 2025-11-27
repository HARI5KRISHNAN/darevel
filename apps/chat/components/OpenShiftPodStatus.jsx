import React, { useEffect, useState } from 'react';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
  ? import.meta.env.VITE_BACKEND_URL
  : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8083');

const OpenShiftPodStatus = () => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/openshift/pods`);
      const body = await res.json();
      if (body.success) {
        setPods(body.data || []);
      } else {
        setError(body.message || 'Failed to fetch OpenShift pods');
      }
    } catch (err) {
      console.error('Error fetching OpenShift pods:', err);
      setError('Unable to connect to OpenShift service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPods();
    const intv = setInterval(fetchPods, 30000);
    return () => clearInterval(intv);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-300">{error}</div>;
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-bold text-white mb-3">OpenShift Pods</h2>
      <p className="text-gray-400 text-sm mb-4">{pods.length} pod{pods.length !== 1 ? 's' : ''}</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Namespace</th>
              <th className="px-4 py-2">Phase</th>
              <th className="px-4 py-2 text-right">Restarts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {pods.map((p, idx) => (
              <tr key={p.name || idx} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 text-white">{p.name || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-300">{p.namespace || 'default'}</td>
                <td className="px-4 py-3 text-gray-300">{p.phase || 'Unknown'}</td>
                <td className="px-4 py-3 text-right text-gray-300">{p.restarts ?? 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpenShiftPodStatus;
