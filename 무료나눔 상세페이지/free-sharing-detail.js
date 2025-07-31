/*서버에서 받은 데이터를 사용자가 읽기 좋게 바꿔주는 유틸리티 함수*/
// 거래생태
function getStatusText(status){
    switch (status){
        case 'ONGOING': return '나눔중';
        case 'DONE': return '나눔 완료';
        default: return '나눔중';
    }
}

// 상품상태
function getConditionText(condition){
    switch (condition){
        case 'HIGH': return '상 (매우 좋음)';
        case 'MEDIUM': return '중 (보통)';
        case 'LOW': return '하 (사용감 있음)';
        default: return '상 (매우 좋음)';
    }
}

// 등록된 시간이 현재 시간보다 얼마나 지났는지 계산
function formatTimeAgo(dateTime){
    const now = new Date();
    const created = (typeof dateTime === 'string')
        ? new Date(dateTime)
        : dateTime; // DAte 객체면 그대로

    const diff = Math.floor((now - created) / 1000); // 초단위

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    return created.toLocaleDateString(); // ex: 2025.07.28
}

// 전역 변수 선언 (item을 여기에 선언)
let item = null; // 게시글 데이터를 저장할 전역 변수


// 이미지 렌더링 코드
function renderImages(images) {
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailImages');

    if (!images || images.length === 0) {
        mainImage.alt = '이미지가 없습니다.';
        return;
    }

    // ✔️ 첫 번째 이미지를 메인 이미지로 설정
    mainImage.src = images[0].imgUrl;
    mainImage.alt = images[0].imgName;

    // ✔️ 썸네일 리스트 렌더링
    thumbnailContainer.innerHTML = '';
    images.forEach((img, index) => {
        const thumb = document.createElement('img');
        thumb.src = img.imgUrl;
        thumb.alt = img.imgName;
        thumb.classList.add('thumbnail');

        // 썸네일 클릭 시 메인 이미지 변경
        thumb.addEventListener('click', () => {
            mainImage.src = img.imgUrl;
            mainImage.alt = img.imgName;
        });

        thumbnailContainer.appendChild(thumb);
    });
}

// 댓글 등록 함수
function submitComment(e, freeId) {
    if(e) e.preventDefault(); // 폼 제출 방지

    // textarea 요소 존재 여부 확인
    const textarea = document.getElementById('commentContent');
    if (!textarea) {
        alert('로그인 후 댓글을 작성할 수 있습니다.');
        return;
    }

    const content = textarea.value.trim();
    if (content === '') {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    fetch(`/api/replies/register`, {
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
                throw new Error('서버 오류');
            }
            return response.text();
        })
        .then(data => {
            textarea.value = ''; // 입력창 초기화
            loadComments(freeId); // 부모 댓글 다시 불러오기
        })
        .catch(err => {
            console.error('댓글 등록 실패:', err);
            alert('댓글 등록 중 오류가 발생했습니다.');
        });
}


// 대댓글 등록 함수
function submitChildComment(parentId) {
    const input = document.getElementById(`childCommentInput-${parentId}`);
    const content = input.value.trim();
    const freeId = item?.freeId;

    if (!content) {
        alert('대댓글 내용을 입력해주세요.');
        return;
    }

    fetch(`/api/replies/register/child`, {
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
                throw new Error('서버 오류');
            }
            return response.text(); // ← 대댓글도 문자열 반환
        })
        .then(() => {
            input.value = '';
            loadComments(freeId); // 부모 + 대댓글 포함 새로고침
        })
        .catch(err => {
            console.error('대댓글 등록 실패:', err);
            alert('대댓글 등록 중 오류가 발생했습니다.');
        });
}

// 대댓글 입력창에서 Enter 키로 등록되도록 이벤트 연결
function setupChildReplyEnterEvent(parentId) {
    const input = document.getElementById(`childCommentInput-${parentId}`);
    if (!input) return;

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 줄바꿈 방지
            submitChildComment(parentId); // 대댓글 등록 함수 호출
        }
    });
}

