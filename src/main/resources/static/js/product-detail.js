/**
 * ==========================================================================
 * 상품 상세 페이지 JavaScript
 * 상품 정보 표시, 이미지 갤러리, 댓글 시스템, 로그인 관리 등의 기능
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
let productImages = ['💻', '📱', '⌨️', '🖱️'];

// 모달 관련 변수
let currentReportCommentId = null;

// 로그인 상태 관리 (실제로는 서버에서 관리)
let isLoggedIn = false;
let currentUser = null;

/* ==========================================================================
   DOM 요소 참조 - 자주 사용하는 HTML 요소들을 미리 가져옴
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

// 상품 메뉴 관련 요소 (수정/삭제)
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
const chatBtn = document.getElementById('chatBtn');
const buyBtn = document.getElementById('buyBtn');
const wishlistBtnMobile = document.getElementById('wishlistBtnMobile');
const chatBtnMobile = document.getElementById('chatBtnMobile');
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
   페이지 초기화 - 페이지가 로드될 때 실행되는 함수들
   ========================================================================== */

/**
 * 페이지 로드 완료 시 실행되는 메인 초기화 함수
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('상품 상세 페이지 로딩 시작...');
    
    initializePage();        // 기본 페이지 설정
    checkLoginStatus();      // 로그인 상태 확인
    loadProductData();       // 상품 데이터 로드
    loadComments();          // 댓글 데이터 로드
    loadRelatedProducts();   // 연관 상품 로드
    setupEventListeners();   // 이벤트 리스너 설정
    setupImageGallery();     // 이미지 갤러리 설정
    
    console.log('상품 상세 페이지 로딩 완료!');
});

/**
 * 페이지 기본 설정 초기화
 */
function initializePage() {
    // 헤더 스크롤 효과 설정
    window.addEventListener('scroll', handleHeaderScroll);
    
    // 모바일 햄버거 메뉴 설정
    hamburger?.addEventListener('click', toggleMobileMenu);
    
    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // URL 파라미터에서 상품 ID 가져오기 (실제 구현 시 사용)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    console.log('상품 ID:', productId || '샘플 데이터 사용');
    
    // 브레드크럼 설정
    updateBreadcrumb();
}

/* ==========================================================================
   로그인 상태 관리 - 로그인 여부에 따른 UI 변경
   ========================================================================== */

/**
 * 로그인 상태 확인 및 UI 업데이트
 * 실제로는 서버에서 세션/토큰 확인
 */
function checkLoginStatus() {
    // 데모를 위한 로그인 상태 시뮬레이션
    // 실제로는 localStorage, 쿠키, 또는 서버 세션에서 확인
    const savedLoginStatus = localStorage.getItem('demoLoginStatus');
    
    if (savedLoginStatus === 'true') {
        isLoggedIn = true;
        currentUser = sampleUser;
        showUserMenu();
    } else {
        isLoggedIn = false;
        currentUser = null;
        showGuestButtons();
    }
    
    // 상품 메뉴 표시 여부 업데이트
    updateProductMenu();
    
    console.log('로그인 상태:', isLoggedIn ? '로그인됨' : '비로그인');
}

/**
 * 게스트(비로그인) 버튼 표시
 */
function showGuestButtons() {
    if (guestButtons) guestButtons.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
}

/**
 * 사용자 메뉴 표시 (로그인 시)
 */
function showUserMenu() {
    if (guestButtons) guestButtons.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName && currentUser) {
        userName.textContent = currentUser.name + '님';
    }
}

/**
 * 상품 메뉴 표시 여부 결정
 * 로그인했고 본인의 상품일 때만 수정/삭제 메뉴 표시
 */
function updateProductMenu() {
    if (!productMenu) return;
    
    // 로그인했고 현재 사용자가 상품 판매자인 경우에만 메뉴 표시
    const isOwner = isLoggedIn && currentUser && currentProduct && 
                   currentUser.id === currentProduct.sellerId;
    
    if (isOwner) {
        productMenu.style.display = 'block';
        console.log('상품 메뉴 표시 - 판매자 본인');
    } else {
        productMenu.style.display = 'none';
        console.log('상품 메뉴 숨김 - 판매자가 아니거나 비로그인');
    }
}

