import React, { useState, useMemo, useEffect } from 'react';
import Header from './src/components/Header';
import Sidebar from './src/components/Sidebar';
import EmailList from './src/components/EmailList';
import EmailDetail from './src/components/EmailDetail';
import Compose from './src/components/Compose';
import Calendar from './src/components/Calendar';
import ScheduleMeeting from './src/components/ScheduleMeeting';
import VideoCall from './src/components/VideoCall';
import { folders } from './src/constants';
import { Email, Folder, EmailListResponse } from './types';
import api from './src/api';
import { transformBackendEmails } from './src/emailTransformer';

export type SortOrder = 'date-desc' | 'date-asc';

function App() {
  const [selectedFolder, setSelectedFolder] = useState<Folder['id']>('inbox');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [pinnedThreadIds, setPinnedThreadIds] = useState<string[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [editingDraft, setEditingDraft] = useState<any>(null);
  const [folderCounts, setFolderCounts] = useState<{ inbox: number; sent: number; important: number; spam: number; trash: number; draft: number }>({ inbox: 0, sent: 0, important: 0, spam: 0, trash: 0, draft: 0 });
  const [activeVideoCall, setActiveVideoCall] = useState<{ roomName: string; displayName: string } | null>(null);
  const [calendarRefreshTrigger, setCalendarRefreshTrigger] = useState(0);

  // Get keycloak from window
  const keycloak = (window as any).keycloak;

  // Load pinned threads from localStorage
  useEffect(() => {
    const storedPins = localStorage.getItem('pinnedThreadIds');
    if (storedPins) {
        setPinnedThreadIds(JSON.parse(storedPins));
    }
  }, []);

  // Fetch folder counts
  const fetchCounts = async () => {
    try {
      const response = await api.get('/mail/counts');
      if (response.data.ok) {
        setFolderCounts(response.data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch folder counts:', err);
    }
  };

  // Fetch emails from backend
  useEffect(() => {
    // Skip email fetching for calendar and schedule views
    if (selectedFolder === 'calendar' || selectedFolder === 'schedule') {
      setLoading(false);
      return;
    }

    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Handle drafts separately
        if (selectedFolder === 'draft') {
          const response = await api.get('/mail/drafts');
          if (response.data.ok) {
            // Transform drafts to email format for display
            const draftEmails: Email[] = response.data.drafts.map((draft: any) => ({
              id: `draft-${draft.id}`,
              threadId: `draft-thread-${draft.id}`,
              sender: 'Draft',
              senderShort: 'D',
              senderEmail: draft.user_email,
              to: draft.to_recipients.map((email: string) => ({ name: email, email })),
              cc: draft.cc_recipients?.map((email: string) => ({ name: email, email })) || [],
              subject: draft.subject || '(No subject)',
              snippet: draft.body.replace(/<[^>]*>/g, '').substring(0, 100) || '(No content)',
              body: draft.body || '',
              timestamp: draft.updated_at,
              isStarred: false,
              isRead: true,
              folder: 'draft',
              draftData: draft // Store original draft data
            }));
            setEmails(draftEmails);
          }
          await fetchCounts();
          return;
        }

        let endpoint = '/mail/inbox';
        if (selectedFolder === 'sent') {
          endpoint = '/mail/sent';
        } else if (selectedFolder === 'important') {
          endpoint = '/mail/important';
        } else if (selectedFolder === 'spam') {
          endpoint = '/mail/spam';
        } else if (selectedFolder === 'trash') {
          endpoint = '/mail/trash';
        }

        const response = await api.get<EmailListResponse>(endpoint);
        const transformedEmails = transformBackendEmails(response.data.rows, selectedFolder as any);
        setEmails(transformedEmails);
        await fetchCounts();
      } catch (err: any) {
        console.error('Failed to fetch emails:', err);
        setError(err.message || 'Failed to load emails');
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, [selectedFolder]);

  const handleEmailSent = () => {
    // Skip refresh for calendar and schedule views
    if (selectedFolder === 'calendar' || selectedFolder === 'schedule') {
      return;
    }

    // Refresh emails after sending
    setLoading(true);
    const fetchEmails = async () => {
      try {
        let endpoint = '/mail/inbox';
        if (selectedFolder === 'sent') {
          endpoint = '/mail/sent';
        } else if (selectedFolder === 'important') {
          endpoint = '/mail/important';
        } else if (selectedFolder === 'spam') {
          endpoint = '/mail/spam';
        } else if (selectedFolder === 'trash') {
          endpoint = '/mail/trash';
        }
        const response = await api.get<EmailListResponse>(endpoint);
        const transformedEmails = transformBackendEmails(response.data.rows, selectedFolder as any);
        setEmails(transformedEmails);
      } catch (err: any) {
        console.error('Failed to refresh emails:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  };

  const togglePinThread = (threadId: string) => {
    setPinnedThreadIds(prev => {
        const newPinnedIds = prev.includes(threadId)
            ? prev.filter(id => id !== threadId)
            : [...prev, threadId];
        localStorage.setItem('pinnedThreadIds', JSON.stringify(newPinnedIds));
        return newPinnedIds;
    });
  };

  const handleStarToggle = (emailId: string, isStarred: boolean) => {
    setEmails(prev => prev.map(email =>
      email.id === emailId ? { ...email, isStarred } : email
    ));
    fetchCounts();
  };

  const handleThreadSelect = async (threadId: string) => {
    // Check if this is a draft
    const thread = threads[threadId];
    if (thread && thread[0] && thread[0].folder === 'draft') {
      // Open draft in compose window
      const draftEmail = thread[0];
      const draftData = draftEmail.draftData;

      if (draftData) {
        setEditingDraft(draftData);
        setShowCompose(true);
      }
      return;
    }

    setSelectedThreadId(threadId);

    // Mark all unread emails in the thread as read
    if (thread) {
      const unreadEmails = thread.filter(email => !email.isRead);
      for (const email of unreadEmails) {
        try {
          await api.patch(`/mail/${email.id}/read`);
        } catch (err) {
          console.error('Failed to mark email as read:', err);
        }
      }

      // Update local state
      setEmails(prev => prev.map(email =>
        unreadEmails.some(e => e.id === email.id) ? { ...email, isRead: true } : email
      ));

      // Refresh counts
      fetchCounts();
    }
  };

  const handleMarkAsUnread = async (emailId: string) => {
    try {
      await api.patch(`/mail/${emailId}/unread`);

      // Update local state
      setEmails(prev => prev.map(email =>
        email.id === emailId ? { ...email, isRead: false } : email
      ));

      // Refresh counts
      fetchCounts();
    } catch (err) {
      console.error('Failed to mark email as unread:', err);
    }
  };

  const handleEmailDrop = async (emailId: string, targetFolder: string) => {
    try {
      // Call the move API
      await api.post(`/mail/${emailId}/move`, { to: targetFolder });

      // Remove the email from current view
      setEmails(prev => prev.filter(email => email.id !== emailId));

      // Refresh counts to update sidebar
      await fetchCounts();

      console.log(`Moved email ${emailId} to ${targetFolder}`);
    } catch (err) {
      console.error('Failed to move email:', err);
      alert('Failed to move email. Please try again.');
    }
  };

  const handleMoveToSpam = async (emailId: string) => {
    try {
      // Call the move API to move to SPAM
      await api.post(`/mail/${emailId}/move`, { to: 'SPAM' });

      // Remove the email from current view
      setEmails(prev => prev.filter(email => email.id !== emailId));

      // Clear selection
      setSelectedThreadId(null);

      // Refresh counts to update sidebar
      await fetchCounts();

      console.log(`Moved email ${emailId} to SPAM`);
    } catch (err) {
      console.error('Failed to move to spam:', err);
      alert('Failed to move to spam. Please try again.');
    }
  };

  const handleMoveToTrash = async (emailId: string) => {
    try {
      // Call the move API to move to TRASH
      await api.post(`/mail/${emailId}/move`, { to: 'TRASH' });

      // Remove the email from current view
      setEmails(prev => prev.filter(email => email.id !== emailId));

      // Clear selection
      setSelectedThreadId(null);

      // Refresh counts to update sidebar
      await fetchCounts();

      console.log(`Moved email ${emailId} to TRASH`);
    } catch (err) {
      console.error('Failed to move to trash:', err);
      alert('Failed to move to trash. Please try again.');
    }
  };

  const handleJoinMeeting = (meeting: any) => {
    if (meeting.meeting_link) {
      // Use embedded VideoCall instead of opening in new tab
      // This avoids the authentication prompts from meet.jit.si web interface
      const displayName = keycloak?.tokenParsed?.preferred_username || 'Guest';

      // Extract room name from meeting link
      let roomName = '';
      const match = meeting.meeting_link.match(/\/([^\/]+)$/);
      if (match) {
        roomName = match[1];
      }

      if (roomName) {
        setActiveVideoCall({
          roomName: roomName,
          displayName: displayName
        });
      } else {
        // Fallback: open in new tab if can't extract room name
        window.open(meeting.meeting_link, '_blank', 'noopener,noreferrer');
      }
    } else {
      // Fallback to embedded mode if no meeting link
      let roomName = meeting.id;
      setActiveVideoCall({
        roomName: roomName,
        displayName: keycloak?.tokenParsed?.preferred_username || 'User'
      });
    }
  };

  const threads = useMemo(() => {
    const groups: { [key: string]: Email[] } = {};
    emails.forEach(email => {
      if (!groups[email.threadId]) {
        groups[email.threadId] = [];
      }
      groups[email.threadId].push(email);
    });
    // Sort emails within each thread by timestamp, newest first
    Object.values(groups).forEach(thread =>
      thread.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
    return groups;
  }, [emails]);

  const displayThreads = useMemo(() => {
    // FIX: Explicitly type `allThreads` to `Email[][]` to fix type inference issues with `Object.values`.
    // This ensures that `thread` parameters in subsequent array methods are correctly typed.
    const allThreads: Email[][] = Object.values(threads);

    // Filter threads based on folder and search query
    const filteredThreads = allThreads
        .filter(thread => {
            // Important folder is a virtual folder showing starred emails from all folders
            if (selectedFolder === 'important') {
                return true;
            }
            const latestMessage = thread[0];
            return latestMessage.folder === selectedFolder;
        })
        .filter(thread => {
            const query = searchQuery.toLowerCase();
            if (!query) return true;
            // Search across all messages in the thread
            return thread.some(email =>
                email.sender.toLowerCase().includes(query) ||
                email.subject.toLowerCase().includes(query) ||
                email.snippet.toLowerCase().includes(query)
            );
        });

    // Separate pinned from unpinned
    const pinnedThreads: Email[][] = [];
    const unpinnedThreads: Email[][] = [];
    filteredThreads.forEach(thread => {
        if (pinnedThreadIds.includes(thread[0].threadId)) {
            pinnedThreads.push(thread);
        } else {
            unpinnedThreads.push(thread);
        }
    });

    // Sort each group independently
    const sortFn = (a: Email[], b: Email[]) => {
        const latestA = a[0];
        const latestB = b[0];
        switch (sortOrder) {
            case 'date-asc':
                return new Date(latestA.timestamp).getTime() - new Date(latestB.timestamp).getTime();
            case 'date-desc':
            default:
                return new Date(latestB.timestamp).getTime() - new Date(latestA.timestamp).getTime();
        }
    };

    pinnedThreads.sort(sortFn);
    unpinnedThreads.sort(sortFn);

    // Return pinned threads first
    return [...pinnedThreads, ...unpinnedThreads];

  }, [threads, selectedFolder, searchQuery, sortOrder, pinnedThreadIds]);

  const selectedThread = selectedThreadId ? threads[selectedThreadId] : null;

  return (
    <div className="h-screen w-screen bg-slate-50 text-slate-800 flex flex-col overflow-hidden">
      <Header keycloak={keycloak} />
      <div className="flex flex-1 overflow-hidden">
        {/* Black Icon Sidebar - Premium Design */}
        <div className="w-[68px] bg-[#0B1220] flex flex-col items-center py-6 flex-shrink-0 h-full border-r border-slate-900/50">
          {/* Darevel Logo */}
          <div className="mb-10">
            <button className="flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform hover:scale-105">
                <path d="M4 4H20V20Z" fill="#2563FF"/>
                <path d="M20 4H24C32.8 4 40 11.2 40 20H20V4Z" fill="#DC2626"/>
                <path d="M20 20H40C40 28.8 32.8 36 24 36H20V20Z" fill="#EAB308"/>
                <path d="M4 20H20V36H4V20Z" fill="#16A34A"/>
              </svg>
            </button>
          </div>

          {/* Main Icons */}
          <div className="flex flex-col items-center flex-1 w-full gap-3 px-2">
            {/* Mail Icon - Active */}
            <div className="relative w-full flex justify-center">
              <button className={`p-3 rounded-2xl transition-all duration-300 ${selectedFolder === 'inbox' ? 'bg-[#2563FF] text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:text-blue-400 hover:bg-slate-800/50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              {folderCounts.inbox > 0 && (
                <span className="absolute -top-1 -right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                  {folderCounts.inbox > 99 ? '99+' : folderCounts.inbox}
                </span>
              )}
            </div>

            {/* Search Icon */}
            <button className="p-3 rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Contacts Icon */}
            <button className="p-3 rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>

            {/* Calendar Icon */}
            <button className="p-3 rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Storage/Folders Icon */}
            <button className="p-3 rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>

            {/* Apps Grid Icon */}
            <button className="p-3 rounded-2xl text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Bottom Section - Theme Toggle */}
          <div className="mt-auto flex flex-col items-center gap-3 pb-2">
            <button className="p-3 text-slate-500 hover:text-blue-400 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
          </div>
        </div>

        <Sidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={(folderId) => {
              setSelectedFolder(folderId);
              setSelectedThreadId(null);
          }}
          onCompose={() => setShowCompose(true)}
          counts={folderCounts}
          onEmailDrop={handleEmailDrop}
        />
        <main className="flex flex-1 overflow-hidden border-l border-slate-200">
          {selectedFolder === 'calendar' ? (
            <div className="flex-1 bg-white">
              <Calendar onJoinMeeting={handleJoinMeeting} refreshTrigger={calendarRefreshTrigger} />
            </div>
          ) : selectedFolder === 'schedule' ? (
            <div className="flex-1 bg-white">
              <ScheduleMeeting
                onJoinMeeting={(data) => {
                  // Use embedded VideoCall instead of opening in new tab
                  setActiveVideoCall(data);
                }}
                onMeetingCreated={() => {
                  // Increment trigger to refresh calendar
                  setCalendarRefreshTrigger(prev => prev + 1);
                  // Switch to calendar view after scheduling
                  setTimeout(() => {
                    setSelectedFolder('calendar');
                  }, 1500);
                }}
              />
            </div>
          ) : (
            <>
              <div className="w-full md:w-[350px] lg:w-[400px] xl:w-[450px] bg-white border-r border-slate-200 flex-shrink-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Loading emails...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full p-4">
                    <div className="text-center">
                      <p className="text-red-500 mb-2">Error loading emails</p>
                      <p className="text-sm text-slate-500">{error}</p>
                    </div>
                  </div>
                ) : (
                  <EmailList
                    threads={displayThreads}
                    selectedThreadId={selectedThreadId}
                    onSelectThread={handleThreadSelect}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    pinnedThreadIds={pinnedThreadIds}
                    onTogglePin={togglePinThread}
                    onStarToggle={handleStarToggle}
                    onMarkAsUnread={handleMarkAsUnread}
                    selectedFolder={selectedFolder}
                  />
                )}
              </div>
              <div className="flex-1 bg-white hidden md:block">
                <EmailDetail
                  thread={selectedThread}
                  onMarkAsUnread={handleMarkAsUnread}
                  onMoveToSpam={handleMoveToSpam}
                  onMoveToTrash={handleMoveToTrash}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Compose
            onClose={() => {
              setShowCompose(false);
              setEditingDraft(null);
            }}
            onSent={() => {
              setShowCompose(false);
              setEditingDraft(null);
              handleEmailSent();
            }}
            draft={editingDraft}
          />
        </div>
      )}

      {activeVideoCall && (
        <VideoCall
          roomName={activeVideoCall.roomName}
          displayName={activeVideoCall.displayName}
          userEmail={keycloak?.tokenParsed?.email}
          keycloakToken={keycloak?.token}
          onClose={() => setActiveVideoCall(null)}
        />
      )}
    </div>
  );
}

export default App;
