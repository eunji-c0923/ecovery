/* ========================================
   GreenCycle 관리자 회원 관리 JavaScript (서버 연동)
   ======================================== */

/* ========================================
   전역 변수 및 설정
   ======================================== */

// 전역 상태 관리 객체
const AdminState = {
    currentMember: null,
    serverData: window.SERVER_DATA || {}
};

/* ========================================
   초기화 함수
   ======================================== */

/**
 * 페이지 로드 시 초기화 함수
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 GreenCycle 관리자 페이지가 로드되었습니다.');
    
    // 서버 데이터 확인
    if (AdminState.serverData.memberPage) {
        console.log(`✅ 총 ${AdminState.serverData.memberPage.totalElements}명의 회원 데이터가 로드되었습니다.`);
    }
    
    // 초기화 함수들 실행
    initializeEventListeners();
    
    console.log('📋 관리자 페이지 초기화 완료');
});

/**
 * 이벤트 리스너 초기화
 */
function initializeEventListeners() {
    // 전체 선택 체크박스
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // 모달 관련 이벤트
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    const memberModal = document.getElementById('memberModal');
    if (memberModal) {
        memberModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // 탭 전환 이벤트
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log('📎 모든 이벤트 리스너가 등록되었습니다.');
}

/* ========================================
   회원 관리 기능
   ======================================== */

/**
 * 전체 선택 처리
 */
function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const memberCheckboxes = document.querySelectorAll('.member-checkbox');
    
    memberCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    console.log(`☑️ 전체 선택: ${selectAllCheckbox.checked}`);
}

/**
 * 회원 삭제
 * @param {string} memberId - 회원 ID
 */
