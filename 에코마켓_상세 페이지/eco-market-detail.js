/**
 * ==========================================================================
 * 상품 상세 페이지 JavaScript (메인 기능)
 * 이미지 갤러리, 장바구니 기능, 모달 관리 등
 * 외부 레이아웃과의 충돌 방지를 위해 선택자 수정
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
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 로그인 상태 확인
    checkLoginStatus();
    
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
        // 데이터가 로드될 때까지 재시도
        setTimeout(initializeImageGallery, 1000);
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
    if (imageModal && productImages.length > 0) {
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateModalImage();
        updateImageNavigation();
        console.log('🖼️ 이미지 모달 열기');
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
    
    if (modalMainImage && productImages[currentImageIndex]) {
        const img = modalMainImage.querySelector('img');
        if (img) {
            img.src = productImages[currentImageIndex];
            img.style.display = 'block';
            img.alt = `상품 이미지 ${currentImageIndex + 1}`;
        } else {
            modalMainImage.innerHTML = `<img src="${productImages[currentImageIndex]}" alt="상품 이미지 ${currentImageIndex + 1}" style="width: 100%; height: 100%; object-fit: contain;">`;
        }
    }
    
    if (imageCounter) {
        imageCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    }
}

function showPreviousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
        updateModalImage();
        updateImageNavigation();
        
        // 메인 이미지도 업데이트
        if (window.changeMainImage) {
            window.changeMainImage(currentImageIndex, productImages);
            window.updateThumbnailActive(currentImageIndex);
        }
        
        console.log('⬅️ 이전 이미지:', currentImageIndex + 1);
    }
}

function showNextImage() {
    if (currentImageIndex < productImages.length - 1) {
        currentImageIndex++;
        updateModalImage();
        updateImageNavigation();
        
        // 메인 이미지도 업데이트
        if (window.changeMainImage) {
            window.changeMainImage(currentImageIndex, productImages);
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
    if (nextImageBtn) {
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
   장바구니 기능
   ========================================================================== */

function loadCartFromStorage() {
    try {
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
        const itemId = document.getElementById('itemId')?.value;
        const productTitle = document.getElementById('productTitle')?.textContent;
        const productPrice = document.getElementById('currentPrice')?.textContent;
        const stockNumber = document.getElementById('stockNumber')?.textContent;
        
        if (!itemId || !productTitle) {
            showNotification('상품 정보를 불러오는 중입니다...', 'warning');
            return;
        }
        
        // 재고 확인
        const stock = parseInt(stockNumber?.replace(/[^0-9]/g, '') || '0');
        if (stock <= 0) {
            showNotification('재고가 부족합니다.', 'error');
            return;
        }
        
        // 중복 확인
        const existingItem = cartItems.find(item => item.id === itemId);
        if (existingItem) {
            showNotification('이미 장바구니에 담긴 상품입니다! 🛒', 'warning');
            return;
        }
        
        // 장바구니에 추가
        const cartItem = {
            id: itemId,
            title: productTitle,
            price: productPrice,
            addedAt: new Date().toISOString()
        };
        
        cartItems.push(cartItem);
        saveCartToStorage();
        
        // 버튼 애니메이션
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.classList.add('animate');
            setTimeout(() => cartBtn.classList.remove('animate'), 600);
        }
        
        showNotification(`🛒 장바구니에 담았습니다!\n"${productTitle}"`, 'cart');
        console.log('🛒 장바구니 추가:', cartItem);
        
    } catch (error) {
        console.error('❌ 장바구니 추가 실패:', error);
        showNotification('장바구니 추가 중 오류가 발생했습니다.', 'error');
    }
}

async function purchaseProduct() {
    try {
        // 로그인 확인
        if (!isLoggedIn) {
            showNotification('로그인 후 이용해주세요.', 'warning');
            return;
        }
        
        const itemId = document.getElementById('itemId')?.value;
        const productTitle = document.getElementById('productTitle')?.textContent;
        const productPrice = document.getElementById('currentPrice')?.textContent;
        const stockNumber = document.getElementById('stockNumber')?.textContent;
        
        if (!itemId || !productTitle) {
            showNotification('상품 정보를 불러오는 중입니다...', 'warning');
            return;
        }
        
        // 재고 확인
        const stock = parseInt(stockNumber?.replace(/[^0-9]/g, '') || '0');
        if (stock <= 0) {
            showNotification('재고가 부족합니다.', 'error');
            return;
        }
        
        const confirmPurchase = confirm(`${productTitle}\n가격: ${productPrice}\n\n구매하시겠습니까?`);
        
        if (confirmPurchase) {
            showNotification('구매 절차를 진행합니다...', 'info');
            console.log('💰 구매 진행:', productTitle);
            
            // TODO: 실제 결제 페이지로 이동 또는 API 호출
            setTimeout(() => {
                showNotification('구매가 완료되었습니다!', 'success');
            }, 2000);
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
    const isLoggedInFromServer = actionButtons?.getAttribute('data-logged-in') === 'true';
    
    if (isLoggedInFromServer) {
        isLoggedIn = true;
        console.log('✅ 로그인 상태 확인됨');
    } else {
        isLoggedIn = false;
        console.log('ℹ️ 비로그인 상태');
    }
    
    updateActionButtons();
}

function updateActionButtons() {
    const cartBtn = document.getElementById('cartBtn');
    const buyBtn = document.getElementById('buyBtn');
    const ecoBuyBtn = document.getElementById('ecoBuyBtn');
    
    if (!isLoggedIn) {
        // 비로그인 시 버튼 클릭 시 로그인 페이지로 이동
        [cartBtn, buyBtn, ecoBuyBtn].forEach(btn => {
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
    if (cartBtn) {
        cartBtn.addEventListener('click', addToCart);
    }
    
    // 구매하기 버튼
    const buyBtn = document.getElementById('buyBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', purchaseProduct);
    }
    
    // 에코마켓과 구매하기 버튼
    const ecoBuyBtn = document.getElementById('ecoBuyBtn');
    if (ecoBuyBtn) {
        ecoBuyBtn.addEventListener('click', purchaseProduct);
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
    const title = document.getElementById('productTitle')?.textContent || '상품 정보';
    
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
            if (notification.parentNode) {
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

// 전역 함수로 등록
window.showNotification = showNotification;
window.addToCart = addToCart;
window.purchaseProduct = purchaseProduct;
window.openImageModal = openImageModal;
window.closeImageModalHandler = closeImageModalHandler;
window.handleShare = handleShare;

// 공유 함수 (HTML에서 직접 호출)
window.shareProduct = function(type) {
    handleShare({ target: { getAttribute: () => type } });
};

console.log('✅ 상품 상세 페이지 메인 스크립트 로딩 완료!');
console.log('='.repeat(60));
console.log('🔧 개발자 도구 명령어:');
console.log('• showNotification("메시지", "타입") - 알림 표시');
console.log('• addToCart() - 장바구니에 추가');
console.log('• purchaseProduct() - 상품 구매');
console.log('• openImageModal() - 이미지 모달 열기');
console.log('='.repeat(60));