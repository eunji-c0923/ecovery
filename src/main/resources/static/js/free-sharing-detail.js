// =========================
// 전역 변수 (페이지 전체에서 사용)
// =========================

// 현재 로그인한 사용자 정보
const currentUser = {
    id: null,
    nickname: '',
    isLoggedIn: false
};

// 현재 게시글 작성자 정보
const postAuthor = {
    id: 'user123',
    nickname: '전자제품'
};

// 게시글 정보
const postData = {
    id: 'post456',
    title: 'MacBook Pro 13인치 (2021) M1 칩',
    status: '나눔중',
    viewCount: 125,
    createdAt: '15분 전'
};

// =========================
// 페이지가 로드되면 실행되는 함수
// =========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('무료나눔 상세페이지가 로드되었습니다!');
    
    // 로그인 상태 확인 및 UI 업데이트
    checkAuthStatus();
    
    // 작성자 권한에 따른 관리 버튼 표시
    updateAuthorActions();
    
    // 각종 이벤트 리스너 등록
    setupEventListeners();
    
    // 페이드인 애니메이션 적용
    setTimeout(function() {
        const detailContainer = document.querySelector('.detail-container');
        if (detailContainer) {
            detailContainer.classList.add('fade-in');
        }
    }, 200);
});

// =========================
// 로그인 상태 관리 함수
// =========================

// 서버에서 로그인 상태 확인
function checkAuthStatus() {
    fetch('/api/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.user) {
                currentUser.id = data.user.id;
                currentUser.nickname = data.user.nickname;
                currentUser.isLoggedIn = true;
            }
            updateAuthUI();
        })
        .catch(error => {
            console.error('로그인 상태 확인 오류:', error);
            updateAuthUI();
        });
}

// 로그인 상태에 따른 UI 업데이트
function updateAuthUI() {
    const loginButtons = document.getElementById('loginButtons');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser.isLoggedIn) {
        // 로그인된 상태
        if (loginButtons) loginButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        
        // 사용자 이름 업데이트
        const userName = userInfo?.querySelector('.user-name');
        if (userName) {
            userName.textContent = currentUser.nickname;
        }
    } else {
        // 로그인되지 않은 상태
        if (loginButtons) loginButtons.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// 작성자 권한에 따른 관리 버튼 표시
function updateAuthorActions() {
    const productActions = document.getElementById('productActions');
    
    // 로그인했고, 현재 사용자가 게시글 작성자인 경우에만 관리 버튼 표시
    if (currentUser.isLoggedIn && currentUser.id === postAuthor.id) {
        if (productActions) productActions.style.display = 'block';
        console.log('✅ 작성자 본인입니다. 수정/삭제 버튼을 표시합니다.');
    } else {
        if (productActions) productActions.style.display = 'none';
        if (!currentUser.isLoggedIn) {
            console.log('❌ 비로그인 상태입니다. 수정/삭제 버튼을 숨깁니다.');
        } else {
            console.log('❌ 작성자가 아닙니다. 수정/삭제 버튼을 숨깁니다.');
        }
    }
}

// =========================
// 이벤트 리스너 설정 함수
// =========================
function setupEventListeners() {
    // 드롭다운 토글 버튼
    const dropdownToggle = document.getElementById('dropdownToggle');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleDropdown();
        });
    }
    
    // 문서 전체 클릭시 드롭다운 닫기
    document.addEventListener('click', function(event) {
        if (dropdownMenu && !dropdownMenu.contains(event.target)) {
            closeDropdown();
        }
    });
    
    // ESC 키로 모달과 드롭다운 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeAllModals();
            closeDropdown();
        }
    });
    
    // 채팅 입력창에서 엔터키로 메시지 전송
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// =========================
// 드롭다운 메뉴 관련 함수
// =========================

// 드롭다운 메뉴 토글
function toggleDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    if (dropdownMenu?.classList.contains('show')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

// 드롭다운 메뉴 열기
function openDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownToggle = document.getElementById('dropdownToggle');
    
    if (dropdownMenu) {
        dropdownMenu.classList.add('show');
        
        // 버튼 활성화 상태 표시
        if (dropdownToggle) {
            dropdownToggle.style.background = 'var(--primary-green)';
            dropdownToggle.style.color = 'var(--white)';
        }
        
        console.log('드롭다운 메뉴가 열렸습니다.');
    }
}

// 드롭다운 메뉴 닫기
function closeDropdown() {
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownToggle = document.getElementById('dropdownToggle');
    
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
        
        // 버튼 원래 상태로 복원
        if (dropdownToggle) {
            dropdownToggle.style.background = '';
            dropdownToggle.style.color = '';
        }
    }
}

// =========================
// 이미지 관련 함수
// =========================

