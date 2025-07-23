/**
 * GreenCycle 마이페이지 개선된 레이아웃 JavaScript
 * 가로형 활동 리스트와 1x2 그리드 레이아웃을 지원하는 스크립트
 * 장바구니 아이콘 기능 포함
 */

// ==========================================================================
// 전역 변수 선언
// ==========================================================================
let animationObserver;                    // 스크롤 애니메이션 관찰자
let isInitialized = false;               // 초기화 상태 플래그

// DOM 요소들
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');

// ==========================================================================
// 페이지 초기화 - DOMContentLoaded 이벤트 리스너
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🌱 GreenCycle 마이페이지 초기화를 시작합니다...');
        
        // 핵심 기능 초기화
        initializeHeader();              // 헤더 기능 초기화
        initializeCart();                // 장바구니 기능 초기화
        initializeCounters();            // 카운터 애니메이션 초기화
        initializeObserver();            // Intersection Observer 초기화
        initializeSettings();            // 설정 기능 초기화
        initializeInteractions();        // 인터랙션 초기화
        initializeKeyboardShortcuts();   // 키보드 단축키 초기화
        initializePageLifecycle();       // 페이지 라이프사이클 관리
        
        // 성능 최적화
        optimizePerformance();
        
        // 초기 레이아웃 조정
        adjustLayoutForScreenSize();
        
        // 접근성 기능 향상
        enhanceAccessibility();
        
        // 사용자 설정 로드
        loadUserPreferences();
        
        isInitialized = true;
        console.log('🌱 GreenCycle 개선된 마이페이지가 성공적으로 초기화되었습니다.');
        
        // 환영 메시지 표시 (1초 후)
        setTimeout(() => {
            showNotification('GreenCycle 마이페이지에 오신 것을 환영합니다! 🌱', 'success');
        }, 1000);
        
    } catch (error) {
        handleError(error, 'Page initialization');
    }
});

// ==========================================================================
// 헤더 기능 초기화
// ==========================================================================
/**
 * 헤더 기능 초기화
 * 스크롤 효과, 모바일 메뉴 토글 등을 설정합니다
 */
function initializeHeader() {
    // 스크롤 시 헤더 효과 (디바운싱 적용)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
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
    const isActive = hamburger.classList.contains('active');
    
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
    hamburger.classList.add('active');
    navMenu.classList.add('active');
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    
    // 햄버거 아이콘 애니메이션
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
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

// ==========================================================================
// 장바구니 기능 초기화
// ==========================================================================
/**
 * 장바구니 기능 초기화
 * 장바구니 아이콘 클릭 이벤트와 장바구니 개수 업데이트 기능
 */
function initializeCart() {
    if (cartIcon) {
        // 장바구니 아이콘 클릭 이벤트
        cartIcon.addEventListener('click', handleCartClick);
        
        // 장바구니 아이콘 호버 효과
        cartIcon.addEventListener('mouseenter', handleCartHover);
        
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
    
    // 장바구니 페이지로 이동하기 전 알림 표시
    showNotification('장바구니 페이지로 이동합니다! 🛒', 'info');
    
    // 실제 구현에서는 cart.html로 페이지 이동
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 800);
    
    console.log('🛒 장바구니 클릭: cart.html로 이동');
}

/**
 * 장바구니 아이콘 호버 처리
 * @param {Event} event - 마우스 엔터 이벤트
 */
function handleCartHover(event) {
    // 장바구니 아이콘에 살짝 회전 효과
    const cartSymbol = cartIcon.querySelector('.cart-symbol');
    if (cartSymbol) {
        cartSymbol.style.transform = 'rotate(-10deg)';
        setTimeout(() => {
            cartSymbol.style.transform = '';
        }, 200);
    }
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
        
        // 개수가 변경되면 애니메이션 효과
        cartCount.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            cartCount.style.animation = '';
        }, 600);
    }
    
    // 로컬 스토리지에 저장
    setCartItemCount(count);
}

/**
 * 장바구니에 아이템 추가
 * @param {Object} item - 추가할 아이템 정보
 */
function addToCart(item) {
    const currentCount = getCartItemCount();
    updateCartCount(currentCount + 1);
    
    showNotification(`"${item.name}"이(가) 장바구니에 추가되었습니다! 🛒`, 'success');
    console.log('장바구니에 아이템 추가:', item);
}

