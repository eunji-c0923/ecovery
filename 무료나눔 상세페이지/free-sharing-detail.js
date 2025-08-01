/* =========================
   개선된 댓글 시스템 JavaScript
   ========================= */

/* =========================
   전역 변수 및 상수 정의
   ========================= */

// 게시글 데이터를 저장할 전역 변수
let item = null;

// 현재 로그인한 사용자 닉네임 (서버에서 전달받음)
let loginMemberNickname = null;

// 댓글 페이징 관련 전역 변수
let currentPage = 1;        // 현재 페이지 (1부터 시작)
let totalPages = 1;         // 전체 페이지 수
let pageSize = 10;          // 페이지당 댓글 수

// 댓글 수정 모드 관리
let editingCommentId = null;
let editingChildCommentId = null;

/* =========================
   유틸리티 함수들 (데이터 변환)
   ========================= */

/**
 * 거래 상태를 사용자가 읽기 쉬운 텍스트로 변환
 * @param {string} status - 거래 상태 (ONGOING, DONE)
 * @returns {string} 변환된 텍스트
 */
function getStatusText(status) {
    switch (status) {
        case 'ONGOING': return '나눔중';
        case 'DONE': return '나눔 완료';
        default: return '나눔중';
    }
}

/**
 * 상품 상태를 사용자가 읽기 쉬운 텍스트로 변환
 * @param {string} condition - 상품 상태 (HIGH, MEDIUM, LOW)
 * @returns {string} 변환된 텍스트
 */
function getConditionText(condition) {
    switch (condition) {
        case 'HIGH': return '상 (매우 좋음)';
        case 'MEDIUM': return '중 (보통)';
        case 'LOW': return '하 (사용감 있음)';
        default: return '상 (매우 좋음)';
    }
}

/**
 * 등록된 시간이 현재 시간보다 얼마나 지났는지 계산하여 상대 시간으로 변환
 * @param {string|Date} dateTime - 등록 시간
 * @returns {string} 상대 시간 (예: "3시간 전", "2일 전")
 */
function formatTimeAgo(dateTime) {
    const now = new Date();
    const created = (typeof dateTime === 'string') 
        ? new Date(dateTime.replace(' ', 'T')) // "2025-07-28 15:30:00" → "2025-07-28T15:30:00"
        : dateTime;

    const diff = Math.floor((now - created) / 1000); // 초 단위 차이

    // 시간대별 변환
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    
    // 일주일 이상은 날짜로 표시
    return created.toLocaleDateString('ko-KR');
}

/**
 * HTML 특수문자를 이스케이프하는 함수 (XSS 방지)
 * @param {string} text - 원본 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* =========================
   이미지 갤러리 관련 함수들
   ========================= */

/**
 * 이미지 갤러리를 렌더링하는 함수
 * @param {Array} images - 이미지 배열 [{imgUrl, imgName}, ...]
 */
function renderImages(images) {
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailImages');

    // 이미지가 없는 경우 처리
    if (!images || images.length === 0) {
        if (mainImage) {
            mainImage.src = 'https://via.placeholder.com/500x400/f0f0f0/666?text=이미지+없음';
            mainImage.alt = '이미지가 없습니다.';
        }
        return;
    }

    // 첫 번째 이미지를 메인 이미지로 설정
    if (mainImage && images[0]) {
        mainImage.src = images[0].imgUrl;
        mainImage.alt = images[0].imgName;
    }

    // 썸네일 컨테이너 초기화
    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = '';

        // 각 이미지에 대해 썸네일 생성
        images.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img.imgUrl;
            thumb.alt = img.imgName;
            thumb.classList.add('thumbnail');
            
            // 첫 번째 썸네일에 활성 상태 표시
            if (index === 0) {
                thumb.classList.add('active');
            }

            // 썸네일 클릭 이벤트 추가
            thumb.addEventListener('click', () => {
                changeMainImage(thumb);
            });

            // 썸네일을 컨테이너에 추가
            thumbnailContainer.appendChild(thumb);
        });
    }

    console.log(`✅ 이미지 갤러리 렌더링 완료: ${images.length}개 이미지`);
}

/**
 * 메인 이미지를 변경하는 함수 (썸네일 클릭 시 호출)
 * @param {HTMLElement} thumbnail - 클릭된 썸네일 요소
 */
function changeMainImage(thumbnail) {
    const mainImage = document.getElementById('mainImage');
    const allThumbnails = document.querySelectorAll('.thumbnail');

    if (mainImage && thumbnail) {
        // 메인 이미지 소스 변경
        mainImage.src = thumbnail.src;
        mainImage.alt = thumbnail.alt;

        // 모든 썸네일의 활성 상태 제거
        allThumbnails.forEach(thumb => {
            thumb.classList.remove('active');
        });

        // 클릭된 썸네일에 활성 상태 추가
        thumbnail.classList.add('active');

        // 부드러운 전환 효과
        mainImage.style.transform = 'scale(0.98)';
        setTimeout(() => {
            mainImage.style.transform = 'scale(1)';
        }, 150);

        console.log('🖼️ 메인 이미지 변경됨:', thumbnail.alt);
    }
}

/* =========================
   페이지 렌더링 함수들 (기존 함수들 유지)
   ========================= */

/**
 * 상세 페이지의 모든 요소를 렌더링하는 메인 함수
 * @param {Object} itemData - 게시글 데이터 객체
 */
function renderDetailPage(itemData) {
    try {
        if (!itemData) {
            throw new Error('게시글 데이터가 없습니다.');
        }

        // 전역 변수에 저장
        item = itemData;
        
        // 상품 기본 정보 렌더링
        renderProductInfo(itemData);
        
        // 작성자 정보 렌더링
        renderAuthorInfo(itemData);
        
        // 상품 상세 정보 렌더링
        renderProductDetails(itemData);
        
        // 작성자 권한 확인 및 액션 버튼 표시
        checkAuthorPermissions(itemData);

        console.log('✅ 상세페이지 렌더링 완료');
    } catch (error) {
        console.error('❌ 상세페이지 렌더링 오류:', error);
        showNotification('페이지 렌더링 중 오류가 발생했습니다.', 'error');
    }
}

