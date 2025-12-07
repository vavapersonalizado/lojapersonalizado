import { NextResponse } from 'next/server';
import { katakanaToRomaji, toFullWidth } from '@/utils/romaji';
import municipalities from '@/data/municipalities.json';

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

        // Convert Half-width Kana to Full-width for matching
        const prefKana = toFullWidth(result.kana1);
        const cityKana = toFullWidth(result.kana2);

        // 1. Try to find exact match in municipalities.json for Prefecture and City
        // This ensures the dropdowns will auto-select correctly
        const match = municipalities.find(m =>
            m.prefecture_kana === prefKana &&
            m.name_kana === cityKana
        );

        let prefecture = '';
        let city = '';

        if (match) {
            prefecture = match.prefecture_romaji;
            city = match.name_romaji;
        } else {
            // Fallback to algorithmic conversion if not found (e.g. new merger or data mismatch)
            prefecture = katakanaToRomaji(result.kana1);
            city = katakanaToRomaji(result.kana2);
        }

        // Town is usually not in municipalities.json (it only goes down to City/Ward level)
        // So we always use algorithmic conversion for Town
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
