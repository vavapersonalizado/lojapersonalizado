"use client";

import { getSession } from 'next-auth/react';

export function useAnalytics() {

    const trackView = async (type, itemId, itemName, itemCode = null) => {
        try {
            // Não rastrear em localhost (desenvolvimento)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Skipping analytics tracking on localhost');
                return;
            }

            // Obter sessão atualizada para verificar admin
            const session = await getSession();

            // Não rastrear visualizações de admins
            if (session?.user?.role === 'admin') {
                console.log('Skipping analytics tracking for admin user');
                return;
            }

            // Detectar tipo de dispositivo
            const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';

            // Pegar referrer
            const referrer = document.referrer || 'direct';

            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    itemId,
                    itemName,
                    itemCode,
                    deviceType,
                    referrer,
                    incrementUse: false
                })
            });
        } catch (error) {
            console.error('Failed to track view:', error);
        }
    };

    const trackUse = async (type, itemId, itemName, itemCode = null) => {
        try {
            // Não rastrear em localhost (desenvolvimento)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Skipping analytics tracking on localhost');
                return;
            }

            // Obter sessão atualizada para verificar admin
            const session = await getSession();

            // Não rastrear usos de admins
            if (session?.user?.role === 'admin') {
                console.log('Skipping analytics tracking for admin user');
                return;
            }

            const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';

            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    itemId,
                    itemName,
                    itemCode,
                    deviceType,
                    incrementUse: true
                })
            });
        } catch (error) {
            console.error('Failed to track use:', error);
        }
    };

    return { trackView, trackUse };
}
