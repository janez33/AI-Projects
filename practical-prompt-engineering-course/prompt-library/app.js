// Get DOM elements
const promptForm = document.getElementById('promptForm');
const promptTitle = document.getElementById('promptTitle');
const promptModel = document.getElementById('promptModel');
const promptContent = document.getElementById('promptContent');
const isCodePrompt = document.getElementById('isCodePrompt');
const promptsContainer = document.getElementById('promptsContainer');

// Current filter state
let currentFilter = 'all';

// ========================================
// METADATA TRACKING SYSTEM
// ========================================

/**
 * Validates ISO 8601 date string
 * @param {string} dateString - ISO 8601 date string
 * @returns {boolean} True if valid
 */
function isValidISO8601(dateString) {
    try {
        const date = new Date(dateString);
        return date.toISOString() === dateString;
    } catch (e) {
        return false;
    }
}

/**
 * Validates model name
 * @param {string} modelName - Model name to validate
 * @throws {Error} If validation fails
 */
function validateModelName(modelName) {
    if (!modelName || typeof modelName !== 'string') {
        throw new Error('Model name must be a non-empty string');
    }
    if (modelName.trim().length === 0) {
        throw new Error('Model name cannot be empty or only whitespace');
    }
    if (modelName.length > 100) {
        throw new Error('Model name cannot exceed 100 characters');
    }
}

/**
 * Estimate token count from text
 * @param {string} text - Text to estimate tokens for
 * @param {boolean} isCode - Whether the text is code
 * @returns {Object} Token estimate with min, max, and confidence
 */
function estimateTokens(text, isCode = false) {
    if (!text || typeof text !== 'string') {
        return { min: 0, max: 0, confidence: 'high' };
    }
    
    // Calculate base estimates
    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;
    
    let minTokens = Math.ceil(0.75 * wordCount);
    let maxTokens = Math.ceil(0.25 * charCount);
    
    // Apply code multiplier if needed
    if (isCode) {
        minTokens = Math.ceil(minTokens * 1.3);
        maxTokens = Math.ceil(maxTokens * 1.3);
    }
    
    // Determine confidence level
    const avgTokens = (minTokens + maxTokens) / 2;
    let confidence;
    if (avgTokens < 1000) {
        confidence = 'high';
    } else if (avgTokens <= 5000) {
        confidence = 'medium';
    } else {
        confidence = 'low';
    }
    
    return {
        min: minTokens,
        max: maxTokens,
        confidence: confidence
    };
}

/**
 * Track model metadata for a prompt
 * @param {string} modelName - Name of the AI model
 * @param {string} content - Prompt content
 * @param {boolean} isCode - Whether content is code
 * @returns {Object} Metadata object
 * @throws {Error} If validation fails
 */
function trackModel(modelName, content, isCode = false) {
    try {
        // Validate inputs
        validateModelName(modelName);
        
        if (!content || typeof content !== 'string') {
            throw new Error('Content must be a non-empty string');
        }
        
        // Generate timestamps
        const now = new Date().toISOString();
        
        // Calculate token estimate
        const tokenEstimate = estimateTokens(content, isCode);
        
        // Create metadata object
        const metadata = {
            model: modelName.trim(),
            createdAt: now,
            updatedAt: now,
            tokenEstimate: tokenEstimate
        };
        
        return metadata;
    } catch (error) {
        throw new Error(`Failed to track model: ${error.message}`);
    }
}

/**
 * Update timestamps in metadata
 * @param {Object} metadata - Existing metadata object
 * @returns {Object} Updated metadata object
 * @throws {Error} If validation fails
 */
function updateTimestamps(metadata) {
    try {
        if (!metadata || typeof metadata !== 'object') {
            throw new Error('Metadata must be a valid object');
        }
        
        // Validate existing createdAt
        if (!metadata.createdAt || !isValidISO8601(metadata.createdAt)) {
            throw new Error('Invalid or missing createdAt timestamp');
        }
        
        // Generate new updatedAt
        const now = new Date().toISOString();
        const createdDate = new Date(metadata.createdAt);
        const updatedDate = new Date(now);
        
        // Validate updatedAt >= createdAt
        if (updatedDate < createdDate) {
            throw new Error('updatedAt must be greater than or equal to createdAt');
        }
        
        // Return updated metadata
        return {
            ...metadata,
            updatedAt: now
        };
    } catch (error) {
        throw new Error(`Failed to update timestamps: ${error.message}`);
    }
}

