/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : InboxContext.tsx
 * WHAT THIS FILE DOES : Provides shared admin portal state through React context
 * HOW IT DOES IT      : Uses focused TypeScript and React code for one responsibility
 * DATA SOURCE         : Local props, context, mock data, or user input as applicable
 * DATA DESTINATION    : Admin portal UI, context state, or exported helpers
 * PRINCIPLE APPLIED   : SOLID
 * ============================================================================
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMockAdminData, type NotificationRecord } from '../data/mockAdminService';
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

const toAppNotification = (notification: NotificationRecord): AppNotification => ({
  id: notification.id,
  title: notification.title,
  body: notification.body,
  timestamp: notification.timestamp,
  read: notification.read,
  type: notification.type === 'payment' ? 'payment' : notification.type === 'kyc' ? 'kyc' : 'system',
  link: notification.link,
});

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

    const data = await getMockAdminData();
    setNotifications(data.notifications.map(toAppNotification));
    setConversations([
      {
        id: 'conv-ops-001',
        participantId: 'usr-engineer-001',
        participantName: 'Eric Ndayisaba',
        participantAvatar: '',
        lastMessage: 'Milestone payment request is ready for review.',
        lastMessageTime: '2026-05-24T16:25:00.000Z',
        unreadCount: 1,
        messages: [
          {
            id: 'msg-001',
            senderId: 'usr-engineer-001',
            text: 'Milestone payment request is ready for review.',
            timestamp: '2026-05-24T16:25:00.000Z',
            read: false,
          },
        ],
      },
    ]);
  }, [isAuthenticated]);

  useEffect(() => {
    const loadInbox = async () => {
      await refreshInbox();
    };

    loadInbox();
  }, [refreshInbox]);

  const markConversationRead = useCallback(async (conversationId: string) => {
    setConversations(prev => prev.map(conversation =>
      conversation.id === conversationId
        ? { ...conversation, unreadCount: 0, messages: conversation.messages.map(message => ({ ...message, read: true })) }
        : conversation
    ));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const newMessage: Message = {
      id: `mock-msg-${Date.now()}`,
      senderId: 'me',
      text,
      timestamp: new Date().toISOString(),
      read: true,
    };

    setConversations(prev => prev.map(conversation =>
      conversation.id === conversationId
        ? {
            ...conversation,
            lastMessage: text,
            lastMessageTime: newMessage.timestamp,
            messages: [...conversation.messages, newMessage],
          }
        : conversation
    ));
  }, []);

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
