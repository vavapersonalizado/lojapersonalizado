import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Check if we can connect and count promotions
        const count = await prisma.promotion.count();

        // 2. Check if we can select the new field 'expiresAt'
        // If the field doesn't exist in the Prisma Client, this might throw or return undefined depending on how it's called,
        // but usually Prisma Client validation happens at runtime.
        // Let's try to find one promotion and see its keys.
        const sample = await prisma.promotion.findFirst();

        // 3. Try to create a dummy promotion with the new field to test write capability and schema sync
        const testTitle = "DEBUG_TEST_" + Date.now();
        let createResult = "Not attempted";
        let deleteResult = "Not attempted";

        try {
            const created = await prisma.promotion.create({
                data: {
                    title: testTitle,
                    expiresAt: new Date(), // This is the critical test
                    active: false
                }
            });
            createResult = "Success: " + created.id;

            // Cleanup
            await prisma.promotion.delete({ where: { id: created.id } });
            deleteResult = "Success";
        } catch (writeError) {
            createResult = "Failed: " + writeError.message;
        }

        return NextResponse.json({
            status: "Online",
            promotionCount: count,
            sampleKeys: sample ? Object.keys(sample) : "No promotions found",
            writeTest: {
                create: createResult,
                cleanup: deleteResult
            },
            env: {
                nodeEnv: process.env.NODE_ENV,
                // Don't expose full connection string for security, just check if it exists
                hasDatabaseUrl: !!process.env.POSTGRES_PRISMA_URL
            }
        });

    } catch (error) {
        return NextResponse.json({
            status: "Error",
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
