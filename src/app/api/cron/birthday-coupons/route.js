import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    // Security: Check for a secret key in headers to prevent unauthorized access
    // For MVP/Local, we might skip this or use a simple env var.
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        const currentYear = today.getFullYear();

        console.log(`Checking birthdays for ${currentDay}/${currentMonth}...`);

        // Find users with birthday today
        // Prisma doesn't have great date functions for filtering by day/month directly in all DBs easily without raw query.
        // But we can fetch users who have a birthDate and filter in JS for MVP (assuming user base isn't massive yet).
        // Or use raw query. Let's use JS filter for simplicity and safety.

        const users = await prisma.user.findMany({
            where: {
                birthDate: { not: null }
            },
            select: {
                id: true,
                name: true,
                email: true,
                birthDate: true
            }
        });

        const birthdayUsers = users.filter(user => {
            const dob = new Date(user.birthDate);
            return dob.getUTCMonth() + 1 === currentMonth && dob.getUTCDate() === currentDay;
        });

        console.log(`Found ${birthdayUsers.length} users with birthday today.`);

        const results = [];

        for (const user of birthdayUsers) {
            const couponCode = `BDAY-${currentYear}-${user.id.slice(-4).toUpperCase()}`; // Unique code per year

            // Check if coupon already exists
            const existingCoupon = await prisma.coupon.findUnique({
                where: { code: couponCode }
            });

            if (!existingCoupon) {
                // Create Coupon
                const coupon = await prisma.coupon.create({
                    data: {
                        code: couponCode,
                        discount: 20, // 20% OFF for Birthday? Or make it configurable. Let's hardcode 20% for now.
                        type: 'percentage',
                        userId: user.id,
                        isSystemGenerated: true,
                        expiresAt: new Date(today.setDate(today.getDate() + 30)), // Valid for 30 days
                        isActive: true
                    }
                });
                results.push({ userId: user.id, coupon: coupon.code, status: 'created' });
            } else {
                results.push({ userId: user.id, coupon: couponCode, status: 'already_exists' });
            }
        }

        return NextResponse.json({
            success: true,
            date: `${currentDay}/${currentMonth}`,
            processed: birthdayUsers.length,
            results
        });

    } catch (error) {
        console.error("Error generating birthday coupons:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
