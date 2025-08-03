/**
 * ==========================================================================
 * GreenCycle 주문상세 페이지 JavaScript
 * 새로운 레이아웃 적용: 주문정보-주문상품-배송정보/결제정보(1x2)-주문관리
 * ==========================================================================
 */

/* ==========================================
   전역 변수 선언 및 초기화
   ========================================== */
let currentOrderId = null;          // 현재 조회 중인 주문번호
let orderData = null;               // 주문 상세 데이터
let isInitialized = false;          // 초기화 상태 플래그

// DOM 요소들 - 헤더 관련
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');

/* ==========================================
   페이지 초기화 - DOMContentLoaded 이벤트
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🛍️ GreenCycle 주문상세 페이지 초기화를 시작합니다...');

        // URL 파라미터에서 주문번호 추출
        currentOrderId = getOrderIdFromUrl();

        // 주문번호 유효성 검사
        if (!currentOrderId) {
            showNotification('잘못된 접근입니다. 마이페이지로 이동합니다.', 'warning');
            setTimeout(() => {
                window.location.href = 'mypage.html';
            }, 2000);
            return;
        }

        // 핵심 기능들 초기화
        initializeHeader();              // 헤더 기능 초기화
        initializeCart();                // 장바구니 기능 초기화
        loadOrderData();                 // 주문 데이터 로드
        initializeInteractions();        // 인터랙션 초기화
        initializeKeyboardShortcuts();   // 키보드 단축키 초기화
        adjustLayoutForScreenSize();     // 반응형 레이아웃 조정

        isInitialized = true;
        console.log('✅ 주문상세 페이지가 성공적으로 초기화되었습니다.');

        // 환영 메시지 표시 (1초 후)
        setTimeout(() => {
            showNotification(`주문번호 ${currentOrderId} 상세 정보를 불러왔습니다! 📋`, 'success');
        }, 1000);

    } catch (error) {
        handleError(error, 'Order detail page initialization');
    }
});

/* ==========================================
   URL 파라미터 처리 함수
   ========================================== */
/**
 * URL 파라미터에서 주문번호를 추출합니다
 * @returns {string|null} 주문번호 또는 null
 */
function getOrderIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (orderId) {
        console.log(`📋 URL에서 주문번호 추출: ${orderId}`);
        return orderId;
    }

    console.warn('⚠️ URL에서 주문번호를 찾을 수 없습니다.');
    return null;
}

/* ==========================================
   헤더 기능 초기화
   ========================================== */
/**
 * 헤더 기능 초기화
 * 스크롤 효과, 모바일 메뉴 토글 등을 설정
 */
function initializeHeader() {
    // 스크롤 시 헤더 효과 (디바운싱 적용)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 100) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
        }, 10);
    });

    // 모바일 메뉴 토글 기능
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);

        // 메뉴 링크 클릭 시 메뉴 닫기
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }

    console.log('✅ 헤더 기능이 초기화되었습니다.');
}

/**
 * 모바일 메뉴 토글 함수
 */
function toggleMobileMenu() {
    const isActive = hamburger?.classList.contains('active');

    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

/**
 * 모바일 메뉴 열기
 */
function openMobileMenu() {
    hamburger?.classList.add('active');
    navMenu?.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지

    // 햄버거 아이콘 애니메이션
    const spans = hamburger?.querySelectorAll('span');
    if (spans) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    }
}

/**
 * 모바일 메뉴 닫기
 */
function closeMobileMenu() {
    if (!hamburger || !navMenu) return;

    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = ''; // 스크롤 복구

    // 햄버거 아이콘 원상복구
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
}

/* ==========================================
   장바구니 기능 초기화
   ========================================== */
/**
 * 장바구니 기능 초기화
 * 장바구니 아이콘 클릭 이벤트와 장바구니 개수 업데이트
 */
