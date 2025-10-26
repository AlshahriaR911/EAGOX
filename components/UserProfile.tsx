import React from 'react';
import type { User } from '../types';
import { Modal } from './common/Modal';

interface UserProfileProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
            <div className="space-y-4 text-lt-brand-text dark:text-brand-text">
                <div>
                    <label className="text-sm font-medium text-lt-brand-text-secondary dark:text-brand-text-secondary">Name</label>
                    <p className="mt-1 text-base p-2 bg-lt-brand-bg-med dark:bg-brand-bg-dark rounded-md">{user.name}</p>
                </div>
                <div>
                    <label className="text-sm font-medium text-lt-brand-text-secondary dark:text-brand-text-secondary">Email</label>
                    <p className="mt-1 text-base p-2 bg-lt-brand-bg-med dark:bg-brand-bg-dark rounded-md">{user.email}</p>
                </div>
            </div>
        </Modal>
    );
};
