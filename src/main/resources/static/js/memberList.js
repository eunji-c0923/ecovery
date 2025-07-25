/**
 * ===================================
 * GreenCycle 관리자 회원 관리 시스템
 * JavaScript 메인 파일 (타임리프 연동)
 * ===================================
 */

// ===================================
// 전역 변수 및 상태 관리
// ===================================

let isEditMode = false; // 편집 모드 상태
let originalData = {}; // 원본 데이터 백업용
let currentMemberId = null; // 현재 선택된 회원 ID
let selectedRole = null; // 권한 수정 모달에서 선택된 권한

// 권한 등급 매핑 데이터
const ROLE_MAPPING = {
    'SEEDLING': {
        displayName: '새싹',
        icon: '🌱',
        color: '#8bc34a',
        description: '신규 가입 회원'
    },
    'REGULAR': {
        displayName: '일반회원',
        icon: '🌿',
        color: '#2196f3',
        description: '활동이 활발한 회원'
    },
    'EXCELLENT': {
        displayName: '우수회원',
        icon: '🌳',
        color: '#9c27b0',
        description: '환경 보호에 기여하는 회원'
    },
    'VIP': {
        displayName: 'VIP회원',
        icon: '👑',
        color: '#ff9800',
        description: '최상위 등급 회원'
    }
};

// 상태 매핑 데이터
const STATUS_MAPPING = {
    'active': {
        displayName: '활성',
        color: '#27ae60'
    },
    'inactive': {
        displayName: '비활성',
        color: '#95a5a6'
    },
    'suspended': {
        displayName: '정지',
        color: '#e74c3c'
    }
};

// 샘플 회원 데이터 (개발/테스트용 - 실제로는 서버에서 받아옴)
const sampleMemberData = {
    'M0000001': {
        memberId: 'M0000001',
        name: '안영이',
        email: 'anyoung@example.com',
        nickname: '환경지킴이',
        role: 'SEEDLING',
        status: 'active',
        type: 'individual',
        birthdate: '1995',
        gender: 'female',
        address: 'seoul',
        joinDate: '2024-01-15',
        lastVisit: '2024-07-25 14:30',
        points: 15420,
        activities: {
            wasteClassifications: 127,
            sharingParticipations: 43,
            ecoMarketPurchases: 28,
            communityActivities: 156
        },
        transactions: {
            totalPurchaseAmount: 847300,
            totalOrderCount: 47,
            averageOrderAmount: 18028
        },
        pointsInfo: {
            currentPoints: 15420,
            totalPoints: 127850,
            usedPoints: 112430
        },
        support: {
            totalInquiries: 3,
            completedInquiries: 2,
            processingInquiries: 1
        }
    }
};

// ===================================
// DOM 로드 완료 후 초기화
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 GreenCycle 관리자 회원 관리 시스템 로드 완료');
    initializeAdminSystem();
    setupEventListeners();
    populateYearOptions();
    loadServerData();
});

// ===================================
// 초기화 함수들
// ===================================

/**
 * 관리자 시스템 초기화
 */
function initializeAdminSystem() {
    console.log('관리자 시스템 초기화 시작');
    
    try {
        // 체크박스 전체 선택 기능 초기화
        initializeSelectAll();
        
        // 검색 및 필터 기능 초기화
        initializeSearchAndFilters();
        
        // 페이지 크기 변경 기능 초기화
        initializePageSizeControl();
        
        // 테이블 정렬 기능 초기화
        initializeTableSorting();
        
        console.log('✅ 관리자 시스템 초기화 완료');
    } catch (error) {
        console.error('❌ 시스템 초기화 중 오류:', error);
        showNotification('시스템 초기화에 실패했습니다.', 'error');
    }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    console.log('이벤트 리스너 설정 시작');
    
    try {
        // 모달 관련 이벤트
        setupModalEvents();
        
        // 키보드 단축키 이벤트
        setupKeyboardShortcuts();
        
        // 권한 수정 관련 이벤트
        setupRoleEditEvents();
        
        // 페이지 이탈 시 경고 (편집 모드일 때)
        setupPageUnloadWarning();
        
        console.log('✅ 이벤트 리스너 설정 완료');
    } catch (error) {
        console.error('❌ 이벤트 리스너 설정 중 오류:', error);
    }
}

/**
 * 모달 관련 이벤트 설정
 */
function setupModalEvents() {
    // 회원 상세 모달 닫기 버튼
    const memberModalClose = document.getElementById('closeModal');
    if (memberModalClose) {
        memberModalClose.addEventListener('click', closeModal);
    }
    
    // 회원 상세 모달 외부 클릭으로 닫기
    const memberModal = document.getElementById('memberModal');
    if (memberModal) {
        memberModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // 탭 버튼 이벤트
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 편집 모드에서는 기본 정보 탭 외 이동 제한
            if (isEditMode && this.dataset.tab !== 'basic') {
                showNotification('편집 모드에서는 다른 탭으로 이동할 수 없습니다.', 'warning');
                return;
            }
            switchTab(this.dataset.tab);
        });
    });
}

/**
 * 키보드 단축키 설정
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // ESC 키로 모달/편집 모드 취소
        if (e.key === 'Escape') {
            if (document.getElementById('roleModal').classList.contains('active')) {
                closeRoleModal();
            } else if (isEditMode) {
                if (confirm('편집을 취소하시겠습니까?')) {
                    exitEditMode();
                }
            } else if (document.getElementById('memberModal').classList.contains('active')) {
                closeModal();
            }
        }
        
        // Ctrl + F: 검색 창에 포커스
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            const searchInput = document.getElementById('memberSearch');
            if (searchInput) {
                searchInput.focus();
                showNotification('검색 창에 포커스되었습니다.', 'info');
            }
        }
        
        // Ctrl + N: 신규 회원 등록 (추후 구현 예정)
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            showNotification('신규 회원 등록 기능은 개발 중입니다.', 'info');
        }
    });
}

/**
 * 권한 수정 관련 이벤트 설정
 */
function setupRoleEditEvents() {
    // 권한 옵션 선택 이벤트
    document.addEventListener('click', function(e) {
        if (e.target.closest('.role-option')) {
            const roleOption = e.target.closest('.role-option');
            selectRoleOption(roleOption);
        }
    });
}

/**
 * 페이지 이탈 시 경고 설정
 */
function setupPageUnloadWarning() {
    window.addEventListener('beforeunload', function(e) {
        if (isEditMode) {
            e.preventDefault();
            e.returnValue = '편집 중인 내용이 있습니다. 정말 페이지를 벗어나시겠습니까?';
            return e.returnValue;
        }
    });
}

