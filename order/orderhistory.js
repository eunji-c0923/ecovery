/**
 * GreenCycle 구매이력 페이지 JavaScript
 * 
 * 주요 기능:
 * 1. 주문 목록 조회 및 표시
 * 2. 필터링 (상태, 기간)
 * 3. 검색 기능
 * 4. 페이지네이션
 * 5. 주문 관리 (취소, 재주문, 후기작성)
 * 6. 반응형 처리
 * 7. 키보드 단축키
 * 8. 알림 시스템
 */

// ==========================================================================
// 전역 변수 선언
// ==========================================================================
let originalOrderList = [];      // 원본 주문 목록 (서버에서 받은 데이터)
let filteredOrderList = [];      // 필터링된 주문 목록
let displayedOrderList = [];     // 현재 페이지에 표시될 주문 목록
let currentPage = 1;             // 현재 페이지 번호
let itemsPerPage = 10;           // 페이지당 표시할 주문 수 (데스크탑)
let totalPages = 1;              // 전체 페이지 수
let isInitialized = false;       // 초기화 상태 플래그

// DOM 요소들 캐싱
const statusFilter = document.getElementById('statusFilter');
const periodFilter = document.getElementById('periodFilter');
const searchInput = document.getElementById('searchInput');
const orderTableBody = document.getElementById('orderTableBody');
const orderCardsContainer = document.querySelector('.order-cards-container');
const pageNumbers = document.getElementById('pageNumbers');

// ==========================================================================
// 페이지 초기화 - DOMContentLoaded 이벤트 리스너
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🛒 GreenCycle 구매이력 페이지 초기화를 시작합니다...');
        
        // 디버깅: 전역 변수 확인
        console.log('🔍 전역 변수 확인:');
        console.log('- typeof orderSummaries:', typeof orderSummaries);
        console.log('- window.orderSummaries:', typeof window.orderSummaries);
        if (typeof orderSummaries !== 'undefined') {
            console.log('- orderSummaries 내용:', orderSummaries);
        }

        // 전역 변수로 전달받은 주문 데이터 초기화
        initializeOrderData();

        // 핵심 기능 초기화
        initializeFilters();           // 필터링 기능 초기화
        initializeSearch();            // 검색 기능 초기화
        initializePagination();        // 페이지네이션 초기화
        initializeResponsive();        // 반응형 기능 초기화
        initializeKeyboardShortcuts(); // 키보드 단축키 초기화

        // 초기 데이터 표시
        filterAndDisplayOrders();

        isInitialized = true;
        console.log('✅ 구매이력 페이지가 성공적으로 초기화되었습니다.');

        // 환영 메시지 표시 (1초 후)
        setTimeout(() => {
            if (originalOrderList.length > 0) {
                showNotification('구매이력을 불러왔습니다! 📋', 'success');
            } else {
                showNotification('아직 주문 내역이 없습니다. 쇼핑을 시작해보세요! 🛍️', 'info');
            }
        }, 1000);

    } catch (error) {
        handleError(error, 'Order history page initialization');
    }
});

// ==========================================================================
// 주문 데이터 초기화
// ==========================================================================
/**
 * 전역 변수로 전달받은 주문 데이터를 초기화합니다
 * Thymeleaf에서 전달받은 orderSummaries 변수를 사용
 */
