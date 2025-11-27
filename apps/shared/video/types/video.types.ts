// Video Call Types for shared Jitsi integration

export interface VideoCallUserInfo {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface VideoCallProps {
    roomName: string;
    userInfo: VideoCallUserInfo;
    onClose: () => void;
    startWithVideoMuted?: boolean;
    startWithAudioMuted?: boolean;
    onParticipantJoined?: (participant: any) => void;
    onParticipantLeft?: (participant: any) => void;
    jwtToken?: string; // JWT token for Keycloak SSO authentication
}

export interface JitsiMeetExternalAPI {
    executeCommand: (command: string, ...args: any[]) => void;
    dispose: () => void;
    addListener: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    getParticipantsInfo: () => any[];
    getNumberOfParticipants: () => number;
}

export interface JitsiConfig {
    roomName: string;
    width: string | number;
    height: string | number;
    parentNode: HTMLElement;
    jwt?: string; // JWT token for authentication
    userInfo: {
        displayName: string;
        email: string;
    };
    configOverwrite: {
        startWithAudioMuted?: boolean;
        startWithVideoMuted?: boolean;
        prejoinPageEnabled?: boolean;
        disableDeepLinking?: boolean;
        disableInviteFunctions?: boolean;
        enableWelcomePage?: boolean;
        enableClosePage?: boolean;
        toolbarButtons?: string[];
    };
    interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK?: boolean;
        SHOW_WATERMARK_FOR_GUESTS?: boolean;
        SHOW_BRAND_WATERMARK?: boolean;
        DEFAULT_BACKGROUND?: string;
        TOOLBAR_BUTTONS?: string[];
    };
}

export const createJitsiConfig = (
    roomName: string,
    parentNode: HTMLElement,
    userInfo: VideoCallUserInfo,
    options?: {
        startWithVideoMuted?: boolean;
        startWithAudioMuted?: boolean;
        jwt?: string;
    }
): JitsiConfig => ({
    roomName,
    width: '100%',
    height: '100%',
    parentNode,
    jwt: options?.jwt,
    userInfo: {
        displayName: userInfo.name,
        email: userInfo.email,
    },
    configOverwrite: {
        startWithAudioMuted: options?.startWithAudioMuted ?? false,
        startWithVideoMuted: options?.startWithVideoMuted ?? false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        disableInviteFunctions: true,
        enableWelcomePage: false,
        enableClosePage: false,
    },
    interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_BACKGROUND: '#1a1a2e',
    },
});