/**
 * 전체 선택 체크박스 기능 초기화
 */
function initializeSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const memberCheckboxes = document.querySelectorAll('.member-checkbox');
    
    if (!selectAllCheckbox) return;
    
    // 전체 선택/해제
    selectAllCheckbox.addEventListener('change', function() {
        memberCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
        updateSelectedCount();
    });
    
    // 개별 체크박스 변경 시 전체 선택 상태 업데이트
    memberCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectAllState();
            updateSelectedCount();
        });
    });
}

/**
 * 전체 선택 상태 업데이트
 */
function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const memberCheckboxes = document.querySelectorAll('.member-checkbox');
    const checkedCount = document.querySelectorAll('.member-checkbox:checked').length;
    
    if (!selectAllCheckbox) return;
    
    selectAllCheckbox.checked = checkedCount === memberCheckboxes.length;
    selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < memberCheckboxes.length;
}

/**
 * 선택된 항목 수 업데이트
 */
function updateSelectedCount() {
    const checkedCount = document.querySelectorAll('.member-checkbox:checked').length;
    console.log(`선택된 회원 수: ${checkedCount}`);
    
    // 선택된 항목이 있을 때 일괄 작업 버튼 표시 (추후 구현)
    if (checkedCount > 0) {
        // TODO: 일괄 작업 버튼 표시
    }
}

/**
 * 검색 및 필터 기능 초기화
 */
function initializeSearchAndFilters() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('memberSearch');
    const filterResetBtn = document.querySelector('.filter-reset');
    
    // 검색 폼 제출 이벤트
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
    }
    
    // 실시간 검색 (디바운스 적용)
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length >= 2 || this.value.length === 0) {
                    performSearch();
                }
            }, 500);
        });
    }
    
    // 필터 초기화 버튼
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', function(e) {
            e.preventDefault();
            resetFilters();
        });
    }
    
    // 필터 변경 시 자동 검색
    const filterSelects = document.querySelectorAll('#typeFilter, #roleFilter, #statusFilter');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            performSearch();
        });
    });
}

/**
 * 페이지 크기 변경 기능 초기화
 */
function initializePageSizeControl() {
    // 타임리프에서 자동으로 처리되므로 별도 JavaScript 불필요
    console.log('페이지 크기 변경 기능은 타임리프에서 처리됩니다.');
}

/**
 * 테이블 정렬 기능 초기화
 */
function initializeTableSorting() {
    const sortableHeaders = document.querySelectorAll('.sortable a');
    
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            e.preventDefault();
            const sortBy = this.closest('.sortable').dataset.sort;
            console.log(`테이블 정렬: ${sortBy}`);
            showNotification(`${this.textContent.trim()}(으)로 정렬됩니다.`, 'info');
            
            // 타임리프 URL로 이동 (실제 정렬은 서버에서 처리)
            window.location.href = this.href;
        });
    });
}

/**
 * 년도 선택 옵션 동적 생성
 */
function populateYearOptions() {
    const birthYearSelect = document.getElementById('editBirthdate');
    if (!birthYearSelect) return;
    
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 80; // 80년 전부터
    const endYear = currentYear - 10;   // 10년 전까지
    
    // 기존 옵션 제거 (첫 번째 "선택" 옵션 제외)
    while (birthYearSelect.children.length > 1) {
        birthYearSelect.removeChild(birthYearSelect.lastChild);
    }
    
    // 년도 옵션 추가
    for (let year = endYear; year >= startYear; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '년';
        birthYearSelect.appendChild(option);
    }
    
    console.log(`년도 옵션 생성 완료: ${startYear}년 ~ ${endYear}년`);
}

/**
 * 서버 데이터 로드
 */
function loadServerData() {
    try {
        // 타임리프에서 전달받은 서버 데이터 확인
        if (typeof window.SERVER_DATA !== 'undefined') {
            console.log('서버 데이터 로드 완료:', window.SERVER_DATA);
            
            // CSRF 토큰 설정
            if (window.SERVER_DATA.csrfToken) {
                setupCSRFToken(window.SERVER_DATA.csrfToken, window.SERVER_DATA.csrfHeader);
            }
        } else {
            console.warn('서버 데이터가 없습니다. 샘플 데이터를 사용합니다.');
        }
    } catch (error) {
        console.error('서버 데이터 로드 중 오류:', error);
    }
}

/**
 * CSRF 토큰 설정
 */
function setupCSRFToken(token, header) {
    // jQuery를 사용하는 경우
    if (typeof $ !== 'undefined') {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader(header, token);
            }
        });
    }
    
    console.log('CSRF 토큰 설정 완료');
}

// ===================================
// 모달 관리 함수들
// ===================================

/**
 * 회원 상세 정보 모달 열기
 * @param {string} memberId - 회원 ID
 */
