import React from 'react';
import type { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    message: ChatMessage;
    userInitial: string;
}

// FIX: Created the ChatMessageComponent to render individual chat messages.
export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, userInitial }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex items-start gap-3 my-4 animate-fade-in-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-lt-brand-secondary dark:bg-brand-secondary flex items-center justify-center text-lt-brand-bg-light dark:text-brand-bg-dark font-bold flex-shrink-0">
                    E
                </div>
            )}

            <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl ${
                isUser 
                ? 'bg-lt-brand-primary dark:bg-brand-primary text-lt-brand-bg-light dark:text-brand-bg-dark rounded-br-none' 
                : 'bg-lt-brand-surface dark:bg-brand-surface text-lt-brand-text dark:text-brand-text rounded-bl-none border border-lt-brand-border dark:border-brand-border'
            }`}>
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.imageUrl && (
                    <img src={message.imageUrl} alt="Generated" className="mt-2 rounded-lg max-w-full h-auto" />
                )}
                {message.videoUrl && (
                    <video src={message.videoUrl} controls className="mt-2 rounded-lg max-w-full h-auto" />
                )}
            </div>

            {isUser && (
                <div className="w-8 h-8 rounded-full bg-lt-brand-primary-light dark:bg-brand-primary-dark flex items-center justify-center text-lt-brand-text dark:text-brand-text font-bold flex-shrink-0">
                    {userInitial}
                </div>
            )}
        </div>
    );
};