// Load prompts when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPrompts();
    setupFilterTabs();
});

// Handle form submission
promptForm.addEventListener('submit', function(e) {
    e.preventDefault();
    savePrompt();
});

// Save prompt to localStorage
function savePrompt() {
    const title = promptTitle.value.trim();
    const model = promptModel.value.trim();
    const content = promptContent.value.trim();
    const isCode = isCodePrompt.checked;
    
    if (!title || !model || !content) {
        return;
    }
    
    try {
        // Get existing prompts or initialize empty array
        const prompts = getPromptsFromStorage();
        
        // Generate metadata
        const metadata = trackModel(model, content, isCode);
        
        // Create new prompt object
        const newPrompt = {
            id: Date.now(),
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            rating: 0,
            isFavorite: false,
            notes: [],
            metadata: metadata
        };
        
        // Add to prompts array
        prompts.push(newPrompt);
        
        // Save to localStorage
        localStorage.setItem('prompts', JSON.stringify(prompts));
        
        // Clear form
        promptTitle.value = '';
        promptModel.value = '';
        promptContent.value = '';
        isCodePrompt.checked = false;
        
        // Reload display
        loadPrompts();
    } catch (error) {
        alert(`Error saving prompt: ${error.message}`);
        console.error('Save prompt error:', error);
    }
}

// Get prompts from localStorage
function getPromptsFromStorage() {
    const prompts = localStorage.getItem('prompts');
    if (!prompts) return [];
    
    // Parse and migrate old prompts to include new fields
    const parsedPrompts = JSON.parse(prompts);
    return parsedPrompts.map(prompt => {
        // Ensure all basic fields exist
        const migratedPrompt = {
            ...prompt,
            rating: prompt.rating !== undefined ? prompt.rating : 0,
            isFavorite: prompt.isFavorite !== undefined ? prompt.isFavorite : false,
            notes: prompt.notes !== undefined ? prompt.notes : []
        };
        
        // Migrate old prompts to include metadata
        if (!migratedPrompt.metadata) {
            try {
                migratedPrompt.metadata = trackModel(
                    'Unknown Model', 
                    migratedPrompt.content || '', 
                    false
                );
                // Preserve original createdAt if available
                if (migratedPrompt.createdAt) {
                    migratedPrompt.metadata.createdAt = migratedPrompt.createdAt;
                    migratedPrompt.metadata.updatedAt = migratedPrompt.createdAt;
                }
            } catch (e) {
                console.error('Error migrating prompt metadata:', e);
            }
        }
        
        return migratedPrompt;
    });
}

// Setup filter tab event listeners
function setupFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update filter and reload
            currentFilter = tab.dataset.filter;
            loadPrompts();
        });
    });
}

// Filter prompts based on current filter
function filterPrompts(prompts) {
    switch (currentFilter) {
        case 'favorites':
            return prompts.filter(p => p.isFavorite);
        case 'toprated':
            return prompts.filter(p => p.rating >= 4);
        case 'all':
        default:
            return prompts;
    }
}

// Load and display all prompts
function loadPrompts() {
    let prompts = getPromptsFromStorage();
    
    // Apply filter
    prompts = filterPrompts(prompts);
    
    // Sort by createdAt descending (newest first)
    prompts.sort((a, b) => {
        const dateA = a.metadata?.createdAt || a.createdAt || 0;
        const dateB = b.metadata?.createdAt || b.createdAt || 0;
        return new Date(dateB) - new Date(dateA);
    });
    
    // Clear container
    promptsContainer.innerHTML = '';
    
    // Check if there are no prompts
    if (prompts.length === 0) {
        const emptyMessage = currentFilter === 'all' 
            ? 'No prompts saved yet. Create your first prompt above!'
            : currentFilter === 'favorites'
            ? 'No favorite prompts yet. Click the heart icon on a prompt to add it to favorites!'
            : 'No top-rated prompts yet. Rate your prompts with 4 or 5 stars to see them here!';
        promptsContainer.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }
    
    // Display each prompt (already sorted newest first)
    prompts.forEach(prompt => {
        const card = createPromptCard(prompt);
        promptsContainer.appendChild(card);
    });
}

