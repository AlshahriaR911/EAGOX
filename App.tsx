import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';

import type { ChatMessage, User, ChatMode } from './types';
import { getCurrentUser, logout } from './services/authService';
import { createChatSession, sendMessageToAI, generateImageFromAI, generateVideoFromAI, editImageWithAI } from './services/geminiService';

import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Header } from './components/Header';
import { ChatHistory } from './components/ChatHistory';
import { ChatInput } from './components/ChatInput';
import { UserProfile } from './components/UserProfile';
import { AboutModal } from './components/AboutModal';
import { useTheme } from './hooks/useTheme';
import { ModeSelector } from './components/ModeSelector';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [view, setView] = useState<'login' | 'signup'>('login');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const [chatMode, setChatMode] = useState<ChatMode>('multimodal');

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    const [theme, toggleTheme] = useTheme();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setIsGuest(false);
            chatRef.current = createChatSession('gemini-flash'); 
        }
        setIsAuthenticating(false);
    }, []);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsGuest(false);
        chatRef.current = createChatSession('gemini-flash');
    };
    
    const handleGuestLogin = () => {
        const guestUser: User = { name: 'Guest', email: 'guest@eagox.ai' };
        setCurrentUser(guestUser);
        setIsGuest(true);
        chatRef.current = createChatSession('gemini-flash');
    };

    const handleLogout = () => {
        logout();
        setCurrentUser(null);
        setMessages([]);
        chatRef.current = null;
        setIsGuest(false);
    };

    const handleSendMessage = async (message: string) => {
        const userMessage: ChatMessage = { role: 'user', content: message };
        setMessages(prev => [...prev, userMessage]);

        const imageMatch = message.match(/^\/image\s+(.*)/);
        const videoMatch = message.match(/^\/video\s+(.*)/);

        if (imageMatch) {
            setIsLoading(true);
            try {
                const prompt = imageMatch[1];
                const base64Image = await generateImageFromAI(prompt);
                const modelMessage: ChatMessage = {
                    role: 'model',
                    content: `Here is the image you requested for: "${prompt}"`,
                    imageUrl: `data:image/png;base64,${base64Image}`
                };
                setMessages(prev => [...prev, modelMessage]);
            } catch (error) {
                 const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                 setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        } else if (videoMatch) {
            setIsGeneratingVideo(true);
            try {
                const prompt = videoMatch[1];
                const videoUrl = await generateVideoFromAI(prompt);
                const modelMessage: ChatMessage = {
                    role: 'model',
                    content: `Here is the video you requested for: "${prompt}"`,
                    videoUrl: videoUrl
                };
                setMessages(prev => [...prev, modelMessage]);
            } catch (error) {
                 const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                 setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsGeneratingVideo(false);
            }
        } else {
            setIsLoading(true);
            try {
                if (!chatRef.current) throw new Error("Chat session not initialized.");
                const response = await sendMessageToAI(chatRef.current, message);
                const modelMessage: ChatMessage = { role: 'model', content: response };
                setMessages(prev => [...prev, modelMessage]);
            } catch (error) {
                 const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                 setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    if (isAuthenticating) {
        return <div className="min-h-screen bg-lt-brand-bg-light dark:bg-brand-bg-dark" />;
    }

    if (!currentUser) {
        return view === 'login' ? (
            <Login 
                onLoginSuccess={handleLogin} 
                onSwitchToSignup={() => setView('signup')} 
                onGuestLogin={handleGuestLogin}
            />
        ) : (
            <Signup onSignupSuccess={handleLogin} onSwitchToLogin={() => setView('login')} />
        );
    }

    const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G';

    return (
        <div className="flex flex-col h-screen bg-lt-brand-bg-light dark:bg-brand-bg-dark font-sans">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                onLogout={handleLogout}
                onProfileClick={() => setIsProfileOpen(true)}
                onAboutClick={() => setIsAboutOpen(true)}
                userInitial={userInitial}
                isGuest={isGuest}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
                <ChatHistory messages={messages} isLoading={isLoading} isGeneratingVideo={isGeneratingVideo} userInitial={userInitial} />
                <div className="border-t border-lt-brand-border dark:border-brand-border bg-lt-brand-bg-med dark:bg-brand-bg-dark">
                    <ModeSelector 
                        currentMode={chatMode}
                        onModeChange={setChatMode}
                        isLoading={isLoading || isGeneratingVideo}
                    />
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading || isGeneratingVideo} 
                        chatMode={chatMode} 
                    />
                </div>
            </main>
            
            {isProfileOpen && currentUser && !isGuest && (
                <UserProfile user={currentUser} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            )}
            
            {isAboutOpen && (
                <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
            )}
        </div>
    );
};

export default App;