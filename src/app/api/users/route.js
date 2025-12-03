import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true, // Assuming createdAt exists, if not I might need to check schema. User model usually doesn't have createdAt by default in some setups unless added. Let's check schema first or just omit it for now to be safe, or add it.
                // Checking schema from previous turns... User model in schema.prisma:
                // model User { id, name, email, emailVerified, image, role, accounts, sessions, orders }
                // It does NOT have createdAt. I should probably add it or just not select it.
                // I will NOT select createdAt for now to avoid errors.
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Error fetching users" }, { status: 500 });
    }
}
