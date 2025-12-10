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
