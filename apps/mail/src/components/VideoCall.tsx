import React, { useEffect, useRef, useState } from 'react';

interface VideoCallProps {
    roomName: string;
    displayName: string;
    userEmail?: string;
    keycloakToken?: string;
    onClose: () => void;
}

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

const VideoCall: React.FC<VideoCallProps> = ({ roomName, displayName, userEmail, onClose }) => {
    const jitsiContainer = useRef<HTMLDivElement>(null);
    const jitsiApi = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load Jitsi Meet API script
    useEffect(() => {
        // Check if script already exists
        if (document.getElementById('jitsi-script')) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = 'jitsi-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => {
            console.log('Jitsi script loaded');
            setScriptLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Jitsi script');
            setIsLoading(false);
        };
        document.body.appendChild(script);

        return () => {
            // Don't remove script on unmount as it might be used by other components
        };
    }, []);

    // Initialize Jitsi Meet
    useEffect(() => {
        if (!scriptLoaded || !jitsiContainer.current || jitsiApi.current) return;

        setIsLoading(true);

        const domain = 'meet.jit.si';
        const options = {
            roomName: roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainer.current,
            userInfo: {
                displayName: displayName,
                email: userEmail || ''
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
                disableDeepLinking: true,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
            },
        };

        try {
            jitsiApi.current = new window.JitsiMeetExternalAPI(domain, options);

            jitsiApi.current.on('videoConferenceJoined', () => {
                console.log('Joined video conference');
                setIsLoading(false);
            });

            jitsiApi.current.on('readyToClose', () => {
                console.log('Video call ended');
                onClose();
            });

        } catch (error) {
            console.error('Error initializing Jitsi:', error);
            setIsLoading(false);
        }

        return () => {
            if (jitsiApi.current) {
                jitsiApi.current.dispose();
                jitsiApi.current = null;
            }
        };
    }, [scriptLoaded, roomName, displayName, userEmail, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                End Call
            </button>

            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-40">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-white text-lg">Connecting to video call...</p>
                        <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
                    </div>
                </div>
            )}

            {/* Jitsi container */}
            <div ref={jitsiContainer} className="w-full h-full" />
        </div>
    );
};

export default VideoCall;