function initializeCart() {
    if (cartIcon) {
        // 장바구니 아이콘 클릭 이벤트
        cartIcon.addEventListener('click', handleCartClick);

        // 장바구니 개수 초기화
        updateCartCount();

        console.log('✅ 장바구니 기능이 초기화되었습니다.');
    }
}

/**
 * 장바구니 아이콘 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleCartClick(event) {
    event.preventDefault();

    // 클릭 애니메이션 효과
    cartIcon.style.transform = 'scale(0.9)';
    setTimeout(() => {
        cartIcon.style.transform = '';
    }, 150);

    // 장바구니 페이지로 이동 알림
    showNotification('장바구니 페이지로 이동합니다! 🛒', 'info');

    // 실제 구현에서는 cart.html로 페이지 이동
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 800);

    console.log('🛒 장바구니 클릭: cart.html로 이동');
}

/**
 * 장바구니 개수 업데이트
 * @param {number} count - 새로운 장바구니 아이템 개수
 */
function updateCartCount(count = null) {
    if (!cartCount) return;

    // count가 없으면 로컬 스토리지에서 가져오기
    if (count === null) {
        count = getCartItemCount();
    }

    cartCount.textContent = count;

    // 개수가 0이면 배지 숨기기
    if (count === 0) {
        cartCount.style.display = 'none';
    } else {
        cartCount.style.display = 'block';
    }
}

/**
 * 장바구니 아이템 개수 가져오기 (로컬 스토리지)
 * @returns {number} 장바구니 아이템 개수
 */
function getCartItemCount() {
    try {
        return parseInt(localStorage.getItem('cartItemCount') || '3');
    } catch (error) {
        console.warn('⚠️ 장바구니 개수 로드 실패:', error);
        return 3; // 기본값
    }
}

/* ==========================================
   주문 데이터 로드 및 표시
   ========================================== */
/**
 * 주문 데이터를 로드하고 화면에 표시
 * 실제 구현에서는 서버 API를 호출하여 데이터를 가져옴
 */
function loadOrderData() {
    try {
        // 실제 구현에서는 API 호출: fetch(`/api/orders/${currentOrderId}`)
        // 지금은 모의 데이터를 사용
        orderData = getMockOrderData(currentOrderId);

        if (!orderData) {
            throw new Error('주문 정보를 찾을 수 없습니다.');
        }

        // 주문 정보를 화면에 표시
        displayOrderData(orderData);

        console.log(`✅ 주문 데이터 로드 완료: ${currentOrderId}`);

    } catch (error) {
        handleError(error, 'Order data loading');

        // 에러 발생 시 마이페이지로 리다이렉트
        setTimeout(() => {
            window.location.href = 'mypage.html';
        }, 3000);
    }
}

/**
 * 모의 주문 데이터를 반환
 * @param {string} orderId - 주문번호
 * @returns {Object|null} 주문 데이터 객체 또는 null
 */