/**
 * 상품 기본 정보를 렌더링하는 함수
 * @param {Object} itemData - 게시글 데이터
 */
function renderProductInfo(itemData) {
    // 상태 배지 설정
    const statusBadge = document.getElementById('itemStatus');
    if (statusBadge) {
        statusBadge.textContent = getStatusText(itemData.dealStatus);
        
        // 상태에 따른 배지 색상 변경
        statusBadge.className = 'status-badge';
        if (itemData.dealStatus === 'DONE') {
            statusBadge.style.background = 'var(--medium-gray)';
        }
    }

    // 상품 제목 설정
    const titleElement = document.getElementById('itemTitle');
    if (titleElement) {
        titleElement.textContent = itemData.title;
    }

    // 상품 설명 설정
    const contentElement = document.getElementById('detailContent');
    if (contentElement) {
        contentElement.textContent = itemData.content;
    }
}

/**
 * 작성자 정보를 렌더링하는 함수
 * @param {Object} itemData - 게시글 데이터
 */
function renderAuthorInfo(itemData) {
    // 작성자 닉네임 설정
    const authorElement = document.getElementById('authorNickname');
    if (authorElement) {
        authorElement.textContent = itemData.nickname;
    }

    // 조회수 설정
    const viewCountElement = document.getElementById('viewCount');
    if (viewCountElement) {
        viewCountElement.textContent = `👀 ${itemData.viewCount}`;
    }

    // 작성일 설정 (상대 시간)
    const createdAtElement = document.getElementById('createdAt');
    if (createdAtElement) {
        createdAtElement.textContent = formatTimeAgo(itemData.createdAt);
    }
}

/**
 * 상품 상세 정보 테이블을 렌더링하는 함수
 * @param {Object} itemData - 게시글 데이터
 */
function renderProductDetails(itemData) {
    // 상품 상태
    const conditionElement = document.getElementById('detailCondition');
    if (conditionElement) {
        conditionElement.textContent = getConditionText(itemData.itemCondition);
    }

    // 카테고리
    const categoryElement = document.getElementById('detailCategory');
    if (categoryElement) {
        categoryElement.textContent = itemData.category;
    }

    // 나눔 지역
    const regionGuElement = document.getElementById('regionGu');
    const regionDongElement = document.getElementById('regionDong');
    if (regionGuElement) regionGuElement.textContent = itemData.regionGu;
    if (regionDongElement) regionDongElement.textContent = itemData.regionDong;

    // 등록일
    const dateElement = document.getElementById('detailDate');
    if (dateElement) {
        const createdDate = new Date(itemData.createdAt.replace(' ', 'T'));
        dateElement.textContent = createdDate.toLocaleDateString('ko-KR');
    }
}

/**
 * 작성자 권한을 확인하고 액션 버튼을 표시/숨김하는 함수
 * @param {Object} itemData - 게시글 데이터
 */
function checkAuthorPermissions(itemData) {
    const authorActions = document.getElementById('authorActions');
    
    // 로그인한 사용자가 작성자인 경우에만 수정/삭제 버튼 표시
    if (authorActions && loginMemberNickname && loginMemberNickname === itemData.nickname) {
        authorActions.style.display = 'flex';
        console.log('👤 작성자 권한 확인: 수정/삭제 버튼 표시');
    } else if (authorActions) {
        authorActions.style.display = 'none';
        console.log('🚫 작성자 권한 없음: 수정/삭제 버튼 숨김');
    }
}

/* =========================
   개선된 댓글 관련 함수들
   ========================= */

/**
 * 댓글 입력창의 글자수를 실시간으로 업데이트하는 함수
 */
function updateCharCount() {
    const textarea = document.getElementById('commentContent');
    const charCount = document.getElementById('charCount');
    
    if (textarea && charCount) {
        const currentLength = textarea.value.length;
        const maxLength = 500;
        
        charCount.textContent = currentLength;
        
        // 글자수에 따른 색상 변경
        if (currentLength > maxLength * 0.9) {
            charCount.style.color = 'var(--error-red)';
        } else if (currentLength > maxLength * 0.7) {
            charCount.style.color = 'var(--warning-orange)';
        } else {
            charCount.style.color = 'var(--medium-gray)';
        }
    }
}

/**
 * 댓글을 등록하는 함수 (개선된 버전)
 * @param {Event} e - 이벤트 객체 (폼 제출 방지용)
 * @param {number} freeId - 게시글 ID
 */
function submitComment(e, freeId) {
    if (e) e.preventDefault(); // 폼 기본 제출 동작 방지

    const textarea = document.getElementById('commentContent');
    const submitBtn = document.getElementById('submitCommentBtn');
    
    // 댓글 입력창이 없으면 로그인 필요 알림
    if (!textarea) {
        showNotification('로그인 후 댓글을 작성할 수 있습니다.', 'info');
        return;
    }

    const content = textarea.value.trim();
    
    // 빈 댓글 체크
    if (content === '') {
        showNotification('댓글 내용을 입력해주세요.', 'warning');
        textarea.focus();
        return;
    }

    // 글자수 체크
    if (content.length > 500) {
        showNotification('댓글은 500자 이내로 작성해주세요.', 'warning');
        textarea.focus();
        return;
    }

    // 버튼 비활성화 및 로딩 표시
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span> 등록중...';
    }

    // 서버에 댓글 등록 요청
    fetch('/api/replies/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            freeId: freeId,
            content: content
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('서버 오류가 발생했습니다.');
        }
        return response.text();
    })
    .then(data => {
        // 성공 시 입력창 초기화 및 댓글 목록 새로고침 (첫 페이지로)
        textarea.value = '';
        updateCharCount(); // 글자수 초기화
        currentPage = 1; // 첫 페이지로 리셋
        loadComments(freeId, 'recent', 1);
        
        // 성공 애니메이션
        if (submitBtn) {
            submitBtn.classList.add('success');
            setTimeout(() => {
                submitBtn.classList.remove('success');
            }, 600);
        }
        
        showNotification('댓글이 등록되었습니다.', 'success');
        console.log('✅ 댓글 등록 성공');
    })
    .catch(error => {
        console.error('❌ 댓글 등록 실패:', error);
        showNotification('댓글 등록 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        // 버튼 활성화 및 원래 텍스트로 복구
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-icon">📝</span> 댓글 등록';
        }
    });
}

