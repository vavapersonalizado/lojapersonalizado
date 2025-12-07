import { NextResponse } from 'next/server';
import municipalities from '@/data/municipalities.json';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const prefecture = searchParams.get('prefecture');

        if (!prefecture) {
            // Return list of all prefectures (unique)
            // The dataset is flat: { prefecture_romaji: "Hokkaido", ... }
            const prefectures = [...new Set(municipalities.map(m => m.prefecture_romaji))].sort();
            return NextResponse.json(prefectures);
        }

        // Return cities for the prefecture
        const cities = municipalities
            .filter(m => m.prefecture_romaji.toLowerCase() === prefecture.toLowerCase())
            .map(m => m.name_romaji)
            .sort();

        return NextResponse.json(cities);

    } catch (error) {
        console.error('Cities lookup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
