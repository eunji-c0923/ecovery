/*서버에서 받은 데이터를 사용자가 읽기 좋게 바꿔주는 유틸리티 함수*/
// 거래상태
function getStatusText(status){
    switch (status){
        case 'ONGOING': return '나눔중';
        case 'DONE': return '나눔 완료';
        default: return '나눔중';
    }
}

// 상품상태
function getConditionText(condition){
    switch (condition){
        case 'HIGH': return "상 (매우 좋음)";
        case 'MEDIUM': return '중 (보통)';
        case 'LOW': return '하 (사용감 있음)';
        default: return '상 (매우 좋음)';
    }
}

// 등록된 시간이 현재 시간보다 얼마나 지났는지 계산
function formatTimeAgo(dateTime){
    const now = new Date();
    const created = new Date(dateTime);
    const diff = Math.floor((now - created) / 1000); // 초단위

    if (diff < 60) return '방금 전';

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}분 전`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;

    return created.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\./g, '. ').trim();
}

// 전역 변수 선언
let currentItems = [];  // 현재 페이지의 나눔 게시글 데이터를 담는 배열 (서버 응답)
let currentPage = 1;  // 현재 보고 있는 페이지 번호 (페이징용)
const itemsPerPage = 8; // 한 페이지당 보여줄 게시글 수 (8개로 고정)
let totalPages = 1;   // 서버에서 받은 총 페이지 수

// DOM elements - HTML 요소(id로 찾은 것들)를 미리 변수로 선언해 놓은 코드
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const addItemBtn = document.getElementById('addItemBtn');
const itemsGrid = document.getElementById('itemsGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn'); // 이제 사용하지 않음
const totalItemsSpan = document.getElementById('totalItems'); // 이름 변경해서 스팬임을 명확히 함
const pagination = document.getElementById('pagination');

/* 페이지가 처음 로딩되었을 때 실행되는 함수*/
// 1. 페이지 로드 후 실행
document.addEventListener('DOMContentLoaded', async function() {
    initializePage(); // 필터/모달 초기화
    setupEventListeners(); // 이벤트 리스너 먼저 설정

    // 첫 페이지 로딩 (초기 검색 조건으로)
    await loadPage(currentPage);
});

// ✅ 개선사항: 페이지 전환 애니메이션을 위한 헬퍼 함수 추가
function addPageTransitionEffect() {
    const itemsGrid = document.getElementById('itemsGrid');
    if (itemsGrid) {
        itemsGrid.classList.add('loading');
        // 짧은 딜레이 후 로딩 클래스 제거
        setTimeout(() => {
            itemsGrid.classList.remove('loading');
            itemsGrid.classList.add('loaded');
        }, 200);
    }
}

// 페이지 번호와 현재 검색/필터 조건을 포함하여 서버에서 데이터 요청하고 렌더링하는 함수
async function loadPage(pageNum) {
    try {
        // ✅ 개선사항: 페이지 전환 시 애니메이션 효과 시작
        addPageTransitionEffect();

        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');

        const selectedType = categoryFilter ? categoryFilter.value : ''; // 사용자 선택값: title, content 등
        const keyword = searchInput ? searchInput.value.trim() : '';

        currentPage = pageNum;

        const queryParams = new URLSearchParams({
            pageNum: currentPage,
            amount: itemsPerPage
        });

        if (keyword) queryParams.append('keyword', keyword);
        // type이 비어있지 않고 'ALL'이 아닐 때만 type 파라미터를 추가
        if (selectedType && selectedType !== 'ALL') queryParams.append('type', selectedType);

        const res = await fetch(`/api/free/list?${queryParams.toString()}`);
        const result = await res.json();

        console.log('서버 응답 result:', result);
        console.log('현재 페이지 아이템:', result.list || result.content);
        console.log('총 게시글 수:', result.pageMaker?.total);

        const list = Array.isArray(result.list)
            ? result.list
            : Array.isArray(result.content)
                ? result.content
                : [];

        currentItems = list;

        const totalCount = result.pageMaker?.total || 0;
        totalPages = Math.ceil(totalCount / itemsPerPage);
        if (totalPages === 0 && totalCount > 0) totalPages = 1;

        // ✅ 개선사항: 데이터 로딩 후 애니메이션과 함께 렌더링
        setTimeout(() => {
            renderItems();
            updateItemCount(totalCount);
            renderPagination();
        }, 100);

    } catch (err) {
        console.error('데이터 불러오기 실패 : ', err);
        showEmptyState();
    }
}

// 현재 필터링된 게시글 수를 화면에 표시하는 함수
// 매개변수로 서버에서 받은 totalCount를 사용합니다.
function updateItemCount(count) {
    if (totalItemsSpan) {
        totalItemsSpan.textContent = `총 ${count}건`;
    } else {
        console.warn('⚠️ totalItemsSpan 요소를 찾을 수 없습니다.');
    }
}

// ✅ 개선사항: 무료나눔 게시글 아이템 카드 생성 함수 - 거래상태 위치 변경
function createItemElement(item) {
    const card = document.createElement('div');
    card.className = 'sharing-card';

    // ✅ 개선사항 1: 거래상태를 조회수 옆으로 이동하여 레이아웃 개선
    card.innerHTML = `
        <div class="item-image">
            <img src="${item.imgUrl || '/img/logo.png'}" alt="${item.title}">
        </div>
        <div class="item-info">
            <h3 class="item-title">${item.title}</h3>
            <div class="item-meta">
                <span class="item-category">${item.category}</span>
                <span class="item-condition">${getConditionText(item.itemCondition)}</span>
            </div>
            <div class="item-location">
                <span>📍${item.regionGu} ${item.regionDong}</span>
                <span class="item-time">${formatTimeAgo(item.createdAt)}</span>
            </div>
            <div class="item-stats">
                <span class="stat-item">👁️ ${item.viewCount}</span>
                <div class="item-status ${getStatusClass(item.dealStatus)}">${getStatusText(item.dealStatus)}</div>
            </div>
        </div>
    `;

    // ✅ 개선사항: 카드 클릭 시 부드러운 전환 효과
    card.addEventListener('click', (e) => {
        // 클릭 효과 추가
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
            window.location.href = `/free/get/${item.freeId}`;
        }, 150);
    });

    return card;
}

// ✅ 개선사항: 거래상태에 따른 CSS 클래스 반환 함수 추가
function getStatusClass(status) {
    switch (status) {
        case 'ONGOING': return 'available';
        case 'DONE': return 'completed';
        default: return 'available';
    }
}

// Page initialization
function initializePage() {
    // 헤더 스크롤 효과
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 햄버거 메뉴 클릭 시 모바일 메뉴 토글
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');

            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        });
    }
    
    // 필터 초기화 (페이지 로드 시 검색창과 카테고리 필드를 초기화)
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchInput');
    if (categoryFilter) categoryFilter.value = 'TCR';
    if (searchInput) searchInput.value = '';
}

function setupEventListeners() {
    // 페이지 이동
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        window.location.href = '/free/register';
    });

    // ✅ 개선사항: 필터 변경 시 부드러운 전환 효과 추가
    document.getElementById('categoryFilter')?.addEventListener('change', () => {
        // 카테고리 변경 시 애니메이션 효과
        const itemsGrid = document.getElementById('itemsGrid');
        if (itemsGrid) {
            itemsGrid.style.opacity = '0.7';
            itemsGrid.style.transform = 'translateY(20px)';
        }
        
        setTimeout(() => {
            loadPage(1);
            if (itemsGrid) {
                itemsGrid.style.opacity = '1';
                itemsGrid.style.transform = 'translateY(0)';
            }
        }, 200);
    });

    // 검색 입력 이벤트
    document.getElementById('searchInput')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 폼 제출 방지
            loadPage(1);
        }
    });
    
    // 정렬은 현재 클라이언트에서만 동작하며, 'distance'는 제거 또는 서버 구현 필요
    // 이 코드만으로는 전체 데이터 정렬이 불가능함을 인지해야 함
    document.getElementById('sortSelect')?.addEventListener('change', applySorting);
    document.getElementById('searchBtn')?.addEventListener('click', () => loadPage(1));

    // 더보기 버튼은 이제 사용하지 않으므로 숨김 처리
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

// 아이템 전체를 화면에 렌더링
function renderItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    const pagination = document.getElementById('pagination');

    if (!itemsGrid || !pagination) {
        console.warn('필수 DOM 요소가 존재하지 않아 렌더링을 중단합니다.');
        return;
    }

    // 1. 기존 내용 초기화
    itemsGrid.innerHTML = '';

    // 2. 결과 없을 때 처리
    if (!currentItems || currentItems.length === 0) {
        showEmptyState();
        pagination.style.display = 'none';
        return;
    }

    // ✅ 개선사항: 3. 아이템 렌더링 시 순차적 애니메이션 효과를 위한 초기 숨김
    itemsGrid.style.opacity = '0';
    
    currentItems.forEach((item, index) => {
        if (!item) {
            console.warn("item이 undefined입니다. 현재 페이지 데이터:", currentItems);
            return;
        }
        const itemElement = createItemElement(item);
        
        // ✅ 개선사항: 순차적 등장 애니메이션을 위한 초기 설정
        itemElement.style.opacity = '0';
        itemElement.style.transform = 'translateY(30px)';
        
        itemsGrid.appendChild(itemElement);
        
        // ✅ 개선사항: 순차적 애니메이션 적용
        setTimeout(() => {
            itemElement.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            itemElement.style.opacity = '1';
            itemElement.style.transform = 'translateY(0)';
        }, index * 100); // 각 카드마다 100ms 딜레이
    });

    // ✅ 개선사항: 전체 그리드 페이드인 효과
    setTimeout(() => {
        itemsGrid.style.transition = 'opacity 0.3s ease';
        itemsGrid.style.opacity = '1';
    }, 100);

    // 4. 페이지네이션 표시 (loadPage에서 이미 호출하므로 여기서 또 호출할 필요 없음)
    pagination.style.display = 'flex';
}

// 새로운 페이징 렌더링 함수
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

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

// ✅ 개선사항: 페이징 버튼 생성 함수 - 클릭 효과 개선
function createPaginationButton(text, pageNum, disabled = false, active = false) {
    const button = document.createElement('button');
    button.className = `pagination-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''}`;
    button.textContent = text;

    if (!disabled) {
        button.addEventListener('click', async () => {
            // '...' 버튼 클릭 시에는 아무 동작도 하지 않음
            if (text === '...') {
                return;
            }
            
            // ✅ 개선사항: 버튼 클릭 시 시각적 피드백 추가
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
            
            await loadPage(pageNum); // 서버에서 해당 페이지 데이터
            window.scrollTo({ top: 0, behavior: 'smooth' }); // 페이지 상단으로 스크롤
        });
    }
    return button;
}

// 페이지 번호 생성 함수
function generatePageNumbers(current, total) {
    const pages = [];
    const maxVisible = 7; // 최대 표시할 페이지 수

    if (total <= maxVisible) {
        // 총 페이지가 7개 이하면 모두 표시
        for (let i = 1; i <= total; i++) {
            pages.push(i);
        }
    } else {
        // 총 페이지가 7개 초과인 경우
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

// 무료나눔 게시판에서 검색 필터링 기능을 수행하는 함수 (이제 단순히 loadPage(1) 호출)
function applyFilters() {
    loadPage(1); // 검색/필터 변경 시 항상 1페이지로 돌아가도록
}

// Apply sorting (정렬 기준 필드는 서버에 따라 달라질 수 있음)
function applySorting() {
    const sortBy = document.getElementById('sortSelect').value;

    // 현재 로드된 currentItems (해당 페이지 데이터)에 대해서만 정렬합니다.
    // 만약 전체 데이터를 대상으로 정렬하고 싶다면, 정렬 기준도 서버에 보내서 처리해야 합니다.
    currentItems.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                // createdAt 필드를 기준으로 최신순 정렬
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'distance':
                // 'distance' 필드가 API 응답에 없으므로, 이 정렬은 작동하지 않습니다.
                // 서버에서 거리 계산 및 정렬을 구현하거나, 이 옵션을 제거해야 합니다.
                console.warn("Distance sorting not implemented/supported by API.");
                return 0;
            case 'popular':
                // viewCount 필드를 기준으로 인기순 정렬
                return b.viewCount - a.viewCount;
            default:
                return 0;
        }
    });

    renderItems(); // 정렬된 아이템 다시 렌더링
}

// 결과없음을 보여주는 코드
function showEmptyState() {
    if (!itemsGrid) return;
    itemsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색어나 필터를 시도해보세요.<br>또는 새로운 나눔 물건을 등록해보세요!</p>
            <a href="/free/register" class="btn btn-primary">나눔 등록하기</a>
        </div>
    `;
}

