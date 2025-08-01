/**
 * ============================================================================
 * GreenCycle 구매이력 페이지 JavaScript
 * 주문 목록 조회, 필터링, 검색, 페이지네이션 등의 기능을 제공합니다
 * ============================================================================
 */

// ==========================================================================
// 전역 변수 선언 및 설정
// ==========================================================================

/**
 * 주문 데이터 관련 전역 변수
 */
let originalOrderList = [];      // 서버에서 받아온 원본 주문 목록
let filteredOrderList = [];      // 필터링이 적용된 주문 목록
let displayedOrderList = [];     // 현재 페이지에 표시될 주문 목록

/**
 * 페이지네이션 관련 전역 변수
 */
let currentPage = 1;             // 현재 활성 페이지 번호
let itemsPerPage = 10;           // 데스크탑에서 페이지당 표시할 주문 수
let totalPages = 1;              // 전체 페이지 수

/**
 * 시스템 상태 관련 전역 변수
 */
let isInitialized = false;       // 페이지 초기화 완료 여부
let isLoading = false;           // 데이터 로딩 상태

/**
 * DOM 요소 참조 (페이지 로드 후 할당됨)
 */
let statusFilter = null;         // 주문상태 필터 select 요소
let periodFilter = null;         // 기간 필터 select 요소
let searchInput = null;          // 검색 입력 input 요소
let orderTableBody = null;       // 테이블 tbody 요소
let orderCardsContainer = null;  // 모바일 카드 컨테이너
let pageNumbers = null;          // 페이지 번호 컨테이너

// ==========================================================================
// 페이지 초기화 - DOMContentLoaded 이벤트 리스너
// ==========================================================================

/**
 * 페이지가 완전히 로드된 후 실행되는 메인 초기화 함수
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🛒 GreenCycle 구매이력 페이지 초기화를 시작합니다...');

        // DOM 요소 참조 초기화
        initializeDOMReferences();

        // 서버에서 전달받은 주문 데이터 초기화
        initializeOrderData();

        // 핵심 기능들 순차적으로 초기화
        initializeFilters();           // 필터링 기능 초기화
        initializeSearch();            // 검색 기능 초기화
        initializePagination();        // 페이지네이션 초기화
        initializeResponsive();        // 반응형 기능 초기화
        initializeKeyboardShortcuts(); // 키보드 단축키 초기화
        initializeAccessibility();     // 접근성 기능 초기화

        // 초기 데이터 필터링 및 화면 표시
        filterAndDisplayOrders();

        // 초기화 완료 플래그 설정
        isInitialized = true;
        console.log('✅ 구매이력 페이지가 성공적으로 초기화되었습니다.');

        // 사용자에게 환영 메시지 표시 (1초 후)
        setTimeout(() => {
            showNotification('구매이력을 불러왔습니다! 📋', 'success');
        }, 1000);

    } catch (error) {
        handleError(error, '페이지 초기화');
    }
});

// ==========================================================================
// DOM 요소 참조 초기화
// ==========================================================================

/**
 * 자주 사용되는 DOM 요소들의 참조를 미리 저장합니다
 */
function initializeDOMReferences() {
    try {
        // 필터링 관련 요소들
        statusFilter = document.getElementById('statusFilter');
        periodFilter = document.getElementById('periodFilter');
        searchInput = document.getElementById('searchInput');

        // 주문 목록 표시 관련 요소들
        orderTableBody = document.getElementById('orderTableBody');
        orderCardsContainer = document.querySelector('.order-cards-container');
        
        // 페이지네이션 관련 요소들
        pageNumbers = document.getElementById('pageNumbers');

        console.log('✅ DOM 요소 참조가 초기화되었습니다.');

    } catch (error) {
        console.error('DOM 요소 참조 초기화 중 오류:', error);
    }
}

// ==========================================================================
// 주문 데이터 초기화
// ==========================================================================

/**
 * 서버에서 전달받은 주문 데이터를 JavaScript에서 사용할 수 있도록 초기화합니다
 */
function initializeOrderData() {
    try {
        // Thymeleaf에서 전달받은 orderSummaries 전역 변수 사용
        if (typeof orderSummaries !== 'undefined' && Array.isArray(orderSummaries)) {
            // 원본 데이터 보존을 위해 깊은 복사 수행
            originalOrderList = JSON.parse(JSON.stringify(orderSummaries));
            filteredOrderList = JSON.parse(JSON.stringify(orderSummaries));
            
            console.log(`주문 데이터 로드 완료: ${originalOrderList.length}건`);
            
            // 주문 데이터가 있는 경우 추가 처리
            if (originalOrderList.length > 0) {
                preprocessOrderData();
            }
        } else {
            // 주문 데이터가 없는 경우 빈 배열로 초기화
            originalOrderList = [];
            filteredOrderList = [];
            console.warn('주문 데이터가 없거나 올바르지 않습니다.');
        }
    } catch (error) {
        console.error('주문 데이터 초기화 중 오류:', error);
        // 오류 발생 시 빈 배열로 초기화하여 페이지가 깨지지 않도록 함
        originalOrderList = [];
        filteredOrderList = [];
    }
}

