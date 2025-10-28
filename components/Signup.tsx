
import React, { useState } from 'react';
import { register } from '../services/authService';
import { RippleButton } from './common/RippleButton';
import type { User } from '../types';
import { EagoxLogo } from './icons/EagoxLogo';

interface SignupProps {
    onSignupSuccess: (user: User) => void;
    onSwitchToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            const result = register({ name, email, password });
            if (result.success) {
                 const newUser: User = { name, email };
                 onSignupSuccess(newUser);
            } else {
                setError(result.message);
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-lt-brand-bg-light dark:bg-brand-bg-dark text-lt-brand-text dark:text-brand-text p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-lt-brand-bg-med dark:bg-brand-bg-light rounded-2xl shadow-xl border border-lt-brand-border dark:border-brand-border">
                <div className="text-center">
                    <EagoxLogo className="h-16 w-auto mx-auto text-lt-brand-primary dark:text-brand-primary" />
                    <p className="mt-4 text-sm text-lt-brand-text-secondary dark:text-brand-text-secondary">Get started with your AI assistant</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
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
                         <label htmlFor="name" className="absolute left-4 -top-2.5 text-xs text-lt-brand-text-secondary dark:text-brand-text-secondary transition-all pointer-events-none peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-lt-brand-primary dark:peer-focus:text-brand-primary peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-lt-brand-text-secondary dark:peer-placeholder-shown:text-brand-text-secondary bg-lt-brand-bg-med dark:bg-brand-bg-light px-1">
                            Full Name
                        </label>
                    </div>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder=" "
                            className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg border-lt-brand-border dark:border-brand-border focus:border-lt-brand-primary dark:focus:border-brand-primary outline-none transition-colors"
                        />
                         <label htmlFor="email" className="absolute left-4 -top-2.5 text-xs text-lt-brand-text-secondary dark:text-brand-text-secondary transition-all pointer-events-none peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-lt-brand-primary dark:peer-focus:text-brand-primary peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-lt-brand-text-secondary dark:peer-placeholder-shown:text-brand-text-secondary bg-lt-brand-bg-med dark:bg-brand-bg-light px-1">
                            Email Address
                        </label>
                    </div>
                     <div className="relative">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder=" "
                            className="peer w-full px-4 py-3 bg-transparent border-2 rounded-lg border-lt-brand-border dark:border-brand-border focus:border-lt-brand-primary dark:focus:border-brand-primary outline-none transition-colors"
                        />
                         <label htmlFor="password" className="absolute left-4 -top-2.5 text-xs text-lt-brand-text-secondary dark:text-brand-text-secondary transition-all pointer-events-none peer-focus:text-xs peer-focus:-top-2.5 peer-focus:text-lt-brand-primary dark:peer-focus:text-brand-primary peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-lt-brand-text-secondary dark:peer-placeholder-shown:text-brand-text-secondary bg-lt-brand-bg-med dark:bg-brand-bg-light px-1">
                            Password
                        </label>
                    </div>
                    <RippleButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-lt-brand-primary dark:bg-brand-primary text-white font-semibold rounded-lg hover:bg-lt-brand-primary-light dark:hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </RippleButton>
                </form>
                 <p className="text-sm text-center text-lt-brand-text-secondary dark:text-brand-text-secondary">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-lt-brand-primary dark:text-brand-primary hover:underline">
                        Sign in
                    </button>
                </p>
            </div>
        </div>
    );
};
