// Global variables
let currentItems = [];
let filteredItems = [];
let currentPage = 1;
const itemsPerPage = 12;

// DOM elements
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const addItemBtn = document.getElementById('addItemBtn');
const addItemModal = document.getElementById('addItemModal');
const itemDetailModal = document.getElementById('itemDetailModal');
const closeModal = document.getElementById('closeModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const addItemForm = document.getElementById('addItemForm');
const itemsGrid = document.getElementById('itemsGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const totalItems = document.getElementById('totalItems');
const pagination = document.getElementById('pagination');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    loadItems();
    setupEventListeners();
});

// Page initialization
function initializePage() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    // Modal controls
    addItemBtn.addEventListener('click', () => openModal(addItemModal));
    closeModal.addEventListener('click', () => closeModalHandler(addItemModal));
    closeDetailModal.addEventListener('click', () => closeModalHandler(itemDetailModal));
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addItemModal) closeModalHandler(addItemModal);
        if (e.target === itemDetailModal) closeModalHandler(itemDetailModal);
    });

    // Form submission
    addItemForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModalHandler(addItemModal);
    });

    // Filter and search
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('distanceFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('sortSelect').addEventListener('change', applySorting);
    
    // Load more button
    loadMoreBtn.addEventListener('click', loadMoreItems);

    // File upload
    setupFileUpload();
}

// Load items from server
function loadItems() {
    fetch('/api/free-sharing/items')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                currentItems = data.items;
                filteredItems = [...currentItems];
                currentPage = 1;
                renderItems();
                updateItemCount();
                renderPagination();
            } else {
                showNotification('상품을 불러올 수 없습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('상품 로딩 오류:', error);
            showNotification('상품을 불러오는 중 오류가 발생했습니다.', 'error');
        });
}

// Render items
function renderItems(append = false) {
    if (!append) {
        itemsGrid.innerHTML = '';
        currentPage = currentPage || 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredItems.slice(startIndex, endIndex);

    if (itemsToShow.length === 0 && currentPage === 1) {
        showEmptyState();
        loadMoreBtn.style.display = 'none';
        pagination.style.display = 'none';
        return;
    }

    itemsToShow.forEach(item => {
        const itemElement = createItemElement(item);
        itemsGrid.appendChild(itemElement);
    });

    // Show/hide load more button
    if (endIndex >= filteredItems.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }

    // 페이징 표시
    pagination.style.display = 'flex';
    renderPagination();
}

// 페이징 렌더링 함수
function renderPagination() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    pagination.innerHTML = '';

    // 이전 버튼
    const prevBtn = createPaginationButton('‹', currentPage - 1, currentPage === 1);
    pagination.appendChild(prevBtn);

    // 페이지 번호 버튼들
    const pageNumbers = generatePageNumbers(currentPage, totalPages);
    
    pageNumbers.forEach(pageNum => {
        if (pageNum === '...') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        } else {
            const pageBtn = createPaginationButton(pageNum, pageNum, false, pageNum === currentPage);
            pagination.appendChild(pageBtn);
        }
    });

    // 다음 버튼
    const nextBtn = createPaginationButton('›', currentPage + 1, currentPage === totalPages);
    pagination.appendChild(nextBtn);
}