function getMockOrderData(orderId) {
    // 실제 구현에서는 서버에서 데이터를 가져옴
    const mockOrders = {
        'ORD-2025010001': {
            orderNumber: 'ORD-2025010001',
            orderDate: '2025년 1월 15일',
            orderName: '김환경',
            orderPhone: '010-****-1234',
            status: 'delivered',
            statusText: '배송완료',
            products: [
                {
                    id: 1,
                    name: '천연 세제 세트',
                    description: '탄소중립 인증 제품',
                    options: ['용량: 1L', '향: 라벤더'],
                    quantity: 2,
                    unitPrice: 16000,
                    totalPrice: 32000,
                    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23e3f2fd' width='100' height='100'/><text x='50' y='55' font-size='40' text-anchor='middle'>🧴</text></svg>"
                },
                {
                    id: 2,
                    name: '대나무 칫솔 세트',
                    description: '플라스틱 프리 제품',
                    options: ['구성: 4개입', '색상: 내추럴'],
                    quantity: 1,
                    unitPrice: 15000,
                    totalPrice: 15000,
                    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23f3e5f5' width='100' height='100'/><text x='50' y='55' font-size='40' text-anchor='middle'>🌱</text></svg>"
                }
            ],
            delivery: {
                recipientName: '김환경',
                recipientPhone: '010-****-1234',
                address: '서울특별시 강남구 테헤란로 123 (역삼동)\n그린타워 101호',
                request: '부재 시 경비실에 맡겨주세요',
                timeline: [
                    { step: '주문완료', date: '2025.01.15 14:30', icon: '📦', completed: true },
                    { step: '상품준비중', date: '2025.01.16 09:00', icon: '🏭', completed: true },
                    { step: '배송중', date: '2025.01.17 10:30', icon: '🚛', completed: true },
                    { step: '배송완료', date: '2025.01.18 16:45', icon: '✅', completed: true, current: true }
                ]
            },
            payment: {
                productAmount: 47000,
                shippingFee: 0,
                discount: 2000,
                usedPoints: 2000,
                finalAmount: 43000,
                method: {
                    type: 'credit_card',
                    name: '신용카드',
                    detail: 'KB국민카드 (**** **** **** 1234)',
                    date: '2025.01.15 14:32',
                    amount: 43000
                }
            }
        },
        'ORD-2025010002': {
            orderNumber: 'ORD-2025010002',
            orderDate: '2025년 1월 18일',
            orderName: '김환경',
            orderPhone: '010-****-1234',
            status: 'shipping',
            statusText: '배송중',
            products: [
                {
                    id: 2,
                    name: '대나무 칫솔 세트',
                    description: '플라스틱 프리 제품',
                    options: ['구성: 4개입', '색상: 내추럴'],
                    quantity: 1,
                    unitPrice: 15000,
                    totalPrice: 15000,
                    image: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23f3e5f5' width='100' height='100'/><text x='50' y='55' font-size='40' text-anchor='middle'>🌱</text></svg>"
                }
            ],
            delivery: {
                recipientName: '김환경',
                recipientPhone: '010-****-1234',
                address: '서울특별시 강남구 테헤란로 123 (역삼동)\n그린타워 101호',
                request: '부재 시 경비실에 맡겨주세요',
                timeline: [
                    { step: '주문완료', date: '2025.01.18 10:15', icon: '📦', completed: true },
                    { step: '상품준비중', date: '2025.01.19 08:30', icon: '🏭', completed: true },
                    { step: '배송중', date: '2025.01.20 11:20', icon: '🚛', completed: true, current: true },
                    { step: '배송완료', date: '예정: 2025.01.21', icon: '✅', completed: false }
                ]
            },
            payment: {
                productAmount: 15000,
                shippingFee: 3000,
                discount: 0,
                usedPoints: 0,
                finalAmount: 18000,
                method: {
                    type: 'credit_card',
                    name: '신용카드',
                    detail: 'KB국민카드 (**** **** **** 1234)',
                    date: '2025.01.18 10:16',
                    amount: 18000
                }
            }
        }
    };

    return mockOrders[orderId] || null;
}

/* ==========================================
   주문 데이터 화면 표시 함수들
   ========================================== */
/**
 * 주문 데이터를 화면에 표시
 * @param {Object} data - 주문 데이터 객체
 */
function displayOrderData(data) {
    try {
        // 1. 주문 기본 정보 표시
        displayBasicOrderInfo(data);

        // 2. 주문 상품 정보 표시
        displayOrderProducts(data.products);

        // 3. 배송 정보 표시
        displayDeliveryInfo(data.delivery);

        // 4. 결제 정보 표시
        displayPaymentInfo(data.payment);

        // 5. 주문 상태에 따른 버튼 조정
        adjustActionButtons(data.status);

        console.log('✅ 주문 정보 표시 완료');

    } catch (error) {
        handleError(error, 'Displaying order data');
    }
}

/**
 * 주문 기본 정보를 표시
 * @param {Object} data - 주문 데이터
 */
