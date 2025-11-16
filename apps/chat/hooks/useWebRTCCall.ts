import { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '../types';

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface CallData {
    type: CallType;
    caller: User;
    receiver: User;
    channelId: string;
}

interface UseWebRTCCallProps {
    user: User | null;
    onIncomingCall?: (callData: CallData) => void;
}

export const useWebRTCCall = ({ user, onIncomingCall }: UseWebRTCCallProps) => {
    // TODO: Use onIncomingCall when WebSocket signaling is implemented
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleIncomingCall = onIncomingCall;
    const [callState, setCallState] = useState<CallState>('idle');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [currentCall, setCurrentCall] = useState<CallData | null>(null);

    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    // ICE servers configuration (STUN servers for NAT traversal)
    const iceServers = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // Initialize peer connection
    const initializePeerConnection = useCallback(() => {
        const pc = new RTCPeerConnection(iceServers);

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('ICE candidate:', event.candidate);
                // TODO: Send ICE candidate to peer via WebSocket
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            const stream = event.streams[0];
            setRemoteStream(stream);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('Connection state:', pc.connectionState);
            if (pc.connectionState === 'connected') {
                setCallState('connected');
            } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                endCall();
            }
        };

        peerConnection.current = pc;
        return pc;
    }, []);

    // Start a call
    const startCall = useCallback(async (
        receiver: User,
        channelId: string,
        callType: CallType
    ) => {
        if (!user) return;

        try {
            setCallState('calling');
            setCurrentCall({
                type: callType,
                caller: user,
                receiver,
                channelId,
            });

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callType === 'video',
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize peer connection
            const pc = initializePeerConnection();

            // Add local tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log('Call started:', { receiver, callType, offer });
            // TODO: Send offer to receiver via WebSocket

        } catch (error) {
            console.error('Error starting call:', error);
            alert('Failed to start call. Please check camera/microphone permissions.');
            endCall();
        }
    }, [user, initializePeerConnection]);

    // Answer an incoming call
    const answerCall = useCallback(async (callData: CallData, offer: RTCSessionDescriptionInit) => {
        try {
            setCallState('connected');
            setCurrentCall(callData);

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: callData.type === 'video',
            });

            setLocalStream(stream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize peer connection
            const pc = initializePeerConnection();

            // Add local tracks
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Set remote description (offer)
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Create answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log('Call answered:', { callData, answer });
            // TODO: Send answer to caller via WebSocket

        } catch (error) {
            console.error('Error answering call:', error);
            alert('Failed to answer call. Please check camera/microphone permissions.');
            endCall();
        }
    }, [initializePeerConnection]);

    // Reject an incoming call
    const rejectCall = useCallback(() => {
        setCallState('idle');
        setCurrentCall(null);
        // TODO: Send reject message via WebSocket
    }, []);

    // End the call
    const endCall = useCallback(() => {
        // Stop all tracks
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }

        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Reset state
        setCallState('ended');
        setRemoteStream(null);
        setIsMuted(false);
        setIsVideoOff(false);

        // Clear video elements
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }

        // Reset after animation
        setTimeout(() => {
            setCallState('idle');
            setCurrentCall(null);
        }, 1000);

        console.log('Call ended');
        // TODO: Send end call message via WebSocket
    }, [localStream]);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [localStream]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [localStream]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, [localStream]);

    return {
        callState,
        currentCall,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        localVideoRef,
        remoteVideoRef,
        startCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
    };
};