/**
 * 대댓글을 등록하는 함수 (개선된 버전)
 * @param {number} parentId - 부모 댓글 ID
 */
function submitChildComment(parentId) {
    const input = document.getElementById(`childCommentInput-${parentId}`);
    const submitBtn = document.querySelector(`#reply-form-${parentId} .reply-submit-btn`);
    
    if (!input) {
        console.error('대댓글 입력창을 찾을 수 없습니다.');
        return;
    }

    const content = input.value.trim();
    const freeId = item?.freeId;

    // 빈 대댓글 체크
    if (!content) {
        showNotification('대댓글 내용을 입력해주세요.', 'warning');
        input.focus();
        return;
    }

    // 게시글 ID 체크
    if (!freeId) {
        showNotification('게시글 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    // 버튼 비활성화 및 로딩 표시
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ 등록중...';
    }

    // 서버에 대댓글 등록 요청
    fetch('/api/replies/register/child', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            freeId: freeId,
            parentId: parentId,
            content: content
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('서버 오류가 발생했습니다.');
        }
        return response.text();
    })
    .then(() => {
        // 성공 시 입력창 초기화 및 댓글 목록 새로고침 (현재 페이지 유지)
        input.value = '';
        const sortSelect = document.getElementById('sortSelect');
        const sortType = sortSelect ? sortSelect.value : 'recent';
        loadComments(freeId, sortType, currentPage);
        showNotification('대댓글이 등록되었습니다.', 'success');
        console.log('✅ 대댓글 등록 성공');
    })
    .catch(error => {
        console.error('❌ 대댓글 등록 실패:', error);
        showNotification('대댓글 등록 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        // 버튼 활성화 및 원래 텍스트로 복구
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '📝 답글등록';
        }
    });
}

/**
 * 댓글 목록을 불러오는 함수 (페이징 처리)
 * @param {number} freeId - 게시글 ID
 * @param {string} sortType - 정렬 방식 ('recent' 또는 'oldest')
 * @param {number} page - 페이지 번호 (1부터 시작)
 */
function loadComments(freeId, sortType = 'recent', page = 1) {
    // 게시글 ID 유효성 검사
    if (!freeId) {
        console.error('❌ freeId가 유효하지 않아 댓글을 불러올 수 없습니다.');
        return;
    }

    // 로딩 표시
    showCommentLoading(true);

    // 서버에서 부모 댓글 목록 가져오기 (페이징 포함)
    fetch(`/api/replies/parent/${freeId}?sortType=${sortType}&page=${page}&size=${pageSize}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('댓글을 불러오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            // 페이징 정보 업데이트
            currentPage = data.currentPage || page;
            totalPages = data.totalPages || 1;
            
            // 댓글 목록 렌더링
            renderCommentList(data.list);
            
            // 댓글 개수 업데이트
            updateCommentCount(data.totalElements || data.list.length);
            
            // 페이징 UI 렌더링
            renderPagination();
            
            console.log(`✅ 댓글 목록 로드 완료: ${data.list.length}개 (${currentPage}/${totalPages} 페이지)`);
        })
        .catch(error => {
            console.error('❌ 댓글 로드 오류:', error);
            showNotification('댓글을 불러오는 중 오류가 발생했습니다.', 'error');
        })
        .finally(() => {
            // 로딩 표시 제거
            showCommentLoading(false);
        });
}

/**
 * 댓글 로딩 상태를 표시하는 함수
 * @param {boolean} isLoading - 로딩 중인지 여부
 */
function showCommentLoading(isLoading) {
    const commentList = document.getElementById('commentList');
    
    if (!commentList) return;
    
    if (isLoading) {
        commentList.innerHTML = `
            <div class="comment-loading">
                <div class="loading-spinner"></div>
                <p>댓글을 불러오는 중...</p>
            </div>
        `;
        
        // CSS로 로딩 스피너 추가
        const style = document.createElement('style');
        style.textContent = `
            .comment-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 40px;
                color: var(--medium-gray);
            }
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid var(--light-gray);
                border-top: 4px solid var(--primary-green);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 15px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * 댓글 개수를 업데이트하는 함수
 * @param {number} count - 댓글 개수
 */
function updateCommentCount(count) {
    const commentCount = document.getElementById('commentCount');
    if (commentCount) {
        commentCount.textContent = count || 0;
    }
}

/* =========================
   개선된 댓글 페이징 관련 함수들
   ========================= */

/**
 * 개선된 페이징 UI를 렌더링하는 함수
 */
function renderPagination() {
    const paginationContainer = document.getElementById('commentPagination');
    
    if (!paginationContainer) {
        console.error('❌ 페이징 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // 페이지가 1개면 페이징 숨김
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';

    // 이전 페이지 버튼
    if (currentPage > 1) {
        paginationHTML += `
            <button class="page-btn prev-btn" onclick="goToPage(${currentPage - 1})" aria-label="이전 페이지">
                <span>← 이전</span>
            </button>
        `;
    }

    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // 첫 페이지 (... 표시용)
    if (startPage > 1) {
        paginationHTML += `
            <button class="page-btn page-number" onclick="goToPage(1)" aria-label="1페이지로 이동">
                <span>1</span>
            </button>
        `;
        if (startPage > 2) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
    }

    // 현재 페이지 주변 번호들
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        const ariaLabel = i === currentPage ? `현재 페이지 ${i}` : `${i}페이지로 이동`;
        paginationHTML += `
            <button class="page-btn page-number ${activeClass}" onclick="goToPage(${i})" aria-label="${ariaLabel}">
                <span>${i}</span>
            </button>
        `;
    }

    // 마지막 페이지 (... 표시용)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
        paginationHTML += `
            <button class="page-btn page-number" onclick="goToPage(${totalPages})" aria-label="${totalPages}페이지로 이동">
                <span>${totalPages}</span>
            </button>
        `;
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        paginationHTML += `
            <button class="page-btn next-btn" onclick="goToPage(${currentPage + 1})" aria-label="다음 페이지">
                <span>다음 →</span>
            </button>
        `;
    }

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

/**
 * 특정 페이지로 이동하는 함수 (개선된 버전)
 * @param {number} page - 이동할 페이지 번호
 */
function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }

    const sortSelect = document.getElementById('sortSelect');
    const sortType = sortSelect ? sortSelect.value : 'recent';
    
    // 페이지 이동 시 부드러운 애니메이션
    const commentList = document.getElementById('commentList');
    if (commentList) {
        commentList.style.opacity = '0.5';
        commentList.style.transform = 'translateY(20px)';
    }
    
    loadComments(item.freeId, sortType, page);
    
    // 댓글 영역으로 스크롤 (부드럽게)
    const commentSection = document.querySelector('.comment-section');
    if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // 애니메이션 복구
    setTimeout(() => {
        if (commentList) {
            commentList.style.opacity = '1';
            commentList.style.transform = 'translateY(0)';
        }
    }, 300);
    
    console.log(`📄 페이지 이동: ${page}페이지로 이동`);
}

