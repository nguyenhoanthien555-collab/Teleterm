/**
 * Icon Generator for TeleTerm Desktop Client
 * Generates build/icon.png and build/icon.ico
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const BUILD_DIR = path.join(__dirname, '../build');
if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
}

function createIconPNG(size = 256) {
    const png = new PNG({ width: size, height: size });
    const center = size / 2;
    const radius = size * 0.44;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (size * y + x) << 2;
            const dx = x - center;
            const dy = y - center;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= radius) {
                // Outer glow rim
                const rimFactor = (dist / radius);
                if (rimFactor > 0.88) {
                    // Cyan glow border
                    png.data[idx] = 0;       // R
                    png.data[idx + 1] = 240; // G
                    png.data[idx + 2] = 255; // B
                    png.data[idx + 3] = 255; // A
                } else {
                    // Deep anime obsidian cyber gradient
                    const grad = (y / size);
                    png.data[idx] = Math.round(7 + grad * 15);     // R
                    png.data[idx + 1] = Math.round(12 + grad * 25); // G
                    png.data[idx + 2] = Math.round(26 + grad * 40); // B
                    png.data[idx + 3] = 255; // A
                }

                // Draw stylized lightning / blossom motif in center
                // Central diamond/bolt: |dx| * 1.5 + |dy| <= radius * 0.6
                const boltShape = Math.abs(dx * 1.3) + Math.abs(dy * 0.9);
                if (boltShape < radius * 0.45) {
                    png.data[idx] = 56;
                    png.data[idx + 1] = 189;
                    png.data[idx + 2] = 248;
                    png.data[idx + 3] = 255;
                }
                if (boltShape < radius * 0.22) {
                    // Inner core white-gold
                    png.data[idx] = 255;
                    png.data[idx + 1] = 255;
                    png.data[idx + 2] = 255;
                    png.data[idx + 3] = 255;
                }
            } else if (dist <= radius + 2) {
                // Antialiasing edge
                const alpha = Math.max(0, Math.min(255, Math.round((radius + 2 - dist) * 128)));
                png.data[idx] = 0;
                png.data[idx + 1] = 240;
                png.data[idx + 2] = 255;
                png.data[idx + 3] = alpha;
            } else {
                // Transparent background
                png.data[idx] = 0;
                png.data[idx + 1] = 0;
                png.data[idx + 2] = 0;
                png.data[idx + 3] = 0;
            }
        }
    }

    return PNG.sync.write(png);
}

function createICOFromPNG(pngBuffer) {
    // ICO Header (6 bytes)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // Reserved
    header.writeUInt16LE(1, 2); // ICO format
    header.writeUInt16LE(1, 4); // 1 image

    // Image Directory Entry (16 bytes)
    const dir = Buffer.alloc(16);
    dir.writeUInt8(0, 0); // Width (0 = 256px)
    dir.writeUInt8(0, 1); // Height (0 = 256px)
    dir.writeUInt8(0, 2); // Color palette
    dir.writeUInt8(0, 3); // Reserved
    dir.writeUInt16LE(1, 4); // Color planes
    dir.writeUInt16LE(32, 6); // Bits per pixel
    dir.writeUInt32LE(pngBuffer.length, 8); // Size of image data
    dir.writeUInt32LE(22, 12); // Offset of image data (6 + 16 = 22)

    return Buffer.concat([header, dir, pngBuffer]);
}

const pngBuf = createIconPNG(256);
const pngPath = path.join(BUILD_DIR, 'icon.png');
fs.writeFileSync(pngPath, pngBuf);
console.log(`[IconGen] Saved ${pngPath} (${pngBuf.length} bytes)`);

const icoBuf = createICOFromPNG(pngBuf);
const icoPath = path.join(BUILD_DIR, 'icon.ico');
fs.writeFileSync(icoPath, icoBuf);
console.log(`[IconGen] Saved ${icoPath} (${icoBuf.length} bytes)`);

// Also save assets/anime_countryside_bg.jpg if not present (subtle fallback poster)
const assetsDir = path.join(__dirname, '../public/assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}
