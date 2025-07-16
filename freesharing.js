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

// Sample data
const sampleItems = [
    {
        id: 1,
        title: "아이 전집 세트 (상태 좋음)",
        category: "books",
        categoryName: "도서/문구",
        description: "7살 아이가 보던 전집입니다. 상태 매우 좋고 깨끗합니다. 총 20권으로 구성되어 있어요.",
        location: "강남역 2번 출구",
        distance: "500m",
        status: "available",
        statusText: "나눔중",
        time: "10분 전",
        author: "김○○님",
        contact: "010-1234-5678",
        images: ["📚"],
        views: 24,
        likes: 5
    },
    {
        id: 2,
        title: "원목 책상 (IKEA)",
        category: "furniture",
        categoryName: "가구/인테리어",
        description: "이사로 인해 나눔합니다. IKEA에서 구입한 원목 책상으로 스크래치는 거의 없어요.",
        location: "서초구 반포동",
        distance: "1.2km",
        status: "reserved",
        statusText: "예약중",
        time: "23분 전",
        author: "박○○님",
        contact: "010-2345-6789",
        images: ["🪑"],
        views: 45,
        likes: 12
    },
    {
        id: 3,
        title: "정장 셔츠 5벌 (새제품)",
        category: "clothes",
        categoryName: "의류/잡화",
        description: "회사 퇴사로 인해 나눔합니다. 한번도 입지 않은 새제품들이에요. 95-100 사이즈입니다.",
        location: "마포구 홍대입구역",
        distance: "2.5km",
        status: "completed",
        statusText: "완료",
        time: "1시간 전",
        author: "이○○님",
        contact: "010-3456-7890",
        images: ["👔"],
        views: 67,
        likes: 18
    },
    {
        id: 4,
        title: "무선 이어폰 (삼성)",
        category: "electronics",
        categoryName: "전자제품",
        description: "Galaxy Buds Pro 나눔합니다. 1년 정도 사용했고 기능상 문제없어요. 케이스와 충전기 포함.",
        location: "송파구 잠실역",
        distance: "3.8km",
        status: "available",
        statusText: "나눔중",
        time: "2시간 전",
        author: "최○○님",
        contact: "010-4567-8901",
        images: ["🎧"],
        views: 89,
        likes: 23
    },
    {
        id: 5,
        title: "유아용 보행기",
        category: "kids",
        categoryName: "유아/아동용품",
        description: "돌 지난 아이가 사용하던 보행기입니다. 깨끗하게 소독했고 기능 정상입니다.",
        location: "강동구 천호동",
        distance: "4.2km",
        status: "available",
        statusText: "나눔중",
        time: "3시간 전",
        author: "한○○님",
        contact: "010-5678-9012",
        images: ["👶"],
        views: 34,
        likes: 8
    },
    {
        id: 6,
        title: "화분 5개 세트",
        category: "etc",
        categoryName: "기타",
        description: "이사로 인해 키우던 화분들을 나눔합니다. 흙과 함께 드려요. 식물 키우기 좋아하시는 분께!",
        location: "노원구 상계동",
        distance: "5.1km",
        status: "available",
        statusText: "나눔중",
        time: "4시간 전",
        author: "정○○님",
        contact: "010-6789-0123",
        images: ["🪴"],
        views: 56,
        likes: 14
    }
];

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

// Load items
function loadItems() {
    currentItems = [...sampleItems];
    filteredItems = [...currentItems];
    currentPage = 1;
    renderItems();
    updateItemCount();
}

