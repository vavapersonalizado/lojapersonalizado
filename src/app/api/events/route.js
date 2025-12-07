
const events = await prisma.event.findMany({
    where,
    orderBy: { date: 'asc' }
});

return NextResponse.json(events);
    } catch (error) {
    return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
}
}

// POST: Create new event (Admin only)
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, date, description, images, htmlContent } = body;

        const event = await prisma.event.create({
            data: {
                title,
                date: new Date(date),
                description,
                images: images || [],
                htmlContent,
                active: true
            }
        });

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
    }
}

// DELETE: Remove event (Admin only)
export async function DELETE(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.event.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting event' }, { status: 500 });
    }
}

// PATCH: Update event (Admin only)
export async function PATCH(request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, active, title, description, date, images, htmlContent } = body;

        const updateData = {};
        if (active !== undefined) updateData.active = active;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (date !== undefined) updateData.date = new Date(date);
        if (images !== undefined) updateData.images = images;
        if (htmlContent !== undefined) updateData.htmlContent = htmlContent;

        const event = await prisma.event.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
    }
}
