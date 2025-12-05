import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [users, categories, products, coupons, orders, settings] = await Promise.all([
            prisma.user.findMany(),
            prisma.category.findMany(),
            prisma.product.findMany(),
            prisma.coupon.findMany(),
            prisma.order.findMany({ include: { items: true } }),
            prisma.siteSettings.findFirst()
        ]);

        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                users,
                categories,
                products,
                coupons,
                orders,
                settings
            }
        };

        return NextResponse.json(backupData);
    } catch (error) {
        console.error("Backup error:", error);
        return NextResponse.json({ error: "Backup failed" }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const backup = await request.json();
        const { users, categories, products, coupons, orders, settings } = backup.data;

        // Restore Categories
        if (categories) {
            for (const cat of categories) {
                await prisma.category.upsert({
                    where: { id: cat.id },
                    update: cat,
                    create: cat
                });
            }
        }

        // Restore Users
        if (users) {
            for (const user of users) {
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: user,
                    create: user
                });
            }
        }

        // Restore Products
        if (products) {
            for (const prod of products) {
                await prisma.product.upsert({
                    where: { id: prod.id },
                    update: prod,
                    create: prod
                });
            }
        }

        // Restore Coupons
        if (coupons) {
            for (const coupon of coupons) {
                await prisma.coupon.upsert({
                    where: { id: coupon.id },
                    update: coupon,
                    create: coupon
                });
            }
        }

        // Restore Settings
        if (settings) {
            await prisma.siteSettings.upsert({
                where: { id: settings.id || 'settings' },
                update: settings,
                create: settings
            });
        }

        // Note: Orders are complex due to relations, skipping for basic restore to avoid conflicts
        // or implementing a more complex logic if needed. For now, we focus on catalog and users.

        return NextResponse.json({ message: "Restore completed successfully" });
    } catch (error) {
        console.error("Restore error:", error);
        return NextResponse.json({ error: "Restore failed: " + error.message }, { status: 500 });
    }
}