/**
 * 장바구니 아이템 개수 가져오기 (로컬 스토리지)
 * @returns {number} 장바구니 아이템 개수
 */
function getCartItemCount() {
    try {
        return parseInt(localStorage.getItem('cartItemCount') || '3');
    } catch (error) {
        console.warn('장바구니 개수 로드 실패:', error);
        return 3; // 기본값
    }
}

/**
 * 장바구니 아이템 개수 저장하기 (로컬 스토리지)
 * @param {number} count - 저장할 개수
 */
function setCartItemCount(count) {
    try {
        localStorage.setItem('cartItemCount', count.toString());
    } catch (error) {
        console.warn('장바구니 개수 저장 실패:', error);
    }
}

// ==========================================================================
// 카운터 애니메이션 초기화
// ==========================================================================
/**
 * 카운터 애니메이션 초기화
 * 통계 숫자들을 부드럽게 증가시키는 애니메이션을 적용합니다
 */
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach((counter, index) => {
        const target = parseFloat(counter.getAttribute('data-count'));
        // 스태거된 애니메이션으로 순차적으로 실행
        setTimeout(() => {
            animateCounter(counter, target);
        }, index * 200);
    });
    
    console.log(`✅ ${counters.length}개의 카운터 애니메이션이 초기화되었습니다.`);
}

/**
 * 카운터 애니메이션 실행
 * @param {HTMLElement} element - 애니메이션을 적용할 요소
 * @param {number} target - 목표 숫자
 * @param {number} duration - 애니메이션 지속 시간 (기본값: 2000ms)
 */
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 이징 함수 적용 (ease-out-quart)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeOutQuart;
        
        // 숫자 포맷팅
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // 최종 값 설정
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// ==========================================================================
// Intersection Observer 초기화
// ==========================================================================
/**
 * Intersection Observer 초기화
 * 스크롤 시 요소들이 보이면 애니메이션을 실행합니다
 */
function initializeObserver() {
    const observerOptions = {
        threshold: 0.1, // 10%가 보이면 트리거
        rootMargin: '0px 0px -50px 0px' // 하단 마진
    };
    
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 요소가 보이면 애니메이션 클래스 추가
                entry.target.classList.add('visible');
                
                // 프로그레스 바 애니메이션
                if (entry.target.classList.contains('progress-fill')) {
                    animateProgressBar(entry.target);
                }
                
                // 가로형 활동 아이템 스태거 애니메이션
                if (entry.target.classList.contains('activity-list-horizontal')) {
                    animateHorizontalActivityItems(entry.target);
                }
                
                // 관찰 중단 (한 번만 실행)
                animationObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 관찰할 요소들 등록
    const observeElements = document.querySelectorAll(`
        .unified-card, 
        .dashboard-section, 
        .progress-fill, 
        .activity-list-horizontal
    `);
    
    observeElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        animationObserver.observe(el);
    });
    
    console.log(`✅ ${observeElements.length}개의 요소에 스크롤 애니메이션이 적용되었습니다.`);
}

/**
 * 프로그레스 바 애니메이션
 * @param {HTMLElement} progressBar - 프로그레스 바 요소
 */
function animateProgressBar(progressBar) {
    const targetWidth = progressBar.style.width;
    progressBar.style.width = '0%';
    
    setTimeout(() => {
        progressBar.style.width = targetWidth;
    }, 300);
}

/**
 * 가로형 활동 아이템 스태거 애니메이션
 * @param {HTMLElement} container - 활동 리스트 컨테이너
 */
function animateHorizontalActivityItems(container) {
    const items = container.querySelectorAll('.activity-item-horizontal');
    
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// ==========================================================================
// 설정 기능 초기화
// ==========================================================================
/**
 * 설정 기능 초기화
 * 토글 스위치, 설정 변경 버튼 등의 이벤트를 설정합니다
 */
function initializeSettings() {
    // 토글 스위치 이벤트
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', handleToggleChange);
    });
    
    // 설정 변경 버튼 이벤트
    const changeButtons = document.querySelectorAll('.btn-small');
    changeButtons.forEach(btn => {
        if (btn.textContent.trim() === '변경') {
            btn.addEventListener('click', handleSettingChange);
        }
    });
    
    // 기간 선택기 이벤트
    const periodSelectors = document.querySelectorAll('.period-selector');
    periodSelectors.forEach(selector => {
        selector.addEventListener('change', handlePeriodChange);
    });
    
    console.log('✅ 설정 기능이 초기화되었습니다.');
}

