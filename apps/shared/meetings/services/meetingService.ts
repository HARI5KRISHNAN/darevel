// Shared Meeting Service - syncs meetings between Mail and Chat apps
import { Meeting, CreateMeetingRequest, UpdateMeetingRequest } from '../types/meeting.types';

// Chat backend is exposed on host port 8082 (container 8081)
const CHAT_API_URL = typeof window !== 'undefined' && window.location 
    ? `${window.location.protocol}//${window.location.hostname}:8082`
    : 'http://localhost:8082';

const MAIL_API_URL = typeof window !== 'undefined' && window.location
    ? `${window.location.protocol}//${window.location.hostname}:8083`
    : 'http://localhost:8083';

export interface ConflictCheckResult {
    hasConflicts: boolean;
    conflicts: Record<string, Meeting[]>;
}

export class MeetingService {
    private chatApiUrl: string;
    private mailApiUrl: string;
    private authToken?: string;

    constructor(options?: { chatApiUrl?: string; mailApiUrl?: string; authToken?: string }) {
        this.chatApiUrl = options?.chatApiUrl || CHAT_API_URL;
        this.mailApiUrl = options?.mailApiUrl || MAIL_API_URL;
        this.authToken = options?.authToken;
    }

    setAuthToken(token: string) {
        this.authToken = token;
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
            console.log('MeetingService: Including Authorization header, token length:', this.authToken.length);
        } else {
            console.warn('MeetingService: No auth token set, requests may fail');
        }
        return headers;
    }

    // Create meeting - syncs to both Chat and Mail calendars
    async createMeeting(request: CreateMeetingRequest): Promise<Meeting> {
        console.log('MeetingService.createMeeting - Request:', JSON.stringify(request, null, 2));
        console.log('MeetingService.createMeeting - URL:', `${this.chatApiUrl}/api/meetings`);
        
        const response = await fetch(`${this.chatApiUrl}/api/meetings`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MeetingService.createMeeting - Error response:', errorText);
            let error;
            try {
                error = JSON.parse(errorText);
            } catch {
                error = { message: response.statusText };
            }
            throw new Error(error.message || `Failed to create meeting: ${response.status} ${response.statusText}`);
        }

        const meeting = await response.json();

        // Also sync to Mail calendar in background (don't await to avoid blocking)
        this.syncToMailCalendar(meeting).catch(err => {
            console.warn('Failed to sync meeting to mail calendar:', err);
        });

        return meeting;
    }

    // Sync meeting to mail calendar
    private async syncToMailCalendar(meeting: Meeting): Promise<void> {
        try {
            await fetch(`${this.mailApiUrl}/mail/calendar/meetings`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(meeting),
            });
        } catch (error) {
            console.error('Error syncing to mail calendar:', error);
        }
    }

    // Get meetings within date range
    async getMeetingsInRange(startDate: Date, endDate: Date): Promise<Meeting[]> {
        const params = new URLSearchParams({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        });

        const url = `${this.chatApiUrl}/api/meetings/range?${params}`;
        console.log('MeetingService.getMeetingsInRange - URL:', url);

        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MeetingService.getMeetingsInRange - Error:', errorText);
            throw new Error(`Failed to fetch meetings: ${response.status} ${errorText}`);
        }

        return response.json();
    }

    // Get meetings for a specific user
    async getUserMeetings(userId: number): Promise<Meeting[]> {
        const response = await fetch(`${this.chatApiUrl}/api/meetings/user/${userId}`, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user meetings: ' + response.statusText);
        }

        return response.json();
    }

    // Check for scheduling conflicts
    async checkConflicts(userId: number, startTime: Date, endTime: Date): Promise<Meeting[]> {
        const params = new URLSearchParams({
            userId: userId.toString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
        });

        const url = `${this.chatApiUrl}/api/meetings/conflicts?${params}`;
        console.log('MeetingService.checkConflicts - URL:', url);

        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MeetingService.checkConflicts - Error:', errorText);
            throw new Error(`Failed to check conflicts: ${response.status} ${errorText}`);
        }

        return response.json();
    }

    // Check conflicts for multiple participants
    async checkParticipantConflicts(
        participantIds: number[],
        startTime: Date,
        endTime: Date
    ): Promise<ConflictCheckResult> {
        const response = await fetch(this.chatApiUrl + '/api/meetings/conflicts/check', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                participantIds,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to check participant conflicts: ' + response.statusText);
        }

        return response.json();
    }

    // Update meeting
    async updateMeeting(id: number, request: UpdateMeetingRequest): Promise<Meeting> {
        const response = await fetch(this.chatApiUrl + '/api/meetings/' + id, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error('Failed to update meeting: ' + response.statusText);
        }

        return response.json();
    }

    // Cancel meeting
    async cancelMeeting(id: number): Promise<Meeting> {
        const response = await fetch(this.chatApiUrl + '/api/meetings/' + id + '/cancel', {
            method: 'POST',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to cancel meeting: ' + response.statusText);
        }

        return response.json();
    }

    // Delete meeting
    async deleteMeeting(id: number): Promise<void> {
        const response = await fetch(this.chatApiUrl + '/api/meetings/' + id, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to delete meeting: ' + response.statusText);
        }
    }

    // Generate meeting link without creating a full meeting
    async generateMeetingLink(prefix?: string): Promise<{ roomName: string; meetingLink: string }> {
        const response = await fetch(this.chatApiUrl + '/api/meetings/generate-link', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ prefix }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate meeting link: ' + response.statusText);
        }

        return response.json();
    }

    // Get upcoming meetings for a user
    async getUpcomingMeetings(userId: number): Promise<Meeting[]> {
        const response = await fetch(this.chatApiUrl + '/api/meetings/user/' + userId + '/upcoming', {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch upcoming meetings: ' + response.statusText);
        }

        return response.json();
    }

    // Get Jitsi JWT token for joining a video call
    async getJitsiToken(roomName: string): Promise<JitsiTokenResponse> {
        const url = `${this.chatApiUrl}/api/jitsi/token?room=${encodeURIComponent(roomName)}`;
        console.log('MeetingService.getJitsiToken - URL:', url);

        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MeetingService.getJitsiToken - Error:', errorText);
            throw new Error(`Failed to get Jitsi token: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('MeetingService.getJitsiToken - Response:', data);
        return data;
    }
}

// Jitsi token response type
export interface JitsiTokenResponse {
    success: boolean;
    token: string;
    room: string;
    user: {
        id: string;
        name: string;
        email: string;
        isModerator: boolean;
    };
    error?: string;
}

// Singleton instance for convenience
let defaultInstance: MeetingService | null = null;

export function getMeetingService(options?: { chatApiUrl?: string; authToken?: string }): MeetingService {
    if (!defaultInstance || options) {
        defaultInstance = new MeetingService(options);
    }
    return defaultInstance;
}

export default MeetingService;
