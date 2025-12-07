/**
 * Converts Katakana to Romanji (Hepburn).
 * Handles basic chars, dakuten, handakuten, and small chars (yoon, sokuon).
 */
export function katakanaToRomaji(katakana) {
    if (!katakana) return '';

    let str = katakana;

    // 1. Small Tsu (Sokuon) - double the next consonant
    // We'll handle this by looking ahead during the main loop or replacing first.
    // Easier to replace first if we can, but regex is tricky with "next char".
    // Let's do it in the loop.

    // Mapping table
    const map = {
        'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
        'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
        'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
        'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
        'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
        'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
        'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
        'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
        'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
        'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
        'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
        'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
        'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
        'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
        'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
        'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
        'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
        'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
        'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
        'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
        'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
        'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
        'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
        'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
        'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
        'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
        'ヴァ': 'va', 'ヴィ': 'vi', 'ヴ': 'vu', 'ヴェ': 've', 'ヴォ': 'vo',
        'ー': '' // Long vowel mark - usually ignored or macron. Let's ignore for simple address.
    };

    let result = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        const next = str[i + 1];

        // Check for compound (Yoon) first: Ki + ya -> kya
        if (next && ['ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ'].includes(next)) {
            const compound = char + next;
            if (map[compound]) {
                result += map[compound];
                i++; // Skip next
                continue;
            }
        }

        // Check for Sokuon (Small Tsu)
        if (char === 'ッ') {
            if (next) {
                // Get the romanji of the next char to find its first letter
                // This is a bit complex because next char might be a compound.
                // Simplified: just look at next char map or default.
                // If next is 'k', 's', 't', 'p', etc.
                // Let's peek ahead.
                let nextRomaji = '';
                // Check compound for next
                if (str[i + 2] && ['ャ', 'ュ', 'ョ'].includes(str[i + 2])) {
                    const nextCompound = next + str[i + 2];
                    nextRomaji = map[nextCompound] || '';
                } else {
                    nextRomaji = map[next] || '';
                }

                if (nextRomaji) {
                    result += nextRomaji[0]; // Double the consonant
                    continue;
                }
            }
        }

        if (map[char]) {
            result += map[char];
        } else {
            // Keep original if not found (e.g. numbers, spaces)
            result += char;
        }
    }

    // Capitalize first letter of each word (simple heuristic)
    // result = result.charAt(0).toUpperCase() + result.slice(1);

    // Better: Capitalize standard Hepburn style (e.g. "Tokyo")
    // For addresses, usually "Shinjuku-ku" or "Shinjuku Ku".
    // Let's just return lowercase or capitalized?
    // Let's Capitalize First Letter.
    return result.charAt(0).toUpperCase() + result.slice(1);
}
