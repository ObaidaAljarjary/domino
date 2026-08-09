import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Language } from '../types/domino';
import { Send, Smile, X, MessageSquare } from 'lucide-react';
import '../styles/chaikhana.css';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSendEmote: (emote: string) => void;
  language: Language;
  myPlayerId: string;
}

const EMOTES = ['☕', '🤔', '😡', '👏', '😂', '🔥', '🎲', '😎'];

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  onSendEmote,
  language,
  myPlayerId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAr = language === 'ar';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleEmote = (emote: string) => {
    onSendEmote(emote);
    setShowEmotes(false);
  };

  if (!isOpen) {
    return (
      <button 
        className="chat-toggle-btn" 
        onClick={() => setIsOpen(true)}
        title={isAr ? 'الدردشة' : 'Chat'}
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className={`chat-box-container ${isAr ? 'rtl' : 'ltr'}`}>
      <div className="chat-box-header">
        <h3>{isAr ? 'دردشة الغرفة' : 'Room Chat'}</h3>
        <button className="icon-btn" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>
      
      <div className="chat-box-messages">
        {messages.length === 0 ? (
          <p className="chat-empty-state">
            {isAr ? 'لا توجد رسائل بعد' : 'No messages yet...'}
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender === myPlayerId;
            return (
              <div key={msg.id} className={`chat-message ${isMine ? 'mine' : 'theirs'}`}>
                {!isMine && <span className="chat-sender">{isAr ? msg.senderAr : msg.sender}</span>}
                <div className="chat-bubble">
                  {isAr ? (msg.textAr || msg.text) : msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-box-input-area">
        <div style={{ position: 'relative' }}>
          <button 
            type="button"
            className="icon-btn emote-btn"
            onClick={() => setShowEmotes(!showEmotes)}
          >
            <Smile size={20} />
          </button>
          
          {showEmotes && (
            <div className="emote-picker">
              {EMOTES.map((em) => (
                <button key={em} type="button" onClick={() => handleEmote(em)}>
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
            className="chat-input"
          />
          <button type="submit" className="icon-btn send-btn" disabled={!inputText.trim()}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