// 댓글 목록 불러오는 함수
function loadComments(freeId, sortType = 'recent') {

    if (!freeId){
        console.log("freeId가 null이거나 유효하지 않아 댓글을 불러올 수 없습니다.");
        return;
    }


    fetch(`/api/replies/parent/${freeId}?sortType=${sortType}`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('commentList');
            if (!list) { // commentList 요소가 없을 경우 에러 방지
                console.error("commentList 요소를 찾을 수 없습니다.");
                return;
            }
            list.innerHTML = ''; // 초기화

            data.list.forEach(parent => {
                const parentDiv = document.createElement('div');
                parentDiv.className = 'comment-item';
                parentDiv.innerHTML = `
                    <p class="comment-author">${parent.nickname}</p>
                    <p class="comment-content">${parent.content}</p>
                    <p class="comment-date">${formatTimeAgo(parent.createdAt)}</p>
                    <div class="child-comments" id="child-${parent.replyId}"></div>
                    <div class="reply-form">
                        <textarea id="childCommentInput-${parent.replyId}" placeholder="대댓글을 입력하세요..."></textarea>
                        <button onclick="submitChildComment(${parent.replyId})">답글등록</button>
                    </div>
                `;
                list.appendChild(parentDiv);

                // 대댓글 불러오기
                fetch(`/api/replies/child/${parent.replyId}`)
                    .then(res => res.json())
                    .then(childReplies => {
                        const childContainer = document.getElementById(`child-${parent.replyId}`);
                        if (childContainer) {
                            childReplies.forEach(child => {
                                const childDiv = document.createElement('div');
                                childDiv.className = 'child-comment-item';
                                childDiv.innerHTML = `
                                <p class="child-author">↳ ${child.nickname}</p>
                                <p class="child-content">${child.content}</p>
                                <p class="child-date">${formatTimeAgo(child.createdAt)}</p>
                            `;
                                childContainer.appendChild(childDiv);
                            });
                        }
                    })
                    .catch(error => console.error('Error fetching child replies:', error));
            });
        })
        .catch(error => console.error('Error fetching comments:', error));

}