function initializeOrderData() {
    try {
        // 전역 변수 존재 확인 및 초기화
        if (typeof window.orderSummaries !== 'undefined' && Array.isArray(window.orderSummaries)) {
            originalOrderList = [...window.orderSummaries];
            filteredOrderList = [...window.orderSummaries];
            console.log(`📊 주문 데이터 로드 완료: ${originalOrderList.length}건`);
        } else if (typeof orderSummaries !== 'undefined' && Array.isArray(orderSummaries)) {
            originalOrderList = [...orderSummaries];
            filteredOrderList = [...orderSummaries];
            console.log(`📊 주문 데이터 로드 완료: ${originalOrderList.length}건`);
        } else {
            // 데이터가 없을 경우 빈 배열로 초기화
            originalOrderList = [];
            filteredOrderList = [];
            console.warn('⚠️ 주문 데이터가 없습니다. 빈 배열로 초기화합니다.');
        }
    } catch (error) {
        console.error('❌ 주문 데이터 초기화 중 오류:', error);
        originalOrderList = [];
        filteredOrderList = [];
        
        // 사용자에게 알림
        showNotification('주문 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// ==========================================================================
// 필터링 기능
// ==========================================================================
/**
 * 주문 상태 및 기간 필터링 기능을 초기화합니다
 */
function initializeFilters() {
    // 상태 필터 이벤트 리스너
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilterChange);
    }

    // 기간 필터 이벤트 리스너
    if (periodFilter) {
        periodFilter.addEventListener('change', handleFilterChange);
    }

    console.log('✅ 필터링 기능이 초기화되었습니다.');
}

/**
 * 필터 변경 이벤트 처리
 */
function handleFilterChange() {
    currentPage = 1; // 필터 변경 시 첫 페이지로 이동
    filterAndDisplayOrders();
    
    // 필터 적용 알림
    const statusText = statusFilter.options[statusFilter.selectedIndex].text;
    const periodText = periodFilter.options[periodFilter.selectedIndex].text;
    showNotification(`필터 적용: ${statusText}, ${periodText}`, 'info');
}

/**
 * 주문 목록 필터링 및 표시 메인 함수
 */
function filterAndDisplayOrders() {
    try {
        // 1단계: 상태 필터링
        let filtered = filterByStatus(originalOrderList);
        
        // 2단계: 기간 필터링
        filtered = filterByPeriod(filtered);
        
        // 3단계: 검색 필터링
        filtered = filterBySearch(filtered);

        // 필터링된 결과 저장
        filteredOrderList = filtered;

        // 페이지네이션 계산
        calculatePagination();

        // 현재 페이지에 해당하는 데이터 추출
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        displayedOrderList = filteredOrderList.slice(startIndex, endIndex);

        // 화면에 표시
        displayOrders();
        updatePagination();

        console.log(`🔍 필터링 완료: ${filteredOrderList.length}건 (전체 ${originalOrderList.length}건 중)`);

    } catch (error) {
        handleError(error, 'Filtering and displaying orders');
    }
}

/**
 * 주문 상태별 필터링
 * @param {Array} orders - 필터링할 주문 목록
 * @returns {Array} 필터링된 주문 목록
 */
function filterByStatus(orders) {
    const statusValue = statusFilter ? statusFilter.value : '';
    
    if (!statusValue) {
        return orders; // 전체 선택
    }

    return orders.filter(order => {
        const orderStatus = order.orderStatus && order.orderStatus.name ? order.orderStatus.name : order.orderStatus;
        return orderStatus === statusValue;
    });
}

/**
 * 기간별 필터링
 * @param {Array} orders - 필터링할 주문 목록
 * @returns {Array} 필터링된 주문 목록
 */
function filterByPeriod(orders) {
    const periodValue = periodFilter ? periodFilter.value : '';
    
    if (!periodValue) {
        return orders; // 전체 기간
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
 * 검색어로 필터링
 * @param {Array} orders - 필터링할 주문 목록
 * @returns {Array} 필터링된 주문 목록
 */
function filterBySearch(orders) {
    const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    if (!searchValue) {
        return orders; // 검색어 없음
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
// 검색 기능
// ==========================================================================
/**
 * 검색 기능을 초기화합니다
 */
function initializeSearch() {
    if (searchInput) {
        // 실시간 검색 (디바운싱 적용)
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentPage = 1; // 검색 시 첫 페이지로 이동
                filterAndDisplayOrders();
            }, 300); // 300ms 딜레이
        });

        // 엔터키 검색
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                currentPage = 1;
                filterAndDisplayOrders();
            }
        });
    }

    console.log('✅ 검색 기능이 초기화되었습니다.');
}

/**
 * 검색 버튼 클릭 처리 (HTML에서 호출)
 */
function searchOrders() {
    currentPage = 1;
    filterAndDisplayOrders();
    
    const searchValue = searchInput ? searchInput.value.trim() : '';
    if (searchValue) {
        showNotification(`"${searchValue}" 검색 결과를 표시합니다.`, 'info');
    }
}

// ==========================================================================
// 페이지네이션 기능
// ==========================================================================
/**
 * 페이지네이션을 초기화합니다
 */
