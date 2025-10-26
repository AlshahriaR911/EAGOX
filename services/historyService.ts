import type { ChatSession } from '../types';

const HISTORY_KEY = 'eagox_chat_history';

// Helper to get history from localStorage
export const loadHistory = (): ChatSession[] => {
    const historyJSON = localStorage.getItem(HISTORY_KEY);
    if (!historyJSON) return [];
    try {
        const history = JSON.parse(historyJSON) as ChatSession[];
        // Sort by most recent
        return history.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Failed to parse chat history", error);
        return [];
    }
};

// Helper to save history to localStorage
export const saveHistory = (sessions: ChatSession[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
};

// Update a specific session or add it if it doesn't exist
export const upsertSession = (session: ChatSession): ChatSession[] => {
    let history = loadHistory();
    const existingIndex = history.findIndex(s => s.id === session.id);

    if (existingIndex > -1) {
        history[existingIndex] = session;
    } else {
        // Add new session to the beginning
        history = [session, ...history];
    }
    
    const sortedHistory = history.sort((a, b) => b.createdAt - a.createdAt);
    saveHistory(sortedHistory);
    return sortedHistory;
};

// Delete a session
export const deleteSession = (sessionId: string): ChatSession[] => {
    const history = loadHistory();
    const updatedHistory = history.filter(s => s.id !== sessionId);
    saveHistory(updatedHistory);
    return updatedHistory.sort((a, b) => b.createdAt - a.createdAt);
};
