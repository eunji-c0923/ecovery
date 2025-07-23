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
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Join challenge
function joinChallenge() {
    showNotification('챌린지에 참여하였습니다! 🎉', 'success');
    
    // Send request to join the challenge
    fetch('/api/challenge/join', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeId: 'current' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('챌린지에 참여하였습니다! 🎉', 'success');
        } else {
            showNotification('챌린지 참여 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('챌린지 참여 오류:', error);
    });
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

// Post interaction handlers
function likePost(postId) {
    const likeBtn = document.querySelector(`[data-post-id="${postId}"] .post-likes`);
    if (likeBtn) {
        // Send like request to server
        fetch(`/api/posts/${postId}/like`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                likeBtn.textContent = `❤️ ${data.likeCount}`;
                showNotification('게시글에 좋아요를 눌렀습니다!', 'success');
            }
        })
        .catch(error => {
            console.error('좋아요 오류:', error);
        });
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
    
    // Send advanced search request to server
    fetch('/api/posts/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchOptions)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update UI with search results
            displaySearchResults(data.posts);
            showNotification(`고급 검색 결과: ${data.posts.length}개 게시글`, 'success');
        }
    })
    .catch(error => {
        console.error('고급 검색 오류:', error);
        showNotification('검색 중 오류가 발생했습니다.', 'error');
    });
}

function displaySearchResults(posts) {
    // Implementation for displaying search results
    console.log('검색 결과:', posts);
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
    
    // Fetch post data from server
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                modalContent.innerHTML = `
                    <h3>${data.post.title}</h3>
                    <p>${data.post.content}</p>
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
            }
        })
        .catch(error => {
            console.error('게시글 불러오기 오류:', error);
            modalContent.innerHTML = `
                <h3>오류</h3>
                <p>게시글을 불러올 수 없습니다.</p>
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
        });
    
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
        
        // Save to server
        fetch('/api/posts/draft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(draft)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const saveIndicator = document.getElementById('saveIndicator');
                if (saveIndicator) {
                    saveIndicator.textContent = '초안 저장됨';
                    saveIndicator.style.opacity = '1';
                    setTimeout(() => {
                        saveIndicator.style.opacity = '0.5';
                    }, 2000);
                }
            }
        })
        .catch(error => {
            console.error('초안 저장 오류:', error);
        });
    }
}

// Load saved draft
function loadDraft() {
    fetch('/api/posts/draft')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.draft) {
                const titleInput = document.getElementById('postTitle');
                const contentInput = document.getElementById('postContent');
                
                if (titleInput && contentInput) {
                    titleInput.value = data.draft.title;
                    contentInput.value = data.draft.content;
                    showNotification('저장된 초안을 불러왔습니다', 'info');
                }
            }
        })
        .catch(error => {
            console.error('초안 불러오기 오류:', error);
        });
}

// Clear draft
function clearDraft() {
    fetch('/api/posts/draft', { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('초안이 삭제되었습니다', 'info');
            }
        })
        .catch(error => {
            console.error('초안 삭제 오류:', error);
        });
}

// Theme toggle
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

// Error handling
window.addEventListener('error', (e) => {
    console.warn('페이지 오류:', e.error);
    // Send error report to logging service
    fetch('/api/errors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            error: e.error?.message || 'Unknown error',
            stack: e.error?.stack,
            url: window.location.href,
            timestamp: new Date().toISOString()
        })
    }).catch(console.error);
});

// Initialize all features
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme
    loadSavedTheme();
    
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
window.changePage = changePage;
window.joinChallenge = joinChallenge;
window.toggleTheme = toggleTheme;

// Page navigation functions
function viewPost(postId) {
    // URL 변경 (브라우저 뒤로가기 지원)
    window.history.pushState({ page: 'post', id: postId }, '', `/post/${postId}`);
    
    // 게시판 페이지 숨기기
    hidePostList();
    
    // 게시물 상세 페이지 보이기
    showPostDetail(postId);
    
    showNotification(`게시글 ${postId}번을 조회합니다`, 'info');
}

