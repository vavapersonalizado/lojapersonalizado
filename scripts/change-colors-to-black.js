const fs = require('fs');
const path = require('path');

// Mapeamento de cores que devem ser alteradas para preto
const colorReplacements = {
    // Cinzas e cores de texto
    "'#6b7280'": "'#000000'",
    '"#6b7280"': '"#000000"',
    "'#64748b'": "'#000000'",
    '"#64748b"': '"#000000"',
    "'#888'": "'#000000'",
    '"#888"': '"#000000"',

    // Verdes (exceto para status/sucesso - manter)
    // "'green'": "'#000000'",
    // '"green"': '"#000000"',

    // Vermelhos (exceto para erros - manter)
    // "'red'": "'#000000'",
    // '"red"': '"#000000"',

    // Variáveis CSS que não sejam brancas
    "'var(--muted-foreground)'": "'#000000'",
    '"var(--muted-foreground)"': '"#000000"',
    "'var(--foreground)'": "'#000000'",
    '"var(--foreground)"': '"#000000"',

    // Cores específicas que devem ser pretas
    "color: '#047857'": "color: '#000000'",
    'color: "#047857"': 'color: "#000000"',
    "color: '#166534'": "color: '#000000'",
    'color: "#166534"': 'color: "#000000"',
    "color: '#15803d'": "color: '#000000'",
    'color: "#15803d"': 'color: "#000000"',
};

function replaceColorsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const [oldColor, newColor] of Object.entries(colorReplacements)) {
            if (content.includes(oldColor)) {
                content = content.replaceAll(oldColor, newColor);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Atualizado: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`❌ Erro em ${filePath}:`, error.message);
        return false;
    }
}

function scanDirectory(dir, extensions = ['.js', '.jsx']) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    let count = 0;

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            // Pular node_modules e .next
            if (file.name === 'node_modules' || file.name === '.next' || file.name === '.git') {
                continue;
            }
            count += scanDirectory(fullPath, extensions);
        } else if (extensions.some(ext => file.name.endsWith(ext))) {
            if (replaceColorsInFile(fullPath)) {
                count++;
            }
        }
    }

    return count;
}

console.log('🔍 Escaneando e alterando cores para preto...\n');

const srcDir = path.join(__dirname, '..', 'src');
const filesModified = scanDirectory(srcDir);

console.log(`\n✨ Concluído! ${filesModified} arquivo(s) modificado(s).`);
