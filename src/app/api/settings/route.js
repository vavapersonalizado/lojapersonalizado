import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: 'settings' }
        });

        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: { id: 'settings' }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: "Error fetching settings" }, { status: 500 });
    }
}

export async function PUT(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const settings = await prisma.siteSettings.upsert({
            where: { id: 'settings' },
            update: body,
            create: { id: 'settings', ...body }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: "Error updating settings" }, { status: 500 });
    }
}
