"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';

export default function EditableText({ textKey, defaultText, className, style, as: Component = 'span' }) {
    const { data: session } = useSession();
    const { theme, updateText } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(defaultText);
    const inputRef = useRef(null);

    // Sync with theme when it changes
    useEffect(() => {
        if (theme?.texts?.[textKey]) {
            setValue(theme.texts[textKey]);
        } else {
            setValue(defaultText);
        }
    }, [theme, textKey, defaultText]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (value !== theme?.texts?.[textKey]) {
            updateText(textKey, value);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setValue(theme?.texts?.[textKey] || defaultText);
        }
    };

    // If not admin, just render the text
    const isAdmin = session?.user?.email === 'admin@admin.com' || session?.user?.role === 'admin';

    if (!isAdmin) {
        return <Component className={className} style={style}>{value}</Component>;
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={className}
                style={{
                    ...style,
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--accent)',
                    borderRadius: '4px',
                    color: 'inherit',
                    font: 'inherit',
                    padding: '0 4px',
                    width: 'auto',
                    minWidth: '50px',
                    outline: 'none',
                    display: 'inline-block'
                }}
                onClick={(e) => e.preventDefault()} // Prevent link click when editing
            />
        );
    }

    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Component className={className} style={style}>
                {value}
            </Component>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                }}
                style={{
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '10px',
                    color: 'white',
                    opacity: 0.7,
                    transition: 'opacity 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                title="Editar texto"
            >
                ✏️
            </button>
        </span>
    );
}
