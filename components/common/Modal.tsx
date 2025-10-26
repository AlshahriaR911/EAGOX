import React, { useEffect } from 'react';
import { CloseIcon } from '../icons/CloseIcon';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="bg-lt-brand-bg-light dark:bg-brand-bg-light w-full max-w-md rounded-xl shadow-2xl border border-lt-brand-border dark:border-brand-border flex flex-col relative"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <header className="flex items-center justify-between p-4 border-b border-lt-brand-border dark:border-brand-border">
                    <h2 id="modal-title" className="text-lg font-semibold text-lt-brand-text dark:text-brand-text">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