// Render items
function renderItems(append = false) {
    if (!append) {
        itemsGrid.innerHTML = '';
        currentPage = 1;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredItems.slice(startIndex, endIndex);

    if (itemsToShow.length === 0 && currentPage === 1) {
        showEmptyState();
        loadMoreBtn.style.display = 'none';
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
}

// Create item element
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-card';
    itemDiv.addEventListener('click', () => openItemDetail(item));

    itemDiv.innerHTML = `
        <div class="item-image">
            ${item.images[0]}
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
                ${item.images[0]}
            </div>
            <div class="thumbnail-list">
                ${item.images.map((img, index) => `
                    <div class="thumbnail ${index === 0 ? 'active' : ''}">${img}</div>
                `).join('')}
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
                return new Date(b.time) - new Date(a.time);
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
    totalItems.textContent = `총 ${filteredItems.length}개`;
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
    const newItem = {
        id: Date.now(),
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        categoryName: getCategoryName(document.getElementById('itemCategory').value),
        description: document.getElementById('itemDescription').value || '상세 설명이 없습니다.',
        location: document.getElementById('itemLocation').value || '장소 미정',
        distance: '0m',
        status: 'available',
        statusText: '나눔중',
        time: '방금 전',
        author: '나',
        contact: '010-0000-0000',
        images: ['📦'],
        views: 0,
        likes: 0
    };

    // Add to items
    currentItems.unshift(newItem);
    
    // Show success message
    showNotification('나눔 물건이 성공적으로 등록되었습니다!', 'success');
    
    // Close modal and refresh
    closeModalHandler(addItemModal);
    applyFilters();
}

// Reset form
function resetForm() {
    addItemForm.reset();
    document.getElementById('imagePreview').innerHTML = '';
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
        const currentImages = imagePreview.children.length;
        
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
                    imagePreview.appendChild(previewItem);
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
    showNotification('나눔 요청이 전송되었습니다! 나눔자가 연락드릴 예정입니다.', 'success');
    closeModalHandler(itemDetailModal);
}

function likeItem(itemId) {
    const item = currentItems.find(item => item.id === itemId);
    if (item) {
        item.likes++;
        showNotification('관심 표시가 등록되었습니다! ❤️', 'success');
        
        // Update UI if detail modal is open
        const likeElement = document.querySelector('.meta-value');
        if (likeElement && likeElement.textContent.includes('❤️')) {
            likeElement.textContent = `❤️ ${item.likes}`;
        }
    }
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

// Add more sample data for demonstration
function addMoreSampleData() {
    const additionalItems = [
        {
            id: 7,
            title: "노트북 거치대 (알루미늄)",
            category: "electronics",
            categoryName: "전자제품",
            description: "맥북용으로 사용하던 알루미늄 거치대입니다. 각도 조절 가능하고 상태 좋아요.",
            location: "용산구 이태원역",
            distance: "2.1km",
            status: "available",
            statusText: "나눔중",
            time: "5시간 전",
            author: "김○○님",
            contact: "010-7890-1234",
            images: ["💻"],
            views: 41,
            likes: 9
        },
        {
            id: 8,
            title: "겨울 패딩 점퍼 (XL)",
            category: "clothes",
            categoryName: "의류/잡화",
            description: "작년에 구입한 겨울 패딩입니다. 거의 입지 않아서 상태 매우 좋아요. XL 사이즈입니다.",
            location: "영등포구 여의도역",
            distance: "3.7km",
            status: "available",
            statusText: "나눔중",
            time: "6시간 전",
            author: "박○○님",
            contact: "010-8901-2345",
            images: ["🧥"],
            views: 73,
            likes: 19
        },
        {
            id: 9,
            title: "아기 침대 (원목)",
            category: "kids",
            categoryName: "유아/아동용품",
            description: "아이가 커서 나눔합니다. 원목으로 제작된 아기침대이고 매트리스도 포함이에요.",
            location: "성북구 성신여대입구역",
            distance: "4.8km",
            status: "reserved",
            statusText: "예약중",
            time: "7시간 전",
            author: "이○○님",
            contact: "010-9012-3456",
            images: ["🛏️"],
            views: 92,
            likes: 27
        },
        {
            id: 10,
            title: "요리책 모음 (20권)",
            category: "books",
            categoryName: "도서/문구",
            description: "요리에 관심이 없어져서 나눔해요. 한식, 중식, 양식 요리책들로 구성되어 있습니다.",
            location: "구로구 구로디지털단지역",
            distance: "6.2km",
            status: "available",
            statusText: "나눔중",
            time: "8시간 전",
            author: "최○○님",
            contact: "010-0123-4567",
            images: ["📖"],
            views: 38,
            likes: 11
        },
        {
            id: 11,
            title: "운동화 (나이키 270mm)",
            category: "clothes",
            categoryName: "의류/잡화",
            description: "사이즈가 맞지 않아 나눔합니다. 한 번만 신어봤고 거의 새제품 상태입니다.",
            location: "서대문구 신촌역",
            distance: "3.4km",
            status: "completed",
            statusText: "완료",
            time: "1일 전",
            author: "한○○님",
            contact: "010-1234-5670",
            images: ["👟"],
            views: 156,
            likes: 42
        },
        {
            id: 12,
            title: "식물 가습기",
            category: "electronics",
            categoryName: "전자제품",
            description: "초음파 가습기입니다. 작동 잘 되고 필터도 새것으로 교체해서 드려요.",
            location: "동대문구 회기역",
            distance: "5.5km",
            status: "available",
            statusText: "나눔중",
            time: "1일 전",
            author: "정○○님",
            contact: "010-2345-6781",
            images: ["💧"],
            views: 67,
            likes: 15
        }
    ];
    
    // Add to existing items
    sampleItems.push(...additionalItems);
}

// Initialize with more data
addMoreSampleData();

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Simulate new items being added
        if (Math.random() < 0.1) { // 10% chance every interval
            simulateNewItem();
        }
        
        // Update view counts randomly
        currentItems.forEach(item => {
            if (Math.random() < 0.05) { // 5% chance per item
                item.views += Math.floor(Math.random() * 3) + 1;
            }
        });
        
        // Update times
        updateItemTimes();
    }, 30000); // Every 30 seconds
}

function simulateNewItem() {
    const categories = ['clothes', 'electronics', 'furniture', 'books', 'kids', 'etc'];
    const locations = ['강남역', '홍대입구역', '신촌역', '이태원역', '잠실역', '여의도역'];
    const items = ['책상', '의자', '가방', '신발', '책', '화분', '램프', '쿠션'];
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    
    const newItem = {
        id: Date.now() + Math.random(),
        title: `${randomItem} 나눔합니다`,
        category: randomCategory,
        categoryName: getCategoryName(randomCategory),
        description: `상태 좋은 ${randomItem}입니다. 필요하신 분께 나눔해요.`,
        location: randomLocation,
        distance: `${(Math.random() * 5 + 0.5).toFixed(1)}km`,
        status: 'available',
        statusText: '나눔중',
        time: '방금 전',
        author: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}○○님`,
        contact: '010-****-****',
        images: ['📦'],
        views: 1,
        likes: 0
    };
    
    currentItems.unshift(newItem);
    
    // If no filters applied, show the new item
    if (document.getElementById('categoryFilter').value === '' && 
        document.getElementById('statusFilter').value === '' && 
        document.getElementById('searchInput').value === '') {
        filteredItems.unshift(newItem);
        updateItemCount();
        
        // Show notification about new item
        showNotification(`새로운 나눔이 등록되었습니다: ${newItem.title}`, 'info');
    }
}

