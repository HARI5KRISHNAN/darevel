import React from 'react';
import { CallType } from '../hooks/useWebRTCCall';
import { User } from '../types';

interface IncomingCallProps {
    caller: User;
    callType: CallType;
    onAccept: () => void;
    onReject: () => void;
}

const IncomingCall: React.FC<IncomingCallProps> = ({
    caller,
    callType,
    onAccept,
    onReject,
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-8 max-w-md w-full animate-pulse-slow">
                {/* Call Icon Animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                        {callType === 'video' ? (
                            <svg className="w-16 h-16 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                        ) : (
                            <svg className="w-16 h-16 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                        )}
                    </div>
                </div>

                {/* Caller Info */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src={caller.avatar}
                            alt={caller.name}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                        />
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-2">{caller.name}</h2>
                    <p className="text-white/90 text-lg">
                        Incoming {callType === 'video' ? 'Video' : 'Voice'} Call
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                    {/* Reject Button */}
                    <button
                        onClick={onReject}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
                            <svg className="w-8 h-8 text-white rotate-135" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-semibold">Decline</span>
                    </button>

                    {/* Accept Button */}
                    <button
                        onClick={onAccept}
                        className="flex flex-col items-center gap-2 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                        </div>
                        <span className="text-white text-sm font-semibold">Accept</span>
                    </button>
                </div>
            </div>

            {/* Animation styles */}
            <style>{`
                @keyframes pulse-slow {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.02);
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .rotate-135 {
                    transform: rotate(135deg);
                }
            `}</style>
        </div>
    );
};

export default IncomingCall;
