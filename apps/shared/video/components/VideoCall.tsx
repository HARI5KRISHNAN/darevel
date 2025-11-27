import React, { useEffect, useRef, useState } from 'react';
import { VideoCallProps, JitsiMeetExternalAPI, createJitsiConfig } from '../types/video.types';

declare global {
    interface Window {
        JitsiMeetExternalAPI: new (domain: string, options: any) => JitsiMeetExternalAPI;
    }
}

// Get Jitsi domain from environment variable or use default self-hosted
const SELF_HOSTED_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'localhost:8000';
const SELF_HOSTED_SCRIPT_URL = import.meta.env.VITE_JITSI_SCRIPT_URL || `http://${SELF_HOSTED_DOMAIN}/external_api.js`;

// Fallback to public Jitsi
const PUBLIC_JITSI_DOMAIN = 'meet.jit.si';
const PUBLIC_JITSI_SCRIPT_URL = 'https://meet.jit.si/external_api.js';

const VideoCall: React.FC<VideoCallProps> = ({
    roomName,
    userInfo,
    onClose,
    startWithVideoMuted = false,
    startWithAudioMuted = false,
    onParticipantJoined,
    onParticipantLeft,
    jwtToken,
}) => {
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<JitsiMeetExternalAPI | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [useFallback, setUseFallback] = useState(false);
    const [activeDomain, setActiveDomain] = useState(SELF_HOSTED_DOMAIN);

    useEffect(() => {
        const loadJitsiScript = (scriptUrl: string, domain: string): Promise<void> => {
            return new Promise((resolve, reject) => {
                // Remove any existing Jitsi API to allow fallback
                if (window.JitsiMeetExternalAPI && !useFallback) {
                    resolve();
                    return;
                }

                // Check if script already loaded
                const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
                if (existingScript) {
                    if (window.JitsiMeetExternalAPI) {
                        resolve();
                    } else {
                        reject(new Error('Jitsi API not initialized'));
                    }
                    return;
                }

                const script = document.createElement('script');
                script.src = scriptUrl;
                script.async = true;
                script.onload = () => {
                    setActiveDomain(domain);
                    resolve();
                };
                script.onerror = () => reject(new Error('Failed to load Jitsi API from ' + domain));
                document.head.appendChild(script);
            });
        };

        const initJitsi = async () => {
            try {
                let currentDomain = SELF_HOSTED_DOMAIN;
                let currentScriptUrl = SELF_HOSTED_SCRIPT_URL;

                // Try self-hosted first, fallback to public Jitsi
                try {
                    await loadJitsiScript(currentScriptUrl, currentDomain);
                } catch (selfHostedError) {
                    console.warn('Self-hosted Jitsi unavailable, falling back to public Jitsi:', selfHostedError);
                    setUseFallback(true);
                    currentDomain = PUBLIC_JITSI_DOMAIN;
                    currentScriptUrl = PUBLIC_JITSI_SCRIPT_URL;
                    await loadJitsiScript(currentScriptUrl, currentDomain);
                }

                if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
                    throw new Error('Container not ready');
                }

                const config = createJitsiConfig(roomName, jitsiContainerRef.current, userInfo, {
                    startWithVideoMuted,
                    startWithAudioMuted,
                    jwt: useFallback ? undefined : jwtToken // Don't use JWT for public Jitsi
                });

                const api = new window.JitsiMeetExternalAPI(currentDomain, config);
                apiRef.current = api;

                api.addListener('videoConferenceJoined', () => setIsLoading(false));
                api.addListener('videoConferenceLeft', () => onClose());
                api.addListener('readyToClose', () => onClose());

                if (onParticipantJoined) api.addListener('participantJoined', onParticipantJoined);
                if (onParticipantLeft) api.addListener('participantLeft', onParticipantLeft);
            } catch (err) {
                console.error('Jitsi initialization error:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize video call');
                setIsLoading(false);
            }
        };

        initJitsi();
        return () => {
            if (apiRef.current) {
                apiRef.current.dispose();
                apiRef.current = null;
            }
        };
    }, [roomName, userInfo, onClose, startWithVideoMuted, startWithAudioMuted, onParticipantJoined, onParticipantLeft, jwtToken, useFallback]);

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                <div className="bg-gray-800 rounded-lg p-6 max-w-md text-center">
                    <h3 className="text-white text-lg font-semibold mb-2">Video Call Error</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <p className="text-gray-500 text-sm mb-4">Both self-hosted ({SELF_HOSTED_DOMAIN}) and public Jitsi servers are unavailable.</p>
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-white text-lg">Connecting to video call...</p>
                        <p className="text-gray-400 text-sm mt-2">Server: {activeDomain}</p>
                        {useFallback && (
                            <p className="text-yellow-400 text-xs mt-1">Using public Jitsi (self-hosted unavailable)</p>
                        )}
                    </div>
                </div>
            )}
            <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">Leave Call</button>
            <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>
    );
};

export default VideoCall;
