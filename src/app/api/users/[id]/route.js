import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET(request, context) {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session || (session.user.role !== 'admin' && session.user.id !== id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                phone: true,
                notes: true,
                classification: true,
                deserveDiscount: true,
                discountType: true,
                discountValue: true,
                postalCode: true,
                prefecture: true,
                city: true,
                town: true,
                street: true,
                building: true,
                contactPreference: true,
                birthDate: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
    }
}

export async function PUT(request, context) {
    const session = await getServerSession(authOptions);

    const { id } = await context.params;

    if (!session || (session.user.role !== 'admin' && session.user.id !== id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        // Fields allowed for everyone (including self)
        const {
            name, phone,
            postalCode, prefecture, city, town, street, building, contactPreference,
            birthDate
        } = body;

        // Fields allowed only for admin
        let adminFields = {};
        if (session.user.role === 'admin') {
            const { classification, deserveDiscount, discountType, discountValue, role } = body;
            adminFields = {
                classification,
                deserveDiscount,
                discountType,
                discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
                role
            };
        }

        // Clean up undefined values
        const dataToUpdate = {
            name,
            phone,
            postalCode,
            prefecture,
            city,
            town,
            street,
            building,
            contactPreference,
            birthDate: birthDate ? new Date(birthDate) : undefined,
            ...adminFields
        };

        // Remove undefined keys
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

        // If user is not admin, ensure they can't update notes
        if (session.user.role !== 'admin') {
            delete dataToUpdate.notes;
        } else {
            // If admin passed notes, use it.
            if (body.notes !== undefined) dataToUpdate.notes = body.notes;
        }

        const user = await prisma.user.update({
            where: { id },
            data: dataToUpdate
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Error updating user" }, { status: 500 });
    }
}
