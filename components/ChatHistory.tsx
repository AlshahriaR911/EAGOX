import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { ChatMessageComponent } from './ChatMessage';

interface ChatHistoryProps {
    messages: ChatMessage[];
    isLoading: boolean;
    isGeneratingVideo: boolean;
    userInitial: string;
}

const LoadingIndicator: React.FC<{ isGeneratingVideo: boolean }> = ({ isGeneratingVideo }) => (
    <div className="flex items-start gap-3 my-4 justify-start">
        <div className="w-8 h-8 rounded-full bg-lt-brand-secondary dark:bg-brand-secondary flex items-center justify-center text-lt-brand-bg-light dark:text-brand-bg-dark font-bold flex-shrink-0 animate-pulse">
            E
        </div>
        <div className="max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl bg-lt-brand-surface dark:bg-brand-surface text-lt-brand-text dark:text-brand-text rounded-bl-none border border-lt-brand-border dark:border-brand-border">
            {isGeneratingVideo ? (
                <p className="text-xs text-lt-brand-text-secondary dark:text-brand-text-secondary">EAGOX is generating your video... this may take a few minutes. 🍌🎬</p>
            ) : (
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-lt-brand-text-secondary dark:bg-brand-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-lt-brand-text-secondary dark:bg-brand-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-lt-brand-text-secondary dark:bg-brand-text-secondary rounded-full animate-bounce"></div>
                </div>
            )}
        </div>
    </div>
);

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, isGeneratingVideo, userInitial }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isGeneratingVideo]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.map((msg, index) => (
                <ChatMessageComponent key={index} message={msg} userInitial={userInitial} />
            ))}
            {(isLoading || isGeneratingVideo) && <LoadingIndicator isGeneratingVideo={isGeneratingVideo}/>}
            <div ref={messagesEndRef} />
        </div>
    );
};