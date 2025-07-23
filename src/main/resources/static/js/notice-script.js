/* =========================================
   공지사항 페이지 JavaScript
   ========================================= */

// 전역 변수
let currentPage = 1;           // 현재 페이지 번호
let currentCategory = 'all';   // 현재 선택된 카테고리
let notificationEnabled = false; // 알림 설정 상태

// DOM 요소 참조
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

/* =========================================
   초기화 함수
   ========================================= */

// DOM이 로드된 후 실행되는 초기화 함수
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 페이지 기능 초기화
function initializePage() {
    console.log('🌱 공지사항 페이지가 로드되었습니다.');
    
    // 모바일 메뉴 이벤트 리스너 등록
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // 검색 입력창 엔터키 이벤트 리스너
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchNotices();
            }
        });
    }

    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // 스크롤 시 헤더 효과
    window.addEventListener('scroll', handleHeaderScroll);

    // 페이드인 애니메이션 적용
    initializeFadeInAnimation();
    
    // 저장된 알림 설정 불러오기
    loadNotificationSettings();
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
   카테고리 탭 관련 함수
   ========================================= */

// 탭 전환 함수
function switchTab(element, category) {
    // 모든 탭에서 active 클래스 제거
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 클릭된 탭에 active 클래스 추가
    element.classList.add('active');
    
    // 현재 카테고리 업데이트
    currentCategory = category;
    
    // 카테고리별 공지사항 필터링
    filterNotices(category);
    
    // 사용자에게 피드백 제공
    showNotification(`${element.textContent} 카테고리로 전환되었습니다`, 'info');
}

// 카테고리별 공지사항 필터링
function filterNotices(category) {
    const notices = document.querySelectorAll('.notice-item');
    
    notices.forEach(notice => {
        if (category === 'all') {
            // 전체 보기
            notice.style.display = 'grid';
        } else {
            // 특정 카테고리 필터링
            const tags = notice.querySelectorAll('.tag');
            let hasMatchingTag = false;
            
            tags.forEach(tag => {
                const tagText = tag.textContent.toLowerCase();
                if (
                    (category === 'important' && notice.classList.contains('important')) ||
                    (category === 'service' && (tagText.includes('서비스') || tagText.includes('가이드'))) ||
                    (category === 'maintenance' && (tagText.includes('점검') || tagText.includes('서버'))) ||
                    (category === 'event' && (tagText.includes('이벤트') || tagText.includes('혜택'))) ||
                    (category === 'update' && (tagText.includes('업데이트') || tagText.includes('신기능')))
                ) {
                    hasMatchingTag = true;
                }
            });
            
            notice.style.display = hasMatchingTag ? 'grid' : 'none';
        }
    });
}

/* =========================================
   검색 기능
   ========================================= */

// 공지사항 검색
function searchNotices() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        showNotification('검색어를 입력해주세요', 'info');
        return;
    }
    
    const notices = document.querySelectorAll('.notice-item');
    let visibleCount = 0;
    
    notices.forEach(notice => {
        const title = notice.querySelector('.notice-title').textContent.toLowerCase();
        const author = notice.querySelector('.notice-author').textContent.toLowerCase();
        const tags = Array.from(notice.querySelectorAll('.tag'))
            .map(tag => tag.textContent.toLowerCase())
            .join(' ');
        
        // 제목, 작성자, 태그에서 검색어 매칭
        if (title.includes(searchTerm) || author.includes(searchTerm) || tags.includes(searchTerm)) {
            notice.style.display = 'grid';
            visibleCount++;
        } else {
            notice.style.display = 'none';
        }
    });
    
    showNotification(`"${searchTerm}" 검색 결과: ${visibleCount}개 공지사항`, 'success');
}

/* =========================================
   공지사항 상세보기
   ========================================= */

// 공지사항 상세보기
function viewNotice(noticeId) {
    // 실제 프로젝트에서는 서버에서 데이터를 가져와야 함
    const noticeData = getSampleNoticeData(noticeId);
    
    if (noticeData) {
        // URL 변경 (브라우저 뒤로가기 지원)
        window.history.pushState({ page: 'notice', id: noticeId }, '', `/notice/${noticeId}`);
        
        // 공지사항 상세 페이지 표시
        showNoticeDetail(noticeData);
        
        // 조회수 증가
        incrementViewCount(noticeId);
        
        showNotification(`${noticeData.title} 공지사항을 조회합니다`, 'info');
    }
}

