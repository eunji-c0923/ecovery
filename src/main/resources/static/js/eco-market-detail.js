/**
 * ==========================================================================
 * 상품 상세 페이지 JavaScript
 * 상품 정보 표시, 이미지 갤러리, 댓글 시스템, 장바구니 기능, 로그인 관리 등
 * ==========================================================================
 */

/* ==========================================================================
   전역 변수 및 설정
   ========================================================================== */

// 현재 상품 데이터
let currentProduct = null;

// 댓글 관련 변수
let comments = [];
let currentCommentPage = 1;
const commentsPerPage = 10;

// 이미지 관련 변수
let currentImageIndex = 0;
let productImages = [];

// 모달 관련 변수
let currentReportCommentId = null;

// 로그인 상태 관리
let isLoggedIn = false;
let currentUser = null;

// 장바구니 관련 변수
let cartItems = [];

/* ==========================================================================
   DOM 요소 참조
   ========================================================================== */

// 헤더 관련 요소
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// 로그인 관련 요소
const guestButtons = document.getElementById('guestButtons');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// 상품 정보 요소들
const productTitle = document.getElementById('productTitle');
const productCategory = document.getElementById('productCategory');
const productViews = document.getElementById('productViews');
const productTime = document.getElementById('productTime');
const currentPrice = document.getElementById('currentPrice');
const originalPrice = document.getElementById('originalPrice');
const discountRate = document.getElementById('discountRate');
const conditionStars = document.getElementById('conditionStars');
const conditionText = document.getElementById('conditionText');
const transactionLocation = document.getElementById('transactionLocation');
const productDescription = document.getElementById('productDescription');

// 상품 메뉴 관련 요소
const productMenu = document.getElementById('productMenu');
const menuToggle = document.getElementById('menuToggle');
const menuDropdown = document.getElementById('menuDropdown');
const editProduct = document.getElementById('editProduct');
const deleteProduct = document.getElementById('deleteProduct');

// 판매자 정보 요소들
const sellerName = document.getElementById('sellerName');
const sellerRating = document.getElementById('sellerRating');
const sellerSales = document.getElementById('sellerSales');

// 이미지 관련 요소들
const mainImage = document.getElementById('mainImage');
const thumbnailList = document.getElementById('thumbnailList');
const imageZoomBtn = document.getElementById('imageZoomBtn');

// 액션 버튼들
const wishlistBtn = document.getElementById('wishlistBtn');
const cartBtn = document.getElementById('cartBtn');
const buyBtn = document.getElementById('buyBtn');
const wishlistBtnMobile = document.getElementById('wishlistBtnMobile');
const cartBtnMobile = document.getElementById('cartBtnMobile');
const buyBtnMobile = document.getElementById('buyBtnMobile');
const wishlistCount = document.getElementById('wishlistCount');

// 댓글 관련 요소들
const commentForm = document.getElementById('commentForm');
const commentInput = document.getElementById('commentInput');
const commentsList = document.getElementById('commentsList');
const commentsCount = document.getElementById('commentsCount');
const commentSort = document.getElementById('commentSort');
const loadMoreComments = document.getElementById('loadMoreComments');

// 모달 관련 요소들
const imageModal = document.getElementById('imageModal');
const closeImageModal = document.getElementById('closeImageModal');
const modalMainImage = document.getElementById('modalMainImage');
const imageCounter = document.getElementById('imageCounter');
const prevImageBtn = document.getElementById('prevImageBtn');
const nextImageBtn = document.getElementById('nextImageBtn');

const reportModal = document.getElementById('reportModal');
const closeReportModal = document.getElementById('closeReportModal');
const reportForm = document.getElementById('reportForm');
const cancelReport = document.getElementById('cancelReport');

// 기타 요소들
const relatedProductsGrid = document.getElementById('relatedProductsGrid');
const bottomActionBar = document.getElementById('bottomActionBar');

/* ==========================================================================
   페이지 초기화
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 상품 상세 페이지 로딩 시작...');
    
    initializePage();
    checkLoginStatus();
    loadProductData();
    loadComments();
    loadRelatedProducts();
    setupEventListeners();
    setupImageGallery();
    loadCartFromStorage();
    
    console.log('✅ 상품 상세 페이지 로딩 완료!');
});

function initializePage() {
    console.log('⚙️ 페이지 기본 설정 초기화...');
    
    // 헤더 스크롤 효과 설정
    window.addEventListener('scroll', handleHeaderScroll);
    
    // 모바일 햄버거 메뉴 설정
    hamburger?.addEventListener('click', toggleMobileMenu);
    
    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // URL 파라미터에서 상품 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('📦 상품 ID:', productId || '파라미터 없음');
    
    updateBreadcrumb();
}

/* ==========================================================================
   로그인 상태 관리
   ========================================================================== */