function initializePagination() {
    // 모바일에서는 페이지당 아이템 수 조정
    if (window.innerWidth <= 767) {
        itemsPerPage = 5; // 모바일: 5개
    } else {
        itemsPerPage = 10; // 데스크탑: 10개
    }

    console.log(`✅ 페이지네이션이 초기화되었습니다. (페이지당 ${itemsPerPage}개)`);
}

/**
 * 페이지네이션 정보 계산
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
 * 페이지네이션 UI 업데이트
 */
function updatePagination() {
    if (!pageNumbers) return;

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

    // 페이지 번호 생성 (최대 5개 표시)
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageButton);
    }

    // 이전/다음 버튼 상태 업데이트
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

/**
 * 특정 페이지로 이동
 * @param {number} page - 이동할 페이지 번호
 */
function goToPage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        filterAndDisplayOrders();
        
        // 페이지 상단으로 스크롤
        const orderHistorySection = document.querySelector('.order-history-section');
        if (orderHistorySection) {
            orderHistorySection.scrollIntoView({ behavior: 'smooth' });
        }
        
        showNotification(`${page}페이지로 이동했습니다.`, 'info');
    }
}

/**
 * 이전 페이지로 이동 (HTML에서 호출)
 */
function previousPage() {
    goToPage(currentPage - 1);
}

/**
 * 다음 페이지로 이동 (HTML에서 호출)
 */
function nextPage() {
    goToPage(currentPage + 1);
}

// ==========================================================================
// 주문 목록 표시
// ==========================================================================
/**
 * 주문 목록을 화면에 표시합니다
 */
function displayOrders() {
    // 데스크탑 테이블 업데이트
    if (orderTableBody) {
        updateOrderTable();
    }

    // 모바일 카드 업데이트
    if (orderCardsContainer) {
        updateOrderCards();
    }
}

/**
 * 주문 테이블 업데이트 (데스크탑)
 */
