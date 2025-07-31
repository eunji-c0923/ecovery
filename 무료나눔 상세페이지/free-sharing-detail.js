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
   페이지 렌더링 함수들
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
   댓글 관련 함수들
   ========================= */

/**
 * 댓글을 등록하는 함수
 * @param {Event} e - 이벤트 객체 (폼 제출 방지용)
 * @param {number} freeId - 게시글 ID
 */
function submitComment(e, freeId) {
    if (e) e.preventDefault(); // 폼 기본 제출 동작 방지

    const textarea = document.getElementById('commentContent');
    
    // 댓글 입력창이 없으면 로그인 필요 알림
    if (!textarea) {
        alert('로그인 후 댓글을 작성할 수 있습니다.');
        return;
    }

    const content = textarea.value.trim();
    
    // 빈 댓글 체크
    if (content === '') {
        alert('댓글 내용을 입력해주세요.');
        textarea.focus();
        return;
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
        currentPage = 1; // 첫 페이지로 리셋
        loadComments(freeId, 'recent', 1);
        showNotification('댓글이 등록되었습니다.', 'success');
        console.log('✅ 댓글 등록 성공');
    })
    .catch(error => {
        console.error('❌ 댓글 등록 실패:', error);
        showNotification('댓글 등록 중 오류가 발생했습니다.', 'error');
    });
}

/**
 * 대댓글을 등록하는 함수
 * @param {number} parentId - 부모 댓글 ID
 */
function submitChildComment(parentId) {
    const input = document.getElementById(`childCommentInput-${parentId}`);
    
    if (!input) {
        console.error('대댓글 입력창을 찾을 수 없습니다.');
        return;
    }

    const content = input.value.trim();
    const freeId = item?.freeId;

    // 빈 대댓글 체크
    if (!content) {
        alert('대댓글 내용을 입력해주세요.');
        input.focus();
        return;
    }

    // 게시글 ID 체크
    if (!freeId) {
        alert('게시글 정보를 찾을 수 없습니다.');
        return;
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
            
            // 페이징 UI 렌더링
            renderPagination();
            
            console.log(`✅ 댓글 목록 로드 완료: ${data.list.length}개 (${currentPage}/${totalPages} 페이지)`);
        })
        .catch(error => {
            console.error('❌ 댓글 로드 오류:', error);
            showNotification('댓글을 불러오는 중 오류가 발생했습니다.', 'error');
        });
}

/* =========================
   댓글 페이징 관련 함수들
   ========================= */

/**
 * 페이징 UI를 렌더링하는 함수
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
        paginationHTML += `<button class="page-btn prev-btn" onclick="goToPage(${currentPage - 1})">이전</button>`;
    }

    // 페이지 번호들
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    // 첫 페이지 (... 표시용)
    if (startPage > 1) {
        paginationHTML += `<button class="page-btn page-number" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
    }

    // 현재 페이지 주변 번호들
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="page-btn page-number ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }

    // 마지막 페이지 (... 표시용)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span class="page-dots">...</span>';
        }
        paginationHTML += `<button class="page-btn page-number" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
        paginationHTML += `<button class="page-btn next-btn" onclick="goToPage(${currentPage + 1})">다음</button>`;
    }

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

/**
 * 특정 페이지로 이동하는 함수
 * @param {number} page - 이동할 페이지 번호
 */
function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }

    const sortSelect = document.getElementById('sortSelect');
    const sortType = sortSelect ? sortSelect.value : 'recent';
    
    loadComments(item.freeId, sortType, page);
    
    // 댓글 영역으로 스크롤 (부드럽게)
    const commentSection = document.querySelector('.comment-section');
    if (commentSection) {
        commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    console.log(`📄 페이지 이동: ${page}페이지로 이동`);
}

/**
 * 첫 페이지로 이동하는 함수
 */
function goToFirstPage() {
    goToPage(1);
}

/**
 * 마지막 페이지로 이동하는 함수
 */
function goToLastPage() {
    goToPage(totalPages);
}

