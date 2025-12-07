import { NextResponse } from 'next/server';
import { katakanaToRomaji } from '@/utils/romaji';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const zip = searchParams.get('zip');

        if (!zip) {
            return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
        }

        // Call Zipcloud API
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
        const data = await res.json();

        if (data.status !== 200 || !data.results) {
            return NextResponse.json({ error: 'Address not found' }, { status: 404 });
        }

        const result = data.results[0];

        // Convert Kana to Romanji
        const prefecture = katakanaToRomaji(result.kana1);
        const city = katakanaToRomaji(result.kana2);
        const town = katakanaToRomaji(result.kana3);

        return NextResponse.json({
            postalCode: result.zipcode,
            prefecture,
            city,
            town,
            // Also return Kanji just in case
            prefectureKanji: result.address1,
            cityKanji: result.address2,
            townKanji: result.address3
        });

    } catch (error) {
        console.error('Address lookup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
