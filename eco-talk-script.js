// Global Variables
let currentPage = 1;
let currentCategory = 'all';

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// Initialize page functionality
function initializePage() {
    // Mobile menu event listener
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Search input enter key listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPosts();
            }
        });
    }

    // Close mobile menu when clicking on nav links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Header scroll effect
    window.addEventListener('scroll', handleHeaderScroll);

    // Add fade-in animation to elements
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });

    console.log('🌱 환경독톡 게시판이 로드되었습니다.');
}

// Mobile menu toggle
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

// Close mobile menu
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

// Header scroll effect
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

// Tab switching
function switchTab(element, category) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    element.classList.add('active');
    
    // Update current category
    currentCategory = category;
    
    // Filter posts based on category
    filterPosts(category);
    
    showNotification(`${element.textContent} 카테고리로 전환되었습니다`, 'info');
}

// Filter posts by category
function filterPosts(category) {
    const posts = document.querySelectorAll('.post-item');
    
    posts.forEach(post => {
        if (category === 'all') {
            post.style.display = 'grid';
        } else {
            // Simple filtering logic - in real app, this would be more sophisticated
            const tags = post.querySelectorAll('.tag');
            let hasMatchingTag = false;
            
            tags.forEach(tag => {
                const tagText = tag.textContent.toLowerCase();
                if (
                    (category === 'tips' && (tagText.includes('팁') || tagText.includes('가이드'))) ||
                    (category === 'review' && tagText.includes('후기')) ||
                    (category === 'challenge' && tagText.includes('챌린지')) ||
                    (category === 'question' && (tagText.includes('질문') || tagText.includes('추천'))) ||
                    (category === 'news' && tagText.includes('뉴스'))
                ) {
                    hasMatchingTag = true;
                }
            });
            
            post.style.display = hasMatchingTag ? 'grid' : 'none';
        }
    });
}

// Search posts
function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm.trim() === '') {
        showNotification('검색어를 입력해주세요', 'info');
        return;
    }
    
    const posts = document.querySelectorAll('.post-item');
    let visibleCount = 0;
    
    posts.forEach(post => {
        const title = post.querySelector('.post-title').textContent.toLowerCase();
        const author = post.querySelector('.post-author').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
            post.style.display = 'grid';
            visibleCount++;
        } else {
            post.style.display = 'none';
        }
    });
    
    showNotification(`"${searchTerm}" 검색 결과: ${visibleCount}개 게시글`, 'success');
}

// Write new post
function writePost() {
    showNotification('글쓰기 페이지로 이동합니다', 'info');
    // In real app, this would redirect to write post page
    // window.location.href = '/write-post';
}

// View post
function viewPost(postId) {
    showNotification(`게시글 ${postId}번을 조회합니다`, 'info');
    // In real app, this would redirect to post detail page
    // window.location.href = `/post/${postId}`;
}

