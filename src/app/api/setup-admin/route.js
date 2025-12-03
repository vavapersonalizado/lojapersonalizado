import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const emails = ['maicontsuda@gmail.com', 'projetovanvava@gmail.com'];

        const result = await prisma.user.updateMany({
            where: {
                email: {
                    in: emails
                }
            },
            data: {
                role: 'admin'
            }
        });

        return NextResponse.json({
            success: true,
            message: `Atualizado ${result.count} usuários para admin`,
            updatedEmails: emails
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