/**
 * 주문 데이터 전처리 (날짜 형식 변환, 정렬 등)
 */
function preprocessOrderData() {
    try {
        originalOrderList = originalOrderList.map(order => {
            // 날짜 문자열을 Date 객체로 변환
            if (typeof order.createdAt === 'string') {
                order.createdAt = new Date(order.createdAt);
            }
            
            // 주문 상태 정규화
            if (order.orderStatus && typeof order.orderStatus === 'object' && order.orderStatus.name) {
                order.orderStatus = order.orderStatus.name;
            }
            
            return order;
        });

        // 주문 목록을 최신순으로 정렬
        originalOrderList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        filteredOrderList = [...originalOrderList];

        console.log('✅ 주문 데이터 전처리가 완료되었습니다.');

    } catch (error) {
        console.error('주문 데이터 전처리 중 오류:', error);
    }
}

// ==========================================================================
// 필터링 기능 초기화 및 관리
// ==========================================================================

/**
 * 주문 상태 및 기간 필터링 기능을 초기화합니다
 */
function initializeFilters() {
    try {
        // 주문상태 필터 이벤트 리스너 등록
        if (statusFilter) {
            statusFilter.addEventListener('change', handleFilterChange);
        }

        // 기간 필터 이벤트 리스너 등록
        if (periodFilter) {
            periodFilter.addEventListener('change', handleFilterChange);
        }

        console.log('✅ 필터링 기능이 초기화되었습니다.');

    } catch (error) {
        console.error('필터링 기능 초기화 중 오류:', error);
    }
}

/**
 * 필터 변경 이벤트를 처리합니다
 */
function handleFilterChange() {
    try {
        // 필터 변경 시 첫 페이지로 이동
        currentPage = 1;
        
        // 필터링 및 화면 업데이트 실행
        filterAndDisplayOrders();
        
        // 사용자에게 필터링 완료 알림
        const statusText = statusFilter ? statusFilter.options[statusFilter.selectedIndex].text : '전체';
        const periodText = periodFilter ? periodFilter.options[periodFilter.selectedIndex].text : '전체';
        
        // 필터링 결과가 있을 때만 알림 표시
        if (filteredOrderList.length > 0) {
            showNotification(`${statusText} 상태, ${periodText} 기간으로 필터링되었습니다.`, 'info');
        }

    } catch (error) {
        handleError(error, '필터 변경 처리');
    }
}

/**
 * 주문 목록을 필터링하고 화면에 표시합니다
 */
function filterAndDisplayOrders() {
    try {
        // 로딩 상태 설정
        setLoadingState(true);

        // 1단계: 상태별 필터링
        let filtered = filterByStatus(originalOrderList);
        
        // 2단계: 기간별 필터링
        filtered = filterByPeriod(filtered);
        
        // 3단계: 검색어로 필터링
        filtered = filterBySearch(filtered);

        // 필터링된 결과 저장
        filteredOrderList = filtered;

        // 페이지네이션 정보 계산
        calculatePagination();

        // 현재 페이지에 해당하는 데이터 추출
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        displayedOrderList = filteredOrderList.slice(startIndex, endIndex);

        // 화면에 데이터 표시
        displayOrders();
        updatePagination();

        // 로딩 상태 해제
        setLoadingState(false);

        console.log(`필터링 완료: ${filteredOrderList.length}건 (전체 ${originalOrderList.length}건 중)`);

    } catch (error) {
        setLoadingState(false);
        handleError(error, '주문 목록 필터링 및 표시');
    }
}

/**
 * 주문 상태별로 목록을 필터링합니다
 * @param {Array} orders - 필터링할 주문 목록
 * @returns {Array} 필터링된 주문 목록
 */
function filterByStatus(orders) {
    const statusValue = statusFilter ? statusFilter.value.trim() : '';
    
    // 전체 선택인 경우 필터링하지 않음
    if (!statusValue) {
        return orders;
    }

    return orders.filter(order => {
        const orderStatus = getOrderStatusValue(order);
        return orderStatus === statusValue;
    });
}

/**
 * 기간별로 주문 목록을 필터링합니다
 * @param {Array} orders - 필터링할 주문 목록
 * @returns {Array} 필터링된 주문 목록
 */
function filterByPeriod(orders) {
    const periodValue = periodFilter ? periodFilter.value.trim() : '';
    
    // 전체 기간 선택인 경우 필터링하지 않음
    if (!periodValue) {
        return orders;
    }

    const now = new Date();
    let startDate;

    // 기간별 시작 날짜 계산
    switch (periodValue) {
        case '1month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
        case '3month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
        case '6month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
        case '1year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
        default:
            return orders;
    }

    return orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate;
    });
}

/**
 * 검색어로 주문 목록을 필터링합니다
 * @param {Array} orders - 필터링할 주문 목록
 * @returns {Array} 필터링된 주문 목록
 */
function filterBySearch(orders) {
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // 검색어가 없는 경우 필터링하지 않음
    if (!searchValue) {
        return orders;
    }

    return orders.filter(order => {
        // 주문번호로 검색
        const orderNumber = (order.orderUuid || '').toLowerCase();
        if (orderNumber.includes(searchValue)) {
            return true;
        }

        // 상품명으로 검색
        if (order.orderItems && Array.isArray(order.orderItems)) {
            return order.orderItems.some(item => {
                const itemName = (item.itemName || '').toLowerCase();
                return itemName.includes(searchValue);
            });
        }

        return false;
    });
}