// Pagination
function changePage(page) {
    if (page === 'prev') {
        if (currentPage > 1) {
            currentPage--;
        }
    } else if (page === 'next') {
        if (currentPage < 5) { // Assuming 5 total pages
            currentPage++;
        }
    } else {
        currentPage = page;
    }
    
    // Update active page button
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const pageBtn = document.querySelector(`.page-btn:nth-child(${currentPage + 1})`);
    if (pageBtn && !isNaN(currentPage)) {
        pageBtn.classList.add('active');
    }
    
    showNotification(`${currentPage}페이지로 이동합니다`, 'info');
    
    // In real app, this would load new posts via AJAX
    // loadPosts(currentPage);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Join challenge
function joinChallenge() {
    showNotification('챌린지에 참여하였습니다! 🎉', 'success');
    
    // In real app, this would send a request to join the challenge
    // fetch('/api/challenge/join', { method: 'POST' })
    //     .then(response => response.json())
    //     .then(data => {
    //         if (data.success) {
    //             showNotification('챌린지에 참여하였습니다! 🎉', 'success');
    //         }
    //     });
}

// Go to home page
function goHome() {
    showNotification('메인 페이지로 이동합니다', 'info');
    // In real app, this would redirect to home page
    // window.location.href = '/';
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Real-time features simulation
function simulateRealTimeUpdates() {
    // Simulate real-time post count updates
    setInterval(() => {
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length > 0) {
            // Update today's posts count
            const todayPostsStat = statNumbers[2];
            if (todayPostsStat) {
                const currentCount = parseInt(todayPostsStat.textContent);
                const newCount = currentCount + Math.floor(Math.random() * 3);
                todayPostsStat.textContent = newCount;
            }
            
            // Update online users count
            const onlineUsersStat = statNumbers[3];
            if (onlineUsersStat) {
                const currentCount = parseInt(onlineUsersStat.textContent);
                const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
                const newCount = Math.max(1, currentCount + variation);
                onlineUsersStat.textContent = newCount;
            }
        }
    }, 30000); // Update every 30 seconds
}

// Post interaction handlers
function likePost(postId) {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .post-likes`);
    if (likeBtn) {
        const currentLikes = parseInt(likeBtn.textContent.match(/\d+/)[0]);
        const newLikes = currentLikes + 1;
        likeBtn.textContent = `❤️ ${newLikes}`;
        showNotification('게시글에 좋아요를 눌렀습니다!', 'success');
    }
}

function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: '환경독톡 게시글',
            text: '흥미로운 환경 관련 게시글을 공유합니다.',
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('게시글 링크가 클립보드에 복사되었습니다!', 'success');
        });
    }
}

// Advanced search functionality
function advancedSearch() {
    const searchOptions = {
        author: document.getElementById('authorSearch')?.value || '',
        dateFrom: document.getElementById('dateFrom')?.value || '',
        dateTo: document.getElementById('dateTo')?.value || '',
        tags: document.getElementById('tagSearch')?.value || ''
    };
    
    // In real app, this would send a request to the server
    showNotification('고급 검색을 실행합니다', 'info');
    
    // Filter posts based on advanced criteria
    filterPostsAdvanced(searchOptions);
}

function filterPostsAdvanced(options) {
    const posts = document.querySelectorAll('.post-item');
    let visibleCount = 0;
    
    posts.forEach(post => {
        let shouldShow = true;
        
        // Filter by author
        if (options.author) {
            const author = post.querySelector('.post-author').textContent.toLowerCase();
            if (!author.includes(options.author.toLowerCase())) {
                shouldShow = false;
            }
        }
        
        // Filter by tags
        if (options.tags) {
            const tags = Array.from(post.querySelectorAll('.tag'));
            const hasMatchingTag = tags.some(tag => 
                tag.textContent.toLowerCase().includes(options.tags.toLowerCase())
            );
            if (!hasMatchingTag) {
                shouldShow = false;
            }
        }
        
        if (shouldShow) {
            post.style.display = 'grid';
            visibleCount++;
        } else {
            post.style.display = 'none';
        }
    });
    
    showNotification(`고급 검색 결과: ${visibleCount}개 게시글`, 'success');
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // ESC to close mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
    
    // Number keys for category switching
    if (e.key >= '1' && e.key <= '6') {
        const categoryIndex = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('.tab');
        if (tabs[categoryIndex]) {
            tabs[categoryIndex].click();
        }
    }
});

// Post preview functionality
function showPostPreview(postId) {
    // Create modal for post preview
    const modal = document.createElement('div');
    modal.className = 'post-preview-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        margin: 20px;
    `;
    
    modalContent.innerHTML = `
        <h3>게시글 미리보기</h3>
        <p>게시글 ${postId}번의 상세 내용이 여기에 표시됩니다.</p>
        <button onclick="closePostPreview()" style="
            background: var(--primary-green);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 20px;
        ">닫기</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePostPreview();
        }
    });
}

function closePostPreview() {
    const modal = document.querySelector('.post-preview-modal');
    if (modal) {
        modal.remove();
    }
}

// Auto-save draft functionality for write post
function autoSaveDraft() {
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');
    
    if (titleInput && contentInput) {
        const draft = {
            title: titleInput.value,
            content: contentInput.value,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage (in real app, this would be server-side)
        localStorage.setItem('postDraft', JSON.stringify(draft));
        
        // Show save indicator
        const saveIndicator = document.getElementById('saveIndicator');
        if (saveIndicator) {
            saveIndicator.textContent = '초안 저장됨';
            saveIndicator.style.opacity = '1';
            setTimeout(() => {
                saveIndicator.style.opacity = '0.5';
            }, 2000);
        }
    }
}

// Load saved draft
function loadDraft() {
    const savedDraft = localStorage.getItem('postDraft');
    if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        const titleInput = document.getElementById('postTitle');
        const contentInput = document.getElementById('postContent');
        
        if (titleInput && contentInput) {
            titleInput.value = draft.title;
            contentInput.value = draft.content;
            showNotification('저장된 초안을 불러왔습니다', 'info');
        }
    }
}

// Clear draft
function clearDraft() {
    localStorage.removeItem('postDraft');
    showNotification('초안이 삭제되었습니다', 'info');
}

// Theme toggle (optional)
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    showNotification(`${newTheme === 'dark' ? '다크' : '라이트'} 모드로 전환되었습니다`, 'info');
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Performance monitoring
function monitorPerformance() {
    // Monitor page load time
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
                console.log(`🚀 페이지 로드 시간: ${loadTime}ms`);
                
                // Show performance notification for very fast loads
                if (loadTime < 1000) {
                    setTimeout(() => {
                        showNotification('페이지가 빠르게 로드되었습니다! ⚡', 'success');
                    }, 2000);
                }
            }
        }, 1000);
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.warn('페이지 오류:', e.error);
    // In production, you might want to send error reports to a logging service
});

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    loadSavedTheme();
    
    // Start real-time updates simulation
    simulateRealTimeUpdates();
    
    // Monitor performance
    monitorPerformance();
    
    // Auto-save setup (if on write post page)
    const titleInput = document.getElementById('postTitle');
    const contentInput = document.getElementById('postContent');
    if (titleInput && contentInput) {
        titleInput.addEventListener('input', autoSaveDraft);
        contentInput.addEventListener('input', autoSaveDraft);
        
        // Load draft on page load
        loadDraft();
    }
    
    console.log('🎯 모든 기능이 초기화되었습니다.');
});

// Utility functions
const Utils = {
    // Format date
    formatDate: (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '어제';
        if (diffDays === 0) return '오늘';
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return postDate.toLocaleDateString('ko-KR');
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// Export functions for global access
window.showNotification = showNotification;
window.switchTab = switchTab;
window.searchPosts = searchPosts;
window.writePost = writePost;
window.viewPost = viewPost;
window.changePage = changePage;
window.joinChallenge = joinChallenge;
window.goHome = goHome;
window.toggleTheme = toggleTheme;