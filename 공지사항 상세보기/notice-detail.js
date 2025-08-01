/* =========================================
   공지사항 상세보기 페이지 JavaScript (사이드바 제거)
   ========================================= */

// 전역 변수
let isBookmarked = false;

// DOM 요소 참조
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

/* =========================================
   초기화 함수
   ========================================= */

// DOM이 로드된 후 실행되는 초기화 함수
document.addEventListener('DOMContentLoaded', function() {
    initializeDetailPage();
});

// 페이지 기능 초기화
function initializeDetailPage() {
    console.log('📄 공지사항 상세페이지가 로드되었습니다.');
    
    // 기본 초기화
    initializePage();
    
    // 상세페이지 전용 기능들
    initScrollTopButton();
    setupKeyboardShortcuts();
    
    // 댓글 폼 이벤트 리스너
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            if (!submitComment(this)) {
                e.preventDefault();
            }
        });
    }
    
    // 외부 링크 새 창에서 열기
    document.querySelectorAll('.notice-article-content a[href^="http"]').forEach(link => {
        if (!link.hostname || link.hostname !== window.location.hostname) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
    
    console.log('✅ 공지사항 상세페이지 초기화 완료');
}

// 기본 페이지 초기화
function initializePage() {
    // 모바일 메뉴 이벤트 리스너 등록
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // 스크롤 시 헤더 효과
    window.addEventListener('scroll', handleHeaderScroll);

    // 페이드인 애니메이션 적용
    initializeFadeInAnimation();
}

/* =========================================
   모바일 메뉴 관련 함수
   ========================================= */

// 모바일 메뉴 토글
function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // 햄버거 아이콘 애니메이션
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// 모바일 메뉴 닫기
function closeMobileMenu() {
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // 햄버거 아이콘 원상복구
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

/* =========================================
   UI 효과 함수
   ========================================= */

// 헤더 스크롤 효과
function handleHeaderScroll() {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }
}

// 페이드인 애니메이션 초기화
function initializeFadeInAnimation() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

/* =========================================
   알림 시스템
   ========================================= */

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    // 기존 알림이 있으면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 알림 표시 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 3초 후 알림 자동 숨김
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/* =========================================
   스크롤 탑 버튼 관련 함수들
   ========================================= */

function initScrollTopButton() {
    // 스크롤 탑 버튼 생성
    if (!document.querySelector('.scroll-top-btn')) {
        const scrollTopBtn = document.createElement('button');
        scrollTopBtn.className = 'scroll-top-btn';
        scrollTopBtn.innerHTML = '↑';
        scrollTopBtn.title = '맨 위로 이동';
        scrollTopBtn.onclick = scrollToTop;
        document.body.appendChild(scrollTopBtn);
    }
    
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', toggleScrollTopButton);
}

function toggleScrollTopButton() {
    const scrollTopBtn = document.querySelector('.scroll-top-btn');
    if (scrollTopBtn) {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

/* =========================================
   공유 기능
   ========================================= */

// 공지사항 공유 함수
function shareNotice(noticeId, title) {
    const shareData = {
        title: title || '공지사항',
        text: 'GreenCycle 공지사항을 확인해보세요!',
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => {
                showNotification('공지사항이 공유되었습니다! 📤', 'success');
                trackShareEvent(noticeId, 'native_share');
            })
            .catch((error) => {
                console.log('공유 취소됨:', error);
                fallbackShare();
            });
    } else {
        fallbackShare();
    }
}

// 공유 대체 방법 (클립보드 복사 + 소셜미디어 링크)
function fallbackShare() {
    const shareModal = createShareModal();
    document.body.appendChild(shareModal);
    
    // 모달 표시 애니메이션
    setTimeout(() => {
        shareModal.classList.add('show');
    }, 10);
}

function createShareModal() {
    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal">
            <div class="share-modal-header">
                <h3>공지사항 공유하기</h3>
                <button class="share-modal-close" onclick="closeShareModal()">&times;</button>
            </div>
            <div class="share-modal-content">
                <div class="share-url-section">
                    <label>링크 주소</label>
                    <div class="share-url-container">
                        <input type="text" value="${window.location.href}" readonly id="shareUrlInput">
                        <button onclick="copyShareUrl()">복사</button>
                    </div>
                </div>
                <div class="share-social-section">
                    <label>소셜미디어로 공유</label>
                    <div class="share-social-buttons">
                        <button onclick="shareToKakao()" class="social-btn kakao">카카오톡</button>
                        <button onclick="shareToFacebook()" class="social-btn facebook">페이스북</button>
                        <button onclick="shareToTwitter()" class="social-btn twitter">트위터</button>
                        <button onclick="shareToLine()" class="social-btn line">라인</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 모달 외부 클릭시 닫기
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeShareModal();
        }
    });
    
    return modal;
}

