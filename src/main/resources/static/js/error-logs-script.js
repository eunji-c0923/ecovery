// ====================================
// GreenCycle 분리배출 내역 관리 JavaScript
// ====================================

// ====================================
// 전역 변수 및 상수 선언
// ====================================

// 서버에서 전달받은 데이터 (Thymeleaf에서 설정)
let wasteHistoryData = window.wasteHistoryData || [];
let currentUser = window.currentUser || null;
let categoriesData = window.categoriesData || [];
let regionsData = window.regionsData || [];
let paginationData = window.paginationData || {};

// 현재 필터 상태
let currentFilters = {
    search: '',
    region: '',
    category: '',
    accuracy: '',
    dateRange: '',
    pageSize: 10
};

// 현재 편집 중인 항목 ID
let currentEditingId = null;

// 정렬 상태
let currentSort = {
    column: 'date',
    direction: 'desc'
};

// ====================================
// 페이지 로드 시 초기화
// ====================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 분리배출 내역 관리 페이지 초기화 시작');
    
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // 네비게이션 초기화
    initializeNavigation();
    
    // 현재 URL에서 필터 파라미터 읽기
    loadFiltersFromURL();
    
    // 테이블 기능 초기화
    initializeTableFeatures();
    
    // 모달 기능 초기화
    initializeModal();
    
    console.log('✅ 분리배출 내역 관리 페이지 초기화 완료');
});

// ====================================
// 네비게이션 기능 (메인 페이지와 동일)
// ====================================
function initializeNavigation() {
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // 스크롤 시 헤더 스타일 변경
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 햄버거 메뉴 토글 (모바일)
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // 햄버거 아이콘 애니메이션
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });
    }
    
    console.log('📱 네비게이션 기능이 초기화되었습니다.');
}

// ====================================
// 이벤트 리스너 설정
// ====================================
function setupEventListeners() {
    console.log('이벤트 리스너 설정 중...');
    
    // 검색 기능
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        // 엔터 키로 검색
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // 실시간 검색 (디바운스 적용)
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    
    // 필터 기능
    const regionFilter = document.getElementById('region-filter');
    const categoryFilter = document.getElementById('category-filter');
    const accuracyFilter = document.getElementById('accuracy-filter');
    const dateFilter = document.getElementById('date-filter');
    const resetFilter = document.getElementById('reset-filter');
    const applyFilter = document.getElementById('apply-filter');
    
    if (regionFilter) regionFilter.addEventListener('change', handleFilterChange);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilterChange);
    if (accuracyFilter) accuracyFilter.addEventListener('change', handleFilterChange);
    if (dateFilter) dateFilter.addEventListener('change', handleFilterChange);
    if (resetFilter) resetFilter.addEventListener('click', resetFilters);
    if (applyFilter) applyFilter.addEventListener('click', applyFilters);
    
    // 페이지 크기 변경
    const pageSizeSelect = document.getElementById('page-size');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', handlePageSizeChange);
    }
    
    // 새로고침 및 내보내기 버튼
    const refreshBtn = document.getElementById('refresh-btn');
    const exportBtn = document.getElementById('export-btn');
    
    if (refreshBtn) refreshBtn.addEventListener('click', refreshPage);
    if (exportBtn) exportBtn.addEventListener('click', exportToExcel);
    
    // 테이블 정렬 기능
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const sortColumn = this.dataset.sort;
            handleSort(sortColumn);
        });
    });
    
    console.log('이벤트 리스너 설정 완료');
}

// ====================================
// 검색 기능
// ====================================
function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.trim();
    console.log(`검색어: ${searchTerm}`);
    
    currentFilters.search = searchTerm;
    applyFiltersAndReload();
}

// ====================================
// 필터 기능
// ====================================
function handleFilterChange() {
    // 자동 적용하지 않고 사용자가 적용 버튼을 클릭하도록 함
    console.log('필터 옵션이 변경되었습니다.');
}

function applyFilters() {
    console.log('필터 적용 중...');
    
    // 현재 선택된 필터 값들 수집
    const regionFilter = document.getElementById('region-filter');
    const categoryFilter = document.getElementById('category-filter');
    const accuracyFilter = document.getElementById('accuracy-filter');
    const dateFilter = document.getElementById('date-filter');
    
    currentFilters.region = regionFilter ? regionFilter.value : '';
    currentFilters.category = categoryFilter ? categoryFilter.value : '';
    currentFilters.accuracy = accuracyFilter ? accuracyFilter.value : '';
    currentFilters.dateRange = dateFilter ? dateFilter.value : '';
    
    applyFiltersAndReload();
}

