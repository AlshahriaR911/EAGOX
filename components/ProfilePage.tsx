import React, { useState, useRef } from 'react';
import type { User } from '../types';
import { updateUserProfile } from '../services/authService';
import { RippleButton } from './common/RippleButton';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CameraIcon } from './icons/CameraIcon';

interface ProfilePageProps {
    user: User;
    onProfileUpdate: (updatedUser: User) => void;
    onBack: () => void;
}

const Toast: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => (
    <div className={`fixed bottom-5 right-5 px-4 py-2 rounded-lg shadow-lg text-white animate-fade-in-slide-up ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
        {message}
    </div>
);


export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onProfileUpdate, onBack }) => {
    const [name, setName] = useState(user.name);
    const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl || null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            showNotification("Passwords do not match.", 'error');
            return;
        }

        setIsLoading(true);

        const updates: Partial<Pick<Required<User>, 'name' | 'photoUrl' | 'password'>> = {};

        if (name !== user.name) {
            updates.name = name;
        }
        if (photoPreview && photoPreview !== user.photoUrl) {
            updates.photoUrl = photoPreview;
        }
        if (password) {
            updates.password = password;
        }

        if (Object.keys(updates).length === 0) {
            showNotification("No changes to save.", 'error');
            setIsLoading(false);
            return;
        }

        const result = updateUserProfile(user.email, updates);

        if (result.success && result.user) {
            onProfileUpdate(result.user);
            showNotification(result.message, 'success');
        } else {
            showNotification(result.message, 'error');
        }

        setIsLoading(false);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-lt-brand-bg-light dark:bg-brand-bg-dark text-lt-brand-text dark:text-brand-text p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
                <header className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-lt-brand-border dark:hover:bg-brand-border mr-4">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold">Edit Profile</h1>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 bg-lt-brand-bg-med dark:bg-brand-bg-light p-8 rounded-2xl border border-lt-brand-border dark:border-brand-border">
                    {/* Profile Photo */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-32 h-32">
                            <img
                                src={photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-lt-brand-border dark:border-brand-border"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2 bg-lt-brand-primary dark:bg-brand-primary text-white rounded-full hover:bg-lt-brand-primary-dark dark:hover:bg-brand-primary-dark transition-colors"
                                aria-label="Change profile photo"
                            >
                                <CameraIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-lt-brand-text-secondary dark:text-brand-text-secondary">
                            Upload a new photo
                        </p>
                    </div>

                    {/* Name */}
                    <div className="relative">
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder=" "
                            className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg border-lt-brand-border dark:border-brand-border focus:border-lt-brand-primary dark:focus:border-brand-primary outline-none transition-colors"
                        />
                         <label htmlFor="name" className="absolute left-4 -top-2.5 text-xs bg-lt-brand-bg-med dark:bg-brand-bg-light px-1 pointer-events-none text-lt-brand-text-secondary dark:text-brand-text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-lt-brand-primary dark:peer-focus:text-brand-primary">
                            Full Name
                        </label>
                    </div>
                    
                     {/* Email (read-only) */}
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            readOnly
                            placeholder=" "
                            className="peer w-full px-4 py-3 bg-lt-brand-surface dark:bg-brand-surface border-2 rounded-lg border-lt-brand-border dark:border-brand-border outline-none transition-colors cursor-not-allowed"
                        />
                         <label htmlFor="email" className="absolute left-4 -top-2.5 text-xs bg-lt-brand-bg-med dark:bg-brand-bg-light px-1 pointer-events-none text-lt-brand-text-secondary dark:text-brand-text-secondary">
                            Email Address
                        </label>
                    </div>

                    {/* Change Password */}
                    <div className="space-y-6 pt-4 border-t border-lt-brand-border dark:border-brand-border">
                        <h2 className="text-lg font-semibold">Change Password</h2>
                        <div className="relative">
                             <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg border-lt-brand-border dark:border-brand-border focus:border-lt-brand-primary dark:focus:border-brand-primary outline-none transition-colors"
                            />
                            <label htmlFor="password" className="absolute left-4 -top-2.5 text-xs bg-lt-brand-bg-med dark:bg-brand-bg-light px-1 pointer-events-none text-lt-brand-text-secondary dark:text-brand-text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-lt-brand-primary dark:peer-focus:text-brand-primary">
                                New Password
                            </label>
                        </div>
                        <div className="relative">
                           <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder=" "
                                className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg border-lt-brand-border dark:border-brand-border focus:border-lt-brand-primary dark:focus:border-brand-primary outline-none transition-colors"
                            />
                            <label htmlFor="confirmPassword" className="absolute left-4 -top-2.5 text-xs bg-lt-brand-bg-med dark:bg-brand-bg-light px-1 pointer-events-none text-lt-brand-text-secondary dark:text-brand-text-secondary transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-lt-brand-primary dark:peer-focus:text-brand-primary">
                                Confirm New Password
                            </label>
                        </div>
                    </div>

                    <RippleButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-lt-brand-primary dark:bg-brand-primary text-white font-semibold rounded-lg hover:bg-lt-brand-primary-dark dark:hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </RippleButton>
                </form>
            </div>
            {notification && <Toast message={notification.message} type={notification.type} />}
        </div>
    );
};
