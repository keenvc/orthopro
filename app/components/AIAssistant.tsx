/**
 * AI Assistant Component
 * Natural language interface for GoHighLevel operations
 */

'use client';

import { useState, useRef, useEffect } from 'react';

interface AIAssistantProps {
  context?: string;
  suggestions?: string[];
  sessionId?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: number;
  timestamp: Date;
}

export default function AIAssistant({
  context,
  suggestions,
  sessionId = 'default'
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askAI = async (question?: string) => {
    const query = question || prompt;
    if (!query.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const fullPrompt = context ? `${context}\n\n${query}` : query;
      
      const res = await fetch('/api/ghl/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          includeHistory: true,
          sessionId
        })
      });

      const data = await res.json();

      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.response,
          toolCalls: data.toolCalls?.length || 0,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `❌ Error: ${data.error}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch(`/api/ghl/ai?sessionId=${sessionId}`, {
        method: 'DELETE'
      });
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-bold">🤖 AI Assistant</h2>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear history
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-4">👋 Hi! I'm your AI assistant.</p>
            <p className="text-sm">I can help you with GoHighLevel data and operations.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-xs opacity-70 mb-1">
                {msg.role === 'user' ? 'You' : 'AI'}
                {msg.toolCalls && msg.toolCalls > 0 && (
                  <span className="ml-2">• {msg.toolCalls} tool{msg.toolCalls > 1 ? 's' : ''} used</span>
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs opacity-50 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions (show when no messages) */}
      {suggestions && messages.length === 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => askAI(sug)}
                disabled={loading}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full disabled:opacity-50 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && askAI()}
            placeholder="Ask about contacts, appointments, payments, or request actions..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={() => askAI()}
            disabled={loading || !prompt.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
