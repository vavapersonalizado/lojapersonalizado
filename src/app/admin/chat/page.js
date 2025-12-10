"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminChatPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Fetch users who have messages
    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch messages when a user is selected
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
            const interval = setInterval(() => fetchMessages(selectedUser.id), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchUsers = async () => {
        try {
            // This is a simplified way. Ideally, we'd have a specific endpoint for "users with chats"
            // For now, we fetch all messages and group by user on client (not efficient for scale, but works for MVP)
            const res = await fetch('/api/chat');
            if (res.ok) {
                const allMessages = await res.json();
                const uniqueUsers = {};

                allMessages.forEach(msg => {
                    if (msg.userId && msg.user) {
                        if (!uniqueUsers[msg.userId]) {
                            uniqueUsers[msg.userId] = {
                                id: msg.userId,
                                name: msg.user.name,
                                email: msg.user.email,
                                lastMessage: msg.message,
                                lastMessageTime: msg.createdAt,
                                unread: !msg.read && !msg.isAdmin
                            };
                        } else {
                            // Update last message
                            if (new Date(msg.createdAt) > new Date(uniqueUsers[msg.userId].lastMessageTime)) {
                                uniqueUsers[msg.userId].lastMessage = msg.message;
                                uniqueUsers[msg.userId].lastMessageTime = msg.createdAt;
                            }
                            if (!msg.read && !msg.isAdmin) {
                                uniqueUsers[msg.userId].unread = true;
                            }
                        }
                    }
                });

                setUsers(Object.values(uniqueUsers).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await fetch(`/api/chat?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: newMessage,
                    userId: selectedUser.id
                })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedUser.id);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            {/* Users List */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-bold text-lg">Conversas</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-sm">{user.name || 'Usuário'}</h3>
                                <span className="text-xs text-gray-400">
                                    {new Date(user.lastMessageTime).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            <p className="text-sm text-gray-600 truncate mt-1">
                                {user.unread && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>}
                                {user.lastMessage}
                            </p>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Nenhuma conversa iniciada.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">{selectedUser.name}</h3>
                                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.isAdmin
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-200 text-gray-800'
                                            }`}
                                    >
                                        {msg.message}
                                        <div className={`text-xs mt-1 text-right ${msg.isAdmin ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua resposta..."
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !newMessage.trim()}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-bold"
                                >
                                    Enviar
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Selecione uma conversa para responder.
                    </div>
                )}
            </div>
        </div>
    );
}