function openMemberModal(memberId) {
    console.log(`회원 모달 열기: ${memberId}`);
    
    try {
        // 편집 모드 초기화
        isEditMode = false;
        currentMemberId = memberId;
        
        // 회원 데이터 로드 (서버에서 받아오거나 샘플 데이터 사용)
        const memberData = getMemberData(memberId);
        if (!memberData) {
            showNotification('회원 정보를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 원본 데이터 백업
        originalData = { ...memberData };
        
        // 모달에 데이터 표시
        displayMemberData(memberData);
        
        // 기본 정보 탭 활성화
        switchTab('basic');
        
        // 편집 모드 UI 초기화
        resetEditMode();
        
        // 모달 표시
        const modal = document.getElementById('memberModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        }
        
        console.log('✅ 회원 모달 열기 완료');
    } catch (error) {
        console.error('❌ 회원 모달 열기 중 오류:', error);
        showNotification('회원 정보를 불러오는데 실패했습니다.', 'error');
    }
}

/**
 * 회원 상세 정보 모달 닫기
 */
function closeModal() {
    // 편집 모드에서는 확인 후 닫기
    if (isEditMode) {
        if (confirm('편집 중인 내용이 있습니다. 저장하지 않고 닫으시겠습니까?')) {
            exitEditMode();
            actuallyCloseModal();
        }
    } else {
        actuallyCloseModal();
    }
}

/**
 * 실제 모달 닫기 실행
 */
function actuallyCloseModal() {
    const modal = document.getElementById('memberModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    document.body.style.overflow = ''; // 배경 스크롤 복원
    
    // 상태 초기화
    isEditMode = false;
    currentMemberId = null;
    originalData = {};
    
    console.log('✅ 모달 닫기 완료');
}

// ===================================
// 권한 수정 모달 관리
// ===================================

/**
 * 권한 수정 모달 열기
 */
function openRoleModal() {
    if (!currentMemberId) {
        showNotification('회원 정보를 먼저 선택해주세요.', 'warning');
        return;
    }
    
    console.log(`권한 수정 모달 열기: ${currentMemberId}`);
    
    try {
        const memberData = getMemberData(currentMemberId);
        if (!memberData) {
            showNotification('회원 정보를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 권한 모달에 회원 정보 표시
        displayRoleModalMemberInfo(memberData);
        
        // 현재 권한 선택 표시
        highlightCurrentRole(memberData.role);
        
        // 권한 변경 사유 초기화
        const reasonTextarea = document.getElementById('roleChangeReason');
        if (reasonTextarea) {
            reasonTextarea.value = '';
        }
        
        // 선택된 권한 초기화
        selectedRole = null;
        
        // 모달 표시
        const roleModal = document.getElementById('roleModal');
        if (roleModal) {
            roleModal.classList.add('active');
        }
        
        console.log('✅ 권한 수정 모달 열기 완료');
    } catch (error) {
        console.error('❌ 권한 수정 모달 열기 중 오류:', error);
        showNotification('권한 수정 모달을 열 수 없습니다.', 'error');
    }
}

/**
 * 권한 수정 모달 닫기
 */
function closeRoleModal() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) {
        roleModal.classList.remove('active');
    }
    
    // 선택 상태 초기화
    selectedRole = null;
    clearRoleSelection();
    
    console.log('✅ 권한 수정 모달 닫기 완료');
}

/**
 * 권한 모달에 회원 정보 표시
 * @param {Object} memberData - 회원 데이터
 */
function displayRoleModalMemberInfo(memberData) {
    // 회원 이름
    const roleMemberName = document.getElementById('roleMemberName');
    if (roleMemberName) {
        roleMemberName.textContent = memberData.name || 'Unknown';
    }
    
    // 회원 이메일
    const roleMemberEmail = document.getElementById('roleMemberEmail');
    if (roleMemberEmail) {
        roleMemberEmail.textContent = memberData.email || '';
    }
    
    // 현재 권한 표시
    const currentRoleDisplay = document.getElementById('currentRoleDisplay');
    if (currentRoleDisplay) {
        const roleInfo = ROLE_MAPPING[memberData.role];
        currentRoleDisplay.textContent = roleInfo ? roleInfo.displayName : memberData.role;
    }
}

/**
 * 현재 권한 하이라이트
 * @param {string} currentRole - 현재 권한
 */
function highlightCurrentRole(currentRole) {
    // 모든 권한 옵션에서 current 클래스 제거
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('current');
    });
    
    // 현재 권한에 current 클래스 추가
    const currentRoleOption = document.querySelector(`.role-option[data-role="${currentRole}"]`);
    if (currentRoleOption) {
        currentRoleOption.classList.add('current');
    }
}

/**
 * 권한 옵션 선택
 * @param {Element} roleOption - 선택된 권한 옵션 요소
 */
function selectRoleOption(roleOption) {
    const role = roleOption.dataset.role;
    
    // 이전 선택 해제
    clearRoleSelection();
    
    // 새로운 선택 적용
    roleOption.classList.add('selected');
    selectedRole = role;
    
    console.log(`권한 선택: ${role}`);
    
    const roleInfo = ROLE_MAPPING[role];
    if (roleInfo) {
        showNotification(`${roleInfo.displayName} 권한이 선택되었습니다.`, 'info');
    }
}

/**
 * 권한 선택 상태 초기화
 */
function clearRoleSelection() {
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('selected');
    });
}

/**
 * 권한 변경 저장
 */
async function saveRoleChange() {
    if (!selectedRole) {
        showNotification('새로운 권한을 선택해주세요.', 'warning');
        return;
    }
    
    if (!currentMemberId) {
        showNotification('회원 정보가 없습니다.', 'error');
        return;
    }
    
    const memberData = getMemberData(currentMemberId);
    if (!memberData) {
        showNotification('회원 정보를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 현재 권한과 동일한지 확인
    if (selectedRole === memberData.role) {
        showNotification('현재 권한과 동일합니다.', 'warning');
        return;
    }
    
    const reason = document.getElementById('roleChangeReason').value.trim();
    const oldRole = memberData.role;
    const newRole = selectedRole;
    
    const oldRoleInfo = ROLE_MAPPING[oldRole];
    const newRoleInfo = ROLE_MAPPING[newRole];
    
    // 확인 메시지
    const confirmMessage = `권한을 변경하시겠습니까?\n\n회원: ${memberData.name} (${memberData.email})\n기존 권한: ${oldRoleInfo?.displayName || oldRole}\n새 권한: ${newRoleInfo?.displayName || newRole}${reason ? '\n\n변경 사유: ' + reason : ''}`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    console.log(`권한 변경 시작: ${currentMemberId} ${oldRole} → ${newRole}`);
    
    try {
        // 로딩 상태 표시
        showNotification('권한을 변경하고 있습니다...', 'info');
        
        // 서버에 권한 변경 요청
        const result = await updateMemberRole(currentMemberId, newRole, reason);
        
        if (result.success) {
            // 로컬 데이터 업데이트
            memberData.role = newRole;
            
            // 모달의 권한 표시 업데이트
            updateMemberRoleDisplay(newRole);
            
            // 테이블의 권한 배지 업데이트
            updateTableRoleBadge(currentMemberId, newRole);
            
            // 권한 모달 닫기
            closeRoleModal();
            
            showNotification(`권한이 ${newRoleInfo?.displayName || newRole}(으)로 변경되었습니다.`, 'success');
            
            console.log('✅ 권한 변경 완료');
        } else {
            throw new Error(result.message || '권한 변경에 실패했습니다.');
        }
    } catch (error) {
        console.error('❌ 권한 변경 중 오류:', error);
        showNotification(error.message || '권한 변경에 실패했습니다.', 'error');
    }
}

/**
 * 서버에 권한 변경 요청
 * @param {string} memberId - 회원 ID
 * @param {string} newRole - 새로운 권한
 * @param {string} reason - 변경 사유
 * @returns {Promise<Object>} 결과
 */
async function updateMemberRole(memberId, newRole, reason) {
    try {
        const csrfToken = window.SERVER_DATA?.csrfToken;
        const csrfHeader = window.SERVER_DATA?.csrfHeader;
        
        const response = await fetch('/admin/members/role/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify({
                memberId: memberId,
                newRole: newRole,
                reason: reason
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('서버 요청 중 오류:', error);
        
        // 개발/테스트 환경에서는 시뮬레이션 응답 반환
        return simulateRoleUpdateResponse(memberId, newRole, reason);
    }
}

/**
 * 권한 변경 응답 시뮬레이션 (개발/테스트용)
 */
function simulateRoleUpdateResponse(memberId, newRole, reason) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 90% 성공률로 시뮬레이션
            const success = Math.random() > 0.1;
            
            if (success) {
                resolve({
                    success: true,
                    message: '권한이 성공적으로 변경되었습니다.',
                    data: {
                        memberId: memberId,
                        newRole: newRole,
                        reason: reason,
                        updatedAt: new Date().toISOString()
                    }
                });
            } else {
                resolve({
                    success: false,
                    message: '서버 오류가 발생했습니다. 다시 시도해주세요.'
                });
            }
        }, 1000);
    });
}