function displayBasicOrderInfo(data) {
    // 주문번호
    const orderNumberEl = document.getElementById('orderNumber');
    if (orderNumberEl) orderNumberEl.textContent = data.orderNumber;

    // 주문일자
    const orderDateEl = document.getElementById('orderDate');
    if (orderDateEl) orderDateEl.textContent = data.orderDate;

    // 주문자
    const orderNameEl = document.getElementById('orderName');
    if (orderNameEl) orderNameEl.textContent = data.orderName;

    // 연락처
    const orderPhoneEl = document.getElementById('orderPhone');
    if (orderPhoneEl) orderPhoneEl.textContent = data.orderPhone;

    // 주문 상태 배지
    const statusBadge = document.getElementById('orderStatusBadge');
    if (statusBadge) {
        const statusText = statusBadge.querySelector('.status-text');
        if (statusText) statusText.textContent = data.statusText;
        statusBadge.className = `order-status-badge ${data.status}`;
    }
}

/**
 * 주문 상품 정보를 표시
 * @param {Array} products - 상품 배열
 */
function displayOrderProducts(products) {
    const productCountEl = document.getElementById('productCount');
    const productListEl = document.getElementById('productList');

    if (!productListEl) return;

    // 상품 개수 표시
    if (productCountEl) {
        productCountEl.textContent = `총 ${products.length}개 상품`;
    }

    // 상품 목록 생성
    productListEl.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-details">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-options">
                    ${product.options.map(option => `
                        <span class="option-item">${option}</span>
                    `).join('')}
                </div>
            </div>
            <div class="product-quantity">
                <span class="quantity-label">수량</span>
                <span class="quantity-value">${product.quantity}${product.name.includes('세트') ? '세트' : '개'}</span>
            </div>
            <div class="product-price">
                <span class="unit-price">${product.unitPrice.toLocaleString()}원</span>
                <span class="total-price">${product.totalPrice.toLocaleString()}원</span>
            </div>
        </div>
    `).join('');
}

/**
 * 배송 정보를 표시
 * @param {Object} delivery - 배송 정보
 */
function displayDeliveryInfo(delivery) {
    // 배송 타임라인 표시
    displayDeliveryTimeline(delivery.timeline);

    // 배송지 정보 표시
    displayDeliveryAddress(delivery);
}

/**
 * 배송 타임라인을 표시
 * @param {Array} timeline - 배송 단계 배열
 */
function displayDeliveryTimeline(timeline) {
    const timelineContainer = document.querySelector('.status-timeline');
    if (!timelineContainer) return;

    timelineContainer.innerHTML = timeline.map(step => `
        <div class="timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}">
            <div class="step-icon">${step.icon}</div>
            <div class="step-info">
                <span class="step-title">${step.step}</span>
                <span class="step-date">${step.date}</span>
            </div>
        </div>
    `).join('');
}

/**
 * 배송지 정보를 표시
 * @param {Object} delivery - 배송 정보
 */
function displayDeliveryAddress(delivery) {
    const addressContainer = document.querySelector('.address-details');
    if (!addressContainer) return;

    addressContainer.innerHTML = `
        <div class="address-item">
            <span class="address-label">받는분</span>
            <span class="address-value">${delivery.recipientName}</span>
        </div>
        <div class="address-item">
            <span class="address-label">연락처</span>
            <span class="address-value">${delivery.recipientPhone}</span>
        </div>
        <div class="address-item">
            <span class="address-label">주소</span>
            <span class="address-value">${delivery.address.replace(/\n/g, '<br>')}</span>
        </div>
        <div class="address-item">
            <span class="address-label">배송요청사항</span>
            <span class="address-value">${delivery.request}</span>
        </div>
    `;
}

/**
 * 결제 정보를 표시
 * @param {Object} payment - 결제 정보
 */
function displayPaymentInfo(payment) {
    // 결제 요약 정보 표시
    displayPaymentSummary(payment);

    // 결제 방법 정보 표시
    displayPaymentMethod(payment.method);
}

/**
 * 결제 요약 정보를 표시
 * @param {Object} payment - 결제 정보
 */
function displayPaymentSummary(payment) {
    const summaryContainer = document.querySelector('.payment-summary');
    if (!summaryContainer) return;

    summaryContainer.innerHTML = `
        <div class="summary-row">
            <span class="summary-label">상품금액</span>
            <span class="summary-value">${payment.productAmount.toLocaleString()}원</span>
        </div>
        <div class="summary-row">
            <span class="summary-label">배송비</span>
            <span class="summary-value">${payment.shippingFee.toLocaleString()}원</span>
            ${payment.shippingFee === 0 ? '<span class="summary-note">(50,000원 이상 무료배송)</span>' : ''}
        </div>
        ${payment.discount > 0 ? `
            <div class="summary-row discount">
                <span class="summary-label">할인금액</span>
                <span class="summary-value">-${payment.discount.toLocaleString()}원</span>
                <span class="summary-note">(신규회원 할인)</span>
            </div>
        ` : ''}
        ${payment.usedPoints > 0 ? `
            <div class="summary-row used-points">
                <span class="summary-label">사용 포인트</span>
                <span class="summary-value">-${payment.usedPoints.toLocaleString()}원</span>
            </div>
        ` : ''}
        <div class="summary-row total">
            <span class="summary-label">최종결제금액</span>
            <span class="summary-value">${payment.finalAmount.toLocaleString()}원</span>
        </div>
    `;
}

/**
 * 결제 방법 정보를 표시
 * @param {Object} method - 결제 방법 정보
 */
function displayPaymentMethod(method) {
    const methodContainer = document.querySelector('.method-details');
    if (!methodContainer) return;

    const methodIcon = method.type === 'credit_card' ? '💳' : '💰';

    methodContainer.innerHTML = `
        <div class="method-item">
            <span class="method-icon">${methodIcon}</span>
            <div class="method-info">
                <span class="method-name">${method.name}</span>
                <span class="method-detail">${method.detail}</span>
                <span class="method-date">결제일시: ${method.date}</span>
            </div>
            <span class="method-amount">${method.amount.toLocaleString()}원</span>
        </div>
    `;
}

/**
 * 주문 상태에 따라 액션 버튼을 조정
 * @param {string} status - 주문 상태
 */
function adjustActionButtons(status) {
    const reviewBtn = document.querySelector('.btn-review');
    const exchangeBtn = document.querySelector('.btn-exchange');

    // 배송완료 상태일 때만 후기 작성 및 교환/반품 버튼 활성화
    if (reviewBtn) {
        reviewBtn.style.display = status === 'delivered' ? 'flex' : 'none';
    }

    if (exchangeBtn) {
        exchangeBtn.style.display = status === 'delivered' ? 'flex' : 'none';
    }
}

/* ==========================================
   주문 관리 기능들 - 4개 버튼만 유지
   ========================================== */

/**
 * 뒤로가기 버튼 클릭 처리
 */
function goBack() {
    // 브라우저 히스토리에 이전 페이지가 있으면 뒤로가기
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // 없으면 마이페이지로 이동
        window.location.href = 'mypage.html';
    }

    console.log('← 뒤로가기 버튼 클릭');
}

/**
 * 배송 조회 기능
 */
function trackDelivery() {
    showNotification('배송 조회 페이지로 이동합니다. 🚚', 'info');

    // 실제 구현에서는 택배사 배송조회 페이지로 이동
    setTimeout(() => {
        // 예: window.open('https://tracking.example.com/track?order=' + currentOrderId);
        console.log(`🚚 배송조회: ${currentOrderId}`);
    }, 800);

    console.log('🔍 배송조회 버튼 클릭');
}

/**
 * 상품후기 작성 기능
 */
function writeReview() {
    showNotification('상품후기 작성 페이지로 이동합니다. ⭐', 'info');

    // 실제 구현에서는 후기 작성 페이지로 이동
    setTimeout(() => {
        window.location.href = `review-write.html?orderId=${currentOrderId}`;
    }, 800);

    console.log('⭐ 상품후기 작성 버튼 클릭');
}

/**
 * 교환/반품 기능
 */
function requestExchange() {
    const modal = document.getElementById('exchangeModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    console.log('🔄 교환/반품 버튼 클릭');
}

/**
 * 영수증 다운로드 기능
 */
function downloadReceipt() {
    showNotification('영수증을 다운로드하고 있습니다... 📄', 'info');

    // 실제 구현에서는 서버에서 PDF 생성 후 다운로드
    setTimeout(() => {
        // 모의 다운로드 기능
        const link = document.createElement('a');
        link.href = '#'; // 실제로는 PDF URL
        link.download = `GreenCycle_영수증_${currentOrderId}.pdf`;

        showNotification('영수증 다운로드가 완료되었습니다! 📄', 'success');
        console.log(`📄 영수증 다운로드: ${currentOrderId}`);
    }, 2000);

    console.log('📄 영수증 다운로드 버튼 클릭');
}

/* ==========================================
   모달 관리 함수들
   ========================================== */

/**
 * 교환/반품 모달 닫기
 */
function closeExchangeModal() {
    const modal = document.getElementById('exchangeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 스크롤 복구
    }
}

/**
 * 교환/반품 신청 제출
 */
function submitExchangeRequest() {
    // 실제 교환/반품 신청 로직
    closeExchangeModal();
    showNotification('교환/반품 신청이 완료되었습니다.', 'success');
    
    console.log('📝 교환/반품 신청 완료');
}

/* ==========================================
   인터랙션 및 반응형 처리
   ========================================== */

/**
 * 페이지 인터랙션 초기화
 */
function initializeInteractions() {
    // 카드 호버 효과
    const cards = document.querySelectorAll('.order-info-card, .order-product-card, .delivery-info-card, .payment-info-card, .order-actions-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', handleCardHover);
    });

    console.log('✅ 인터랙션 이벤트가 초기화되었습니다.');
}

/**
 * 카드 호버 처리
 * @param {Event} event - 마우스 엔터 이벤트
 */
function handleCardHover(event) {
    const card = event.currentTarget;

    // 미묘한 그림자 효과
    card.style.transition = 'all 0.3s ease';
    card.style.boxShadow = '0 20px 60px rgba(45, 90, 61, 0.15)';
}

/**
 * 키보드 단축키 초기화
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 입력 필드에서는 단축키 비활성화
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.key) {
            case 'Escape':
                closeMobileMenu();
                closeExchangeModal();
                // 모든 알림 닫기
                document.querySelectorAll('.notification').forEach(notification => {
                    notification.remove();
                });
                break;
            case 'b':
            case 'B':
                // 뒤로가기 (shift+b)
                if (e.shiftKey) {
                    e.preventDefault();
                    goBack();
                }
                break;
            case 't':
            case 'T':
                // 배송조회 (shift+t)
                if (e.shiftKey) {
                    e.preventDefault();
                    trackDelivery();
                }
                break;
            case '?':
                // 도움말 표시
                showKeyboardShortcuts();
                break;
        }
    });

    console.log('✅ 키보드 단축키가 초기화되었습니다.');
}

/**
 * 키보드 단축키 도움말 표시
 */
function showKeyboardShortcuts() {
    const shortcuts = [
        'Esc: 메뉴 닫기 / 모달 닫기 / 알림 닫기',
        'Shift + B: 뒤로가기',
        'Shift + T: 배송조회',
        '?: 이 도움말 표시'
    ];

    const helpMessage = '⌨️ 키보드 단축키:\n' + shortcuts.join('\n');
    showNotification(helpMessage.replace(/\n/g, '<br>'), 'info');
}

/**
 * 화면 크기에 따른 레이아웃 조정
 */
function adjustLayoutForScreenSize() {
    const width = window.innerWidth;

    if (width < 768) {
        adjustMobileLayout();
    } else if (width < 1200) {
        adjustTabletLayout();
    } else {
        adjustDesktopLayout();
    }
}

/**
 * 모바일 레이아웃 조정
 */
function adjustMobileLayout() {
    // 모바일에서는 CSS 미디어 쿼리로 처리
    console.log('📱 모바일 레이아웃 적용');
}

/**
 * 태블릿 레이아웃 조정
 */
function adjustTabletLayout() {
    // 태블릿에서는 CSS 미디어 쿼리로 처리
    console.log('📲 태블릿 레이아웃 적용');
}

/**
 * 데스크탑 레이아웃 조정
 */
function adjustDesktopLayout() {
    // 데스크탑에서는 CSS 미디어 쿼리로 처리
    console.log('🖥️ 데스크탑 레이아웃 적용');
}

// 윈도우 리사이즈 이벤트 리스너
window.addEventListener('resize', () => {
    let resizeTimeout;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        adjustLayoutForScreenSize();
    }, 250);
});

/* ==========================================
   유틸리티 함수들
   ========================================== */

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

/* ==========================================
   전역 함수 노출 및 에러 핸들러 설정
   ========================================== */

// 전역 함수 노출 (HTML에서 호출되는 함수들)
window.goBack = goBack;
window.trackDelivery = trackDelivery;
window.writeReview = writeReview;
window.requestExchange = requestExchange;
window.downloadReceipt = downloadReceipt;
window.closeExchangeModal = closeExchangeModal;
window.submitExchangeRequest = submitExchangeRequest;
window.showNotification = showNotification;
window.displayOrderData = displayOrderData;

// 전역 에러 핸들러
window.addEventListener('error', (e) => {
    handleError(e.error, 'Global error');
});

// 프로미스 거부 핸들러
window.addEventListener('unhandledrejection', (e) => {
    handleError(new Error(e.reason), 'Unhandled promise rejection');
});

console.log('🛍️ GreenCycle 주문상세 페이지 JavaScript가 완전히 로드되었습니다.');

/* ==========================================
   개발자를 위한 디버깅 함수들
   ========================================== */

/**
 * 개발자 도구용 - 현재 주문 데이터 확인
 */
function debugOrderData() {
    console.log('📊 현재 주문 데이터:', orderData);
    return orderData;
}

/**
 * 개발자 도구용 - 모든 DOM 요소 상태 확인
 */
function debugDOMElements() {
    const elements = {
        orderNumber: document.getElementById('orderNumber'),
        orderDate: document.getElementById('orderDate'),
        orderName: document.getElementById('orderName'),
        orderPhone: document.getElementById('orderPhone'),
        productCount: document.getElementById('productCount'),
        productList: document.getElementById('productList'),
        statusTimeline: document.querySelector('.status-timeline'),
        addressDetails: document.querySelector('.address-details'),
        paymentSummary: document.querySelector('.payment-summary'),
        methodDetails: document.querySelector('.method-details')
    };

    console.log('🔍 DOM 요소들 상태:', elements);
    return elements;
}

/**
 * 개발자 도구용 - 테스트 알림 표시
 */
function testNotifications() {
    setTimeout(() => showNotification('성공 알림 테스트', 'success'), 0);
    setTimeout(() => showNotification('정보 알림 테스트', 'info'), 1000);
    setTimeout(() => showNotification('경고 알림 테스트', 'warning'), 2000);
    setTimeout(() => showNotification('에러 알림 테스트', 'error'), 3000);
}

// 개발자 도구용 함수들을 전역에 노출 (개발 환경에서만)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.debugOrderData = debugOrderData;
    window.debugDOMElements = debugDOMElements;
    window.testNotifications = testNotifications;
    
    console.log('🛠️ 개발자 도구 함수들이 활성화되었습니다.');
    console.log('   - debugOrderData(): 현재 주문 데이터 확인');
    console.log('   - debugDOMElements(): DOM 요소 상태 확인');
    console.log('   - testNotifications(): 알림 테스트');
}