// 메인 이미지 변경 (썸네일 클릭시)
function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    const allThumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage && thumbnail) {
        // 메인 이미지 변경
        mainImage.src = thumbnail.src.replace('80x80', '500x400');
        
        // 기존 active 클래스 제거
        allThumbnails.forEach(function(thumb) {
            thumb.classList.remove('active');
        });
        
        // 클릭된 썸네일에 active 클래스 추가
        thumbnail.classList.add('active');
        
        // 애니메이션 효과
        mainImage.style.transform = 'scale(0.95)';
        setTimeout(function() {
            mainImage.style.transform = 'scale(1)';
        }, 150);
        
        console.log('메인 이미지가 변경되었습니다.');
    }
}

// =========================
// 모달 관련 함수
// =========================

// 연락처 모달 열기
function showContactInfo() {
    // 로그인 확인
    if (!currentUser.isLoggedIn) {
        showNotification('로그인 후 연락처를 확인할 수 있습니다.', 'error');
        return;
    }
    
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        console.log('연락처 모달이 열렸습니다.');
    }
}

// 채팅 모달 열기
function showChatModal() {
    // 로그인 확인
    if (!currentUser.isLoggedIn) {
        showNotification('로그인 후 채팅할 수 있습니다.', 'error');
        return;
    }
    
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // 채팅 입력창에 포커스
        setTimeout(function() {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 300);
        
        // 기존 채팅 메시지 로드
        loadChatMessages();
        
        console.log('채팅 모달이 열렸습니다.');
    }
}

// 채팅 메시지 로드
function loadChatMessages() {
    fetch(`/api/chat/messages/${postData.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    chatMessages.innerHTML = '';
                    data.messages.forEach(message => {
                        addMessageToChat(message);
                    });
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            }
        })
        .catch(error => {
            console.error('채팅 메시지 로드 오류:', error);
        });
}

// 특정 모달 닫기
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        console.log(modalId + ' 모달이 닫혔습니다.');
    }
}

// 모든 모달 닫기
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

// =========================
// 채팅 관련 함수
// =========================

// 메시지 전송
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const messageText = chatInput?.value.trim();
    
    if (!messageText) {
        showNotification('메시지를 입력해주세요.', 'error');
        return;
    }
    
    // 서버에 메시지 전송
    fetch('/api/chat/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            postId: postData.id,
            receiverId: postAuthor.id,
            message: messageText
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // UI에 메시지 추가
            addMessageToChat({
                id: data.messageId,
                content: messageText,
                senderId: currentUser.id,
                senderName: currentUser.nickname,
                timestamp: new Date().toISOString(),
                isOwn: true
            });
            
            // 입력창 비우기
            chatInput.value = '';
            
            // 스크롤을 최신 메시지로 이동
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        } else {
            showNotification('메시지 전송 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('메시지 전송 오류:', error);
        showNotification('메시지 전송 중 오류가 발생했습니다.', 'error');
    });
}

// 채팅에 메시지 추가
function addMessageToChat(message) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.isOwn ? 'sent' : 'received'}`;
    
    const timeString = formatTime(new Date(message.timestamp));
    
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${timeString}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
}

// 시간 포맷팅 함수
function formatTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${ampm} ${displayHours}:${displayMinutes}`;
}

// =========================
// 게시글 관리 함수 (수정/삭제)
// =========================

// 게시글 수정
function editPost() {
    closeDropdown();
    
    if (confirm('게시글을 수정하시겠습니까?')) {
        showNotification('수정 페이지로 이동합니다.', 'success');
        
        setTimeout(function() {
            window.location.href = '/free-sharing/edit/' + postData.id;
        }, 1000);
    }
}

// 게시글 삭제
function deletePost() {
    closeDropdown();
    
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
        // 삭제 중 상태 표시
        showNotification('게시글을 삭제하는 중입니다...', 'info');
        
        // 서버에 삭제 요청
        fetch(`/api/free-sharing/posts/${postData.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('게시글이 삭제되었습니다.', 'success');
                
                // 목록 페이지로 이동
                setTimeout(function() {
                    window.location.href = '/free-sharing/list';
                }, 1500);
            } else {
                showNotification(data.message || '삭제 중 오류가 발생했습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('게시글 삭제 오류:', error);
            showNotification('삭제 중 오류가 발생했습니다.', 'error');
        });
    }
}

// =========================
// 알림 메시지 관련 함수
// =========================

