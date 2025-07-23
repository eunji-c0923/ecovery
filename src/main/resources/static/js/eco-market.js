/* ==========================================================================
   전역 변수 및 설정
   ========================================================================== */

// 상품 데이터 관련 전역 변수
let currentItems = [];      // 전체 상품 목록
let filteredItems = [];     // 필터링된 상품 목록
let currentPage = 1;        // 현재 페이지 번호
const itemsPerPage = 12;    // 페이지당 표시할 상품 수

/* ==========================================================================
   DOM 요소 참조
   ========================================================================== */

// 헤더 관련 요소
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// 모달 관련 요소
const addItemBtn = document.getElementById('addItemBtn');           // 상품 등록 버튼
const addItemModal = document.getElementById('addItemModal');       // 상품 등록 모달
const itemDetailModal = document.getElementById('itemDetailModal'); // 상품 상세보기 모달
const closeModal = document.getElementById('closeModal');           // 등록 모달 닫기 버튼
const closeDetailModal = document.getElementById('closeDetailModal'); // 상세보기 모달 닫기 버튼

// 폼 관련 요소
const addItemForm = document.getElementById('addItemForm');         // 상품 등록 폼

// 상품 목록 관련 요소
const itemsGrid = document.getElementById('itemsGrid');             // 상품 그리드 컨테이너
const loadMoreBtn = document.getElementById('loadMoreBtn');         // 더보기 버튼 (사용 안함)
const totalItems = document.getElementById('totalItems');           // 총 상품 수 표시
const pagination = document.getElementById('pagination');           // 페이지네이션 컨테이너

/* ==========================================================================
   페이지 초기화 및 이벤트 리스너 설정
   ========================================================================== */

// 페이지 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    initializePage();       // 페이지 기본 설정 초기화
    loadItems();           // 상품 데이터 로드
    setupEventListeners(); // 이벤트 리스너 설정
});

/* ==========================================================================
   페이지 초기화 함수
   ========================================================================== */

function initializePage() {
    // 헤더 스크롤 효과 설정
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 모바일 햄버거 메뉴 토글
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ==========================================================================
   이벤트 리스너 설정
   ========================================================================== */

function setupEventListeners() {
    // 모달 관련 이벤트
    addItemBtn.addEventListener('click', () => openModal(addItemModal));
    closeModal.addEventListener('click', () => closeModalHandler(addItemModal));
    closeDetailModal.addEventListener('click', () => closeModalHandler(itemDetailModal));
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === addItemModal) closeModalHandler(addItemModal);
        if (e.target === itemDetailModal) closeModalHandler(itemDetailModal);
    });

    // 폼 제출 이벤트
    addItemForm.addEventListener('submit', handleFormSubmit);
    
    // 취소 버튼 이벤트
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModalHandler(addItemModal);
    });

    // 필터 및 검색 이벤트
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('distanceFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);      // 가격 필터 추가
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('sortSelect').addEventListener('change', applySorting);
    
    // 더보기 버튼 (사용하지 않음)
    loadMoreBtn.addEventListener('click', loadMoreItems);

    // 파일 업로드 설정
    setupFileUpload();
}

/* ==========================================================================
   상품 데이터 로드 및 렌더링
   ========================================================================== */

// 상품 목록 로드 (백엔드에서 데이터를 가져오도록 수정 필요)
function loadItems() {
    // TODO: 백엔드 API 호출로 상품 데이터 가져오기
    // 예: fetch('/api/items').then(response => response.json()).then(data => { ... })
    
    currentItems = [];        // 백엔드에서 받은 데이터로 교체
    filteredItems = [...currentItems];      // 필터링된 목록 초기화
    currentPage = 1;                        // 첫 페이지로 설정
    renderItems();                          // 상품 목록 렌더링
    updateItemCount();                      // 상품 개수 업데이트
    renderPagination();                     // 페이지네이션 렌더링
}

// 상품 목록 렌더링
function renderItems(append = false) {
    // 새로 로드하는 경우 그리드 초기화
    if (!append) {
        itemsGrid.innerHTML = '';
        currentPage = currentPage || 1;
    }

    // 현재 페이지에 표시할 상품들 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredItems.slice(startIndex, endIndex);

    // 상품이 없는 경우 빈 상태 표시
    if (itemsToShow.length === 0 && currentPage === 1) {
        showEmptyState();
        loadMoreBtn.style.display = 'none';
        pagination.style.display = 'none';
        return;
    }

    // 각 상품에 대해 카드 생성 및 추가
    itemsToShow.forEach(item => {
        const itemElement = createItemElement(item);
        itemsGrid.appendChild(itemElement);
    });

    // 더보기 버튼 표시/숨김 (현재는 사용하지 않음)
    if (endIndex >= filteredItems.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }

    // 페이지네이션 표시
    pagination.style.display = 'flex';
    renderPagination();
}