// Create a prompt card element
function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'prompt-card';
    
    // Create favorite button (positioned absolutely in top-right)
    const favoriteBtn = createFavoriteButton(prompt);
    card.appendChild(favoriteBtn);
    
    // Create title
    const title = document.createElement('h3');
    title.textContent = prompt.title;
    
    // Create metadata display
    if (prompt.metadata) {
        const metadataDisplay = createMetadataDisplay(prompt.metadata);
        card.appendChild(metadataDisplay);
    }
    
    // Create content preview (first few words)
    const preview = document.createElement('div');
    preview.className = 'prompt-preview';
    const words = prompt.content.split(' ').slice(0, 15).join(' ');
    preview.textContent = words + (prompt.content.split(' ').length > 15 ? '...' : '');
    
    // Create star rating component
    const starRating = createStarRating(prompt);
    
    // Create notes section
    const notesSection = createNotesSection(prompt);
    
    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deletePrompt(prompt.id));
    
    // Append elements to card
    card.appendChild(title);
    card.appendChild(preview);
    card.appendChild(starRating);
    card.appendChild(notesSection);
    card.appendChild(deleteBtn);
    
    return card;
}

// Create star rating component
function createStarRating(prompt) {
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'star-rating';
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        star.dataset.value = i;
        
        // Set filled/empty state based on current rating
        if (i <= prompt.rating) {
            star.classList.add('filled');
        }
        
        // Click handler to set rating
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            updateRating(prompt.id, i);
        });
        
        // Hover preview
        star.addEventListener('mouseenter', () => previewRating(ratingContainer, i));
        
        ratingContainer.appendChild(star);
    }
    
    // Reset preview on mouse leave
    ratingContainer.addEventListener('mouseleave', () => {
        resetRatingDisplay(ratingContainer, prompt.rating);
    });
    
    return ratingContainer;
}

// Preview rating on hover
function previewRating(container, hoverValue) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < hoverValue) {
            star.classList.add('filled', 'preview');
        } else {
            star.classList.remove('filled', 'preview');
        }
    });
}

// Reset to actual rating
function resetRatingDisplay(container, actualRating) {
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.classList.remove('preview');
        if (index < actualRating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Update rating in storage
function updateRating(promptId, newRating) {
    const prompts = getPromptsFromStorage();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
        // Toggle: if clicking same rating, set to 0 (unrate)
        prompt.rating = prompt.rating === newRating ? 0 : newRating;
        localStorage.setItem('prompts', JSON.stringify(prompts));
        loadPrompts();
    }
}

// Create favorite toggle button
function createFavoriteButton(prompt) {
    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.setAttribute('aria-label', 'Toggle favorite');
    
    // Set heart icon based on favorite status
    favoriteBtn.textContent = prompt.isFavorite ? '♥' : '♡';
    if (prompt.isFavorite) {
        favoriteBtn.classList.add('favorited');
    }
    
    // Click handler to toggle favorite
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavorite(prompt.id);
    });
    
    return favoriteBtn;
}

// Toggle favorite status
function toggleFavorite(promptId) {
    const prompts = getPromptsFromStorage();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
        prompt.isFavorite = !prompt.isFavorite;
        localStorage.setItem('prompts', JSON.stringify(prompts));
        loadPrompts();
    }
}

// Delete prompt from localStorage
function deletePrompt(id) {
    let prompts = getPromptsFromStorage();
    
    // Filter out the prompt with the given id
    prompts = prompts.filter(prompt => prompt.id !== id);
    
    // Save updated prompts to localStorage
    localStorage.setItem('prompts', JSON.stringify(prompts));
    
    // Reload display
    loadPrompts();
}

/**
 * Format timestamp to readable format (e.g., "Dec 26, 2:30 PM")
 * @param {string} isoString - ISO timestamp string
 * @returns {string} Formatted date string
 */
function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Create metadata display component
 * @param {Object} metadata - Metadata object
 * @returns {HTMLElement} Metadata display element
 */