/**
 * 토글 스위치 변경 처리
 * @param {Event} event - 변경 이벤트
 */
function handleToggleChange(event) {
    const isChecked = event.target.checked;
    const settingItem = event.target.closest('.setting-item');
    const settingName = settingItem.querySelector('.setting-toggle span').textContent;
    
    console.log(`설정 변경: ${settingName} = ${isChecked}`);
    showNotification(
        `${settingName} 설정이 ${isChecked ? '활성화' : '비활성화'}되었습니다.`, 
        'info'
    );
    
    // 설정 저장
    saveUserPreferences();
}

/**
 * 설정 변경 버튼 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleSettingChange(event) {
    const button = event.target;
    const settingItem = button.closest('.setting-item');
    const input = settingItem.querySelector('input');
    const settingType = settingItem.querySelector('label').textContent;
    
    // 버튼 상태 변경
    const originalText = button.textContent;
    button.textContent = '저장 중...';
    button.disabled = true;
    
    // API 호출 시뮬레이션
    setTimeout(() => {
        button.textContent = '완료';
        button.style.background = 'var(--success-color)';
        button.style.color = 'white';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
            button.disabled = false;
        }, 1500);
        
        showNotification(`${settingType} 변경이 완료되었습니다.`, 'success');
        console.log(`설정 변경: ${settingType} = ${input.value}`);
    }, 1500);
}

/**
 * 기간 변경 처리
 * @param {Event} event - 변경 이벤트
 */
function handlePeriodChange(event) {
    const selectedPeriod = event.target.value;
    showNotification(`기간이 "${selectedPeriod}"으로 변경되었습니다.`, 'info');
    updateChartData(selectedPeriod);
}

// ==========================================================================
// 인터랙션 초기화
// ==========================================================================
/**
 * 인터랙션 초기화
 * 클릭 이벤트, 호버 효과 등을 설정합니다
 */
function initializeInteractions() {
    // 가로형 활동 아이템 클릭 이벤트
    const horizontalActivityItems = document.querySelectorAll('.activity-item-horizontal');
    horizontalActivityItems.forEach(item => {
        item.addEventListener('click', handleActivityItemClick);
        item.addEventListener('mouseenter', handleActivityItemHover);
    });
    
    // 성취 아이템 클릭 이벤트
    const achievementItems = document.querySelectorAll('.achievement-item');
    achievementItems.forEach(item => {
        item.addEventListener('click', handleAchievementItemClick);
    });
    
    // 나눔 아이템 클릭 이벤트
    const sharingItems = document.querySelectorAll('.sharing-item');
    sharingItems.forEach(item => {
        item.addEventListener('click', handleSharingItemClick);
    });
    
    // 구매 아이템 클릭 이벤트
    const purchaseItems = document.querySelectorAll('.purchase-item');
    purchaseItems.forEach(item => {
        item.addEventListener('click', handlePurchaseItemClick);
    });
    
    // 포인트 아이템 클릭 이벤트
    const pointsItems = document.querySelectorAll('.points-item');
    pointsItems.forEach(item => {
        item.addEventListener('click', handlePointsItemClick);
    });
    
    // 전체보기 링크 이벤트
    const viewAllLinks = document.querySelectorAll('.view-all');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', handleViewAllClick);
    });
    
    // 카드 호버 효과
    const unifiedCards = document.querySelectorAll('.unified-card');
    unifiedCards.forEach(card => {
        card.addEventListener('mouseenter', handleCardHover);
    });
    
    console.log('✅ 인터랙션 이벤트가 초기화되었습니다.');
}

/**
 * 활동 아이템 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleActivityItemClick(event) {
    const item = event.currentTarget;
    const title = item.querySelector('h4').textContent;
    
    // 클릭 효과 애니메이션
    item.style.transform = 'scale(0.98)';
    setTimeout(() => {
        item.style.transform = '';
    }, 150);
    
    showNotification(`"${title}" 상세 정보를 확인합니다.`, 'info');
    console.log(`활동 클릭: ${title}`);
}

/**
 * 활동 아이템 호버 처리
 * @param {Event} event - 마우스 엔터 이벤트
 */
function handleActivityItemHover(event) {
    const item = event.currentTarget;
    const icon = item.querySelector('.activity-icon');
    
    // 아이콘 회전 애니메이션
    if (icon) {
        icon.style.transform = 'rotate(5deg)';
        setTimeout(() => {
            icon.style.transform = '';
        }, 200);
    }
}