/**
 * 데모용 로그인 토글 함수 (개발자 도구에서 테스트용)
 */
function toggleDemoLogin() {
    if (isLoggedIn) {
        // 로그아웃
        isLoggedIn = false;
        currentUser = null;
        localStorage.setItem('demoLoginStatus', 'false');
        showGuestButtons();
        showNotification('로그아웃되었습니다.', 'info');
    } else {
        // 로그인
        isLoggedIn = true;
        currentUser = sampleUser;
        localStorage.setItem('demoLoginStatus', 'true');
        showUserMenu();
        showNotification('로그인되었습니다!', 'success');
    }
    updateProductMenu();
}

/* ==========================================================================
   헤더 및 네비게이션 관리
   ========================================================================== */

/**
 * 스크롤에 따른 헤더 스타일 변경
 */
function handleHeaderScroll() {
    if (window.scrollY > 100) {
        header?.classList.add('scrolled');
    } else {
        header?.classList.remove('scrolled');
    }
}

/**
 * 모바일 햄버거 메뉴 토글
 */
function toggleMobileMenu() {
    hamburger?.classList.toggle('active');
    navMenu?.classList.toggle('active');
}

/**
 * 모바일 메뉴 닫기
 */
function closeMobileMenu() {
    hamburger?.classList.remove('active');
    navMenu?.classList.remove('active');
}

/**
 * 브레드크럼 업데이트
 */
function updateBreadcrumb() {
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbCategory && currentProduct) {
        breadcrumbCategory.textContent = currentProduct.categoryName;
    }
}

/* ==========================================================================
   상품 데이터 로드 및 표시
   ========================================================================== */

/**
 * 상품 데이터 로드 (실제로는 API에서 가져옴)
 */
function loadProductData() {
    console.log('상품 데이터 로딩...');
    
    // 실제 구현에서는 fetch API 사용
    // const response = await fetch(`/api/products/${productId}`);
    // currentProduct = await response.json();
    
    currentProduct = sampleProduct;
    
    // 상품 정보 화면에 표시
    displayProductInfo();
    
    // 조회수 증가 (실제로는 서버에서 처리)
    incrementViewCount();
    
    // 상품 메뉴 업데이트
    updateProductMenu();
    
    console.log('상품 데이터 로딩 완료:', currentProduct.title);
}

/**
 * 상품 정보를 화면에 표시
 */
function displayProductInfo() {
    if (!currentProduct) return;
    
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
        // 할인율 계산
        const discount = Math.round((1 - currentProduct.price / currentProduct.originalPrice) * 100);
        if (discountRate) discountRate.textContent = `${discount}% 할인`;
    }
    
    // 상품 상태 설정
    if (conditionStars) {
        conditionStars.textContent = '★'.repeat(currentProduct.conditionRating) + 
                                   '☆'.repeat(5 - currentProduct.conditionRating);
    }
    if (conditionText) conditionText.textContent = currentProduct.conditionText;
    
    // 상품 설명 설정 (HTML 포함)
    if (productDescription) {
        productDescription.innerHTML = currentProduct.description;
    }
    
    // 판매자 정보 설정
    if (sellerName) sellerName.textContent = currentProduct.seller.name;
    if (sellerRating) sellerRating.textContent = currentProduct.seller.rating + '/5.0';
    if (sellerSales) sellerSales.textContent = currentProduct.seller.sales;
    
    // 관심상품 수 설정
    if (wishlistCount) wishlistCount.textContent = currentProduct.likes;
    
    // 브레드크럼 업데이트
    updateBreadcrumb();
    
    console.log('상품 정보 표시 완료');
}

/**
 * 조회수 증가 처리
 */
function incrementViewCount() {
    if (currentProduct) {
        currentProduct.views++;
        if (productViews) {
            productViews.textContent = currentProduct.views;
        }
        
        // 실제로는 서버에 조회수 증가 요청
        console.log('조회수 증가:', currentProduct.views);
    }
}

