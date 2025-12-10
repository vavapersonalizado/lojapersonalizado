"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function WishlistButton({ productId }) {
    const { data: session } = useSession();
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            checkWishlist();
        }
    }, [session, productId]);

    const checkWishlist = async () => {
        try {
            const res = await fetch('/api/wishlist');
            if (res.ok) {
                const wishlist = await res.json();
                setIsInWishlist(wishlist.some(item => item.productId === productId));
            }
        } catch (error) {
            console.error('Error checking wishlist:', error);
        }
    };

    const toggleWishlist = async () => {
        if (!session?.user) {
            alert('Faça login para adicionar à lista de desejos');
            return;
        }

        setLoading(true);

        try {
            if (isInWishlist) {
                // Remove from wishlist
                const res = await fetch(`/api/wishlist?productId=${productId}`, {
                    method: 'DELETE'
                });

                if (res.ok) {
                    setIsInWishlist(false);
                }
            } else {
                // Add to wishlist
                const res = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId })
                });

                if (res.ok) {
                    setIsInWishlist(true);
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            style={{
                background: isInWishlist ? 'var(--primary)' : 'white',
                color: isInWishlist ? 'white' : 'var(--primary)',
                border: `2px solid var(--primary)`,
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}
            title={isInWishlist ? 'Remover da lista de desejos' : 'Adicionar à lista de desejos'}
        >
            {isInWishlist ? '❤️' : '🤍'} {isInWishlist ? 'Na Lista' : 'Favoritar'}
        </button>
    );
}
