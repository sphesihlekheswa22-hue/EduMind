"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import NotificationBell from '@/components/NotificationBell';

interface Message {
  id: number;
  senderId: string;
  receiverId: string;
  courseId?: number;
  subject: string;
  content: string;
  isRead: boolean;
  isAnnouncement: boolean;
  createdAt: string;
  senderName?: string;
  senderRole?: string;
  receiverName?: string;
  receiverRole?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ receiverId: '', subject: '', content: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, folder]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      if (!data.user) {
        router.push('/login');
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?folder=${folder}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(composeData),
      });
      const data = await res.json();

      if (res.ok) {
        alert('Message sent successfully!');
        setShowCompose(false);
        setComposeData({ receiverId: '', subject: '', content: '' });
        fetchMessages();
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <DashboardSidebar 
        role={user.role as 'student' | 'teacher' | 'admin'} 
        userName={user.name}
        userEmail={user.email}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-semibold text-white hidden lg:block">Messages</h1>
          
          <div className="flex items-center gap-4">
            <NotificationBell userId={user.id} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-4">
            <button
              onClick={() => setShowCompose(true)}
              className="w-full py-3 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Compose
            </button>

            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2">
              <button
                onClick={() => setFolder('inbox')}
                className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-colors ${
                  folder === 'inbox' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Inbox
              </button>
              <button
                onClick={() => setFolder('sent')}
                className={`w-full px-4 py-2 rounded-lg text-left font-medium transition-colors ${
                  folder === 'sent' 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sent
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-slate-400 text-lg">No messages</p>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-indigo-500/50 transition-all cursor-pointer ${
                      !message.isRead ? 'border-l-4 border-l-indigo-500' : ''
                    }`}
                    onClick={() => !message.isRead && folder === 'inbox' && handleMarkAsRead(message.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-400">
                            {folder === 'inbox' ? message.senderName : message.receiverName}
                          </span>
                          {message.isAnnouncement && (
                            <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 rounded">Announcement</span>
                          )}
                        </div>
                        <h3 className="text-white font-medium mb-1">{message.subject || 'No subject'}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2">{message.content}</p>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">New Message</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">To (Teacher Email)</label>
                <input
                  type="email"
                  required
                  value={composeData.receiverId}
                  onChange={(e) => setComposeData({ ...composeData, receiverId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="teacher@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Write your message..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
