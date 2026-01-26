import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCustomerChat, ChatMessage } from '@/hooks/use-chat';

export function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ email: '', name: '' });
  const [hasProvidedInfo, setHasProvidedInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, isConnected, connect, sendMessage, disconnect } = useCustomerChat();

  useEffect(() => {
    if (isOpen && !isConnected) {
      connect();
    }
  }, [isOpen, isConnected, connect]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage(message, customerInfo);
    setMessage('');
  };

  const handleProvideInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerInfo.name.trim()) {
      setHasProvidedInfo(true);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300",
          "gradient-primary hover:shadow-glow",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-background rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-300",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="gradient-primary p-4">
          <h3 className="font-display font-bold text-primary-foreground">Chat with Us</h3>
          <p className="text-sm text-primary-foreground/80">
            {isConnected ? "We're online!" : "Connecting..."}
          </p>
        </div>

        {/* Info Form or Chat */}
        {!hasProvidedInfo ? (
          <form onSubmit={handleProvideInfo} className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Please provide your details to start chatting:
            </p>
            <Input
              placeholder="Your name *"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              type="email"
              placeholder="Email (optional)"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
            />
            <Button type="submit" className="w-full" variant="gradient">
              Start Chat
            </Button>
          </form>
        ) : (
          <>
            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Send a message to start the conversation!
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender_type === 'customer' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2",
                      msg.sender_type === 'customer'
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-background border border-border rounded-bl-md"
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.sender_type === 'customer' ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
                disabled={!isConnected}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="gradient"
                disabled={!isConnected || !message.trim()}
              >
                {isConnected ? (
                  <Send className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