function updateOrderTable() {
    if (displayedOrderList.length === 0) {
        orderTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--medium-gray);">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                        <span style="font-size: 48px;">🔍</span>
                        <span style="font-size: 16px;">조건에 맞는 주문이 없습니다.</span>
                        <button onclick="resetFilters()" style="padding: 8px 16px; background: var(--primary-green); color: white; border: none; border-radius: 6px; cursor: pointer;">
                            필터 초기화
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    orderTableBody.innerHTML = displayedOrderList.map(order => {
        const firstItem = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0] : null;
        const itemCount = order.orderItems ? order.orderItems.length : 0;
        const orderStatus = getOrderStatusInfo(order.orderStatus);
        
        return `
            <tr class="order-row" data-order-id="${order.orderUuid}">
                <td class="order-number">
                    <a href="/orders/${order.orderId}/detail" class="order-link">
                        ${order.orderUuid}
                    </a>
                </td>
                <td class="order-date">
                    <div class="date-wrapper">
                        <span class="date">${formatDate(order.createdAt)}</span>
                        <small class="time">${formatTime(order.createdAt)}</small>
                    </div>
                </td>
                <td class="order-items">
                    <div class="items-info">
                        <div class="first-item">
                            ${firstItem ? `
                                <img src="/api/images/${firstItem.itemImgId}" 
                                     alt="${firstItem.itemName}" 
                                     class="item-image"
                                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 50 50\\'><rect fill=\\'%23e3f2fd\\' width=\\'50\\' height=\\'50\\'/><text x=\\'25\\' y=\\'30\\' font-size=\\'20\\' text-anchor=\\'middle\\'>📦</text></svg>'">
                                <div class="item-details">
                                    <span class="item-name">${firstItem.itemName}</span>
                                    ${itemCount > 1 ? `<span class="item-count">외 ${itemCount - 1}개</span>` : ''}
                                </div>
                            ` : '<span class="item-name">상품 정보 없음</span>'}
                        </div>
                    </div>
                </td>
                <td class="order-amount">
                    <span class="amount">${formatCurrency(order.payAmount)}</span>
                </td>
                <td class="order-status">
                    <span class="status-badge ${orderStatus.className}">${orderStatus.text}</span>
                </td>
                <td class="order-actions">
                    <div class="action-buttons-wrapper">
                        <a href="/orders/${order.orderId}/detail" class="btn-action btn-detail">상세보기</a>
                        ${generateActionButtons(order)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 주문 카드 업데이트 (모바일)
 */
function updateOrderCards() {
    if (displayedOrderList.length === 0) {
        orderCardsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--medium-gray); background: var(--white); border-radius: var(--border-radius); box-shadow: var(--card-shadow);">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <span style="font-size: 48px;">🔍</span>
                    <span style="font-size: 16px;">조건에 맞는 주문이 없습니다.</span>
                    <button onclick="resetFilters()" style="padding: 8px 16px; background: var(--primary-green); color: white; border: none; border-radius: 6px; cursor: pointer;">
                        필터 초기화
                    </button>
                </div>
            </div>
        `;
        return;
    }

    orderCardsContainer.innerHTML = displayedOrderList.map(order => {
        const firstItem = order.orderItems && order.orderItems.length > 0 ? order.orderItems[0] : null;
        const itemCount = order.orderItems ? order.orderItems.length : 0;
        const orderStatus = getOrderStatusInfo(order.orderStatus);
        
        return `
            <div class="order-card" data-order-id="${order.orderUuid}">
                <div class="card-header">
                    <div class="order-info">
                        <span class="order-number">${order.orderUuid}</span>
                        <span class="order-date">${formatDateTime(order.createdAt)}</span>
                    </div>
                    <span class="status-badge ${orderStatus.className}">${orderStatus.text}</span>
                </div>
                <div class="card-body">
                    <div class="items-section">
                        ${firstItem ? `
                            <img src="/api/images/${firstItem.itemImgId}" 
                                 alt="${firstItem.itemName}" 
                                 class="item-image"
                                 onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 60 60\\'><rect fill=\\'%23e3f2fd\\' width=\\'60\\' height=\\'60\\'/><text x=\\'30\\' y=\\'35\\' font-size=\\'24\\' text-anchor=\\'middle\\'>📦</text></svg>'">
                            <div class="item-info">
                                <span class="item-name">${firstItem.itemName}</span>
                                ${itemCount > 1 ? `<span class="item-count">외 ${itemCount - 1}개</span>` : ''}
                            </div>
                        ` : '<span class="item-name">상품 정보 없음</span>'}
                    </div>
                    <div class="amount-section">
                        <span class="amount">${formatCurrency(order.payAmount)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="/orders/${order.orderId}/detail" class="btn-detail">상세보기</a>
                    <div class="quick-actions">
                        ${generateQuickActionButtons(order)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================================================
// 주문 관리 기능들
// ==========================================================================

/**
 * 주문 취소 기능 (HTML에서 호출)
 * @param {string} orderUuid - 주문 UUID
 */
function cancelOrder(orderUuid) {
    if (!confirm(messages.confirmCancel)) {
        return;
    }

    showNotification('주문을 취소하고 있습니다...', 'info');

    // 실제 구현에서는 서버 API 호출
    // fetch(`${orderCancelUrl.replace('{id}', orderUuid)}`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         [csrfHeader]: csrfToken
    //     }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     if (data.success) {
    //         // 성공 처리
    //     } else {
    //         throw new Error(data.message);
    //     }
    // })
    // .catch(error => {
    //     showNotification(messages.cancelError, 'error');
    // });

    // 모의 처리 (실제로는 서버 응답 처리)
    setTimeout(() => {
        // 로컬 데이터에서 주문 상태 업데이트
        const order = originalOrderList.find(o => o.orderUuid === orderUuid);
        if (order) {
            order.orderStatus = { name: 'CANCELLED' };
        }

        // 화면 새로고침
        filterAndDisplayOrders();
        
        showNotification(messages.cancelSuccess, 'success');
        console.log(`✅ 주문 취소 완료: ${orderUuid}`);
    }, 2000);
}

/**
 * 재주문 기능 (HTML에서 호출)
 * @param {string} orderUuid - 주문 UUID
 */
function reorderItems(orderUuid) {
    const order = originalOrderList.find(o => o.orderUuid === orderUuid);
    
    if (!order || !order.orderItems) {
        showNotification('주문 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    showNotification('장바구니에 상품을 담고 있습니다...', 'info');

    // 실제 구현에서는 서버 API 호출
    // 각 상품을 장바구니에 추가하는 API 호출
    // order.orderItems.forEach(item => {
    //     fetch('/api/cart/add', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             [csrfHeader]: csrfToken
    //         },
    //         body: JSON.stringify({
    //             itemId: item.itemId,
    //             count: item.count
    //         })
    //     });
    // });

    // 모의 처리
    setTimeout(() => {
        showNotification(messages.reorderSuccess, 'success');
        
        // 1초 후 장바구니 페이지로 이동
        setTimeout(() => {
            window.location.href = '/cart';
        }, 1000);
        
        console.log(`✅ 재주문 완료: ${orderUuid}`);
    }, 1500);
}

/**
 * 상품후기 작성 (HTML에서 호출)
 * @param {string} orderUuid - 주문 UUID
 */
function writeReview(orderUuid) {
    showNotification('상품후기 작성 페이지로 이동합니다.', 'info');
    
    setTimeout(() => {
        window.location.href = reviewWriteUrl.replace('{id}', orderUuid);
    }, 800);
    
    console.log(`📝 상품후기 작성: ${orderUuid}`);
}

/**
 * 필터 초기화
 */
function resetFilters() {
    if (statusFilter) statusFilter.value = '';
    if (periodFilter) periodFilter.value = '';
    if (searchInput) searchInput.value = '';
    
    currentPage = 1;
    filterAndDisplayOrders();
    
    showNotification('필터가 초기화되었습니다.', 'success');
}

// ==========================================================================
// 유틸리티 함수들
// ==========================================================================

/**
 * 주문 상태 정보 반환
 * @param {Object|string} orderStatus - 주문 상태 객체 또는 문자열
 * @returns {Object} 상태 정보 객체 {text, className}
 */
function getOrderStatusInfo(orderStatus) {
    const statusName = orderStatus && orderStatus.name ? orderStatus.name : orderStatus;
    
    switch (statusName) {
        case 'PAID':
            return { text: '결제완료', className: 'status-processing' };
        case 'PREPARING':
            return { text: '상품준비중', className: 'status-processing' };
        case 'SHIPPED':
            return { text: '배송중', className: 'status-shipping' };
        case 'DELIVERED':
            return { text: '배송완료', className: 'status-delivered' };
        case 'CANCELLED':
            return { text: '주문취소', className: 'status-cancelled' };
        default:
            return { text: '상태미확인', className: 'status-processing' };
    }
}

/**
 * 액션 버튼 생성 (데스크탑용)
 * @param {Object} order - 주문 객체
 * @returns {string} 버튼 HTML
 */
function generateActionButtons(order) {
    const statusName = order.orderStatus && order.orderStatus.name ? order.orderStatus.name : order.orderStatus;
    let buttons = [];

    if (statusName === 'DELIVERED') {
        buttons.push(`<button class="btn-action btn-review" onclick="writeReview('${order.orderUuid}')">후기작성</button>`);
        buttons.push(`<button class="btn-action btn-reorder" onclick="reorderItems('${order.orderUuid}')">재주문</button>`);
    }

    if (statusName === 'PAID' || statusName === 'PREPARING') {
        buttons.push(`<button class="btn-action btn-cancel" onclick="cancelOrder('${order.orderUuid}')">주문취소</button>`);
    }

    return buttons.join('');
}

/**
 * 빠른 액션 버튼 생성 (모바일용)
 * @param {Object} order - 주문 객체
 * @returns {string} 버튼 HTML
 */
function generateQuickActionButtons(order) {
    const statusName = order.orderStatus && order.orderStatus.name ? order.orderStatus.name : order.orderStatus;
    let buttons = [];

    if (statusName === 'DELIVERED') {
        buttons.push(`<button class="btn-quick btn-review" onclick="writeReview('${order.orderUuid}')">후기</button>`);
        buttons.push(`<button class="btn-quick btn-reorder" onclick="reorderItems('${order.orderUuid}')">재주문</button>`);
    }

    if (statusName === 'PAID' || statusName === 'PREPARING') {
        buttons.push(`<button class="btn-quick btn-cancel" onclick="cancelOrder('${order.orderUuid}')">취소</button>`);
    }

    return buttons.join('');
}

/**
 * 날짜 포맷팅 (YYYY.MM.DD)
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 날짜
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 시간 포맷팅 (HH:MM)
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 시간
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * 날짜시간 포맷팅 (YYYY.MM.DD HH:MM)
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷팅된 날짜시간
 */
function formatDateTime(dateString) {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * 통화 포맷팅 (1,000원)
 * @param {number} amount - 금액
 * @returns {string} 포맷팅된 금액
 */
function formatCurrency(amount) {
    return `${amount.toLocaleString()}원`;
}

// ==========================================================================
// 반응형 기능
// ==========================================================================
/**
 * 반응형 기능을 초기화합니다
 */
function initializeResponsive() {
    // 윈도우 리사이즈 이벤트 리스너
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustForScreenSize();
        }, 250);
    });

    // 초기 화면 크기 조정
    adjustForScreenSize();

    console.log('✅ 반응형 기능이 초기화되었습니다.');
}

/**
 * 화면 크기에 따른 조정
 */
function adjustForScreenSize() {
    const width = window.innerWidth;
    
    // 모바일에서는 페이지당 아이템 수 조정
    const newItemsPerPage = width <= 767 ? 5 : 10;
    
    if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1; // 첫 페이지로 리셋
        if (isInitialized) {
            filterAndDisplayOrders();
        }
        console.log(`📱 화면 크기 변경: 페이지당 ${itemsPerPage}개 표시`);
    }
}

// ==========================================================================
// 키보드 단축키
// ==========================================================================
/**
 * 키보드 단축키를 초기화합니다
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 입력 필드에서는 단축키 비활성화
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        switch(e.key) {
            case 'Escape':
                // 검색 초기화
                resetFilters();
                break;
            case 'f':
            case 'F':
                // 검색 포커스 (Ctrl/Cmd + F)
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
                break;
            case 'ArrowLeft':
                // 이전 페이지 (Shift + 좌측 화살표)
                if (e.shiftKey) {
                    e.preventDefault();
                    previousPage();
                }
                break;
            case 'ArrowRight':
                // 다음 페이지 (Shift + 우측 화살표)
                if (e.shiftKey) {
                    e.preventDefault();
                    nextPage();
                }
                break;
            case '?':
                // 도움말 표시
                showKeyboardShortcuts();
                break;
        }
    });

    console.log('⌨️ 키보드 단축키가 초기화되었습니다.');
}

/**
 * 키보드 단축키 도움말 표시
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        'Esc: 필터 초기화',
        'Ctrl/Cmd + F: 검색 포커스',
        'Shift + ←/→: 이전/다음 페이지',
        '?: 이 도움말 표시'
    ];

    const helpMessage = '⌨️ 키보드 단축키:<br>' + shortcuts.join('<br>');
    showNotification(helpMessage, 'info');
}

// ==========================================================================
// 알림 및 에러 처리
// ==========================================================================

/**
 * 알림 표시 함수
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 (success, error, warning, info)
 */
function showNotification(message, type = 'success') {
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
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // 스타일 적용
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

    // 내부 콘텐츠 스타일
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        padding: 15px 20px;
        gap: 10px;
    `;

    // 아이콘 스타일
    const icon = notification.querySelector('.notification-icon');
    icon.style.cssText = `
        font-size: 18px;
        flex-shrink: 0;
    `;

    // 텍스트 스타일
    const text = notification.querySelector('.notification-text');
    text.style.cssText = `
        flex: 1;
        font-weight: 500;
        font-size: 14px;
        line-height: 1.4;
    `;

    // 닫기 버튼 스타일
    const closeBtn = notification.querySelector('.notification-close');
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

    // 닫기 버튼 호버 효과
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    document.body.appendChild(notification);

    // 알림 표시
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 자동 숨김 (에러가 아닌 경우)
    if (type !== 'error') {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 400);
            }
        }, 4000);
    }
}

