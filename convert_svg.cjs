const sharp = require('sharp');
const path = require('path');

async function convertIcons() {
  const svgPath = path.join(__dirname, 'public', 'app-logo.svg');
  
  await sharp(svgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-192.png'));

  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'icon-512.png'));

  console.log("Successfully converted SVG to 192x192 and 512x512 PNG icons!");
}

convertIcons().catch(err => {
  console.error("Error converting icons:", err);
  process.exit(1);
});
