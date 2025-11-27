import React from 'react';
import { Pod, PodStatus } from '../types';
import { ServerIcon } from './icons';
import { PodSource } from '../hooks/useRealTimeK8s';

interface StatusBarProps {
  pods: Pod[];
  podSource: PodSource;
  onOpenPodStatusView: () => void;
}

const getSourceLabel = (source: PodSource): string => {
  switch (source) {
    case 'docker': return 'Docker';
    case 'kubernetes': return 'Kubernetes';
    case 'openshift': return 'OpenShift';
    default: return 'Pod Status';
  }
};

const StatusBar: React.FC<StatusBarProps> = ({ pods, podSource, onOpenPodStatusView }) => {
    // Determine status classes: prioritize Failed (red) then Running (green). Others show neutral gray.
    const getFillClass = (status: PodStatus): string => {
        if (!status) return 'bg-gray-300';
        const s = status.toLowerCase();
        if (s.includes('failed') || s.includes('error') || s.includes('exited')) return 'bg-status-red';
        if (s.includes('running') || s.includes('up')) return 'bg-status-green';
        return 'bg-gray-300';
    };

    const getBorderClass = (status: PodStatus): string => {
        if (!status) return 'border-gray-300';
        const s = status.toLowerCase();
        if (s.includes('failed') || s.includes('error') || s.includes('exited')) return 'border-status-red';
        if (s.includes('running') || s.includes('up')) return 'border-status-green';
        return 'border-gray-300';
    };

    // Inline color fallback using CSS variables so colors show even if Tailwind classes
    // aren't generated in some environments. Returns a CSS color string like 'var(--color-status-red)'.
    const getColorVar = (status: PodStatus): string => {
        if (!status) return 'var(--color-border)';
        const s = status.toLowerCase();
        if (s.includes('failed') || s.includes('error') || s.includes('exited')) return 'var(--color-status-red)';
        if (s.includes('running') || s.includes('up')) return 'var(--color-status-green)';
        return 'var(--color-border)';
    };

    // Show up to 8 pods in the status bar. Sort so failures appear first, then running, then others.
    const podsToShow = [...pods]
        .sort((a, b) => {
            const priority = (p: any) => {
                if (!p.status) return 2;
                const s = p.status.toLowerCase();
                if (s.includes('failed') || s.includes('error') || s.includes('exited')) return 0;
                if (s.includes('running') || s.includes('up')) return 1;
                return 2;
            };
            return priority(a) - priority(b);
        })
        .slice(0, 8);

    return (
        <footer
            onClick={onOpenPodStatusView}
            className="h-10 bg-background-panel border-t border-border-color flex items-center px-4 text-xs shrink-0 cursor-pointer hover:bg-background-main transition-colors"
        >
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 font-semibold text-text-primary">
                    <ServerIcon className="w-4 h-4" />
                    <span>{getSourceLabel(podSource)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    {podsToShow.map(pod => (
                        <div key={pod.id} className="group relative cursor-pointer">
                            <div
                                className={`w-2.5 h-2.5 rounded-full ${getFillClass(pod.status)}`}
                                style={{ backgroundColor: getColorVar(pod.status) }}
                            />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background-main border border-border-color text-text-primary text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                <div className="font-medium">{pod.name || pod.containerId || 'unknown'}</div>
                                {pod.status && <div className="text-text-secondary text-[10px]">{pod.status}</div>}
                            </div>
                        </div>
                    ))}
                    {pods.length === 0 && (
                        <span className="text-text-secondary text-[10px]">No containers</span>
                    )}
                </div>
            </div>
            {/* Right-side summary removed per request (keep status dots in left area only) */}
        </footer>
    );
};

export default StatusBar;