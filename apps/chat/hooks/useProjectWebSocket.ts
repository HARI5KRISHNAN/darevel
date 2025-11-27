import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Project } from '../types';
import { devLog, devError } from '../utils/devLogger';

interface ProjectUpdateMessage {
    type: 'created' | 'updated' | 'deleted';
    project?: any;
    projectId?: number;
}

interface UseProjectWebSocketProps {
    onProjectCreated?: (project: Project) => void;
    onProjectUpdated?: (project: Project) => void;
    onProjectDeleted?: (projectId: string) => void;
    enabled?: boolean;
}

// Map backend DTO to frontend Project type
const mapDTOToProject = (dto: any): Project => {
    const parsedTasks = typeof dto.tasks === 'string' ? JSON.parse(dto.tasks || '[]') : Array.isArray(dto.tasks) ? dto.tasks : [];
    const parsedComments = typeof dto.comments === 'string' ? JSON.parse(dto.comments || '[]') : Array.isArray(dto.comments) ? dto.comments : [];
    const parsedFiles = typeof dto.files === 'string' ? JSON.parse(dto.files || '[]') : Array.isArray(dto.files) ? dto.files : [];

    return {
        id: dto.id.toString(),
        title: dto.title,
        description: dto.description,
        category: dto.category,
        categoryTheme: dto.categoryTheme,
        progress: dto.progress,
        status: dto.status,
        members: [],
        memberIds: dto.memberIds || [],
        tasks: parsedTasks,
        comments: parsedComments,
        files: parsedFiles,
        attachments: dto.attachments ?? 0,
    };
};

export const useProjectWebSocket = ({
    onProjectCreated,
    onProjectUpdated,
    onProjectDeleted,
    enabled = true,
}: UseProjectWebSocketProps) => {
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);

    // Use refs for callbacks to avoid reconnection on callback changes
    const onProjectCreatedRef = useRef(onProjectCreated);
    const onProjectUpdatedRef = useRef(onProjectUpdated);
    const onProjectDeletedRef = useRef(onProjectDeleted);

    useEffect(() => {
        onProjectCreatedRef.current = onProjectCreated;
    }, [onProjectCreated]);

    useEffect(() => {
        onProjectUpdatedRef.current = onProjectUpdated;
    }, [onProjectUpdated]);

    useEffect(() => {
        onProjectDeletedRef.current = onProjectDeleted;
    }, [onProjectDeleted]);

    useEffect(() => {
        if (!enabled) return;

        const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8081';
        const socketUrl = `${WS_URL}/ws`;

        devLog('📊 Initializing Project WebSocket connection...');

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            debug: (str) => {
                // Only log important messages
                if (str.includes('CONNECTED') || str.includes('SUBSCRIBE') || str.includes('ERROR')) {
                    devLog('STOMP Project:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            devLog('✓ Connected to Project WebSocket');

            // Subscribe to project updates
            subscriptionRef.current = client.subscribe('/topic/projects', (message) => {
                try {
                    const update: ProjectUpdateMessage = JSON.parse(message.body);
                    devLog('📊 Project update received:', update.type);

                    switch (update.type) {
                        case 'created':
                            if (update.project && onProjectCreatedRef.current) {
                                const project = mapDTOToProject(update.project);
                                onProjectCreatedRef.current(project);
                            }
                            break;
                        case 'updated':
                            if (update.project && onProjectUpdatedRef.current) {
                                const project = mapDTOToProject(update.project);
                                onProjectUpdatedRef.current(project);
                            }
                            break;
                        case 'deleted':
                            if (update.projectId && onProjectDeletedRef.current) {
                                onProjectDeletedRef.current(update.projectId.toString());
                            }
                            break;
                    }
                } catch (error) {
                    devError('Error parsing project update:', error);
                }
            });

            devLog('✓ Subscribed to /topic/projects');
        };

        client.onDisconnect = () => {
            devLog('✗ Disconnected from Project WebSocket');
        };

        client.onStompError = (frame) => {
            devError('STOMP Project error:', frame);
        };

        client.activate();
        clientRef.current = client;

        return () => {
            if (subscriptionRef.current) {
                try {
                    subscriptionRef.current.unsubscribe();
                } catch (e) { /* ignore */ }
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                devLog('Project WebSocket client deactivated');
            }
        };
    }, [enabled]);

    return null;
};