/**
 * 댓글 목록을 화면에 렌더링하는 함수
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

    // 각 부모 댓글에 대해 렌더링
    comments.forEach(parent => {
        const parentDiv = document.createElement('div');
        parentDiv.className = 'comment-item';
        
        // 부모 댓글 HTML 구조 생성
        parentDiv.innerHTML = `
            <p class="comment-author">${escapeHtml(parent.nickname)}</p>
            <p class="comment-content">${escapeHtml(parent.content)}</p>
            <p class="comment-date">${formatTimeAgo(parent.createdAt)}</p>
            <div class="child-comments" id="child-${parent.replyId}"></div>
            <div class="reply-form">
                <textarea id="childCommentInput-${parent.replyId}" placeholder="대댓글을 입력하세요..."></textarea>
                <button onclick="submitChildComment(${parent.replyId})">답글등록</button>
            </div>
        `;
        
        commentList.appendChild(parentDiv);

        // 대댓글 로드
        loadChildComments(parent.replyId);
    });
}

/**
 * 특정 부모 댓글의 대댓글들을 불러오는 함수
 * @param {number} parentId - 부모 댓글 ID
 */
function loadChildComments(parentId) {
    fetch(`/api/replies/child/${parentId}`)
        .then(response => response.json())
        .then(childReplies => {
            const childContainer = document.getElementById(`child-${parentId}`);
            
            if (childContainer && childReplies.length > 0) {
                // 각 대댓글 렌더링
                childReplies.forEach(child => {
                    const childDiv = document.createElement('div');
                    childDiv.className = 'child-comment-item';
                    childDiv.innerHTML = `
                        <p class="child-author">↳ ${escapeHtml(child.nickname)}</p>
                        <p class="child-content">${escapeHtml(child.content)}</p>
                        <p class="child-date">${formatTimeAgo(child.createdAt)}</p>
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
   게시글 관리 함수들 (수정/삭제)
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
   모달 관련 함수들
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
   알림 메시지 함수
   ========================= */

/**
 * 알림 메시지를 표시하는 함수
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 ('success', 'error', 'info')
 */
function showNotification(message, type = 'success') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 새 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // 페이지에 추가
    document.body.appendChild(notification);

    // 슬라이드 인 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 3초 후 자동 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);

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
        commentTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitComment(null, item.freeId);
            }
        });
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
        }
        
        // 알림 메시지도 ESC로 닫기
        const notification = document.querySelector('.notification.show');
        if (notification && event.key === 'Escape') {
            notification.classList.remove('show');
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
    console.log('🚀 무료나눔 상세페이지 로드 시작');
    
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
            if (detailWrapper) {
                detailWrapper.classList.add('fade-in');
            }
        }, 200);
        
        console.log('✅ 페이지 초기화 완료');
        
    } catch (error) {
        console.error('❌ 페이지 초기화 실패:', error);
        alert(error.message || '페이지를 불러오는 중 오류가 발생했습니다.');
        
        // 오류 발생 시 목록 페이지로 이동
        setTimeout(() => {
            window.location.href = '/free/list';
        }, 2000);
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
window.showNotification = showNotification;
window.goToPage = goToPage;
window.goToFirstPage = goToFirstPage;
window.goToLastPage = goToLastPage;

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

/* =========================
   최종 로그
   ========================= */

console.log('🎯 무료나눔 상세페이지 JavaScript 로드 완료');
console.log('📋 주요 기능:');
console.log('   ✓ 이미지 갤러리 (썸네일 클릭으로 메인 이미지 변경)');
console.log('   ✓ 작성자 권한별 수정/삭제 버튼');
console.log('   ✓ 댓글 등록 및 대댓글 기능');
console.log('   ✓ 댓글 페이징 처리 (페이지 번호 방식)');
console.log('   ✓ 연락처/채팅 모달');
console.log('   ✓ 반응형 디자인');
console.log('   ✓ 알림 메시지 시스템');
console.log('   ✓ 키보드 단축키 지원');
console.log('   ✓ 에러 처리 및 로깅');