function checkLoginStatus() {
    console.log('🔐 로그인 상태 확인 중...');
    
    // TODO: 실제 로그인 상태를 서버에서 확인
    // const response = await fetch('/api/auth/status');
    // const userData = await response.json();
    
    const savedLoginStatus = localStorage.getItem('demoLoginStatus');
    
    if (savedLoginStatus === 'true') {
        // TODO: 실제 사용자 정보를 서버에서 가져오기
        isLoggedIn = true;
        showUserMenu();
        console.log('✅ 로그인 상태');
    } else {
        isLoggedIn = false;
        currentUser = null;
        showGuestButtons();
        console.log('❌ 비로그인 상태');
    }
    
    updateProductMenu();
}

function showGuestButtons() {
    if (guestButtons) guestButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

function showUserMenu() {
    if (guestButtons) guestButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName && currentUser) {
        userName.textContent = currentUser.name + '님';
    }
}

function updateProductMenu() {
    if (!productMenu) return;
    
    // TODO: 실제 판매자 확인 로직
    const isOwner = isLoggedIn && currentUser && currentProduct && 
                   currentUser.id === currentProduct.sellerId;
    
    if (isOwner) {
        productMenu.style.display = 'block';
        console.log('🛠️ 상품 메뉴 표시 - 판매자 본인');
    } else {
        productMenu.style.display = 'none';
        console.log('🚫 상품 메뉴 숨김');
    }
}

function toggleDemoLogin() {
    if (isLoggedIn) {
        isLoggedIn = false;
        currentUser = null;
        localStorage.setItem('demoLoginStatus', 'false');
        showGuestButtons();
        showNotification('로그아웃되었습니다.', 'info');
        console.log('🚪 로그아웃');
    } else {
        isLoggedIn = true;
        // TODO: 실제 사용자 데이터로 교체
        currentUser = { id: "user456", name: "김철수" };
        localStorage.setItem('demoLoginStatus', 'true');
        showUserMenu();
        showNotification('로그인되었습니다! 👋', 'success');
        console.log('🚪 로그인:', currentUser.name);
    }
    updateProductMenu();
}

/* ==========================================================================
   헤더 및 네비게이션 관리
   ========================================================================== */

function handleHeaderScroll() {
    if (window.scrollY > 100) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
}

function toggleMobileMenu() {
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('active');
}

function closeMobileMenu() {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
}

function updateBreadcrumb() {
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbCategory && currentProduct) {
        breadcrumbCategory.textContent = currentProduct.categoryName;
    }
}

/* ==========================================================================
   상품 데이터 로드 및 표시
   ========================================================================== */

async function loadProductData() {
    console.log('📦 상품 데이터 로딩...');
    
    try {
        // TODO: 실제 API에서 상품 데이터 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (!productId) {
            throw new Error('상품 ID가 없습니다.');
        }
        
        // const response = await fetch(`/api/products/${productId}`);
        // if (!response.ok) throw new Error('상품을 찾을 수 없습니다.');
        // currentProduct = await response.json();
        
        console.log('❌ 백엔드 API 연결 필요 - 임시로 빈 데이터 사용');
        currentProduct = null;
        
        if (currentProduct) {
            displayProductInfo();
            incrementViewCount();
            updateProductMenu();
            console.log('✅ 상품 데이터 로딩 완료:', currentProduct.title);
        } else {
            showNotification('상품 정보를 불러올 수 없습니다.', 'error');
        }
        
    } catch (error) {
        console.error('상품 데이터 로드 오류:', error);
        showNotification('상품 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

function displayProductInfo() {
    if (!currentProduct) return;
    
    console.log('🎨 상품 정보 화면에 표시...');
    
    // 기본 정보 설정
    if (productTitle) productTitle.textContent = currentProduct.title;
    if (productCategory) productCategory.textContent = currentProduct.categoryName;
    if (productViews) productViews.textContent = currentProduct.views;
    if (productTime) productTime.textContent = currentProduct.time;
    if (transactionLocation) transactionLocation.textContent = `📍 ${currentProduct.location}`;
    
    // 가격 정보 설정
    if (currentPrice) currentPrice.textContent = formatPrice(currentProduct.price) + '원';
    if (originalPrice && currentProduct.originalPrice) {
        originalPrice.textContent = formatPrice(currentProduct.originalPrice) + '원';
        const discount = Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100);
        if (discountRate) discountRate.textContent = `${discount}% 할인`;
    }
    
    // 상품 상태 설정
    if (conditionStars) {
        conditionStars.textContent = '★'.repeat(currentProduct.conditionRating) + 
                                   '☆'.repeat(5 - currentProduct.conditionRating);
    }
    if (conditionText) conditionText.textContent = currentProduct.conditionText;
    
    // 상품 설명 설정
    if (productDescription) {
        productDescription.innerHTML = currentProduct.description;
    }
    
    // 판매자 정보 설정
    if (sellerName) sellerName.textContent = currentProduct.seller.name;
    if (sellerRating) sellerRating.textContent = currentProduct.seller.rating + '/5.0';
    if (sellerSales) sellerSales.textContent = currentProduct.seller.sales;
    
    // 관심상품 수 설정
    if (wishlistCount) wishlistCount.textContent = currentProduct.likes;
    
    updateBreadcrumb();
    console.log('✅ 상품 정보 표시 완료');
}

async function incrementViewCount() {
    if (!currentProduct) return;
    
    try {
        // TODO: 실제 조회수 증가 API 호출
        // await fetch(`/api/products/${currentProduct.id}/view`, { method: 'POST' });
        
        currentProduct.views++;
        if (productViews) {
            productViews.textContent = currentProduct.views;
        }
        
        console.log('👁️ 조회수 증가:', currentProduct.views);
    } catch (error) {
        console.error('조회수 증가 오류:', error);
    }
}

/* ==========================================================================
   장바구니 기능 관리
   ========================================================================== */

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
            console.log('🛒 장바구니 로드:', cartItems.length + '개 상품');
        }
    } catch (error) {
        console.error('❌ 장바구니 로드 실패:', error);
        cartItems = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        console.log('💾 장바구니 저장 완료');
    } catch (error) {
        console.error('❌ 장바구니 저장 실패:', error);
    }
}

