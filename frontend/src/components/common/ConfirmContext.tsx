import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleCancel = () => {
    setIsOpen(false);
    resolvePromise?.(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolvePromise?.(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {isOpen && options && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-effect w-full max-w-[400px] overflow-hidden rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  options.variant === 'danger' ? 'bg-red-100 text-red-600' :
                  options.variant === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {options.variant === 'danger' ? <AlertCircle size={24} /> :
                   options.variant === 'warning' ? <AlertCircle size={24} /> :
                   <CheckCircle2 size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-main leading-tight mb-2">
                    {options.title || '确认操作'}
                  </h3>
                  <p className="text-sm text-text-sub leading-relaxed">
                    {options.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-semibold text-text-sub hover:bg-black/5 rounded-xl transition-all"
                >
                  {options.cancelLabel || '取消'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-95 ${
                    options.variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                    options.variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' :
                    'bg-primary hover:bg-primary-light shadow-blue-200'
                  }`}
                >
                  {options.confirmLabel || '确定'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
