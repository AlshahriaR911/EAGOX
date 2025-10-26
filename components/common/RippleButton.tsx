import React, { useState } from 'react';

interface Ripple {
    key: number;
    left: number;
    top: number;
    size: number;
}

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export const RippleButton: React.FC<RippleButtonProps> = ({ children, className, ...props }) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const newRipple: Ripple = {
            key: Date.now(),
            left: x,
            top: y,
            size: size,
        };

        setRipples(prev => [...prev, newRipple]);
    };

    const handleAnimationEnd = (key: number) => {
        setRipples(prev => prev.filter(ripple => ripple.key !== key));
    };

    return (
        <button
            className={`relative overflow-hidden ${className}`}
            onClick={createRipple}
            {...props}
        >
            {children}
            {ripples.map(ripple => (
                <span
                    key={ripple.key}
                    className="absolute rounded-full bg-white/40 animate-ripple pointer-events-none"
                    style={{
                        left: ripple.left,
                        top: ripple.top,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                    onAnimationEnd={() => handleAnimationEnd(ripple.key)}
                />
            ))}
        </button>
    );
};