function resetFilters() {
    console.log('필터 초기화');
    
    // 모든 필터 입력값 초기화
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const categoryFilter = document.getElementById('category-filter');
    const accuracyFilter = document.getElementById('accuracy-filter');
    const dateFilter = document.getElementById('date-filter');
    
    if (searchInput) searchInput.value = '';
    if (regionFilter) regionFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (accuracyFilter) accuracyFilter.value = '';
    if (dateFilter) dateFilter.value = '';
    
    // 필터 상태 초기화
    currentFilters = {
        search: '',
        region: '',
        category: '',
        accuracy: '',
        dateRange: '',
        pageSize: currentFilters.pageSize
    };
    
    applyFiltersAndReload();
}

function applyFiltersAndReload() {
    // 서버에 필터링된 데이터 요청
    const params = new URLSearchParams();
    
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.region) params.append('region', currentFilters.region);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.accuracy) params.append('accuracy', currentFilters.accuracy);
    if (currentFilters.dateRange) params.append('dateRange', currentFilters.dateRange);
    if (currentFilters.pageSize) params.append('size', currentFilters.pageSize);
    if (currentSort.column) params.append('sort', currentSort.column + ',' + currentSort.direction);
    
    // 첫 페이지로 이동
    params.append('page', '1');
    
    // 페이지 새로고침
    const newUrl = window.location.pathname + '?' + params.toString();
    window.location.href = newUrl;
}

// ====================================
// URL에서 필터 파라미터 로드
// ====================================
function loadFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // URL 파라미터에서 필터 값 읽기
    const searchParam = urlParams.get('search') || '';
    const regionParam = urlParams.get('region') || '';
    const categoryParam = urlParams.get('category') || '';
    const accuracyParam = urlParams.get('accuracy') || '';
    const dateRangeParam = urlParams.get('dateRange') || '';
    const sizeParam = urlParams.get('size') || '10';
    const sortParam = urlParams.get('sort') || '';
    
    // 필터 상태 업데이트
    currentFilters = {
        search: searchParam,
        region: regionParam,
        category: categoryParam,
        accuracy: accuracyParam,
        dateRange: dateRangeParam,
        pageSize: parseInt(sizeParam)
    };
    
    // 정렬 상태 업데이트
    if (sortParam) {
        const [column, direction] = sortParam.split(',');
        currentSort = {
            column: column,
            direction: direction || 'asc'
        };
    }
    
    // 폼 요소에 값 설정
    const searchInput = document.getElementById('search-input');
    const regionFilter = document.getElementById('region-filter');
    const categoryFilter = document.getElementById('category-filter');
    const accuracyFilter = document.getElementById('accuracy-filter');
    const dateFilter = document.getElementById('date-filter');
    const pageSizeSelect = document.getElementById('page-size');
    
    if (searchInput) searchInput.value = searchParam;
    if (regionFilter) regionFilter.value = regionParam;
    if (categoryFilter) categoryFilter.value = categoryParam;
    if (accuracyFilter) accuracyFilter.value = accuracyParam;
    if (dateFilter) dateFilter.value = dateRangeParam;
    if (pageSizeSelect) pageSizeSelect.value = sizeParam;
    
    console.log('URL에서 필터 파라미터를 로드했습니다:', currentFilters);
}

// ====================================
// 페이지 크기 변경
// ====================================
function handlePageSizeChange() {
    const pageSizeSelect = document.getElementById('page-size');
    if (pageSizeSelect) {
        currentFilters.pageSize = parseInt(pageSizeSelect.value);
        applyFiltersAndReload();
    }
}

// ====================================
// 정렬 기능
// ====================================
function handleSort(column) {
    console.log(`정렬: ${column}`);
    
    // 같은 컬럼 클릭 시 방향 토글, 다른 컬럼 클릭 시 오름차순으로 시작
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // 서버에 정렬된 데이터 요청
    applyFiltersAndReload();
}

// ====================================
// 테이블 기능 초기화
// ====================================
function initializeTableFeatures() {
    // 이미지 로드 실패 시 기본 이미지로 교체
    document.querySelectorAll('.waste-image').forEach(img => {
        img.addEventListener('error', function() {
            this.src = '/img/default-waste.png';
        });
    });
    
    // 정렬 표시기 업데이트
    updateSortIndicators();
    
    console.log('테이블 기능이 초기화되었습니다.');
}

function updateSortIndicators() {
    // 모든 정렬 표시기 초기화
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        const afterContent = header.querySelector('::after');
        header.style.setProperty('--sort-indicator', '↕');
    });
    
    // 현재 정렬 컬럼에 표시기 추가
    const currentHeader = document.querySelector(`[data-sort="${currentSort.column}"]`);
    if (currentHeader) {
        currentHeader.classList.add(`sort-${currentSort.direction}`);
        const indicator = currentSort.direction === 'asc' ? '↑' : '↓';
        currentHeader.style.setProperty('--sort-indicator', indicator);
    }
}

