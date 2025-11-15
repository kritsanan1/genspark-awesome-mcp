/**
 * Build script for Awesome Startup Tools
 * Generates optimized files for production
 */

const fs = require('fs');
const path = require('path');

console.log('🏗️  Building Awesome Startup Tools...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// Copy essential files to dist
const filesToCopy = [
    'index.html',
    'styles.css',
    'app.js',
    'tools-data.json',
    'manifest.json',
    'sw.js'
];

filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    }
});

// Create a simple index.html for the dist folder
const distIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Awesome Startup Tools</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#2563eb">
</head>
<body>
    <div id="app">
        <h1>Loading...</h1>
    </div>
    <script src="app.js"></script>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'index.html'), distIndexHtml);

// Create a simple redirect from old README to new interface
const redirectHtml = `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="refresh" content="0; url=index.html">
    <title>Redirecting...</title>
</head>
<body>
    <p>Redirecting to <a href="index.html">Awesome Startup Tools</a>...</p>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, 'README.html'), redirectHtml);

console.log('✅ Build complete!');
console.log('📦 Files generated in /dist directory');
console.log('🚀 Ready for deployment!');