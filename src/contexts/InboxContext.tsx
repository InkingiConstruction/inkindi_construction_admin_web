/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'kyc' | 'payment' | 'message' | 'system';
  link?: string;
}

interface InboxContextType {
  conversations: Conversation[];
  notifications: AppNotification[];
  totalUnread: number;
  unreadMessages: number;
  unreadNotifications: number;
  markConversationRead: (conversationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, text: string) => void;
  getConversation: (id: string) => Conversation | undefined;
  refreshInbox: () => Promise<void>;
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

const notificationType = (notification: Record<string, any>): AppNotification['type'] => {
  const value = String(notification.channel || notification.data?.type || '').toLowerCase();

  if (value.includes('kyc')) return 'kyc';
  if (value.includes('payment') || value.includes('transaction')) return 'payment';
  if (value.includes('message')) return 'message';
  return 'system';
};

const toAppNotification = (notification: Record<string, any>): AppNotification => ({
  id: notification.id,
  title: notification.title,
  body: notification.body,
  timestamp: notification.createdAt || new Date().toISOString(),
  read: Boolean(notification.readAt || notification.status === 'read'),
  type: notificationType(notification),
  link: '/dashboard/notifications',
});

const toConversations = (messages: Record<string, any>[]): Conversation[] => {
  const grouped = new Map<string, Record<string, any>[]>();

  for (const message of messages) {
    const projectId = message.projectId || message.project?.id || 'project';
    grouped.set(projectId, [...(grouped.get(projectId) || []), message]);
  }

  return [...grouped.entries()].map(([projectId, projectMessages]) => {
    const sorted = [...projectMessages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const lastMessage = sorted[sorted.length - 1];

    return {
      id: projectId,
      participantId: projectId,
      participantName: lastMessage?.project?.name || 'Project conversation',
      participantAvatar: '',
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.createdAt || new Date().toISOString(),
      unreadCount: 0,
      messages: sorted.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        text: message.content,
        timestamp: message.createdAt,
        read: true,
      })),
    };
  });
};

export const InboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const unreadMessages = conversations.reduce((sum, conversation) => sum + conversation.unreadCount, 0);
  const unreadNotifications = notifications.filter(notification => !notification.read).length;
  const totalUnread = unreadMessages + unreadNotifications;

  const refreshInbox = useCallback(async () => {
    if (!isAuthenticated) {
      setConversations([]);
      setNotifications([]);
      return;
    }

    const [notificationsResponse, messagesResponse] = await Promise.all([
      api.get('/api/v1/notifications'),
      api.get('/api/v1/messages'),
    ]);

    setNotifications(notificationsResponse.data.map(toAppNotification));
    setConversations(toConversations(messagesResponse.data));
  }, [isAuthenticated]);

  useEffect(() => {
    refreshInbox().catch(() => {
      setConversations([]);
      setNotifications([]);
    });
  }, [refreshInbox]);

  const markConversationRead = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(conversation =>
      conversation.id === conversationId
        ? { ...conversation, unreadCount: 0, messages: conversation.messages.map(message => ({ ...message, read: true })) }
        : conversation
    ));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await Promise.allSettled(
      notifications
        .filter((notification) => !notification.read)
        .map((notification) =>
          api.put(`/api/v1/notifications/${notification.id}`, { status: 'read' }),
        ),
    );
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, [notifications]);

  const markNotificationRead = useCallback(async (id: string) => {
    await api.put(`/api/v1/notifications/${id}`, { status: 'read' });
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    api.post('/api/v1/messages', {
      projectId: conversationId,
      content: text,
    }).then(() => refreshInbox());
  }, [refreshInbox]);

  const getConversation = useCallback(
    (id: string) => conversations.find(conversation => conversation.id === id || conversation.participantId === id),
    [conversations],
  );

  return (
    <InboxContext.Provider
      value={{
        conversations,
        notifications,
        totalUnread,
        unreadMessages,
        unreadNotifications,
        markConversationRead,
        markAllNotificationsRead,
        markNotificationRead,
        sendMessage,
        getConversation,
        refreshInbox,
      }}
    >
      {children}
    </InboxContext.Provider>
  );
};

export const useInbox = () => {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error('useInbox must be used within an InboxProvider');
  return ctx;
};
