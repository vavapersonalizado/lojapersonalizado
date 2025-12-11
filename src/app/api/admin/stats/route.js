import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = parseInt(searchParams.get('period') || '30'); // dias

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        // 1. Vendas por período
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            include: {
                items: true
            }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = orders.length;

        // 2. Novos Clientes
        const newCustomers = await prisma.user.count({
            where: {
                createdAt: { gte: startDate },
                role: 'user'
            }
        });

        // 3. Pedidos Recentes
        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });

        // 4. Produtos Mais Vendidos (Simples)
        // Em um cenário real, faria agregação no banco, mas aqui faremos via JS para simplificar
        const productSales = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        id: item.productId,
                        name: item.name || 'Produto',
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        });

        const bestsellers = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        // 5. Alertas (Estoque Baixo)
        const lowStockProducts = await prisma.product.findMany({
            where: {
                stock: { lte: 5, gt: 0 }
            },
            select: { id: true, name: true, stock: true },
            take: 5
        });

        const alerts = lowStockProducts.map(p => ({
            type: 'warning',
            message: `Estoque baixo: ${p.name} (${p.stock} un.)`
        }));

        // 6. Vendas por Dia (para gráfico)
        const salesByDay = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!salesByDay[date]) salesByDay[date] = 0;
            salesByDay[date] += order.total;
        });

        return NextResponse.json({
            summary: {
                totalRevenue,
                totalOrders,
                newCustomers,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            },
            recentOrders,
            bestsellers,
            alerts,
            salesByDay
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
    }
}