/* ==========================================================================
   페이지네이션 관련 함수
   ========================================================================== */

// 페이지네이션 렌더링
function renderPagination() {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    // 페이지가 1개 이하인 경우 페이지네이션 숨김
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';
    pagination.innerHTML = '';

    // 이전 버튼 생성
    const prevBtn = createPaginationButton('‹', currentPage - 1, currentPage === 1);
    pagination.appendChild(prevBtn);

    // 페이지 번호 버튼들 생성
    const pageNumbers = generatePageNumbers(currentPage, totalPages);
    
    pageNumbers.forEach(pageNum => {
        if (pageNum === '...') {
            // 생략 표시 (...)
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        } else {
            // 일반 페이지 번호 버튼
            const pageBtn = createPaginationButton(pageNum, pageNum, false, pageNum === currentPage);
            pagination.appendChild(pageBtn);
        }
    });

    // 다음 버튼 생성
    const nextBtn = createPaginationButton('›', currentPage + 1, currentPage === totalPages);
    pagination.appendChild(nextBtn);
}

// 페이지네이션 버튼 생성
function createPaginationButton(text, pageNum, disabled = false, active = false) {
    const button = document.createElement('button');
    button.className = `pagination-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
    button.textContent = text;
    
    // 비활성 상태가 아닌 경우 클릭 이벤트 추가
    if (!disabled) {
        button.addEventListener('click', () => {
            currentPage = pageNum;
            renderItems();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 상단으로 스크롤
        });
    }
    
    return button;
}

// 페이지 번호 생성 (스마트 페이지네이션)
function generatePageNumbers(current, total) {
    const pages = [];
    const maxVisible = 7; // 최대 표시할 페이지 수
    
    if (total <= maxVisible) {
        // 총 페이지가 7개 이하면 모두 표시
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // 총 페이지가 7개 초과인 경우 스마트 표시
        if (current <= 4) {
            // 현재 페이지가 앞쪽에 있을 때
            for (let i = 1; i <= 5; i++) {
                pages.push(i);
            }
            pages.push('...');
            pages.push(total);
        } else if (current >= total - 3) {
            // 현재 페이지가 뒤쪽에 있을 때
            pages.push(1);
            pages.push('...');
            for (let i = total - 4; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // 현재 페이지가 중간에 있을 때
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

/* ==========================================================================
   상품 카드 생성
   ========================================================================== */

// 개별 상품 카드 요소 생성
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-card';
    itemDiv.addEventListener('click', () => openItemDetail(item));

    // 할인율 계산
    const discountPercent = item.originalPrice ? 
        Math.round((1 - item.price / item.originalPrice) * 100) : 0;

    itemDiv.innerHTML = `
        <div class="item-image">
            ${item.images[0]}
            <div class="item-status ${item.status}">${item.statusText}</div>
            ${item.condition !== 'poor' ? `<div class="condition-badge">${item.conditionText}</div>` : ''}
        </div>
        <div class="item-info">
            <h3 class="item-title">${item.title}</h3>
            <div class="item-price">
                ${formatPrice(item.price)}원
                ${item.originalPrice ? `<span class="original-price">${formatPrice(item.originalPrice)}원</span>` : ''}
            </div>
            <span class="item-category">${item.categoryName}</span>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
                <div class="item-location">📍 ${item.location}</div>
                <div class="item-stats">
                    <span>👁️ ${item.views}</span>
                    <span>❤️ ${item.likes}</span>
                </div>
                <div class="item-time">${item.time}</div>
            </div>
        </div>
    `;

    return itemDiv;
}

/* ==========================================================================
   상품 상세보기 모달
   ========================================================================== */

// 상품 상세보기 모달 열기
function openItemDetail(item) {
    const detailContent = document.getElementById('detailContent');
    document.getElementById('detailTitle').textContent = item.title;
    
    // 상세보기 내용 생성
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
                <div class="detail-price">
                    ${formatPrice(item.price)}원
                    ${item.originalPrice ? `<span class="original-price">${formatPrice(item.originalPrice)}원</span>` : ''}
                </div>
                <span class="item-category">${item.categoryName}</span>
                <div class="detail-status ${item.status}">${item.statusText}</div>
            </div>
            
            <div class="condition-info">
                <h4>상품 상태</h4>
                <div class="condition-rating">
                    <span class="condition-stars">${'★'.repeat(item.conditionRating)}${'☆'.repeat(5-item.conditionRating)}</span>
                    <span>${item.conditionText}</span>
                </div>
            </div>
            
            <div class="detail-description">
                <h4>상세 설명</h4>
                <p>${item.description}</p>
            </div>
            
            <div class="detail-meta">
                <div class="meta-item">
                    <span class="meta-label">거래 장소</span>
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
                    <button class="btn btn-primary" onclick="contactSeller(${item.id})">판매자와 채팅하기</button>
                    <button class="btn btn-secondary" onclick="likeItem(${item.id})">관심 상품 등록 ❤️</button>
                ` : item.status === 'reserved' ? `
                    <button class="btn btn-secondary" disabled>예약중입니다</button>
                ` : `
                    <button class="btn btn-secondary" disabled>판매완료된 상품입니다</button>
                `}
            </div>
            
            <div class="seller-info">
                <h4>판매자 정보</h4>
                <p><strong>닉네임:</strong> ${item.seller}</p>
                <div class="seller-rating">
                    <span>평점: ⭐ ${item.sellerRating}/5.0</span>
                    <span>응답속도: ${item.sellerResponse}</span>
                </div>
                <div class="seller-stats">
                    <div class="stat-box">
                        <span class="stat-number">${item.sellerSales}</span>
                        <span class="stat-label">거래완료</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-number">98%</span>
                        <span class="stat-label">만족도</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    openModal(itemDetailModal);
}

