'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export function ParentMessagingEnhanced() {
  const { buttonClasses } = useThemeColor();
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchConversations();
      if (selectedConversation) {
        fetchMessages(selectedConversation.id, true);
      }
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.Messages || []);
        if (!silent) {
          setSelectedConversation(data);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'message');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await sendMessage(data);
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async (attachment?: any) => {
    if ((!newMessage.trim() && !attachment) || !selectedConversation) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage || 'Sent an attachment',
          ...(attachment && {
            attachmentUrl: attachment.url,
            attachmentName: attachment.name,
            attachmentSize: attachment.size,
            attachmentType: attachment.type,
          }),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startEdit = (message: any) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const saveEdit = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        setEditingMessageId(null);
        setEditContent('');
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const archiveConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/archive`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchConversations();
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.Messages[0]?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">Messages</h2>
            {isSupported && (
              <Button
                size="sm"
                variant="outline"
                onClick={isSubscribed ? unsubscribe : subscribe}
              >
                {isSubscribed ? '🔔' : '🔕'}
              </Button>
            )}
          </div>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="overflow-y-auto flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div onClick={() => fetchMessages(conv.id)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{conv.recipientName}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {conv.Messages[0]?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conv.lastMessageAt).toLocaleString()}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    archiveConversation(conv.id);
                  }}
                  className="text-xs text-gray-500 hover:text-red-600 mt-2"
                >
                  Archive
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b bg-white">
              <h2 className="text-xl font-bold">{selectedConversation.recipientName || 'Chat'}</h2>
              <p className="text-sm text-gray-500">
                {selectedConversation.recipientRole === 'TEACHER' ? 'Teacher' : 'Admin'}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === 'PARENT' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.senderRole === 'PARENT'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {editingMessageId === msg.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="bg-white text-black"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(msg.id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-2 underline"
                          >
                            📎 {msg.attachmentName || 'Attachment'}
                          </a>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleString()}
                            {msg.isEdited && ' (edited)'}
                          </p>
                          {msg.senderRole === 'PARENT' && !msg.isDeleted && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(msg)}
                                className="text-xs opacity-70 hover:opacity-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteMessage(msg.id)}
                                className="text-xs opacity-70 hover:opacity-100"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? '⏳' : '📎'}
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message... (Shift+Enter for new line)"
                  className="flex-1"
                />
                <Button onClick={() => sendMessage()} className={buttonClasses} disabled={!newMessage.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
