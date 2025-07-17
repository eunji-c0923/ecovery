// Global Variables
let selectedTags = [];
let uploadedFiles = [];
let autoSaveTimer = null;
let isDirty = false;

// Mobile menu elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Form elements
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const postTags = document.getElementById('postTags');
const postCategory = document.getElementById('postCategory');
const writeForm = document.getElementById('writeForm');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    // Mobile menu event listener
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Form event listeners
    setupFormEventListeners();
    
    // File upload setup
    setupFileUpload();
    
    // Auto-save setup
    setupAutoSave();
    
    // Load saved draft
    loadSavedDraft();
    
    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);

    // Prevent accidental page leave
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Add fade-in animation
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });

    console.log('✏️ 글쓰기 페이지가 로드되었습니다.');
}

// Mobile menu functions
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

function closeMobileMenu() {
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

function handleHeaderScroll() {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
}

// Form setup
function setupFormEventListeners() {
    // Title character count
    if (postTitle) {
        postTitle.addEventListener('input', function() {
            updateCharCount('titleCount', this.value.length, 100);
            markAsDirty();
        });
    }

    // Content character count
    if (postContent) {
        postContent.addEventListener('input', function() {
            updateCharCount('contentCount', this.value.length, 5000);
            markAsDirty();
        });
    }

    // Tags input
    if (postTags) {
        postTags.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTagFromInput();
            }
        });
    }

    // Category change
    if (postCategory) {
        postCategory.addEventListener('change', markAsDirty);
    }

    // Form submission
    if (writeForm) {
        writeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitPost();
        });
    }
}

function updateCharCount(elementId, currentLength, maxLength) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = currentLength;
        
        // Change color based on usage
        const percentage = (currentLength / maxLength) * 100;
        if (percentage > 90) {
            element.style.color = '#dc3545';
        } else if (percentage > 75) {
            element.style.color = '#fd7e14';
        } else {
            element.style.color = '#6c757d';
        }
    }
}

function markAsDirty() {
    isDirty = true;
    
    // Start auto-save timer
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(autoSave, 3000); // Auto-save after 3 seconds of inactivity
}

// Tag management
function addTagFromInput() {
    const tagInput = postTags;
    const tagText = tagInput.value.trim();
    
    if (tagText && selectedTags.length < 5) {
        addTag(tagText);
        tagInput.value = '';
    } else if (selectedTags.length >= 5) {
        showNotification('태그는 최대 5개까지만 추가할 수 있습니다', 'error');
    }
}

function addTag(tagText) {
    // Prevent duplicates
    if (selectedTags.includes(tagText)) {
        showNotification('이미 추가된 태그입니다', 'error');
        return;
    }
    
    if (selectedTags.length >= 5) {
        showNotification('태그는 최대 5개까지만 추가할 수 있습니다', 'error');
        return;
    }
    
    selectedTags.push(tagText);
    renderTags();
    markAsDirty();
}

function removeTag(tagText) {
    selectedTags = selectedTags.filter(tag => tag !== tagText);
    renderTags();
    markAsDirty();
}

