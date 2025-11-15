# Deployment Guide

## 🚀 Deploying to GitHub Pages

Since GitHub Apps have permission restrictions for workflows, you'll need to manually set up GitHub Pages deployment:

### Option 1: Manual GitHub Pages Setup (Recommended)

1. **Go to your repository settings** on GitHub
2. **Navigate to Pages section** (Settings → Pages)
3. **Select source**: Deploy from a branch
4. **Choose branch**: `main` and `/ (root)`
5. **Save** and wait for deployment

### Option 2: Create the workflow manually

1. **Create the workflow file manually** in your repository:
   - Go to `.github/workflows/deploy.yml`
   - Copy the content from the `deploy.yml` file we created
   - Commit directly through GitHub web interface

### Option 3: Use GitHub CLI

```bash
# Install GitHub CLI if not already installed
gh auth login

# Create the workflow file
echo 'name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: "18"
    - run: npm ci
    - run: npm run build
    - uses: actions/configure-pages@v4
    - uses: actions/upload-pages-artifact@v3
      with:
        path: "."
    - uses: actions/deploy-pages@v4' > .github/workflows/deploy.yml

# Add and push the workflow file
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"
git push origin main
```

## 🌐 Alternative Deployment Options

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.`
4. Deploy automatically on push

### Vercel
1. Import your repository on Vercel
2. Framework preset: Static Site
3. Build command: `npm run build`
4. Output directory: `.`

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select your project and configure
# Set public directory: .
# Set single-page app: Yes
firebase deploy
```

## 🔧 Local Development

```bash
# Clone and setup
git clone https://github.com/kritsanan1/genspark-awesome-mcp.git
cd genspark-awesome-mcp
npm install

# Development server
npm run dev

# Build for production
npm run build
```

## 📊 Features Overview

Your deployed application includes:

- ✅ **285+ Tools** - Comprehensive curated list
- 🔍 **Smart Search** - Fuzzy search with instant results
- 🎯 **Advanced Filters** - Category, pricing, AI-based filtering
- 📱 **Mobile Responsive** - Optimized for all devices
- 🌓 **Dark/Light Theme** - Toggle themes with system detection
- 📊 **Real-time Stats** - Analytics and popularity tracking
- 💾 **Export Data** - JSON, CSV, PDF export functionality
- ⚡ **Fast Loading** - Optimized with service worker
- 📱 **PWA Support** - Install as standalone app

## 🔄 Updating Tools

To add new tools:

1. **Edit README.md** - Add tools in the format:
   ```markdown
   ### Category Name
   - Tool Name - https://example.com - Brief description
   ```

2. **Run the parser** (optional, happens automatically):
   ```bash
   node parse-tools.js
   ```

3. **Commit and push** - Changes will be deployed automatically

## 🆘 Troubleshooting

### Common Issues

1. **Pages not updating**: Clear browser cache or check GitHub Pages settings
2. **Search not working**: Check browser console for JavaScript errors
3. **Mobile display issues**: Test responsive design in browser dev tools
4. **Export not working**: Ensure popups are allowed for PDF exports

### Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the browser console for errors
- Test in incognito/private mode
- Try different browsers