/* ==========================================================================
   이미지 갤러리 관리
   ========================================================================== */

/**
 * 이미지 갤러리 초기 설정
 */
function setupImageGallery() {
    if (!currentProduct) return;
    
    productImages = currentProduct.images;
    currentImageIndex = 0;
    
    // 메인 이미지 설정
    updateMainImage();
    
    // 썸네일 목록 생성
    generateThumbnails();
    
    // 썸네일 클릭 이벤트 설정
    setupThumbnailEvents();
    
    console.log('이미지 갤러리 설정 완료');
}

/**
 * 메인 이미지 업데이트
 */
function updateMainImage() {
    if (mainImage && productImages[currentImageIndex]) {
        mainImage.textContent = productImages[currentImageIndex];
    }
    
    // 모달 이미지도 업데이트
    if (modalMainImage && productImages[currentImageIndex]) {
        modalMainImage.textContent = productImages[currentImageIndex];
    }
    
    // 이미지 카운터 업데이트
    updateImageCounter();
}

/**
 * 썸네일 목록 생성
 */
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

/**
 * 썸네일 클릭 이벤트 설정
 */
function setupThumbnailEvents() {
    if (!thumbnailList) return;
    
    thumbnailList.addEventListener('click', (e) => {
        if (e.target.classList.contains('thumbnail')) {
            const index = parseInt(e.target.getAttribute('data-index'));
            changeImage(index);
        }
    });
}

/**
 * 이미지 변경
 */
function changeImage(index) {
    if (index >= 0 && index < productImages.length) {
        currentImageIndex = index;
        updateMainImage();
        updateThumbnailActive();
    }
}

/**
 * 활성 썸네일 업데이트
 */
function updateThumbnailActive() {
    const thumbnails = thumbnailList?.querySelectorAll('.thumbnail');
    thumbnails?.forEach((thumb, index) => {
        thumb.classList.toggle('active', index === currentImageIndex);
    });
}

/**
 * 이미지 카운터 업데이트
 */
function updateImageCounter() {
    if (imageCounter) {
        imageCounter.textContent = `${currentImageIndex + 1} / ${productImages.length}`;
    }
}

/* ==========================================================================
   댓글 시스템 관리
   ========================================================================== */

/**
 * 댓글 데이터 로드
 */
function loadComments() {
    console.log('댓글 로딩...');
    
    // 실제로는 API에서 댓글 데이터 가져옴
    comments = [...sampleComments];
    
    // 댓글 목록 렌더링
    renderComments();
    
    // 댓글 수 업데이트
    updateCommentsCount();
    
    console.log('댓글 로딩 완료:', comments.length + '개');
}

/**
 * 댓글 목록 렌더링
 */
function renderComments() {
    if (!commentsList) return;
    
    commentsList.innerHTML = '';
    
    // 현재 페이지에 표시할 댓글들
    const startIndex = 0;
    const endIndex = currentCommentPage * commentsPerPage;
    const commentsToShow = comments.slice(startIndex, endIndex);
    
    commentsToShow.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
    
    // 더보기 버튼 표시/숨김
    if (endIndex >= comments.length) {
        loadMoreComments?.style.setProperty('display', 'none');
    } else {
        loadMoreComments?.style.setProperty('display', 'block');
    }
}

/**
 * 개별 댓글 요소 생성
 */
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

/**
 * 답글 HTML 생성
 */
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

/**
 * 댓글 수 업데이트
 */
function updateCommentsCount() {
    if (commentsCount) {
        const totalComments = comments.reduce((total, comment) => {
            return total + 1 + (comment.replies ? comment.replies.length : 0);
        }, 0);
        commentsCount.textContent = totalComments;
    }
}

/* ==========================================================================
   상품 액션 처리 (관심상품, 채팅, 구매)
   ========================================================================== */

/**
 * 관심상품 토글
 */
