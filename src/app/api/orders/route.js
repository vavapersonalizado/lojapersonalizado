import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import { uploadPrintFile } from '@/lib/printFile';

export async function POST(request) {
    const session = await getServerSession(authOptions);

    try {
        const body = await request.json();
        const { items, couponCode, discount, total, finalTotal, guestData } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        // Validate guest data if no session
        if (!session?.user) {
            if (!guestData || !guestData.name || !guestData.email || !guestData.phone) {
                return NextResponse.json({
                    error: "Nome, email e telefone são obrigatórios para pedidos sem login"
                }, { status: 400 });
            }
        }

        // Prepare order data
        const orderData = {
            total,
            discount: discount || 0,
            finalTotal,
            couponCode: couponCode || null,
            status: 'pending',
            items: {
                create: await Promise.all(items.map(async (item) => {
                    let printFileUrl = null;

                    // Upload print file to Cloudinary if exists
                    if (item.customization?.printFile) {
                        try {
                            printFileUrl = await uploadPrintFile(
                                item.customization.printFile,
                                'temp', // Will be updated with orderId after creation
                                item.productId
                            );
                        } catch (error) {
                            console.error('Error uploading print file:', error);
                            // Continue without URL, printFile will be saved as backup
                        }
                    }

                    return {
                        productId: item.productId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        customization: item.customization || null,
                        printFile: item.customization?.printFile || null,
                        printFileUrl: printFileUrl
                    };
                }))
            }
        };

        // Add user or guest data
        if (session?.user) {
            orderData.userId = session.user.id;
        } else {
            orderData.guestName = guestData.name;
            orderData.guestEmail = guestData.email;
            orderData.guestPhone = guestData.phone;
            orderData.guestAddress = {
                postalCode: guestData.postalCode || '',
                prefecture: guestData.prefecture || '',
                city: guestData.city || '',
                town: guestData.town || '',
                street: guestData.street || '',
                building: guestData.building || ''
            };
        }

        // Create order with items
        const order = await prisma.order.create({
            data: orderData,
            include: {
                items: true,
                user: session?.user ? {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                } : false
            }
        });

        // If coupon was used, increment usage count
        if (couponCode) {
            await prisma.coupon.updateMany({
                where: { code: couponCode, isActive: true },
                data: { usedCount: { increment: 1 } }
            });
        }

        // Loyalty Program: Add points for registered users
        if (session?.user) {
            try {
                const pointsEarned = Math.floor(finalTotal); // 1 point per currency unit

                await prisma.$transaction(async (tx) => {
                    // Update or create LoyaltyPoints
                    const loyalty = await tx.loyaltyPoints.upsert({
                        where: { userId: session.user.id },
                        create: {
                            userId: session.user.id,
                            points: pointsEarned,
                            tier: 'bronze'
                        },
                        update: {
                            points: { increment: pointsEarned }
                        }
                    });

                    // Create History Record
                    await tx.pointsHistory.create({
                        data: {
                            userId: session.user.id,
                            points: pointsEarned,
                            reason: `Compra: Pedido #${order.id.slice(-6)}`,
                            orderId: order.id
                        }
                    });

                    // Update Tier
                    let newTier = loyalty.tier;
                    if (loyalty.points >= 5000) newTier = 'gold';
                    else if (loyalty.points >= 1000) newTier = 'silver';

                    if (newTier !== loyalty.tier) {
                        await tx.loyaltyPoints.update({
                            where: { userId: session.user.id },
                            data: { tier: newTier }
                        });
                    }
                });
            } catch (error) {
                console.error('Error adding loyalty points:', error);
                // Don't fail the order if loyalty fails, just log it
            }
        }

        // Send email notification
        try {
            const { sendOrderNotification } = await import('@/lib/email');
            await sendOrderNotification(order);
        } catch (emailError) {
            console.error('Failed to send order notification email:', emailError);
            // Don't fail the order if email fails
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: "Error creating order" }, { status: 500 });
    }
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                images: true,
                                sku: true
                            }
                        }
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
    }
}
