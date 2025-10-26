
import React from 'react';
import type { User } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { MenuIcon } from './icons/MenuIcon';

// FIX: Inlined missing icon components as they were not provided.
const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0-3-3m0 0 3-3m-3 3H9" />
    </svg>
);


interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onLogout: () => void;
    onProfileClick: () => void;
    onAboutClick: () => void;
    onToggleSidebar: () => void;
    user: User;
    isGuest: boolean;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onLogout, onProfileClick, onAboutClick, onToggleSidebar, user, isGuest }) => {
    return (
        <header className="relative p-4 md:px-6 border-b border-lt-brand-border dark:border-brand-border bg-lt-brand-bg-med dark:bg-brand-bg-dark flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-2">
                 <button onClick={onToggleSidebar} className="p-2 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors" aria-label="Toggle history sidebar">
                    <MenuIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <h1 className="text-2xl font-bold font-roba text-lt-brand-text dark:text-brand-text">EAGOX</h1>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={toggleTheme} className="p-2 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors" aria-label="Toggle theme">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>
                 <button onClick={onAboutClick} className="p-2 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors" aria-label="About EAGOX">
                    <InfoIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={onProfileClick} 
                    className="p-2 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    aria-label="View profile"
                    disabled={isGuest}
                >
                    <UserIcon className="w-5 h-5" />
                </button>
                 <button onClick={onLogout} className="p-2 rounded-full text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border transition-colors" aria-label="Logout">
                    <LogoutIcon className="w-5 h-5" />
                </button>
                 <div className="w-8 h-8 rounded-full bg-lt-brand-primary-light dark:bg-brand-primary-dark flex items-center justify-center text-lt-brand-text dark:text-brand-text font-bold text-sm ml-2 overflow-hidden">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                         user.name.charAt(0).toUpperCase()
                    )}
                </div>
            </div>
        </header>
    );
};