function writePost() {
    showNotification('글쓰기 페이지로 이동합니다', 'info');
    window.location.href = '/write';
}

function goHome() {
    showNotification('홈페이지로 이동합니다', 'info');
    window.location.href = '/';
}

// 게시판 목록 숨기기
function hidePostList() {
    const boardContainer = document.querySelector('.board-container');
    const pageHeader = document.querySelector('.page-header');
    
    if (boardContainer) boardContainer.style.display = 'none';
    
    // 페이지 헤더 내용 변경
    if (pageHeader) {
        const h1 = pageHeader.querySelector('h1');
        const p = pageHeader.querySelector('p');
        if (h1) h1.textContent = '📖 게시글 상세';
        if (p) p.textContent = '환경을 생각하는 소중한 이야기를 읽어보세요';
    }
}

// 게시물 상세 페이지 보이기
function showPostDetail(postId) {
    // 게시물 상세 컨테이너가 없으면 생성
    let detailContainer = document.querySelector('.post-detail-container');
    if (!detailContainer) {
        detailContainer = createPostDetailContainer();
        const container = document.querySelector('.container');
        if (container) container.appendChild(detailContainer);
    }
    
    // 서버에서 게시물 데이터 가져오기
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadAndDisplayPost(data.post, detailContainer);
                detailContainer.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showNotification('게시글을 불러올 수 없습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('게시글 불러오기 오류:', error);
            showNotification('게시글을 불러오는 중 오류가 발생했습니다.', 'error');
        });
}

// 게시물 상세 컨테이너 생성
function createPostDetailContainer() {
    const container = document.createElement('div');
    container.className = 'post-detail-container fade-in';
    container.style.display = 'none';
    
    container.innerHTML = `
        <div class="post-detail-content">
            <div class="post-detail-header">
                <button class="back-btn" onclick="goBackToList()">
                    ← 목록으로 돌아가기
                </button>
            </div>
            <article class="post-article">
                <header class="article-header">
                    <h1 class="article-title" id="articleTitle">로딩 중...</h1>
                    <div class="article-meta">
                        <div class="author-info">
                            <span class="author-avatar" id="authorAvatar">🌱</span>
                            <span class="author-name" id="authorName">작성자</span>
                        </div>
                        <div class="post-info">
                            <span class="post-date" id="postDate">날짜</span>
                            <span class="post-views" id="postViews">조회수</span>
                        </div>
                    </div>
                    <div class="article-tags" id="articleTags">
                        <!-- 태그들이 여기에 추가됩니다 -->
                    </div>
                </header>
                <div class="article-content" id="articleContent">
                    <p>게시물 내용을 불러오는 중...</p>
                </div>
                <footer class="article-footer">
                    <div class="article-actions">
                        <button class="action-btn like-btn" onclick="likePost()">
                            ❤️ <span id="likeCount">0</span>
                        </button>
                        <button class="action-btn share-btn" onclick="sharePost()">
                            🔗 공유
                        </button>
                    </div>
                </footer>
            </article>
            
            <!-- 댓글 섹션 -->
            <section class="comments-section">
                <h3>💬 댓글 <span id="commentCount">0</span></h3>
                <div class="comments-list" id="commentsList">
                    <!-- 댓글들이 여기에 추가됩니다 -->
                </div>
                <div class="comment-form">
                    <textarea placeholder="댓글을 입력하세요..." rows="3" id="commentInput"></textarea>
                    <button class="btn btn-primary" onclick="submitComment()">댓글 작성</button>
                </div>
            </section>
        </div>
    `;
    
    return container;
}

