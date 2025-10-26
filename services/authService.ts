import type { User } from '../types';

const USERS_KEY = 'eagox_users';
const SESSION_KEY = 'eagox_session';

// Helper to get users from localStorage
const getUsers = (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = (newUser: Required<User>): { success: boolean, message: string } => {
    const users = getUsers();
    const userExists = users.some(user => user.email === newUser.email);

    if (userExists) {
        return { success: false, message: 'An account with this email already exists.' };
    }
    
    // In a real app, you would hash the password here.
    // For this simulation, we store it as is, but remove it for the session.
    users.push(newUser);
    saveUsers(users);

    // Automatically log the user in after registration
    const { password, ...userToSaveInSession } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userToSaveInSession));

    return { success: true, message: 'Registration successful!' };
};

export const login = (credentials: Omit<Required<User>, 'name'>): { success: boolean, message: string, user?: User } => {
    const users = getUsers();
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);

    if (!user) {
        return { success: false, message: 'Invalid email or password.' };
    }
    
    const { password, ...userToSaveInSession } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userToSaveInSession));

    return { success: true, message: 'Login successful!', user: userToSaveInSession };
};

export const logout = (): void => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
        return JSON.parse(session);
    } catch (error) {
        console.error("Failed to parse user session", error);
        return null;
    }
};