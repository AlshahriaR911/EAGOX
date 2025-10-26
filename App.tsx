
import React, { useState, useEffect, useRef } from 'react';
// Fix: Removed non-exported type 'LiveSession'.
import { Chat, LiveServerMessage } from '@google/genai';

import type { ChatMessage, User, ChatMode, ChatSession } from './types';
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
import { loadHistory, upsertSession, deleteSession } from './services/historyService';

import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Header } from './components/Header';
import { ChatHistory } from './components/ChatHistory';
import { ChatInput } from './components/ChatInput';
import { ProfilePage } from './components/ProfilePage';
import { AboutModal } from './components/AboutModal';
import { useTheme } from './hooks/useTheme';
import { ModeSelector } from './components/ModeSelector';
import { LiveSessionView } from './components/LiveSessionView';
import { LiveSessionControls } from './components/LiveSessionControls';
import { HistorySidebar } from './components/HistorySidebar';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');
    const [appView, setAppView] = useState<'chat' | 'profile'>('chat');


    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const codeChatRef = useRef<Chat | null>(null);
    const [chatMode, setChatMode] = useState<ChatMode>('multimodal');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);


    // Live session state
    const [isSessionActive, setIsSessionActive] = useState(false);
    const sessionPromiseRef = useRef<ReturnType<typeof connectLiveSession> | null>(null);
    const currentTranscriptionRef = useRef({ user: '', model: '' });
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputPlaybackTimeRef = useRef(0);
    const outputAudioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameIntervalRef = useRef<number | null>(null);

    const [isAboutOpen, setIsAboutOpen] = useState(false);

    const [theme, toggleTheme] = useTheme();

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
            setIsGuest(user.email === 'guest@eagox.ai');
            chatRef.current = createChatSession('gemini-flash'); 
            codeChatRef.current = createChatSession('gemini-flash', EAGOX_CODE_SYSTEM_PROMPT);
            const loadedHistory = loadHistory();
            setChatHistory(loadedHistory);
            if (loadedHistory.length > 0) {
                setActiveSessionId(loadedHistory[0].id);
            } else {
                handleNewChat();
            }
        }
        setIsAuthenticating(false);
    }, []);
    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        return () => {
            if (isSessionActive) {
                stopSession();
            }
        };
    }, [isSessionActive]);

    const handleModeChange = (newMode: ChatMode) => {
        if (isSessionActive && newMode !== 'voice' && newMode !== 'live') {
            stopSession();
        }
        setChatMode(newMode);
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setIsGuest(false);
        setAppView('chat');
        chatRef.current = createChatSession('gemini-flash');
        codeChatRef.current = createChatSession('gemini-flash', EAGOX_CODE_SYSTEM_PROMPT);
        const loadedHistory = loadHistory();
        setChatHistory(loadedHistory);
        setActiveSessionId(loadedHistory[0]?.id || null);
    };
    
    const handleGuestLogin = () => {
        const guestUser: User = { name: 'Guest', email: 'guest@eagox.ai' };
        setCurrentUser(guestUser);
        setIsGuest(true);
        setAppView('chat');
        chatRef.current = createChatSession('gemini-flash');
        codeChatRef.current = createChatSession('gemini-flash', EAGOX_CODE_SYSTEM_PROMPT);
        handleNewChat(); // Start with a fresh chat for guest
    };

    const handleLogout = () => {
        if (isSessionActive) stopSession();
        logout();
        setCurrentUser(null);
        setChatHistory([]);
        setActiveSessionId(null);
        chatRef.current = null;
        codeChatRef.current = null;
        setIsGuest(false);
    };
    
    const handleProfileUpdate = (updatedUser: User) => {
        setCurrentUser(updatedUser);
        setTimeout(() => { // Delay returning to chat to allow toast to be seen
            setAppView('chat');
        }, 1500);
    };

    const updateActiveSession = (messages: ChatMessage[]) => {
        if (!activeSessionId) return;
        const currentSession = chatHistory.find(s => s.id === activeSessionId);
        if (currentSession) {
            const updatedSession = { ...currentSession, messages };
            const newHistory = upsertSession(updatedSession);
            setChatHistory(newHistory);
        }
    };
    
    const handleNewChat = () => {
        const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            messages: [],
            createdAt: Date.now(),
        };
        const newHistory = upsertSession(newSession);
        setChatHistory(newHistory);
        setActiveSessionId(newSession.id);
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleSelectSession = (sessionId: string) => {
        setActiveSessionId(sessionId);
        if (window.innerWidth <= 768) {
            setIsSidebarOpen(false);
        }
    };

    const handleDeleteSession = (sessionId: string) => {
        const newHistory = deleteSession(sessionId);
        setChatHistory(newHistory);
        if (activeSessionId === sessionId) {
            setActiveSessionId(newHistory[0]?.id || null);
            if (!newHistory[0]) {
                handleNewChat();
            }
        }
    };

    const handleSendMessage = async (message: string, image?: { data: string; mimeType: string }) => {
        if (!activeSessionId) return;
        
        const currentMessages = chatHistory.find(s => s.id === activeSessionId)?.messages || [];

        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            attachment: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
        };
        updateActiveSession([...currentMessages, userMessage]);

        const imageMatch = message.match(/^\/image\s+(.*)/);
        const videoMatch = message.match(/^\/video\s+(.*)/);

        if (image) {
             setIsLoading(true);
             try {
                const activeChat = chatRef.current;
                if (!activeChat) throw new Error("Chat session not initialized.");
                const response = await sendMessageToAI(activeChat, message, image);
                const modelMessage: ChatMessage = { role: 'model', content: response };
                updateActiveSession([...currentMessages, userMessage, modelMessage]);
             } catch (error) {
                  const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                  updateActiveSession([...currentMessages, userMessage, errorMessage]);
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
                updateActiveSession([...currentMessages, userMessage, modelMessage]);
            } catch (error) {
                 const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                 updateActiveSession([...currentMessages, userMessage, errorMessage]);
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
                updateActiveSession([...currentMessages, userMessage, modelMessage]);
            } catch (error) {
                 const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                 updateActiveSession([...currentMessages, userMessage, errorMessage]);
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
                updateActiveSession([...currentMessages, userMessage, modelMessage]);
            } catch (error) {
                 const errorMessage: ChatMessage = { role: 'model', content: error instanceof Error ? error.message : 'An unknown error occurred.' };
                 updateActiveSession([...currentMessages, userMessage, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    // --- Live Session Logic ---
    const startSession = async () => {
        try {
            const isLiveMode = chatMode === 'live';
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isLiveMode });
            microphoneStreamRef.current = stream;
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            if (isLiveMode && videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Video play failed:", e));

                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        frameIntervalRef.current = window.setInterval(() => {
                            if (video.readyState >= 2) {
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                                canvas.toBlob(
                                    async (blob) => {
                                        if (blob) {
                                            const base64Data = await blobToBase64(blob);
                                            sessionPromiseRef.current?.then((session) => {
                                              session.sendRealtimeInput({
                                                media: { data: base64Data, mimeType: 'image/jpeg' }
                                              });
                                            });
                                        }
                                    },
                                    'image/jpeg',
                                    0.8 
                                );
                            }
                        }, 250);
                    }
                }
            }

            sessionPromiseRef.current = connectLiveSession({
                onMessage: handleLiveMessage,
                onError: handleLiveError,
                onClose: stopSession,
            });

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
            
            setIsSessionActive(true);

        } catch (error) {
            console.error("Failed to start session:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Failed to access microphone/camera. Please grant permission and try again. 🍌🎤" };
            updateActiveSession([...activeSessionMessages, errorMessage]);
            setIsSessionActive(false);
        }
    };

    const stopSession = () => {
        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        microphoneStreamRef.current?.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;

        if (frameIntervalRef.current) {
            clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

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
        
        setIsSessionActive(false);
    };

    const handleToggleSession = () => {
        if (isSessionActive) {
            stopSession();
        } else {
            startSession();
        }
    };

    const handleLiveMessage = async (message: LiveServerMessage) => {
        const currentMessages = chatHistory.find(s => s.id === activeSessionId)?.messages || [];
        if (message.serverContent?.inputTranscription) {
            currentTranscriptionRef.current.user += message.serverContent.inputTranscription.text;
        }
        if (message.serverContent?.outputTranscription) {
            currentTranscriptionRef.current.model += message.serverContent.outputTranscription.text;
        }
        if (message.serverContent?.turnComplete) {
            const userText = currentTranscriptionRef.current.user.trim();
            const modelText = currentTranscriptionRef.current.model.trim();
            let newMessages: ChatMessage[] = [];
            if(userText) newMessages.push({ role: 'user', content: userText });
            if(modelText) newMessages.push({ role: 'model', content: modelText });
            if (newMessages.length > 0) {
                 updateActiveSession([...currentMessages, ...newMessages]);
            }
            currentTranscriptionRef.current = { user: '', model: '' };
        }

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

        if (message.serverContent?.interrupted) {
            outputAudioSourcesRef.current.forEach(source => source.stop());
            outputAudioSourcesRef.current.clear();
            outputPlaybackTimeRef.current = 0;
        }
    };

    const handleLiveError = (e: ErrorEvent) => {
        console.error("Live session error:", e);
        const errorMessage: ChatMessage = { role: 'model', content: "EAGOX live system encountered an error. 🍌🔧" };
        updateActiveSession([...activeSessionMessages, errorMessage]);
        stopSession();
    };


    if (isAuthenticating) {
        return <div className="min-h-screen bg-lt-brand-bg-light dark:bg-brand-bg-dark" />;
    }

    if (!currentUser) {
        return authView === 'login' ? (
            <Login 
                onLoginSuccess={handleLogin} 
                onSwitchToSignup={() => setAuthView('signup')} 
                onGuestLogin={handleGuestLogin}
            />
        ) : (
            <Signup onSignupSuccess={handleLogin} onSwitchToLogin={() => setAuthView('login')} />
        );
    }
    
    const activeSessionMessages = chatHistory.find(s => s.id === activeSessionId)?.messages || [];
    const anyLoading = isLoading || isGeneratingVideo || (isSessionActive && chatMode === 'voice');

    const ChatView = () => (
        <div className="flex flex-1 overflow-hidden">
             <HistorySidebar 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                sessions={chatHistory}
                activeSessionId={activeSessionId}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
            />
            <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
                {chatMode === 'live' ?
                    <LiveSessionView videoRef={videoRef} messages={activeSessionMessages} isSessionActive={isSessionActive} /> :
                    <ChatHistory messages={activeSessionMessages} isLoading={isLoading} isGeneratingVideo={isGeneratingVideo} userInitial={currentUser.name.charAt(0).toUpperCase()} />
                }
                <div className="border-t border-lt-brand-border dark:border-brand-border bg-lt-brand-bg-med dark:bg-brand-bg-dark">
                    <ModeSelector 
                        currentMode={chatMode}
                        onModeChange={handleModeChange}
                        isLoading={isSessionActive}
                    />
                    {chatMode === 'live' ? (
                        <LiveSessionControls 
                            isSessionActive={isSessionActive} 
                            onToggleSession={handleToggleSession} 
                        />
                    ) : (
                        <ChatInput 
                            onSendMessage={handleSendMessage} 
                            isLoading={anyLoading} 
                            chatMode={chatMode}
                            isSessionActive={isSessionActive && chatMode === 'voice'}
                            onToggleSession={handleToggleSession}
                        />
                    )}
                </div>
            </main>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-lt-brand-bg-light dark:bg-brand-bg-dark font-sans">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                onLogout={handleLogout}
                onProfileClick={() => setAppView('profile')}
                onAboutClick={() => setIsAboutOpen(true)}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                user={currentUser}
                isGuest={isGuest}
            />
            {appView === 'chat' ? (
                 <ChatView />
            ) : (
                <ProfilePage 
                    user={currentUser} 
                    onProfileUpdate={handleProfileUpdate} 
                    onBack={() => setAppView('chat')} 
                />
            )}
            
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {isAboutOpen && (
                <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
            )}
        </div>
    );
};

export default App;
