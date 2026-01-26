import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdminChat, ChatSession, ChatMessage } from '@/hooks/use-chat';
import { useAuth } from '@/contexts/AuthContext';

export function AdminChatPanel() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();
  
  const { 
    sessions, 
    activeSession, 
    messages, 
    isConnected, 
    connect, 
    selectSession, 
    sendMessage 
  } = useAdminChat(token);

  useEffect(() => {
    if (token) {
      connect();
    }
  }, [token, connect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(message);
    setMessage('');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString();
  };

  const totalUnread = sessions.reduce((sum, s) => sum + s.unread_count, 0);

  return (
    <div className="bg-background rounded-lg shadow-md border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-display font-semibold text-lg">Customer Chats</h2>
        </div>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread} new
            </span>
          )}
          <span className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-primary" : "bg-muted"
          )} />
        </div>
      </div>

      <div className="flex h-96">
        {/* Sessions List */}
        <div className="w-1/3 border-r border-border overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No active chats
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={cn(
                  "w-full p-3 text-left border-b border-border hover:bg-muted/50 transition-colors",
                  activeSession === session.id && "bg-primary/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[100px]">
                      {session.customer_name || 'Anonymous'}
                    </span>
                  </div>
                  {session.unread_count > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {session.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {session.customer_email || formatDate(session.last_message_at)}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeSession ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender_type === 'admin' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-2",
                        msg.sender_type === 'admin'
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-background border border-border rounded-bl-md"
                      )}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.sender_type === 'admin' ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-border flex gap-2">
                <Input
                  placeholder="Type your reply..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  variant="gradient"
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a chat to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
