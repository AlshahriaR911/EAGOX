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

export const register = (newUser: Omit<Required<User>, 'photoUrl'>): { success: boolean, message: string } => {
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

export const login = (credentials: Omit<Required<User>, 'name' | 'photoUrl'>): { success: boolean, message: string, user?: User } => {
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

export const updateUserProfile = (email: string, updates: Partial<Pick<Required<User>, 'name' | 'photoUrl' | 'password'>>): { success: boolean, message: string, user?: User } => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
    }

    // Update user in the main user list
    const updatedUserInDb = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUserInDb;
    saveUsers(users);

    // Update current session if it's the same user
    const sessionUser = getCurrentUser();
    if (sessionUser && sessionUser.email === email) {
        const { password, ...sessionUpdates } = updates;
        const newSessionUser = { ...sessionUser, ...sessionUpdates };
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSessionUser));
        return { success: true, message: 'Profile updated successfully!', user: newSessionUser };
    }

    return { success: true, message: 'Profile updated successfully!' };
};
