import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

type MessageType = 'success' | 'error' | 'info';

interface Message {
  id: string;
  type: MessageType;
  text: string;
  duration?: number;
}

interface MessageContextType {
  success: (text: string, duration?: number) => void;
  error: (text: string, duration?: number) => void;
  info: (text: string, duration?: number) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((type: MessageType, text: string, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, type, text, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeMessage(id);
      }, duration);
    }
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const success = (text: string, duration?: number) => addMessage('success', text, duration);
  const error = (text: string, duration?: number) => addMessage('error', text, duration);
  const info = (text: string, duration?: number) => addMessage('info', text, duration);

  return (
    <MessageContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-3 pointer-events-none">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                glass-effect min-w-[280px] px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl border
                ${msg.type === 'success' ? 'bg-white/80 border-green-100' : 
                  msg.type === 'error' ? 'bg-white/80 border-red-100' : 
                  'bg-white/80 border-blue-100'}
              `}>
                <div className={`flex-shrink-0 ${
                  msg.type === 'success' ? 'text-green-500' : 
                  msg.type === 'error' ? 'text-red-500' : 
                  'text-primary'
                }`}>
                  {msg.type === 'success' && <CheckCircle2 size={20} />}
                  {msg.type === 'error' && <AlertCircle size={20} />}
                  {msg.type === 'info' && <Info size={20} />}
                </div>
                
                <span className="text-sm font-semibold text-text-main flex-1">
                  {msg.text}
                </span>

                <button 
                  onClick={() => removeMessage(msg.id)}
                  className="text-text-sub/40 hover:text-text-sub transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};