function closeShareModal() {
    const modal = document.querySelector('.share-modal-overlay');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function copyShareUrl() {
    const input = document.getElementById('shareUrlInput');
    input.select();
    input.setSelectionRange(0, 99999); // 모바일 호환성
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(input.value).then(() => {
            showNotification('링크가 클립보드에 복사되었습니다! 📋', 'success');
        });
    } else {
        document.execCommand('copy');
        showNotification('링크가 복사되었습니다! 📋', 'success');
    }
}

// 소셜미디어 공유 함수들
function shareToKakao() {
    if (typeof Kakao !== 'undefined') {
        Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.content || '',
                imageUrl: document.querySelector('meta[property="og:image"]')?.content || '',
                link: {
                    mobileWebUrl: window.location.href,
                    webUrl: window.location.href,
                },
            },
        });
    } else {
        showNotification('카카오톡 공유 기능은 실제 서비스에서 사용 가능합니다.', 'info');
    }
}

function shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    openShareWindow(url, 'Facebook');
}

function shareToTwitter() {
    const text = encodeURIComponent(document.title);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`;
    openShareWindow(url, 'Twitter');
}

function shareToLine() {
    const text = encodeURIComponent(document.title);
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${text}`;
    openShareWindow(url, 'Line');
}

function openShareWindow(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
        url,
        `share_${platform}`,
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
}

/* =========================================
   북마크 기능
   ========================================= */

function toggleBookmark(noticeId) {
    const bookmarkBtn = document.querySelector('.notice-action-btn.bookmark');
    if (!bookmarkBtn) return;
    
    isBookmarked = !isBookmarked;
    
    if (isBookmarked) {
        bookmarkBtn.innerHTML = '⭐ 북마크 해제';
        bookmarkBtn.classList.add('active');
        showNotification('북마크에 추가되었습니다!', 'success');
        trackBookmarkEvent(noticeId, 'add');
    } else {
        bookmarkBtn.innerHTML = '☆ 북마크';
        bookmarkBtn.classList.remove('active');
        showNotification('북마크에서 제거되었습니다.', 'info');
        trackBookmarkEvent(noticeId, 'remove');
    }
}

/* =========================================
   인쇄 기능
   ========================================= */

function printNotice() {
    // 인쇄용 스타일 동적 추가
    const printStyles = `
        <style id="printStyles">
            @media print {
                body * { visibility: hidden; }
                .notice-article, .notice-article * { visibility: visible; }
                .notice-article {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    padding: 20px;
                    font-size: 12pt;
                    line-height: 1.6;
                }
                .notice-actions-bottom,
                .back-btn,
                .share-modal-overlay,
                .scroll-top-btn,
                .header,
                .footer { display: none !important; }
                .notice-article-title {
                    font-size: 18pt;
                    color: #000 !important;
                    margin-bottom: 20px;
                }
                .notice-article-meta {
                    border: 1px solid #ccc;
                    padding: 15px;
                    margin-bottom: 20px;
                    background: #f8f9fa !important;
                }
                .notice-article-content h3 {
                    font-size: 14pt;
                    color: #000 !important;
                    margin-top: 20px;
                    margin-bottom: 10px;
                }
                .tag {
                    border: 1px solid #000 !important;
                    color: #000 !important;
                    background: transparent !important;
                }
                .notice-info-box {
                    border: 1px solid #333 !important;
                    background: #f5f5f5 !important;
                    page-break-inside: avoid;
                }
                a { color: #000 !important; text-decoration: underline !important; }
            }
        </style>
    `;
    
    // 기존 인쇄 스타일 제거 후 새로 추가
    const existingStyles = document.getElementById('printStyles');
    if (existingStyles) {
        existingStyles.remove();
    }
    document.head.insertAdjacentHTML('beforeend', printStyles);
    
    // 인쇄 실행
    window.print();
    
    showNotification('인쇄 준비가 완료되었습니다! 🖨️', 'info');
    trackPrintEvent(1); // 실제로는 noticeId 전달
    
    // 인쇄 완료 후 스타일 제거
    setTimeout(() => {
        const printStylesElement = document.getElementById('printStyles');
        if (printStylesElement) {
            printStylesElement.remove();
        }
    }, 2000);
}

/* =========================================
   관리자 전용 기능들
   ========================================= */