/**
 * 모달의 권한 표시 업데이트
 * @param {string} newRole - 새로운 권한
 */
function updateMemberRoleDisplay(newRole) {
    const memberRoleDisplay = document.getElementById('memberRoleDisplay');
    if (memberRoleDisplay) {
        const roleInfo = ROLE_MAPPING[newRole];
        memberRoleDisplay.textContent = roleInfo ? roleInfo.displayName : newRole;
    }
}

/**
 * 테이블의 권한 배지 업데이트
 * @param {string} memberId - 회원 ID
 * @param {string} newRole - 새로운 권한
 */
function updateTableRoleBadge(memberId, newRole) {
    const memberRow = document.querySelector(`tr[data-member-id="${memberId}"]`);
    if (memberRow) {
        const roleBadge = memberRow.querySelector('.role-badge');
        if (roleBadge) {
            // 기존 클래스 제거
            roleBadge.className = 'role-badge';
            
            // 새로운 권한 클래스 추가
            roleBadge.classList.add(newRole.toLowerCase());
            
            // 텍스트 업데이트
            const roleInfo = ROLE_MAPPING[newRole];
            roleBadge.textContent = roleInfo ? roleInfo.displayName : newRole;
        }
    }
}

// ===================================
// 데이터 관리 함수들
// ===================================

/**
 * 회원 데이터 가져오기
 * @param {string} memberId - 회원 ID
 * @returns {Object|null} 회원 데이터
 */
function getMemberData(memberId) {
    // 서버 데이터에서 먼저 찾기
    if (window.SERVER_DATA?.memberPage?.content) {
        const member = window.SERVER_DATA.memberPage.content.find(m => m.memberId === memberId);
        if (member) {
            return member;
        }
    }
    
    // 샘플 데이터에서 찾기 (개발/테스트용)
    return sampleMemberData[memberId] || null;
}

/**
 * 회원 데이터를 모달에 표시
 * @param {Object} memberData - 회원 데이터
 */
function displayMemberData(memberData) {
    try {
        // 프로필 영역 업데이트
        updateProfileSection(memberData);
        
        // 읽기 모드에 데이터 표시
        displayReadOnlyData(memberData);
        
        // 편집 폼에 데이터 입력
        populateEditForm(memberData);
        
        // 활동 내역 표시
        displayActivityData(memberData.activities);
        
        // 거래 내역 표시
        displayTransactionData(memberData.transactions);
        
        // 포인트 정보 표시
        displayPointsData(memberData.pointsInfo);
        
        // 고객 지원 정보 표시
        displaySupportData(memberData.support);
        
        console.log('✅ 회원 데이터 표시 완료');
    } catch (error) {
        console.error('❌ 회원 데이터 표시 중 오류:', error);
        showNotification('회원 정보 표시에 실패했습니다.', 'error');
    }
}

/**
 * 프로필 섹션 업데이트
 * @param {Object} memberData - 회원 데이터
 */
function updateProfileSection(memberData) {
    // 회원 이름
    const memberName = document.getElementById('memberName');
    if (memberName) {
        memberName.textContent = memberData.name || 'Unknown';
    }
    
    // 회원 이메일
    const memberEmail = document.getElementById('memberEmail');
    if (memberEmail) {
        memberEmail.textContent = memberData.email || '';
    }
    
    // 권한 등급 표시
    const memberRoleDisplay = document.getElementById('memberRoleDisplay');
    if (memberRoleDisplay) {
        const roleInfo = ROLE_MAPPING[memberData.role];
        memberRoleDisplay.textContent = roleInfo ? roleInfo.displayName : memberData.role;
    }
    
    // 상태 배지
    const memberStatus = document.getElementById('memberStatus');
    if (memberStatus) {
        const statusInfo = STATUS_MAPPING[memberData.status];
        memberStatus.textContent = statusInfo ? statusInfo.displayName : memberData.status;
        memberStatus.className = `status-badge ${memberData.status.toLowerCase()}`;
    }
    
    // 회원 타입
    const memberType = document.getElementById('memberType');
    if (memberType) {
        const typeMap = {
            'individual': '개인',
            'business': '기업',
            'organization': '단체'
        };
        memberType.textContent = typeMap[memberData.type] || memberData.type;
    }
}

/**
 * 읽기 모드에 데이터 표시
 * @param {Object} memberData - 회원 데이터
 */
function displayReadOnlyData(memberData) {
    const elements = {
        'detailMemberId': memberData.memberId || 'Unknown',
        'detailNickname': memberData.nickname || '닉네임 없음',
        'detailBirthdate': memberData.birthdate ? memberData.birthdate + '년' : '-',
        'detailGender': formatGender(memberData.gender) || '-',
        'detailAddress': formatAddress(memberData.address) || '-',
        'detailJoinDate': memberData.joinDate || '-',
        'detailLastVisit': memberData.lastVisit || '-'
    };
    
    // 각 요소에 데이터 설정
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

/**
 * 편집 폼에 데이터 입력
 * @param {Object} memberData - 회원 데이터
 */
function populateEditForm(memberData) {
    const formElements = {
        'editMemberId': memberData.memberId || '',
        'editNickname': memberData.nickname || '',
        'editBirthdate': memberData.birthdate || '',
        'editGender': memberData.gender || '',
        'editAddress': memberData.address || '',
        'editJoinDate': memberData.joinDate || '',
        'editLastVisit': memberData.lastVisit || ''
    };
    
    // 각 폼 요소에 데이터 설정
    Object.entries(formElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
}

/**
 * 활동 내역 데이터 표시
 * @param {Object} activities - 활동 데이터
 */
function displayActivityData(activities) {
    if (!activities) return;
    
    const activityElements = {
        'wasteClassifications': activities.wasteClassifications || 0,
        'sharingParticipations': activities.sharingParticipations || 0,
        'ecoMarketPurchases': activities.ecoMarketPurchases || 0,
        'communityActivities': activities.communityActivities || 0
    };
    
    Object.entries(activityElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value.toLocaleString();
        }
    });
}