function toggleWishlist() {
    if (!currentProduct) return;
    
    const isWishlisted = wishlistBtn?.classList.contains('active');
    
    if (isWishlisted) {
        // 관심상품에서 제거
        currentProduct.likes--;
        wishlistBtn?.classList.remove('active');
        wishlistBtnMobile?.classList.remove('active');
        
        // 하트 아이콘 변경
        const heartIcons = document.querySelectorAll('.heart-icon');
        heartIcons.forEach(icon => {
            icon.textContent = '🤍';
            icon.classList.remove('animate');
        });
        
        showNotification('관심상품에서 제거되었습니다.', 'info');
    } else {
        // 관심상품에 추가
        currentProduct.likes++;
        wishlistBtn?.classList.add('active');
        wishlistBtnMobile?.classList.add('active');
        
        // 하트 아이콘 변경 및 애니메이션
        const heartIcons = document.querySelectorAll('.heart-icon');
        heartIcons.forEach(icon => {
            icon.textContent = '❤️';
            icon.classList.add('animate');
        });
        
        showNotification('관심상품에 추가되었습니다! ❤️', 'success');
    }
    
    // 관심상품 수 업데이트
    if (wishlistCount) {
        wishlistCount.textContent = currentProduct.likes;
    }
    
    // 실제로는 서버에 관심상품 상태 저장
    console.log('관심상품 상태 변경:', !isWishlisted);
}

/**
 * 채팅 시작
 */
function startChat() {
    if (!currentProduct) return;
    
    showNotification('판매자와의 채팅방이 열렸습니다! 💬', 'success');
    
    // 실제로는 채팅 페이지로 이동하거나 채팅 모달 열기
    setTimeout(() => {
        console.log('채팅 시작:', currentProduct.seller.name);
        // window.location.href = `chat.html?seller=${currentProduct.seller.name}&product=${currentProduct.id}`;
    }, 500);
}

/**
 * 상품 구매
 */
function purchaseProduct() {
    if (!currentProduct) return;
    
    if (currentProduct.status !== 'available') {
        showNotification('현재 판매중이 아닌 상품입니다.', 'error');
        return;
    }
    
    // 구매 확인 다이얼로그
    const confirmPurchase = confirm(`${currentProduct.title}\n가격: ${formatPrice(currentProduct.price)}원\n\n구매하시겠습니까?`);
    
    if (confirmPurchase) {
        showNotification('구매 절차를 진행합니다...', 'info');
        
        // 실제로는 결제 페이지로 이동
        setTimeout(() => {
            console.log('구매 진행:', currentProduct.id);
            // window.location.href = `payment.html?product=${currentProduct.id}`;
        }, 1000);
    }
}

/* ==========================================================================
   상품 관리 (수정/삭제) - 판매자만 가능
   ========================================================================== */

/**
 * 상품 메뉴 토글
 */
function toggleProductMenu() {
    if (!menuDropdown) return;
    
    const isShowing = menuDropdown.classList.contains('show');
    
    if (isShowing) {
        menuDropdown.classList.remove('show');
    } else {
        menuDropdown.classList.add('show');
    }
}

/**
 * 상품 수정
 */
function editProductData() {
    if (!currentProduct) return;
    
    showNotification('상품 수정 페이지로 이동합니다...', 'info');
    
    // 실제로는 상품 수정 페이지로 이동
    setTimeout(() => {
        console.log('상품 수정:', currentProduct.id);
        // window.location.href = `edit-product.html?id=${currentProduct.id}`;
    }, 500);
    
    // 메뉴 닫기
    menuDropdown?.classList.remove('show');
}

/**
 * 상품 삭제
 */