// 페이징 버튼 생성 함수
function createPaginationButton(text, pageNum, disabled = false, active = false) {
    const button = document.createElement('button');
    button.className = `pagination-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
    button.textContent = text;
    
    if (!disabled) {
        button.addEventListener('click', () => {
            currentPage = pageNum;
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    return button;
}

// 페이지 번호 생성 함수
function generatePageNumbers(current, total) {
    const pages = [];
    const maxVisible = 7;
    
    if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        if (current <= 4) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 3) {
            pages.push(1);
            pages.push('...');
            for (let i = total - 4; i <= total; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            pages.push('...');
            for (let i = current - 1; i <= current + 1; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        }
    }
    
    return pages;
}

// Create item element
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-card';
    itemDiv.addEventListener('click', () => openItemDetail(item));

    itemDiv.innerHTML = `
        <div class="item-image">
            ${item.images ? item.images[0] : '📦'}
            <div class="item-status ${item.status}">${item.statusText}</div>
        </div>
        <div class="item-info">
            <h3 class="item-title">${item.title}</h3>
            <span class="item-category">${item.categoryName}</span>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
                <span class="item-location">📍 ${item.location}</span>
                <span class="item-time">${item.time}</span>
            </div>
        </div>
    `;

    return itemDiv;
}

// Open item detail modal
function openItemDetail(item) {
    const detailContent = document.getElementById('detailContent');
    document.getElementById('detailTitle').textContent = item.title;
    
    detailContent.innerHTML = `
        <div class="detail-images">
            <div class="main-image">
                ${item.images ? item.images[0] : '📦'}
            </div>
            <div class="thumbnail-list">
                ${item.images ? item.images.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}">${img}</div>
                `).join('') : ''}
            </div>
        </div>
        <div class="detail-info">
            <div class="detail-header">
                <h2 class="detail-title">${item.title}</h2>
                <span class="item-category">${item.categoryName}</span>
                <div class="detail-status ${item.status}">${item.statusText}</div>
            </div>
            
            <div class="detail-description">
                <h4>상세 설명</h4>
                <p>${item.description}</p>
            </div>
            
            <div class="detail-meta">
                <div class="meta-item">
                    <span class="meta-label">나눔 장소</span>
                    <span class="meta-value">${item.location}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">거리</span>
                    <span class="meta-value">${item.distance}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">등록시간</span>
                    <span class="meta-value">${item.time}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">조회수</span>
                    <span class="meta-value">${item.views}회</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">관심</span>
                    <span class="meta-value">❤️ ${item.likes}</span>
                </div>
            </div>
            
            <div class="detail-actions">
                ${item.status === 'available' ? `
                    <button class="btn btn-primary" onclick="requestItem(${item.id})">나눔 요청하기</button>
                    <button class="btn btn-secondary" onclick="likeItem(${item.id})">관심 표시 ❤️</button>
                ` : item.status === 'reserved' ? `
                    <button class="btn btn-secondary" disabled>예약중입니다</button>
                ` : `
                    <button class="btn btn-secondary" disabled>완료된 나눔입니다</button>
                `}
            </div>
            
            <div class="contact-info">
                <h4>나눔자 정보</h4>
                <p><strong>닉네임:</strong> ${item.author}</p>
                <p><strong>연락처:</strong> ${item.contact}</p>
                <p><strong>나눔 기여도:</strong> ⭐⭐⭐⭐⭐ (4.8/5.0)</p>
            </div>
        </div>
    `;

    openModal(itemDetailModal);
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const distance = document.getElementById('distanceFilter').value;
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    filteredItems = currentItems.filter(item => {
        if (category && item.category !== category) return false;
        if (status && item.status !== status) return false;
        if (search && !item.title.toLowerCase().includes(search) && 
            !item.description.toLowerCase().includes(search)) return false;
        
        // Distance filter (simplified)
        if (distance) {
            const itemDistance = parseFloat(item.distance);
            const maxDistance = parseFloat(distance) / 1000; // Convert m to km
            if (itemDistance > maxDistance) return false;
        }
        
        return true;
    });

    currentPage = 1;
    renderItems();
    updateItemCount();
}

// Apply sorting
function applySorting() {
    const sortBy = document.getElementById('sortSelect').value;
    
    filteredItems.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'distance':
                return parseFloat(a.distance) - parseFloat(b.distance);
            case 'popular':
                return b.views - a.views;
            default:
                return 0;
        }
    });

    currentPage = 1;
    renderItems();
}

// Load more items
function loadMoreItems() {
    currentPage++;
    renderItems(true);
}

// Update item count
function updateItemCount() {
    if (totalItems) {
        totalItems.textContent = `총 ${filteredItems.length}개`;
    }
}

