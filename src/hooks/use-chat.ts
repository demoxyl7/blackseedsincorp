import { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '@/lib/api-config';

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: 'customer' | 'admin';
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatSession {
  id: string;
  customer_email?: string;
  customer_name?: string;
  status: 'active' | 'closed';
  created_at: string;
  last_message_at: string;
  unread_count: number;
}

// Generate or retrieve session ID for customers
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
};

export function useCustomerChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const sessionId = useRef(getOrCreateSessionId());

  const connect = useCallback(() => {
    const wsUrl = API_CONFIG.BASE_URL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/chat/${sessionId.current}`);

    ws.onopen = () => {
      console.log('Chat connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'history') {
        setMessages(data.messages);
      }
    };

    ws.onclose = () => {
      console.log('Chat disconnected');
      setIsConnected(false);
      // Reconnect after 3 seconds
      setTimeout(() => connect(), 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, []);

  const sendMessage = useCallback((message: string, customerInfo?: { email?: string; name?: string }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        message,
        sender_type: 'customer',
        customer_email: customerInfo?.email,
        customer_name: customerInfo?.name,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    connect,
    sendMessage,
    disconnect,
    sessionId: sessionId.current,
  };
}

export function useAdminChat(token: string | null) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!token) return;

    const wsUrl = API_CONFIG.BASE_URL.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/admin/chat?token=${token}`);

    ws.onopen = () => {
      console.log('Admin chat connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'sessions':
          setSessions(data.sessions);
          break;
        case 'new_session':
          setSessions(prev => [data.session, ...prev]);
          break;
        case 'session_messages':
          setMessages(data.messages);
          break;
        case 'new_message':
          if (data.message.session_id === activeSession) {
            setMessages(prev => [...prev, data.message]);
          }
          // Update unread count for sessions
          setSessions(prev => prev.map(s => 
            s.id === data.message.session_id 
              ? { ...s, unread_count: s.unread_count + 1, last_message_at: data.message.created_at }
              : s
          ));
          break;
      }
    };

    ws.onclose = () => {
      console.log('Admin chat disconnected');
      setIsConnected(false);
      setTimeout(() => connect(), 3000);
    };

    wsRef.current = ws;
  }, [token, activeSession]);

  const selectSession = useCallback((sessionId: string) => {
    setActiveSession(sessionId);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_messages',
        session_id: sessionId,
      }));
      // Mark as read
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        session_id: sessionId,
      }));
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, unread_count: 0 } : s
      ));
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && activeSession) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        session_id: activeSession,
        message,
        sender_type: 'admin',
      }));
    }
  }, [activeSession]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    sessions,
    activeSession,
    messages,
    isConnected,
    connect,
    selectSession,
    sendMessage,
    disconnect,
  };
}
