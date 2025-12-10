"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ReviewForm({ productId, existingReview, onSuccess }) {
    const { data: session } = useSession();
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!session?.user) {
            alert('Você precisa estar logado para avaliar');
            return;
        }

        if (rating === 0) {
            alert('Por favor, selecione uma avaliação');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    rating,
                    comment: comment.trim() || null
                })
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                if (!existingReview) {
                    setRating(0);
                    setComment('');
                }
            } else {
                const error = await res.json();
                alert(error.error || 'Erro ao enviar avaliação');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Erro ao enviar avaliação');
        } finally {
            setLoading(false);
        }
    };

    if (!session?.user) {
        return (
            <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <p>Faça login para avaliar este produto</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', background: '#f9f9f9', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                {existingReview ? 'Editar Avaliação' : 'Avaliar Produto'}
            </h3>

            {/* Star Rating */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Sua Avaliação:
                </label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '2rem',
                                padding: 0,
                                color: (hoveredRating || rating) >= star ? '#FFD700' : '#ddd'
                            }}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Comentário (opcional):
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Compartilhe sua experiência com este produto..."
                    rows={4}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                    }}
                />
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || rating === 0}
                className="btn btn-primary"
                style={{ width: '100%' }}
            >
                {loading ? 'Enviando...' : existingReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
            </button>
        </form>
    );
}
