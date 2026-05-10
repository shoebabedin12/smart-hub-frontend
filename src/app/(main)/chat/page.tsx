'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';
import api from 'app/lib/api';
import Navbar from 'app/components/Navbar';

interface Message {
  sender: 'student' | 'bot';
  text: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Hi! Ask me anything about your course materials.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'student', text: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat/ask', { message: userMsg, session_id: sessionId });
      if (!sessionId) setSessionId(data.session_id);
      setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Server error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col">
        <h1 className="text-xl font-bold text-gray-900 mb-4">AI Academic Assistant</h1>

        {/* Chat area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-y-auto p-4 space-y-3 mb-4" style={{ minHeight: '60vh', maxHeight: '65vh' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm
                ${msg.sender === 'student'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about your course materials..."
            disabled={loading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}