function createMetadataDisplay(metadata) {
    const metadataContainer = document.createElement('div');
    metadataContainer.className = 'metadata-container';
    
    // Model name badge
    const modelBadge = document.createElement('div');
    modelBadge.className = 'metadata-badge model-badge';
    modelBadge.innerHTML = `<span class="badge-icon">🤖</span> <span class="badge-text">${metadata.model}</span>`;
    
    // Token estimate display
    const tokenEstimate = metadata.tokenEstimate;
    const tokenBadge = document.createElement('div');
    tokenBadge.className = `metadata-badge token-badge confidence-${tokenEstimate.confidence}`;
    
    // Format token range
    const tokenRange = `${tokenEstimate.min}-${tokenEstimate.max} tokens`;
    tokenBadge.innerHTML = `<span class="badge-icon">📊</span> <span class="badge-text">${tokenRange}</span>`;
    tokenBadge.title = `Confidence: ${tokenEstimate.confidence}`;
    
    // Timestamps display
    const timestampsContainer = document.createElement('div');
    timestampsContainer.className = 'metadata-timestamps';
    
    const createdSpan = document.createElement('span');
    createdSpan.className = 'metadata-timestamp';
    createdSpan.innerHTML = `<span class="timestamp-icon">📅</span> ${formatTimestamp(metadata.createdAt)}`;
    createdSpan.title = `Created: ${metadata.createdAt}`;
    
    // Show updated timestamp only if different from created
    if (metadata.updatedAt !== metadata.createdAt) {
        const updatedSpan = document.createElement('span');
        updatedSpan.className = 'metadata-timestamp updated';
        updatedSpan.innerHTML = `<span class="timestamp-icon">✏️</span> ${formatTimestamp(metadata.updatedAt)}`;
        updatedSpan.title = `Updated: ${metadata.updatedAt}`;
        timestampsContainer.appendChild(updatedSpan);
    }
    
    timestampsContainer.appendChild(createdSpan);
    
    // Assemble metadata container
    const badgesRow = document.createElement('div');
    badgesRow.className = 'metadata-badges-row';
    badgesRow.appendChild(modelBadge);
    badgesRow.appendChild(tokenBadge);
    
    metadataContainer.appendChild(badgesRow);
    metadataContainer.appendChild(timestampsContainer);
    
    return metadataContainer;
}

/**
 * Create notes section UI for a prompt card
 * @param {Object} prompt - The prompt object
 * @returns {HTMLElement} Notes section element
 */
function createNotesSection(prompt) {
    const notesSection = document.createElement('div');
    notesSection.className = 'notes-section';
    notesSection.dataset.promptId = prompt.id;
    
    // Create notes toggle button
    const notesToggle = document.createElement('button');
    notesToggle.className = 'notes-toggle';
    notesToggle.innerHTML = `
        <span class="notes-icon">📝</span>
        Notes <span class="notes-count">(${prompt.notes.length})</span>
    `;
    notesToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNotesSection(prompt.id);
    });
    
    // Create notes content area (initially hidden)
    const notesContent = document.createElement('div');
    notesContent.className = 'notes-content hidden';
    notesContent.dataset.promptId = prompt.id;
    
    // Create notes list
    const notesList = document.createElement('div');
    notesList.className = 'notes-list';
    
    // Populate notes list
    if (prompt.notes.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'notes-empty-state';
        emptyState.textContent = 'No notes yet. Click "Add Note" to get started.';
        notesList.appendChild(emptyState);
    } else {
        prompt.notes.forEach(note => {
            const noteCard = createNoteCard(prompt.id, note);
            notesList.appendChild(noteCard);
        });
    }
    
    // Create add note button
    const addNoteBtn = document.createElement('button');
    addNoteBtn.className = 'btn-add-note';
    addNoteBtn.textContent = '+ Add Note';
    addNoteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showAddNoteInput(prompt.id);
    });
    
    notesContent.appendChild(notesList);
    notesContent.appendChild(addNoteBtn);
    
    notesSection.appendChild(notesToggle);
    notesSection.appendChild(notesContent);
    
    return notesSection;
}

/**
 * Create individual note card element
 * @param {number} promptId - The prompt ID
 * @param {Object} note - The note object
 * @returns {HTMLElement} Note card element
 */
