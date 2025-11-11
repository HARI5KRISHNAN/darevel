import React, { useEffect, useRef, useState } from 'react';
import api from '../api';

interface VideoCallProps {
  roomName: string;
  displayName: string;
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoCall: React.FC<VideoCallProps> = ({ roomName, displayName, onClose }) => {
  const jitsiContainerRef = useRef<HTMLDivElement | null>(null);
  const jitsiApiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ENV-friendly domain: Use VITE_JITSI_DOMAIN for self-hosted, fallback to meet.jit.si
  const envDomain = (import.meta as any).env?.VITE_JITSI_DOMAIN;
  const envPort = (import.meta as any).env?.VITE_JITSI_PORT;

  // Use environment variable if set, otherwise fallback to public Jitsi
  const chosenDomain = envDomain || 'meet.jit.si';
  const chosenPort = envPort || '';
  const isSecure = chosenDomain.includes('jit.si') || chosenPort === '443';
  const protocol = isSecure ? 'https' : 'http';
  const portSuffix = chosenPort && !isSecure ? `:${chosenPort}` : '';
  const meetingLink = `${protocol}://${chosenDomain}${portSuffix}/${roomName}`;

  console.log(`🌐 Jitsi config: domain=${chosenDomain}, port=${chosenPort}, protocol=${protocol}`);

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // helper: load external_api.js from chosen domain; resolves with window.JitsiMeetExternalAPI
  const loadJitsiScript = (domain: string, port?: string) => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).JitsiMeetExternalAPI) {
        resolve((window as any).JitsiMeetExternalAPI);
        return;
      }
      const script = document.createElement('script');
      const p = domain.includes('jit.si') ? 'https' : protocol;
      const portSuffixLocal = port ? `:${port}` : '';
      script.src = `${p}://${domain}${portSuffixLocal}/external_api.js`;
      script.async = true;
      script.onload = () => {
        if ((window as any).JitsiMeetExternalAPI) resolve((window as any).JitsiMeetExternalAPI);
        else reject(new Error('external_api loaded but Jitsi API object missing'));
      };
      script.onerror = () => reject(new Error(`Failed to load external_api.js from ${script.src}`));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    let timeoutId: any = null;

    const fetchToken = async (): Promise<string | null> => {
      try {
        const res = await api.get(`/jitsi/token?room=${encodeURIComponent(roomName)}`);
        if (res?.data?.ok && res.data.token) return res.data.token as string;
        console.warn('jitsi token endpoint returned no token', res?.data);
        return null;
      } catch (err: any) {
        console.error('Failed fetching jitsi token', err?.response || err);
        // bubble up a useful message
        setError('Failed to authenticate with video server. Please sign in again or check backend / Keycloak.');
        return null;
      }
    };

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Basic checks
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Browser does not support camera/microphone access. Use a modern browser (Chrome/Edge/Firefox).');
          setIsLoading(false);
          return;
        }

        // 1) fetch token (if your server returns one)
        const token = await fetchToken();

        // 2) Load Jitsi script from chosen domain
        try {
          await loadJitsiScript(chosenDomain, chosenPort);
        } catch (loadErr) {
          console.warn('Primary Jitsi load failed, trying public fallback:', loadErr);
          // try fallback to public Jitsi if self-hosted fails
          if (chosenDomain !== 'meet.jit.si') {
            try {
              await loadJitsiScript('meet.jit.si');
            } catch (fallbackErr) {
              throw new Error(`Unable to load Jitsi API from either ${chosenDomain} or meet.jit.si.\nNetwork/port/SSL issue: ${fallbackErr}`);
            }
          } else {
            throw new Error(`Unable to load Jitsi API from ${chosenDomain}.\nNetwork/port/SSL issue: ${loadErr}`);
          }
        }

        if (!jitsiContainerRef.current) throw new Error('Missing jitsi container DOM node');

        // Compose options
        const options: any = {
          roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: { displayName: displayName || 'Guest' },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableUserRolesBasedOnToken: true,
            enableFeaturesBasedOnToken: true,
            disableThirdPartyRequests: true,
            p2p: { enabled: false },
            enableTokenAuth: !!token,
            // keep defaults minimal
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            DEFAULT_BACKGROUND: '#474747',
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          }
        };

        if (token) options.jwt = token;

        // domain param: pass the domain (no protocol / port) to external API constructor
        const apiDomain = chosenDomain.includes('jit.si') && !chosenPort ? 'meet.jit.si' : `${chosenDomain}${chosenPort ? `:${chosenPort}` : ''}`;

        // create API
        jitsiApiRef.current = new (window as any).JitsiMeetExternalAPI(apiDomain, options);

        // safety timeout to hide spinner if iframe takes too long
        timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, 12000);

        // events
        jitsiApiRef.current.on('videoConferenceJoined', () => {
          clearTimeout(timeoutId);
          setIsLoading(false);
        });

        jitsiApiRef.current.on('videoConferenceLeft', () => {
          onClose();
        });

        jitsiApiRef.current.on('connectionFailed', (ev: any) => {
          console.error('Jitsi connectionFailed', ev);
          setError('Failed to connect to Jitsi server (XMPP/Websocket). Check server and firewall.');
          setIsLoading(false);
        });

        jitsiApiRef.current.on('iframeReady', () => {
          // iframe created: hide spinner shortly
          setTimeout(() => setIsLoading(false), 800);
        });

        jitsiApiRef.current.on('errorOccurred', (ev: any) => {
          console.error('Jitsi errorOccurred', ev);
        });
      } catch (err: any) {
        console.error('Video initialization failed:', err);
        setError(err?.message || 'Failed to open video call. Check Jitsi server and network.');
        setIsLoading(false);
      }
    };

    init();

    return () => {
      clearTimeout(timeoutId);
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, displayName, onClose]); // re-create when roomName changes

  const handleEndCall = () => {
    if (jitsiApiRef.current) jitsiApiRef.current.executeCommand('hangup');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-white font-semibold">Video Meeting</h2>
            <span className="text-gray-400 ml-2 text-sm">Room: {roomName}</span>
          </div>
          <button onClick={copyMeetingLink} className="ml-4 px-3 py-1 bg-blue-600 text-white rounded">
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <button onClick={handleEndCall} className="px-4 py-2 bg-red-600 text-white rounded">End Call</button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div>Connecting to video call…</div>
            <div className="text-sm text-gray-300 mt-2">Using {chosenDomain}{chosenPort ? `:${chosenPort}` : ''}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 text-white p-6 rounded shadow max-w-2xl">
            <h3 className="font-semibold mb-2">Video call error</h3>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setError(null); window.location.reload(); }} className="px-3 py-1 bg-blue-600 rounded">Reload</button>
              <button onClick={() => onClose()} className="px-3 py-1 bg-gray-600 rounded">Close</button>
            </div>
          </div>
        </div>
      )}

      <div ref={jitsiContainerRef} style={{ flex: 1, minHeight: 480, width: '100%' }} />
    </div>
  );
};

export default VideoCall;