// ====================================
// 모달 기능
// ====================================
function initializeModal() {
    const modal = document.getElementById('detail-modal');
    const closeButtons = document.querySelectorAll('.close-modal, #close-modal');
    
    // 모달 닫기 이벤트
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
    
    // 저장 및 삭제 버튼
    const saveBtn = document.getElementById('save-changes');
    const deleteBtn = document.getElementById('delete-record');
    
    if (saveBtn) saveBtn.addEventListener('click', saveChanges);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteRecord);
    
    console.log('모달 기능이 초기화되었습니다.');
}

function openModal(id) {
    console.log(`모달 열기: ID ${id}`);
    
    // 서버에서 상세 데이터 가져오기
    fetch(`/api/admin/waste-history/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('데이터를 불러올 수 없습니다.');
            }
            return response.json();
        })
        .then(data => {
            populateModal(data);
            currentEditingId = id;
            
            // 모달 표시
            const modal = document.getElementById('detail-modal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
            }
        })
        .catch(error => {
            console.error('모달 데이터 로드 오류:', error);
            showNotification('데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        });
}

function populateModal(data) {
    // 모달에 데이터 설정
    const modalImage = document.getElementById('modal-image');
    const modalAiPrediction = document.getElementById('modal-ai-prediction');
    const modalConfidence = document.getElementById('modal-confidence');
    const modalCategory = document.getElementById('modal-category');
    const modalRegion = document.getElementById('modal-region');
    const modalNickname = document.getElementById('modal-nickname');
    const modalMemberGrade = document.getElementById('modal-member-grade');
    const modalDate = document.getElementById('modal-date');
    const modalMemo = document.getElementById('modal-memo');
    const modalStatus = document.getElementById('modal-status');
    
    // 이미지 정보
    const imageFilename = document.getElementById('image-filename');
    const imageUploadDate = document.getElementById('image-upload-date');
    
    if (modalImage) modalImage.src = data.imageUrl || '/img/default-waste.png';
    if (modalAiPrediction) modalAiPrediction.textContent = data.aiPrediction || '';
    if (modalConfidence) modalConfidence.textContent = `신뢰도: ${data.aiConfidence || 0}%`;
    if (modalCategory) modalCategory.value = data.finalCategory || '';
    if (modalRegion) modalRegion.textContent = data.region || '';
    if (modalNickname) modalNickname.textContent = data.memberNickname || '';
    if (modalMemberGrade) {
        modalMemberGrade.textContent = data.memberGrade || '';
        modalMemberGrade.className = `member-grade ${(data.memberGrade || '').toLowerCase()}`;
    }
    if (modalDate) modalDate.textContent = formatDateTime(data.createdAt);
    if (modalMemo) modalMemo.value = data.memo || '';
    if (modalStatus) modalStatus.value = data.status || 'PENDING';
    
    if (imageFilename) imageFilename.textContent = `파일명: ${data.imageFilename || 'unknown.jpg'}`;
    if (imageUploadDate) imageUploadDate.textContent = `업로드: ${formatDateTime(data.createdAt)}`;
}

function closeModal() {
    console.log('모달 닫기');
    
    const modal = document.getElementById('detail-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 스크롤 복원
    }
    currentEditingId = null;
}

function editItem(id) {
    openModal(id);
    console.log(`편집 모드로 모달 열기: ID ${id}`);
}

// ====================================
// 데이터 수정 및 삭제
// ====================================
function saveChanges() {
    if (!currentEditingId) return;
    
    console.log(`데이터 수정 저장: ID ${currentEditingId}`);
    
    // 폼 데이터 수집
    const modalCategory = document.getElementById('modal-category');
    const modalMemo = document.getElementById('modal-memo');
    const modalStatus = document.getElementById('modal-status');
    
    const updateData = {
        finalCategory: modalCategory ? modalCategory.value : '',
        memo: modalMemo ? modalMemo.value : '',
        status: modalStatus ? modalStatus.value : 'PENDING'
    };
    
    // 로딩 상태 표시
    const saveBtn = document.getElementById('save-changes');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';
    }
    
    // 서버에 업데이트 요청
    fetch(`/api/admin/waste-history/${currentEditingId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('저장에 실패했습니다.');
        }
        return response.json();
    })
    .then(data => {
        console.log('데이터 수정 완료:', data);
        showNotification('변경사항이 저장되었습니다.', 'success');
        
        // 모달 닫기
        closeModal();
        
        // 페이지 새로고침 (업데이트된 데이터 반영)
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
    .catch(error => {
        console.error('데이터 저장 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        // 버튼 상태 복원
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '변경사항 저장';
        }
    });
}

function confirmDelete(id) {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?\n삭제된 데이터는 복구할 수 없습니다.')) {
        deleteRecord(id);
    }
}