/**
 * 개선된 댓글 목록을 화면에 렌더링하는 함수
 * @param {Array} comments - 댓글 배열
 */
function renderCommentList(comments) {
    const commentList = document.getElementById('commentList');
    
    if (!commentList) {
        console.error('❌ 댓글 목록 컨테이너를 찾을 수 없습니다.');
        return;
    }

    // 기존 댓글 목록 초기화
    commentList.innerHTML = '';

    // 댓글이 없는 경우
    if (!comments || comments.length === 0) {
        commentList.innerHTML = `
            <div class="no-comments">
                <div class="no-comments-icon">💬</div>
                <p class="no-comments-text">아직 댓글이 없습니다.</p>
                <p class="no-comments-subtext">첫 번째 댓글을 작성해보세요!</p>
            </div>
        `;
        
        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .no-comments {
                text-align: center;
                padding: 60px 20px;
                color: var(--medium-gray);
            }
            .no-comments-icon {
                font-size: 48px;
                margin-bottom: 20px;
                opacity: 0.6;
            }
            .no-comments-text {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
                color: var(--dark-gray);
            }
            .no-comments-subtext {
                font-size: 14px;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
        return;
    }

    // 각 부모 댓글에 대해 렌더링
    comments.forEach((parent, index) => {
        const parentDiv = document.createElement('div');
        parentDiv.className = 'comment-item';
        parentDiv.style.animationDelay = `${index * 0.1}s`; // 순차적 애니메이션
        
        // 부모 댓글 HTML 구조 생성
        const isAuthor = loginMemberNickname === parent.nickname;
        const editDeleteButtons = isAuthor ? `
            <div class="comment-actions">
                <button class="comment-edit-btn" onclick="editComment(${parent.replyId})" title="댓글 수정">
                    ✏️ 수정
                </button>
                <button class="comment-delete-btn" onclick="deleteComment(${parent.replyId})" title="댓글 삭제">
                    🗑️ 삭제
                </button>
            </div>
        ` : '';
        
        parentDiv.innerHTML = `
            <div class="comment-header-info">
                <div class="comment-meta-left">
                    <p class="comment-author">${escapeHtml(parent.nickname)}</p>
                    <p class="comment-date">${formatTimeAgo(parent.createdAt)}</p>
                </div>
                ${editDeleteButtons}
            </div>
            <div class="comment-content" id="comment-content-${parent.replyId}">
                ${escapeHtml(parent.content)}
            </div>
            <div class="child-comments" id="child-${parent.replyId}"></div>
            <div class="reply-form" id="reply-form-${parent.replyId}">
                <div class="reply-form-header">
                    <h4>💭 답글 작성</h4>
                </div>
                <div class="reply-form-content">
                    <textarea 
                        id="childCommentInput-${parent.replyId}" 
                        placeholder="답글을 입력하세요..."
                        maxlength="300"
                    ></textarea>
                    <button class="reply-submit-btn" onclick="submitChildComment(${parent.replyId})">
                        📝 답글등록
                    </button>
                </div>
            </div>
        `;
        
        commentList.appendChild(parentDiv);

        // 대댓글 로드
        loadChildComments(parent.replyId);
    });
}

/**
 * 특정 부모 댓글의 대댓글들을 불러오는 함수 (개선된 버전)
 * @param {number} parentId - 부모 댓글 ID
 */
function loadChildComments(parentId) {
    fetch(`/api/replies/child/${parentId}`)
        .then(response => response.json())
        .then(childReplies => {
            const childContainer = document.getElementById(`child-${parentId}`);
            
            if (childContainer && childReplies.length > 0) {
                // 각 대댓글 렌더링
                childReplies.forEach((child, index) => {
                    const childDiv = document.createElement('div');
                    childDiv.className = 'child-comment-item';
                    childDiv.style.animationDelay = `${index * 0.05}s`; // 순차적 애니메이션
                    
                    const isAuthor = loginMemberNickname === child.nickname;
                    const editDeleteButtons = isAuthor ? `
                        <div class="child-comment-actions">
                            <button class="child-comment-edit-btn" onclick="editChildComment(${child.replyId})" title="답글 수정">
                                ✏️
                            </button>
                            <button class="child-comment-delete-btn" onclick="deleteChildComment(${child.replyId})" title="답글 삭제">
                                🗑️
                            </button>
                        </div>
                    ` : '';
                    
                    childDiv.innerHTML = `
                        <div class="child-comment-header">
                            <div class="child-comment-meta">
                                <p class="child-author">${escapeHtml(child.nickname)}</p>
                                <p class="child-date">${formatTimeAgo(child.createdAt)}</p>
                            </div>
                            ${editDeleteButtons}
                        </div>
                        <div class="child-content" id="child-content-${child.replyId}">
                            ${escapeHtml(child.content)}
                        </div>
                    `;
                    childContainer.appendChild(childDiv);
                });
                
                console.log(`✅ 대댓글 로드 완료: ${childReplies.length}개`);
            }
        })
        .catch(error => {
            console.error('❌ 대댓글 로드 오류:', error);
        });
}

/* =========================
   댓글 수정/삭제 함수들 (새로 추가)
   ========================= */

/**
 * 댓글을 수정 모드로 전환하는 함수
 * @param {number} commentId - 댓글 ID
 */
function editComment(commentId) {
    // 이미 다른 댓글이 수정 중이면 취소
    if (editingCommentId && editingCommentId !== commentId) {
        cancelEditComment(editingCommentId);
    }
    
    editingCommentId = commentId;
    const contentDiv = document.getElementById(`comment-content-${commentId}`);
    
    if (!contentDiv) return;
    
    const currentContent = contentDiv.textContent;
    
    // 수정 모드 UI로 변경
    contentDiv.innerHTML = `
        <textarea class="comment-edit-textarea" id="edit-textarea-${commentId}" maxlength="500">${escapeHtml(currentContent)}</textarea>
        <div class="comment-edit-actions">
            <button class="comment-save-btn" onclick="saveComment(${commentId})">
                💾 저장
            </button>
            <button class="comment-cancel-btn" onclick="cancelEditComment(${commentId})">
                ❌ 취소
            </button>
        </div>
    `;
    
    // 부모 댓글 아이템에 수정 모드 클래스 추가
    const commentItem = contentDiv.closest('.comment-item');
    if (commentItem) {
        commentItem.classList.add('comment-edit-mode');
    }
    
    // 텍스트영역에 포커스
    const textarea = document.getElementById(`edit-textarea-${commentId}`);
    if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
}

/**
 * 댓글 수정을 저장하는 함수
 * @param {number} commentId - 댓글 ID
 */
function saveComment(commentId) {
    const textarea = document.getElementById(`edit-textarea-${commentId}`);
    
    if (!textarea) return;
    
    const newContent = textarea.value.trim();
    
    if (!newContent) {
        showNotification('댓글 내용을 입력해주세요.', 'warning');
        textarea.focus();
        return;
    }
    
    if (newContent.length > 500) {
        showNotification('댓글은 500자 이내로 작성해주세요.', 'warning');
        textarea.focus();
        return;
    }
    
    // 저장 버튼 비활성화
    const saveBtn = document.querySelector(`#comment-content-${commentId} .comment-save-btn`);
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '⏳ 저장중...';
    }
    
    // 서버에 수정 요청
    fetch(`/api/replies/modify/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: newContent
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('댓글 수정에 실패했습니다.');
        }
        return response.text();
    })
    .then(() => {
        // 수정 모드 해제
        cancelEditComment(commentId);
        
        // 댓글 목록 새로고침
        const sortSelect = document.getElementById('sortSelect');
        const sortType = sortSelect ? sortSelect.value : 'recent';
        loadComments(item.freeId, sortType, currentPage);
        
        showNotification('댓글이 수정되었습니다.', 'success');
        console.log('✅ 댓글 수정 성공');
    })
    .catch(error => {
        console.error('❌ 댓글 수정 실패:', error);
        showNotification('댓글 수정 중 오류가 발생했습니다.', 'error');
        
        // 버튼 활성화
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 저장';
        }
    });
}

/**
 * 댓글 수정을 취소하는 함수
 * @param {number} commentId - 댓글 ID
 */
function cancelEditComment(commentId) {
    editingCommentId = null;
    
    // 댓글 목록 새로고침하여 원래 상태로 복구
    const sortSelect = document.getElementById('sortSelect');
    const sortType = sortSelect ? sortSelect.value : 'recent';
    loadComments(item.freeId, sortType, currentPage);
}

/**
 * 댓글을 삭제하는 함수
 * @param {number} commentId - 댓글 ID
 */
function deleteComment(commentId) {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?\n삭제된 댓글은 복구할 수 없습니다.')) {
        return;
    }
    
    // 서버에 삭제 요청
    fetch(`/api/replies/remove/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('댓글 삭제에 실패했습니다.');
        }
        return response.text();
    })
    .then(() => {
        // 댓글 목록 새로고침
        const sortSelect = document.getElementById('sortSelect');
        const sortType = sortSelect ? sortSelect.value : 'recent';
        loadComments(item.freeId, sortType, currentPage);
        
        showNotification('댓글이 삭제되었습니다.', 'success');
        console.log('✅ 댓글 삭제 성공');
    })
    .catch(error => {
        console.error('❌ 댓글 삭제 실패:', error);
        showNotification('댓글 삭제 중 오류가 발생했습니다.', 'error');
    });
}

