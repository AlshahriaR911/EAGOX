import React from 'react';
import { Modal } from './common/Modal';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="About EAGOX AI">
            <div className="space-y-4 text-sm text-lt-brand-text-secondary dark:text-brand-text-secondary">
                <p>
                    EAGOX is a compact yet powerful AI assistant designed to be friendly, futuristic, and efficient. 
                    Powered by Nano Banana Technology 🍌⚡ and Google's Gemini models.
                </p>
                <p>
                    This application is a demonstration of modern AI chat capabilities, including text, image, and video generation.
                </p>
                <div>
                    <h3 className="font-semibold text-lt-brand-text dark:text-brand-text mb-1">Admin Contact</h3>
                    <p>Al Shahriar Sayon</p>
                    <a href="mailto:alshahriarsayon425@gmail.com" className="text-lt-brand-primary dark:text-brand-primary hover:underline">
                        alshahriarsayon425@gmail.com
                    </a>
                </div>
            </div>
        </Modal>
    );
};