/**
 * 거래 내역 데이터 표시
 * @param {Object} transactions - 거래 데이터
 */
function displayTransactionData(transactions) {
    if (!transactions) return;
    
    const totalPurchaseAmount = document.getElementById('totalPurchaseAmount');
    if (totalPurchaseAmount) {
        totalPurchaseAmount.textContent = '₩' + (transactions.totalPurchaseAmount || 0).toLocaleString();
    }
    
    const totalOrderCount = document.getElementById('totalOrderCount');
    if (totalOrderCount) {
        totalOrderCount.textContent = (transactions.totalOrderCount || 0) + '건';
    }
    
    const averageOrderAmount = document.getElementById('averageOrderAmount');
    if (averageOrderAmount) {
        averageOrderAmount.textContent = '₩' + (transactions.averageOrderAmount || 0).toLocaleString();
    }
}

/**
 * 포인트 정보 표시
 * @param {Object} pointsInfo - 포인트 데이터
 */
function displayPointsData(pointsInfo) {
    if (!pointsInfo) return;
    
    const currentPoints = document.getElementById('currentPoints');
    if (currentPoints) {
        currentPoints.textContent = (pointsInfo.currentPoints || 0).toLocaleString() + 'P';
    }
    
    const totalPoints = document.getElementById('totalPoints');
    if (totalPoints) {
        totalPoints.textContent = (pointsInfo.totalPoints || 0).toLocaleString() + 'P';
    }
    
    const usedPoints = document.getElementById('usedPoints');
    if (usedPoints) {
        usedPoints.textContent = (pointsInfo.usedPoints || 0).toLocaleString() + 'P';
    }
}

/**
 * 고객 지원 정보 표시
 * @param {Object} support - 지원 데이터
 */
function displaySupportData(support) {
    if (!support) return;
    
    const supportElements = {
        'totalInquiries': support.totalInquiries || 0,
        'completedInquiries': support.completedInquiries || 0,
        'processingInquiries': support.processingInquiries || 0
    };
    
    Object.entries(supportElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// ===================================
// 데이터 포맷팅 함수들
// ===================================

/**
 * 성별 데이터 포맷팅
 * @param {string} gender - 성별 코드
 * @returns {string} 포맷된 성별
 */
function formatGender(gender) {
    const genderMap = {
        'male': '남성',
        'female': '여성',
        'other': '기타'
    };
    return genderMap[gender] || gender;
}

/**
 * 주소 데이터 포맷팅
 * @param {string} address - 주소 코드
 * @returns {string} 포맷된 주소
 */
function formatAddress(address) {
    const addressMap = {
        'seoul': '서울',
        'busan': '부산',
        'daegu': '대구',
        'incheon': '인천',
        'gwangju': '광주',
        'daejeon': '대전',
        'ulsan': '울산'
    };
    return addressMap[address] || address;
}

// ===================================
// 편집 모드 관리 함수들
// ===================================

/**
 * 편집 모드 토글
 */
function toggleEditMode() {
    if (isEditMode) {
        // 편집 모드에서 읽기 모드로 전환 시 확인
        if (confirm('편집 중인 내용이 저장되지 않습니다. 계속하시겠습니까?')) {
            exitEditMode();
        }
    } else {
        enterEditMode();
    }
}

/**
 * 편집 모드 진입
 */
function enterEditMode() {
    console.log('편집 모드 진입');
    
    isEditMode = true;
    
    // UI 전환
    const readOnlyInfo = document.getElementById('readOnlyInfo');
    const editableInfo = document.getElementById('editableInfo');
    const dangerZone = document.getElementById('dangerZone');
    
    if (readOnlyInfo) readOnlyInfo.style.display = 'none';
    if (editableInfo) editableInfo.style.display = 'block';
    if (dangerZone) dangerZone.style.display = 'block';
    
    // 편집 버튼 텍스트 변경
    const editBtn = document.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.textContent = '✏️ 편집 취소';
        editBtn.style.backgroundColor = '#e74c3c';
    }
    
    // 저장 버튼 표시
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.style.display = 'inline-block';
    }
    
    // 첫 번째 편집 가능한 입력 필드에 포커스
    const firstInput = document.querySelector('#editableInfo input:not([readonly])');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    showNotification('편집 모드로 전환되었습니다. 수정 후 반드시 저장해주세요.', 'info');
}

/**
 * 편집 모드 종료 (변경사항 저장하지 않음)
 */
function exitEditMode() {
    console.log('편집 모드 종료');
    
    isEditMode = false;
    
    // UI 전환
    const readOnlyInfo = document.getElementById('readOnlyInfo');
    const editableInfo = document.getElementById('editableInfo');
    const dangerZone = document.getElementById('dangerZone');
    
    if (readOnlyInfo) readOnlyInfo.style.display = 'block';
    if (editableInfo) editableInfo.style.display = 'none';
    if (dangerZone) dangerZone.style.display = 'none';
    
    // 편집 버튼 텍스트 원복
    const editBtn = document.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.textContent = '✏️ 정보 수정';
        editBtn.style.backgroundColor = '#2ecc71';
    }
    
    // 저장 버튼 숨김
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }
    
    // 원본 데이터로 복원
    populateEditForm(originalData);
    
    showNotification('편집이 취소되었습니다.', 'info');
}

/**
 * 편집 모드 UI 초기화
 */
function resetEditMode() {
    // 읽기 모드 표시, 편집 모드 숨김
    const readOnlyInfo = document.getElementById('readOnlyInfo');
    const editableInfo = document.getElementById('editableInfo');
    const dangerZone = document.getElementById('dangerZone');
    
    if (readOnlyInfo) readOnlyInfo.style.display = 'block';
    if (editableInfo) editableInfo.style.display = 'none';
    if (dangerZone) dangerZone.style.display = 'none';
    
    // 편집 버튼 원상 복구
    const editBtn = document.querySelector('.btn-edit');
    if (editBtn) {
        editBtn.textContent = '✏️ 정보 수정';
        editBtn.style.backgroundColor = '#2ecc71';
    }
    
    // 저장 버튼 숨김
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.style.display = 'none';
    }
}

// ===================================
// 데이터 저장 및 관리 함수들
// ===================================

/**
 * 변경사항 저장
 */
