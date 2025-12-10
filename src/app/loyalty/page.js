"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoyaltyPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loyalty, setLoyalty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/loyalty');
            return;
        }

        if (status === 'authenticated') {
            fetchLoyaltyData();
        }
    }, [status, router]);

    const fetchLoyaltyData = async () => {
        try {
            const res = await fetch('/api/loyalty');
            if (res.ok) {
                const data = await res.json();
                setLoyalty(data);
            }
        } catch (error) {
            console.error('Error fetching loyalty:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (rewardId) => {
        if (!confirm('Tem certeza que deseja resgatar estes pontos?')) return;

        setRedeeming(rewardId);
        try {
            const res = await fetch('/api/loyalty/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rewardId })
            });

            const data = await res.json();
            if (res.ok) {
                alert(`Parabéns! Você resgatou um cupom: ${data.coupon.code}`);
                fetchLoyaltyData(); // Refresh points
            } else {
                alert(`Erro ao resgatar: ${data.error}`);
            }
        } catch (error) {
            console.error('Error redeeming:', error);
            alert('Erro ao conectar com o servidor.');
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando seus pontos...</div>;

    if (!loyalty) return <div className="p-8 text-center">Erro ao carregar dados.</div>;

    const rewards = [
        { id: 'discount_10', cost: 500, title: '10% de Desconto', desc: 'Em qualquer compra' },
        { id: 'discount_20', cost: 1000, title: '20% de Desconto', desc: 'Em qualquer compra' },
        { id: 'fixed_50', cost: 2000, title: 'R$ 50,00 Off', desc: 'Desconto fixo' },
    ];

    const getTierColor = (tier) => {
        switch (tier) {
            case 'gold': return '#FFD700';
            case 'silver': return '#C0C0C0';
            default: return '#CD7F32'; // Bronze
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Programa de Fidelidade
            </h1>

            {/* Header Card */}
            <div className="glass p-8 rounded-2xl mb-8 text-center relative overflow-hidden">
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '5px',
                    background: getTierColor(loyalty.tier)
                }}></div>

                <p className="text-gray-500 uppercase tracking-widest text-sm mb-2">Seus Pontos</p>
                <h2 className="text-6xl font-black mb-4" style={{ color: 'var(--primary)' }}>
                    {loyalty.points}
                </h2>
                <div className="inline-block px-4 py-1 rounded-full text-white text-sm font-bold uppercase"
                    style={{ background: getTierColor(loyalty.tier), textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    Nível {loyalty.tier}
                </div>
            </div>

            {/* Rewards Section */}
            <h3 className="text-2xl font-bold mb-4">Recompensas Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                {rewards.map(reward => (
                    <div key={reward.id} className="card p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="text-4xl mb-2">🎁</div>
                        <h4 className="text-xl font-bold mb-2">{reward.title}</h4>
                        <p className="text-gray-500 mb-4">{reward.desc}</p>
                        <div className="mt-auto">
                            <p className="font-bold text-lg mb-2" style={{ color: 'var(--primary)' }}>{reward.cost} pts</p>
                            <button
                                onClick={() => handleRedeem(reward.id)}
                                disabled={loyalty.points < reward.cost || redeeming === reward.id}
                                className={`w-full py-2 px-4 rounded-lg font-bold transition-colors ${loyalty.points >= reward.cost
                                        ? 'bg-black text-white hover:bg-gray-800'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {redeeming === reward.id ? 'Processando...' : 'Resgatar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Section */}
            <h3 className="text-2xl font-bold mb-4">Histórico de Pontos</h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                {loyalty.history.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">Data</th>
                                <th className="p-4 text-left text-sm font-semibold text-gray-600">Descrição</th>
                                <th className="p-4 text-right text-sm font-semibold text-gray-600">Pontos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loyalty.history.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100">
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm font-medium">
                                        {item.reason}
                                    </td>
                                    <td className={`p-4 text-right font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {item.points > 0 ? '+' : ''}{item.points}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Nenhum histórico encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
