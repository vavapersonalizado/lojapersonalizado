import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch visibility settings
        let siteSettings = await prisma.siteSettings.findUnique({
            where: { id: 'settings' }
        });

        if (!siteSettings) {
            siteSettings = await prisma.siteSettings.create({
                data: { id: 'settings' }
            });
        }

        // Fetch analytics order, adsense_id, and adsense_slot_id
        const settings = await prisma.settings.findMany({
            where: {
                key: { in: ['analytics_order', 'adsense_id', 'adsense_slot_id'] }
            }
        });

        const analyticsSetting = settings.find(s => s.key === 'analytics_order');
        const adsenseSetting = settings.find(s => s.key === 'adsense_id');
        const adsenseSlotSetting = settings.find(s => s.key === 'adsense_slot_id');

        // Default order if not set
        const defaultOrder = ['page', 'event', 'product', 'promotion', 'ad', 'partner', 'coupon'];

        let order = defaultOrder;
        if (analyticsSetting && analyticsSetting.value) {
            try {
                order = JSON.parse(analyticsSetting.value);
            } catch (e) {
                console.error('Error parsing analytics order:', e);
            }
        }

        // Merge settings
        return NextResponse.json({
            ...siteSettings,
            order,
            adsense_id: adsenseSetting?.value || '',
            adsense_slot_id: adsenseSlotSetting?.value || ''
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function PUT(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { showProducts, showCategories, showEvents, showPromotions, showPartners, showSponsors, showBlog, theme, adsense_id, adsense_slot_id } = body;

        // Handle AdSense ID
        if (adsense_id !== undefined) {
            await prisma.settings.upsert({
                where: { key: 'adsense_id' },
                update: { value: adsense_id },
                create: { key: 'adsense_id', value: adsense_id }
            });
        }

        // Handle AdSense Slot ID
        if (adsense_slot_id !== undefined) {
            await prisma.settings.upsert({
                where: { key: 'adsense_slot_id' },
                update: { value: adsense_slot_id },
                create: { key: 'adsense_slot_id', value: adsense_slot_id }
            });
        }

        const updateData = {};
        if (showProducts !== undefined) updateData.showProducts = showProducts;
        if (showCategories !== undefined) updateData.showCategories = showCategories;
        if (showEvents !== undefined) updateData.showEvents = showEvents;
        if (showPromotions !== undefined) updateData.showPromotions = showPromotions;
        if (showPartners !== undefined) updateData.showPartners = showPartners;
        if (showSponsors !== undefined) updateData.showSponsors = showSponsors;
        if (showBlog !== undefined) updateData.showBlog = showBlog;
        if (theme !== undefined) updateData.theme = theme;

        const updatedSettings = await prisma.siteSettings.upsert({
            where: { id: 'settings' },
            update: updateData,
            create: { id: 'settings', ...updateData }
        });

        return NextResponse.json(updatedSettings);
    } catch (error) {
        console.error('Error updating site settings:', error);
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { order } = body;

        if (!Array.isArray(order)) {
            return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
        }

        const setting = await prisma.settings.upsert({
            where: { key: 'analytics_order' },
            update: { value: JSON.stringify(order) },
            create: { key: 'analytics_order', value: JSON.stringify(order) }
        });

        return NextResponse.json({ order: JSON.parse(setting.value) });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