/**
 * 대댓글을 수정 모드로 전환하는 함수
 * @param {number} childCommentId - 대댓글 ID
 */
function editChildComment(childCommentId) {
    // 이미 다른 대댓글이 수정 중이면 취소
    if (editingChildCommentId && editingChildCommentId !== childCommentId) {
        cancelEditChildComment(editingChildCommentId);
    }
    
    editingChildCommentId = childCommentId;
    const contentDiv = document.getElementById(`child-content-${childCommentId}`);
    
    if (!contentDiv) return;
    
    const currentContent = contentDiv.textContent;
    
    // 수정 모드 UI로 변경
    contentDiv.innerHTML = `
        <textarea class="comment-edit-textarea" id="edit-child-textarea-${childCommentId}" maxlength="300">${escapeHtml(currentContent)}</textarea>
        <div class="comment-edit-actions">
            <button class="comment-save-btn" onclick="saveChildComment(${childCommentId})">
                💾 저장
            </button>
            <button class="comment-cancel-btn" onclick="cancelEditChildComment(${childCommentId})">
                ❌ 취소
            </button>
        </div>
    `;
    
    // 대댓글 아이템에 수정 모드 클래스 추가
    const childItem = contentDiv.closest('.child-comment-item');
    if (childItem) {
        childItem.classList.add('comment-edit-mode');
    }
    
    // 텍스트영역에 포커스
    const textarea = document.getElementById(`edit-child-textarea-${childCommentId}`);
    if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
}