async function addToCart() {
    if (!currentProduct) {
        showNotification('상품 정보를 불러오는 중입니다...', 'warning');
        return;
    }

    if (currentProduct.status !== 'available') {
        showNotification('현재 판매중이 아닌 상품입니다.', 'error');
        return;
    }

    const existingItem = cartItems.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        showNotification('이미 장바구니에 담긴 상품입니다! 🛒', 'warning');
        console.log('⚠️ 중복 상품:', currentProduct.title);
        return;
    }

    try {
        // TODO: 실제 장바구니 추가 API 호출
        // await fetch('/api/cart', { 
        //     method: 'POST', 
        //     body: JSON.stringify({ productId: currentProduct.id }) 
        // });
        
        const cartItem = {
            id: currentProduct.id,
            title: currentProduct.title,
            price: currentProduct.price,
            originalPrice: currentProduct.originalPrice,
            image: currentProduct.images[0],
            seller: currentProduct.seller.name,
            location: currentProduct.location,
            addedAt: new Date().toISOString()
        };

        cartItems.push(cartItem);
        saveCartToStorage();

        // 버튼 애니메이션 효과
        if (cartBtn) {
            cartBtn.classList.add('animate');
            setTimeout(() => cartBtn.classList.remove('animate'), 600);
        }

        if (cartBtnMobile) {
            cartBtnMobile.classList.add('animate');
            setTimeout(() => cartBtnMobile.classList.remove('animate'), 600);
        }

        showNotification(`🛒 장바구니에 담았습니다!\n"${currentProduct.title}"`, 'cart');
        console.log('🛒 장바구니 추가:', cartItem.title);
        
    } catch (error) {
        console.error('장바구니 추가 오류:', error);
        showNotification('장바구니 추가 중 오류가 발생했습니다.', 'error');
    }
}

function viewCart() {
    console.log('🛒 현재 장바구니:', cartItems);
    if (cartItems.length === 0) {
        showNotification('장바구니가 비어있습니다.', 'info');
    } else {
        const itemNames = cartItems.map(item => item.title).join('\n- ');
        showNotification(`장바구니 상품 (${cartItems.length}개):\n- ${itemNames}`, 'info');
    }
    return cartItems;
}

function clearCart() {
    cartItems = [];
    saveCartToStorage();
    showNotification('장바구니를 비웠습니다.', 'info');
    console.log('🗑️ 장바구니 비움');
}

/* ==========================================================================
   이미지 갤러리 관리
   ========================================================================== */

function setupImageGallery() {
    if (!currentProduct) return;
    
    console.log('🖼️ 이미지 갤러리 설정...');
    
    productImages = currentProduct.images;
    currentImageIndex = 0;
    
    updateMainImage();
    generateThumbnails();
    setupThumbnailEvents();
    
    console.log('✅ 이미지 갤러리 설정 완료');
}

function updateMainImage() {
    if (mainImage && productImages[currentImageIndex]) {
        mainImage.textContent = productImages[currentImageIndex];
    }
    
    if (modalMainImage && productImages[currentImageIndex]) {
        modalMainImage.textContent = productImages[currentImageIndex];
    }
    
    updateImageCounter();
}