// 공지사항 고정/해제 토글
function togglePin(noticeId) {
    const pinBtn = document.querySelector('.admin-btn.pin');
    if (!pinBtn) return;
    
    const isPinned = pinBtn.classList.contains('active');
    const newStatus = !isPinned;
    
    // UI 먼저 업데이트
    pinBtn.disabled = true;
    
    // 서버에 요청 (실제 구현시)
    fetch(`/api/admin/notices/${noticeId}/pin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ pinned: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (newStatus) {
                pinBtn.innerHTML = '📌 고정 해제';
                pinBtn.classList.add('active');
                showNotification('공지사항이 상단에 고정되었습니다!', 'success');
            } else {
                pinBtn.innerHTML = '📌 상단 고정';
                pinBtn.classList.remove('active');
                showNotification('공지사항 고정이 해제되었습니다.', 'info');
            }
        } else {
            showNotification('고정 설정 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('고정 설정 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        pinBtn.disabled = false;
    });
}

// 중요 공지 토글
function toggleImportant(noticeId) {
    const importantBtn = document.querySelector('.admin-btn.important');
    if (!importantBtn) return;
    
    const isImportant = importantBtn.classList.contains('active');
    const newStatus = !isImportant;
    
    importantBtn.disabled = true;
    
    fetch(`/api/admin/notices/${noticeId}/important`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify({ important: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (newStatus) {
                importantBtn.innerHTML = '🔥 중요 해제';
                importantBtn.classList.add('active');
                showNotification('중요 공지로 설정되었습니다!', 'success');
                
                // 중요 뱃지 추가
                const header = document.querySelector('.notice-article-header');
                if (header && !header.querySelector('.important-badge-large')) {
                    const badge = document.createElement('div');
                    badge.className = 'important-badge-large';
                    badge.innerHTML = '📌 중요';
                    header.insertBefore(badge, header.firstChild);
                }
            } else {
                importantBtn.innerHTML = '🔥 중요 표시';
                importantBtn.classList.remove('active');
                showNotification('중요 공지 설정이 해제되었습니다.', 'info');
                
                // 중요 뱃지 제거
                const badge = document.querySelector('.important-badge-large');
                if (badge) {
                    badge.remove();
                }
            }
        } else {
            showNotification('중요 공지 설정 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('중요 공지 설정 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        importantBtn.disabled = false;
    });
}

// 알림 발송
function sendNotification(noticeId) {
    if (!confirm('모든 사용자에게 이 공지사항에 대한 알림을 발송하시겠습니까?')) {
        return;
    }
    
    const notificationBtn = document.querySelector('.admin-btn.notification');
    if (notificationBtn) {
        notificationBtn.disabled = true;
        notificationBtn.innerHTML = '📢 발송 중...';
    }
    
    fetch(`/api/admin/notices/${noticeId}/notify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`총 ${data.sentCount || 0}명에게 알림이 발송되었습니다!`, 'success');
        } else {
            showNotification('알림 발송 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('알림 발송 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        if (notificationBtn) {
            notificationBtn.disabled = false;
            notificationBtn.innerHTML = '📢 알림 발송';
        }
    });
}

// 공지사항 삭제 (관리자용)
function deleteNotice(noticeId) {
    if (!confirm('⚠️ 정말로 이 공지사항을 삭제하시겠습니까?\n\n삭제된 공지사항은 복구할 수 없습니다.')) {
        return;
    }
    
    // 한번 더 확인
    if (!confirm('🚨 최종 확인\n\n이 작업은 되돌릴 수 없습니다.\n정말로 삭제하시겠습니까?')) {
        return;
    }
    
    const deleteBtn = document.querySelector('.admin-btn.delete');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '🗑️ 삭제 중...';
    }
    
    fetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken
        }
    })
    .then(response => {
        if (response.ok) {
            showNotification('공지사항이 성공적으로 삭제되었습니다.', 'success');
            
            // 2초 후 목록 페이지로 이동
            setTimeout(() => {
                window.location.href = '/notices';
            }, 2000);
        } else {
            throw new Error('삭제 실패');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
        
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '🗑️ 글 삭제';
        }
    });
}

/* =========================================
   댓글 관련 함수들
   ========================================= */

