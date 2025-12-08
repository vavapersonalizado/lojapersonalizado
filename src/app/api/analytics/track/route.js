import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/analytics/track - Registrar visualização ou uso
export async function POST(request) {
    try {
        const body = await request.json();
        const { type, itemId, itemName, itemCode, deviceType, referrer, incrementUse } = body;

        if (!type || !itemId || !itemName) {
            return NextResponse.json(
                { error: 'Missing required fields: type, itemId, itemName' },
                { status: 400 }
            );
        }

        // Buscar registro existente
        const existing = await prisma.analytics.findFirst({
            where: {
                type,
                itemId
            }
        });

        if (existing) {
            // Atualizar registro existente e registrar evento
            const updated = await prisma.analytics.update({
                where: { id: existing.id },
                data: {
                    views: incrementUse ? existing.views : existing.views + 1,
                    uses: incrementUse ? existing.uses + 1 : existing.uses,
                    lastViewedAt: new Date(),
                    deviceType: deviceType || existing.deviceType,
                    referrer: referrer || existing.referrer,
                    events: {
                        create: {
                            type: incrementUse ? 'use' : 'view'
                        }
                    }
                }
            });
            return NextResponse.json(updated);
        } else {
            // Criar novo registro e registrar evento
            const analytics = await prisma.analytics.create({
                data: {
                    type,
                    itemId,
                    itemName,
                    itemCode: itemCode || null,
                    views: incrementUse ? 0 : 1,
                    uses: incrementUse ? 1 : 0,
                    deviceType: deviceType || null,
                    referrer: referrer || null,
                    events: {
                        create: {
                            type: incrementUse ? 'use' : 'view'
                        }
                    }
                }
            });
            return NextResponse.json(analytics);
        }
    } catch (error) {
        console.error('Analytics tracking error:', error);
        return NextResponse.json(
            { error: 'Failed to track analytics' },
            { status: 500 }
        );
    }
}