// ==========================================================================
// 검색 기능 초기화 및 관리
// ==========================================================================

/**
 * 검색 기능을 초기화합니다
 */
function initializeSearch() {
    try {
        if (searchInput) {
            // 실시간 검색 (디바운싱 적용으로 성능 최적화)
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    currentPage = 1; // 검색 시 첫 페이지로 이동
                    filterAndDisplayOrders();
                }, 300); // 300ms 대기 후 검색 실행
            });

            // 엔터키로 즉시 검색
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    currentPage = 1;
                    filterAndDisplayOrders();
                }
            });

            // 검색 input에 포커스시 전체 텍스트 선택
            searchInput.addEventListener('focus', () => {
                searchInput.select();
            });
        }

        console.log('✅ 검색 기능이 초기화되었습니다.');

    } catch (error) {
        console.error('검색 기능 초기화 중 오류:', error);
    }
}

/**
 * 검색 버튼 클릭 처리 함수 (HTML에서 호출됨)
 */
function searchOrders() {
    try {
        currentPage = 1;
        filterAndDisplayOrders();
        
        // 검색 실행 알림
        const searchValue = searchInput ? searchInput.value.trim() : '';
        if (searchValue) {
            showNotification(`"${searchValue}" 검색 결과를 표시합니다.`, 'info');
        }

    } catch (error) {
        handleError(error, '검색 실행');
    }
}

// ==========================================================================
// 페이지네이션 기능
// ==========================================================================

/**
 * 페이지네이션 기능을 초기화합니다
 */
function initializePagination() {
    try {
        // 화면 크기에 따라 페이지당 아이템 수 설정
        adjustItemsPerPageForScreenSize();

        console.log('✅ 페이지네이션이 초기화되었습니다.');

    } catch (error) {
        console.error('페이지네이션 초기화 중 오류:', error);
    }
}

/**
 * 화면 크기에 따라 페이지당 아이템 수를 조정합니다
 */
function adjustItemsPerPageForScreenSize() {
    const width = window.innerWidth;
    
    if (width <= 767) {
        itemsPerPage = 5;  // 모바일: 5개
    } else if (width <= 1199) {
        itemsPerPage = 8;  // 태블릿: 8개
    } else {
        itemsPerPage = 10; // 데스크탑: 10개
    }
}

/**
 * 페이지네이션 정보를 계산합니다
 */
function calculatePagination() {
    totalPages = Math.ceil(filteredOrderList.length / itemsPerPage);
    
    // 현재 페이지가 총 페이지 수를 초과하면 조정
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    } else if (currentPage < 1) {
        currentPage = 1;
    }
}

/**
 * 페이지네이션 UI를 업데이트합니다
 */
function updatePagination() {
    if (!pageNumbers) return;

    // 페이지 번호 컨테이너 초기화
    pageNumbers.innerHTML = '';

    // 페이지가 1개 이하면 페이지네이션 숨기기
    const paginationSection = document.querySelector('.pagination-section');
    if (totalPages <= 1) {
        if (paginationSection) {
            paginationSection.style.display = 'none';
        }
        return;
    } else {
        if (paginationSection) {
            paginationSection.style.display = 'flex';
        }
    }

    // 표시할 페이지 번호 범위 계산 (최대 5개 표시)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 시작 페이지 재조정 (끝까지 5개를 보여주기 위함)
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 페이지 번호 버튼들 생성
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        pageButton.setAttribute('aria-label', `${i}페이지로 이동`);
        
        pageNumbers.appendChild(pageButton);
    }

    // 이전/다음 버튼 상태 업데이트
    updateNavigationButtons();
}

/**
 * 이전/다음 버튼 상태를 업데이트합니다
 */
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
        prevBtn.setAttribute('aria-label', currentPage <= 1 ? '이전 페이지 없음' : '이전 페이지로 이동');
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.setAttribute('aria-label', currentPage >= totalPages ? '다음 페이지 없음' : '다음 페이지로 이동');
    }
}

/**
 * 특정 페이지로 이동합니다
 * @param {number} page - 이동할 페이지 번호
 */
function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        filterAndDisplayOrders();
        
        // 페이지 이동 후 스크롤 조정
        scrollToOrderSection();
        
        // 페이지 이동 알림
        showNotification(`${page}페이지로 이동했습니다.`, 'info');
    }
}

/**
 * 이전 페이지로 이동합니다 (HTML에서 호출됨)
 */
function previousPage() {
    goToPage(currentPage - 1);
}

/**
 * 다음 페이지로 이동합니다 (HTML에서 호출됨)
 */
function nextPage() {
    goToPage(currentPage + 1);
}

/**
 * 주문 목록 섹션으로 부드럽게 스크롤합니다
 */
