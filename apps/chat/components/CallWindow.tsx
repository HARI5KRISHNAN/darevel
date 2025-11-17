import React, { useEffect } from 'react';
import { CallType, CallState } from '../hooks/useWebRTCCall';
import { User } from '../types';

interface CallWindowProps {
    callState: CallState;
    callType: CallType;
    caller: User;
    receiver: User;
    localVideoRef: React.RefObject<HTMLVideoElement>;
    remoteVideoRef: React.RefObject<HTMLVideoElement>;
    isMuted: boolean;
    isVideoOff: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
}

const CallWindow: React.FC<CallWindowProps> = ({
    callState,
    callType,
    caller,
    receiver,
    localVideoRef,
    remoteVideoRef,
    isMuted,
    isVideoOff,
    onToggleMute,
    onToggleVideo,
    onEndCall,
}) => {
    // Auto-play videos when refs are set
    useEffect(() => {
        if (localVideoRef.current) {
            localVideoRef.current.play().catch(console.error);
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.play().catch(console.error);
        }
    }, [localVideoRef, remoteVideoRef]);

    const otherUser = caller.id === receiver.id ? caller : receiver;

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Call Header */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={otherUser.avatar}
                            alt={otherUser.name}
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                        <div>
                            <h2 className="text-white text-lg font-semibold">{otherUser.name}</h2>
                            <p className="text-gray-300 text-sm">
                                {callState === 'calling' && 'Calling...'}
                                {callState === 'ringing' && 'Ringing...'}
                                {callState === 'connected' && (callType === 'video' ? 'Video Call' : 'Voice Call')}
                                {callState === 'ended' && 'Call Ended'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Container */}
            <div className="flex-1 relative">
                {callType === 'video' ? (
                    <>
                        {/* Remote Video (Full Screen) */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {/* Local Video (Picture-in-Picture) */}
                        <div className="absolute top-20 right-6 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20">
                            {isVideoOff ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-700 mx-auto mb-2 flex items-center justify-center">
                                            <span className="text-2xl text-white">
                                                {caller.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-white text-xs">Camera Off</p>
                                    </div>
                                </div>
                            ) : (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover mirror"
                                />
                            )}
                        </div>
                    </>
                ) : (
                    // Audio Call - Show Avatar
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
                        <div className="text-center">
                            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-lg mx-auto mb-6 flex items-center justify-center border-4 border-white/20">
                                <img
                                    src={otherUser.avatar}
                                    alt={otherUser.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <h2 className="text-white text-2xl font-semibold mb-2">{otherUser.name}</h2>
                            <p className="text-gray-300">
                                {callState === 'calling' && 'Calling...'}
                                {callState === 'connected' && 'Voice Call In Progress'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Call Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-10">
                <div className="flex items-center justify-center gap-4">
                    {/* Mute/Unmute Button */}
                    <button
                        onClick={onToggleMute}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                            isMuted
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-white/20 hover:bg-white/30 backdrop-blur-lg'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" />
                            </svg>
                        )}
                    </button>

                    {/* End Call Button */}
                    <button
                        onClick={() => {
                            console.log('🔴 End call button clicked');
                            console.log('🔴 Call state:', callState);
                            onEndCall();
                        }}
                        disabled={callState === 'calling' || callState === 'ringing'}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            callState === 'calling' || callState === 'ringing'
                                ? 'bg-red-400 cursor-not-allowed opacity-50'
                                : 'bg-red-600 hover:bg-red-700'
                        }`}
                        title={callState === 'calling' || callState === 'ringing' ? 'Connecting...' : 'End Call'}
                    >
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                    </button>

                    {/* Toggle Video Button (only for video calls) */}
                    {callType === 'video' && (
                        <button
                            onClick={onToggleVideo}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                                isVideoOff
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-lg'
                            }`}
                            title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                        >
                            {isVideoOff ? (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 8V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2v-2l3.5 2.333A1 1 0 0019 13.5v-7a1 1 0 00-1.5-.866L13 8zM3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Mirror effect for local video */}
            <style>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default CallWindow;
