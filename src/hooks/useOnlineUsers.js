import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export function useOnlineUsers() {
    const { data: session } = useSession();
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('onlineSessionId');
            if (!id) {
                id = crypto.randomUUID();
                localStorage.setItem('onlineSessionId', id);
            }
            return id;
        }
        return null;
    });

    // Send heartbeat every 30 seconds
    useEffect(() => {
        if (!sessionId) return;

        const isAdmin = session?.user?.role === 'admin';

        const sendHeartbeat = async () => {
            try {
                await fetch('/api/presence/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, isAdmin })
                });
            } catch (error) {
                console.error('Error sending heartbeat:', error);
            }
        };

        // Send immediately
        sendHeartbeat();

        // Then every 30 seconds
        const heartbeatInterval = setInterval(sendHeartbeat, 30000);

        return () => clearInterval(heartbeatInterval);
    }, [sessionId, session]);

    // Fetch count every 10 seconds
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch('/api/presence/count');
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching count:', error);
                setLoading(false);
            }
        };

        // Fetch immediately
        fetchCount();

        // Then every 10 seconds
        const countInterval = setInterval(fetchCount, 10000);

        return () => clearInterval(countInterval);
    }, []);

    return { count, loading };
}