/**
 * 성취 아이템 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleAchievementItemClick(event) {
    const item = event.currentTarget;
    const title = item.querySelector('h4').textContent;
    
    if (item.classList.contains('in-progress')) {
        showNotification(`"${title}" 성취를 완료하기 위해 더 노력해보세요!`, 'warning');
    } else if (item.classList.contains('completed')) {
        showNotification(`"${title}" 성취를 달성하셨습니다! 🎉`, 'success');
    }
    
    console.log(`성취 클릭: ${title}`);
}

/**
 * 나눔 아이템 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleSharingItemClick(event) {
    const item = event.currentTarget;
    const title = item.querySelector('h4').textContent;
    
    showNotification(`"${title}" 나눔 상세 정보를 확인합니다.`, 'info');
    console.log(`나눔 클릭: ${title}`);
}

/**
 * 구매 아이템 클릭 처리
 * 주문상세 페이지로 이동하는 기능 추가
 * @param {Event} event - 클릭 이벤트
 */
function handlePurchaseItemClick(event) {
    const item = event.currentTarget;
    const title = item.querySelector('h4').textContent;
    const orderId = item.getAttribute('data-order-id'); // 주문번호 가져오기
    
    // 클릭 효과 애니메이션
    item.style.transform = 'scale(0.98)';
    setTimeout(() => {
        item.style.transform = '';
    }, 150);
    
    // 주문번호가 있으면 주문상세 페이지로 이동
    if (orderId) {
        showNotification(`"${title}" 주문상세 페이지로 이동합니다.`, 'info');
        
        // 0.8초 후 주문상세 페이지로 이동 (알림 표시 시간 확보)
        setTimeout(() => {
            // 주문번호를 파라미터로 하여 주문상세 페이지로 이동
            window.location.href = `order-detail.html?orderId=${orderId}`;
        }, 800);
        
        console.log(`주문 클릭: ${title}, 주문번호: ${orderId}`);
    } else {
        // 주문번호가 없으면 기본 알림만 표시
        showNotification(`"${title}" 주문 정보를 확인합니다.`, 'info');
        console.log(`구매 클릭: ${title}`);
    }
}

/**
 * 포인트 아이템 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handlePointsItemClick(event) {
    const item = event.currentTarget;
    const desc = item.querySelector('.points-desc').textContent;
    
    showNotification(`"${desc}" 포인트 상세 내역을 확인합니다.`, 'info');
    console.log(`포인트 클릭: ${desc}`);
}

/**
 * 전체보기 링크 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleViewAllClick(event) {
    event.preventDefault();
    const cardTitle = event.target.closest('.unified-card').querySelector('h3').textContent;
    
    showNotification(`${cardTitle} 전체 내역 페이지로 이동합니다.`, 'info');
    console.log(`전체보기 클릭: ${cardTitle}`);
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

// ==========================================================================
// 빠른 실행 함수들
// ==========================================================================

/**
 * 분리배출 빠른 실행
 */
function quickWasteSorting() {
    showNotification('AI 분리배출 페이지로 이동합니다. 📷', 'info');
    console.log('빠른 실행: 분리배출');
    animateButtonClick(event.target);
}

/**
 * 무료나눔 빠른 실행
 */
function quickSharing() {
    showNotification('무료나눔 등록 페이지로 이동합니다. 🤝', 'info');
    console.log('빠른 실행: 무료나눔');
    animateButtonClick(event.target);
}

/**
 * 에코마켓 빠른 실행
 */
function quickMarket() {
    showNotification('친환경 에코마켓으로 이동합니다. 🛒', 'info');
    console.log('빠른 실행: 에코마켓');
    animateButtonClick(event.target);
}

/**
 * 커뮤니티 빠른 실행
 */
function quickCommunity() {
    showNotification('환경독톡 커뮤니티로 이동합니다. 💬', 'info');
    console.log('빠른 실행: 커뮤니티');
    animateButtonClick(event.target);
}

/**
 * 새 나눔 등록
 */
function createSharing() {
    showNotification('새 나눔 등록 페이지로 이동합니다. ✨', 'info');
    console.log('새 나눔 등록');
}

/**
 * 프로필 편집
 */
function editProfile() {
    showNotification('프로필 편집 기능을 준비 중입니다. ✏️', 'info');
    console.log('프로필 편집');
}

