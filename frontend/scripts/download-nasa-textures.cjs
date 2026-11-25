const fs = require('fs');
const path = require('path');
const https = require('https');

const outDir = path.resolve(__dirname, '../public/textures/planets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const texturesToDownload = [
  // LDCastroverde (2K Solar System Scope NASA projections)
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/Sun.jpg',
    target: 'sun.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/mercury.jpg',
    target: 'mercury.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/venus.jpg',
    target: 'venus.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/mars.jpg',
    target: 'mars.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/jupiter.jpg',
    target: 'jupiter.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/saturn.jpg',
    target: 'saturn.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/uranus.jpg',
    target: 'uranus.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/LDCastroverde/SolarSystem-Planet-Textures/main/PlanetTextures/neptune.jpg',
    target: 'neptune.jpg'
  },

  // Three.js Official NASA Blue Marble & Multi-pass Maps for Earth & Moon
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    target: 'earth.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
    target: 'earth_clouds.png'
  },
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    target: 'earth_normal.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    target: 'earth_specular.jpg'
  },
  {
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
    target: 'moon.jpg'
  },

  // Saturn Alpha Ring (RGBA with transparency)
  {
    url: 'https://raw.githubusercontent.com/sanketsingh24/webgl-textures/master/textures/ringsRGBA.png',
    target: 'saturn_ring.png'
  }
];

function download(item) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, item.target);
    const file = fs.createWriteStream(dest);

    https.get(item.url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirected) => {
          redirected.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${item.target} (${fs.statSync(dest).size} bytes)`);
            resolve();
          });
        }).on('error', reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${item.url}: status ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${item.target} (${fs.statSync(dest).size} bytes)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Starting download of authentic NASA / Solar System Scope 2K textures...');
  for (const item of texturesToDownload) {
    try {
      await download(item);
    } catch (e) {
      console.error('Error downloading:', item.target, e.message);
    }
  }
  console.log('Finished downloading all textures.');
}

run();
