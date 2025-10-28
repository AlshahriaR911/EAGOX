
import React from 'react';

export const EagoxLogo: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        viewBox="0 0 64 64" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="EAGOX Logo"
    >
        <path d="M32 2L6 18V50L32 62L58 50V18L32 2Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M32 2L18 10V26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 62L18 54V38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 18L18 26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 50L18 42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46 10V26L32 34L46 42V54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46 10L58 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46 54L58 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