/**
 * 대댓글 수정을 저장하는 함수
 * @param {number} childCommentId - 대댓글 ID
 */
function saveChildComment(childCommentId) {
    const textarea = document.getElementById(`edit-child-textarea-${childCommentId}`);
    
    if (!textarea) return;
    
    const newContent = textarea.value.trim();
    
    if (!newContent) {
        showNotification('답글 내용을 입력해주세요.', 'warning');
        textarea.focus();
        return;
    }
    
    if (newContent.length > 300) {
        showNotification('답글은 300자 이내로 작성해주세요.', 'warning');
        textarea.focus();
        return;
    }
    
    // 저장 버튼 비활성화
    const saveBtn = document.querySelector(`#child-content-${childCommentId} .comment-save-btn`);
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '⏳ 저장중...';
    }
    
    // 서버에 수정 요청
    fetch(`/api/replies/modify/${childCommentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: newContent
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('답글 수정에 실패했습니다.');
        }
        return response.text();
    })
    .then(() => {
        // 수정 모드 해제
        cancelEditChildComment(childCommentId);
        
        // 댓글 목록 새로고침
        const sortSelect = document.getElementById('sortSelect');
        const sortType = sortSelect ? sortSelect.value : 'recent';
        loadComments(item.freeId, sortType, currentPage);
        
        showNotification('답글이 수정되었습니다.', 'success');
        console.log('✅ 대댓글 수정 성공');
    })
    .catch(error => {
        console.error('❌ 대댓글 수정 실패:', error);
        showNotification('답글 수정 중 오류가 발생했습니다.', 'error');
        
        // 버튼 활성화
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 저장';
        }
    });
}

/**
 * 대댓글 수정을 취소하는 함수
 * @param {number} childCommentId - 대댓글 ID
 */
function cancelEditChildComment(childCommentId) {
    editingChildCommentId = null;
    
    // 댓글 목록 새로고침하여 원래 상태로 복구
    const sortSelect = document.getElementById('sortSelect');
    const sortType = sortSelect ? sortSelect.value : 'recent';
    loadComments(item.freeId, sortType, currentPage);
}

/**
 * 대댓글을 삭제하는 함수
 * @param {number} childCommentId - 대댓글 ID
 */
function deleteChildComment(childCommentId) {
    if (!confirm('정말로 이 답글을 삭제하시겠습니까?\n삭제된 답글은 복구할 수 없습니다.')) {
        return;
    }
    
    // 서버에 삭제 요청
    fetch(`/api/replies/remove/${childCommentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('답글 삭제에 실패했습니다.');
        }
        return response.text();
    })
    .then(() => {
        // 댓글 목록 새로고침
        const sortSelect = document.getElementById('sortSelect');
        const sortType = sortSelect ? sortSelect.value : 'recent';
        loadComments(item.freeId, sortType, currentPage);
        
        showNotification('답글이 삭제되었습니다.', 'success');
        console.log('✅ 대댓글 삭제 성공');
    })
    .catch(error => {
        console.error('❌ 대댓글 삭제 실패:', error);
        showNotification('답글 삭제 중 오류가 발생했습니다.', 'error');
    });
}

/* =========================
   게시글 관리 함수들 (수정/삭제) - 기존 함수 유지
   ========================= */

/**
 * 게시글 수정 페이지로 이동하는 함수
 */