// 해당하는 한글 카테고리명
function getCategoryName(category) {
    const categories = {
        'furniture': '가구',
        'appliances': '가전',
        'accessory': '잡화',
        'etc': '기타'
    };
    return categories[category] || '기타';
}

// ✅ 개선사항: 향상된 알림창 - 애니메이션 효과 개선
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--primary-green)' : type === 'error' ? '#dc3545' : 'var(--accent-green)'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px) scale(0.8);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        max-width: 300px;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    // ✅ 개선사항: 부드러운 등장 애니메이션
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
    }, 100);

    // ✅ 개선사항: 부드러운 사라짐 애니메이션
    setTimeout(() => {
        notification.style.transform = 'translateX(400px) scale(0.8)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

// 디바운스 유틸리티 함수
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

// Real-time updates simulation (현재 비활성화/사용하지 않으므로 제거하거나 주석 처리 유지)
// function startRealTimeUpdates() {
//     console.log('실시간 업데이트 시뮬레이션 비활성화 - 서버 API 사용 중');
// }
// function updateItemTimes() {
//     console.log('시간 업데이트 비활성화 - 서버 데이터 사용 중');
// }

// Advanced search functionality (현재 비활성화/사용하지 않으므로 제거하거나 주석 처리 유지)
// function setupAdvancedSearch() {
//     const searchInput = document.getElementById('searchInput');
//     if (searchInput) {
//         searchInput.addEventListener('focus', showSearchSuggestions);
//         searchInput.addEventListener('blur', hideSearchSuggestions);
//     }
// }
// function showSearchSuggestions() { console.log('검색 제안 비활성화'); }
// function hideSearchSuggestions() { console.log('검색 제안 숨김 비활성화'); }

// Analytics and tracking (simplified)
function trackUserInteraction(action, itemId = null) {
    const event = { action: action, itemId: itemId, timestamp: new Date().toISOString(), userAgent: navigator.userAgent };
    console.log('사용자 상호작용 추적:', event);
}

// ✅ 개선사항: 성능 최적화 - 이미지 지연 로딩 개선
function optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    // ✅ 개선사항: 이미지 로딩 시 부드러운 페이드인 효과
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                    
                    imageObserver.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    }
}

// 초기화 시뮬레이션 코드들 비활성화
setTimeout(() => {
    // startRealTimeUpdates();
    // getCurrentLocation(); // 이 함수는 정의되지 않아 제거함
    // setupAdvancedSearch();
    optimizeImages();
}, 2000);

// Export functions for testing (테스트용이 아니라면 제거)
// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = {
//         loadPage,
//         applyFilters,
//         createItemElement,
//         showNotification,
//         renderPagination,
//         generatePageNumbers
//     };
// }