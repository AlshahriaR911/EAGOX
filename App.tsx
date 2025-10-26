
import React, { useState, useEffect, useRef } from 'react';
// Fix: Removed non-exported type 'LiveSession'.
import { Chat, LiveServerMessage } from '@google/genai';

import type { ChatMessage, User, ChatMode } from './types';
import { getCurrentUser, logout } from './services/authService';
import { 
    createChatSession, 
    sendMessageToAI, 
    generateImageFromAI, 
    generateVideoFromAI, 
    editImageWithAI,
    connectLiveSession,
    decode,
    decodeAudioData,
    createBlob,
    EAGOX_CODE_SYSTEM_PROMPT
} from './services/geminiService';

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
    const codeChatRef = useRef<Chat | null>(null);
    const [chatMode, setChatMode] = useState<ChatMode>('multimodal');

    // Voice session state
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    // Fix: Used ReturnType to correctly infer the type of the session promise, as `LiveSession` is not an exported type.
    const sessionPromiseRef = useRef<ReturnType<typeof connectLiveSession> | null>(null);
    const currentTranscriptionRef = useRef({ user: '', model: '' });
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputPlaybackTimeRef = useRef(0);
    const outputAudioSourcesRef = useRef(new Set<AudioBufferSourceNode>());


    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    const [theme, toggleTheme] = useTheme();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setIsGuest(false);
            chatRef.current = createChatSession('gemini-flash'); 
            codeChatRef.current = createChatSession('gemini-flash', EAGOX_CODE_SYSTEM_PROMPT);
        }
        setIsAuthenticating(false);
    }, []);

    // Effect to clean up voice session when mode changes or component unmounts
    useEffect(() => {
        return () => {
            if (isVoiceActive) {
                stopVoiceSession();
            }
        };
    }, [isVoiceActive]);

    const handleModeChange = (newMode: ChatMode) => {
        if (isVoiceActive && newMode !== 'voice') {
            stopVoiceSession();
        }
        setChatMode(newMode);
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsGuest(false);
        chatRef.current = createChatSession('gemini-flash');
        codeChatRef.current = createChatSession('gemini-flash', EAGOX_CODE_SYSTEM_PROMPT);
    };
    
    const handleGuestLogin = () => {
        const guestUser: User = { name: 'Guest', email: 'guest@eagox.ai' };
        setCurrentUser(guestUser);
        setIsGuest(true);
        chatRef.current = createChatSession('gemini-flash');
        codeChatRef.current = createChatSession('gemini-flash', EAGOX_CODE_SYSTEM_PROMPT);
    };

    const handleLogout = () => {
        if (isVoiceActive) stopVoiceSession();
        logout();
        setCurrentUser(null);
        setMessages([]);
        chatRef.current = null;
        codeChatRef.current = null;
        setIsGuest(false);
    };

    const handleSendMessage = async (message: string, image?: { data: string; mimeType: string }) => {
        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            attachment: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
        };
        setMessages(prev => [...prev, userMessage]);

        const imageMatch = message.match(/^\/image\s+(.*)/);
        const videoMatch = message.match(/^\/video\s+(.*)/);

        // Do not process slash commands if an image is attached
        if (image) {
             setIsLoading(true);
             try {
                const activeChat = chatRef.current; // Use the main chat for multimodal
                if (!activeChat) throw new Error("Chat session not initialized.");
                const response = await sendMessageToAI(activeChat, message, image);
                const modelMessage: ChatMessage = { role: 'model', content: response };
                setMessages(prev => [...prev, modelMessage]);
             } catch (error) {
                  const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                  setMessages(prev => [...prev, errorMessage]);
             } finally {
                 setIsLoading(false);
             }
             return;
        }

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
                const activeChat = chatMode === 'code' ? codeChatRef.current : chatRef.current;
                if (!activeChat) throw new Error("Chat session not initialized.");
                const response = await sendMessageToAI(activeChat, message);
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
    
    // --- Voice Session Logic ---

    const startVoiceSession = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;
            setIsVoiceActive(true);

            // FIX: Cast window to `any` to support `webkitAudioContext` for older browsers without TypeScript errors.
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = connectLiveSession({
                onMessage: handleLiveMessage,
                onError: handleLiveError,
                onClose: stopVoiceSession,
            });

            // This must be done after sessionPromise is set
            audioSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromiseRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            audioSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);

        } catch (error) {
            console.error("Failed to start voice session:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Failed to access microphone. Please grant permission and try again. 🍌🎤" };
            setMessages(prev => [...prev, errorMessage]);
            setIsVoiceActive(false);
        }
    };

    const stopVoiceSession = () => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        microphoneStreamRef.current?.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;

        audioSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        audioSourceRef.current = null;
        scriptProcessorRef.current = null;

        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        
        outputAudioSourcesRef.current.forEach(source => source.stop());
        outputAudioSourcesRef.current.clear();
        outputPlaybackTimeRef.current = 0;
        
        setIsVoiceActive(false);
    };

    const handleToggleVoiceSession = () => {
        if (isVoiceActive) {
            stopVoiceSession();
        } else {
            startVoiceSession();
        }
    };

    const handleLiveMessage = async (message: LiveServerMessage) => {
        // Handle transcription
        if (message.serverContent?.inputTranscription) {
            currentTranscriptionRef.current.user += message.serverContent.inputTranscription.text;
        }
        if (message.serverContent?.outputTranscription) {
            currentTranscriptionRef.current.model += message.serverContent.outputTranscription.text;
        }
        if (message.serverContent?.turnComplete) {
            const userText = currentTranscriptionRef.current.user.trim();
            const modelText = currentTranscriptionRef.current.model.trim();
            if(userText) setMessages(prev => [...prev, { role: 'user', content: userText }]);
            if(modelText) setMessages(prev => [...prev, { role: 'model', content: modelText }]);
            currentTranscriptionRef.current = { user: '', model: '' };
        }

        // Handle audio output
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            const audioCtx = outputAudioContextRef.current;
            outputPlaybackTimeRef.current = Math.max(outputPlaybackTimeRef.current, audioCtx.currentTime);

            const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);
            source.addEventListener('ended', () => {
                outputAudioSourcesRef.current.delete(source);
            });
            source.start(outputPlaybackTimeRef.current);
            outputPlaybackTimeRef.current += audioBuffer.duration;
            outputAudioSourcesRef.current.add(source);
        }

        // Handle interruptions
        if (message.serverContent?.interrupted) {
            outputAudioSourcesRef.current.forEach(source => source.stop());
            outputAudioSourcesRef.current.clear();
            outputPlaybackTimeRef.current = 0;
        }
    };

    const handleLiveError = (e: ErrorEvent) => {
        console.error("Voice session error:", e);
        const errorMessage: ChatMessage = { role: 'model', content: "EAGOX voice system encountered an error. 🍌🔧" };
        setMessages(prev => [...prev, errorMessage]);
        stopVoiceSession();
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
    const anyLoading = isLoading || isGeneratingVideo || isVoiceActive;

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
                        onModeChange={handleModeChange}
                        isLoading={anyLoading}
                    />
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isLoading={anyLoading} 
                        chatMode={chatMode}
                        isVoiceActive={isVoiceActive}
                        onToggleVoiceSession={handleToggleVoiceSession}
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
