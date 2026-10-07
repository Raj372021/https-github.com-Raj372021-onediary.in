const fs = require('fs');
const path = require('path');

// Minimal valid PNG 1x1 base64 (blue pixel) expanded or we can write a simple 192x192 PNG generator
// Or even simpler, let's create valid PNG files with a solid blue color and white icon.
// A 192x192 solid blue PNG base64 string:
const png192Base64 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAADAQMAAAACbvd6AAAABlBMVEUAAP8A/wD/oL2nAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAW0lEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC3AcX9AAGq843UAAAAAElFTkSuQmCC";

// Let's decode and write
fs.writeFileSync(path.join(__dirname, 'public', 'icon-192.png'), Buffer.from(png192Base64, 'base64'));
fs.writeFileSync(path.join(__dirname, 'public', 'icon-512.png'), Buffer.from(png192Base64, 'base64'));
console.log("Icons created successfully!");
