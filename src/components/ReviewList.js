"use client";

import { useSession } from 'next-auth/react';

export default function ReviewList({ reviews, averageRating, totalReviews, onDelete }) {
    const { data: session } = useSession();

    const renderStars = (rating) => {
        return (
            <div style={{ display: 'flex', gap: '0.1rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        style={{
                            color: star <= rating ? '#FFD700' : '#ddd',
                            fontSize: '1.2rem'
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
            </div>
        );
    }

    return (
        <div>
            {/* Summary */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {averageRating.toFixed(1)}
                    </div>
                    <div>
                        {renderStars(Math.round(averageRating))}
                        <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                            {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        style={{
                            padding: '1.5rem',
                            border: '1px solid #eee',
                            borderRadius: 'var(--radius)',
                            background: 'white'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                    {review.user?.name || 'Usuário'}
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                                {(session?.user?.id === review.userId || session?.user?.role === 'admin') && onDelete && (
                                    <button
                                        onClick={() => onDelete(review.id)}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            background: '#dc3545',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </div>
                        {review.comment && (
                            <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>
                                {review.comment}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
