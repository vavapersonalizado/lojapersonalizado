"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function ChatWidget() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen && session) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5s
            return () => clearInterval(interval);
        }
    }, [isOpen, session]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/chat');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error fetching chat:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage })
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!session) return null; // Only show for logged in users for now

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="font-bold">Suporte</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-2xl w-80 md:w-96 flex flex-col border border-gray-200" style={{ height: '500px' }}>
                    {/* Header */}
                    <div className="bg-black text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-bold">Suporte Online</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-400 text-sm mt-10">
                                Olá! Como podemos ajudar você hoje?
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.isAdmin
                                            ? 'bg-white border border-gray-200 text-gray-800'
                                            : 'bg-black text-white'
                                        }`}
                                >
                                    {msg.message}
                                    <div className={`text-xs mt-1 ${msg.isAdmin ? 'text-gray-400' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !newMessage.trim()}
                                className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
