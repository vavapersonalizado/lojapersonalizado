import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // The request body is the file stream
    const blob = await put(filename, request.body, {
        access: 'public',
    });

    return NextResponse.json(blob);
}