// 조회수 증가
function updateViewCount(freeId) {
    fetch(`/api/free/get/${freeId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            const viewCount = data.free?.viewCount;
            if (viewCount !== undefined) {
                const viewCountElement = document.querySelector('.view-count');
                if (viewCountElement) {
                    viewCountElement.textContent = `👀 ${viewCount}`;
                }
            }
        })
        .catch(error => {
            console.error('조회수 증가 오류:', error);
        });
}


// =========================
// 페이지가 로드되면 실행되는 함수
// =========================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('무료나눔 상세페이지가 로드되었습니다!');

    // 경로(path)에서 freeId 추출
    const pathParts = window.location.pathname.split('/');
    const freeId = pathParts[pathParts.length - 1]; // 마지막 segment가 freeId

    if (!freeId) {
        alert('잘못된 접근입니다.');
        return;
    }

    try {
        // 게시글 데이터 비동기 조회
        const response = await fetch(`/api/free/get/${freeId}`);
        if (!response.ok) throw new Error('게시글 정보를 불러올 수 없습니다.');
        const data = await response.json(); // 응답을 json으로 파싱

        console.log('서버 응답 전체 data:', data);         // 서버에서 받은 전체 JSON
        console.log('data.free:', data.free);               // free 객체만 추출
        console.log('freeId:', data.free?.freeId);          // freeId 값만

        item = data.free; // data.free -> 실제 게시글 정보 // 이 한줄로 전역 item에 저장

        console.log('📦 item 객체:', item);

        // 상세페이지 렌더링
        renderDetailPage(item);

        // 이미지 렌더링 코드
        renderImages(item.imgList);

        // 댓글 목록 기본 정렬 (최신순)
        loadComments(item.freeId, 'recent');

        // 댓글 등록 이벤트 연결
        const submitCommentBtn = document.getElementById('submitCommentBtn');
        if (submitCommentBtn) {
            submitCommentBtn.addEventListener('click', function (e){
                submitComment(e, item.freeId); // e와 item.freeId 전달
            });
        }
        // 댓글 입력창에서 Enter 키로 등록
        const commentTextarea = document.getElementById('commentContent');
        if (commentTextarea) {
            commentTextarea.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // 줄바꿈 방지
                    submitComment(null, item.freeId); // Enter로 등록
                }
            });
        }

        // 댓글 정렬 셀렉트박스 이벤트
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const selectedSort = sortSelect.value; // 'recent' 또는 'oldest'
                loadComments(item.freeId, selectedSort); // 여기서 전달을 해야지 정렬됨!
            });
        }

        // fade-in 애니메이션
        setTimeout(function () {
            const detailContainer = document.querySelector('.detail-container');
            if (detailContainer) {
                detailContainer.classList.add('fade-in');
            }
        }, 200);


        // 수정 버튼 클릭 시 editPost() 호출
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault(); // a 태그 기본 동작 방지
                editPost(); // confirm + 알림 + 1초 후 이동
            });
        }

        // 삭제 버튼 클릭 시 deletePost() 호출
        const deleteBtn = document.getElementById('deleteBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault(); // 기본 링크 막기
                deletePost(item.freeId);
            });
        }

        // 모달 배경 클릭시 닫기
        const modals = document.querySelectorAll('.modal');
        modals.forEach(function (modal) {
            modal.addEventListener('click', function (event) {
                if (event.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

    }catch (err) {
        console.error(err);
        alert('상세 정보를 불러오는 중 오류가 발생했습니다.')
    }

    setupEventListeners(); // 모든 이벤트 리스너를 설정하는 함수

});


// =========================
// 상세 페이지 렌더링 함수
// =========================
function renderDetailPage(item) {
    // 제목
    document.getElementById('itemTitle').textContent = item.title;
    document.getElementById('detailTitle').textContent = item.title;

    // 작성자 닉네임
    document.getElementById('authorNickname').textContent = item.nickname;
    document.getElementById('detailAuthor').textContent = item.nickname;

    // 등록일 (예: 2025-07-29 형식으로 변환)
    // LocalDateTime → 문자열로 전달된 createdAt 값 (예: "2025-07-28 15:30:00")
    const rawCreatedAt = item.createdAt;

    // 1. "2025-07-28 15:30:00" → "2025-07-28T15:30:00"
    const isoString = rawCreatedAt.replace(' ', 'T');

    // 2. Date 객체 생성
    const createdDate = new Date(isoString);

    // 3. 날짜 출력
    document.getElementById('detailDate').textContent = createdDate.toLocaleDateString('ko-KR');

    // 4. 상대 시간 출력
    document.getElementById('createdAt').textContent = formatTimeAgo(isoString);

    // // 조회수
    // document.getElementById('detailViews').textContent = item.viewCount;

    // 상품 상태
    document.getElementById('detailCondition').textContent = getConditionText(item.itemCondition);

    // 나눔 상태
    document.getElementById('itemStatus').textContent = getStatusText(item.dealStatus); // 배지

    // 카테고리
    document.getElementById('detailCategory').textContent = item.category;

    // 나눔 지역
    document.getElementById('regionGu').textContent = item.regionGu;
    document.getElementById('regionDong').textContent = item.regionDong;

    // 상세 설명
    document.getElementById('detailContent').textContent = item.content;

    // 작성자 info 영역 (위쪽 카드)
    document.getElementById('authorNickname').textContent = item.nickname;
    document.getElementById('viewCount').textContent = '👀 ' + item.viewCount;
    document.getElementById('createdAt').textContent = formatTimeAgo(item.createdAt);
}

// =========================
// 이벤트 리스너 설정 함수
// =========================
function setupEventListeners() {

    // ESC 키로 모달 닫기 (드롭다운 관련 코드 제거)
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAllModals();
        }
    });

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
            allThumbnails.forEach(function (thumb) {
                thumb.classList.remove('active');
            });

            // 클릭된 썸네일에 active 클래스 추가
            thumbnail.classList.add('active');

            // 애니메이션 효과
            mainImage.style.transform = 'scale(0.95)';
            setTimeout(function () {
                mainImage.style.transform = 'scale(1)';
            }, 150);

            console.log('메인 이미지가 변경되었습니다.');
        }
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
        modals.forEach(function (modal) {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
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

        if (confirm('게시글을 수정하시겠습니까?')) {
            showNotification('수정 페이지로 이동합니다.', 'success');

            setTimeout(function () {
                if (item && item.freeId) { // item이 로드되었는지 확인
                    window.location.href = '/free/modify/' + item.freeId;
                } else {
                    console.error('게시글 ID를 찾을 수 없습니다.');
                    showNotification('게시글 정보를 불러오는 중 오류가 발생했습니다.', 'error');
                }
            }, 1000);
        }
    }

// 게시글 삭제 함수 (API 컨트롤러 사용)
    function deletePost(freeId) {

        if (confirm('정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
            // 삭제 중 상태 표시
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
                        // 서버에서 오류 응답 보낸 경우
                        return response.text().then(text => {
                            throw new Error(text || '삭제 실패');
                        });
                    }
                    return response.text(); // 성공 메시지 텍스트
                })
                .then(message => {
                    showNotification(message || '게시글이 삭제되었습니다.', 'success');
                    setTimeout(() => {
                        window.location.href = '/free/list'; // 목록으로 이동
                    }, 1500);
                })
                .catch(error => {
                    console.error('게시글 삭제 오류:', error);
                    showNotification(error.message || '삭제 중 오류가 발생했습니다.', 'error');
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
        setTimeout(function () {
            notification.classList.add('show');
        }, 100);

        // 3초 후 자동 제거
        setTimeout(function () {
            notification.classList.remove('show');
            setTimeout(function () {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

// =========================
// 기타 유틸리티 함수
// =========================


// 상품 상태 업데이트
    function updateProductStatus(newStatus) {

        console.log('🔄 상태 업데이트 실행됨:', newStatus);

        const formData = new FormData();

        // // 기존 게시글 데이터 포함 (freeDto)
        // const freeDto = {
        //     ...item,
        //     dealStatus: newStatus // 상태만 변경
        // };

        const freeDto = {
            freeId: item.freeId,
            title: item.title,
            content: item.content,
            category: item.category,
            regionGu: item.regionGu,
            regionDong: item.regionDong,
            itemCondition: item.itemCondition,
            dealStatus: newStatus
        };

        // JSON -> Blob 변환 후 추가
        formData.append("freeDto", new Blob([JSON.stringify(freeDto)], {type: "application/json"}));

        // 이미지 파일은 없는 경우 빈 배열 전달 또는 기존 이미지 유지
        const dummyFileList = []; // 이미지가 필요하면 추가 가능
        dummyFileList.forEach(file => {
            formData.append("imgFile", file); // 이미지 파일은 여럿일 수 있으니 반복
        });

        fetch(`/api/free/modify/${item.freeId}`, {
            method: 'PUT',
            body: formData
        })
            .then(response => response.text())
            .then(message => {
                if (message.includes("수정되었습니다.")) {
                    const statusBadge = document.querySelector('.status-badge');
                    if (statusBadge) {
                        statusBadge.textContent = newStatus;

                        // 상태에 따른 색상 변경
                        statusBadge.className = 'status-badge';
                        let displayText = '';

                        switch (newStatus) {
                            case 'ONGOING':
                                displayText = '나눔중';
                                statusBadge.style.background = 'var(--success-green)';
                                break;
                            case 'DONE':
                                displayText = '나눔완료';
                                statusBadge.style.background = 'var(--medium-gray)';
                                break;
                        }
                        // 상태 배지에 텍스트 적용
                        statusBadge.textContent = displayText;

                        // 클래스 초기화 (필요시 스타일 적용을 위해)
                        statusBadge.className = 'status-badge';
                    }
                    showNotification('상품 상태가 업데이트되었습니다.', 'success');
                } else {
                    showNotification(message || '상태 업데이트 중 오류가 발생했습니다.', 'error');
                }
            })
            .catch(error => {
                console.error('상태 업데이트 오류:', error);
                showNotification('상태 업데이트 중 오류가 발생했습니다.', 'error');
            });
    }


// =========================
// 전역 함수로 노출 (HTML에서 onclick 등으로 사용)
// =========================

// HTML의 onclick에서 사용할 수 있도록 전역으로 노출
    window.changeMainImage = changeMainImage;
    window.closeModal = closeModal;
    window.editPost = editPost;
    window.deletePost = deletePost;
    window.updateViewCount = updateViewCount;

// 기타 유용한 전역 함수들
    window.showNotification = showNotification;
    window.updateProductStatus = updateProductStatus;

// Promise 거부 처리
    window.addEventListener('unhandledrejection', function (event) {
        console.error('처리되지 않은 Promise 거부:', event.reason);
        showNotification('작업 처리 중 오류가 발생했습니다.', 'error');
    });

// =========================
// 최종 로그
// =========================

    console.log('🤝 무료나눔 상세페이지 JavaScript가 로드되었습니다.');
    console.log('📝 사용 가능한 기능:');
    console.log('   - 작성자 권한에 따른 수정/삭제 버튼');
    console.log('   - 드롭다운 메뉴 토글');
    console.log('   - 이미지 썸네일 변경');
    console.log('   - 연락처/채팅 모달');
    console.log('   - 키보드 단축키 지원');
    console.log('   - 반응형 UI');
}