/**
 * 알림 아이콘 반환
 * @param {string} type - 알림 타입
 * @returns {string} 아이콘
 */
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '✅';
    }
}

/**
 * 알림 색상 반환
 * @param {string} type - 알림 타입
 * @returns {string} 색상
 */
function getNotificationColor(type) {
    switch(type) {
        case 'success': return 'linear-gradient(135deg, #2d5a3d, #6fa776)';
        case 'error': return 'linear-gradient(135deg, #dc3545, #e85967)';
        case 'warning': return 'linear-gradient(135deg, #ffc107, #ffcd39)';
        case 'info': return 'linear-gradient(135deg, #17a2b8, #20c997)';
        default: return 'linear-gradient(135deg, #2d5a3d, #6fa776)';
    }
}

/**
 * 에러 처리 함수
 * @param {Error} error - 발생한 에러
 * @param {string} context - 에러 발생 컨텍스트
 */
function handleError(error, context = '') {
    console.error(`❌ Error in ${context}:`, error);
    showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
}

// ==========================================================================
// 개발자 도구 및 디버깅
// ==========================================================================

/**
 * 디버그 정보 출력 (개발 환경에서만)
 */
function debugInfo() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.group('🛒 GreenCycle 구매이력 페이지 디버그 정보');
        console.log('원본 주문 목록:', originalOrderList);
        console.log('필터링된 주문 목록:', filteredOrderList);
        console.log('현재 페이지 주문 목록:', displayedOrderList);
        console.log('현재 페이지:', currentPage);
        console.log('총 페이지:', totalPages);
        console.log('페이지당 아이템 수:', itemsPerPage);
        console.log('초기화 상태:', isInitialized);
        console.groupEnd();
    }
}

