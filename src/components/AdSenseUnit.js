"use client";

import { useEffect, useRef } from 'react';

import Script from 'next/script';

export default function AdSenseUnit({ publisherId, slotId, format = "auto", responsive = "true", style = {} }) {
    const requestedRef = useRef(false);

    useEffect(() => {
        if (requestedRef.current) return;

        try {
            if (slotId && publisherId) {
                requestedRef.current = true;
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, [slotId, publisherId]);

    if (!publisherId || !slotId) return null;

    return (
        <div style={{ overflow: 'hidden', ...style }}>
            <Script
                async
                src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
                crossOrigin="anonymous"
                strategy="afterInteractive"
                onError={(e) => { console.error('Script failed to load', e) }}
            />
            <ins className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client={publisherId}
                data-ad-slot={slotId}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
}