function renderTags() {
    const tagsList = document.getElementById('tagsList');
    if (!tagsList) return;
    
    tagsList.innerHTML = '';
    
    selectedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            <span>${tag}</span>
            <button type="button" class="tag-remove" onclick="removeTag('${tag}')">×</button>
        `;
        tagsList.appendChild(tagElement);
    });
}

// File upload setup
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    files.forEach(file => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('이미지 파일만 업로드 가능합니다', 'error');
            return;
        }
        
        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('파일 크기는 10MB 이하여야 합니다', 'error');
            return;
        }
        
        // Validate total files
        if (uploadedFiles.length >= 5) {
            showNotification('파일은 최대 5개까지만 업로드 가능합니다', 'error');
            return;
        }
        
        addUploadedFile(file);
    });
}

function addUploadedFile(file) {
    const fileData = {
        file: file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: formatFileSize(file.size),
        url: URL.createObjectURL(file)
    };
    
    uploadedFiles.push(fileData);
    renderUploadedFiles();
    markAsDirty();
}

function removeUploadedFile(fileId) {
    const fileIndex = uploadedFiles.findIndex(f => f.id === fileId);
    if (fileIndex !== -1) {
        // Revoke object URL to free memory
        URL.revokeObjectURL(uploadedFiles[fileIndex].url);
        uploadedFiles.splice(fileIndex, 1);
        renderUploadedFiles();
        markAsDirty();
    }
}

function renderUploadedFiles() {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    if (!uploadedFilesContainer) return;
    
    uploadedFilesContainer.innerHTML = '';
    
    uploadedFiles.forEach(fileData => {
        const fileElement = document.createElement('div');
        fileElement.className = 'uploaded-file';
        fileElement.innerHTML = `
            <img src="${fileData.url}" alt="${fileData.name}" class="file-preview">
            <div class="file-info">
                <div class="file-name">${fileData.name}</div>
                <div class="file-size">${fileData.size}</div>
            </div>
            <button type="button" class="file-remove" onclick="removeUploadedFile(${fileData.id})">
                삭제
            </button>
        `;
        uploadedFilesContainer.appendChild(fileElement);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Editor functions
function formatText(command) {
    const textarea = postContent;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (!selectedText) {
        showNotification('텍스트를 선택한 후 서식을 적용하세요', 'info');
        return;
    }
    
    let formattedText = '';
    
    switch (command) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        default:
            formattedText = selectedText;
    }
    
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start, start + formattedText.length);
    
    markAsDirty();
}

function insertList() {
    const textarea = postContent;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const listText = '\n• 목록 항목 1\n• 목록 항목 2\n• 목록 항목 3\n';
    
    textarea.value = textarea.value.substring(0, start) + listText + textarea.value.substring(start);
    textarea.focus();
    textarea.setSelectionRange(start + listText.length, start + listText.length);
    
    markAsDirty();
}

function insertLink() {
    const url = prompt('링크 URL을 입력하세요:');
    if (!url) return;
    
    const textarea = postContent;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const linkText = selectedText || '링크 텍스트';
    const linkMarkdown = `[${linkText}](${url})`;
    
    textarea.value = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(end);
    textarea.focus();
    textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
    
    markAsDirty();
}

function insertEmoji() {
    const emojis = ['😊', '🌱', '♻️', '🌍', '💚', '✨', '👍', '❤️', '🎉', '💡'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    const textarea = postContent;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    textarea.value = textarea.value.substring(0, start) + emoji + textarea.value.substring(start);
    textarea.focus();
    textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    
    markAsDirty();
}

// Template functions
function loadTemplate(type) {
    const templates = {
        tip: {
            title: '환경 보호 팁: ',
            content: `💡 **팁 요약**
간단하게 실천할 수 있는 환경 보호 방법을 소개합니다.

🔍 **상세 설명**
• 준비물: 
• 소요시간: 
• 난이도: 

📋 **실천 방법**
1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계

✅ **기대 효과**
• 환경에 미치는 긍정적 영향
• 개인적으로 얻을 수 있는 이점

💭 **마무리**
여러분도 함께 실천해보세요!`,
            category: 'tips',
            tags: ['환경팁', '실천법']
        },
        review: {
            title: '제품/서비스 후기: ',
            content: `⭐ **평점: ★★★★☆ (5점 만점)**

📦 **사용한 제품/서비스**
• 제품명: 
• 구매처: 
• 가격: 
• 사용 기간: 

👍 **좋은 점**
• 
• 
• 

👎 **아쉬운 점**
• 
• 

🌱 **환경 친화성**
• 포장재: 
• 재료/성분: 
• 재사용/재활용 가능성: 

💰 **가성비**
비슷한 제품 대비 가격과 품질을 평가해보세요.

🔄 **재구매 의향**
다시 구매할 의향이 있는지, 다른 사람에게 추천할지 적어주세요.

📝 **총평**
전반적인 사용 경험을 정리해주세요.`,
            category: 'review',
            tags: ['후기', '제품리뷰']
        },
        challenge: {
            title: '환경 챌린지: ',
            content: `🏆 **챌린지 개요**
• 챌린지명: 
• 기간: 
• 목표: 
• 참여 방법: 

📅 **진행 상황**
**1주차**
• 목표: 
• 실제 결과: 
• 느낀 점: 

**2주차**
• 목표: 
• 실제 결과: 
• 느낀 점: 

💪 **도전 과정에서 어려웠던 점**
• 
• 

🎯 **극복 방법**
• 
• 

📊 **최종 결과**
• 달성률: 
• 절약/개선된 부분: 
• 환경에 미친 긍정적 영향: 

💡 **다른 분들께 드리는 팁**
• 
• 

🔥 **다음 도전 계획**
이번 경험을 바탕으로 다음에 도전해볼 계획을 공유해주세요.`,
            category: 'challenge',
            tags: ['챌린지', '실천후기']
        }
    };
    
    const template = templates[type];
    if (!template) return;
    
    // Confirm if content exists
    if (isDirty) {
        if (!confirm('현재 작성 중인 내용이 있습니다. 템플릿을 불러오면 기존 내용이 사라집니다. 계속하시겠습니까?')) {
            return;
        }
    }
    
    // Load template
    if (postTitle) postTitle.value = template.title;
    if (postContent) postContent.value = template.content;
    if (postCategory) postCategory.value = template.category;
    
    // Add tags
    selectedTags = [...template.tags];
    renderTags();
    
    // Update character counts
    updateCharCount('titleCount', template.title.length, 100);
    updateCharCount('contentCount', template.content.length, 5000);
    
    markAsDirty();
    showNotification(`${type} 템플릿이 로드되었습니다`, 'success');
}

// Auto-save functions
function setupAutoSave() {
    // Auto-save every 30 seconds if there are changes
    setInterval(() => {
        if (isDirty) {
            autoSave();
        }
    }, 30000);
}

function autoSave() {
    const draftData = {
        title: postTitle?.value || '',
        content: postContent?.value || '',
        category: postCategory?.value || '',
        tags: selectedTags,
        timestamp: new Date().toISOString(),
        files: uploadedFiles.map(f => ({ name: f.name, size: f.size })) // Don't save actual file data
    };
    
    try {
        localStorage.setItem('postDraft', JSON.stringify(draftData));
        showAutoSaveIndicator();
        isDirty = false;
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}

function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    const saveTime = document.getElementById('saveTime');
    
    if (indicator && saveTime) {
        const now = new Date();
        saveTime.textContent = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 3000);
    }
}

function saveDraft() {
    autoSave();
    showNotification('임시저장되었습니다', 'success');
}

function loadSavedDraft() {
    try {
        const savedDraft = localStorage.getItem('postDraft');
        if (!savedDraft) return;
        
        const draft = JSON.parse(savedDraft);
        const draftAge = new Date() - new Date(draft.timestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (draftAge > maxAge) {
            localStorage.removeItem('postDraft');
            return;
        }
        
        if (confirm('저장된 임시글이 있습니다. 불러오시겠습니까?')) {
            loadDraft();
        }
    } catch (error) {
        console.error('Failed to load draft:', error);
    }
}

function loadDraft() {
    try {
        const savedDraft = localStorage.getItem('postDraft');
        if (!savedDraft) {
            showNotification('저장된 임시글이 없습니다', 'info');
            return;
        }
        
        const draft = JSON.parse(savedDraft);
        
        if (postTitle) postTitle.value = draft.title || '';
        if (postContent) postContent.value = draft.content || '';
        if (postCategory) postCategory.value = draft.category || '';
        
        selectedTags = draft.tags || [];
        renderTags();
        
        // Update character counts
        updateCharCount('titleCount', draft.title?.length || 0, 100);
        updateCharCount('contentCount', draft.content?.length || 0, 5000);
        
        showNotification('임시글을 불러왔습니다', 'success');
        markAsDirty();
    } catch (error) {
        console.error('Failed to load draft:', error);
        showNotification('임시글 불러오기에 실패했습니다', 'error');
    }
}

// Form submission
function submitPost() {
    // Validate form
    if (!validateForm()) return;
    
    // Collect form data
    const formData = {
        title: postTitle.value.trim(),
        content: postContent.value.trim(),
        category: postCategory.value,
        tags: selectedTags,
        allowComments: document.getElementById('allowComments')?.checked || true,
        notifyReplies: document.getElementById('notifyReplies')?.checked || true,
        files: uploadedFiles
    };
    
    // Show loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '게시 중...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Clear draft
        localStorage.removeItem('postDraft');
        isDirty = false;
        
        showNotification('게시글이 성공적으로 등록되었습니다! 🎉', 'success');
        
        // Redirect to board
        setTimeout(() => {
            goToBoard();
        }, 2000);
        
    }, 1500);
}

function validateForm() {
    const title = postTitle?.value.trim();
    const content = postContent?.value.trim();
    const category = postCategory?.value;
    
    if (!title) {
        showNotification('제목을 입력해주세요', 'error');
        postTitle?.focus();
        return false;
    }
    
    if (title.length > 100) {
        showNotification('제목은 100자 이하로 입력해주세요', 'error');
        postTitle?.focus();
        return false;
    }
    
    if (!content) {
        showNotification('내용을 입력해주세요', 'error');
        postContent?.focus();
        return false;
    }
    
    if (content.length > 5000) {
        showNotification('내용은 5000자 이하로 입력해주세요', 'error');
        postContent?.focus();
        return false;
    }
    
    if (!category) {
        showNotification('카테고리를 선택해주세요', 'error');
        postCategory?.focus();
        return false;
    }
    
    return true;
}

// Preview functions
function previewPost() {
    if (!validateForm()) return;
    
    const previewModal = document.getElementById('previewModal');
    const previewContent = document.getElementById('previewContent');
    
    if (!previewModal || !previewContent) return;
    
    // Generate preview HTML
    const title = postTitle.value.trim();
    const content = postContent.value.trim();
    const category = postCategory.options[postCategory.selectedIndex].text;
    
    const previewHTML = `
        <div class="preview-post">
            <div class="preview-category">${category}</div>
            <h2 class="preview-title">${title}</h2>
            <div class="preview-meta">
                <span class="preview-author">환경지킴이</span>
                <span class="preview-date">${new Date().toLocaleDateString('ko-KR')}</span>
            </div>
            ${selectedTags.length > 0 ? `
                <div class="preview-tags">
                    ${selectedTags.map(tag => `<span class="preview-tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="preview-content">${formatPreviewContent(content)}</div>
            ${uploadedFiles.length > 0 ? `
                <div class="preview-files">
                    <h4>첨부 이미지</h4>
                    ${uploadedFiles.map(file => `<img src="${file.url}" alt="${file.name}" style="max-width: 100%; margin: 10px 0; border-radius: 8px;">`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    previewContent.innerHTML = previewHTML;
    previewModal.style.display = 'flex';
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closePreview() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function formatPreviewContent(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>')
        .replace(/\n/g, '<br>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

// Navigation functions
function goHome() {
    if (isDirty && !confirm('작성 중인 내용이 있습니다. 페이지를 벗어나시겠습니까?')) {
        return;
    }
    showNotification('메인 페이지로 이동합니다', 'info');
    // window.location.href = '/';
}

function goToBoard() {
    if (isDirty && !confirm('작성 중인 내용이 있습니다. 페이지를 벗어나시겠습니까?')) {
        return;
    }
    showNotification('환경독톡 게시판으로 이동합니다', 'info');
    // window.location.href = '/eco-talk';
}

// Page leave warning
function handleBeforeUnload(e) {
    if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S for save draft
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
    }
    
    // Ctrl/Cmd + Enter for submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitPost();
    }
    
    // ESC to close modal
    if (e.key === 'Escape') {
        closePreview();
        closeMobileMenu();
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.showNotification = showNotification;
window.addTag = addTag;
window.removeTag = removeTag;
window.removeUploadedFile = removeUploadedFile;
window.formatText = formatText;
window.insertList = insertList;
window.insertLink = insertLink;
window.insertEmoji = insertEmoji;
window.loadTemplate = loadTemplate;
window.saveDraft = saveDraft;
window.loadDraft = loadDraft;
window.previewPost = previewPost;
window.closePreview = closePreview;
window.submitPost = submitPost;
window.goHome = goHome;
window.goToBoard = goToBoard;

// Performance monitoring
window.addEventListener('load', () => {
    setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
            console.log(`🚀 글쓰기 페이지 로드 시간: ${loadTime}ms`);
        }
    }, 1000);
});

// Error handling
window.addEventListener('error', (e) => {
    console.warn('페이지 오류:', e.error);
});

console.log('✏️ 글쓰기 페이지 스크립트가 로드되었습니다.');