function updateItemTimes() {
    // This would update the time display in real applications
    // For demo purposes, we'll just log it
    console.log('시간 업데이트됨');
}

// Geolocation functions (simplified for demo)
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('위치 정보 획득:', position.coords);
                // In real app, this would update distance calculations
            },
            (error) => {
                console.warn('위치 정보 접근 실패:', error);
            }
        );
    }
}

// Advanced search functionality
function setupAdvancedSearch() {
    const searchInput = document.getElementById('searchInput');
    
    // Add search suggestions
    searchInput.addEventListener('focus', showSearchSuggestions);
    searchInput.addEventListener('blur', hideSearchSuggestions);
}

function showSearchSuggestions() {
    // Extract common terms from item titles
    const terms = new Set();
    currentItems.forEach(item => {
        item.title.split(' ').forEach(word => {
            if (word.length > 2) {
                terms.add(word);
            }
        });
    });
    
    // This would show a dropdown with suggestions in a real app
    console.log('검색 제안:', Array.from(terms).slice(0, 5));
}

function hideSearchSuggestions() {
    // Hide suggestions dropdown
    setTimeout(() => {
        console.log('검색 제안 숨김');
    }, 200);
}

// Analytics and tracking (simplified)
function trackUserInteraction(action, itemId = null) {
    const event = {
        action: action,
        itemId: itemId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    // In real app, this would send to analytics service
    console.log('사용자 상호작용 추적:', event);
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
    // In real app, this would lazy load images and optimize them
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

// Start real-time updates and get location
setTimeout(() => {
    startRealTimeUpdates();
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
        showNotification
    };
}