function generateThumbnails() {
    if (!thumbnailList) return;
    
    thumbnailList.innerHTML = '';
    
    productImages.forEach((image, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.textContent = image;
        thumbnail.setAttribute('data-index', index);
        thumbnailList.appendChild(thumbnail);
    });
}

function setupThumbnailEvents() {
    if (!thumbnailList) return;
    
    thumbnailList.addEventListener('click', (e) => {
        if (e.target.classList.contains('thumbnail')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            changeImage(index);
        }
    });
}

function changeImage(index) {
    if (index >= 0 && index < productImages.length) {
        currentImageIndex = index;
        updateMainImage();
        updateThumbnailActive();
        console.log('🖼️ 이미지 변경:', currentImageIndex + 1, '/', productImages.length);
    }
}

function updateThumbnailActive() {
    const thumbnails = thumbnailList?.querySelectorAll('.thumbnail');
    thumbnails?.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

function updateImageCounter() {
    if (imageCounter) {
        imageCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    }
}

/* ==========================================================================
   상품 액션 처리
   ========================================================================== */

async function toggleWishlist() {
    if (!currentProduct) return;
    
    try {
        // TODO: 실제 관심상품 토글 API 호출
        // const response = await fetch(`/api/wishlist/${currentProduct.id}`, { method: 'POST' });
        // const result = await response.json();
        
        const isWishlisted = wishlistBtn?.classList.contains('active');
        
        if (isWishlisted) {
            currentProduct.likes--;
            wishlistBtn?.classList.remove('active');
            wishlistBtnMobile?.classList.remove('active');
            
            const heartIcons = document.querySelectorAll('.heart-icon');
            heartIcons.forEach(icon => {
                icon.textContent = '🤍';
                icon.classList.remove('animate');
            });
            
            showNotification('관심상품에서 제거되었습니다.', 'info');
            console.log('💔 관심상품 제거:', currentProduct.title);
        } else {
            currentProduct.likes++;
            wishlistBtn?.classList.add('active');
            wishlistBtnMobile?.classList.add('active');
            
            const heartIcons = document.querySelectorAll('.heart-icon');
            heartIcons.forEach(icon => {
                icon.textContent = '❤️';
                icon.classList.add('animate');
            });
            
            showNotification('관심상품에 추가되었습니다! ❤️', 'success');
            console.log('💖 관심상품 추가:', currentProduct.title);
        }
        
        if (wishlistCount) {
            wishlistCount.textContent = currentProduct.likes;
        }
        
    } catch (error) {
        console.error('관심상품 토글 오류:', error);
        showNotification('관심상품 처리 중 오류가 발생했습니다.', 'error');
    }
}

function purchaseProduct() {
    if (!currentProduct) return;
    
    if (currentProduct.status !== 'available') {
        showNotification('현재 판매중이 아닌 상품입니다.', 'error');
        return;
    }
    
    const confirmPurchase = confirm(`${currentProduct.title}\n가격: ${formatPrice(currentProduct.price)}원\n\n구매하시겠습니까?`);
    
    if (confirmPurchase) {
        showNotification('구매 절차를 진행합니다...', 'info');
        console.log('💰 구매 진행:', currentProduct.title);
        
        // TODO: 실제 결제 페이지로 이동
        setTimeout(() => {
            console.log('🛒 결제 페이지 이동:', currentProduct.id);
            // window.location.href = `payment.html?product=${currentProduct.id}`;
        }, 1000);
    }
}

/* ==========================================================================
   상품 관리 (수정/삭제)
   ========================================================================== */

function toggleProductMenu() {
    if (!menuDropdown) return;
    
    const isShowing = menuDropdown.classList.contains('show');
    
    if (isShowing) {
        menuDropdown.classList.remove('show');
    } else {
        menuDropdown.classList.add('show');
    }
}

function editProductData() {
    if (!currentProduct) return;
    
    showNotification('상품 수정 페이지로 이동합니다...', 'info');
    console.log('✏️ 상품 수정:', currentProduct.title);
    
    // TODO: 실제 상품 수정 페이지로 이동
    setTimeout(() => {
        // window.location.href = `edit-product.html?id=${currentProduct.id}`;
    }, 500);
    
    menuDropdown?.classList.remove('show');
}

function deleteProductData() {
    if (!currentProduct) return;
    
    const confirmDelete = confirm(`"${currentProduct.title}" 상품을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (confirmDelete) {
        showNotification('상품을 삭제하고 있습니다...', 'info');
        console.log('🗑️ 상품 삭제:', currentProduct.title);
        
        // TODO: 실제 서버에 삭제 요청
        setTimeout(() => {
            showNotification('상품이 삭제되었습니다.', 'success');
            
            setTimeout(() => {
                // window.location.href = 'eco-market.html';
            }, 1000);
        }, 1000);
    }
    
    menuDropdown?.classList.remove('show');
}

/* ==========================================================================
   댓글 시스템 관리
   ========================================================================== */

async function loadComments() {
    console.log('💬 댓글 로딩...');
    
    try {
        // TODO: 실제 API에서 댓글 데이터 가져오기
        // const response = await fetch(`/api/products/${currentProduct.id}/comments`);
        // comments = await response.json();
        
        comments = [];
        
        renderComments();
        updateCommentsCount();
        
        console.log('✅ 댓글 로딩 완료:', comments.length + '개');
    } catch (error) {
        console.error('댓글 로드 오류:', error);
        showNotification('댓글을 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

function renderComments() {
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    const startIndex = 0;
    const endIndex = currentCommentPage * commentsPerPage;
    const commentsToShow = comments.slice(startIndex, endIndex);
    
    commentsToShow.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
    
    if (endIndex >= comments.length) {
        loadMoreComments?.style.setProperty('display', 'none');
    } else {
        loadMoreComments?.style.setProperty('display', 'block');
    }
}

function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.setAttribute('data-comment-id', comment.id);
    
    commentDiv.innerHTML = `
        <div class="comment-header">
            <div class="comment-author-info">
                <div class="comment-avatar">${comment.avatar}</div>
                <div class="comment-author-details">
                    <div class="comment-author-name">
                        ${comment.author}
                        ${comment.isSeller ? '<span class="badge badge-verified">판매자</span>' : ''}
                    </div>
                    <div class="comment-time">${comment.time}</div>
                </div>
            </div>
            <div class="comment-actions">
                <button class="comment-action-btn" onclick="likeComment(${comment.id})">
                    👍 ${comment.likes}
                </button>
                <button class="comment-action-btn" onclick="reportComment(${comment.id})">
                    🚨 신고
                </button>
            </div>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-footer">
            <div class="comment-reactions">
                <button class="reaction-btn" onclick="likeComment(${comment.id})">
                    👍 <span>${comment.likes}</span>
                </button>
                <button class="reaction-btn" onclick="toggleReplyForm(${comment.id})">
                    💬 답글
                </button>
            </div>
            <button class="reply-btn" onclick="toggleReplyForm(${comment.id})">답글 달기</button>
        </div>
        ${comment.replies && comment.replies.length > 0 ? createRepliesHtml(comment.replies) : ''}
        <div class="reply-form" id="replyForm${comment.id}" style="display: none;">
            <textarea class="reply-input" placeholder="답글을 입력하세요..." rows="2"></textarea>
            <div class="reply-form-actions">
                <button class="btn-reply-cancel" onclick="toggleReplyForm(${comment.id})">취소</button>
                <button class="btn-reply-submit" onclick="submitReply(${comment.id})">답글 작성</button>
            </div>
        </div>
    `;
    
    return commentDiv;
}

function createRepliesHtml(replies) {
    if (!replies || replies.length === 0) return '';
    
    const repliesHtml = replies.map(reply => `
        <div class="reply-item" data-reply-id="${reply.id}">
            <div class="comment-header">
                <div class="comment-author-info">
                    <div class="comment-avatar">${reply.avatar}</div>
                    <div class="comment-author-details">
                        <div class="comment-author-name">
                            ${reply.author}
                            ${reply.isSeller ? '<span class="badge badge-verified">판매자</span>' : ''}
                        </div>
                        <div class="comment-time">${reply.time}</div>
                    </div>
                </div>
                <div class="comment-actions">
                    <button class="comment-action-btn" onclick="likeReply(${reply.id})">
                        👍 ${reply.likes}
                    </button>
                </div>
            </div>
            <div class="comment-content">${reply.content}</div>
        </div>
    `).join('');
    
    return `<div class="comment-replies">${repliesHtml}</div>`;
}

function updateCommentsCount() {
    if (commentsCount) {
        const totalComments = comments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        commentsCount.textContent = totalComments;
    }
}

/* ==========================================================================
   이벤트 리스너 설정
   ========================================================================== */

function setupEventListeners() {
    console.log('🔧 이벤트 리스너 설정...');
    
    // 로그인/로그아웃 이벤트
    logoutBtn?.addEventListener('click', () => {
        isLoggedIn = false;
        currentUser = null;
        localStorage.setItem('demoLoginStatus', 'false');
        showGuestButtons();
        updateProductMenu();
        showNotification('로그아웃되었습니다.', 'info');
    });
    
    // 상품 메뉴 이벤트
    menuToggle?.addEventListener('click', toggleProductMenu);
    editProduct?.addEventListener('click', editProductData);
    deleteProduct?.addEventListener('click', deleteProductData);
    
    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        if (!productMenu?.contains(e.target)) {
            menuDropdown?.classList.remove('show');
        }
    });
    
    // 액션 버튼 이벤트
    wishlistBtn?.addEventListener('click', toggleWishlist);
    cartBtn?.addEventListener('click', addToCart);
    buyBtn?.addEventListener('click', purchaseProduct);
    
    // 모바일 액션 버튼 이벤트
    wishlistBtnMobile?.addEventListener('click', toggleWishlist);
    cartBtnMobile?.addEventListener('click', addToCart);
    buyBtnMobile?.addEventListener('click', purchaseProduct);
    
    // 이미지 관련 이벤트
    imageZoomBtn?.addEventListener('click', openImageModal);
    mainImage?.addEventListener('click', openImageModal);
    closeImageModal?.addEventListener('click', closeImageModalHandler);
    prevImageBtn?.addEventListener('click', showPreviousImage);
    nextImageBtn?.addEventListener('click', showNextImage);
    
    // 판매자 관련 이벤트
    document.getElementById('sellerProfileBtn')?.addEventListener('click', viewSellerProfile);
    document.getElementById('sellerChatBtn')?.addEventListener('click', startChat);
    
    // 댓글 관련 이벤트
    commentForm?.addEventListener('submit', submitComment);
    commentSort?.addEventListener('change', (e) => sortComments(e.target.value));
    loadMoreComments?.addEventListener('click', loadMoreCommentsHandler);
    
    // 신고 모달 이벤트
    closeReportModal?.addEventListener('click', closeReportModalHandler);
    cancelReport?.addEventListener('click', closeReportModalHandler);
    reportForm?.addEventListener('submit', submitReport);
    
    // 공유 버튼 이벤트
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', handleShare);
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === imageModal) closeImageModalHandler();
        if (e.target === reportModal) closeReportModalHandler();
    });
    
    // 키보드 이벤트
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    console.log('✅ 이벤트 리스너 설정 완료');
}

/* ==========================================================================
   유틸리티 함수들
   ========================================================================== */

function formatPrice(price) {
    return price.toLocaleString();
}

function showNotification(message, type = 'info') {
    console.log('🔔 알림:', message, '(' + type + ')');
    
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
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
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
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
    switch (type) {
        case 'success': return '#27ae60';
        case 'error': return '#e74c3c';
        case 'warning': return '#f39c12';
        case 'cart': return '#8e44ad';
        case 'info': 
        default: return '#3498db';
    }
}

function startChat() {
    if (!currentProduct) return;
    
    showNotification('판매자와의 채팅방이 열렸습니다! 💬', 'success');
    console.log('💬 채팅 시작:', currentProduct.seller.name);
    
    // TODO: 실제 채팅 페이지로 이동
    setTimeout(() => {
        // window.location.href = `chat.html?seller=${currentProduct.seller.name}&product=${currentProduct.id}`;
    }, 500);
}

/* ==========================================================================
   댓글 관련 추가 함수들
   ========================================================================== */

async function likeComment(commentId) {
    try {
        // TODO: 실제 댓글 좋아요 API 호출
        // await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
        
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes++;
            
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            const likeButtons = commentElement?.querySelectorAll('.reaction-btn, .comment-action-btn');
            likeButtons?.forEach(btn => {
                if (btn.textContent.includes('👍')) {
                    btn.innerHTML = btn.innerHTML.replace(/\d+/, comment.likes);
                }
            });
            
            showNotification('댓글에 좋아요를 눌렀습니다! 👍', 'success');
            console.log('👍 댓글 좋아요:', commentId, '현재 좋아요 수:', comment.likes);
        }
    } catch (error) {
        console.error('댓글 좋아요 오류:', error);
        showNotification('좋아요 처리 중 오류가 발생했습니다.', 'error');
    }
}

async function likeReply(replyId) {
    try {
        // TODO: 실제 답글 좋아요 API 호출
        // await fetch(`/api/replies/${replyId}/like`, { method: 'POST' });
        
        for (let comment of comments) {
            if (comment.replies) {
                const reply = comment.replies.find(r => r.id === replyId);
                if (reply) {
                    reply.likes++;
                    
                    const replyElement = document.querySelector(`[data-reply-id="${replyId}"]`);
                    const likeButton = replyElement?.querySelector('.comment-action-btn');
                    if (likeButton) {
                        likeButton.innerHTML = `👍 ${reply.likes}`;
                    }
                    
                    showNotification('답글에 좋아요를 눌렀습니다! 👍', 'success');
                    console.log('👍 답글 좋아요:', replyId, '현재 좋아요 수:', reply.likes);
                    break;
                }
            }
        }
    } catch (error) {
        console.error('답글 좋아요 오류:', error);
        showNotification('좋아요 처리 중 오류가 발생했습니다.', 'error');
    }
}

function toggleReplyForm(commentId) {
    const replyForm = document.getElementById(`replyForm${commentId}`);
    if (replyForm) {
        const isVisible = replyForm.style.display !== 'none';
        replyForm.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            const textarea = replyForm.querySelector('.reply-input');
            textarea?.focus();
        }
    }
}

async function submitReply(commentId) {
    const replyForm = document.getElementById(`replyForm${commentId}`);
    const textarea = replyForm?.querySelector('.reply-input');
    const content = textarea?.value.trim();
    
    if (!content) {
        showNotification('답글 내용을 입력해주세요.', 'error');
        return;
    }
    
    if (content.length > 300) {
        showNotification('답글은 300자 이내로 작성해주세요.', 'error');
        return;
    }
    
    try {
        // TODO: 실제 답글 작성 API 호출
        // await fetch(`/api/comments/${commentId}/replies`, {
        //     method: 'POST',
        //     body: JSON.stringify({ content })
        // });
        
        const newReply = {
            id: Date.now(),
            author: currentUser ? currentUser.name : '익명',
            avatar: '👤',
            content: content,
            time: '방금 전',
            likes: 0,
            isSeller: false
        };
        
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push(newReply);
            
            renderComments();
            updateCommentsCount();
            
            showNotification('답글이 등록되었습니다!', 'success');
            console.log('💬 답글 저장:', newReply);
        }
        
    } catch (error) {
        console.error('답글 작성 오류:', error);
        showNotification('답글 작성 중 오류가 발생했습니다.', 'error');
    }
}

async function submitComment(e) {
    e.preventDefault();
    
    const content = commentInput?.value.trim();
    if (!content) {
        showNotification('댓글 내용을 입력해주세요.', 'error');
        return;
    }
    
    if (content.length > 500) {
        showNotification('댓글은 500자 이내로 작성해주세요.', 'error');
        return;
    }
    
    try {
        // TODO: 실제 댓글 작성 API 호출
        // await fetch(`/api/products/${currentProduct.id}/comments`, {
        //     method: 'POST',
        //     body: JSON.stringify({ content })
        // });
        
        const newComment = {
            id: Date.now(),
            author: currentUser ? currentUser.name : '익명',
            avatar: '👤',
            content: content,
            time: '방금 전',
            likes: 0,
            replies: []
        };
        
        comments.unshift(newComment);
        
        renderComments();
        updateCommentsCount();
        
        if (commentInput) commentInput.value = '';
        
        showNotification('댓글이 등록되었습니다!', 'success');
        console.log('💬 댓글 저장:', newComment);
        
    } catch (error) {
        console.error('댓글 작성 오류:', error);
        showNotification('댓글 작성 중 오류가 발생했습니다.', 'error');
    }
}

function loadMoreCommentsHandler() {
    currentCommentPage++;
    renderComments();
    console.log('📃 댓글 더보기:', currentCommentPage + '페이지');
}

function sortComments(sortType) {
    console.log('🔤 댓글 정렬:', sortType);
    
    switch (sortType) {
        case 'latest':
            comments.sort((a, b) => new Date(b.time) - new Date(a.time));
            break;
        case 'oldest':
            comments.sort((a, b) => new Date(a.time) - new Date(b.time));
            break;
        case 'likes':
            comments.sort((a, b) => b.likes - a.likes);
            break;
    }
    
    currentCommentPage = 1;
    renderComments();
}

function reportComment(commentId) {
    currentReportCommentId = commentId;
    openModal(reportModal);
    console.log('🚨 댓글 신고 모달 열기:', commentId);
}

function closeReportModalHandler() {
    if (reportModal) {
        reportModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        reportForm?.reset();
        currentReportCommentId = null;
    }
}

async function submitReport(e) {
    e.preventDefault();
    
    const formData = new FormData(reportForm);
    const reason = formData.get('reportReason');
    
    if (!reason) {
        showNotification('신고 사유를 선택해주세요.', 'error');
        return;
    }
    
    try {
        // TODO: 실제 신고 API 호출
        // await fetch('/api/reports', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         commentId: currentReportCommentId,
        //         reason: reason,
        //         details: formData.get('details')
        //     })
        // });
        
        showNotification('신고가 접수되었습니다. 검토 후 조치하겠습니다.', 'success');
        closeReportModalHandler();
        
        console.log('🚨 댓글 신고:', {
            commentId: currentReportCommentId,
            reason: reason,
            details: formData.get('details')
        });
        
    } catch (error) {
        console.error('신고 처리 오류:', error);
        showNotification('신고 처리 중 오류가 발생했습니다.', 'error');
    }
}

/* ==========================================================================
   이미지 모달 관련 함수들
   ========================================================================== */

function openImageModal() {
    if (imageModal) {
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateModalImage();
        updateImageNavigation();
        console.log('🖼️ 이미지 모달 열기');
    }
}

function closeImageModalHandler() {
    if (imageModal) {
        imageModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('🖼️ 이미지 모달 닫기');
    }
}

function updateModalImage() {
    if (modalMainImage && productImages[currentImageIndex]) {
        modalMainImage.textContent = productImages[currentImageIndex];
    }
    updateImageCounter();
}

function showPreviousImage() {
    if (currentImageIndex > 0) {
        changeImage(currentImageIndex - 1);
        updateModalImage();
        updateImageNavigation();
        console.log('⬅️ 이전 이미지:', currentImageIndex);
    }
}

function showNextImage() {
    if (currentImageIndex < productImages.length - 1) {
        changeImage(currentImageIndex + 1);
        updateModalImage();
        updateImageNavigation();
        console.log('➡️ 다음 이미지:', currentImageIndex);
    }
}

function updateImageNavigation() {
    if (prevImageBtn) {
        prevImageBtn.disabled = currentImageIndex === 0;
    }
    if (nextImageBtn) {
        nextImageBtn.disabled = currentImageIndex === productImages.length - 1;
    }
}

function handleKeyboardNavigation(e) {
    if (imageModal?.classList.contains('show')) {
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
   기타 기능 함수들
   ========================================================================== */

function viewSellerProfile() {
    if (!currentProduct) return;
    
    showNotification('판매자 프로필로 이동합니다...', 'info');
    console.log('👤 판매자 프로필 보기:', currentProduct.seller.name);
    
    // TODO: 실제 판매자 프로필 페이지로 이동
    setTimeout(() => {
        // window.location.href = `profile.html?seller=${currentProduct.seller.name}`;
    }, 500);
}

function handleShare(e) {
    const shareType = e.target.getAttribute('data-type');
    const currentUrl = window.location.href;
    const title = currentProduct?.title || '상품 정보';
    
    console.log('📤 공유하기:', shareType);
    
    switch (shareType) {
        case 'link':
            navigator.clipboard.writeText(currentUrl).then(() => {
                showNotification('링크가 복사되었습니다! 🔗', 'success');
            }).catch(() => {
                showNotification('링크 복사에 실패했습니다.', 'error');
            });
            break;
            
        case 'kakao':
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
    }
}

function openModal(modal) {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/* ==========================================================================
   연관 상품 로드
   ========================================================================== */

async function loadRelatedProducts() {
    if (!relatedProductsGrid) return;
    
    console.log('🔗 연관 상품 로딩...');
    
    try {
        // TODO: 실제 API에서 연관 상품 데이터 가져오기
        // const response = await fetch(`/api/products/related/${currentProduct.id}`);
        // const relatedProducts = await response.json();
        
        relatedProductsGrid.innerHTML = '';
        
        // 임시로 빈 상태로 두기
        console.log('❌ 백엔드 API 연결 필요 - 연관 상품 데이터 없음');
        
    } catch (error) {
        console.error('연관 상품 로드 오류:', error);
    }
}

function createRelatedProductCard(product) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'related-product-card';
    cardDiv.addEventListener('click', () => {
        console.log('🔗 연관 상품 클릭:', product.title);
        // TODO: 상품 상세 페이지로 이동
        // window.location.href = `product-detail.html?id=${product.id}`;
        showNotification(`"${product.title}" 상품으로 이동합니다...`, 'info');
    });
    
    cardDiv.innerHTML = `
        <div class="related-product-image">${product.image}</div>
        <div class="related-product-info">
            <div class="related-product-title">${product.title}</div>
            <div class="related-product-price">${formatPrice(product.price)}원</div>
            <div class="related-product-location">📍 ${product.location}</div>
        </div>
    `;
    
    return cardDiv;
}

/* ==========================================================================
   개발자 도구용 전역 함수들
   ========================================================================== */

window.toggleDemoLogin = toggleDemoLogin;
window.showNotification = showNotification;
window.addToCart = addToCart;
window.viewCart = viewCart;
window.clearCart = clearCart;
window.likeComment = likeComment;
window.likeReply = likeReply;
window.toggleReplyForm = toggleReplyForm;
window.submitReply = submitReply;
window.reportComment = reportComment;

console.log('='.repeat(60));
console.log('🎉 상품 상세 페이지 JavaScript 로딩 완료!');
console.log('='.repeat(60));
console.log('🔧 개발자 도구 명령어:');
console.log('• toggleDemoLogin() - 로그인 상태 토글');
console.log('• showNotification("메시지", "타입") - 알림 표시');
console.log('• addToCart() - 현재 상품을 장바구니에 추가');
console.log('• viewCart() - 장바구니 내용 조회');
console.log('• clearCart() - 장바구니 비우기');
console.log('• likeComment(1) - 댓글 좋아요');
console.log('='.repeat(60));
console.log('🛒 장바구니 기능이 추가되었습니다!');
console.log('='.repeat(60));