// 전역 함수로 디버그 정보 노출 (개발 환경에서만)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugOrderHistory = debugInfo;
}

// ==========================================================================
// 전역 함수 노출 및 에러 핸들러 설정
// ==========================================================================

// HTML에서 호출되는 전역 함수들 노출
window.searchOrders = searchOrders;
window.cancelOrder = cancelOrder;
window.reorderItems = reorderItems;
window.writeReview = writeReview;
window.goToPage = goToPage;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.resetFilters = resetFilters;
window.showNotification = showNotification;
window.showKeyboardShortcuts = showKeyboardShortcuts;

// 전역 에러 핸들러
window.addEventListener('error', (e) => {
    handleError(e.error, 'Global error');
});

// 프로미스 거부 핸들러
window.addEventListener('unhandledrejection', (e) => {
    handleError(new Error(e.reason), 'Unhandled promise rejection');
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 필요시 정리 작업 수행
    console.log('🛒 구매이력 페이지를 떠납니다.');
});

// ==========================================================================
// 성능 모니터링 (개발 환경에서만)
// ==========================================================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 페이지 로드 성능 측정
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`📊 페이지 로드 시간: ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
        }, 0);
    });

    // 필터링 성능 측정
    const originalFilterAndDisplay = filterAndDisplayOrders;
    filterAndDisplayOrders = function() {
        const start = performance.now();
        originalFilterAndDisplay.apply(this, arguments);
        const end = performance.now();
        console.log(`⚡ 필터링 및 표시 시간: ${Math.round(end - start)}ms`);
    };
}

// ==========================================================================
// 접근성 개선
// ==========================================================================

/**
 * 스크린 리더를 위한 알림
 * @param {string} message - 알림 메시지
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// 페이지 변경 시 스크린 리더에 알림
const originalGoToPage = goToPage;
goToPage = function(page) {
    originalGoToPage.apply(this, arguments);
    announceToScreenReader(`${page}페이지로 이동했습니다. 총 ${totalPages}페이지 중 ${page}페이지입니다.`);
};

// 필터 변경 시 스크린 리더에 알림
const originalHandleFilterChange = handleFilterChange;
handleFilterChange = function() {
    originalHandleFilterChange.apply(this, arguments);
    announceToScreenReader(`필터가 적용되었습니다. ${filteredOrderList.length}건의 주문이 검색되었습니다.`);
};

// ==========================================================================
// 초기화 완료 로그
// ==========================================================================
console.log(`
🛒 GreenCycle 구매이력 페이지 JavaScript 로드 완료!

주요 기능:
✅ 주문 목록 표시 (테이블/카드)
✅ 필터링 (상태, 기간)
✅ 실시간 검색
✅ 페이지네이션
✅ 주문 관리 (취소, 재주문, 후기)
✅ 반응형 디자인
✅ 키보드 단축키
✅ 접근성 개선
✅ 알림 시스템

개발자 도구:
- window.debugOrderHistory() : 디버그 정보 출력
- window.showKeyboardShortcuts() : 키보드 단축키 도움말

버전: 1.0.0
마지막 업데이트: ${new Date().toLocaleDateString('ko-KR')}
`);