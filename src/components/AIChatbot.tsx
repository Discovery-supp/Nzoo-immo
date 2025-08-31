import React from 'react';
import { APP_CONFIG } from '../config/app.config';
import { AIAssistantService, ChatMessage } from '../services/aiAssistantService';
import { PhoneCall, X } from 'lucide-react';

export const AIChatbot: React.FC = () => {
  if (!APP_CONFIG.aiAssistant.enabled) return null;

  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => {
    const now = Date.now();
    return [{ id: `w_${now}`, role: 'assistant', content: APP_CONFIG.aiAssistant.welcomeMessage, createdAt: now }];
  });
  const [isTyping, setIsTyping] = React.useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const now = Date.now();
    const userMsg: ChatMessage = { id: `u_${now}`, role: 'user', content: text, createdAt: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const resp = await AIAssistantService.sendMessage([...messages, userMsg], text);
    const delay = APP_CONFIG.aiAssistant.typingDelayMs || 300;
    setTimeout(() => {
      setMessages((prev) => [...prev, resp.message]);
      setIsTyping(false);
    }, delay);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          position: 'fixed', right: '16px', bottom: '16px', backgroundColor: '#1e40af', color: '#fff',
          borderRadius: '9999px', padding: '12px 16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', zIndex: 50,
        }}
      >
        {isOpen ? (
          <>
            <X size={18} />
            Fermer
          </>
        ) : (
          <>
            <PhoneCall size={18} />
            Assistant
          </>
        )}
      </button>

      {isOpen && (
        <div
          style={{ position: 'fixed', right: '16px', bottom: '80px', width: '360px', maxWidth: '90vw', maxHeight: '70vh',
            background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', overflow: 'hidden', zIndex: 50 }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', fontWeight: 600 }}>Assistant IA</div>
          <div style={{ padding: '12px', overflowY: 'auto', maxHeight: '44vh' }}>
            {messages.map(m => (
              <div key={m.id} style={{ marginBottom: '10px', display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  background: m.role === 'user' ? '#1e40af' : '#f3f4f6', color: m.role === 'user' ? '#fff' : '#111827',
                  padding: '8px 10px', borderRadius: '10px', maxWidth: '80%'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>L’assistant écrit…</div>
            )}
          </div>
          {!!APP_CONFIG.aiAssistant.quickSuggestions?.length && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {APP_CONFIG.aiAssistant.quickSuggestions.map((s, i) => (
                <button key={i} onClick={() => setInput(s)} style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '6px 10px', background: '#fff' }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={APP_CONFIG.aiAssistant.language === 'fr' ? 'Écrivez votre message…' : 'Type your message…'}
              style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 10px', outline: 'none' }}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            />
            <button onClick={send} style={{ background: '#111827', color: '#fff', borderRadius: '8px', padding: '8px 12px' }}>Envoyer</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;


