import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/admin/backup/upload - Upload backup to Cloudinary
export async function POST(request) {
    const session = await getServerSession(authOptions);

    // Permitir chamada autenticada via Header (para Cron Jobs) ou Sessão Admin
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCron && (!session || session.user.role !== 'admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { data, timestamp } = body;

        if (!data) {
            return NextResponse.json({ error: 'No data provided' }, { status: 400 });
        }

        // Convert data to string buffer
        const buffer = Buffer.from(JSON.stringify(data, null, 2));

        // Format date for filename
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_projetovava_${dateStr}.json`;

        // Upload to Cloudinary as "raw" file
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    folder: 'backups',
                    public_id: filename,
                    access_mode: 'authenticated' // Private file
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            created_at: result.created_at
        });

    } catch (error) {
        console.error('Backup upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload backup', details: error.message },
            { status: 500 }
        );
    }
}
