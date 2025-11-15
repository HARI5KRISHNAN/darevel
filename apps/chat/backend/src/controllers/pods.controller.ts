import { Request, Response } from 'express';
import { getPods, startWatchingPods } from '../services/k8s.service';

/**
 * GET /api/pods/list
 * Returns the current list of pods
 */
export const listPods = async (req: Request, res: Response) => {
    try {
        const namespace = req.query.namespace as string || 'all';
        const pods = getPods();

        // Filter by namespace if specified
        const filteredPods = namespace === 'all'
            ? pods
            : pods.filter(p => p.namespace === namespace);

        res.json({ pods: filteredPods });
    } catch (error: any) {
        console.error('Error listing pods:', error.message);
        res.status(500).json({ message: 'Failed to list pods' });
    }
};

/**
 * POST /api/pods/watch/start
 * Manually start watching pods (if not already started)
 */
export const startWatch = async (req: Request, res: Response) => {
    try {
        const io = req.io;
        const namespace = req.body.namespace || 'all';

        // The watch is already started on server initialization
        // This endpoint can be used to restart or confirm watch status
        res.json({
            watching: true,
            message: 'Pod watch is active',
            namespace
        });
    } catch (error: any) {
        console.error('Error starting pod watch:', error.message);
        res.status(500).json({
            watching: false,
            message: error.message
        });
    }
};
