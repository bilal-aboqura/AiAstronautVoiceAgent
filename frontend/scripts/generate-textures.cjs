const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, getPixel) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = Math.max(0, Math.min(255, Math.floor(r)));
      rawData[pixelOffset + 1] = Math.max(0, Math.min(255, Math.floor(g)));
      rawData[pixelOffset + 2] = Math.max(0, Math.min(255, Math.floor(b)));
      rawData[pixelOffset + 3] = a !== undefined ? Math.max(0, Math.min(255, Math.floor(a))) : 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', deflated),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const outDir = path.resolve(__dirname, '../frontend/public/textures/planets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Higher resolution 512x256
const W = 512;
const H = 256;

// Simplex-like 2D noise helper
function pseudoNoise(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function fbm(x, y, octaves = 4) {
  let val = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * Math.sin(x * freq + pseudoNoise(freq * 0.1, freq * 0.2) * 6.28);
    amp *= 0.5;
    freq *= 2.0;
  }
  return val;
}

const targets = [
  {
    name: 'sun.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      const flare = Math.sin(u * 20 + v * 10) * 15 + Math.cos(u * 40 - v * 20) * 10;
      const r = 255;
      const g = 175 + flare;
      const b = 25 + flare * 0.5;
      return [r, g, b, 255];
    }
  },
  {
    name: 'mercury.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      const crater = (pseudoNoise(u * 50, v * 50) * 35) + (Math.sin(u * 20) * 15);
      const val = 150 - crater;
      return [val, val * 0.9, val * 0.8, 255];
    }
  },
  {
    name: 'venus.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      const swirl = Math.sin(u * 15 + Math.sin(v * 10) * 2) * 25 + Math.cos(v * 20) * 15;
      return [235 + swirl * 0.5, 195 + swirl * 0.8, 130 + swirl * 0.4, 255];
    }
  },
  {
    name: 'earth.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      // Polar ice
      if (v < 0.1 || v > 0.9) return [240, 245, 255, 255];
      // Continents & oceans
      const continent = Math.sin(u * 8) * Math.cos(v * 6) + Math.sin(u * 16 + v * 8) * 0.5 + Math.cos(u * 4) * 0.3;
      const clouds = (Math.sin(u * 25 + v * 12) + Math.cos(u * 12 - v * 20)) > 1.2 ? 60 : 0;
      if (continent > 0.25) {
        // Vegetation & mountains
        const veg = continent > 0.5 ? 40 : 0;
        return [45 + veg + clouds, 115 + clouds, 55 + clouds, 255];
      } else if (continent > 0.12) {
        // Coast / arid
        return [195 + clouds, 175 + clouds, 130 + clouds, 255];
      } else {
        // Deep blue ocean
        return [20 + clouds, 75 + clouds, 165 + clouds, 255];
      }
    }
  },
  {
    name: 'moon.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      const craters = pseudoNoise(u * 60, v * 60) * 40 + Math.sin(u * 15) * 15;
      const lum = 175 - craters;
      return [lum, lum, lum, 255];
    }
  },
  {
    name: 'mars.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      // Polar caps
      if (v < 0.08 || v > 0.92) return [245, 245, 245, 255];
      const canyon = Math.sin(u * 12 + v * 8) * 25 + (pseudoNoise(u * 30, v * 30) * 20);
      return [195 + canyon * 0.6, 75 + canyon * 0.3, 40 + canyon * 0.2, 255];
    }
  },
  {
    name: 'jupiter.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      // Atmospheric latitude bands
      const band = Math.sin(v * 35) * 30 + Math.sin(v * 70) * 15 + Math.cos(u * 15 + v * 10) * 10;
      // Great Red Spot around (0.6, 0.65)
      const distToSpot = Math.hypot((u - 0.6) * 2, (v - 0.65) * 5);
      const isRedSpot = distToSpot < 0.15;
      if (isRedSpot) {
        return [215, 60, 40, 255];
      }
      return [210 + band * 0.7, 160 + band * 0.6, 120 + band * 0.4, 255];
    }
  },
  {
    name: 'saturn.jpg',
    fn: (x, y, w, h) => {
      const v = y / h;
      const bands = Math.sin(v * 45) * 20 + Math.cos(v * 90) * 10;
      return [225 + bands * 0.5, 205 + bands * 0.4, 155 + bands * 0.3, 255];
    }
  },
  {
    name: 'saturn_ring.png',
    fn: (x, y, w, h) => {
      const u = x / w;
      // Concentric rings with Cassini division gap
      const ringPattern = Math.sin(u * 30) * 0.5 + 0.5;
      const cassiniGap = (u > 0.55 && u < 0.62) ? 0.05 : 1.0;
      const alpha = Math.floor(ringPattern * cassiniGap * 210);
      return [210, 185, 140, alpha];
    }
  },
  {
    name: 'uranus.jpg',
    fn: (x, y, w, h) => {
      const v = y / h;
      const grad = Math.sin(v * 10) * 15;
      return [115, 215 - grad, 255, 255];
    }
  },
  {
    name: 'neptune.jpg',
    fn: (x, y, w, h) => {
      const u = x / w;
      const v = y / h;
      const stormBands = Math.sin(u * 8 + v * 20) * 25 + Math.cos(v * 30) * 15;
      return [40 + stormBands * 0.4, 110 + stormBands * 0.6, 245, 255];
    }
  }
];

for (const t of targets) {
  const pngData = createPNG(W, H, t.fn);
  const outPath = path.join(outDir, t.name);
  fs.writeFileSync(outPath, pngData);
  console.log('Generated HD texture:', t.name);
}