function deleteProductData() {
    if (!currentProduct) return;
    
    // 삭제 확인 다이얼로그
    const confirmDelete = confirm(`"${currentProduct.title}" 상품을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
    
    if (confirmDelete) {
        showNotification('상품을 삭제하고 있습니다...', 'info');
        
        // 실제로는 서버에 삭제 요청
        setTimeout(() => {
            showNotification('상품이 삭제되었습니다.', 'success');
            console.log('상품 삭제:', currentProduct.id);
            
            // 상품 목록 페이지로 이동
            setTimeout(() => {
                // window.location.href = 'eco-market.html';
            }, 1000);
        }, 1000);
    }
    
    // 메뉴 닫기
    menuDropdown?.classList.remove('show');
}

/* ==========================================================================
   이벤트 리스너 설정
   ========================================================================== */

/**
 * 모든 이벤트 리스너 설정
 */
function setupEventListeners() {
    console.log('이벤트 리스너 설정...');
    
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
    chatBtn?.addEventListener('click', startChat);
    buyBtn?.addEventListener('click', purchaseProduct);
    
    // 모바일 액션 버튼 이벤트
    wishlistBtnMobile?.addEventListener('click', toggleWishlist);
    chatBtnMobile?.addEventListener('click', startChat);
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
    
    // 키보드 이벤트 (이미지 갤러리)
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    console.log('이벤트 리스너 설정 완료');
}

/* ==========================================================================
   유틸리티 함수들
   ========================================================================== */

/**
 * 가격을 천 단위 콤마로 포맷팅
 * @param {number} price - 포맷팅할 가격
 * @returns {string} 포맷팅된 가격 문자열
 */
function formatPrice(price) {
    return price.toLocaleString();
}

/**
 * 알림 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 알림 스타일
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
        font-size: 14px;
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

/**
 * 알림 타입별 색상 반환
 * @param {string} type - 알림 타입
 * @returns {string} CSS 색상 값
 */
function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#27ae60';
        case 'error': return '#e74c3c';
        case 'warning': return '#f39c12';
        case 'info': 
        default: return '#3498db';
    }
}

/* ==========================================================================
   댓글 관련 추가 함수들
   ========================================================================== */

/**
 * 댓글 좋아요 처리
 * @param {number} commentId - 댓글 ID
 */
function likeComment(commentId) {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        comment.likes++;
        
        // UI 업데이트
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        const likeButtons = commentElement?.querySelectorAll('.reaction-btn, .comment-action-btn');
        likeButtons?.forEach(btn => {
            if (btn.textContent.includes('👍')) {
                btn.innerHTML = btn.innerHTML.replace(/\d+/, comment.likes);
            }
        });
        
        // 좋아요 애니메이션 효과
        showNotification('댓글에 좋아요를 눌렀습니다! 👍', 'success');
        console.log('댓글 좋아요:', commentId, '현재 좋아요 수:', comment.likes);
    }
}

/**
 * 답글 좋아요 처리
 * @param {number} replyId - 답글 ID
 */
function likeReply(replyId) {
    // 답글을 찾아서 좋아요 증가
    for (let comment of comments) {
        if (comment.replies) {
            const reply = comment.replies.find(r => r.id === replyId);
            if (reply) {
                reply.likes++;
                
                // UI 업데이트
                const replyElement = document.querySelector(`[data-reply-id="${replyId}"]`);
                const likeButton = replyElement?.querySelector('.comment-action-btn');
                if (likeButton) {
                    likeButton.innerHTML = `👍 ${reply.likes}`;
                }
                
                showNotification('답글에 좋아요를 눌렀습니다! 👍', 'success');
                console.log('답글 좋아요:', replyId, '현재 좋아요 수:', reply.likes);
                break;
            }
        }
    }
}

/**
 * 답글 폼 토글
 * @param {number} commentId - 댓글 ID
 */
function toggleReplyForm(commentId) {
    const replyForm = document.getElementById(`replyForm${commentId}`);
    if (replyForm) {
        const isVisible = replyForm.style.display !== 'none';
        replyForm.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            // 폼이 보여질 때 텍스트 영역에 포커스
            const textarea = replyForm.querySelector('.reply-input');
            textarea?.focus();
        }
    }
}

/**
 * 답글 제출 처리
 * @param {number} commentId - 댓글 ID
 */
function submitReply(commentId) {
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
    
    // 새 답글 생성
    const newReply = {
        id: Date.now(), // 임시 ID
        author: currentUser ? currentUser.name : '익명',
        avatar: '👤',
        content: content,
        time: '방금 전',
        likes: 0,
        isSeller: false
    };
    
    // 댓글에 답글 추가
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
        if (!comment.replies) comment.replies = [];
        comment.replies.push(newReply);
        
        // 댓글 목록 다시 렌더링
        renderComments();
        updateCommentsCount();
        
        showNotification('답글이 등록되었습니다!', 'success');
        console.log('답글 저장:', newReply);
        
        // 실제로는 서버에 답글 저장 요청
        // await fetch('/api/comments/reply', { method: 'POST', body: JSON.stringify(newReply) });
    }
}

/**
 * 댓글 제출 처리
 * @param {Event} e - 폼 제출 이벤트
 */
function submitComment(e) {
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
    
    // 새 댓글 생성
    const newComment = {
        id: Date.now(), // 임시 ID
        author: currentUser ? currentUser.name : '익명',
        avatar: '👤',
        content: content,
        time: '방금 전',
        likes: 0,
        replies: []
    };
    
    // 댓글 목록에 추가 (맨 앞에)
    comments.unshift(newComment);
    
    // UI 업데이트
    renderComments();
    updateCommentsCount();
    
    // 입력 필드 초기화
    if (commentInput) commentInput.value = '';
    
    showNotification('댓글이 등록되었습니다!', 'success');
    console.log('댓글 저장:', newComment);
    
    // 실제로는 서버에 댓글 저장
    // await fetch('/api/comments', { method: 'POST', body: JSON.stringify(newComment) });
}

/**
 * 댓글 더보기 처리
 */
function loadMoreCommentsHandler() {
    currentCommentPage++;
    renderComments();
    console.log('댓글 더보기:', currentCommentPage + '페이지');
}

/**
 * 댓글 정렬
 * @param {string} sortType - 정렬 타입 (latest, oldest, likes)
 */
function sortComments(sortType) {
    console.log('댓글 정렬:', sortType);
    
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

/**
 * 댓글 신고 처리
 * @param {number} commentId - 신고할 댓글 ID
 */
function reportComment(commentId) {
    currentReportCommentId = commentId;
    openModal(reportModal);
    console.log('댓글 신고 모달 열기:', commentId);
}

/**
 * 신고 모달 닫기
 */
function closeReportModalHandler() {
    if (reportModal) {
        reportModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        reportForm?.reset();
        currentReportCommentId = null;
    }
}

/**
 * 신고 제출 처리
 * @param {Event} e - 폼 제출 이벤트
 */
function submitReport(e) {
    e.preventDefault();
    
    const formData = new FormData(reportForm);
    const reason = formData.get('reportReason');
    
    if (!reason) {
        showNotification('신고 사유를 선택해주세요.', 'error');
        return;
    }
    
    // 신고 처리
    showNotification('신고가 접수되었습니다. 검토 후 조치하겠습니다.', 'success');
    closeReportModalHandler();
    
    // 실제로는 서버에 신고 내용 전송
    console.log('댓글 신고:', {
        commentId: currentReportCommentId,
        reason: reason,
        details: formData.get('details')
    });
}

/* ==========================================================================
   이미지 모달 관련 함수들
   ========================================================================== */

/**
 * 이미지 모달 열기
 */
function openImageModal() {
    if (imageModal) {
        imageModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateModalImage();
        updateImageNavigation();
        console.log('이미지 모달 열기');
    }
}

/**
 * 이미지 모달 닫기
 */
function closeImageModalHandler() {
    if (imageModal) {
        imageModal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('이미지 모달 닫기');
    }
}

/**
 * 모달 이미지 업데이트
 */
function updateModalImage() {
    if (modalMainImage && productImages[currentImageIndex]) {
        modalMainImage.textContent = productImages[currentImageIndex];
    }
    updateImageCounter();
}

/**
 * 이전 이미지 보기
 */
function showPreviousImage() {
    if (currentImageIndex > 0) {
        changeImage(currentImageIndex - 1);
        updateModalImage();
        updateImageNavigation();
        console.log('이전 이미지:', currentImageIndex);
    }
}

/**
 * 다음 이미지 보기
 */
function showNextImage() {
    if (currentImageIndex < productImages.length - 1) {
        changeImage(currentImageIndex + 1);
        updateModalImage();
        updateImageNavigation();
        console.log('다음 이미지:', currentImageIndex);
    }
}

/**
 * 이미지 네비게이션 버튼 상태 업데이트
 */
function updateImageNavigation() {
    if (prevImageBtn) {
        prevImageBtn.disabled = currentImageIndex === 0;
    }
    if (nextImageBtn) {
        nextImageBtn.disabled = currentImageIndex === productImages.length - 1;
    }
}

/**
 * 키보드 네비게이션 처리
 * @param {KeyboardEvent} e - 키보드 이벤트
 */
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

/**
 * 판매자 프로필 보기
 */
function viewSellerProfile() {
    if (!currentProduct) return;
    
    showNotification('판매자 프로필로 이동합니다...', 'info');
    
    // 실제로는 판매자 프로필 페이지로 이동
    setTimeout(() => {
        console.log('판매자 프로필 보기:', currentProduct.seller.name);
        // window.location.href = `profile.html?seller=${currentProduct.seller.name}`;
    }, 500);
}

/**
 * 공유 기능 처리
 * @param {Event} e - 클릭 이벤트
 */
function handleShare(e) {
    const shareType = e.target.getAttribute('data-type');
    const currentUrl = window.location.href;
    const title = currentProduct?.title || '상품 정보';
    
    console.log('공유하기:', shareType);
    
    switch (shareType) {
        case 'link':
            // 링크 복사
            navigator.clipboard.writeText(currentUrl).then(() => {
                showNotification('링크가 복사되었습니다! 🔗', 'success');
            }).catch(() => {
                showNotification('링크 복사에 실패했습니다.', 'error');
            });
            break;
            
        case 'kakao':
            // 카카오톡 공유 (실제로는 카카오 SDK 사용)
            showNotification('카카오톡으로 공유됩니다...', 'info');
            console.log('카카오톡 공유:', { url: currentUrl, title });
            break;
            
        case 'facebook':
            // 페이스북 공유
            const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            window.open(facebookUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'twitter':
            // 트위터 공유
            const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`;
            window.open(twitterUrl, '_blank', 'width=600,height=400');
            break;
    }
}