function submitComment(form) {
    const content = form.querySelector('textarea[name="content"]').value.trim();
    
    if (!content) {
        showNotification('댓글 내용을 입력해주세요.', 'info');
        return false;
    }
    
    if (content.length > 500) {
        showNotification('댓글은 500자 이하로 작성해주세요.', 'info');
        return false;
    }
    
    // 시뮬레이션: 댓글 추가
    const commentsList = document.querySelector('.comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment-item';
    newComment.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">홍길동</span>
            <span class="comment-date">${new Date().toLocaleString('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'})}</span>
        </div>
        <div class="comment-content">${content}</div>
    `;
    
    commentsList.appendChild(newComment);
    
    // 댓글 수 업데이트
    const commentCount = document.querySelector('.notice-comments h3 span');
    if (commentCount) {
        const currentCount = parseInt(commentCount.textContent);
        commentCount.textContent = currentCount + 1;
    }
    
    // 폼 초기화
    form.reset();
    
    showNotification('댓글이 등록되었습니다! 💬', 'success');
    
    return false; // 폼 제출 방지
}

/* =========================================
   분석 및 추적 함수들
   ========================================= */

function trackShareEvent(noticeId, shareType) {
    // Google Analytics 또는 기타 분석 도구에 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
            'event_category': 'notice',
            'event_label': `notice_${noticeId}`,
            'custom_parameter': shareType
        });
    }
    console.log(`Share event tracked: ${noticeId}, ${shareType}`);
}

function trackBookmarkEvent(noticeId, action) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'bookmark', {
            'event_category': 'notice',
            'event_label': `notice_${noticeId}`,
            'custom_parameter': action
        });
    }
    console.log(`Bookmark event tracked: ${noticeId}, ${action}`);
}

function trackPrintEvent(noticeId) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'print', {
            'event_category': 'notice',
            'event_label': `notice_${noticeId}`
        });
    }
    console.log(`Print event tracked: ${noticeId}`);
}

/* =========================================
   키보드 단축키
   ========================================= */

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Shift + S: 공유
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            shareNotice(1, '공지사항 제목'); // 실제로는 동적으로 설정
        }
        
        // Ctrl/Cmd + Shift + P: 인쇄
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            printNotice();
        }
        
        // Ctrl/Cmd + Shift + B: 북마크 토글
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
            e.preventDefault();
            toggleBookmark(1); // 실제로는 동적으로 설정
        }
        
        // 백스페이스: 뒤로가기 (입력 필드에서는 제외)
        if (e.key === 'Backspace' && 
            !['INPUT', 'TEXTAREA'].includes(e.target.tagName) &&
            !e.target.isContentEditable) {
            e.preventDefault();
            history.back();
        }
        
        // ESC: 모달 닫기
        if (e.key === 'Escape') {
            closeShareModal();
            closeMobileMenu();
        }
    });
}

/* =========================================
   유틸리티 함수들
   ========================================= */

// 외부 링크 확인 및 처리
function handleExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.hostname || link.hostname !== window.location.hostname) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // 외부 링크 클릭 시 확인
            link.addEventListener('click', function(e) {
                if (!confirm('외부 사이트로 이동하시겠습니까?')) {
                    e.preventDefault();
                }
            });
        }
    });
}

// 이미지 로딩 에러 처리
function handleImageErrors() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('이미지 로드 실패:', this.src);
        });
    });
}

// 텍스트 선택 방지 (필요시)
function preventTextSelection(element) {
    if (element) {
        element.style.userSelect = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.mozUserSelect = 'none';
        element.style.msUserSelect = 'none';
    }
}

// 페이지 가시성 변경 감지
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('페이지가 숨겨졌습니다.');
    } else {
        console.log('페이지가 다시 보입니다.');
    }
});

// 온라인/오프라인 상태 감지
window.addEventListener('online', function() {
    showNotification('인터넷 연결이 복구되었습니다.', 'success');
});

window.addEventListener('offline', function() {
    showNotification('인터넷 연결이 끊어졌습니다.', 'warning');
});

/* =========================================
   전역 함수 등록
   ========================================= */

// 전역 함수로 등록하여 HTML에서 호출 가능하게 함
window.toggleBookmark = toggleBookmark;
window.shareNotice = shareNotice;
window.printNotice = printNotice;
window.closeShareModal = closeShareModal;
window.copyShareUrl = copyShareUrl;
window.shareToKakao = shareToKakao;
window.shareToFacebook = shareToFacebook;
window.shareToTwitter = shareToTwitter;
window.shareToLine = shareToLine;
window.submitComment = submitComment;
window.showNotification = showNotification;
window.togglePin = togglePin;
window.toggleImportant = toggleImportant;
window.sendNotification = sendNotification;
window.deleteNotice = deleteNotice;

console.log('📄 공지사항 상세페이지 JavaScript가 완전히 로드되었습니다.');