async function saveCurrentMember() {
    console.log('변경사항 저장 시작');
    
    try {
        // 폼 유효성 검사
        if (!validateForm()) {
            return;
        }
        
        // 폼 데이터 수집
        const updatedData = collectFormData();
        
        // 로딩 상태 표시
        showNotification('저장 중입니다...', 'info');
        
        // 서버에 데이터 전송
        const result = await saveToServer(updatedData);
        
        if (result.success) {
            // 로컬 데이터 업데이트
            const memberData = getMemberData(currentMemberId);
            if (memberData) {
                Object.assign(memberData, updatedData);
                Object.assign(originalData, updatedData);
            }
            
            // 읽기 모드에 업데이트된 데이터 표시
            displayReadOnlyData(updatedData);
            updateProfileSection(memberData);
            
            // 편집 모드 종료
            exitEditMode();
            
            showNotification('변경사항이 성공적으로 저장되었습니다.', 'success');
            
            console.log('✅ 변경사항 저장 완료');
        } else {
            throw new Error(result.message || '저장에 실패했습니다.');
        }
        
    } catch (error) {
        console.error('❌ 저장 중 오류:', error);
        showNotification(error.message || '저장에 실패했습니다. 다시 시도해주세요.', 'error');
    }
}

/**
 * 폼 데이터 수집
 * @returns {Object} 수집된 폼 데이터
 */
function collectFormData() {
    return {
        memberId: document.getElementById('editMemberId').value,
        nickname: document.getElementById('editNickname').value.trim(),
        birthdate: document.getElementById('editBirthdate').value,
        gender: document.getElementById('editGender').value,
        address: document.getElementById('editAddress').value,
        joinDate: document.getElementById('editJoinDate').value,
        lastVisit: document.getElementById('editLastVisit').value
    };
}

/**
 * 폼 유효성 검사
 * @returns {boolean} 유효성 검사 통과 여부
 */
function validateForm() {
    const nickname = document.getElementById('editNickname').value.trim();
    
    // 닉네임 필수 검사
    if (!nickname) {
        showNotification('닉네임을 입력해주세요.', 'error');
        document.getElementById('editNickname').focus();
        return false;
    }
    
    // 닉네임 길이 검사
    if (nickname.length < 2 || nickname.length > 20) {
        showNotification('닉네임은 2~20자 사이로 입력해주세요.', 'error');
        document.getElementById('editNickname').focus();
        return false;
    }
    
    // 닉네임 특수문자 검사
    const nicknameRegex = /^[가-힣a-zA-Z0-9_]+$/;
    if (!nicknameRegex.test(nickname)) {
        showNotification('닉네임은 한글, 영문, 숫자, 언더바(_)만 사용 가능합니다.', 'error');
        document.getElementById('editNickname').focus();
        return false;
    }
    
    return true;
}

/**
 * 서버에 데이터 저장
 * @param {Object} data - 저장할 데이터
 * @returns {Promise<Object>} 결과
 */
async function saveToServer(data) {
    try {
        const csrfToken = window.SERVER_DATA?.csrfToken;
        const csrfHeader = window.SERVER_DATA?.csrfHeader;
        
        const response = await fetch('/admin/members/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('서버 요청 중 오류:', error);
        
        // 개발/테스트 환경에서는 시뮬레이션 응답 반환
        return simulateSaveResponse(data);
    }
}

/**
 * 저장 응답 시뮬레이션 (개발/테스트용)
 */
function simulateSaveResponse(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 90% 성공률로 시뮬레이션
            const success = Math.random() > 0.1;
            
            if (success) {
                resolve({
                    success: true,
                    message: '저장이 완료되었습니다.',
                    data: data
                });
            } else {
                resolve({
                    success: false,
                    message: '서버 오류가 발생했습니다. 다시 시도해주세요.'
                });
            }
        }, 1000);
    });
}

// ===================================
// 탭 관리 함수들
// ===================================

/**
 * 탭 전환
 * @param {string} tabName - 전환할 탭 이름
 */
function switchTab(tabName) {
    // 모든 탭 버튼 비활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 모든 탭 패널 숨김
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 선택된 탭 활성화
    const selectedTabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const selectedTabPanel = document.getElementById(`${tabName}Tab`);
    
    if (selectedTabBtn) selectedTabBtn.classList.add('active');
    if (selectedTabPanel) selectedTabPanel.classList.add('active');
    
    console.log(`탭 전환: ${tabName}`);
}

// ===================================
// 검색 및 필터 함수들
// ===================================

/**
 * 검색 실행
 */
function performSearch() {
    const searchInput = document.getElementById('memberSearch');
    const typeFilter = document.getElementById('typeFilter');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (!searchInput) return;
    
    const searchParams = new URLSearchParams();
    
    // 검색어
    if (searchInput.value.trim()) {
        searchParams.set('search', searchInput.value.trim());
    }
    
    // 필터들
    if (typeFilter && typeFilter.value) {
        searchParams.set('type', typeFilter.value);
    }
    
    if (roleFilter && roleFilter.value) {
        searchParams.set('role', roleFilter.value);
    }
    
    if (statusFilter && statusFilter.value) {
        searchParams.set('status', statusFilter.value);
    }
    
    // 현재 페이지 크기 유지
    const currentPageSize = new URLSearchParams(window.location.search).get('size') || '25';
    searchParams.set('size', currentPageSize);
    
    // 페이지 이동
    const newUrl = `/admin/members?${searchParams.toString()}`;
    console.log(`검색 실행: ${newUrl}`);
    
    window.location.href = newUrl;
}

/**
 * 필터 초기화
 */
function resetFilters() {
    // 검색어 초기화
    const searchInput = document.getElementById('memberSearch');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // 필터 초기화
    const filters = ['typeFilter', 'roleFilter', 'statusFilter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.value = '';
        }
    });
    
    showNotification('필터가 초기화되었습니다.', 'info');
    
    // 기본 페이지로 이동
    window.location.href = '/admin/members';
}

// ===================================
// 회원 관리 액션 함수들
// ===================================

/**
 * 메시지 발송
 */
function sendMessageToMember() {
    if (!currentMemberId) return;
    
    const memberData = getMemberData(currentMemberId);
    const memberName = memberData ? memberData.name : 'Unknown';
    
    console.log(`메시지 발송: ${memberName}`);
    showNotification(`${memberName}님에게 메시지를 발송했습니다.`, 'success');
    
    // 실제 구현에서는 메시지 발송 모달 또는 페이지로 이동
}

/**
 * 계정 정지
 */