function createNoteCard(promptId, note) {
    const noteCard = document.createElement('div');
    noteCard.className = 'note-card';
    noteCard.dataset.noteId = note.id;
    
    const noteContent = document.createElement('div');
    noteContent.className = 'note-content';
    noteContent.textContent = note.content;
    
    const noteFooter = document.createElement('div');
    noteFooter.className = 'note-footer';
    
    const noteTimestamp = document.createElement('span');
    noteTimestamp.className = 'note-timestamp';
    noteTimestamp.textContent = formatTimestamp(note.createdAt);
    
    const noteActions = document.createElement('div');
    noteActions.className = 'note-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'note-action-btn edit-btn';
    editBtn.innerHTML = '✏️';
    editBtn.title = 'Edit note';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editNote(promptId, note.id);
    });
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'note-action-btn delete-btn';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete note';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteNote(promptId, note.id);
    });
    
    noteActions.appendChild(editBtn);
    noteActions.appendChild(deleteBtn);
    
    noteFooter.appendChild(noteTimestamp);
    noteFooter.appendChild(noteActions);
    
    noteCard.appendChild(noteContent);
    noteCard.appendChild(noteFooter);
    
    return noteCard;
}

/**
 * Toggle notes section expand/collapse
 * @param {number} promptId - The prompt ID
 */
function toggleNotesSection(promptId) {
    const notesContent = document.querySelector(`.notes-content[data-prompt-id="${promptId}"]`);
    if (notesContent) {
        notesContent.classList.toggle('hidden');
    }
}

/**
 * Show add note input area
 * @param {number} promptId - The prompt ID
 */
function showAddNoteInput(promptId) {
    const notesContent = document.querySelector(`.notes-content[data-prompt-id="${promptId}"]`);
    const notesList = notesContent.querySelector('.notes-list');
    const addNoteBtn = notesContent.querySelector('.btn-add-note');
    
    // Check if input already exists
    if (notesContent.querySelector('.note-input-area')) {
        return;
    }
    
    // Hide add note button
    addNoteBtn.style.display = 'none';
    
    // Create input area
    const inputArea = document.createElement('div');
    inputArea.className = 'note-input-area';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'note-textarea';
    textarea.placeholder = 'Enter your note...';
    textarea.maxLength = 500;
    textarea.rows = 3;
    
    const charCounter = document.createElement('div');
    charCounter.className = 'character-counter';
    charCounter.textContent = '0/500';
    
    // Update character counter on input
    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        charCounter.textContent = `${length}/500`;
        if (length >= 500) {
            charCounter.classList.add('at-limit');
        } else {
            charCounter.classList.remove('at-limit');
        }
    });
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'note-button-group';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-note-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
        const content = textarea.value.trim();
        if (content) {
            saveNote(promptId, content);
        }
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-note-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        inputArea.remove();
        addNoteBtn.style.display = 'block';
    });
    
    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(cancelBtn);
    
    inputArea.appendChild(textarea);
    inputArea.appendChild(charCounter);
    inputArea.appendChild(buttonGroup);
    
    notesContent.insertBefore(inputArea, addNoteBtn);
    
    // Auto-focus textarea
    textarea.focus();
}

/**
 * Save new note to prompt
 * @param {number} promptId - The prompt ID
 * @param {string} noteContent - The note content
 */
function saveNote(promptId, noteContent) {
    // Validate content
    if (!noteContent || noteContent.trim().length === 0) {
        return;
    }
    
    const prompts = getPromptsFromStorage();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
        const newNote = {
            id: Date.now(),
            content: noteContent,
            createdAt: new Date().toISOString()
        };
        
        prompt.notes.push(newNote);
        
        try {
            localStorage.setItem('prompts', JSON.stringify(prompts));
            loadPrompts();
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some prompts or notes.');
            }
        }
    }
}

/**
 * Delete note from prompt
 * @param {number} promptId - The prompt ID
 * @param {number} noteId - The note ID
 */
function deleteNote(promptId, noteId) {
    const prompts = getPromptsFromStorage();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
        prompt.notes = prompt.notes.filter(note => note.id !== noteId);
        localStorage.setItem('prompts', JSON.stringify(prompts));
        loadPrompts();
    }
}

/**
 * Enable edit mode for existing note
 * @param {number} promptId - The prompt ID
 * @param {number} noteId - The note ID
 */