/**
 * 모달 열기 공통 함수
 * @param {HTMLElement} modal - 열 모달 요소
 */
function openModal(modal) {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

/* ==========================================================================
   연관 상품 로드
   ========================================================================== */

/**
 * 연관 상품 데이터 로드 및 표시
 */
function loadRelatedProducts() {
    if (!relatedProductsGrid) return;
    
    console.log('연관 상품 로딩...');
    
    relatedProductsGrid.innerHTML = '';
    
    // 실제로는 API에서 연관 상품 데이터 가져옴
    // const relatedProducts = await fetch(`/api/products/related/${currentProduct.id}`);
    
    sampleRelatedProducts.forEach(product => {
        const productCard = createRelatedProductCard(product);
        relatedProductsGrid.appendChild(productCard);
    });
    
    console.log('연관 상품 로딩 완료:', sampleRelatedProducts.length + '개');
}

/**
 * 연관 상품 카드 생성
 * @param {Object} product - 상품 데이터
 * @returns {HTMLElement} 생성된 상품 카드 요소
 */
function createRelatedProductCard(product) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'related-product-card';
    cardDiv.addEventListener('click', () => {
        // 상품 상세 페이지로 이동
        console.log('연관 상품 클릭:', product.title);
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
   전역 함수 추가 노출 (개발자 도구용)
   ========================================================================== */

// 전역 함수 노출 (HTML에서 호출되는 함수들)
window.toggleDemoLogin = toggleDemoLogin;
window.showNotification = showNotification;
window.likeComment = likeComment;
window.likeReply = likeReply;
window.toggleReplyForm = toggleReplyForm;
window.submitReply = submitReply;
window.reportComment = reportComment;

console.log('='.repeat(50));
console.log('상품 상세 페이지 JavaScript 완전 로딩 완료!');
console.log('='.repeat(50));
console.log('🔧 개발자 도구 명령어:');
console.log('• toggleDemoLogin() - 로그인 상태 토글');
console.log('• showNotification("메시지", "타입") - 알림 표시');
console.log('• likeComment(1) - 댓글 좋아요');
console.log('='.repeat(50));