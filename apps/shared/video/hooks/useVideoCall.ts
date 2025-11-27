import { useState, useCallback } from 'react';

export interface ActiveCall {
    roomName: string;
    callType: 'audio' | 'video';
}

export interface IncomingCall {
    roomName: string;
    callType: 'audio' | 'video';
    callerName: string;
    channelId?: string;
}

export interface UseVideoCallReturn {
    activeCall: ActiveCall | null;
    incomingCall: IncomingCall | null;
    startCall: (roomName: string, callType: 'audio' | 'video') => void;
    endCall: () => void;
    receiveIncomingCall: (call: IncomingCall) => void;
    acceptCall: () => void;
    declineCall: () => void;
}

export const useVideoCall = (): UseVideoCallReturn => {
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

    const startCall = useCallback((roomName: string, callType: 'audio' | 'video') => {
        setActiveCall({ roomName, callType });
    }, []);

    const endCall = useCallback(() => {
        setActiveCall(null);
    }, []);

    const receiveIncomingCall = useCallback((call: IncomingCall) => {
        setIncomingCall(call);
    }, []);

    const acceptCall = useCallback(() => {
        if (incomingCall) {
            setActiveCall({
                roomName: incomingCall.roomName,
                callType: incomingCall.callType,
            });
            setIncomingCall(null);
        }
    }, [incomingCall]);

    const declineCall = useCallback(() => {
        setIncomingCall(null);
    }, []);

    return {
        activeCall,
        incomingCall,
        startCall,
        endCall,
        receiveIncomingCall,
        acceptCall,
        declineCall,
    };
};

export default useVideoCall;
