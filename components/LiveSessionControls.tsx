import React from 'react';
import { RippleButton } from './common/RippleButton';
import { VideoIcon } from './icons/VideoIcon';

interface LiveSessionControlsProps {
    isSessionActive: boolean;
    onToggleSession: () => void;
}

export const LiveSessionControls: React.FC<LiveSessionControlsProps> = ({ isSessionActive, onToggleSession }) => {
    return (
        <div className="px-4 pb-4 md:px-6 md:pb-6 flex flex-col items-center justify-center pt-2">
            <RippleButton 
                onClick={onToggleSession}
                className={`w-16 h-16 flex items-center justify-center rounded-full transition-all duration-300 text-white ${isSessionActive ? 'bg-red-500 animate-pulse' : 'bg-lt-brand-primary dark:bg-brand-primary'}`}
                aria-label={isSessionActive ? "Stop live session" : "Start live session"}
            >
                <VideoIcon className="w-8 h-8" />
            </RippleButton>
            <p className="text-xs text-center text-lt-brand-text-secondary dark:text-brand-text-secondary mt-3">
                {isSessionActive ? 'Live session active...' : 'Tap to go live'}
            </p>
        </div>
    );
};