/**
 * 버튼 클릭 애니메이션
 * @param {HTMLElement} button - 클릭된 버튼
 */
function animateButtonClick(button) {
    const btn = button.closest('.btn, .quick-btn-unified');
    if (!btn) return;
    
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 150);
}

// ==========================================================================
// 차트 데이터 업데이트
// ==========================================================================
/**
 * 차트 데이터 업데이트
 * @param {string} period - 선택된 기간
 */
function updateChartData(period) {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    progressBars.forEach((bar, index) => {
        const baseWidths = ['85%', '92%', '78%', '65%'];
        let newWidth;
        
        switch(period) {
            case '최근 6개월':
                newWidth = Math.max(parseInt(baseWidths[index]) - 10, 10) + '%';
                break;
            case '1년':
                newWidth = Math.min(parseInt(baseWidths[index]) + 5, 100) + '%';
                break;
            default:
                newWidth = baseWidths[index];
        }
        
        // 애니메이션 적용
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = newWidth;
        }, 200 + (index * 100));
    });
    
    console.log(`차트 데이터 업데이트: ${period}`);
}

// ==========================================================================
// 알림 시스템
// ==========================================================================
/**
 * 알림 시스템
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
    
    // 자동 숨김 (클릭할 수 있는 타입이 아닌 경우)
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

// ==========================================================================
// 키보드 단축키 초기화
// ==========================================================================
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
                // 모든 알림 닫기
                document.querySelectorAll('.notification').forEach(notification => {
                    notification.remove();
                });
                break;
            case 'h':
            case 'H':
                // 홈으로 스크롤 (shift+h)
                if (e.shiftKey) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    showNotification('페이지 상단으로 이동했습니다.', 'info');
                }
                break;
            case 'c':
            case 'C':
                // 장바구니 열기 (shift+c)
                if (e.shiftKey) {
                    e.preventDefault();
                    handleCartClick(e);
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
        'Esc: 메뉴 닫기 / 알림 닫기',
        'Shift + H: 페이지 상단으로 이동',
        'Shift + C: 장바구니 열기',
        '?: 이 도움말 표시'
    ];
    
    const helpMessage = '키보드 단축키:\n' + shortcuts.join('\n');
    showNotification(helpMessage.replace(/\n/g, '<br>'), 'info');
}

// ==========================================================================
// 페이지 라이프사이클 관리
// ==========================================================================
/**
 * 페이지 라이프사이클 관리
 */
function initializePageLifecycle() {
    // 페이지 언로드 전 설정 저장
    window.addEventListener('beforeunload', () => {
        saveUserPreferences();
    });
    
    // 페이지 로드 완료 후 설정 로드
    window.addEventListener('load', () => {
        loadUserPreferences();
        enhanceAccessibility();
    });
    
    console.log('✅ 페이지 라이프사이클 관리가 초기화되었습니다.');
}

// ==========================================================================
// 반응형 및 접근성 기능
// ==========================================================================
/**
 * 윈도우 리사이즈 처리
 */
function handleWindowResize() {
    let resizeTimeout;
    
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustLayoutForScreenSize();
        }, 250);
    });
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
    const activityList = document.querySelector('.activity-list-horizontal');
    if (activityList) {
        activityList.style.gridTemplateColumns = '1fr';
    }
    
    const grid1x2Elements = document.querySelectorAll('.grid-1x2');
    grid1x2Elements.forEach(grid => {
        grid.style.gridTemplateColumns = '1fr';
    });
}

/**
 * 태블릿 레이아웃 조정
 */
function adjustTabletLayout() {
    const activityList = document.querySelector('.activity-list-horizontal');
    if (activityList) {
        activityList.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }
    
    const grid1x2Elements = document.querySelectorAll('.grid-1x2');
    grid1x2Elements.forEach(grid => {
        grid.style.gridTemplateColumns = '1fr';
    });
}

/**
 * 데스크탑 레이아웃 조정
 */
function adjustDesktopLayout() {
    const activityList = document.querySelector('.activity-list-horizontal');
    if (activityList) {
        activityList.style.gridTemplateColumns = 'repeat(3, 1fr)';
    }
    
    const grid1x2Elements = document.querySelectorAll('.grid-1x2');
    grid1x2Elements.forEach(grid => {
        grid.style.gridTemplateColumns = '1fr 1fr';
    });
}

