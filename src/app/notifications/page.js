"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function NotificationsPage() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchNotifications();
        }
    }, [session]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p>Faça login para ver suas notificações.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Suas Notificações</h1>

            {loading ? (
                <div className="text-center py-8">Carregando...</div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">Você não tem notificações.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`p-6 rounded-xl border transition-all ${!notification.read
                                    ? 'bg-white border-blue-200 shadow-sm'
                                    : 'bg-gray-50 border-gray-100'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    {!notification.read && (
                                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                    )}
                                    <h3 className="font-bold text-lg">{notification.title}</h3>
                                </div>
                                <span className="text-sm text-gray-400">
                                    {new Date(notification.createdAt).toLocaleDateString()} às {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">{notification.message}</p>
                            {notification.link && (
                                <Link
                                    href={notification.link}
                                    className="inline-block bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
                                >
                                    Ver Detalhes
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