// 게시물 데이터 로드 및 표시
function loadAndDisplayPost(postData, container) {
    // 제목 업데이트
    const titleElement = container.querySelector('#articleTitle');
    if (titleElement) titleElement.textContent = postData.title;
    
    // 작성자 정보 업데이트
    const avatarElement = container.querySelector('#authorAvatar');
    const nameElement = container.querySelector('#authorName');
    if (avatarElement) avatarElement.textContent = postData.authorAvatar || '🌱';
    if (nameElement) nameElement.textContent = postData.author;
    
    // 게시물 정보 업데이트
    const dateElement = container.querySelector('#postDate');
    const viewsElement = container.querySelector('#postViews');
    if (dateElement) dateElement.textContent = postData.date;
    if (viewsElement) viewsElement.textContent = `조회 ${postData.views}`;
    
    // 태그 업데이트
    const tagsContainer = container.querySelector('#articleTags');
    if (tagsContainer && postData.tags) {
        tagsContainer.innerHTML = postData.tags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
    }
    
    // 내용 업데이트
    const contentElement = container.querySelector('#articleContent');
    if (contentElement) contentElement.innerHTML = postData.content;
    
    // 좋아요 수 업데이트
    const likeCountElement = container.querySelector('#likeCount');
    if (likeCountElement) likeCountElement.textContent = postData.likes || 0;
    
    // 댓글 수 업데이트
    const commentCountElement = container.querySelector('#commentCount');
    if (commentCountElement) commentCountElement.textContent = postData.comments || 0;
    
    // 조회수 증가
    incrementViewCount(postData.id);
}

// 목록으로 돌아가기
function goBackToList() {
    // URL 복원
    window.history.pushState({ page: 'list' }, '', '/community');
    
    // 게시물 상세 숨기기
    const detailContainer = document.querySelector('.post-detail-container');
    if (detailContainer) detailContainer.style.display = 'none';
    
    // 게시판 목록 보이기
    const boardContainer = document.querySelector('.board-container');
    if (boardContainer) boardContainer.style.display = 'grid';
    
    // 페이지 헤더 복원
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
        const h1 = pageHeader.querySelector('h1');
        const p = pageHeader.querySelector('p');
        if (h1) h1.textContent = '💬 환경톡톡';
        if (p) p.textContent = '환경을 사랑하는 사람들과 함께 나누는 소중한 이야기와 경험들';
    }
    
    // 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 브라우저 뒤로가기 버튼 지원
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page === 'post') {
        showPostDetail(event.state.id);
    } else {
        goBackToList();
    }
});

// 조회수 증가
function incrementViewCount(postId) {
    fetch(`/api/posts/${postId}/view`, { method: 'POST' })
        .catch(error => console.error('조회수 증가 오류:', error));
}

// 댓글 작성
function submitComment() {
    const commentInput = document.querySelector('#commentInput');
    const commentText = commentInput?.value.trim();
    
    if (commentText) {
        // 서버에 댓글 전송
        fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                postId: window.currentPostId,
                content: commentText
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addCommentToList(data.comment);
                commentInput.value = '';
                showNotification('댓글이 작성되었습니다!', 'success');
            } else {
                showNotification('댓글 작성 중 오류가 발생했습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('댓글 작성 오류:', error);
            showNotification('댓글 작성 중 오류가 발생했습니다.', 'error');
        });
    }
}

function addCommentToList(comment) {
    const commentsList = document.querySelector('#commentsList');
    if (!commentsList) return;
    
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.innerHTML = `
        <div class="comment-author">${comment.author}</div>
        <div class="comment-text">${comment.content}</div>
        <div class="comment-date">${comment.date}</div>
    `;
    commentsList.insertBefore(commentElement, commentsList.firstChild);
    
    // 댓글 수 업데이트
    const commentCountElement = document.querySelector('#commentCount');
    if (commentCountElement) {
        const currentCount = parseInt(commentCountElement.textContent) || 0;
        commentCountElement.textContent = currentCount + 1;
    }
}

// Export additional functions
window.viewPost = viewPost;
window.writePost = writePost;
window.goHome = goHome;
window.goBackToList = goBackToList;
window.submitComment = submitComment;