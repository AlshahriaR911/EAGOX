import React from 'react';
import type { ChatMode } from '../types';
import { RippleButton } from './common/RippleButton';

const TextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm1.5-1.5V6h13.5v12H3.75Z" />
    </svg>
);

const MultimodalIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
);


interface ModeSelectorProps {
    currentMode: ChatMode;
    onModeChange: (mode: ChatMode) => void;
    isLoading: boolean;
}

const modes: { id: ChatMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'text', label: 'Text Chat', icon: TextIcon },
    { id: 'image', label: 'Image Gen', icon: ImageIcon },
    { id: 'multimodal', label: 'Both', icon: MultimodalIcon },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange, isLoading }) => {
    
    const getButtonClass = (mode: ChatMode) => {
        const baseClass = "flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
        if (mode === currentMode) {
            return `${baseClass} bg-lt-brand-primary dark:bg-brand-primary text-white shadow`;
        }
        return `${baseClass} bg-lt-brand-surface dark:bg-brand-surface text-lt-brand-text-secondary dark:text-brand-text-secondary hover:bg-lt-brand-border dark:hover:bg-brand-border`;
    };

    return (
        <div className="px-4 md:px-6 pt-4 max-w-4xl mx-auto w-full">
            <div className="p-1.5 bg-lt-brand-bg-light dark:bg-brand-bg-dark rounded-xl border border-lt-brand-border dark:border-brand-border flex items-center gap-1.5">
                {modes.map(({ id, label, icon: Icon }) => (
                    <RippleButton
                        key={id}
                        onClick={() => onModeChange(id)}
                        className={getButtonClass(id)}
                        disabled={isLoading}
                    >
                       <Icon className="w-4 h-4" />
                       <span className="hidden sm:inline">{label}</span>
                    </RippleButton>
                ))}
            </div>
        </div>
    );
};