/**
 * 접근성 향상
 */
function enhanceAccessibility() {
    // ARIA 라벨 추가
    const unifiedCards = document.querySelectorAll('.unified-card');
    unifiedCards.forEach(card => {
        const title = card.querySelector('h3')?.textContent;
        if (title) {
            card.setAttribute('aria-label', `섹션: ${title}`);
            card.setAttribute('role', 'region');
        }
    });
    
    // 키보드 네비게이션 지원
    const interactiveElements = document.querySelectorAll(`
        .activity-item-horizontal,
        .achievement-item,
        .sharing-item,
        .purchase-item,
        .points-item,
        .cart-icon
    `);
    
    interactiveElements.forEach(element => {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                element.click();
            }
        });
    });
    
    // 포커스 관리
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    console.log('✅ 접근성 기능이 향상되었습니다.');
}

/**
 * 성능 최적화
 */
function optimizePerformance() {
    // 지연 로딩 이미지
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // 스크롤 이벤트 최적화
    let scrollTimeout;
    const scrollHandler = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateScrollBasedAnimations();
        }, 10);
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    console.log('✅ 성능 최적화가 적용되었습니다.');
}

/**
 * 스크롤 기반 애니메이션 업데이트
 */
function updateScrollBasedAnimations() {
    // 헤더 스크롤 효과
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // 카드 parallax 효과 (선택적)
    const cards = document.querySelectorAll('.unified-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            const scrollProgress = 1 - (rect.top / window.innerHeight);
            const transformY = scrollProgress * 10;
            card.style.transform = `translateY(${transformY}px)`;
        }
    });
}

// ==========================================================================
// 사용자 데이터 관리
// ==========================================================================
/**
 * 사용자 설정 저장
 */
function saveUserPreferences() {
    const preferences = {
        notifications: {},
        theme: 'light',
        language: 'ko',
        lastVisit: new Date().toISOString(),
        cartCount: getCartItemCount()
    };
    
    // 알림 설정 저장
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        const settingName = toggle.closest('.setting-item').querySelector('.setting-toggle span').textContent;
        preferences.notifications[settingName] = toggle.checked;
    });
    
    try {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        console.log('사용자 설정이 저장되었습니다.');
    } catch (error) {
        console.warn('사용자 설정 저장 실패:', error);
    }
}

/**
 * 사용자 설정 로드
 */
function loadUserPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        
        if (preferences.notifications) {
            const toggles = document.querySelectorAll('.toggle input');
            toggles.forEach(toggle => {
                const settingName = toggle.closest('.setting-item').querySelector('.setting-toggle span').textContent;
                if (preferences.notifications[settingName] !== undefined) {
                    toggle.checked = preferences.notifications[settingName];
                }
            });
        }
        
        // 장바구니 개수 복원
        if (preferences.cartCount !== undefined) {
            updateCartCount(preferences.cartCount);
        }
        
        console.log('사용자 설정이 로드되었습니다.');
    } catch (error) {
        console.warn('사용자 설정 로드 실패:', error);
    }
}

/**
 * 에러 처리
 * @param {Error} error - 발생한 에러
 * @param {string} context - 에러 발생 컨텍스트
 */
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
}

// ==========================================================================
// 전역 함수 노출 및 에러 핸들러 설정
// ==========================================================================

// 전역 함수 노출
window.showNotification = showNotification;
window.updateCartCount = updateCartCount;
window.addToCart = addToCart;
window.quickWasteSorting = quickWasteSorting;
window.quickSharing = quickSharing;
window.quickMarket = quickMarket;
window.quickCommunity = quickCommunity;
window.createSharing = createSharing;
window.editProfile = editProfile;

// 전역 에러 핸들러
window.addEventListener('error', (e) => {
    handleError(e.error, 'Global error');
});

// 프로미스 거부 핸들러
window.addEventListener('unhandledrejection', (e) => {
    handleError(new Error(e.reason), 'Unhandled promise rejection');
});

// ==========================================================================
// CSS 애니메이션 추가 (동적으로)
// ==========================================================================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInLeft {
        from {
            transform: translateX(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            transform: translateY(30px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .notification {
        animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .unified-card:hover {
        animation: pulse 0.6s ease-in-out;
    }
`;
document.head.appendChild(style);

console.log('🌱 GreenCycle 개선된 마이페이지 JavaScript가 로드되었습니다.');