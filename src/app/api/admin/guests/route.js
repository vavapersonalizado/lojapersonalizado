import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all guest orders (where userId is null)
        const guestOrders = await prisma.order.findMany({
            where: {
                userId: null
            },
            select: {
                id: true,
                guestName: true,
                guestEmail: true,
                guestPhone: true,
                guestAddress: true,
                finalTotal: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group by email (priority) or phone
        const guestsMap = new Map();

        guestOrders.forEach(order => {
            const key = order.guestEmail || order.guestPhone || 'unknown';

            if (!guestsMap.has(key)) {
                guestsMap.set(key, {
                    identifier: key,
                    name: order.guestName,
                    email: order.guestEmail,
                    phone: order.guestPhone,
                    address: order.guestAddress,
                    orderCount: 0,
                    totalSpent: 0,
                    lastOrderDate: order.createdAt,
                    orders: []
                });
            }

            const guest = guestsMap.get(key);
            guest.orderCount++;
            guest.totalSpent += order.finalTotal;
            guest.orders.push({
                id: order.id,
                total: order.finalTotal,
                date: order.createdAt
            });

            // Update last order date if this order is more recent
            if (new Date(order.createdAt) > new Date(guest.lastOrderDate)) {
                guest.lastOrderDate = order.createdAt;
            }
        });

        // Convert map to array and sort by total spent
        const guests = Array.from(guestsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

        return NextResponse.json(guests);
    } catch (error) {
        console.error('Error fetching guests:', error);
        return NextResponse.json({ error: 'Error fetching guests' }, { status: 500 });
    }
}
