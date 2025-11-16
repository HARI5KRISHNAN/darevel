import { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '../types';

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

// Call signaling message types
export type SignalingMessageType = 'call-offer' | 'call-answer' | 'ice-candidate' | 'call-rejected' | 'call-ended';

export interface SignalingMessage {
    type: SignalingMessageType;
    from: number; // User ID
    to: number; // User ID
    channelId: string;
    callType?: CallType;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

export interface CallData {
    type: CallType;
    caller: User;
    receiver: User;
    channelId: string;
}

interface UseWebRTCCallProps {
    user: User | null;
    onIncomingCall?: (callData: CallData) => void;
    sendSignal?: (message: SignalingMessage) => void;
}

export const useWebRTCCall = ({ user, onIncomingCall, sendSignal }: UseWebRTCCallProps) => {
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
    const initializePeerConnection = useCallback((receiver: User) => {
        const pc = new RTCPeerConnection(iceServers);

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && sendSignal && currentCall) {
                console.log('Sending ICE candidate:', event.candidate);
                sendSignal({
                    type: 'ice-candidate',
                    from: user!.id,
                    to: receiver.id,
                    channelId: currentCall.channelId,
                    candidate: event.candidate.toJSON(),
                });
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
    }, [sendSignal, currentCall, user]);

    // Start a call
    const startCall = useCallback(async (
        receiver: User,
        channelId: string,
        callType: CallType
    ) => {
        if (!user) return;

        try {
            // Check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support camera/microphone access. Please use Chrome, Firefox, or Edge, and ensure the app is served over HTTPS or localhost.');
            }

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
            const pc = initializePeerConnection(receiver);

            // Add local tracks to peer connection
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Create offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send offer to receiver via WebSocket
            if (sendSignal) {
                sendSignal({
                    type: 'call-offer',
                    from: user.id,
                    to: receiver.id,
                    channelId,
                    callType,
                    offer,
                });
                console.log('Call offer sent:', { receiver, callType });
            }

        } catch (error) {
            console.error('Error starting call:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to start call. Please check camera/microphone permissions.';
            alert(errorMessage);
            endCall();
        }
    }, [user, initializePeerConnection, sendSignal]);

    // Answer an incoming call
    const answerCall = useCallback(async (callData: CallData, offer: RTCSessionDescriptionInit) => {
        try {
            // Check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Your browser does not support camera/microphone access. Please use Chrome, Firefox, or Edge, and ensure the app is served over HTTPS or localhost.');
            }

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
            const pc = initializePeerConnection(callData.caller);

            // Add local tracks
            stream.getTracks().forEach((track) => {
                pc.addTrack(track, stream);
            });

            // Set remote description (offer)
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Create answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send answer to caller via WebSocket
            if (sendSignal) {
                sendSignal({
                    type: 'call-answer',
                    from: callData.receiver.id,
                    to: callData.caller.id,
                    channelId: callData.channelId,
                    answer,
                });
                console.log('Call answer sent:', { callData });
            }

        } catch (error) {
            console.error('Error answering call:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to answer call. Please check camera/microphone permissions.';
            alert(errorMessage);
            endCall();
        }
    }, [initializePeerConnection, sendSignal]);

    // Reject an incoming call
    const rejectCall = useCallback((callData?: CallData) => {
        if (callData && sendSignal) {
            sendSignal({
                type: 'call-rejected',
                from: callData.receiver.id,
                to: callData.caller.id,
                channelId: callData.channelId,
            });
            console.log('Call rejected:', { callData });
        }
        setCallState('idle');
        setCurrentCall(null);
    }, [sendSignal]);

    // End the call
    const endCall = useCallback(() => {
        // Send end call signal
        if (currentCall && sendSignal && user) {
            const otherUser = currentCall.caller.id === user.id ? currentCall.receiver : currentCall.caller;
            sendSignal({
                type: 'call-ended',
                from: user.id,
                to: otherUser.id,
                channelId: currentCall.channelId,
            });
            console.log('Call ended signal sent');
        }

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
    }, [localStream, currentCall, sendSignal, user]);

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

    // Handle incoming signaling messages
    const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
        console.log('Received signaling message:', message);

        switch (message.type) {
            case 'call-offer':
                // Notify about incoming call
                if (onIncomingCall && message.offer) {
                    // We need the full user objects - this will be handled in MessagesView
                    // Just set the state to ringing
                    setCallState('ringing');
                }
                break;

            case 'call-answer':
                // Receiver accepted the call - set their answer
                if (message.answer && peerConnection.current) {
                    await peerConnection.current.setRemoteDescription(
                        new RTCSessionDescription(message.answer)
                    );
                    setCallState('connected');
                    console.log('Call answer received and processed');
                }
                break;

            case 'ice-candidate':
                // Add ICE candidate from peer
                if (message.candidate && peerConnection.current) {
                    await peerConnection.current.addIceCandidate(
                        new RTCIceCandidate(message.candidate)
                    );
                    console.log('ICE candidate added');
                }
                break;

            case 'call-rejected':
                // Call was rejected
                console.log('Call rejected by receiver');
                alert('Call was rejected');
                endCall();
                break;

            case 'call-ended':
                // Other user ended the call
                console.log('Call ended by other user');
                endCall();
                break;
        }
    }, [onIncomingCall, endCall]);

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
        handleSignalingMessage,
    };
};