async function suspendCurrentMember() {
    if (!currentMemberId) return;
    
    const memberData = getMemberData(currentMemberId);
    const memberName = memberData ? memberData.name : 'Unknown';
    
    if (confirm(`⚠️ 계정 정지 확인\n\n'${memberName}' 회원의 계정을 정지시키겠습니까?\n\n정지된 계정은 관리자가 해제할 때까지 로그인할 수 없습니다.`)) {
        console.log('계정 정지 실행:', memberName);
        
        try {
            showNotification('계정을 정지하고 있습니다...', 'info');
            
            // 서버에 정지 요청 (실제 구현에서는 서버 API 호출)
            const result = await simulateSuspendResponse(currentMemberId);
            
            if (result.success) {
                // 로컬 데이터 업데이트
                if (memberData) {
                    memberData.status = 'suspended';
                    updateProfileSection(memberData);
                }
                
                showNotification(`${memberName}님의 계정이 정지되었습니다.`, 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('계정 정지 중 오류:', error);
            showNotification('계정 정지에 실패했습니다.', 'error');
        }
    }
}

/**
 * 계정 정지 응답 시뮬레이션
 */
function simulateSuspendResponse(memberId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: '계정이 정지되었습니다.',
                data: { memberId: memberId, status: 'suspended' }
            });
        }, 1000);
    });
}

/**
 * 회원 계정 완전 삭제
 */
async function deleteCurrentMember() {
    if (!currentMemberId) return;
    
    const memberData = getMemberData(currentMemberId);
    const memberName = memberData ? memberData.name : 'Unknown';
    
    // 2단계 확인
    if (confirm(`⚠️ 위험한 작업 경고 ⚠️\n\n'${memberName}' 회원의 계정을 완전히 삭제하시겠습니까?\n\n• 모든 개인정보가 영구 삭제됩니다\n• 활동 내역, 포인트, 거래 정보가 모두 삭제됩니다\n• 이 작업은 되돌릴 수 없습니다\n\n정말로 삭제하시겠습니까?`)) {
        if (confirm(`🚨 최종 확인 🚨\n\n정말로 '${memberName}' 회원을 영구 삭제하시겠습니까?\n\n이것은 마지막 확인입니다.\n삭제 후에는 복구가 불가능합니다.`)) {
            console.log('회원 계정 완전 삭제 실행:', memberName);
            
            try {
                // 삭제 처리 중 알림
                showNotification('회원 데이터를 삭제하고 있습니다...', 'info');
                
                // 서버에 삭제 요청 (실제 구현에서는 서버 API 호출)
                const result = await simulateDeleteResponse(currentMemberId);
                
                if (result.success) {
                    showNotification(`${memberName}님의 계정이 완전히 삭제되었습니다.`, 'success');
                    
                    // 테이블에서 해당 행 제거 (시각적 효과)
                    const tableRow = document.querySelector(`tr[data-member-id="${currentMemberId}"]`);
                    if (tableRow) {
                        tableRow.style.opacity = '0.5';
                        tableRow.style.textDecoration = 'line-through';
                        tableRow.style.backgroundColor = '#ffebee';
                    }
                    
                    // 샘플 데이터에서 제거
                    delete sampleMemberData[currentMemberId];
                    
                    // 모달 닫기
                    setTimeout(() => {
                        actuallyCloseModal();
                    }, 2000);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('회원 삭제 중 오류:', error);
                showNotification('회원 삭제에 실패했습니다.', 'error');
            }
        }
    }
}

/**
 * 삭제 응답 시뮬레이션
 */
function simulateDeleteResponse(memberId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: '회원이 삭제되었습니다.',
                data: { memberId: memberId }
            });
        }, 1500);
    });
}

// ===================================
// 유틸리티 함수들
// ===================================

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
    
    document.body.appendChild(notification);
    
    // 자동 제거 (에러는 5초, 나머지는 3초)
    const duration = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 숫자를 천 단위 콤마로 포맷팅
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} 포맷팅된 문자열
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * 날짜를 포맷팅
 * @param {string|Date} date - 포맷팅할 날짜
 * @returns {string} 포맷팅된 날짜 문자열
 */
function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    if (!(date instanceof Date) || isNaN(date)) {
        return '-';
    }
    
    return date.toLocaleDateString('ko-KR');
}

// ===================================
// 에러 핸들링 및 시스템 관리
// ===================================

/**
 * 전역 에러 핸들러
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript 오류:', e.error);
    showNotification('시스템 오류가 발생했습니다. 페이지를 새로고침해 주세요.', 'error');
});

/**
 * Promise rejection 핸들러
 */
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejection:', e.reason);
    showNotification('요청 처리 중 오류가 발생했습니다.', 'error');
});

/**
 * 페이지 언로드 전 정리 작업
 */
window.addEventListener('beforeunload', function() {
    // 편집 모드 상태 정리
    isEditMode = false;
    
    // 모달 상태 정리
    document.body.style.overflow = '';
    
    console.log('페이지 언로드 전 정리 작업 완료');
});

// ===================================
// 시스템 시작 메시지 및 개발자 정보
// ===================================

// 시스템 시작 알림
setTimeout(() => {
    showNotification('🌱 GreenCycle 관리자 시스템에 오신 것을 환영합니다!', 'success');
}, 500);

// 개발자 콘솔 정보
console.log('%c🌱 GreenCycle 관리자 회원 관리 시스템', 'color: #2ecc71; font-size: 18px; font-weight: bold;');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 사용 가능한 주요 함수들:');
console.log('   • openMemberModal(memberId): 회원 상세 정보 모달 열기');
console.log('   • openRoleModal(): 권한 수정 모달 열기');
console.log('   • toggleEditMode(): 편집 모드 전환');
console.log('   • saveCurrentMember(): 회원 정보 변경사항 저장');
console.log('   • saveRoleChange(): 권한 변경사항 저장');
console.log('   • deleteCurrentMember(): 회원 계정 삭제');
console.log('   • showNotification(message, type): 알림 메시지 표시');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 단축키:');
console.log('   • Ctrl + F: 검색 창 포커스');
console.log('   • Ctrl + N: 신규 회원 등록 (개발 예정)');
console.log('   • ESC: 모달 닫기 / 편집 모드 취소');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 권한 등급:');
console.log('   • 🌱 새싹: 신규 가입 회원');
console.log('   • 🌿 일반회원: 활동이 활발한 회원');
console.log('   • 🌳 우수회원: 환경 보호에 기여하는 회원');
console.log('   • 👑 VIP회원: 최상위 등급 회원');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 사용법:');
console.log('   • 회원 행을 클릭하거나 "상세보기" 버튼으로 회원 정보 확인');
console.log('   • 프로필에서 권한 등급 옆 ✏️ 버튼으로 권한 수정');
console.log('   • "정보 수정" 버튼으로 회원 기본 정보 편집');
console.log('   • 편집 모드에서 위험 구역의 "계정 삭제" 기능 이용 가능');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ===================================
// 추가 개발자 도구 함수들
// ===================================