// Show empty state
function showEmptyState() {
    itemsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 시도해보세요.<br>또는 새로운 나눔 물건을 등록해보세요!</p>
        </div>
    `;
}

// Modal functions
function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModalHandler(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    
    if (modal === addItemModal) {
        resetForm();
    }
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(addItemForm);
    
    // Send to server
    fetch('/api/free-sharing/items', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add to items array
            currentItems.unshift(data.item);
            
            // Show success message
            showNotification('나눔 물건이 성공적으로 등록되었습니다!', 'success');
            
            // Close modal and refresh
            closeModalHandler(addItemModal);
            applyFilters();
        } else {
            showNotification(data.message || '등록 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('등록 오류:', error);
        showNotification('등록 중 오류가 발생했습니다.', 'error');
    });
}

// Reset form
function resetForm() {
    addItemForm.reset();
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
}

// Get category name
function getCategoryName(category) {
    const categories = {
        'clothes': '의류/잡화',
        'electronics': '전자제품',
        'furniture': '가구/인테리어',
        'books': '도서/문구',
        'kids': '유아/아동용품',
        'etc': '기타'
    };
    return categories[category] || '기타';
}

// File upload handling
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('itemImages');
    const imagePreview = document.getElementById('imagePreview');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        const maxFiles = 5;
        const currentImages = imagePreview ? imagePreview.children.length : 0;
        
        if (currentImages + files.length > maxFiles) {
            showNotification(`최대 ${maxFiles}장까지만 업로드 가능합니다.`, 'error');
            return;
        }
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="preview-remove" onclick="removePreview(this)">&times;</button>
                    `;
                    if (imagePreview) {
                        imagePreview.appendChild(previewItem);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Remove preview image
function removePreview(button) {
    button.parentElement.remove();
}

// Item interaction functions
function requestItem(itemId) {
    fetch(`/api/free-sharing/items/${itemId}/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('나눔 요청이 전송되었습니다! 나눔자가 연락드릴 예정입니다.', 'success');
            closeModalHandler(itemDetailModal);
        } else {
            showNotification(data.message || '요청 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('나눔 요청 오류:', error);
        showNotification('요청 중 오류가 발생했습니다.', 'error');
    });
}

function likeItem(itemId) {
    fetch(`/api/free-sharing/items/${itemId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update item in local array
            const item = currentItems.find(item => item.id === itemId);
            if (item) {
                item.likes = data.likes;
            }
            
            showNotification('관심 표시가 등록되었습니다! ❤️', 'success');
            
            // Update UI if detail modal is open
            const likeElement = document.querySelector('.meta-value');
            if (likeElement && likeElement.textContent.includes('❤️')) {
                likeElement.textContent = `❤️ ${data.likes}`;
            }
        } else {
            showNotification(data.message || '관심 표시 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('관심 표시 오류:', error);
        showNotification('관심 표시 중 오류가 발생했습니다.', 'error');
    });
}

// Notification system
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-green)' : type === 'error' ? '#dc3545' : 'var(--accent-green)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

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

// Geolocation functions
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('위치 정보 획득:', position.coords);
                // Send location to server for distance calculations
                updateUserLocation(position.coords);
            },
            (error) => {
                console.warn('위치 정보 접근 실패:', error);
            }
        );
    }
}

function updateUserLocation(coords) {
    fetch('/api/user/location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude
        })
    })
    .catch(error => {
        console.error('위치 업데이트 오류:', error);
    });
}

// Advanced search functionality
function setupAdvancedSearch() {
    const searchInput = document.getElementById('searchInput');
    
    // Add search suggestions
    searchInput.addEventListener('focus', showSearchSuggestions);
    searchInput.addEventListener('blur', hideSearchSuggestions);
}

function showSearchSuggestions() {
    // Get search suggestions from server
    fetch('/api/free-sharing/search-suggestions')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Display suggestions
                console.log('검색 제안:', data.suggestions);
            }
        })
        .catch(error => {
            console.error('검색 제안 오류:', error);
        });
}

function hideSearchSuggestions() {
    // Hide suggestions dropdown
    setTimeout(() => {
        console.log('검색 제안 숨김');
    }, 200);
}

// Analytics and tracking
function trackUserInteraction(action, itemId = null) {
    const event = {
        action: action,
        itemId: itemId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    // Send to analytics service
    fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
    })
    .catch(error => {
        console.error('분석 추적 오류:', error);
    });
}

// Add event tracking to existing functions
const originalOpenItemDetail = openItemDetail;
openItemDetail = function(item) {
    trackUserInteraction('view_item', item.id);
    return originalOpenItemDetail.call(this, item);
};

const originalRequestItem = requestItem;
requestItem = function(itemId) {
    trackUserInteraction('request_item', itemId);
    return originalRequestItem.call(this, itemId);
};

// Performance optimization
function optimizeImages() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize additional features
setTimeout(() => {
    getCurrentLocation();
    setupAdvancedSearch();
    optimizeImages();
}, 2000);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadItems,
        applyFilters,
        createItemElement,
        showNotification,
        renderPagination,
        generatePageNumbers
    };
}