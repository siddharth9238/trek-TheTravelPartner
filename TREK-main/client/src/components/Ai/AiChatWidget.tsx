import { Bot, Maximize2, MessageCircle, Minimize2, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useTranslation } from '../../i18n';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatProps {
  tripId?: number;
  tripTitle?: string;
}

export default function AiChatWidget({ tripId, tripTitle }: AiChatProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: input,
          tripId,
          history: messages.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let messageAdded = false;

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                if (!messageAdded) {
                  setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
                  messageAdded = true;
                }
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMsg = newMessages[newMessages.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content = assistantContent;
                  }
                  return newMessages;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      if (!messageAdded) {
        setMessages((prev) => [...prev, { role: 'assistant', content: t('ai.error') }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('ai.error') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 rounded-full bg-accent p-3 text-accent-text shadow-lg transition-opacity hover:opacity-90"
        aria-label={t('ai.chat.title')}
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-20 right-4 z-50 flex flex-col rounded-lg border border-edge bg-surface-card shadow-xl transition-all duration-200 ${
        isMinimized ? 'h-14 w-64' : 'h-96 w-80'
      }`}
    >
      <div className="flex items-center justify-between rounded-t-lg border-b border-edge bg-surface-tertiary p-3">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-accent" />
          <span className="text-sm font-semibold">{t('ai.chat.title')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-surface-muted rounded p-1">
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:bg-surface-muted rounded p-1">
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="max-h-80 flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="mt-4 text-center text-sm text-content-faint">{t('ai.chat.placeholder')}</div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-2 text-sm ${
                    msg.role === 'user' ? 'bg-accent text-accent-text' : 'bg-surface-tertiary text-content'
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                    components={{
                      p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="mb-1 last:mb-0">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-1 last:mb-0">{children}</ol>,
                      li: ({ children }) => <li className="mb-0.5">{children}</li>,
                      code: ({ children }) => (
                        <code className="bg-surface-muted rounded px-1 py-0.5 text-xs">{children}</code>
                      ),
                    }}
                  >
                    {msg.content || '*'}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-edge p-3">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('ai.chat.placeholder')}
                disabled={isLoading}
                className="flex-1 rounded border border-edge bg-surface px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded bg-accent p-1.5 text-accent-text transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
