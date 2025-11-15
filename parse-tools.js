/**
 * Parser for converting README.md to structured JSON data
 */

const fs = require('fs');
const path = require('path');

// Read the README.md file
const readmeContent = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');

// Parse the content and extract tools
function parseReadmeToJson(content) {
    const tools = [];
    const lines = content.split('\n');
    
    let currentCategory = '';
    let currentSubcategory = '';
    
    lines.forEach(line => {
        // Skip empty lines
        if (!line.trim()) return;
        
        // Parse main categories (##)
        if (line.startsWith('## ')) {
            currentCategory = line.replace('## ', '').trim();
            currentSubcategory = '';
        }
        
        // Parse subcategories (###)
        if (line.startsWith('### ')) {
            currentSubcategory = line.replace('### ', '').trim();
        }
        
        // Parse tool entries (lines with - or •)
        if (line.match(/^[-•]\s/)) {
            const toolText = line.replace(/^[-•]\s/, '').trim();
            
            // Extract tool name and URL
            const toolMatch = toolText.match(/^([^-–—]+?)(?:\s*[-–—]\s*)(.+?)(?:\s*-\s*(.+))?$/);
            
            if (toolMatch) {
                const name = toolMatch[1].trim();
                const description = toolMatch[2].trim();
                const url = extractUrl(description);
                const cleanDescription = description.replace(/\[.*?\]\((.*?)\)/g, '').replace(/https?:\/\/[^\s]+/g, '').trim();
                
                tools.push({
                    id: generateId(name),
                    name: name,
                    description: cleanDescription,
                    url: url,
                    category: currentCategory,
                    subcategory: currentSubcategory,
                    tags: generateTags(name, description, currentCategory, currentSubcategory),
                    pricing: extractPricing(description),
                    aiBased: description.toLowerCase().includes('ai based') || description.toLowerCase().includes('ai-based'),
                    popular: isPopularTool(name),
                    free: description.toLowerCase().includes('free') || description.toLowerCase().includes('open source'),
                    addedDate: new Date().toISOString().split('T')[0]
                });
            }
        }
    });
    
    return tools;
}

function extractUrl(text) {
    const urlMatch = text.match(/https?:\/\/[^\s)]+/);
    return urlMatch ? urlMatch[0] : '';
}

function generateId(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

function generateTags(name, description, category, subcategory) {
    const tags = [];
    
    // Add category-based tags
    if (category) tags.push(category.toLowerCase().replace(/\s+/g, '-'));
    if (subcategory) tags.push(subcategory.toLowerCase().replace(/\s+/g, '-'));
    
    // Add keyword-based tags
    const keywords = [
        'ai', 'cloud', 'hosting', 'analytics', 'marketing', 'crm', 'collaboration',
        'productivity', 'design', 'development', 'security', 'storage', 'communication'
    ];
    
    const combinedText = `${name} ${description}`.toLowerCase();
    keywords.forEach(keyword => {
        if (combinedText.includes(keyword)) {
            tags.push(keyword);
        }
    });
    
    return [...new Set(tags)]; // Remove duplicates
}

function extractPricing(description) {
    const desc = description.toLowerCase();
    if (desc.includes('free')) return 'free';
    if (desc.includes('paid')) return 'paid';
    if (desc.includes('freemium')) return 'freemium';
    if (desc.includes('open source')) return 'open-source';
    return 'unknown';
}

function isPopularTool(name) {
    const popularTools = [
        'ChatGPT', 'Claude', 'GitHub', 'AWS', 'Google Analytics', 'Slack',
        'Notion', 'Canva', 'Figma', 'WordPress', 'Shopify', 'HubSpot',
        'Trello', 'Asana', 'VSCode', 'Docker', 'Firebase', 'Vercel'
    ];
    
    return popularTools.some(tool => name.toLowerCase().includes(tool.toLowerCase()));
}

// Generate the structured data
const toolsData = parseReadmeToJson(readmeContent);

// Create categories structure
const categories = {};
toolsData.forEach(tool => {
    if (!categories[tool.category]) {
        categories[tool.category] = {
            name: tool.category,
            count: 0,
            subcategories: {}
        };
    }
    
    categories[tool.category].count++;
    
    if (tool.subcategory) {
        if (!categories[tool.category].subcategories[tool.subcategory]) {
            categories[tool.category].subcategories[tool.subcategory] = {
                name: tool.subcategory,
                count: 0
            };
        }
        categories[tool.category].subcategories[tool.subcategory].count++;
    }
});

// Save the structured data
const output = {
    metadata: {
        generated: new Date().toISOString(),
        totalTools: toolsData.length,
        totalCategories: Object.keys(categories).length,
        version: '2.0.0'
    },
    categories: categories,
    tools: toolsData
};

fs.writeFileSync(path.join(__dirname, 'tools-data.json'), JSON.stringify(output, null, 2));

console.log(`✅ Successfully parsed ${toolsData.length} tools from README.md`);
console.log(`📊 Found ${Object.keys(categories).length} categories`);
console.log(`💾 Data saved to tools-data.json`);

module.exports = { parseReadmeToJson, extractUrl, generateId, generateTags };