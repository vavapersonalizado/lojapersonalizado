import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { guestEmail, guestPhone, userData } = await request.json();

        // Validate required fields
        if (!userData.name || !userData.email) {
            return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                phone: userData.phone || guestPhone,
                postalCode: userData.postalCode || '',
                prefecture: userData.prefecture || '',
                city: userData.city || '',
                town: userData.town || '',
                street: userData.street || '',
                building: userData.building || '',
                classification: userData.classification || '',
                deserveDiscount: userData.deserveDiscount || false,
                discountType: userData.discountType || 'percentage',
                discountValue: userData.discountValue || 0,
                role: 'client',
                emailVerified: new Date() // Auto-verify since admin is creating
            }
        });

        // Find all orders from this guest (by email AND/OR phone)
        const ordersToMigrate = await prisma.order.findMany({
            where: {
                userId: null,
                OR: [
                    guestEmail ? { guestEmail: guestEmail } : {},
                    guestPhone ? { guestPhone: guestPhone } : {}
                ].filter(obj => Object.keys(obj).length > 0)
            }
        });

        // Update all guest orders to link to new user
        await prisma.order.updateMany({
            where: {
                id: {
                    in: ordersToMigrate.map(o => o.id)
                }
            },
            data: {
                userId: newUser.id,
                // Clear guest fields
                guestName: null,
                guestEmail: null,
                guestPhone: null,
                guestAddress: null
            }
        });

        return NextResponse.json({
            user: newUser,
            migratedOrders: ordersToMigrate.length
        }, { status: 201 });
    } catch (error) {
        console.error('Error completing guest registration:', error);
        return NextResponse.json({ error: 'Error completing registration' }, { status: 500 });
    }
}
