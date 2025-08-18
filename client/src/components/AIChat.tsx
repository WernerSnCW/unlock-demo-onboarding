import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIChatProps {
  seedPrompts?: string[];
}

const cannedResponses: Record<string, string> = {
  'tax_allowances': 'For 2025 tax year: EIS £1M, SEIS £200k (increased), VCT £200k, Pension £60k. Always check latest HMRC guidance. This is not advice.',
  'fintech_red_flags': 'Watch for: regulatory delays, customer acquisition cost spikes, late-stage competition from incumbents. Recent FCA crypto rules add complexity. This is not advice.',
  'biotech_trends': 'Strong Series B+ activity, NHS partnerships driving value, AI drug discovery hot. Average 18-month clinical timelines. High risk/reward sector. This is not advice.',
  'default': 'I can help with investment insights, EIS/SEIS updates, and market trends. My responses are general information, not personalized advice. This is not advice.'
};

export default function AIChat({ seedPrompts = [] }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I can help with quick investment intelligence. Try asking about tax allowances, sector trends, or red flags.',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('tax') || lowerPrompt.includes('allowance')) {
      return cannedResponses.tax_allowances;
    }
    if (lowerPrompt.includes('fintech') || lowerPrompt.includes('red flag')) {
      return cannedResponses.fintech_red_flags;
    }
    if (lowerPrompt.includes('biotech') || lowerPrompt.includes('pharma')) {
      return cannedResponses.biotech_trends;
    }
    
    return cannedResponses.default;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSeedPrompt = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] flex flex-col h-[500px]" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--card-foreground)] text-sm">AI Assistant</h3>
            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Online
            </div>
          </div>
        </div>
        
        <button 
          className="text-[var(--muted-foreground)] hover:text-[var(--card-foreground)] transition-colors"
          title="Clear chat"
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.isUser
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-md'
                  : 'bg-[var(--muted)] text-[var(--card-foreground)] rounded-bl-md'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
              <div className="flex items-center justify-end gap-1 mt-2">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.isUser && (
                  <div className="flex">
                    <i className="fas fa-check text-xs opacity-70"></i>
                    <i className="fas fa-check text-xs opacity-70 -ml-1"></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--muted)] text-[var(--card-foreground)] p-3 rounded-2xl rounded-bl-md max-w-[80%]">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs opacity-70 ml-2">AI is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Seed Prompts */}
      {seedPrompts.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {seedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSeedPrompt(prompt)}
                className="text-xs px-2 py-1 bg-[var(--muted)] text-[var(--muted-foreground)] rounded-full hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about investments, EIS, or market trends..."
              className="w-full p-3 pr-10 bg-[var(--background)] border border-[var(--border)] rounded-2xl text-[var(--card-foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
              disabled={isTyping}
              aria-label="Type your message"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl hover:bg-[var(--primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Send message"
          >
            <i className="fas fa-paper-plane text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
}