// 알림 메시지 표시
function showNotification(message, type) {
    type = type || 'success';
    
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 페이지에 추가
    document.body.appendChild(notification);
    
    // 애니메이션으로 표시
    setTimeout(function() {
        notification.classList.add('show');
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(function() {
        notification.classList.remove('show');
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// =========================
// 기타 유틸리티 함수
// =========================

// 조회수 증가
function increaseViewCount() {
    fetch(`/api/free-sharing/posts/${postData.id}/view`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const viewCountElement = document.querySelector('.view-count');
            if (viewCountElement) {
                viewCountElement.textContent = `👀 ${data.viewCount}`;
            }
        }
    })
    .catch(error => {
        console.error('조회수 증가 오류:', error);
    });
}

// 상품 상태 업데이트
function updateProductStatus(newStatus) {
    fetch(`/api/free-sharing/posts/${postData.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const statusBadge = document.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.textContent = newStatus;
                
                // 상태에 따른 색상 변경
                statusBadge.className = 'status-badge';
                switch(newStatus) {
                    case '나눔중':
                        statusBadge.style.background = 'var(--success-green)';
                        break;
                    case '나눔완료':
                        statusBadge.style.background = 'var(--medium-gray)';
                        break;
                    case '예약중':
                        statusBadge.style.background = 'var(--warning-orange)';
                        break;
                }
            }
            showNotification('상품 상태가 업데이트되었습니다.', 'success');
        } else {
            showNotification('상태 업데이트 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('상태 업데이트 오류:', error);
        showNotification('상태 업데이트 중 오류가 발생했습니다.', 'error');
    });
}

// 북마크 토글
function toggleBookmark() {
    if (!currentUser.isLoggedIn) {
        showNotification('로그인 후 관심 상품으로 등록할 수 있습니다.', 'error');
        return;
    }
    
    fetch(`/api/free-sharing/posts/${postData.id}/bookmark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.isBookmarked) {
                showNotification('관심 상품으로 등록되었습니다! ❤️', 'success');
            } else {
                showNotification('관심 상품에서 제거되었습니다.', 'success');
            }
        } else {
            showNotification('처리 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('북마크 토글 오류:', error);
        showNotification('처리 중 오류가 발생했습니다.', 'error');
    });
}

// 신고하기
function reportPost() {
    if (!currentUser.isLoggedIn) {
        showNotification('로그인 후 신고할 수 있습니다.', 'error');
        return;
    }
    
    if (confirm('이 게시글을 신고하시겠습니까?')) {
        fetch(`/api/free-sharing/posts/${postData.id}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reason: 'inappropriate_content' // 실제로는 사용자가 선택한 신고 사유
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('신고가 접수되었습니다. 검토 후 조치하겠습니다.', 'success');
            } else {
                showNotification('신고 처리 중 오류가 발생했습니다.', 'error');
            }
        })
        .catch(error => {
            console.error('신고 처리 오류:', error);
            showNotification('신고 처리 중 오류가 발생했습니다.', 'error');
        });
    }
}

// =========================
// 페이지 초기화 완료 후 실행
// =========================

// DOM이 완전히 로드된 후 추가 설정
document.addEventListener('DOMContentLoaded', function() {
    // 조회수 증가 (1초 후)
    setTimeout(increaseViewCount, 1000);
    
    // 모달 배경 클릭시 닫기
    const modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
});

// =========================
// 키보드 단축키
// =========================

// 키보드 이벤트 처리
document.addEventListener('keydown', function(event) {
    // Ctrl + D: 북마크 토글
    if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        toggleBookmark();
    }
    
    // Ctrl + Enter: 채팅에서 메시지 전송
    if (event.ctrlKey && event.key === 'Enter') {
        const chatModal = document.getElementById('chatModal');
        if (chatModal && chatModal.classList.contains('show')) {
            sendMessage();
        }
    }
    
    // F2: 수정 (작성자인 경우)
    if (event.key === 'F2' && currentUser.isLoggedIn && currentUser.id === postAuthor.id) {
        event.preventDefault();
        editPost();
    }
});

// =========================
// 전역 함수로 노출 (HTML에서 onclick 등으로 사용)
// =========================

// HTML의 onclick에서 사용할 수 있도록 전역으로 노출
window.changeMainImage = changeMainImage;
window.showContactInfo = showContactInfo;
window.showChatModal = showChatModal;
window.closeModal = closeModal;
window.sendMessage = sendMessage;
window.editPost = editPost;
window.deletePost = deletePost;

// 기타 유용한 전역 함수들
window.showNotification = showNotification;
window.toggleDropdown = toggleDropdown;
window.closeDropdown = closeDropdown;
window.updateProductStatus = updateProductStatus;
window.toggleBookmark = toggleBookmark;
window.reportPost = reportPost;

// =========================
// 에러 핸들링
// =========================

// 전역 에러 처리
window.addEventListener('error', function(event) {
    console.error('페이지 오류:', event.error);
    
    // 서버에 에러 리포트 전송
    fetch('/api/errors', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            error: event.error?.message || 'Unknown error',
            stack: event.error?.stack,
            url: window.location.href,
            timestamp: new Date().toISOString()
        })
    }).catch(console.error);
});

// Promise 거부 처리
window.addEventListener('unhandledrejection', function(event) {
    console.error('처리되지 않은 Promise 거부:', event.reason);
    showNotification('작업 처리 중 오류가 발생했습니다.', 'error');
});

// =========================
// 최종 로그
// =========================

console.log('🤝 무료나눔 상세페이지 JavaScript가 로드되었습니다.');
console.log('📝 사용 가능한 기능:');
console.log('   - 실시간 채팅 기능');
console.log('   - 작성자 권한에 따른 수정/삭제 버튼');
console.log('   - 드롭다운 메뉴 토글');
console.log('   - 이미지 썸네일 변경');
console.log('   - 연락처/채팅 모달');
console.log('   - 키보드 단축키 지원');
console.log('   - 반응형 UI');