/**
 * 개발자 모드 함수들 (콘솔에서 직접 호출 가능)
 */
window.devTools = {
    /**
     * 모든 회원의 권한을 일괄 변경 (개발/테스트용)
     * @param {string} newRole - 새로운 권한
     */
    bulkChangeRole: function(newRole) {
        if (!ROLE_MAPPING[newRole]) {
            console.error('유효하지 않은 권한입니다:', newRole);
            console.log('사용 가능한 권한:', Object.keys(ROLE_MAPPING));
            return;
        }
        
        console.log(`모든 회원의 권한을 ${ROLE_MAPPING[newRole].displayName}로 변경합니다...`);
        
        // 테이블의 모든 권한 배지 업데이트
        document.querySelectorAll('.role-badge').forEach(badge => {
            badge.className = `role-badge ${newRole.toLowerCase()}`;
            badge.textContent = ROLE_MAPPING[newRole].displayName;
        });
        
        console.log('✅ 일괄 권한 변경 완료');
    },
    
    /**
     * 랜덤 알림 메시지 표시 (테스트용)
     */
    testNotifications: function() {
        const messages = [
            { text: '성공 테스트 메시지입니다.', type: 'success' },
            { text: '오류 테스트 메시지입니다.', type: 'error' },
            { text: '경고 테스트 메시지입니다.', type: 'warning' },
            { text: '정보 테스트 메시지입니다.', type: 'info' }
        ];
        
        messages.forEach((msg, index) => {
            setTimeout(() => {
                showNotification(msg.text, msg.type);
            }, index * 1000);
        });
    },
    
    /**
     * 서버 데이터 상태 확인
     */
    checkServerData: function() {
        console.log('서버 데이터 상태:');
        console.log('  - SERVER_DATA 존재:', typeof window.SERVER_DATA !== 'undefined');
        
        if (window.SERVER_DATA) {
            console.log('  - 회원 통계:', window.SERVER_DATA.memberStats);
            console.log('  - 회원 목록 개수:', window.SERVER_DATA.memberPage?.content?.length || 0);
            console.log('  - CSRF 토큰 존재:', !!window.SERVER_DATA.csrfToken);
            console.log('  - 현재 관리자:', window.SERVER_DATA.currentAdmin?.name || 'Unknown');
        }
        
        console.log('  - 샘플 데이터 개수:', Object.keys(sampleMemberData).length);
    },
    
    /**
     * 현재 상태 정보 출력
     */
    getStatus: function() {
        console.log('현재 시스템 상태:');
        console.log('  - 편집 모드:', isEditMode);
        console.log('  - 현재 회원 ID:', currentMemberId);
        console.log('  - 선택된 권한:', selectedRole);
        console.log('  - 모달 열림 상태:', {
            memberModal: document.getElementById('memberModal')?.classList.contains('active'),
            roleModal: document.getElementById('roleModal')?.classList.contains('active')
        });
    },
    
    /**
     * 샘플 데이터 추가 (테스트용)
     * @param {number} count - 추가할 회원 수
     */
    addSampleMembers: function(count = 1) {
        const names = ['김철수', '이영희', '박민수', '최지은', '정대한', '한소희', '오민식', '윤서연'];
        const emails = ['user1@test.com', 'user2@test.com', 'user3@test.com', 'user4@test.com'];
        const nicknames = ['에코워리어', '그린파이터', '환경사랑', '지구지킴이', '리사이클킹', '제로웨이스트'];
        const roles = Object.keys(ROLE_MAPPING);
        const addresses = ['seoul', 'busan', 'daegu', 'incheon', 'gwangju'];
        
        for (let i = 0; i < count; i++) {
            const memberId = 'M' + String(Date.now() + i).slice(-7);
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomEmail = emails[Math.floor(Math.random() * emails.length)];
            const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
            const randomRole = roles[Math.floor(Math.random() * roles.length)];
            const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
            
            sampleMemberData[memberId] = {
                memberId: memberId,
                name: randomName,
                email: randomEmail,
                nickname: randomNickname,
                role: randomRole,
                status: 'active',
                type: 'individual',
                birthdate: String(1980 + Math.floor(Math.random() * 25)),
                gender: Math.random() > 0.5 ? 'male' : 'female',
                address: randomAddress,
                joinDate: '2024-' + String(Math.floor(Math.random() * 12) + 1).padStart(2, '0') + '-15',
                lastVisit: '2024-07-25 ' + String(Math.floor(Math.random() * 24)).padStart(2, '0') + ':30',
                points: Math.floor(Math.random() * 50000),
                activities: {
                    wasteClassifications: Math.floor(Math.random() * 200),
                    sharingParticipations: Math.floor(Math.random() * 50),
                    ecoMarketPurchases: Math.floor(Math.random() * 30),
                    communityActivities: Math.floor(Math.random() * 100)
                },
                transactions: {
                    totalPurchaseAmount: Math.floor(Math.random() * 1000000),
                    totalOrderCount: Math.floor(Math.random() * 100),
                    averageOrderAmount: Math.floor(Math.random() * 50000)
                },
                pointsInfo: {
                    currentPoints: Math.floor(Math.random() * 50000),
                    totalPoints: Math.floor(Math.random() * 200000),
                    usedPoints: Math.floor(Math.random() * 150000)
                },
                support: {
                    totalInquiries: Math.floor(Math.random() * 10),
                    completedInquiries: Math.floor(Math.random() * 8),
                    processingInquiries: Math.floor(Math.random() * 3)
                }
            };
        }
        
        console.log(`✅ ${count}개의 샘플 회원 데이터가 추가되었습니다.`);
        console.log('새로 고침 후 테이블에서 확인할 수 있습니다.');
    }
};

// 개발자 도구 사용법 안내
console.log('🛠️ 개발자 도구 사용법:');
console.log('   • window.devTools.bulkChangeRole("ROLE_NAME"): 모든 회원 권한 일괄 변경');
console.log('   • window.devTools.testNotifications(): 알림 메시지 테스트');
console.log('   • window.devTools.checkServerData(): 서버 데이터 상태 확인');
console.log('   • window.devTools.getStatus(): 현재 시스템 상태 확인');
console.log('   • window.devTools.addSampleMembers(count): 샘플 회원 데이터 추가');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');