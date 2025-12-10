import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/analytics/stats - Buscar estatísticas
export async function GET(request) {
    const session = await getServerSession(authOptions);

    // Apenas admins podem ver estatísticas
    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate'); // Para filtro de criação de itens (existente)
        const endDate = searchParams.get('endDate');     // Para filtro de criação de itens (existente)

        // Novos parâmetros para "Datas Personalizadas"
        const customStartDateStr = searchParams.get('customStartDate');
        const customEndDateStr = searchParams.get('customEndDate');

        const limit = parseInt(searchParams.get('limit') || '100');
        const sortBy = searchParams.get('sortBy') || 'views';

        // Construir filtros para buscar os ITENS (Analytics)
        const where = {};
        if (type) where.type = type;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        // Buscar dados (Itens)
        const analytics = await prisma.analytics.findMany({
            where,
            orderBy: { [sortBy]: 'desc' },
            take: limit
        });

        // Buscar eventos para calcular estatísticas
        const analyticsIds = analytics.map(a => a.id);

        // Definir datas de corte
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Datas para o intervalo personalizado
        let customStart = null;
        let customEnd = null;
        if (customStartDateStr) customStart = new Date(customStartDateStr);
        if (customEndDateStr) customEnd = new Date(customEndDateStr);

        // Determinar a data mais antiga necessária para buscar eventos
        // Precisamos buscar eventos desde o mais antigo entre: 30 dias atrás OU customStart
        let oldestDateNeeded = thirtyDaysAgo;
        if (customStart && customStart < oldestDateNeeded) {
            oldestDateNeeded = customStart;
        }

        const events = await prisma.analyticsEvent.findMany({
            where: {
                analyticsId: { in: analyticsIds },
                createdAt: { gte: oldestDateNeeded }, // Otimização: buscar apenas o necessário
                type: 'view' // Apenas visualizações
            },
            select: {
                analyticsId: true,
                createdAt: true
            }
        });

        // Calcular stats por item
        const statsMap = events.reduce((acc, event) => {
            if (!acc[event.analyticsId]) {
                acc[event.analyticsId] = { daily: 0, weekly: 0, monthly: 0, custom: 0 };
            }

            const eventDate = new Date(event.createdAt);

            // 24 Horas
            if (eventDate >= oneDayAgo) {
                acc[event.analyticsId].daily++;
            }

            // 7 Dias
            if (eventDate >= sevenDaysAgo) {
                acc[event.analyticsId].weekly++;
            }

            // 30 Dias (Considerando que a query já filtrou >= 30 dias ou customStart)
            // Mas precisamos garantir que está dentro dos 30 dias para a coluna "30 Dias"
            if (eventDate >= thirtyDaysAgo) {
                acc[event.analyticsId].monthly++;
            }

            // Customizado
            if (customStart) {
                if (customEnd) {
                    if (eventDate >= customStart && eventDate <= customEnd) {
                        acc[event.analyticsId].custom++;
                    }
                } else {
                    if (eventDate >= customStart) {
                        acc[event.analyticsId].custom++;
                    }
                }
            }

            return acc;
        }, {});

        // Anexar stats aos itens
        const analyticsWithStats = analytics.map(item => ({
            ...item,
            dailyViews: statsMap[item.id]?.daily || 0,
            weeklyViews: statsMap[item.id]?.weekly || 0,
            monthlyViews: statsMap[item.id]?.monthly || 0,
            customViews: statsMap[item.id]?.custom || 0
        }));

        // Estatísticas gerais
        const totalViews = analytics.reduce((sum, item) => sum + item.views, 0);
        const totalUses = analytics.reduce((sum, item) => sum + item.uses, 0);

        // Agrupar por tipo
        const byType = analytics.reduce((acc, item) => {
            if (!acc[item.type]) {
                acc[item.type] = { count: 0, views: 0, uses: 0 };
            }
            acc[item.type].count++;
            acc[item.type].views += item.views;
            acc[item.type].uses += item.uses;
            return acc;
        }, {});

        // Top 10 mais visualizados
        const top10 = [...analyticsWithStats]
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        return NextResponse.json({
            analytics: analyticsWithStats,
            summary: {
                totalViews,
                totalUses,
                totalItems: analytics.length,
                byType
            },
            top10
        });
    } catch (error) {
        console.error('Analytics stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}

// DELETE /api/analytics/stats - Limpar dados antigos
export async function DELETE(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '90');

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const deleted = await prisma.analytics.deleteMany({
            where: {
                lastViewedAt: {
                    lt: cutoffDate
                }
            }
        });

        return NextResponse.json({
            message: `Deleted ${deleted.count} old analytics records`,
            count: deleted.count
        });
    } catch (error) {
        console.error('Analytics delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete analytics' },
            { status: 500 }
        );
    }
}
