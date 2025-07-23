// ===================
// 전역 변수 및 설정
// ===================

// 현재 열려있는 모달 추적
let currentModal = null;

// ===================
// 페이지 초기화
// ===================

// DOM이 준비되면 실행되는 초기화 함수
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 ECOVERY 통합 관리자 페이지 초기화 시작');
    
    // 각종 초기화 함수들 실행
    initializeAdminPage();
    setupEventListeners();
    animateCounters();
    loadInitialData();
    
    console.log('✅ 통합 관리자 페이지 초기화 완료');
});

// 기본 페이지 초기화
function initializeAdminPage() {
    // 통계 카드들에 페이드인 애니메이션 적용
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // 관리 섹션들에도 애니메이션 적용
    const managementSections = document.querySelectorAll('.management-section');
    managementSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.8s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, (index + 4) * 150);
    });
}

// ===================
// 이벤트 리스너 설정
// ===================

function setupEventListeners() {
    // 모달 배경 클릭시 닫기
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentModal) {
            closeModal(currentModal);
        }
    });
    
    // 키보드 단축키 설정
    setupKeyboardShortcuts();
}

// 키보드 단축키 설정
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + 숫자키로 빠른 모달 열기
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    openModal('wasteModal');
                    break;
                case '2':
                    e.preventDefault();
                    openModal('sharingModal');
                    break;
                case '3':
                    e.preventDefault();
                    openModal('userModal');
                    break;
                case '4':
                    e.preventDefault();
                    openModal('envTalkModal');
                    break;
                case '5':
                    e.preventDefault();
                    openModal('noticeModal');
                    break;
            }
        }
        
        // Ctrl/Cmd + R로 데이터 새로고침
        if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !e.shiftKey) {
            e.preventDefault();
            refreshAllData();
        }
    });
}

// ===================
// 데이터 로드 함수
// ===================

// 초기 데이터 로드
function loadInitialData() {
    // TODO: 백엔드 API에서 초기 데이터 로드
    console.log('초기 데이터 로드 - 백엔드 API 연결 필요');
    
    // 예시: 실제 구현시 다음과 같이 사용
    /*
    Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/waste'),
        fetch('/api/admin/sharing'),
        fetch('/api/admin/users'),
        fetch('/api/admin/envtalk'),
        fetch('/api/admin/notices')
    ]).then(responses => {
        return Promise.all(responses.map(response => response.json()));
    }).then(data => {
        updateDashboardStats(data[0]);
        updateWasteData(data[1]);
        updateSharingData(data[2]);
        updateUserData(data[3]);
        updateEnvTalkData(data[4]);
        updateNoticeData(data[5]);
    }).catch(error => {
        console.error('데이터 로드 실패:', error);
        showNotification('데이터를 불러오는데 실패했습니다.', 'error');
    });
    */
}

// 모든 데이터 새로고침
function refreshAllData() {
    console.log('🔄 데이터 새로고침 시작');
    showNotification('데이터를 새로고침하고 있습니다...', 'info');
    
    // TODO: 백엔드에서 최신 데이터 가져오기
    setTimeout(() => {
        showNotification('데이터 새로고침이 완료되었습니다.', 'success');
        // 실제로는 loadInitialData() 호출
        loadInitialData();
    }, 1000);
}

// ===================
// 카운터 애니메이션
// ===================

// 숫자가 올라가는 애니메이션 함수
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutQuart 이징 함수 적용
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeOutQuart;
        
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// 모든 카운터 애니메이션 시작
function animateCounters() {
    const counters = document.querySelectorAll('.card-value[data-count]');
    
    // Intersection Observer로 화면에 보일 때만 애니메이션 실행
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// ===================
// 모달 관리
// ===================

// 모달 열기
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        currentModal = modalId;
        document.body.style.overflow = 'hidden';
        console.log(`모달 열림: ${modalId}`);
    }
}

// 모달 닫기
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        currentModal = null;
        document.body.style.overflow = 'auto';
        console.log(`모달 닫힘: ${modalId}`);
    }
}

// ===================
// 관리 기능들
// ===================

// 분리배출 데이터 편집
function editWaste(id) {
    console.log(`분리배출 데이터 편집: ${id}`);
    // TODO: 편집 모달 열기 또는 편집 페이지로 이동
    showNotification('분리배출 데이터 편집 기능은 준비 중입니다.', 'info');
}

// 분리배출 데이터 삭제
function deleteWaste(id) {
    if (confirm('정말로 이 분리배출 기록을 삭제하시겠습니까?')) {
        console.log(`분리배출 데이터 삭제: ${id}`);
        // TODO: 백엔드 API 호출
        showNotification('분리배출 기록이 삭제되었습니다.', 'success');
    }
}

