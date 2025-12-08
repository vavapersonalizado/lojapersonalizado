const https = require('https');

// Paste the katakanaToRomaji function here for testing since we can't easily import ES modules in a quick node script without setup
function katakanaToRomaji(katakana) {
    if (!katakana) return '';

    let str = katakana;

    // Mapping table (copied from src/utils/romaji.js - simplified for test if needed, but better to use exact code)
    // I'll try to read the file content in the next step, but for now I'll use a placeholder or try to import if I can.
    // Actually, I'll just fetch from Zipcloud first to see what we get.
    return str;
}

const zip = '1000001'; // Chiyoda-ku, Tokyo
const zip2 = '4600002'; // Aichi, Nagoya, Marunouchi

function fetchZip(code) {
    const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`;
    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            console.log(`\nResults for ${code}:`);
            if (json.results) {
                json.results.forEach(r => {
                    console.log('Kana1 (Pref):', r.kana1);
                    console.log('Kana2 (City):', r.kana2);
                    console.log('Kana3 (Town):', r.kana3);
                    console.log('Address3 (Kanji):', r.address3);
                });
            } else {
                console.log('No results');
            }
        });
    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
}

fetchZip('1000001'); // Tokyo
fetchZip('4700111'); // Nisshin (Aichi) - random check
fetchZip('3050047'); // Tsukuba