function editNote(promptId, noteId) {
    const prompts = getPromptsFromStorage();
    const prompt = prompts.find(p => p.id === promptId);
    const note = prompt.notes.find(n => n.id === noteId);
    
    if (!note) return;
    
    const noteCard = document.querySelector(`.note-card[data-note-id="${noteId}"]`);
    const noteContentDiv = noteCard.querySelector('.note-content');
    
    // Create textarea with current content
    const textarea = document.createElement('textarea');
    textarea.className = 'note-textarea edit-mode';
    textarea.value = note.content;
    textarea.maxLength = 500;
    textarea.rows = 3;
    
    const charCounter = document.createElement('div');
    charCounter.className = 'character-counter';
    charCounter.textContent = `${textarea.value.length}/500`;
    
    // Update character counter on input
    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        charCounter.textContent = `${length}/500`;
        if (length >= 500) {
            charCounter.classList.add('at-limit');
        } else {
            charCounter.classList.remove('at-limit');
        }
    });
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'note-button-group';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-note-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
        const content = textarea.value.trim();
        if (content) {
            updateNote(promptId, noteId, content);
        }
    });
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-note-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
        loadPrompts();
    });
    
    buttonGroup.appendChild(saveBtn);
    buttonGroup.appendChild(cancelBtn);
    
    // Replace content with edit interface
    noteContentDiv.innerHTML = '';
    noteContentDiv.appendChild(textarea);
    noteContentDiv.appendChild(charCounter);
    noteContentDiv.appendChild(buttonGroup);
    
    // Hide footer during edit
    noteCard.querySelector('.note-footer').style.display = 'none';
    
    textarea.focus();
}

/**
 * Update note after editing
 * @param {number} promptId - The prompt ID
 * @param {number} noteId - The note ID
 * @param {string} newContent - The updated content
 */
function updateNote(promptId, noteId, newContent) {
    // Validate content
    if (!newContent || newContent.trim().length === 0) {
        return;
    }
    
    const prompts = getPromptsFromStorage();
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
        const note = prompt.notes.find(n => n.id === noteId);
        if (note) {
            note.content = newContent;
            localStorage.setItem('prompts', JSON.stringify(prompts));
            loadPrompts();
        }
    }
}

// ========================================
// EXPORT/IMPORT SYSTEM
// ========================================

/**
 * Step 1 & 2: Export JSON Schema
 * Version 1.0 schema structure
 */
const EXPORT_SCHEMA_VERSION = '1.0';

/**
 * Calculate statistics from prompts
 * @param {Array} prompts - Array of prompt objects
 * @returns {Object} Statistics object
 */
function calculateStatistics(prompts) {
    if (!prompts || prompts.length === 0) {
        return {
            totalPrompts: 0,
            averageRating: 0,
            mostUsedModel: 'N/A',
            totalNotes: 0,
            favoritesCount: 0,
            totalTokensEstimate: { min: 0, max: 0 }
        };
    }
    
    // Calculate average rating
    const totalRating = prompts.reduce((sum, p) => sum + (p.rating || 0), 0);
    const averageRating = prompts.length > 0 ? (totalRating / prompts.length).toFixed(2) : 0;
    
    // Find most used model
    const modelCounts = {};
    prompts.forEach(p => {
        const model = p.metadata?.model || 'Unknown';
        modelCounts[model] = (modelCounts[model] || 0) + 1;
    });
    const mostUsedModel = Object.keys(modelCounts).reduce((a, b) => 
        modelCounts[a] > modelCounts[b] ? a : b, 'N/A'
    );
    
    // Count total notes
    const totalNotes = prompts.reduce((sum, p) => sum + (p.notes?.length || 0), 0);
    
    // Count favorites
    const favoritesCount = prompts.filter(p => p.isFavorite).length;
    
    // Calculate total token estimates
    const totalTokensEstimate = prompts.reduce((acc, p) => {
        if (p.metadata?.tokenEstimate) {
            acc.min += p.metadata.tokenEstimate.min;
            acc.max += p.metadata.tokenEstimate.max;
        }
        return acc;
    }, { min: 0, max: 0 });
    
    return {
        totalPrompts: prompts.length,
        averageRating: parseFloat(averageRating),
        mostUsedModel,
        totalNotes,
        favoritesCount,
        totalTokensEstimate
    };
}

/**
 * Validate prompt data integrity
 * @param {Array} prompts - Array of prompts to validate
 * @returns {Object} Validation result with isValid and errors array
 */