// 나눔 게시글 편집
function editSharing(id) {
    console.log(`나눔 게시글 편집: ${id}`);
    showNotification('나눔 게시글 편집 기능은 준비 중입니다.', 'info');
}

// 나눔 게시글 삭제
function deleteSharing(id) {
    if (confirm('정말로 이 나눔 게시글을 삭제하시겠습니까?')) {
        console.log(`나눔 게시글 삭제: ${id}`);
        showNotification('나눔 게시글이 삭제되었습니다.', 'success');
    }
}

// 회원 정보 편집
function editUser(id) {
    console.log(`회원 정보 편집: ${id}`);
    showNotification('회원 정보 편집 기능은 준비 중입니다.', 'info');
}

// 회원 상태 토글
function toggleUserStatus(id) {
    console.log(`회원 상태 변경: ${id}`);
    showNotification('회원 상태가 변경되었습니다.', 'success');
}

// 환경톡톡 게시글 편집
function editEnvTalk(id) {
    console.log(`환경톡톡 게시글 편집: ${id}`);
    showNotification('환경톡톡 게시글 편집 기능은 준비 중입니다.', 'info');
}

// 환경톡톡 게시글 삭제
function deleteEnvTalk(id) {
    if (confirm('정말로 이 환경톡톡 게시글을 삭제하시겠습니까?')) {
        console.log(`환경톡톡 게시글 삭제: ${id}`);
        showNotification('환경톡톡 게시글이 삭제되었습니다.', 'success');
    }
}

// 공지사항 편집
function editNotice(id) {
    console.log(`공지사항 편집: ${id}`);
    showNotification('공지사항 편집 기능은 준비 중입니다.', 'info');
}

// 공지사항 삭제
function deleteNotice(id) {
    if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
        console.log(`공지사항 삭제: ${id}`);
        showNotification('공지사항이 삭제되었습니다.', 'success');
    }
}

// ===================
// 알림 시스템
// ===================

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    // 기존 알림이 있으면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // 알림 스타일 설정
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `;
    
    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '1';
        closeButton.style.background = 'rgba(255,255,255,0.2)';
    });
    
    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '0.8';
        closeButton.style.background = 'none';
    });
    
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

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        default: return '#6c757d';
    }
}

// ===================
// 데이터 업데이트 함수들
// ===================

// 대시보드 통계 업데이트
function updateDashboardStats(stats) {
    // TODO: 실제 데이터로 통계 카드 업데이트
    console.log('대시보드 통계 업데이트:', stats);
}

// 분리배출 데이터 업데이트
function updateWasteData(data) {
    // TODO: 분리배출 테이블 업데이트
    console.log('분리배출 데이터 업데이트:', data);
}

// 나눔 데이터 업데이트
function updateSharingData(data) {
    // TODO: 나눔 테이블 업데이트
    console.log('나눔 데이터 업데이트:', data);
}

// 회원 데이터 업데이트
function updateUserData(data) {
    // TODO: 회원 테이블 업데이트
    console.log('회원 데이터 업데이트:', data);
}

// 환경톡톡 데이터 업데이트
function updateEnvTalkData(data) {
    // TODO: 환경톡톡 테이블 업데이트
    console.log('환경톡톡 데이터 업데이트:', data);
}

// 공지사항 데이터 업데이트
function updateNoticeData(data) {
    // TODO: 공지사항 테이블 업데이트
    console.log('공지사항 데이터 업데이트:', data);
}

// ===================
// 유틸리티 함수들
// ===================

// 홈으로 이동
function goHome() {
    window.location.href = '/admin';
}

// 로그아웃 처리
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        // TODO: 백엔드 로그아웃 API 호출
        console.log('로그아웃 처리');
        window.location.href = '/admin/login';
    }
}

// 테이블 정렬 기능
function sortTable(table, column, order = 'asc') {
    // TODO: 테이블 정렬 구현
    console.log(`테이블 정렬: ${table}, 컬럼: ${column}, 순서: ${order}`);
}

// 페이지네이션
function changePage(page) {
    // TODO: 페이지네이션 구현
    console.log(`페이지 변경: ${page}`);
}

// 검색 기능
function searchData(query, type) {
    // TODO: 검색 기능 구현
    console.log(`검색: ${query}, 타입: ${type}`);
}

// ===================
// 테스트용 함수 내보내기 (Node.js 환경에서 사용)
// ===================

// Node.js 환경에서 테스트할 때 사용
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeModal,
        showNotification,
        animateCounter,
        refreshAllData
    };
}