/**
 * Awesome Startup Tools - Interactive Directory
 * Advanced features: search, filtering, theming, export, analytics
 */

class StartupToolsApp {
    constructor() {
        this.tools = [];
        this.filteredTools = [];
        this.fuse = null;
        this.currentView = 'grid';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.searchTerm = '';
        this.filters = {
            category: '',
            pricing: '',
            ai: '',
            sortBy: 'name'
        };
        this.analytics = {
            searches: 0,
            clicks: 0,
            exports: 0,
            themeSwitches: 0
        };
        
        this.init();
    }

    async init() {
        this.setTheme(this.currentTheme);
        await this.loadTools();
        this.setupEventListeners();
        this.setupSearch();
        this.populateFilters();
        this.applyFilters();
        this.updateStats();
        this.logAnalytics('app_init');
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        
        this.logAnalytics('theme_switch');
    }

    async loadTools() {
        try {
            this.showLoading(true);
            
            // Load tools data from JSON
            const response = await fetch('tools-data.json');
            const data = await response.json();
            
            this.tools = data.tools;
            this.filteredTools = [...this.tools];
            
            // Initialize Fuse.js for fuzzy search
            this.fuse = new Fuse(this.tools, {
                keys: [
                    { name: 'name', weight: 0.4 },
                    { name: 'description', weight: 0.3 },
                    { name: 'category', weight: 0.2 },
                    { name: 'tags', weight: 0.1 }
                ],
                threshold: 0.3,
                includeScore: true
            });
            
            this.showLoading(false);
            this.renderTools();
            
        } catch (error) {
            console.error('Error loading tools:', error);
            this.showError('Failed to load tools. Please refresh the page.');
            this.showLoading(false);
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value.trim();
                this.updateSearchClearButton();
                this.applyFilters();
                this.logAnalytics('search', { term: this.searchTerm });
            }, 300);
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.searchTerm = '';
            this.updateSearchClearButton();
            this.applyFilters();
        });

        // Search suggestions
        searchInput.addEventListener('focus', () => {
            if (this.searchTerm.length > 0) {
                this.showSearchSuggestions();
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSearchSuggestions(), 200);
        });
    }

    updateSearchClearButton() {
        const searchClear = document.getElementById('search-clear');
        searchClear.classList.toggle('hidden', this.searchTerm.length === 0);
    }

    showSearchSuggestions() {
        // Implementation for search suggestions
        const suggestions = this.getSearchSuggestions(this.searchTerm);
        // This would render a dropdown with suggestions
    }

    getSearchSuggestions(term) {
        if (term.length < 2) return [];
        
        const results = this.fuse.search(term, { limit: 5 });
        return results.map(result => result.item.name);
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
        });

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleExportMenu();
        });

        // Export options
        document.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const format = e.target.dataset.format;
                this.exportData(format);
                this.hideExportMenu();
            });
        });

        // Stats toggle
        document.getElementById('stats-toggle').addEventListener('click', () => {
            this.toggleStats();
        });

        // Filter controls
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('pricing-filter').addEventListener('change', (e) => {
            this.filters.pricing = e.target.value;
            this.applyFilters();
        });

        document.getElementById('ai-filter').addEventListener('change', (e) => {
            this.filters.ai = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.applyFilters();
        });

        // Reset filters
        document.getElementById('reset-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // View toggles
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                document.querySelectorAll('.view-toggle').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                this.renderTools();
            });
        });

        // Clear all filters
        document.getElementById('clear-all-filters').addEventListener('click', () => {
            this.resetFilters();
        });

        // Modal
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-group')) {
                this.hideExportMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        document.getElementById('search-input').focus();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.openAdvancedFilters();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideExportMenu();
            }
        });

        // Analytics tracking
        this.setupAnalyticsTracking();
    }

    populateFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const categories = [...new Set(this.tools.map(tool => tool.category))].sort();
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = `${category} (${this.tools.filter(t => t.category === category).length})`;
            categoryFilter.appendChild(option);
        });
    }

    applyFilters() {
        let filtered = [...this.tools];

        // Apply search
        if (this.searchTerm) {
            const searchResults = this.fuse.search(this.searchTerm);
            filtered = searchResults.map(result => result.item);
        }

        // Apply category filter
        if (this.filters.category) {
            filtered = filtered.filter(tool => tool.category === this.filters.category);
        }

        // Apply pricing filter
        if (this.filters.pricing) {
            filtered = filtered.filter(tool => tool.pricing === this.filters.pricing);
        }

        // Apply AI filter
        if (this.filters.ai) {
            const isAI = this.filters.ai === 'ai';
            filtered = filtered.filter(tool => tool.aiBased === isAI);
        }

        // Apply sorting
        filtered = this.sortTools(filtered, this.filters.sortBy);

        this.filteredTools = filtered;
        this.renderTools();
        this.updateResultsInfo();
        this.updateStats();
    }

    sortTools(tools, sortBy) {
        const sorted = [...tools];
        
        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            
            case 'category':
                return sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
            
            case 'popular':
                return sorted.sort((a, b) => {
                    const aPopular = a.popular ? 1 : 0;
                    const bPopular = b.popular ? 1 : 0;
                    return bPopular - aPopular || a.name.localeCompare(b.name);
                });
            
            case 'newest':
                return sorted.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
            
            default:
                return sorted;
        }
    }

    renderTools() {
        const container = document.getElementById('tools-container');
        const noResults = document.getElementById('no-results');
        
        if (this.filteredTools.length === 0) {
            container.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');
        
        const toolsHtml = this.filteredTools.map(tool => this.createToolCard(tool)).join('');
        
        container.innerHTML = `
            <div class="tools-${this.currentView}">
                ${toolsHtml}
            </div>
        `;

        // Add click listeners to tool cards
        container.querySelectorAll('.tool-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.openToolDetails(this.filteredTools[index]);
                this.logAnalytics('tool_click', { tool: this.filteredTools[index].name });
            });
        });
    }

    createToolCard(tool) {
        const badges = [];
        
        if (tool.aiBased) badges.push('<span class="badge badge-ai">AI</span>');
        if (tool.popular) badges.push('<span class="badge badge-popular">Popular</span>');
        if (tool.pricing === 'free') badges.push('<span class="badge badge-free">Free</span>');
        if (tool.pricing === 'paid') badges.push('<span class="badge badge-paid">Paid</span>');

        return `
            <div class="tool-card">
                <div class="tool-header">
                    <div>
                        <h3 class="tool-name">${this.escapeHtml(tool.name)}</h3>
                        <div class="tool-badges">${badges.join('')}</div>
                    </div>
                </div>
                <p class="tool-description">${this.escapeHtml(tool.description)}</p>
                <div class="tool-meta">
                    <span class="tool-category">${tool.category}</span>
                    ${tool.url ? `<a href="${tool.url}" target="_blank" class="tool-link" onclick="event.stopPropagation()">Visit →</a>` : ''}
                </div>
            </div>
        `;
    }

    openToolDetails(tool) {
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h2>${this.escapeHtml(tool.name)}</h2>
            <p><strong>Category:</strong> ${tool.category}</p>
            <p><strong>Description:</strong> ${this.escapeHtml(tool.description)}</p>
            ${tool.url ? `<p><strong>URL:</strong> <a href="${tool.url}" target="_blank">${tool.url}</a></p>` : ''}
            <p><strong>Pricing:</strong> ${tool.pricing}</p>
            <p><strong>AI-Based:</strong> ${tool.aiBased ? 'Yes' : 'No'}</p>
            <p><strong>Popular:</strong> ${tool.popular ? 'Yes' : 'No'}</p>
            <p><strong>Tags:</strong> ${tool.tags.join(', ')}</p>
        `;
        
        this.showModal();
    }

    exportData(format) {
        const data = this.filteredTools;
        const filename = `startup-tools-${new Date().toISOString().split('T')[0]}`;
        
        switch (format) {
            case 'json':
                this.downloadJSON(data, `${filename}.json`);
                break;
            
            case 'csv':
                this.downloadCSV(data, `${filename}.csv`);
                break;
            
            case 'pdf':
                this.downloadPDF(data, `${filename}.pdf`);
                break;
        }
        
        this.logAnalytics('export', { format, count: data.length });
    }

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this.downloadFile(blob, filename);
    }

    downloadCSV(data, filename) {
        const csv = Papa.unparse(data, {
            columns: ['name', 'description', 'url', 'category', 'subcategory', 'pricing', 'aiBased', 'popular', 'tags']
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        this.downloadFile(blob, filename);
    }

    downloadPDF(data, filename) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(16);
        doc.text('Awesome Startup Tools', 20, 20);
        
        doc.setFontSize(12);
        let y = 40;
        
        data.forEach((tool, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(`${index + 1}. ${tool.name}`, 20, y);
            doc.text(`Category: ${tool.category}`, 20, y + 10);
            doc.text(`Description: ${tool.description.substring(0, 80)}...`, 20, y + 20);
            y += 40;
        });
        
        doc.save(filename);
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    setupAnalyticsTracking() {
        // Track tool interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.tool-card')) {
                this.logAnalytics('tool_view');
            }
        });

        // Track search usage
        let searchTimer;
        document.getElementById('search-input').addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this.logAnalytics('search_used');
            }, 1000);
        });
    }

    logAnalytics(event, data = {}) {
        this.analytics[event] = (this.analytics[event] || 0) + 1;
        
        // Store in localStorage for persistence
        const analytics = JSON.parse(localStorage.getItem('analytics') || '{}');
        analytics[event] = (analytics[event] || 0) + 1;
        localStorage.setItem('analytics', JSON.stringify(analytics));
        
        // Console log for development
        console.log('Analytics:', event, data);
    }

    updateStats() {
        const aiTools = this.tools.filter(t => t.aiBased).length;
        const freeTools = this.tools.filter(t => t.pricing === 'free').length;
        const totalCategories = [...new Set(this.tools.map(t => t.category))].length;
        
        document.getElementById('ai-tools').textContent = aiTools;
        document.getElementById('free-tools').textContent = freeTools;
        document.getElementById('categories-count').textContent = totalCategories;
    }

    updateResultsInfo() {
        const resultsCount = document.getElementById('results-count');
        const searchTerm = document.getElementById('search-term');
        
        resultsCount.textContent = this.filteredTools.length;
        searchTerm.textContent = this.searchTerm ? ` matching "${this.searchTerm}"` : '';
    }

    resetFilters() {
        this.searchTerm = '';
        this.filters = {
            category: '',
            pricing: '',
            ai: '',
            sortBy: 'name'
        };
        
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('pricing-filter').value = '';
        document.getElementById('ai-filter').value = '';
        document.getElementById('sort-by').value = 'name';
        
        this.updateSearchClearButton();
        this.applyFilters();
        this.logAnalytics('filters_reset');
    }

    toggleExportMenu() {
        const menu = document.getElementById('export-menu');
        menu.classList.toggle('hidden');
    }

    hideExportMenu() {
        document.getElementById('export-menu').classList.add('hidden');
    }

    toggleStats() {
        const panel = document.getElementById('stats-panel');
        panel.classList.toggle('hidden');
        this.logAnalytics('stats_toggle');
    }

    showModal() {
        document.getElementById('modal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const container = document.getElementById('tools-container');
        container.innerHTML = `
            <div class="error">
                <p>${message}</p>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Advanced features
    openAdvancedFilters() {
        // Implementation for advanced filter modal
        console.log('Advanced filters opened');
    }

    hideSearchSuggestions() {
        // Implementation for hiding search suggestions
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StartupToolsApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('Service Worker registration failed:', err);
    });
}