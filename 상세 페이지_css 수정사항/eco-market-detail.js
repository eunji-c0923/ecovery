/**
 * ==========================================================================
 * 상품 상세 페이지 JavaScript (메인 기능)
 * 이미지 갤러리, 장바구니 기능, 모달 관리 등
 * 외부 레이아웃과의 충돌 방지를 위해 선택자 수정
 * @history
 *  - 250801 | sehui | 주문 수량 유효성 검사 JS 코드 추가
 *  - 250801 | sehui | 구매하기 purchaseProduct() 함수 수정
 *  - 250801 | sehui | 에코마켓과 구매하기 버튼 제거
 *  - 250801 | sehui | 주문 수량 오류 메시지 위치 수정
 *  - 250801 | sehui | 주요 오류 수정 및 안정성 개선
 * ==========================================================================
 */

/* ==========================================================================
   전역 변수 및 설정
   ========================================================================== */

// 현재 상품 데이터 (백엔드에서 로드됨)
let currentProduct = null;

// 이미지 관련 변수 (백엔드 데이터와 연동)
let currentImageIndex = 0;
let productImages = [];

// 장바구니 관련 변수
let cartItems = [];

// 로그인 상태 관리
let isLoggedIn = false;
let currentUser = null;

/* ==========================================================================
   페이지 초기화
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 상품 상세 페이지 메인 기능 로딩 시작...');
    
    // 기본 초기화
    initializePage();
    
    // 장바구니 데이터 로드
    loadCartFromStorage();

    // 로그인 상태 확인
    checkLoginStatus();

    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 실시간 유효성 검사 설정
    setupRealtimeValidation();

    console.log('✅ 상품 상세 페이지 메인 기능 로딩 완료!');
});

function initializePage() {
    console.log('⚙️ 페이지 기본 설정 초기화...');
    
    // 모바일 환경에서의 터치 이벤트 처리
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // 페이지 로드 완료 후 이미지 갤러리 초기화
    setTimeout(() => {
        initializeImageGallery();
    }, 500);
}

/* ==========================================================================
   이미지 갤러리 관리 (백엔드 데이터와 연동)
   ========================================================================== */

function initializeImageGallery() {
    // productImages는 백엔드에서 로드된 데이터 사용
    if (window.productImages && window.productImages.length > 0) {
        productImages = window.productImages;
        currentImageIndex = window.currentImageIndex || 0;
        
        setupImageEvents();
        console.log('🖼️ 이미지 갤러리 초기화 완료:', productImages.length + '개 이미지');
    } else {
        console.log('ℹ️ 이미지 데이터 대기 중...');
        // 데이터가 로드될 때까지 재시도 (최대 10회)
        let retryCount = 0;
        const maxRetries = 10;
        
        const retryInterval = setInterval(() => {
            retryCount++;
            if (window.productImages && window.productImages.length > 0) {
                productImages = window.productImages;
                currentImageIndex = window.currentImageIndex || 0;
                setupImageEvents();
                console.log('🖼️ 이미지 갤러리 초기화 완료:', productImages.length + '개 이미지');
                clearInterval(retryInterval);
            } else if (retryCount >= maxRetries) {
                console.warn('⚠️ 이미지 데이터 로드 시간 초과');
                clearInterval(retryInterval);
            }
        }, 1000);
    }
}

function setupImageEvents() {
    // 이미지 확대 버튼 이벤트
    const imageZoomBtn = document.getElementById('imageZoomBtn');
    if (imageZoomBtn) {
        imageZoomBtn.addEventListener('click', openImageModal);
    }
    
    // 메인 이미지 클릭 시 확대
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.addEventListener('click', openImageModal);
        mainImage.style.cursor = 'zoom-in';
    }
    
    // 모달 관련 이벤트
    setupModalEvents();
}

function setupModalEvents() {
    // 모달 닫기 버튼
    const closeImageModal = document.getElementById('closeImageModal');
    if (closeImageModal) {
        closeImageModal.addEventListener('click', closeImageModalHandler);
    }
    
    // 이미지 네비게이션 버튼
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    
    if (prevImageBtn) {
        prevImageBtn.addEventListener('click', showPreviousImage);
    }
    
    if (nextImageBtn) {
        nextImageBtn.addEventListener('click', showNextImage);
    }
    
    // 모달 외부 클릭 시 닫기
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                closeImageModalHandler();
            }
        });
    }
    
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/* ==========================================================================
   이미지 모달 기능
   ========================================================================== */

function openImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal && productImages && productImages.length > 0) {
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateModalImage();
        updateImageNavigation();
        console.log('🖼️ 이미지 모달 열기');
    } else {
        console.warn('⚠️ 이미지 모달을 열 수 없습니다. 이미지 데이터를 확인하세요.');
    }
}

function closeImageModalHandler() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('🖼️ 이미지 모달 닫기');
    }
}

function updateModalImage() {
    const modalMainImage = document.getElementById('modalMainImage');
    const imageCounter = document.getElementById('imageCounter');
    
    if (modalMainImage && productImages && productImages[currentImageIndex]) {
        const img = modalMainImage.querySelector('img');
        if (img) {
            img.src = productImages[currentImageIndex];
            img.style.display = 'block';
            img.alt = `상품 이미지 ${currentImageIndex + 1}`;
        } else {
            modalMainImage.innerHTML = `<img src="${productImages[currentImageIndex]}" alt="상품 이미지 ${currentImageIndex + 1}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
    }
    
    if (imageCounter && productImages) {
        imageCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    }
}

function showPreviousImage() {
    if (productImages && currentImageIndex > 0) {
        currentImageIndex--;
        updateModalImage();
        updateImageNavigation();
        
        // 메인 이미지도 업데이트
        if (window.changeMainImage && typeof window.changeMainImage === 'function') {
            window.changeMainImage(currentImageIndex, productImages);
        }
        if (window.updateThumbnailActive && typeof window.updateThumbnailActive === 'function') {
            window.updateThumbnailActive(currentImageIndex);
        }
        
        console.log('⬅️ 이전 이미지:', currentImageIndex + 1);
    }
}

function showNextImage() {
    if (productImages && currentImageIndex < productImages.length - 1) {
        currentImageIndex++;
        updateModalImage();
        updateImageNavigation();
        
        // 메인 이미지도 업데이트
        if (window.changeMainImage && typeof window.changeMainImage === 'function') {
            window.changeMainImage(currentImageIndex, productImages);
        }
        if (window.updateThumbnailActive && typeof window.updateThumbnailActive === 'function') {
            window.updateThumbnailActive(currentImageIndex);
        }
        
        console.log('➡️ 다음 이미지:', currentImageIndex + 1);
    }
}

function updateImageNavigation() {
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    
    if (prevImageBtn) {
        prevImageBtn.disabled = currentImageIndex === 0;
    }
    if (nextImageBtn && productImages) {
        nextImageBtn.disabled = currentImageIndex === productImages.length - 1;
    }
}

function handleKeyboardNavigation(e) {
    const imageModal = document.getElementById('imageModal');
    if (imageModal && imageModal.classList.contains('show')) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                showPreviousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showNextImage();
                break;
            case 'Escape':
                e.preventDefault();
                closeImageModalHandler();
                break;
        }
    }
}

/* ==========================================================================
   폼 유효성 검사 함수
   ========================================================================== */

// 실시간 유효성 검사 설정
function setupRealtimeValidation() {
    const inputs = document.querySelectorAll('.form-input, .form-select');

    inputs.forEach(function(input) {
        // 포커스를 잃었을 때
        input.addEventListener('blur', function() {
            validateField(input);
        });

        // 내용이 변경될 때
        input.addEventListener('input', function() {
            if (input.classList.contains('error') && input.value.trim()) {
                clearFieldError(input);
                input.classList.add('success');
            }
        });
    });
    
    // 주문 수량 입력창에 실시간 검증 추가
    const orderInput = document.getElementById('orderNumber');
    if (orderInput) {
        orderInput.addEventListener('input', function() {
            // 숫자만 입력 허용
            this.value = this.value.replace(/[^0-9]/g, '');
            
            // 실시간 유효성 검사
            if (this.value && parseInt(this.value) > 0) {
                validateOrderQuantity();
            }
        });
    }
}

// 개별 필드 유효성 검사
function validateField(field) {
    if (!field) return false;
    
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');

    if (isRequired && !value) {
        showFieldError(field, '필수 입력 항목입니다.');
        return false;
    } else if (value) {
        clearFieldError(field);
        field.classList.add('success');
        return true;
    }

    return true;
}

// 필드 에러 표시
function showFieldError(field, message) {
    if (!field) return;
    
    field.classList.add('error');
    field.classList.remove('success');

    // 기존 에러 메시지 제거
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // 새 에러 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // 부모 노드에 추가
    if (field.parentNode) {
        field.parentNode.appendChild(errorDiv);
    }
}

// 필드 에러 제거
function clearFieldError(field) {
    if (!field) return;
    
    field.classList.remove('error');

    const errorMessage = field.parentNode ? field.parentNode.querySelector('.error-message') : null;
    if (errorMessage) {
        errorMessage.remove();
    }
}

// 주문 수량 검증 (재고 수량 초과 여부) - 오류 메시지 위치 수정
function validateOrderQuantity() {
    const orderInput = document.getElementById('orderNumber');
    const stockNumberElement = document.getElementById('stockNumber');
    
    if (!orderInput || !stockNumberElement) {
        console.warn('⚠️ 주문 수량 또는 재고 수량 요소를 찾을 수 없습니다.');
        return false;
    }
    
    const stockText = stockNumberElement.textContent || '0';
    const stock = parseInt(stockText.replace(/[^0-9]/g, '')) || 0;
    const value = parseInt(orderInput.value) || 0;

    // 기존 에러 메시지 먼저 제거
    clearOrderError(orderInput);

    if (value < 1) {
        showOrderError(orderInput, "1개 이상 입력해주세요.");
        return false;
    }

    if (value > stock) {
        showOrderError(orderInput, "재고 수량을 초과할 수 없습니다.");
        return false;
    }

    // 성공 시 에러 메시지 제거
    clearOrderError(orderInput);
    orderInput.classList.add('success');
    return true;
}

// 주문 수량 전용 에러 표시 함수 - 올바른 위치에 에러 메시지 표시
function showOrderError(field, message) {
    if (!field) return;
    
    field.classList.add('error');
    field.classList.remove('success');

    // .form-input-section 컨테이너 찾기
    const inputSection = field.closest('.form-input-section');
    if (!inputSection) {
        console.warn('⚠️ .form-input-section 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // stockError ID를 가진 요소 찾기
    const existingError = inputSection.querySelector('#stockError');
    if (existingError) {
        existingError.textContent = message;
        existingError.style.display = 'block';
    } else {
        console.warn('⚠️ #stockError 요소를 찾을 수 없습니다.');
    }
}

// 주문 수량 전용 에러 제거 함수
function clearOrderError(field) {
    if (!field) return;
    
    field.classList.remove('error');

    // .form-input-section 컨테이너 찾기
    const inputSection = field.closest('.form-input-section');
    if (!inputSection) return;

    // stockError 요소 숨기기
    const errorElement = inputSection.querySelector('#stockError');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// 전체 폼 유효성 검사
function validateForm() {
    let isValid = true;
    const requiredFields = ['orderNumber'];

    requiredFields.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });

    // 주문 수량 유효성 체크
    if (!validateOrderQuantity()) {
        isValid = false;
    }

    return isValid;
}

/* ==========================================================================
   장바구니 기능
   ========================================================================== */

function loadCartFromStorage() {
    try {
        // localStorage 사용 가능 여부 확인
        if (typeof Storage === "undefined") {
            console.warn('⚠️ 브라우저가 localStorage를 지원하지 않습니다.');
            cartItems = [];
            return;
        }
        
        const savedCart = localStorage.getItem('ecomarket_cart');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            console.log('🛒 장바구니 로드 완료:', cartItems.length + '개 상품');
        } else {
            cartItems = [];
        }
    } catch (error) {
        console.error('❌ 장바구니 로드 실패:', error);
        cartItems = [];
    }
}

function saveCartToStorage() {
    try {
        if (typeof Storage === "undefined") {
            console.warn('⚠️ 브라우저가 localStorage를 지원하지 않습니다.');
            return;
        }
        
        localStorage.setItem('ecomarket_cart', JSON.stringify(cartItems));
        console.log('💾 장바구니 저장 완료');
    } catch (error) {
        console.error('❌ 장바구니 저장 실패:', error);
    }
}

async function addToCart() {
    try {
        // 로그인 확인
        if (!isLoggedIn) {
            showNotification('로그인 후 이용해주세요.', 'warning');
            return;
        }
        
        // 상품 정보 확인
        const itemId = document.getElementById('itemId');
        const productTitle = document.getElementById('productTitle');
        const stockNumber = document.getElementById('stockNumber');
        const orderNumber = document.getElementById('orderNumber');
        
        if (!itemId || !itemId.value) {
            showNotification('상품 정보를 불러오는 중입니다...', 'warning');
            return;
        }
        
        if (!productTitle || !productTitle.textContent) {
            showNotification('상품 정보를 불러오는 중입니다...', 'warning');
            return;
        }
        
        if (!orderNumber || !orderNumber.value) {
            showNotification('주문 수량을 입력해주세요.', 'warning');
            return;
        }
        
        // 재고 확인
        const stockText = stockNumber ? stockNumber.textContent : '0';
        const stock = parseInt(stockText.replace(/[^0-9]/g, '')) || 0;
        if (stock <= 0) {
            showNotification('재고가 부족합니다.', 'error');
            return;
        }

        // 폼 유효성 검사
        if (!validateForm()) {
            showNotification("주문 수량을 다시 확인해주세요.", 'error');
            return;
        }
        
        // 중복 확인
        const existingItem = cartItems.find(item => item.id === itemId.value);
        if (existingItem) {
            showNotification('이미 장바구니에 담긴 상품입니다! 🛒', 'warning');
            return;
        }
        
        // 장바구니에 추가 - 서버 요청
        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                itemId: itemId.value,
                count: orderNumber.value
            })
        });

        if (response.ok) {
            const result = await response.text();
            showNotification(`🛒 장바구니에 담았습니다!\n"${productTitle.textContent}"`, 'cart');
            console.log('🛒 장바구니 추가 : ', result);
            
            // 로컬 스토리지에도 추가
            cartItems.push({
                id: itemId.value,
                title: productTitle.textContent,
                count: orderNumber.value
            });
            saveCartToStorage();
        } else {
            const errText = await response.text();
            throw new Error(errText || '서버 오류');
        }
        
        // 버튼 애니메이션
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.classList.add('animate');
            setTimeout(() => cartBtn.classList.remove('animate'), 600);
        }
        
    } catch (error) {
        console.error('❌ 장바구니 추가 실패:', error);
        showNotification('장바구니 추가 중 오류가 발생했습니다.', 'error');
    }
}

/* ==========================================================================
   구매하기 기능
   ========================================================================== */

async function purchaseProduct(e) {
    if (e) {
        e.preventDefault();
    }

    console.log("구매하기 버튼 클릭 이벤트 동작...");

    try {
        // 로그인 확인
        if (!isLoggedIn) {
            showNotification('로그인 후 이용해주세요.', 'warning');
            return;
        }

        const orderForm = document.getElementById('form-body');
        const itemId = document.getElementById('itemId');
        const productTitle = document.getElementById('productTitle');
        const productPrice = document.getElementById('currentPrice');
        const stockNumber = document.getElementById('stockNumber');
        
        if (!itemId || !itemId.value || !productTitle || !productTitle.textContent) {
            showNotification('상품 정보를 불러오는 중입니다...', 'warning');
            return;
        }
        
        // 재고 확인
        const stockText = stockNumber ? stockNumber.textContent : '0';
        const stock = parseInt(stockText.replace(/[^0-9]/g, '')) || 0;
        if (stock <= 0) {
            showNotification('재고가 부족합니다.', 'error');
            return;
        }

        // 폼 유효성 검사
        if (!validateForm()) {
            showNotification("주문 수량을 다시 확인해주세요.", 'error');
            return;
        }
        
        const priceText = productPrice ? productPrice.textContent : '가격 정보 없음';
        const confirmPurchase = confirm(`${productTitle.textContent}\n가격: ${priceText}\n\n구매하시겠습니까?`);

        if (confirmPurchase) {
            showNotification('구매 절차를 진행합니다...', 'info');
            console.log('💰 구매 진행:', productTitle.textContent);
            
            // 실제 결제 페이지로 이동
            if (orderForm) {
                orderForm.method = "POST";
                orderForm.action = "/order/prepare";
                orderForm.submit();
            } else {
                console.error('❌ 주문 폼을 찾을 수 없습니다.');
                showNotification('주문 처리 중 오류가 발생했습니다.', 'error');
            }
        }
        
    } catch (error) {
        console.error('❌ 구매 처리 실패:', error);
        showNotification('구매 처리 중 오류가 발생했습니다.', 'error');
    }
}

/* ==========================================================================
   로그인 상태 관리
   ========================================================================== */

function checkLoginStatus() {
    // 서버사이드에서 전달된 로그인 정보 확인
    const actionButtons = document.getElementById('actionButtons');
    if (actionButtons) {
        const isLoggedInFromServer = actionButtons.getAttribute('data-logged-in') === 'true';
        
        if (isLoggedInFromServer) {
            isLoggedIn = true;
            console.log('✅ 로그인 상태 확인됨');
        } else {
            isLoggedIn = false;
            console.log('ℹ️ 비로그인 상태');
        }
    } else {
        console.warn('⚠️ actionButtons 요소를 찾을 수 없습니다.');
        isLoggedIn = false;
    }
    
    updateActionButtons();
}

function updateActionButtons() {
    const cartBtn = document.getElementById('cartBtn');
    const buyBtn = document.getElementById('buyBtn');
    
    if (!isLoggedIn) {
        // 비로그인 시 버튼 클릭 시 로그인 페이지로 이동
        [cartBtn, buyBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showNotification('로그인이 필요한 서비스입니다.', 'warning');
                    setTimeout(() => {
                        window.location.href = '/members/login';
                    }, 1500);
                });
            }
        });
    }
}

/* ==========================================================================
   이벤트 리스너 설정
   ========================================================================== */

function setupEventListeners() {
    console.log('🔧 이벤트 리스너 설정...');
    
    // 장바구니 버튼
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn && isLoggedIn) {
        cartBtn.addEventListener('click', addToCart);
    }
    
    // 구매하기 버튼
    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn && isLoggedIn) {
        buyBtn.addEventListener('click', purchaseProduct);
    }
    
    // 공유 버튼들
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(btn => {
        btn.addEventListener('click', handleShare);
    });
    
    // 상품 메뉴 (관리자용)
    const menuToggle = document.getElementById('menuToggle');
    const menuDropdown = document.getElementById('menuDropdown');
    
    if (menuToggle && menuDropdown) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
        });
        
        // 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', () => {
            menuDropdown.classList.remove('show');
        });
    }
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

/* ==========================================================================
   공유 기능
   ========================================================================== */

function handleShare(e) {
    const shareType = e.target.getAttribute('data-type');
    const currentUrl = window.location.href;
    const productTitle = document.getElementById('productTitle');
    const title = productTitle ? productTitle.textContent : '상품 정보';
    
    console.log('📤 공유하기:', shareType);
    
    switch (shareType) {
        case 'link':
            if (navigator.clipboard) {
                navigator.clipboard.writeText(currentUrl).then(() => {
                    showNotification('링크가 복사되었습니다! 🔗', 'success');
                }).catch(() => {
                    showNotification('링크 복사에 실패했습니다.', 'error');
                });
            } else {
                // 클립보드 API를 지원하지 않는 브라우저
                showNotification('브라우저에서 지원하지 않는 기능입니다.', 'warning');
            }
            break;
            
        case 'kakao':
            // 카카오 공유 API 사용 (실제 구현시 카카오 SDK 필요)
            showNotification('카카오톡으로 공유됩니다...', 'info');
            console.log('💬 카카오톡 공유:', { url: currentUrl, title });
            break;
            
        case 'facebook':
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'twitter':
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
            break;
            
        default:
            console.warn('지원하지 않는 공유 타입:', shareType);
    }
}

/* ==========================================================================
   유틸리티 함수
   ========================================================================== */

function showNotification(message, type = 'info') {
    console.log('🔔 알림:', message, '(' + type + ')');
    
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // 멀티라인 메시지 처리
    const lines = message.split('\n');
    if (lines.length > 1) {
        lines.forEach((line, index) => {
            const p = document.createElement('p');
            p.textContent = line;
            p.style.margin = index === 0 ? '0 0 5px 0' : '0';
            notification.appendChild(p);
        });
    } else {
        notification.textContent = message;
    }
    
    // 스타일 적용
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
        font-size: 14px;
        color: white;
        background: ${getNotificationColor(type)};
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션 표시
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 자동 제거
    const displayTime = type === 'cart' ? 5000 : 3000;
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, displayTime);
}

function getNotificationColor(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'cart': '#8e44ad',
        'info': '#3498db'
    };
    return colors[type] || colors.info;
}

/* ==========================================================================
   전역 함수 등록 (개발자 도구 및 다른 스크립트에서 사용)
   ========================================================================== */

// 전역 함수로 등록 - 안전하게 등록
if (typeof window !== 'undefined') {
    window.showNotification = showNotification;
    window.addToCart = addToCart;
    window.purchaseProduct = purchaseProduct;
    window.openImageModal = openImageModal;
    window.closeImageModalHandler = closeImageModalHandler;
    window.handleShare = handleShare;
    window.validateForm = validateForm;
    window.validateOrderQuantity = validateOrderQuantity;

    // 공유 함수 (HTML에서 직접 호출)
    window.shareProduct = function(type) {
        handleShare({ target: { getAttribute: () => type } });
    };
}

console.log('✅ 상품 상세 페이지 메인 스크립트 로딩 완료!');
console.log('='.repeat(60));
console.log('🔧 개발자 도구 명령어:');
console.log('• showNotification("메시지", "타입") - 알림 표시');
console.log('• addToCart() - 장바구니에 추가');
console.log('• purchaseProduct() - 상품 구매');
console.log('• openImageModal() - 이미지 모달 열기');
console.log('• validateForm() - 폼 유효성 검사');
console.log('='.repeat(60));