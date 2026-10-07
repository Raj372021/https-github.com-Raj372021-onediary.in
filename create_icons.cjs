const fs = require('fs');
const path = require('path');

const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADAQMAAAACbvd6AAAABlBMVEUAAP8A/wD/oL2nAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAW0lEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AcX9AAGq843UAAAAAElFTkSuQmCC";

fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), Buffer.from(pngBase64, 'base64'));
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), Buffer.from(pngBase64, 'base64'));
console.log("Icons created successfully!");