function deleteRecord(id = null) {
    const targetId = id || currentEditingId;
    if (!targetId) return;
    
    console.log(`데이터 삭제: ID ${targetId}`);
    
    // 로딩 상태 표시
    const deleteBtn = document.getElementById('delete-record');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.textContent = '삭제 중...';
    }
    
    // 서버에 삭제 요청
    fetch(`/api/admin/waste-history/${targetId}`, {
        method: 'DELETE',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('삭제에 실패했습니다.');
        }
        console.log('데이터 삭제 완료');
        showNotification('항목이 삭제되었습니다.', 'success');
        
        // 모달 닫기
        if (document.getElementById('detail-modal').style.display === 'block') {
            closeModal();
        }
        
        // 페이지 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    })
    .catch(error => {
        console.error('데이터 삭제 오류:', error);
        showNotification('삭제 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        // 버튼 상태 복원
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.textContent = '삭제';
        }
    });
}

// ====================================
// 유틸리티 함수들
// ====================================

// 페이지 새로고침
function refreshPage() {
    console.log('페이지 새로고침');
    showNotification('데이터를 새로고침합니다.', 'info');
    window.location.reload();
}

// 엑셀 다운로드
function exportToExcel() {
    console.log('엑셀 파일로 내보내기');
    
    // 현재 필터 조건을 포함하여 다운로드 URL 생성
    const params = new URLSearchParams();
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.region) params.append('region', currentFilters.region);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.accuracy) params.append('accuracy', currentFilters.accuracy);
    if (currentFilters.dateRange) params.append('dateRange', currentFilters.dateRange);
    
    const downloadUrl = `/api/admin/waste-history/export?${params.toString()}`;
    
    // 파일 다운로드
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `분리배출내역_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('엑셀 파일 다운로드가 시작됩니다.', 'success');
}

// 알림 메시지 표시
function showNotification(message, type = 'info') {
    console.log(`알림: ${message} (${type})`);
    
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // DOM에 추가
    document.body.appendChild(notification);
    
    // 슬라이드 인 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 자동 제거 (3초 후)
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 날짜/시간 포맷팅
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        console.error('날짜 포맷팅 오류:', error);
        return dateTimeString;
    }
}

// 디바운스 함수 - 연속된 함수 호출을 제한
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 쓰로틀 함수 - 함수 호출 빈도를 제한
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

// ====================================
// 전역 함수 노출 (HTML에서 호출 가능)
// ====================================
window.openModal = openModal;
window.editItem = editItem;
window.confirmDelete = confirmDelete;
window.showNotification = showNotification;

// ====================================
// 에러 처리
// ====================================

// 전역 에러 핸들러
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript 오류 발생:', e.error);
    showNotification('예상치 못한 오류가 발생했습니다.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 처리되지 않은 Promise 거부:', e.reason);
    showNotification('네트워크 오류가 발생했습니다.', 'error');
    e.preventDefault();
});

// ====================================
// 초기화 완료 로그
// ====================================
window.addEventListener('load', function() {
    console.log('🎉 분리배출 내역 관리 페이지가 완전히 로드되었습니다!');
    
    // 성능 측정 (개발 환경에서만)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`⚡ 페이지 로딩 시간: ${loadTime}ms`);
        }
    }
});

// ====================================
// 개발자 도구 (개발 환경에서만)
// ====================================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.WasteHistoryDebug = {
        // 현재 필터 상태 확인
        getFilters: () => currentFilters,
        
        // 현재 정렬 상태 확인
        getSort: () => currentSort,
        
        // 필터 강제 적용
        applyFilters: (filters) => {
            Object.assign(currentFilters, filters);
            applyFiltersAndReload();
        },
        
        // 모달 강제 열기
        openModal: (id) => openModal(id),
        
        // 알림 테스트
        testNotification: (message, type) => showNotification(message, type),
        
        // 현재 상태 정보
        getStatus: () => ({
            currentFilters,
            currentSort,
            currentEditingId,
            wasteHistoryData: wasteHistoryData?.length || 0,
            paginationData
        })
    };
    
    console.log('🛠️ 개발자 도구가 활성화되었습니다. window.WasteHistoryDebug로 접근하세요.');
}

// CSS 스타일 동적 추가 (정렬 표시기 등)
const style = document.createElement('style');
style.textContent = `
    .sortable::after {
        content: var(--sort-indicator, ' ↕');
        font-size: 12px;
        color: var(--medium-gray);
        margin-left: 5px;
    }
    
    .sortable.sort-asc::after {
        content: ' ↑';
        color: var(--primary-green);
    }
    
    .sortable.sort-desc::after {
        content: ' ↓';
        color: var(--primary-green);
    }
    
    .table-row:hover .waste-image {
        transform: scale(1.05);
    }
    
    .btn-action:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(style);

console.log('📄 분리배출 내역 관리 JavaScript 모듈이 로드되었습니다.');