function deleteMember(memberId) {
    if (confirm('정말로 이 회원을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
        console.log(`🗑️ 회원 삭제 요청: ${memberId}`);
        
        // 서버에 삭제 요청
        fetch(`/admin/members/${memberId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('회원 삭제에 실패했습니다.');
        })
        .then(data => {
            if (data.success) {
                showNotification('회원이 성공적으로 삭제되었습니다.', 'success');
                // 페이지 새로고침
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error(data.message || '회원 삭제에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('회원 삭제 중 오류:', error);
            showNotification(error.message, 'error');
        });
    }
}

/* ========================================
   모달 관리 기능
   ======================================== */

/**
 * 회원 상세 모달 열기
 * @param {string} memberId - 회원 ID
 */
function openMemberModal(memberId) {
    console.log(`👤 회원 상세 정보 모달 열기: ${memberId}`);
    
    // 로딩 상태 표시
    showLoadingModal();
    
    // 서버에서 회원 상세 정보 조회
    fetch(`/admin/members/${memberId}/detail`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('회원 정보를 불러오는데 실패했습니다.');
    })
    .then(memberData => {
        AdminState.currentMember = memberData;
        
        // 모달에 데이터 설정
        updateModalBasicInfo(memberData);
        
        // 모달 표시
        const modal = document.getElementById('memberModal');
        modal.classList.add('active');
        
        // 첫 번째 탭 활성화
        switchTab('basic');
        
        // body 스크롤 비활성화
        document.body.style.overflow = 'hidden';
    })
    .catch(error => {
        console.error('회원 정보 조회 중 오류:', error);
        showNotification(error.message, 'error');
    });
}

/**
 * 로딩 모달 표시
 */
function showLoadingModal() {
    const modal = document.getElementById('memberModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 50px;">
            <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #4CAF50; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p>회원 정보를 불러오는 중...</p>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * 모달 기본 정보 업데이트
 * @param {Object} member - 회원 정보 객체
 */
function updateModalBasicInfo(member) {
    // 모달 기본 구조 복원
    const modal = document.getElementById('memberModal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="member-info-section">
            <div class="member-profile">
                <div class="member-avatar" id="memberAvatar">${member.gender === 'MALE' ? '👨' : '👩'}</div>
                <div class="member-basic-info">
                    <h3 id="memberName">${member.name}</h3>
                    <p id="memberEmail">${member.email}</p>
                    <div class="member-badges">
                        <span class="status-badge ${member.status.toLowerCase()}" id="memberStatus">${getStatusText(member.status)}</span>
                        <span class="type-badge" id="memberType">${getTypeText(member.type)}</span>
                        <span class="level-badge" id="memberLevel">${member.level || 'Bronze'}</span>
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn btn-edit" onclick="editCurrentMember()">✏️ 정보 수정</button>
                    <button class="btn btn-message" onclick="sendMessageToMember()">💬 메시지 발송</button>
                    <button class="btn btn-suspend" onclick="suspendCurrentMember()">⚠️ 계정 정지</button>
                </div>
            </div>

            <div class="modal-tabs">
                <button class="tab-btn active" data-tab="basic">기본 정보</button>
                <button class="tab-btn" data-tab="activity">활동 내역</button>
                <button class="tab-btn" data-tab="transactions">거래 내역</button>
                <button class="tab-btn" data-tab="points">포인트 내역</button>
                <button class="tab-btn" data-tab="support">고객 지원</button>
            </div>

            <div class="tab-content">
                <div class="tab-panel active" id="basicTab">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>회원 ID</label>
                            <span id="detailMemberId">${member.id}</span>
                        </div>
                        <div class="info-item">
                            <label>닉네임</label>
                            <span id="detailNickname">${member.nickname || '-'}</span>
                        </div>
                        <div class="info-item">
                            <label>휴대폰</label>
                            <span id="detailPhone">${member.phone || '-'}</span>
                        </div>
                        <div class="info-item">
                            <label>생년월일</label>
                            <span id="detailBirthdate">${member.birthdate || '-'}</span>
                        </div>
                        <div class="info-item">
                            <label>성별</label>
                            <span id="detailGender">${member.gender === 'MALE' ? '남성' : (member.gender === 'FEMALE' ? '여성' : '-')}</span>
                        </div>
                        <div class="info-item">
                            <label>주소</label>
                            <span id="detailAddress">${member.address || '-'}</span>
                        </div>
                        <div class="info-item">
                            <label>가입일</label>
                            <span id="detailJoinDate">${formatDate(member.joinDate)}</span>
                        </div>
                        <div class="info-item">
                            <label>최종 로그인</label>
                            <span id="detailLastLogin">${member.lastActivity ? formatDateTime(member.lastActivity) : '-'}</span>
                        </div>
                    </div>
                </div>

                <div class="tab-panel" id="activityTab">
                    <div class="activity-stats">
                        <div class="activity-stat">
                            <div class="stat-number" id="wasteClassifications">${member.activityStats?.wasteClassifications || 0}</div>
                            <div class="stat-label">분리배출 횟수</div>
                        </div>
                        <div class="activity-stat">
                            <div class="stat-number" id="sharingParticipations">${member.activityStats?.sharingParticipations || 0}</div>
                            <div class="stat-label">무료나눔 참여</div>
                        </div>
                        <div class="activity-stat">
                            <div class="stat-number" id="ecoMarketPurchases">${member.activityStats?.ecoMarketPurchases || 0}</div>
                            <div class="stat-label">에코마켓 구매</div>
                        </div>
                        <div class="activity-stat">
                            <div class="stat-number" id="communityActivities">${member.activityStats?.communityActivities || 0}</div>
                            <div class="stat-label">커뮤니티 활동</div>
                        </div>
                    </div>
                    <div class="activity-timeline">
                        <h4>최근 활동</h4>
                        <div class="timeline-list" id="activityTimeline">
                            <div class="loading-message">활동 내역을 불러오는 중...</div>
                        </div>
                    </div>
                </div>

                <div class="tab-panel" id="transactionsTab">
                    <div class="transaction-summary">
                        <div class="summary-item">
                            <span class="summary-label">총 구매액</span>
                            <span class="summary-value" id="totalPurchaseAmount">₩${(member.transactionStats?.totalAmount || 0).toLocaleString()}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">총 주문 건수</span>
                            <span class="summary-value" id="totalOrderCount">${member.transactionStats?.totalCount || 0}건</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">평균 주문액</span>
                            <span class="summary-value" id="averageOrderAmount">₩${(member.transactionStats?.averageAmount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="transaction-list" id="transactionList">
                        <div class="loading-message">거래 내역을 불러오는 중...</div>
                    </div>
                </div>

                <div class="tab-panel" id="pointsTab">
                    <div class="points-summary">
                        <div class="points-current">
                            <span class="points-label">보유 포인트</span>
                            <span class="points-value" id="currentPoints">${(member.points || 0).toLocaleString()}P</span>
                        </div>
                        <div class="points-total">
                            <span class="points-label">누적 포인트</span>
                            <span class="points-value" id="totalPoints">${(member.totalEarnedPoints || 0).toLocaleString()}P</span>
                        </div>
                    </div>
                    <div class="points-list" id="pointsList">
                        <div class="loading-message">포인트 내역을 불러오는 중...</div>
                    </div>
                </div>

                <div class="tab-panel" id="supportTab">
                    <div class="support-summary">
                        <div class="support-stat">
                            <span class="stat-number" id="totalInquiries">${member.supportStats?.totalInquiries || 0}</span>
                            <span class="stat-label">문의 건수</span>
                        </div>
                        <div class="support-stat">
                            <span class="stat-number" id="completedInquiries">${member.supportStats?.completedInquiries || 0}</span>
                            <span class="stat-label">처리 완료</span>
                        </div>
                        <div class="support-stat">
                            <span class="stat-number" id="processingInquiries">${member.supportStats?.processingInquiries || 0}</span>
                            <span class="stat-label">처리 중</span>
                        </div>
                    </div>
                    <div class="support-list" id="supportList">
                        <div class="loading-message">고객 지원 내역을 불러오는 중...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 탭 이벤트 리스너 다시 등록
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

/**
 * 탭 전환 처리
 * @param {string} tabName - 전환할 탭 이름
 */
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 모든 탭 패널 숨기기
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeTabPanel = document.getElementById(`${tabName}Tab`);
    
    if (activeTabBtn) activeTabBtn.classList.add('active');
    if (activeTabPanel) activeTabPanel.classList.add('active');
    
    // 탭별 데이터 로드
    loadTabData(tabName);
    
    console.log(`📑 탭 전환: ${tabName}`);
}

/**
 * 탭별 데이터 로드
 * @param {string} tabName - 탭 이름
 */
function loadTabData(tabName) {
    const member = AdminState.currentMember;
    if (!member) return;
    
    switch (tabName) {
        case 'activity':
            loadActivityData(member.id);
            break;
        case 'transactions':
            loadTransactionData(member.id);
            break;
        case 'points':
            loadPointsData(member.id);
            break;
        case 'support':
            loadSupportData(member.id);
            break;
    }
}

/**
 * 활동 내역 데이터 로드
 * @param {string} memberId - 회원 ID
 */
function loadActivityData(memberId) {
    fetch(`/admin/members/${memberId}/activities`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(activities => {
        const timelineContainer = document.getElementById('activityTimeline');
        if (!timelineContainer) return;
        
        if (activities.length === 0) {
            timelineContainer.innerHTML = '<div class="no-data-message">활동 내역이 없습니다.</div>';
            return;
        }
        
        timelineContainer.innerHTML = activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-icon ${activity.type}">
                    ${getActivityIcon(activity.type)}
                </div>
                <div class="timeline-content">
                    <h5>${activity.title}</h5>
                    <p>${activity.description}</p>
                    <span class="timeline-time">${formatTimeAgo(activity.createdAt)}</span>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('활동 내역 로드 중 오류:', error);
        const timelineContainer = document.getElementById('activityTimeline');
        if (timelineContainer) {
            timelineContainer.innerHTML = '<div class="error-message">활동 내역을 불러오는데 실패했습니다.</div>';
        }
    });
}

/**
 * 거래 내역 데이터 로드
 * @param {string} memberId - 회원 ID
 */
function loadTransactionData(memberId) {
    fetch(`/admin/members/${memberId}/transactions`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(transactions => {
        const transactionContainer = document.getElementById('transactionList');
        if (!transactionContainer) return;
        
        if (transactions.length === 0) {
            transactionContainer.innerHTML = '<div class="no-data-message">거래 내역이 없습니다.</div>';
            return;
        }
        
        transactionContainer.innerHTML = transactions.map(transaction => `
            <div class="transaction-item">
                <div class="item-info">
                    <h5>${transaction.title}</h5>
                    <p>${transaction.description}</p>
                </div>
                <div class="item-amount">
                    <span class="amount-value ${transaction.amount > 0 ? 'positive' : 'negative'}">
                        ${transaction.amount > 0 ? '+' : ''}₩${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                    <span class="amount-date">${formatDate(transaction.createdAt)}</span>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('거래 내역 로드 중 오류:', error);
        const transactionContainer = document.getElementById('transactionList');
        if (transactionContainer) {
            transactionContainer.innerHTML = '<div class="error-message">거래 내역을 불러오는데 실패했습니다.</div>';
        }
    });
}

/**
 * 포인트 내역 데이터 로드
 * @param {string} memberId - 회원 ID
 */
function loadPointsData(memberId) {
    fetch(`/admin/members/${memberId}/points`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(points => {
        const pointsContainer = document.getElementById('pointsList');
        if (!pointsContainer) return;
        
        if (points.length === 0) {
            pointsContainer.innerHTML = '<div class="no-data-message">포인트 내역이 없습니다.</div>';
            return;
        }
        
        pointsContainer.innerHTML = points.map(point => `
            <div class="points-item">
                <div class="item-info">
                    <h5>${point.title}</h5>
                    <p>${point.description}</p>
                </div>
                <div class="item-amount">
                    <span class="amount-value ${point.points > 0 ? 'positive' : 'negative'}">
                        ${point.points > 0 ? '+' : ''}${point.points.toLocaleString()}P
                    </span>
                    <span class="amount-date">${formatDate(point.createdAt)}</span>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('포인트 내역 로드 중 오류:', error);
        const pointsContainer = document.getElementById('pointsList');
        if (pointsContainer) {
            pointsContainer.innerHTML = '<div class="error-message">포인트 내역을 불러오는데 실패했습니다.</div>';
        }
    });
}

/**
 * 고객 지원 데이터 로드
 * @param {string} memberId - 회원 ID
 */
function loadSupportData(memberId) {
    fetch(`/admin/members/${memberId}/support`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(supports => {
        const supportContainer = document.getElementById('supportList');
        if (!supportContainer) return;
        
        if (supports.length === 0) {
            supportContainer.innerHTML = '<div class="no-data-message">고객 지원 내역이 없습니다.</div>';
            return;
        }
        
        supportContainer.innerHTML = supports.map(support => `
            <div class="support-item">
                <div class="item-info">
                    <h5>${support.title}</h5>
                    <p>${support.description}</p>
                </div>
                <div class="item-amount">
                    <span class="status-badge ${support.status}">${getSupportStatusText(support.status)}</span>
                    <span class="amount-date">${formatDate(support.createdAt)}</span>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('고객 지원 내역 로드 중 오류:', error);
        const supportContainer = document.getElementById('supportList');
        if (supportContainer) {
            supportContainer.innerHTML = '<div class="error-message">고객 지원 내역을 불러오는데 실패했습니다.</div>';
        }
    });
}

/**
 * 모달 닫기
 */
function closeModal() {
    const modal = document.getElementById('memberModal');
    modal.classList.remove('active');
    
    // body 스크롤 활성화
    document.body.style.overflow = '';
    
    AdminState.currentMember = null;
    
    console.log('❌ 모달이 닫혔습니다.');
}

/* ========================================
   회원 관리 액션 함수들
   ======================================== */

/**
 * 현재 회원 정보 수정
 */
function editCurrentMember() {
    const member = AdminState.currentMember;
    if (!member) return;
    
    console.log(`✏️ 회원 수정: ${member.id}`);
    window.location.href = `/admin/members/${member.id}/edit`;
}

/**
 * 현재 회원에게 메시지 발송
 */
function sendMessageToMember() {
    const member = AdminState.currentMember;
    if (!member) return;
    
    console.log(`💬 메시지 발송: ${member.id}`);
    // 메시지 발송 모달이나 페이지로 이동
    alert('메시지 발송 기능은 준비 중입니다.');
}

/**
 * 현재 회원 계정 정지
 */
function suspendCurrentMember() {
    const member = AdminState.currentMember;
    if (!member) return;
    
    if (confirm(`정말로 ${member.name}님의 계정을 정지하시겠습니까?`)) {
        console.log(`⚠️ 계정 정지: ${member.id}`);
        
        fetch(`/admin/members/${member.id}/suspend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('계정이 성공적으로 정지되었습니다.', 'success');
                closeModal();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error(data.message || '계정 정지에 실패했습니다.');
            }
        })
        .catch(error => {
            console.error('계정 정지 중 오류:', error);
            showNotification(error.message, 'error');
        });
    }
}

/**
 * 현재 회원 정보 저장
 */
function saveCurrentMember() {
    const member = AdminState.currentMember;
    if (!member) return;
    
    console.log(`💾 회원 정보 저장: ${member.id}`);
    showNotification('변경사항이 저장되었습니다.', 'success');
}

/**
 * 현재 회원 삭제
 */
function deleteCurrentMember() {
    const member = AdminState.currentMember;
    if (!member) return;
    
    if (confirm(`정말로 ${member.name}님을 탈퇴시키시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        deleteMember(member.id);
        closeModal();
    }
}

/* ========================================
   유틸리티 함수들
   ======================================== */

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(date) {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    return d.toISOString().split('T')[0];
}

/**
 * 날짜/시간 포맷팅 (YYYY-MM-DD HH:MM)
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷된 날짜시간 문자열
 */
function formatDateTime(date) {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    return d.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 상대적 시간 표시 (예: 3일 전)
 * @param {string|Date} date - 날짜
 * @returns {string} 상대적 시간 문자열
 */
function formatTimeAgo(date) {
    if (!date) return '-';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const now = new Date();
    const diffInMs = now - d;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '1일 전';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`;
    return `${Math.floor(diffInDays / 365)}년 전`;
}

/**
 * 상태 텍스트 변환
 * @param {string} status - 상태 코드
 * @returns {string} 상태 텍스트
 */
function getStatusText(status) {
    const statusMap = {
        'ACTIVE': '활성',
        'INACTIVE': '비활성',
        'SUSPENDED': '정지'
    };
    return statusMap[status] || status;
}

/**
 * 타입 텍스트 변환
 * @param {string} type - 타입 코드
 * @returns {string} 타입 텍스트
 */
function getTypeText(type) {
    const typeMap = {
        'INDIVIDUAL': '개인',
        'BUSINESS': '기업',
        'ORGANIZATION': '단체'
    };
    return typeMap[type] || type;
}

/**
 * 고객 지원 상태 텍스트 변환
 * @param {string} status - 상태 코드
 * @returns {string} 상태 텍스트
 */
function getSupportStatusText(status) {
    const statusMap = {
        'COMPLETED': '완료',
        'PROCESSING': '처리중',
        'PENDING': '대기중'
    };
    return statusMap[status] || status;
}

/**
 * 활동 타입 아이콘 반환
 * @param {string} type - 활동 타입
 * @returns {string} 아이콘
 */
function getActivityIcon(type) {
    const iconMap = {
        'WASTE_CLASSIFICATION': '♻️',
        'SHARING': '🤝',
        'ECO_MARKET': '🛒',
        'COMMUNITY': '💬'
    };
    return iconMap[type] || '📝';
}

/**
 * 알림 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'warning', 'info')
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
    
    // 스타일 적용
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // 타입별 색상 설정
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // DOM에 추가
    document.body.appendChild(notification);
    
    // 표시 애니메이션
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// CSS 스타일 추가 (로딩 스피너용)
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-message, .no-data-message, .error-message {
        text-align: center;
        padding: 30px;
        color: #666;
        font-style: italic;
    }
    
    .error-message {
        color: #f44336;
    }
`;
document.head.appendChild(style);

console.log('📄 GreenCycle 관리자 JavaScript (서버 연동)가 로드되었습니다.');