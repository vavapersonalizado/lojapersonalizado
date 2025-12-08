"use client";

import { useEffect } from 'react';

export function useAnalytics() {
    const trackView = async (type, itemId, itemName, itemCode = null) => {
        try {
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