// 공지사항 상세 페이지 표시
function showNoticeDetail(noticeData) {
    // 목록 숨기기
    document.querySelector('.notice-container').style.display = 'none';
    
    // 페이지 헤더 변경
    const pageHeader = document.querySelector('.page-header');
    pageHeader.querySelector('h1').textContent = '📄 공지사항 상세';
    pageHeader.querySelector('p').textContent = noticeData.title;
    
    // 상세 페이지 생성 및 표시
    createNoticeDetailPage(noticeData);
}

// 공지사항 상세 페이지 생성
function createNoticeDetailPage(noticeData) {
    let detailContainer = document.querySelector('.notice-detail-container');
    
    if (!detailContainer) {
        detailContainer = document.createElement('div');
        detailContainer.className = 'notice-detail-container fade-in';
        document.querySelector('.container').appendChild(detailContainer);
    }
    
    detailContainer.innerHTML = `
        <div class="notice-detail-content">
            <button class="back-btn" onclick="goBackToList()">
                ← 목록으로 돌아가기
            </button>
            
            <article class="notice-article">
                <header class="notice-article-header">
                    ${noticeData.isImportant ? '<div class="important-badge-large">중요 공지</div>' : ''}
                    <h1 class="notice-article-title">${noticeData.title}</h1>
                    <div class="notice-article-meta">
                        <div class="author-info">
                            <span class="author-avatar">${noticeData.authorAvatar}</span>
                            <span class="author-name">${noticeData.author}</span>
                        </div>
                        <div class="notice-info">
                            <span class="notice-date">${noticeData.date}</span>
                            <span class="notice-views">조회 ${noticeData.views}</span>
                        </div>
                    </div>
                    <div class="notice-tags">
                        ${noticeData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </header>
                
                <div class="notice-article-content">
                    ${noticeData.content}
                </div>
                
                <div class="notice-actions-bottom">
                    <a href="#" class="notice-action-btn share" onclick="shareNotice(${noticeData.id})">
                        🔗 공유하기
                    </a>
                    <a href="#" class="notice-action-btn print" onclick="printNotice()">
                        🖨️ 인쇄하기
                    </a>
                </div>
            </article>
            
            ${createRelatedNotices(noticeData.id)}
        </div>
    `;
    
    detailContainer.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 목록으로 돌아가기
function goBackToList() {
    // URL 복원
    window.history.pushState({ page: 'list' }, '', '/notice');
    
    // 상세 페이지 숨기기
    const detailContainer = document.querySelector('.notice-detail-container');
    if (detailContainer) {
        detailContainer.style.display = 'none';
    }
    
    // 목록 페이지 표시
    document.querySelector('.notice-container').style.display = 'grid';
    
    // 페이지 헤더 복원
    const pageHeader = document.querySelector('.page-header');
    pageHeader.querySelector('h1').textContent = '📢 공지사항';
    pageHeader.querySelector('p').textContent = 'GreenCycle의 새로운 소식과 중요한 안내사항을 확인하세요';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =========================================
   페이지네이션
   ========================================= */

// 페이지 변경
function changePage(page) {
    if (page === 'prev') {
        if (currentPage > 1) {
            currentPage--;
        }
    } else if (page === 'next') {
        if (currentPage < 5) { // 총 5페이지 가정
            currentPage++;
        }
    } else {
        currentPage = page;
    }
    
    // 활성 페이지 버튼 업데이트
    updateActivePageButton();
    
    // 실제 프로젝트에서는 서버에서 새 데이터를 가져와야 함
    showNotification(`${currentPage}페이지로 이동합니다`, 'info');
    
    // 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 활성 페이지 버튼 업데이트
function updateActivePageButton() {
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const pageBtn = document.querySelector(`.page-btn:nth-child(${currentPage + 1})`);
    if (pageBtn && !isNaN(currentPage)) {
        pageBtn.classList.add('active');
    }
}

/* =========================================
   알림 설정
   ========================================= */

// 알림 설정 토글
function toggleNotification() {
    notificationEnabled = !notificationEnabled;
    
    // 설정 저장
    localStorage.setItem('notificationEnabled', notificationEnabled);
    
    // 버튼 텍스트 업데이트
    const btn = document.querySelector('.notification-btn');
    if (btn) {
        btn.textContent = notificationEnabled ? '알림 해제' : '알림 설정';
    }
    
    const message = notificationEnabled 
        ? '공지사항 알림이 설정되었습니다! 📧' 
        : '공지사항 알림이 해제되었습니다';
    
    showNotification(message, 'success');
}

// 저장된 알림 설정 불러오기
function loadNotificationSettings() {
    const saved = localStorage.getItem('notificationEnabled');
    if (saved !== null) {
        notificationEnabled = JSON.parse(saved);
        
        const btn = document.querySelector('.notification-btn');
        if (btn) {
            btn.textContent = notificationEnabled ? '알림 해제' : '알림 설정';
        }
    }
}

/* =========================================
   공지사항 상세 페이지 추가 기능
   ========================================= */

// 관련 공지사항 생성
function createRelatedNotices(currentNoticeId) {
    const relatedNotices = [
        { id: 4, title: "📱 모바일 앱 버전 1.5.2 업데이트 출시", author: "개발팀", date: "2025.07.16" },
        { id: 6, title: "♻️ 새로운 재활용 가이드 추가 안내", author: "콘텐츠팀", date: "2025.07.12" },
        { id: 7, title: "🌱 커뮤니티 가이드라인 업데이트", author: "운영팀", date: "2025.07.10" }
    ];
    
    const filteredNotices = relatedNotices.filter(notice => notice.id !== currentNoticeId);
    
    if (filteredNotices.length === 0) {
        return '';
    }
    
    return `
        <section class="related-notices">
            <h3>📎 관련 공지사항</h3>
            ${filteredNotices.map(notice => `
                <div class="related-notice-item" onclick="viewNotice(${notice.id})">
                    <div class="related-notice-title">${notice.title}</div>
                    <div class="related-notice-meta">
                        <span>${notice.author}</span>
                        <span>${notice.date}</span>
                    </div>
                </div>
            `).join('')}
        </section>
    `;
}

// 공지사항 공유
function shareNotice(noticeId) {
    const currentUrl = window.location.origin + `/notice/${noticeId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'GreenCycle 공지사항',
            text: '중요한 공지사항을 공유합니다.',
            url: currentUrl
        }).then(() => {
            showNotification('공지사항이 공유되었습니다! 📤', 'success');
        }).catch(() => {
            copyToClipboard(currentUrl);
        });
    } else {
        copyToClipboard(currentUrl);
    }
}

// 클립보드에 복사
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('링크가 클립보드에 복사되었습니다! 📋', 'success');
        });
    } else {
        // 구형 브라우저 대응
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('링크가 복사되었습니다! 📋', 'success');
    }
}

// 공지사항 인쇄
function printNotice() {
    // 인쇄 스타일을 위한 CSS 추가
    const printStyle = document.createElement('style');
    printStyle.textContent = `
        @media print {
            .header, .footer, .back-btn, .notice-actions-bottom, .related-notices {
                display: none !important;
            }
            .notice-detail-container {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 20px !important;
            }
            .notice-article-title {
                color: #000 !important;
            }
            .tag {
                border: 1px solid #000 !important;
                color: #000 !important;
                background: transparent !important;
            }
        }
    `;
    document.head.appendChild(printStyle);
    
    // 인쇄 실행
    window.print();
    
    // 인쇄 후 스타일 제거
    setTimeout(() => {
        document.head.removeChild(printStyle);
    }, 1000);
    
    showNotification('인쇄 페이지를 준비했습니다! 🖨️', 'info');
}

// 조회수 증가 (실제로는 서버에 요청)
function incrementViewCount(noticeId) {
    console.log(`공지사항 ${noticeId} 조회수 증가`);
    
    // UI에서 조회수 업데이트
    const noticeItem = document.querySelector(`[onclick="viewNotice(${noticeId})"]`);
    if (noticeItem) {
        const viewsElement = noticeItem.querySelector('.notice-views');
        if (viewsElement) {
            const currentViews = parseInt(viewsElement.textContent.match(/\d+/)[0]);
            viewsElement.textContent = `👁️ ${currentViews + 1}`;
        }
    }
}

// 샘플 공지사항 데이터
function getSampleNoticeData(noticeId) {
    const sampleNotices = {
        1: {
            id: 1,
            title: "💡 GreenCycle 2.0 업데이트 안내 - 새로운 기능 및 개선사항",
            author: "운영팀",
            authorAvatar: "👨‍💼",
            date: "2025.07.15",
            views: 1245,
            isImportant: true,
            tags: ["업데이트", "신기능", "중요"],
            content: `
                <h3>GreenCycle 2.0 주요 업데이트 내용</h3>
                <p>안녕하세요, GreenCycle 사용자 여러분! 오랜 기간 준비한 <strong>GreenCycle 2.0 업데이트</strong>를 안내드립니다.</p>
                
                <div class="notice-info-box">
                    <h4>💡 주요 변경사항</h4>
                    <p>이번 업데이트는 사용자 경험 개선과 새로운 환경 보호 기능에 중점을 두었습니다.</p>
                </div>
                
                <h3>🆕 새로운 기능</h3>
                <ul>
                    <li><strong>AI 기반 분리배출 가이드:</strong> 사진을 찍으면 자동으로 분리배출 방법을 안내합니다</li>
                    <li><strong>에코포인트 시스템 개선:</strong> 더욱 다양한 활동으로 포인트를 적립하세요</li>
                    <li><strong>친환경 제품 추천:</strong> 개인화된 친환경 제품을 추천해드립니다</li>
                    <li><strong>커뮤니티 기능 강화:</strong> 더욱 활발한 소통이 가능합니다</li>
                </ul>
                
                <h3>🔧 개선사항</h3>
                <ul>
                    <li>페이지 로딩 속도 <strong>50% 향상</strong></li>
                    <li>모바일 사용성 개선</li>
                    <li>검색 기능 정확도 향상</li>
                    <li>보안 강화</li>
                </ul>
                
                <div class="notice-info-box warning">
                    <h4>⚠️ 업데이트 시 주의사항</h4>
                    <p>업데이트 적용 후 브라우저 캐시를 삭제해주시기 바랍니다.</p>
                </div>
                
                <h3>📅 적용 일정</h3>
                <p><strong>2025년 7월 20일(일) 오전 9시</strong>부터 새로운 기능을 이용하실 수 있습니다.</p>
                
                <blockquote>
                    궁금한 점이 있으시면 고객센터로 문의해주세요! 더 나은 서비스로 보답하겠습니다.
                </blockquote>
            `
        },
        2: {
            id: 2,
            title: "🔧 정기 서버 점검 안내 (7월 25일 새벽 2시-6시)",
            author: "기술팀",
            authorAvatar: "👨‍💻",
            date: "2025.07.20",
            views: 892,
            isImportant: true,
            tags: ["점검", "서버"],
            content: `
                <h3>정기 서버 점검 안내</h3>
                <p>안정적인 서비스 제공을 위해 <strong>정기 서버 점검</strong>을 실시합니다.</p>
                
                <div class="notice-info-box danger">
                    <h4>🚨 서비스 중단 안내</h4>
                    <p>점검 시간 동안 모든 서비스 이용이 중단됩니다.</p>
                </div>
                
                <h3>📅 점검 일정</h3>
                <ul>
                    <li><strong>날짜:</strong> 2025년 7월 25일 (목)</li>
                    <li><strong>시간:</strong> 새벽 2시 ~ 6시 (4시간)</li>
                    <li><strong>영향:</strong> 전체 서비스 일시 중단</li>
                </ul>
                
                <h3>🔧 점검 내용</h3>
                <ul>
                    <li>서버 보안 업데이트</li>
                    <li>데이터베이스 최적화</li>
                    <li>백업 시스템 점검</li>
                    <li>성능 향상 작업</li>
                </ul>
                
                <div class="notice-info-box">
                    <h4>📞 긴급 문의</h4>
                    <p>점검 중 긴급한 문의사항이 있으시면 <strong>1588-1234</strong>로 연락해주세요.</p>
                </div>
                
                <p><strong>점검 시간 중에는 모든 서비스 이용이 불가능합니다. 양해 부탁드립니다.</strong></p>
            `
        },
        3: {
            id: 3,
            title: "🎉 여름 특별 이벤트 - 에코포인트 2배 적립!",
            author: "마케팅팀",
            authorAvatar: "🎯",
            date: "2025.07.18",
            views: 567,
            isImportant: false,
            tags: ["이벤트", "혜택"],
            content: `
                <h3>🌞 여름 특별 이벤트</h3>
                <p>무더운 여름, GreenCycle과 함께 더욱 시원하게 환경 보호하세요!</p>
                
                <h3>🎁 이벤트 혜택</h3>
                <ul>
                    <li><strong>모든 환경 활동 에코포인트 2배 적립</strong></li>
                    <li>분리배출 인증 시 추가 보너스 포인트</li>
                    <li>친환경 제품 구매 시 10% 할인</li>
                    <li>커뮤니티 활동 참여 시 특별 리워드</li>
                </ul>
                
                <div class="notice-info-box">
                    <h4>🎯 참여 방법</h4>
                    <p>평소와 동일하게 환경 보호 활동을 하시면 자동으로 2배 포인트가 적립됩니다!</p>
                </div>
                
                <h3>📅 이벤트 기간</h3>
                <p><strong>2025년 7월 20일 ~ 8월 31일</strong> (42일간)</p>
                
                <h3>🏆 추가 이벤트</h3>
                <ul>
                    <li>월간 환경왕 선정 (특별 상품 증정)</li>
                    <li>SNS 인증 이벤트</li>
                    <li>친구 추천 이벤트</li>
                </ul>
                
                <p><strong>🔥 이번 기회를 놓치지 마세요! 함께 지구를 지켜요! 🌍</strong></p>
            `
        },
        4: {
            id: 4,
            title: "📱 모바일 앱 버전 1.5.2 업데이트 출시",
            author: "개발팀",
            authorAvatar: "👨‍💻",
            date: "2025.07.16",
            views: 423,
            isImportant: false,
            tags: ["모바일", "업데이트"],
            content: `
                <h3>📱 모바일 앱 업데이트</h3>
                <p>GreenCycle 모바일 앱의 새로운 버전이 출시되었습니다!</p>
                
                <h3>✨ 주요 개선사항</h3>
                <ul>
                    <li>카메라 인식 속도 향상</li>
                    <li>배터리 사용량 최적화</li>
                    <li>UI/UX 개선</li>
                    <li>버그 수정</li>
                </ul>
                
                <h3>📲 업데이트 방법</h3>
                <p>앱스토어 또는 플레이스토어에서 업데이트해주세요.</p>
            `
        },
        5: {
            id: 5,
            title: "🔒 개인정보처리방침 개정 안내",
            author: "법무팀",
            authorAvatar: "⚖️",
            date: "2025.07.14",
            views: 234,
            isImportant: false,
            tags: ["정책", "개인정보"],
            content: `
                <h3>📋 개인정보처리방침 개정</h3>
                <p>관련 법령 개정에 따라 개인정보처리방침을 업데이트했습니다.</p>
                
                <h3>🔍 주요 변경사항</h3>
                <ul>
                    <li>개인정보 수집 목적 명확화</li>
                    <li>제3자 제공 기준 강화</li>
                    <li>사용자 권리 확대</li>
                </ul>
                
                <p>자세한 내용은 홈페이지에서 확인하세요.</p>
            `
        }
        // 더 많은 샘플 데이터...
    };
    
    return sampleNotices[noticeId] || null;
}

/* =========================================
   네비게이션 함수
   ========================================= */

// 홈으로 이동
function goHome() {
    showNotification('홈페이지로 이동합니다', 'info');
    // 실제로는 window.location.href = '/'; 또는 라우터 사용
}

/* =========================================
   키보드 단축키
   ========================================= */

// 키보드 단축키 처리
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K로 검색창 포커스
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // ESC로 모바일 메뉴 닫기
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
    
    // 숫자 키로 카테고리 전환
    if (e.key >= '1' && e.key <= '6') {
        const categoryIndex = parseInt(e.key) - 1;
        const tabs = document.querySelectorAll('.tab');
        if (tabs[categoryIndex]) {
            tabs[categoryIndex].click();
        }
    }
});

/* =========================================
   브라우저 뒤로가기 지원
   ========================================= */

// 브라우저 뒤로가기 버튼 지원
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.page === 'notice') {
        const noticeData = getSampleNoticeData(event.state.id);
        if (noticeData) {
            showNoticeDetail(noticeData);
        }
    } else {
        goBackToList();
    }
});

/* =========================================
   전역 함수 등록
   ========================================= */

// 전역 함수로 등록하여 HTML에서 호출 가능하게 함
window.showNotification = showNotification;
window.switchTab = switchTab;
window.searchNotices = searchNotices;
window.viewNotice = viewNotice;
window.changePage = changePage;
window.toggleNotification = toggleNotification;
window.goHome = goHome;
window.goBackToList = goBackToList;
window.shareNotice = shareNotice;
window.printNotice = printNotice;
window.createRelatedNotices = createRelatedNotices;

console.log('📢 공지사항 페이지 JavaScript가 완전히 로드되었습니다.');