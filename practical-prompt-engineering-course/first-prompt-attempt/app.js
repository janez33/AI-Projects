// Prompt Library Application
class PromptLibrary {
    constructor() {
        this.prompts = this.loadPrompts();
        this.form = document.getElementById('promptForm');
        this.titleInput = document.getElementById('promptTitle');
        this.contentInput = document.getElementById('promptContent');
        this.promptsList = document.getElementById('promptsList');
        this.promptCount = document.getElementById('promptCount');
        
        this.init();
    }

    init() {
        // Load and display prompts
        this.renderPrompts();
        
        // Set up form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPrompt();
        });
    }

    loadPrompts() {
        const stored = localStorage.getItem('promptLibrary');
        return stored ? JSON.parse(stored) : [];
    }

    saveToStorage() {
        localStorage.setItem('promptLibrary', JSON.stringify(this.prompts));
    }

    addPrompt() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();

        if (!title || !content) {
            return;
        }

        const prompt = {
            id: Date.now().toString(),
            title: title,
            content: content,
            createdAt: new Date().toISOString()
        };

        this.prompts.unshift(prompt); // Add to beginning of array
        this.saveToStorage();
        this.renderPrompts();
        
        // Clear form
        this.form.reset();
        this.titleInput.focus();

        // Show success feedback
        this.showSuccessAnimation();
    }

    deletePrompt(id) {
        if (confirm('Are you sure you want to delete this prompt?')) {
            this.prompts = this.prompts.filter(prompt => prompt.id !== id);
            this.saveToStorage();
            this.renderPrompts();
        }
    }

    renderPrompts() {
        // Update count
        const count = this.prompts.length;
        this.promptCount.textContent = `${count} ${count === 1 ? 'prompt' : 'prompts'}`;

        // Render prompts or empty state
        if (this.prompts.length === 0) {
            this.promptsList.innerHTML = `
                <p class="empty-state">No prompts saved yet. Add your first prompt above!</p>
            `;
            return;
        }

        this.promptsList.innerHTML = this.prompts.map(prompt => `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="prompt-header">
                    <h3 class="prompt-title">${this.escapeHtml(prompt.title)}</h3>
                </div>
                <div class="prompt-content">${this.escapeHtml(prompt.content)}</div>
                <div class="prompt-footer">
                    <span class="prompt-date">
                        ${this.formatDate(prompt.createdAt)}
                    </span>
                    <button 
                        class="btn btn-danger" 
                        onclick="promptLibrary.deletePrompt('${prompt.id}')"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccessAnimation() {
        const button = this.form.querySelector('.btn-primary');
        const originalText = button.innerHTML;
        button.innerHTML = '<span>✅</span> Saved!';
        button.style.background = 'var(--success-color)';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 1500);
    }
}

// Initialize the application when DOM is ready
let promptLibrary;
document.addEventListener('DOMContentLoaded', () => {
    promptLibrary = new PromptLibrary();
});

