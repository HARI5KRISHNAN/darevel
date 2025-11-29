import React, { useState, useEffect } from 'react';
import VideoCallComponent from '../../shared/video/components/VideoCall';
import { MeetingService } from '../../shared/meetings';

interface VideoCallProps {
    roomName: string;
    displayName: string;
    userEmail?: string;
    keycloakToken?: string;
    onClose: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomName, displayName, userEmail, keycloakToken, onClose }) => {
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchJwtToken = async () => {
            try {
                setIsLoading(true);
                setError(null);

                console.log('VideoCall: Keycloak token available:', !!keycloakToken);

                const meetingService = new MeetingService();
                if (keycloakToken) {
                    meetingService.setAuthToken(keycloakToken);
                }

                console.log('VideoCall: Fetching Jitsi JWT for room:', roomName);
                const response = await meetingService.getJitsiToken(roomName);

                if (response.success && response.token) {
                    console.log('VideoCall: JWT token received successfully');
                    setJwtToken(response.token);
                } else {
                    console.warn('VideoCall: Failed to get JWT token:', response.error);
                    // Continue without JWT - will try to join as guest if allowed
                    setError('Could not authenticate - trying as guest');
                }
            } catch (err) {
                console.error('VideoCall: Error fetching JWT token:', err);
                setError('Failed to authenticate for video call');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJwtToken();
    }, [roomName, keycloakToken]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white text-lg">Authenticating for video call...</p>
                    <p className="text-gray-400 text-sm mt-2">Room: {roomName}</p>
                </div>
            </div>
        );
    }

    // If we have an error but no token, show error with retry option
    if (error && !jwtToken) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                <div className="bg-gray-800 rounded-lg p-6 max-w-md text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">Authentication Required</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <p className="text-gray-500 text-sm mb-6">
                        This video call requires authentication. Please make sure you are logged in.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <VideoCallComponent
            roomName={roomName}
            userInfo={{
                name: displayName,
                email: userEmail || ''
            }}
            onClose={onClose}
            jwtToken={jwtToken || undefined}
            startWithVideoMuted={false}
            startWithAudioMuted={false}
        />
    );
};

export default VideoCall;
