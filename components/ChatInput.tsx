import React from 'react';
import { RippleButton } from './common/RippleButton';
import type { ChatMode } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);


interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    chatMode: ChatMode;
    isVoiceActive: boolean;
    onToggleVoiceSession: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, chatMode, isVoiceActive, onToggleVoiceSession }) => {
    const [message, setMessage] = React.useState('');
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (chatMode !== 'voice' && textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [message, chatMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (trimmedMessage && !isLoading) {
            if (chatMode === 'image' && !trimmedMessage.startsWith('/')) {
                onSendMessage(`/image ${trimmedMessage}`);
            } else {
                onSendMessage(trimmedMessage);
            }
            setMessage('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const placeholderText = {
        text: 'Type your message to EAGOX...',
        image: 'Describe the image you want to create...',
        multimodal: 'Chat with EAGOX... (try /image or /video)',
        voice: 'Start conversation with EAGOX...'
    }[chatMode];

    if (chatMode === 'voice') {
        return (
            <div className="px-4 pb-4 md:px-6 md:pb-6 flex flex-col items-center justify-center pt-2">
                 <RippleButton 
                    onClick={onToggleVoiceSession}
                    className={`w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 text-white ${isVoiceActive ? 'bg-red-500 animate-pulse' : 'bg-lt-brand-primary dark:bg-brand-primary'}`}
                    aria-label={isVoiceActive ? "Stop voice session" : "Start voice session"}
                >
                    <MicrophoneIcon className="w-8 h-8" />
                </RippleButton>
                 <p className="text-xs text-center text-lt-brand-text-secondary dark:text-brand-text-secondary mt-3">
                    {isVoiceActive ? 'EAGOX is listening...' : 'Tap to speak'}
                </p>
            </div>
        );
    }

    return (
        <div className="px-4 pb-4 md:px-6 md:pb-6">
            <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
                 <div className="flex-1 relative">
                    <textarea
                        ref={textAreaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholderText}
                        rows={1}
                        className="w-full py-3 pl-4 pr-12 bg-lt-brand-surface dark:bg-brand-surface text-lt-brand-text dark:text-brand-text rounded-2xl border border-lt-brand-border dark:border-brand-border focus:outline-none focus:ring-2 focus:ring-lt-brand-primary dark:focus:ring-brand-primary resize-none transition-all max-h-40 overflow-y-auto"
                        disabled={isLoading}
                    />
                </div>
                <RippleButton 
                    type="submit" 
                    disabled={isLoading || !message.trim()}
                    className="w-12 h-12 flex items-center justify-center bg-lt-brand-primary dark:bg-brand-primary text-white rounded-full transition-colors duration-200 disabled:bg-lt-brand-text-secondary/50 dark:disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed flex-shrink-0"
                    aria-label="Send message"
                >
                    <SendIcon className="w-6 h-6" />
                </RippleButton>
            </form>
             {chatMode === 'multimodal' && (
                <p className="text-xs text-center text-lt-brand-text-secondary dark:text-brand-text-secondary mt-2">
                    Use <code className="bg-lt-brand-surface dark:bg-brand-surface p-1 rounded-md">/image &lt;prompt&gt;</code> for images and <code className="bg-lt-brand-surface dark:bg-brand-surface p-1 rounded-md">/video &lt;prompt&gt;</code> for videos.
                </p>
             )}
        </div>
    );
};