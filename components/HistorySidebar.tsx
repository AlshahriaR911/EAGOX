import React from 'react';
import type { ChatSession } from '../types';
import { RippleButton } from './common/RippleButton';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CloseIcon } from './icons/CloseIcon';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectSession: (sessionId: string) => void;
    onDeleteSession: (sessionId: string) => void;
}

const SessionItem: React.FC<{ 
    session: ChatSession, 
    isActive: boolean, 
    onSelect: () => void, 
    onDelete: (e: React.MouseEvent) => void 
}> = ({ session, isActive, onSelect, onDelete }) => {
    const title = session.messages.find(m => m.role === 'user')?.content.substring(0, 40) || 'New Chat';
    
    return (
        <li className={`group relative rounded-lg ${isActive ? 'bg-lt-brand-primary/10 dark:bg-brand-primary/20' : ''}`}>
             <button
                onClick={onSelect}
                className={`w-full text-left p-3 text-sm truncate rounded-lg transition-colors ${
                    isActive
                        ? 'text-lt-brand-primary dark:text-brand-primary font-semibold'
                        : 'text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border'
                }`}
            >
                {title}{session.messages.length === 0 && '...'}
            </button>
            <button
                onClick={onDelete}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary opacity-0 group-hover:opacity-100 hover:bg-lt-brand-border dark:hover:bg-brand-border hover:text-red-500 transition-opacity"
                aria-label="Delete chat session"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </li>
    );
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ isOpen, onClose, sessions, activeSessionId, onNewChat, onSelectSession, onDeleteSession }) => {
    
    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"></div>}

            <aside 
                className={`fixed top-0 left-0 h-full w-72 bg-lt-brand-bg-med dark:bg-brand-bg-light border-r border-lt-brand-border dark:border-brand-border flex flex-col transition-transform duration-300 ease-in-out z-40
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between p-4 border-b border-lt-brand-border dark:border-brand-border">
                    <h2 className="text-lg font-semibold text-lt-brand-text dark:text-brand-text">History</h2>
                    <div className="flex items-center gap-2">
                        <RippleButton onClick={onNewChat} className="flex items-center gap-2 text-sm py-2 px-3 bg-lt-brand-surface dark:bg-brand-surface text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border rounded-lg">
                            <PlusIcon className="w-4 h-4"/>
                            New Chat
                        </RippleButton>
                         <button onClick={onClose} className="p-2 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors" aria-label="Close sidebar">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-2">
                    {sessions.length > 0 ? (
                        <ul className="space-y-1">
                            {sessions.map(session => (
                                <SessionItem 
                                    key={session.id}
                                    session={session}
                                    isActive={session.id === activeSessionId}
                                    onSelect={() => onSelectSession(session.id)}
                                    onDelete={(e) => {
                                        e.stopPropagation();
                                        onDeleteSession(session.id);
                                    }}
                                />
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center text-sm text-lt-brand-text-secondary dark:text-brand-text-secondary py-10 px-4">
                            Your chat history will appear here.
                        </div>
                    )}
                </nav>
            </aside>
        </>
    );
};