/* ==========================================================================
   필터링 및 정렬 함수
   ========================================================================== */

// 필터 적용
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const distance = document.getElementById('distanceFilter').value;
    const price = document.getElementById('priceFilter').value;
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    filteredItems = currentItems.filter(item => {
        // 카테고리 필터
        if (category && item.category !== category) return false;
        
        // 상태 필터
        if (status && item.status !== status) return false;
        
        // 검색어 필터 (제목과 설명에서 검색)
        if (search && !item.title.toLowerCase().includes(search) && 
            !item.description.toLowerCase().includes(search)) return false;
        
        // 거리 필터 (단순화된 버전)
        if (distance) {
            const itemDistance = parseFloat(item.distance);
            const maxDistance = parseFloat(distance) / 1000; // m를 km로 변환
            if (itemDistance > maxDistance) return false;
        }
        
        // 가격 필터
        if (price) {
            const [minPrice, maxPrice] = price.split('-').map(Number);
            if (item.price < minPrice || item.price > maxPrice) return false;
        }
        
        return true;
    });

    currentPage = 1; // 필터 적용 시 첫 페이지로 이동
    renderItems();
    updateItemCount();
}

// 정렬 적용
function applySorting() {
    const sortBy = document.getElementById('sortSelect').value;
    
    filteredItems.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                // 최신순 (시간 기준, 단순화된 버전)
                return new Date(b.time) - new Date(a.time);
            case 'price-low':
                // 가격 낮은순
                return a.price - b.price;
            case 'price-high':
                // 가격 높은순
                return b.price - a.price;
            case 'distance':
                // 거리순
                return parseFloat(a.distance) - parseFloat(b.distance);
            case 'popular':
                // 인기순 (조회수 기준)
                return b.views - a.views;
            default:
                return 0;
        }
    });

    currentPage = 1; // 정렬 적용 시 첫 페이지로 이동
    renderItems();
}

// 더보기 버튼 클릭 (현재는 사용하지 않음)
function loadMoreItems() {
    currentPage++;
    renderItems(true);
}

// 상품 개수 업데이트
function updateItemCount() {
    totalItems.textContent = `총 ${filteredItems.length}개`;
}