function editPost() {
    if (!item || !item.freeId) {
        showNotification('게시글 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    if (confirm('게시글을 수정하시겠습니까?')) {
        showNotification('수정 페이지로 이동합니다.', 'success');
        
        setTimeout(() => {
            window.location.href = `/free/modify/${item.freeId}`;
        }, 1000);
    }
}

/**
 * 게시글을 삭제하는 함수
 * @param {number} freeId - 게시글 ID
 */
function deletePost(freeId) {
    if (!freeId) {
        showNotification('게시글 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    // 삭제 확인
    if (confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
        showNotification('게시글을 삭제하는 중입니다...', 'info');

        // 서버에 삭제 요청
        fetch(`/api/free/remove/${freeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || '삭제에 실패했습니다.');
                });
            }
            return response.text();
        })
        .then(message => {
            showNotification(message || '게시글이 삭제되었습니다.', 'success');
            
            // 1.5초 후 목록 페이지로 이동
            setTimeout(() => {
                window.location.href = '/free/list';
            }, 1500);
        })
        .catch(error => {
            console.error('❌ 게시글 삭제 오류:', error);
            showNotification(error.message || '삭제 중 오류가 발생했습니다.', 'error');
        });
    }
}

/* =========================
   모달 관련 함수들 - 기존 함수 유지
   ========================= */

/**
 * 연락처 모달을 여는 함수
 */
function openContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        console.log('📞 연락처 모달 열림');
    }
}

/**
 * 채팅 모달을 여는 함수
 */
function openChatModal() {
    const modal = document.getElementById('chatModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        console.log('💬 채팅 모달 열림');
        
        // 채팅 입력창에 포커스
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            setTimeout(() => chatInput.focus(), 300);
        }
    }
}

/**
 * 특정 모달을 닫는 함수
 * @param {string} modalId - 모달 ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // 스크롤 복원
        console.log(`❌ ${modalId} 모달 닫힘`);
    }
}

/**
 * 모든 모달을 닫는 함수
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = ''; // 스크롤 복원
    console.log('❌ 모든 모달 닫힘');
}

/**
 * 채팅 메시지를 전송하는 함수 (데모용)
 */
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // 메시지 요소 생성
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-time">${new Date().toLocaleTimeString('ko-KR', {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    // 메시지 추가 및 스크롤
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 입력창 초기화
    chatInput.value = '';
    
    console.log('💬 메시지 전송:', message);
}

/* =========================
   개선된 알림 메시지 함수
   ========================= */

/**
 * 개선된 알림 메시지를 표시하는 함수
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'info', 'warning')
 */
function showNotification(message, type = 'success') {
    // 기존 알림 제거
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // 새 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // 타입별 아이콘 설정
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${icons[type] || icons.info}</span>
            <span class="notification-message">${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // 페이지에 추가
    document.body.appendChild(notification);

    // 슬라이드 인 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 5초 후 자동 제거 (에러는 7초)
    const autoCloseTime = type === 'error' ? 7000 : 5000;
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, autoCloseTime);

    // 알림 스타일 추가 (한 번만)
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--white);
                color: var(--dark-gray);
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 350px;
                font-weight: 500;
                border-left: 4px solid;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification.success {
                border-left-color: var(--success-green);
                background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
            }
            .notification.error {
                border-left-color: var(--error-red);
                background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
            }
            .notification.info {
                border-left-color: var(--primary-green);
                background: linear-gradient(135deg, rgba(45, 90, 61, 0.1) 0%, rgba(45, 90, 61, 0.05) 100%);
            }
            .notification.warning {
                border-left-color: var(--warning-orange);
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification-icon {
                font-size: 18px;
            }
            .notification-message {
                font-size: 14px;
                line-height: 1.4;
            }
            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: var(--medium-gray);
                padding: 2px 6px;
                border-radius: 50%;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }
            .notification-close:hover {
                background: rgba(0, 0, 0, 0.1);
                color: var(--dark-gray);
            }
            @media (max-width: 480px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    max-width: none;
                    transform: translateY(-100px);
                }
                .notification.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    console.log(`🔔 알림 표시: [${type}] ${message}`);
}

/* =========================
   이벤트 리스너 설정 함수들
   ========================= */

/**
 * 모든 이벤트 리스너를 설정하는 함수
 */
function setupEventListeners() {
    // 댓글 관련 이벤트 리스너
    setupCommentEventListeners();
    
    // 게시글 관리 이벤트 리스너
    setupPostManagementEventListeners();
    
    // 모달 관련 이벤트 리스너
    setupModalEventListeners();
    
    // 키보드 단축키 이벤트 리스너
    setupKeyboardEventListeners();
    
    console.log('✅ 모든 이벤트 리스너 설정 완료');
}

/**
 * 댓글 관련 이벤트 리스너를 설정하는 함수
 */
function setupCommentEventListeners() {
    // 댓글 등록 버튼
    const submitCommentBtn = document.getElementById('submitCommentBtn');
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', (e) => {
            submitComment(e, item.freeId);
        });
    }

    // 댓글 입력창에서 Enter 키로 등록 (Shift+Enter는 줄바꿈)
    const commentTextarea = document.getElementById('commentContent');
    if (commentTextarea) {
        // 글자수 카운터 이벤트
        commentTextarea.addEventListener('input', updateCharCount);
        
        // 키보드 이벤트
        commentTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitComment(null, item.freeId);
            }
        });
        
        // 초기 글자수 설정
        updateCharCount();
    }

    // 댓글 정렬 변경
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const selectedSort = sortSelect.value;
            currentPage = 1; // 정렬 변경시 첫 페이지로 리셋
            loadComments(item.freeId, selectedSort, 1);
            console.log('🔄 댓글 정렬 변경:', selectedSort);
        });
    }
}

/**
 * 게시글 관리 관련 이벤트 리스너를 설정하는 함수
 */
function setupPostManagementEventListeners() {
    // 수정 버튼
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editPost();
        });
    }

    // 삭제 버튼
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            deletePost(item.freeId);
        });
    }
}

/**
 * 모달 관련 이벤트 리스너를 설정하는 함수
 */
function setupModalEventListeners() {
    // 모든 모달의 배경 클릭 시 닫기
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // 채팅 입력창에서 Enter 키로 메시지 전송
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

/**
 * 키보드 단축키 이벤트 리스너를 설정하는 함수
 */
function setupKeyboardEventListeners() {
    document.addEventListener('keydown', (event) => {
        // ESC 키로 모달 닫기
        if (event.key === 'Escape') {
            closeAllModals();
            
            // 댓글 수정 모드도 취소
            if (editingCommentId) {
                cancelEditComment(editingCommentId);
            }
            if (editingChildCommentId) {
                cancelEditChildComment(editingChildCommentId);
            }
        }
        
        // 알림 메시지도 ESC로 닫기
        const notifications = document.querySelectorAll('.notification.show');
        if (notifications.length > 0 && event.key === 'Escape') {
            notifications.forEach(notification => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
    });
}

/* =========================
   페이지 초기화 함수
   ========================= */

/**
 * URL에서 게시글 ID를 추출하는 함수
 * @returns {string|null} 게시글 ID
 */
function extractFreeIdFromUrl() {
    const pathParts = window.location.pathname.split('/');
    const freeId = pathParts[pathParts.length - 1];
    
    // 숫자인지 확인
    if (freeId && !isNaN(freeId)) {
        return freeId;
    }
    
    return null;
}

/**
 * 서버에서 게시글 데이터를 로드하는 함수
 * @param {string} freeId - 게시글 ID
 */
async function loadItemData(freeId) {
    const response = await fetch(`/api/free/get/${freeId}`);
    
    if (!response.ok) {
        throw new Error('게시글 정보를 불러올 수 없습니다.');
    }
    
    const data = await response.json();
    
    if (!data.free) {
        throw new Error('게시글 데이터가 올바르지 않습니다.');
    }
    
    // 전역 변수에 저장
    item = data.free;
    
    console.log('📦 게시글 데이터 로드 완료:', item.title);
}

/**
 * 페이지가 로드되면 실행되는 메인 초기화 함수
 */
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 개선된 무료나눔 상세페이지 로드 시작');
    
    try {
        // 서버에서 전달받은 데이터 처리
        if (window.serverData) {
            item = window.serverData.item;
            loginMemberNickname = window.serverData.loginMemberNickname;
            
            console.log('🔧 서버 데이터 처리 완료:', {
                hasItem: !!item,
                loginUser: loginMemberNickname
            });
        } else {
            // URL에서 게시글 ID 추출하여 데이터 로드
            const freeId = extractFreeIdFromUrl();
            
            if (!freeId) {
                throw new Error('올바르지 않은 게시글 URL입니다.');
            }

            // 게시글 데이터 로드
            await loadItemData(freeId);
        }
        
        // 페이지 렌더링
        renderDetailPage(item);
        renderImages(window.serverData?.imageList || item?.imgList);
        
        // 댓글 로드
        if (item?.freeId) {
            loadComments(item.freeId, 'recent', 1);
        }
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        // 페이드인 애니메이션
        setTimeout(() => {
            const detailWrapper = document.querySelector('.detail-wrapper');
            const commentCard = document.querySelector('.comment-card');
            
            if (detailWrapper) {
                detailWrapper.classList.add('fade-in');
            }
            if (commentCard) {
                commentCard.style.opacity = '0';
                commentCard.style.transform = 'translateY(30px)';
                commentCard.style.transition = 'all 0.6s ease';
                
                setTimeout(() => {
                    commentCard.style.opacity = '1';
                    commentCard.style.transform = 'translateY(0)';
                }, 300);
            }
        }, 200);
        
        console.log('✅ 개선된 페이지 초기화 완료');
        
    } catch (error) {
        console.error('❌ 페이지 초기화 실패:', error);
        showNotification(error.message || '페이지를 불러오는 중 오류가 발생했습니다.', 'error');
        
        // 오류 발생 시 목록 페이지로 이동
        setTimeout(() => {
            window.location.href = '/free/list';
        }, 3000);
    }
});

/* =========================
   전역 함수 노출 (HTML에서 사용)
   ========================= */

// HTML의 onclick 등에서 사용할 수 있도록 전역으로 노출
window.changeMainImage = changeMainImage;
window.openContactModal = openContactModal;
window.openChatModal = openChatModal;
window.closeModal = closeModal;
window.sendMessage = sendMessage;
window.editPost = editPost;
window.deletePost = deletePost;
window.submitComment = submitComment;
window.submitChildComment = submitChildComment;
window.editComment = editComment;
window.saveComment = saveComment;
window.cancelEditComment = cancelEditComment;
window.deleteComment = deleteComment;
window.editChildComment = editChildComment;
window.saveChildComment = saveChildComment;
window.cancelEditChildComment = cancelEditChildComment;
window.deleteChildComment = deleteChildComment;
window.showNotification = showNotification;
window.goToPage = goToPage;
window.updateCharCount = updateCharCount;

/* =========================
   에러 처리
   ========================= */

// 처리되지 않은 Promise 거부 처리
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ 처리되지 않은 Promise 거부:', event.reason);
    showNotification('작업 처리 중 오류가 발생했습니다.', 'error');
});

// 일반 JavaScript 오류 처리
window.addEventListener('error', function(event) {
    console.error('❌ JavaScript 오류:', event.error);
    showNotification('페이지에서 오류가 발생했습니다.', 'error');
});

console.log('🎯 개선된 무료나눔 상세페이지 JavaScript 로드 완료');
console.log('📋 주요 개선사항:');
console.log('   ✓ 댓글 섹션 전폭 확장 (1400px)');
console.log('   ✓ 댓글 작성 폼 상단 배치');
console.log('   ✓ 댓글 입력창 크기 고정 (resize 방지)');
console.log('   ✓ 실시간 글자수 카운터');
console.log('   ✓ 댓글/대댓글 수정/삭제 기능');
console.log('   ✓ 개선된 버튼 디자인 및 애니메이션');
console.log('   ✓ 향상된 페이징 UI');
console.log('   ✓ 로딩 상태 표시');
console.log('   ✓ 개선된 알림 시스템');
console.log('   ✓ 반응형 디자인 최적화');
console.log('   ✓ 접근성 개선 (키보드 단축키, 포커스 관리)');
console.log('   ✓ 에러 처리 및 사용자 피드백 강화');