function validateDataIntegrity(prompts) {
    const errors = [];
    
    if (!Array.isArray(prompts)) {
        return { isValid: false, errors: ['Data is not an array'] };
    }
    
    prompts.forEach((prompt, index) => {
        // Check required fields
        if (!prompt.id) errors.push(`Prompt at index ${index} missing ID`);
        if (!prompt.title) errors.push(`Prompt at index ${index} missing title`);
        if (!prompt.content) errors.push(`Prompt at index ${index} missing content`);
        
        // Validate metadata if present
        if (prompt.metadata) {
            if (!prompt.metadata.model) {
                errors.push(`Prompt "${prompt.title}" missing model in metadata`);
            }
            if (!prompt.metadata.createdAt || !isValidISO8601(prompt.metadata.createdAt)) {
                errors.push(`Prompt "${prompt.title}" has invalid createdAt timestamp`);
            }
            if (!prompt.metadata.tokenEstimate) {
                errors.push(`Prompt "${prompt.title}" missing token estimate`);
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Step 3: Export function
 * Exports all prompts with metadata to JSON file
 */
function exportPrompts() {
    try {
        // Gather all data from localStorage
        const prompts = getPromptsFromStorage();
        
        if (prompts.length === 0) {
            alert('No prompts to export!');
            return;
        }
        
        // Validate data integrity
        const validation = validateDataIntegrity(prompts);
        if (!validation.isValid) {
            console.warn('Data validation warnings:', validation.errors);
            // Continue anyway but warn user
            if (!confirm(`Found ${validation.errors.length} validation warnings. Continue export anyway?`)) {
                return;
            }
        }
        
        // Calculate statistics
        const statistics = calculateStatistics(prompts);
        
        // Create export object with schema
        const exportData = {
            version: EXPORT_SCHEMA_VERSION,
            exportedAt: new Date().toISOString(),
            statistics,
            prompts
        };
        
        // Create blob and trigger download
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `prompt-library-backup-${timestamp}.json`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Show success message
        alert(`Successfully exported ${prompts.length} prompts!\nFile: ${filename}`);
        
    } catch (error) {
        console.error('Export error:', error);
        alert(`Export failed: ${error.message}`);
    }
}

/**
 * Step 5: Backup existing data
 * Creates a backup in localStorage before import
 */
function createBackup() {
    try {
        const prompts = getPromptsFromStorage();
        const backup = {
            timestamp: new Date().toISOString(),
            prompts
        };
        localStorage.setItem('prompts_backup', JSON.stringify(backup));
        return true;
    } catch (error) {
        console.error('Backup failed:', error);
        return false;
    }
}

/**
 * Step 5: Restore from backup
 * Rolls back to backup if import fails
 */
function restoreFromBackup() {
    try {
        const backup = localStorage.getItem('prompts_backup');
        if (!backup) {
            throw new Error('No backup found');
        }
        
        const backupData = JSON.parse(backup);
        localStorage.setItem('prompts', JSON.stringify(backupData.prompts));
        return true;
    } catch (error) {
        console.error('Restore failed:', error);
        return false;
    }
}

/**
 * Validate import file structure
 * @param {Object} importData - Parsed import data
 * @returns {Object} Validation result
 */
function validateImportData(importData) {
    const errors = [];
    
    // Check required fields
    if (!importData.version) {
        errors.push('Missing version number');
    }
    
    if (!importData.prompts || !Array.isArray(importData.prompts)) {
        errors.push('Missing or invalid prompts array');
    }
    
    if (!importData.exportedAt) {
        errors.push('Missing export timestamp');
    }
    
    // Check version compatibility
    if (importData.version !== EXPORT_SCHEMA_VERSION) {
        errors.push(`Unsupported version: ${importData.version}. Expected: ${EXPORT_SCHEMA_VERSION}`);
    }
    
    // Validate prompts data
    if (importData.prompts) {
        const dataValidation = validateDataIntegrity(importData.prompts);
        if (!dataValidation.isValid) {
            errors.push(...dataValidation.errors);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Check for duplicate IDs between existing and imported prompts
 * @param {Array} existingPrompts - Current prompts
 * @param {Array} importedPrompts - Prompts to import
 * @returns {Object} Conflict information
 */
function checkForDuplicates(existingPrompts, importedPrompts) {
    const existingIds = new Set(existingPrompts.map(p => p.id));
    const duplicates = importedPrompts.filter(p => existingIds.has(p.id));
    
    return {
        hasDuplicates: duplicates.length > 0,
        duplicateCount: duplicates.length,
        duplicates
    };
}

/**
 * Show merge conflict resolution dialog
 * @param {Object} conflictInfo - Information about conflicts
 * @returns {Promise<string>} User's choice: 'merge', 'replace', or 'cancel'
 */
function showMergeDialog(conflictInfo) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'merge-dialog-overlay';
        
        dialog.innerHTML = `
            <div class="merge-dialog">
                <h2>⚠️ Import Conflict Detected</h2>
                <p>Found ${conflictInfo.duplicateCount} prompt(s) with duplicate IDs.</p>
                <div class="conflict-details">
                    <p><strong>Existing prompts:</strong> ${conflictInfo.existingCount}</p>
                    <p><strong>New prompts:</strong> ${conflictInfo.importCount}</p>
                    <p><strong>Duplicates:</strong> ${conflictInfo.duplicateCount}</p>
                </div>
                <p>How would you like to proceed?</p>
                <div class="merge-options">
                    <button class="merge-btn merge-option" data-action="merge">
                        <span class="option-icon">🔄</span>
                        <span class="option-title">Merge</span>
                        <span class="option-desc">Keep existing, add new ones</span>
                    </button>
                    <button class="merge-btn replace-option" data-action="replace">
                        <span class="option-icon">⚡</span>
                        <span class="option-title">Replace All</span>
                        <span class="option-desc">Delete existing, import all</span>
                    </button>
                    <button class="merge-btn cancel-option" data-action="cancel">
                        <span class="option-icon">❌</span>
                        <span class="option-title">Cancel</span>
                        <span class="option-desc">Abort import</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Add click handlers
        const buttons = dialog.querySelectorAll('[data-action]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                document.body.removeChild(dialog);
                resolve(action);
            });
        });
    });
}

/**
 * Step 4: Import function
 * Imports prompts from JSON file with validation and conflict resolution
 */
async function importPrompts(file) {
    try {
        // Create backup before import
        if (!createBackup()) {
            throw new Error('Failed to create backup. Import aborted for safety.');
        }
        
        // Read the file
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Validate JSON structure and version
        const validation = validateImportData(importData);
        if (!validation.isValid) {
            throw new Error(`Invalid import file:\n${validation.errors.join('\n')}`);
        }
        
        // Get existing prompts
        const existingPrompts = getPromptsFromStorage();
        
        // Check for duplicates
        const conflictInfo = checkForDuplicates(existingPrompts, importData.prompts);
        
        let finalPrompts = [];
        
        if (conflictInfo.hasDuplicates) {
            // Show merge dialog
            const userChoice = await showMergeDialog({
                ...conflictInfo,
                existingCount: existingPrompts.length,
                importCount: importData.prompts.length
            });
            
            if (userChoice === 'cancel') {
                alert('Import cancelled by user.');
                return;
            } else if (userChoice === 'merge') {
                // Merge: Keep existing, add only new ones
                const existingIds = new Set(existingPrompts.map(p => p.id));
                const newPrompts = importData.prompts.filter(p => !existingIds.has(p.id));
                finalPrompts = [...existingPrompts, ...newPrompts];
                alert(`Merged successfully!\nKept ${existingPrompts.length} existing prompts\nAdded ${newPrompts.length} new prompts`);
            } else if (userChoice === 'replace') {
                // Replace: Use imported data entirely
                finalPrompts = importData.prompts;
                alert(`Replaced all data!\nImported ${importData.prompts.length} prompts`);
            }
        } else {
            // No conflicts: simply add to existing
            finalPrompts = [...existingPrompts, ...importData.prompts];
            alert(`Import successful!\nAdded ${importData.prompts.length} new prompts`);
        }
        
        // Save to localStorage
        localStorage.setItem('prompts', JSON.stringify(finalPrompts));
        
        // Reload display
        loadPrompts();
        
    } catch (error) {
        console.error('Import error:', error);
        alert(`Import failed: ${error.message}\n\nRestoring from backup...`);
        
        // Rollback on failure
        if (restoreFromBackup()) {
            loadPrompts();
            alert('Successfully restored from backup.');
        } else {
            alert('CRITICAL: Backup restoration failed! Please refresh and check your data.');
        }
    }
}

/**
 * Handle import file selection
 */
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.json')) {
        alert('Please select a valid JSON file.');
        return;
    }
    
    // Confirm import
    if (!confirm(`Import prompts from "${file.name}"?\n\nA backup will be created automatically.`)) {
        return;
    }
    
    importPrompts(file);
    
    // Reset input
    event.target.value = '';
}

