import React from 'react';
import { RippleButton } from './common/RippleButton';
import type { ChatMode } from '../types';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';
import { CloseIcon } from './icons/CloseIcon';

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
);


interface ChatInputProps {
    onSendMessage: (message: string, image?: { data: string; mimeType: string }) => void;
    isLoading: boolean;
    chatMode: ChatMode;
    isVoiceActive: boolean;
    onToggleVoiceSession: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, chatMode, isVoiceActive, onToggleVoiceSession }) => {
    const [message, setMessage] = React.useState('');
    const [imagePreview, setImagePreview] = React.useState<{ data: string; mimeType: string; rawUrl: string } | null>(null);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (chatMode !== 'voice' && textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            const scrollHeight = textAreaRef.current.scrollHeight;
            textAreaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [message, chatMode]);

    const handleFileSelect = () => fileInputRef.current?.click();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const rawUrl = reader.result as string;
                const base64String = rawUrl.split(',')[1];
                setImagePreview({ data: base64String, mimeType: file.type, rawUrl });
            };
            reader.readAsDataURL(file);
        }
        if (event.target) {
            event.target.value = '';
        }
    };

    const removeImage = () => {
        setImagePreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if ((trimmedMessage || imagePreview) && !isLoading) {
            onSendMessage(trimmedMessage, imagePreview ? { data: imagePreview.data, mimeType: imagePreview.mimeType } : undefined);
            setMessage('');
            removeImage();
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
        code: 'Describe the code you want to generate...',
        multimodal: 'Type a message or attach an image...',
        voice: 'Start conversation with EAGOX...'
    }[chatMode];

    const canAttachFile = ['text', 'multimodal', 'code'].includes(chatMode);


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
            {imagePreview && (
                <div className="max-w-4xl mx-auto mb-2 relative w-24 h-24 p-1 border border-lt-brand-border dark:border-brand-border rounded-lg">
                    <img src={imagePreview.rawUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button onClick={removeImage} className="absolute -top-2 -right-2 bg-lt-brand-bg-med dark:bg-brand-bg-light rounded-full p-0.5 border border-lt-brand-border dark:border-brand-border text-lt-brand-text-secondary dark:text-brand-text-secondary hover:scale-110 transition-transform">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
                 <div className="flex-1 relative flex items-center">
                    {canAttachFile && (
                        <>
                            <button 
                                type="button" 
                                onClick={handleFileSelect} 
                                className="p-2 text-lt-brand-text-secondary dark:text-brand-text-secondary hover:text-lt-brand-primary dark:hover:text-brand-primary transition-colors disabled:opacity-50"
                                disabled={isLoading}
                                aria-label="Attach file"
                            >
                                <PaperClipIcon className="w-6 h-6" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </>
                    )}
                    <textarea
                        ref={textAreaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholderText}
                        rows={1}
                        className="w-full py-3 pl-2 pr-4 bg-lt-brand-surface dark:bg-brand-surface text-lt-brand-text dark:text-brand-text rounded-2xl border border-lt-brand-border dark:border-brand-border focus:outline-none focus:ring-2 focus:ring-lt-brand-primary dark:focus:ring-brand-primary resize-none transition-all max-h-40 overflow-y-auto"
                        disabled={isLoading}
                    />
                </div>
                <RippleButton 
                    type="submit" 
                    disabled={isLoading || (!message.trim() && !imagePreview)}
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