function scrollToOrderSection() {
    const orderHistorySection = document.querySelector('.order-history-section');
    if (orderHistorySection) {
        orderHistorySection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ==========================================================================
// 주문 목록 화면 표시
// ==========================================================================

/**
 * 주문 목록을 화면에 표시합니다
 */
function displayOrders() {
    try {
        // 데스크탑 테이블 업데이트
        if (orderTableBody) {
            updateOrderTable();
        }

        // 모바일 카드 업데이트
        if (orderCardsContainer) {
            updateOrderCards();
        }

        // 접근성 업데이트
        updateAccessibilityInfo();

    } catch (error) {
        handleError(error, '주문 목록 표시');
    }
}

/**
 * 데스크탑용 주문 테이블을 업데이트합니다
 */
function updateOrderTable() {
    if (!orderTableBody) return;

    // 데이터가 없는 경우 안내 메시지 표시
    if (displayedOrderList.length === 0) {
        orderTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 60px 20px; color: var(--medium-gray);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                        <span style="font-size: 48px;">📦</span>
                        <span style="font-size: 18px; font-weight: 500;">조건에 맞는 주문이 없습니다.</span>
                        <span style="font-size: 14px;">다른 조건으로 검색해보세요.</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // 주문 목록 테이블 행 생성
    orderTableBody.innerHTML = displayedOrderList.map((order, index) => {
        const firstItem = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0] : null;
        const itemCount = order.orderItems ? order.orderItems.length : 0;
        const orderStatus = getOrderStatusInfo(order.orderStatus);
        
        return `
            <tr class="order-row" data-order-id="${order.orderUuid}" data-index="${index}">
                <!-- 주문번호 컬럼 -->
                <td class="order-number">
                    <span class="order-number-text" title="${order.orderUuid}">${order.orderUuid}</span>
                </td>
                
                <!-- 주문일자 컬럼 -->
                <td class="order-date">
                    <div class="date-info">
                        <span class="date-main">${formatDate(order.createdAt)}</span>
                        <small class="date-time">${formatTime(order.createdAt)}</small>
                    </div>
                </td>
                
                <!-- 주문상품 컬럼 -->
                <td class="order-items">
                    <div class="items-info">
                        <div class="first-item">
                            ${firstItem ? `
                                <img src="/api/images/${firstItem.itemImgId}" 
                                     alt="${firstItem.itemName}" 
                                     class="item-image"
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 50 50\\'><rect fill=\\'%23e3f2fd\\' width=\\'50\\' height=\\'50\\'/><text x=\\'25\\' y=\\'30\\' font-size=\\'20\\' text-anchor=\\'middle\\'>📦</text></svg>'"
                                     loading="lazy">
                                <div class="item-details">
                                    <span class="item-name" title="${firstItem.itemName}">${firstItem.itemName}</span>
                                    ${itemCount > 1 ? `<span class="item-count">외 ${itemCount - 1}개</span>` : ''}
                                </div>
                            ` : '<span class="item-name">상품 정보 없음</span>'}
                        </div>
                    </div>
                </td>
                
                <!-- 결제금액 컬럼 -->
                <td class="order-amount">
                    <span class="amount">${formatCurrency(order.payAmount)}</span>
                </td>
                
                <!-- 주문상태 컬럼 -->
                <td class="order-status">
                    <span class="status-badge ${orderStatus.className}" 
                          title="${orderStatus.description}">${orderStatus.text}</span>
                </td>
                
                <!-- 주문관리 컬럼 -->
                <td class="order-actions">
                    <div class="action-buttons-wrapper">
                        ${generateActionButtons(order)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // 테이블 행에 애니메이션 효과 추가
    addTableRowAnimations();
}

/**
 * 모바일용 주문 카드를 업데이트합니다
 */
function updateOrderCards() {
    if (!orderCardsContainer) return;

    // 데이터가 없는 경우 안내 메시지 표시
    if (displayedOrderList.length === 0) {
        orderCardsContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--medium-gray);">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <span style="font-size: 64px;">📦</span>
                    <h3 style="font-size: 20px; font-weight: 600; margin: 0;">조건에 맞는 주문이 없습니다</h3>
                    <p style="font-size: 16px; margin: 0;">다른 조건으로 검색해보세요.</p>
                </div>
            </div>
        `;
        return;
    }

    // 주문 카드 생성
    orderCardsContainer.innerHTML = displayedOrderList.map((order, index) => {
        const firstItem = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0] : null;
        const itemCount = order.orderItems ? order.orderItems.length : 0;
        const orderStatus = getOrderStatusInfo(order.orderStatus);
        
        return `
            <div class="order-card" data-order-id="${order.orderUuid}" data-index="${index}">
                <!-- 카드 헤더 -->
                <div class="card-header">
                    <div class="order-info">
                        <span class="order-number">${order.orderUuid}</span>
                        <span class="order-date">${formatDateTime(order.createdAt)}</span>
                    </div>
                    <span class="status-badge ${orderStatus.className}" 
                          title="${orderStatus.description}">${orderStatus.text}</span>
                </div>
                
                <!-- 카드 본문 -->
                <div class="card-body">
                    <div class="items-section">
                        ${firstItem ? `
                            <img src="/api/images/${firstItem.itemImgId}" 
                                 alt="${firstItem.itemName}" 
                                 class="item-image"
                                 onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 60 60\\'><rect fill=\\'%23e3f2fd\\' width=\\'60\\' height=\\'60\\'/><text x=\\'30\\' y=\\'35\\' font-size=\\'24\\' text-anchor=\\'middle\\'>📦</text></svg>'"
                                 loading="lazy">
                            <div class="item-info">
                                <span class="item-name" title="${firstItem.itemName}">${firstItem.itemName}</span>
                                ${itemCount > 1 ? `<span class="item-count">외 ${itemCount - 1}개</span>` : ''}
                            </div>
                        ` : '<span class="item-name">상품 정보 없음</span>'}
                    </div>
                    <div class="amount-section">
                        <span class="amount">${formatCurrency(order.payAmount)}</span>
                    </div>
                </div>
                
                <!-- 카드 푸터 -->
                <div class="card-footer">
                    <a href="/orders/${order.orderId}/detail" class="btn-detail" 
                       aria-label="${order.orderUuid} 주문 상세보기">상세보기</a>
                    <div class="quick-actions">
                        ${generateQuickActionButtons(order)}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 카드에 애니메이션 효과 추가
    addCardAnimations();
}

// ==========================================================================
// 주문 관리 기능들
// ==========================================================================

/**
 * 주문 취소 기능 (HTML에서 호출됨)
 * @param {string} orderUuid - 주문 UUID
 */
function cancelOrder(orderUuid) {
    try {
        // 사용자 확인
        if (!confirm(messages.confirmCancel)) {
            return;
        }

        // 취소 진행 알림
        showNotification('주문을 취소하고 있습니다...', 'info');

        // 실제 구현에서는 서버 API 호출
        // 여기서는 모의 처리로 구현
        simulateOrderCancellation(orderUuid);

    } catch (error) {
        handleError(error, '주문 취소');
    }
}

/**
 * 주문 취소 모의 처리
 * @param {string} orderUuid - 주문 UUID
 */
function simulateOrderCancellation(orderUuid) {
    setTimeout(() => {
        try {
            // 로컬 데이터에서 주문 상태 업데이트
            const order = originalOrderList.find(o => o.orderUuid === orderUuid);
            if (order) {
                order.orderStatus = 'CANCELLED';
                
                // 필터링된 목록에서도 업데이트
                const filteredOrder = filteredOrderList.find(o => o.orderUuid === orderUuid);
                if (filteredOrder) {
                    filteredOrder.orderStatus = 'CANCELLED';
                }
            }

            // 화면 새로고침
            filterAndDisplayOrders();
            
            // 성공 알림
            showNotification(messages.cancelSuccess, 'success');
            console.log(`주문 취소 완료: ${orderUuid}`);
            
        } catch (error) {
            handleError(error, '주문 취소 처리');
        }
    }, 2000);
}

/**
 * 재주문 기능 (HTML에서 호출됨)
 * @param {string} orderUuid - 주문 UUID
 */
function reorderItems(orderUuid) {
    try {
        const order = originalOrderList.find(o => o.orderUuid === orderUuid);
        
        if (!order || !order.orderItems) {
            showNotification('주문 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        // 재주문 진행 알림
        showNotification('장바구니에 상품을 담고 있습니다...', 'info');

        // 실제 구현에서는 서버 API 호출
        // 여기서는 모의 처리로 구현
        simulateReorder(orderUuid);

    } catch (error) {
        handleError(error, '재주문');
    }
}

/**
 * 재주문 모의 처리
 * @param {string} orderUuid - 주문 UUID
 */
function simulateReorder(orderUuid) {
    setTimeout(() => {
        try {
            // 성공 알림
            showNotification(messages.reorderSuccess, 'success');
            
            // 1초 후 장바구니 페이지로 이동
            setTimeout(() => {
                window.location.href = '/cart';
            }, 1000);
            
            console.log(`재주문 완료: ${orderUuid}`);
            
        } catch (error) {
            handleError(error, '재주문 처리');
        }
    }, 1500);
}

/**
 * 상품후기 작성 (HTML에서 호출됨)
 * @param {string} orderUuid - 주문 UUID
 */
function writeReview(orderUuid) {
    try {
        // 후기 작성 페이지 이동 알림
        showNotification('상품후기 작성 페이지로 이동합니다.', 'info');
        
        setTimeout(() => {
            window.location.href = reviewWriteUrl.replace('{id}', orderUuid);
        }, 800);
        
        console.log(`상품후기 작성: ${orderUuid}`);

    } catch (error) {
        handleError(error, '상품후기 작성');
    }
}

// ==========================================================================
// 유틸리티 함수들
// ==========================================================================

/**
 * 주문 상태 값을 정규화하여 반환합니다
 * @param {Object|string} orderStatus - 주문 상태 객체 또는 문자열
 * @returns {string} 정규화된 상태 값
 */
function getOrderStatusValue(order) {
    if (order.orderStatus && typeof order.orderStatus === 'object' && order.orderStatus.name) {
        return order.orderStatus.name;
    }
    return order.orderStatus || '';
}

/**
 * 주문 상태 정보를 반환합니다
 * @param {Object|string} orderStatus - 주문 상태 객체 또는 문자열
 * @returns {Object} 상태 정보 객체
 */
function getOrderStatusInfo(orderStatus) {
    const statusName = typeof orderStatus === 'object' && orderStatus.name ? orderStatus.name : orderStatus;
    
    switch (statusName) {
        case 'PAID':
            return { 
                text: '결제완료', 
                className: 'status-processing',
                description: '결제가 완료되어 상품 준비 중입니다'
            };
        case 'PREPARING':
            return { 
                text: '상품준비중', 
                className: 'status-processing',
                description: '상품을 준비하고 있습니다'
            };
        case 'SHIPPED':
            return { 
                text: '배송중', 
                className: 'status-shipping',
                description: '상품이 배송 중입니다'
            };
        case 'DELIVERED':
            return { 
                text: '배송완료', 
                className: 'status-delivered',
                description: '상품이 배송 완료되었습니다'
            };
        case 'CANCELLED':
            return { 
                text: '주문취소', 
                className: 'status-cancelled',
                description: '주문이 취소되었습니다'
            };
        default:
            return { 
                text: '상태미확인', 
                className: 'status-processing',
                description: '주문 상태를 확인할 수 없습니다'
            };
    }
}

/**
 * 데스크탑용 액션 버튼을 생성합니다
 * @param {Object} order - 주문 객체
 * @returns {string} 버튼 HTML
 */
function generateActionButtons(order) {
    const statusName = getOrderStatusValue(order);
    let buttons = [];

    // 상세보기 버튼 (항상 표시)
    buttons.push(`
        <a href="/orders/${order.orderId}/detail" class="btn-action btn-detail" 
           aria-label="${order.orderUuid} 주문 상세보기">상세보기</a>
    `);

    // 배송완료 상태일 때 표시되는 버튼들
    if (statusName === 'DELIVERED') {
        buttons.push(`
            <button class="btn-action btn-reorder" 
                    onclick="reorderItems('${order.orderUuid}')"
                    aria-label="${order.orderUuid} 주문 재주문">재주문</button>
        `);
    }

    // 결제완료 또는 상품준비중 상태일 때 취소 버튼 표시
    if (statusName === 'PAID' || statusName === 'PREPARING') {
        buttons.push(`
            <button class="btn-action btn-cancel" 
                    onclick="cancelOrder('${order.orderUuid}')"
                    aria-label="${order.orderUuid} 주문 취소">주문취소</button>
        `);
    }

    return buttons.join('');
}

/**
 * 모바일용 빠른 액션 버튼을 생성합니다
 * @param {Object} order - 주문 객체
 * @returns {string} 버튼 HTML
 */
function generateQuickActionButtons(order) {
    const statusName = getOrderStatusValue(order);
    let buttons = [];

    // 배송완료 상태일 때 표시되는 버튼들
    if (statusName === 'DELIVERED') {
        buttons.push(`
            <button class="btn-quick btn-review" 
                    onclick="writeReview('${order.orderUuid}')"
                    aria-label="후기 작성">후기</button>
        `);
        buttons.push(`
            <button class="btn-quick btn-reorder" 
                    onclick="reorderItems('${order.orderUuid}')"
                    aria-label="재주문">재주문</button>
        `);
    }

    // 결제완료 또는 상품준비중 상태일 때 취소 버튼 표시
    if (statusName === 'PAID' || statusName === 'PREPARING') {
        buttons.push(`
            <button class="btn-quick btn-cancel" 
                    onclick="cancelOrder('${order.orderUuid}')"
                    aria-label="주문 취소">취소</button>
        `);
    }

    return buttons.join('');
}

/**
 * 날짜를 'YYYY.MM.DD' 형식으로 포맷팅합니다
 * @param {Date|string} dateString - 날짜 객체 또는 문자열
 * @returns {string} 포맷팅된 날짜
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

/**
 * 시간을 'HH:MM' 형식으로 포맷팅합니다
 * @param {Date|string} dateString - 날짜 객체 또는 문자열
 * @returns {string} 포맷팅된 시간
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * 날짜와 시간을 'YYYY.MM.DD HH:MM' 형식으로 포맷팅합니다
 * @param {Date|string} dateString - 날짜 객체 또는 문자열
 * @returns {string} 포맷팅된 날짜시간
 */
function formatDateTime(dateString) {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * 숫자를 통화 형식으로 포맷팅합니다
 * @param {number} amount - 금액
 * @returns {string} 포맷팅된 금액
 */
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseInt(amount) || 0;
    }
    return `${amount.toLocaleString('ko-KR')}원`;
}

// ==========================================================================
// 반응형 기능
// ==========================================================================

/**
 * 반응형 기능을 초기화합니다
 */
function initializeResponsive() {
    try {
        // 윈도우 리사이즈 이벤트 리스너 (디바운싱 적용)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                handleResponsiveChanges();
            }, 250);
        });

        // 초기 화면 크기 조정
        handleResponsiveChanges();

        console.log('✅ 반응형 기능이 초기화되었습니다.');

    } catch (error) {
        console.error('반응형 기능 초기화 중 오류:', error);
    }
}

/**
 * 화면 크기 변경에 따른 처리를 수행합니다
 */
function handleResponsiveChanges() {
    const previousItemsPerPage = itemsPerPage;
    
    // 화면 크기에 따라 페이지당 아이템 수 조정
    adjustItemsPerPageForScreenSize();
    
    // 페이지당 아이템 수가 변경된 경우 페이지 재계산
    if (previousItemsPerPage !== itemsPerPage && isInitialized) {
        currentPage = 1; // 첫 페이지로 리셋
        filterAndDisplayOrders();
    }
}

// ==========================================================================
// 키보드 단축키
// ==========================================================================

/**
 * 키보드 단축키를 초기화합니다
 */
function initializeKeyboardShortcuts() {
    try {
        document.addEventListener('keydown', handleKeyboardShortcuts);
        console.log('✅ 키보드 단축키가 초기화되었습니다.');

    } catch (error) {
        console.error('키보드 단축키 초기화 중 오류:', error);
    }
}

/**
 * 키보드 단축키 이벤트를 처리합니다
 * @param {KeyboardEvent} e - 키보드 이벤트
 */
function handleKeyboardShortcuts(e) {
    // 입력 필드에서는 단축키 비활성화
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }

    switch(e.key) {
        case 'Escape':
            // ESC: 검색 초기화
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                filterAndDisplayOrders();
                showNotification('검색이 초기화되었습니다.', 'info');
            }
            break;
            
        case 'f':
        case 'F':
            // Ctrl/Cmd + F: 검색 포커스
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                    showNotification('검색창에 포커스되었습니다.', 'info');
                }
            }
            break;
            
        case 'ArrowLeft':
            // Shift + 좌측 화살표: 이전 페이지
            if (e.shiftKey) {
                e.preventDefault();
                previousPage();
            }
            break;
            
        case 'ArrowRight':
            // Shift + 우측 화살표: 다음 페이지
            if (e.shiftKey) {
                e.preventDefault();
                nextPage();
            }
            break;
            
        case '?':
            // ?: 도움말 표시
            e.preventDefault();
            showKeyboardShortcuts();
            break;
    }
}

/**
 * 키보드 단축키 도움말을 표시합니다
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        'ESC: 검색 초기화',
        'Ctrl/Cmd + F: 검색 포커스',
        'Shift + ←/→: 이전/다음 페이지',
        '?: 이 도움말 표시'
    ];

    const helpMessage = '⌨️ 키보드 단축키:<br>' + shortcuts.join('<br>');
    showNotification(helpMessage, 'info');
}

// ==========================================================================
// 접근성 기능
// ==========================================================================

/**
 * 접근성 기능을 초기화합니다
 */
function initializeAccessibility() {
    try {
        // 페이지 제목 업데이트
        updatePageTitle();
        
        // ARIA 라벨 설정
        setAriaLabels();
        
        console.log('✅ 접근성 기능이 초기화되었습니다.');

    } catch (error) {
        console.error('접근성 기능 초기화 중 오류:', error);
    }
}

/**
 * 현재 상태에 맞게 페이지 제목을 업데이트합니다
 */
function updatePageTitle() {
    const baseTitle = 'GreenCycle - 구매이력';
    const orderCount = filteredOrderList.length;
    
    if (orderCount > 0) {
        document.title = `${baseTitle} (${orderCount}건)`;
    } else {
        document.title = baseTitle;
    }
}

/**
 * ARIA 라벨을 설정합니다
 */
function setAriaLabels() {
    // 검색 입력 필드
    if (searchInput) {
        searchInput.setAttribute('aria-label', '주문번호 또는 상품명으로 검색');
        searchInput.setAttribute('role', 'searchbox');
    }

    // 필터 선택 상자들
    if (statusFilter) {
        statusFilter.setAttribute('aria-label', '주문 상태별 필터링');
    }
    
    if (periodFilter) {
        periodFilter.setAttribute('aria-label', '기간별 필터링');
    }
}

/**
 * 접근성 정보를 업데이트합니다
 */
function updateAccessibilityInfo() {
    // 페이지 제목 업데이트
    updatePageTitle();
    
    // 스크린 리더를 위한 live region 업데이트
    announceToScreenReader(`${filteredOrderList.length}건의 주문이 표시되고 있습니다.`);
}

/**
 * 스크린 리더에 메시지를 전달합니다
 * @param {string} message - 전달할 메시지
 */
function announceToScreenReader(message) {
    // 기존 live region 제거
    const existingRegion = document.getElementById('sr-live-region');
    if (existingRegion) {
        existingRegion.remove();
    }
    
    // 새로운 live region 생성
    const liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    `;
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // 3초 후 제거
    setTimeout(() => {
        if (liveRegion.parentNode) {
            liveRegion.remove();
        }
    }, 3000);
}

// ==========================================================================
// 애니메이션 및 시각적 효과
// ==========================================================================

/**
 * 테이블 행에 애니메이션 효과를 추가합니다
 */
function addTableRowAnimations() {
    const rows = document.querySelectorAll('.order-row');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

/**
 * 카드에 애니메이션 효과를 추가합니다
 */
function addCardAnimations() {
    const cards = document.querySelectorAll('.order-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

/**
 * 로딩 상태를 설정합니다
 * @param {boolean} loading - 로딩 상태
 */
function setLoadingState(loading) {
    isLoading = loading;
    
    const loadingElements = document.querySelectorAll('.filter-section, .order-table-container, .order-cards-container');
    
    loadingElements.forEach(element => {
        if (loading) {
            element.style.opacity = '0.6';
            element.style.pointerEvents = 'none';
        } else {
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }
    });
}

// ==========================================================================
// 알림 및 에러 처리
// ==========================================================================

/**
 * 사용자에게 알림을 표시합니다
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 (success, error, warning, info)
 * @param {number} duration - 표시 시간 (밀리초, 기본값: 4000)
 */
function showNotification(message, type = 'success', duration = 4000) {
    try {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${getNotificationIcon(type)}</span>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()" aria-label="알림 닫기">×</button>
            </div>
        `;

        // 알림 스타일 적용
        applyNotificationStyles(notification, type);

        // DOM에 추가
        document.body.appendChild(notification);

        // 표시 애니메이션
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 자동 숨김 (에러가 아닌 경우)
        if (type !== 'error') {
            setTimeout(() => {
                hideNotification(notification);
            }, duration);
        }

    } catch (error) {
        console.error('알림 표시 중 오류:', error);
    }
}

/**
 * 알림에 스타일을 적용합니다
 * @param {HTMLElement} notification - 알림 요소
 * @param {string} type - 알림 타입
 */
function applyNotificationStyles(notification, type) {
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 0;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 350px;
        min-width: 280px;
        overflow: hidden;
    `;

    // 내부 요소 스타일링
    const content = notification.querySelector('.notification-content');
    const icon = notification.querySelector('.notification-icon');
    const text = notification.querySelector('.notification-text');
    const closeBtn = notification.querySelector('.notification-close');

    if (content) {
        content.style.cssText = `
            display: flex;
            align-items: center;
            padding: 15px 20px;
            gap: 10px;
        `;
    }

    if (icon) {
        icon.style.cssText = `
            font-size: 18px;
            flex-shrink: 0;
        `;
    }

    if (text) {
        text.style.cssText = `
            flex: 1;
            font-weight: 500;
            font-size: 14px;
            line-height: 1.4;
        `;
    }

    if (closeBtn) {
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: background 0.3s ease;
        `;
    }
}

/**
 * 알림을 숨깁니다
 * @param {HTMLElement} notification - 알림 요소
 */
function hideNotification(notification) {
    if (notification && notification.parentNode) {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }
}

/**
 * 알림 타입에 따른 아이콘을 반환합니다
 * @param {string} type - 알림 타입
 * @returns {string} 아이콘
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.success;
}

/**
 * 알림 타입에 따른 배경색을 반환합니다
 * @param {string} type - 알림 타입
 * @returns {string} CSS 그라데이션
 */
function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #2d5a3d, #6fa776)',
        error: 'linear-gradient(135deg, #dc3545, #e85967)',
        warning: 'linear-gradient(135deg, #ffc107, #ffcd39)',
        info: 'linear-gradient(135deg, #17a2b8, #20c997)'
    };
    return colors[type] || colors.success;
}

/**
 * 에러를 처리하고 사용자에게 알립니다
 * @param {Error} error - 발생한 에러
 * @param {string} context - 에러 발생 컨텍스트
 */
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    
    const userMessage = context ? 
        `${context} 중 오류가 발생했습니다: ${error.message}` : 
        `오류가 발생했습니다: ${error.message}`;
        
    showNotification(userMessage, 'error');
}

// ==========================================================================
// 전역 함수 노출 및 이벤트 핸들러 설정
// ==========================================================================

/**
 * HTML에서 호출되는 함수들을 전역 객체에 노출합니다
 */
window.searchOrders = searchOrders;
window.cancelOrder = cancelOrder;
window.reorderItems = reorderItems;
window.writeReview = writeReview;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.showNotification = showNotification;

/**
 * 전역 에러 핸들러 설정
 */
window.addEventListener('error', (e) => {
    handleError(e.error, 'Global error');
});

/**
 * Promise 거부 핸들러 설정
 */
window.addEventListener('unhandledrejection', (e) => {
    handleError(new Error(e.reason), 'Unhandled promise rejection');
});

// ==========================================================================
// 개발자 콘솔 로그
// ==========================================================================
console.log('🛒 GreenCycle 구매이력 페이지 JavaScript가 로드되었습니다.');
console.log('📚 사용 가능한 함수들: searchOrders, cancelOrder, reorderItems, writeReview, goToPage, previousPage, nextPage');
console.log('⌨️ 키보드 단축키: ESC(검색 초기화), Ctrl+F(검색 포커스), Shift+화살표(페이지 이동), ?(도움말)');

/**
 * ============================================================================
 * 파일 끝
 * GreenCycle 구매이력 페이지 JavaScript 완료
 * ============================================================================
 */-review" 
                    onclick="writeReview('${order.orderUuid}')"
                    aria-label="${order.orderUuid} 주문 후기작성">후기작성</button>
        `);
        buttons.push(`
            <button class="btn-action btn