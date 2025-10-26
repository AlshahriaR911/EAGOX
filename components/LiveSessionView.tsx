import React from 'react';
import type { ChatMessage } from '../types';

interface LiveSessionViewProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    messages: ChatMessage[];
    isSessionActive: boolean;
}

export const LiveSessionView: React.FC<LiveSessionViewProps> = ({ videoRef, messages, isSessionActive }) => {
    // Filter to show only the last few messages for clarity
    const recentMessages = messages.slice(-4);

    return (
        <div className="w-full h-full bg-black relative flex items-center justify-center">
            <video 
                ref={videoRef} 
                muted 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]" // Mirror view
            />
            {!isSessionActive && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white/80 text-lg font-medium">Press the video button to start live session</p>
                </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 md:p-6 flex flex-col justify-end">
                <div className="max-w-4xl mx-auto w-full space-y-2">
                    {recentMessages.map((msg, index) => (
                        <div key={index} className={`flex animate-fade-in-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <p className={`max-w-[75%] px-3 py-1.5 rounded-2xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-brand-primary text-white rounded-br-none' 
                                : 'bg-brand-surface/80 backdrop-blur-sm text-brand-text rounded-bl-none'
                            }`}>
                                {msg.content}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};