"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { useTheme } from '@/contexts/ThemeContext';

export default function NotificationBell() {
    const { data: session } = useSession();
    const { theme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [bellIcon, setBellIcon] = useState('🔔');

    useEffect(() => {
        if (theme?.icons?.bell) {
            const icons = theme.icons.bell;
            // Filter visible icons
            const visibleIcons = icons.filter(i => typeof i === 'string' || i.visible !== false);

            if (visibleIcons.length > 0) {
                const randomIcon = visibleIcons[Math.floor(Math.random() * visibleIcons.length)];
                setBellIcon(typeof randomIcon === 'object' ? randomIcon.value : randomIcon);
            } else {
                setBellIcon('🔔');
            }
        }
    }, [theme]);

    useEffect(() => {
        if (session) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [session]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            // Optimistic update
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true })
            });
            // Optimistic update
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    if (!session) return null;

    const renderIcon = (icon) => {
        if (!icon) return null;
        if (icon.startsWith('http') || icon.startsWith('/')) {
            return <img src={icon} alt="notification icon" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />;
        }
        return <span>{icon}</span>;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-black transition-colors"
                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
                {renderIcon(bellIcon)}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-sm">Notificações</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Nenhuma notificação.
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
                                    onClick={() => !notification.read && markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm ${!notification.read ? 'font-bold' : 'font-medium'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="text-xs text-blue-600 hover:underline block mt-1"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Ver detalhes →
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                        <Link
                            href="/notifications"
                            className="text-xs text-gray-500 hover:text-black"
                            onClick={() => setIsOpen(false)}
                        >
                            Ver histórico completo
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