// 빈 상태 표시 (검색 결과가 없을 때)
function showEmptyState() {
    itemsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 시도해보세요.<br>또는 새로운 상품을 등록해보세요!</p>
        </div>
    `;
}

/* ==========================================================================
   모달 관련 함수
   ========================================================================== */

// 모달 열기
function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
}

// 모달 닫기
function closeModalHandler(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // 배경 스크롤 복원
    
    // 상품 등록 모달인 경우 폼 리셋
    if (modal === addItemModal) {
        resetForm();
    }
}

/* ==========================================================================
   폼 처리 함수
   ========================================================================== */

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    
    // TODO: 백엔드 API로 상품 등록 요청
    // 폼 데이터 수집
    const newItem = {
        id: Date.now(), // 임시 ID (실제로는 서버에서 생성)
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        categoryName: getCategoryName(document.getElementById('itemCategory').value),
        price: parseInt(document.getElementById('itemPrice').value),
        originalPrice: null, // 새 상품이므로 원래 가격 없음
        condition: document.getElementById('itemCondition').value,
        conditionText: getConditionText(document.getElementById('itemCondition').value),
        conditionRating: getConditionRating(document.getElementById('itemCondition').value),
        description: document.getElementById('itemDescription').value || '상세 설명이 없습니다.',
        location: document.getElementById('itemLocation').value || '장소 미정',
        distance: '0m', // 새 상품이므로 거리 0
        status: 'available',
        statusText: '판매중',
        time: '방금 전',
        seller: '나',
        sellerRating: 5.0,
        sellerSales: 0,
        sellerResponse: '빠름',
        contact: '010-0000-0000',
        images: ['📦'], // 기본 이미지
        views: 0,
        likes: 0
    };

    // 상품 목록에 추가 (맨 앞에)
    currentItems.unshift(newItem);
    
    // 성공 메시지 표시
    showNotification('상품이 성공적으로 등록되었습니다!', 'success');
    
    // 모달 닫기 및 목록 새로고침
    closeModalHandler(addItemModal);
    applyFilters();
}

// 폼 리셋
function resetForm() {
    addItemForm.reset();
    document.getElementById('imagePreview').innerHTML = '';
}

// 카테고리 이름 가져오기
function getCategoryName(category) {
    const categories = {
        'clothes': '의류/잡화',
        'electronics': '전자제품',
        'furniture': '가구/인테리어',
        'books': '도서/문구',
        'kids': '유아/아동용품',
        'sports': '스포츠/레저',
        'beauty': '뷰티/미용',
        'home': '생활/주방용품',
        'etc': '기타'
    };
    return categories[category] || '기타';
}

// 상품 상태 텍스트 가져오기
function getConditionText(condition) {
    const conditions = {
        'new': '새제품',
        'like-new': '거의 새것',
        'good': '좋음',
        'fair': '보통',
        'poor': '나쁨'
    };
    return conditions[condition] || '상태 미정';
}

// 상품 상태 별점 가져오기
function getConditionRating(condition) {
    const ratings = {
        'new': 5,
        'like-new': 5,
        'good': 4,
        'fair': 3,
        'poor': 2
    };
    return ratings[condition] || 3;
}

/* ==========================================================================
   파일 업로드 처리
   ========================================================================== */

function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('itemImages');
    const imagePreview = document.getElementById('imagePreview');
    
    // 업로드 영역 클릭 시 파일 선택 창 열기
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // 드래그 앤 드롭 이벤트
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
    
    // 파일 입력 변경 이벤트
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // 파일 처리 함수
    function handleFiles(files) {
        const maxFiles = 10; // 최대 업로드 가능한 파일 수
        const currentImages = imagePreview.children.length;
        
        if (currentImages + files.length > maxFiles) {
            showNotification(`최대 ${maxFiles}장까지만 업로드 가능합니다.`, 'error');
            return;
        }
        
        // 각 파일에 대해 미리보기 생성
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

// 미리보기 이미지 제거
function removePreview(button) {
    button.parentElement.remove();
}

/* ==========================================================================
   상품 상호작용 함수
   ========================================================================== */

// 판매자와 채팅하기
function contactSeller(itemId) {
    // TODO: 백엔드 API로 채팅방 생성 요청
    showNotification('판매자와의 채팅방이 열렸습니다! 💬', 'success');
    closeModalHandler(itemDetailModal);
    // 실제로는 채팅 페이지로 이동하거나 채팅 모달을 열 것
}

// 관심 상품 등록
function likeItem(itemId) {
    // TODO: 백엔드 API로 관심 상품 등록/해제 요청
    const item = currentItems.find(item => item.id === itemId);
    if (item) {
        item.likes++;
        showNotification('관심 상품으로 등록되었습니다! ❤️', 'success');
        
        // 상세보기 모달이 열려있는 경우 UI 업데이트
        const likeElement = document.querySelector('.meta-value');
        if (likeElement && likeElement.textContent.includes('❤️')) {
            likeElement.textContent = `❤️ ${item.likes}`;
        }
    }
}

/* ==========================================================================
   알림 시스템
   ========================================================================== */

// 알림 메시지 표시
function showNotification(message, type = 'success') {
    // 기존 알림이 있으면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 알림 스타일 설정
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
    
    // 애니메이션으로 표시
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/* ==========================================================================
   유틸리티 함수
   ========================================================================== */

// 디바운스 함수 (검색 입력 최적화용)
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

// 가격 포맷팅 (천 단위 콤마 추가)
function formatPrice(price) {
    return price.toLocaleString();
}