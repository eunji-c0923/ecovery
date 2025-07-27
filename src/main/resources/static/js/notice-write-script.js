/* =========================================
   공지사항 작성 페이지 JavaScript
   notice-write-script.js
   ========================================= */

/* =========================================
   전역 변수 및 설정
   ========================================= */

// Quill 에디터 인스턴스
let quillEditor = null;

// 자동저장 타이머
let autoSaveTimer = null;
const AUTO_SAVE_INTERVAL = 30000; // 30초마다 자동저장

// 파일 업로드 관련
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// 업로드된 파일 목록
let uploadedFiles = [];

// 태그 목록
let currentTags = [];

// 폼 상태 관리
let isFormModified = false;
let isSaving = false;

/* =========================================
   초기화 함수
   ========================================= */

/**
 * DOM 로드 완료 후 실행되는 메인 초기화 함수
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 공지사항 작성 페이지가 로드되었습니다.');
    
    // 각 컴포넌트 초기화
    initializeEditor();
    initializeFormValidation();
    initializeFileUpload();
    initializeTagSystem();
    initializeEventListeners();
    initializeAutoSave();
    initializeMobileMenu();
    
    // 기존 데이터가 있으면 복원
    if (window.notice) {
        restoreNoticeData(window.notice);
    }
    
    console.log('📝 모든 컴포넌트가 초기화되었습니다.');
});

/**
 * 모바일 메뉴 초기화
 */
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

/* =========================================
   리치 에디터 초기화
   ========================================= */

/**
 * Quill 리치 에디터 초기화
 */
function initializeEditor() {
    const editorElement = document.getElementById('editor');
    if (!editorElement) return;
    
    // Quill 에디터 설정
    const quillOptions = {
        theme: 'snow',
        placeholder: '공지사항 내용을 작성하세요...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    };
    
    // 에디터 초기화
    quillEditor = new Quill('#editor', quillOptions);
    
    // 에디터 내용 변경 이벤트 리스너
    quillEditor.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user') {
            // 숨겨진 textarea에 내용 동기화
            document.getElementById('content').value = quillEditor.root.innerHTML;
            
            // 폼 수정 상태 업데이트
            markFormAsModified();
            
            console.log('📝 에디터 내용이 변경되었습니다.');
        }
    });
    
    console.log('✅ 리치 에디터가 초기화되었습니다.');
}

/* =========================================
   폼 유효성 검사
   ========================================= */

/**
 * 폼 유효성 검사 초기화
 */
function initializeFormValidation() {
    const form = document.getElementById('noticeWriteForm');
    if (!form) return;
    
    // 제목 입력 시 글자 수 카운터 업데이트
    const titleInput = document.getElementById('title');
    const titleCounter = document.getElementById('titleCounter');
    
    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', function() {
            const length = this.value.length;
            titleCounter.textContent = length;
            
            // 글자 수에 따른 색상 변경
            if (length > 90) {
                titleCounter.parentElement.className = 'char-counter danger';
            } else if (length > 70) {
                titleCounter.parentElement.className = 'char-counter warning';
            } else {
                titleCounter.parentElement.className = 'char-counter';
            }
            
            markFormAsModified();
        });
    }
    
    // 폼 제출 이벤트 처리
    form.addEventListener('submit', handleFormSubmit);
    
    // 입력 필드 변경 감지
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', markFormAsModified);
    });
    
    console.log('✅ 폼 유효성 검사가 초기화되었습니다.');
}

/**
 * 폼 제출 처리
 * @param {Event} event - 폼 제출 이벤트
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isSaving) {
        showNotification('현재 저장 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
        return;
    }
    
    // 유효성 검사
    if (!validateForm()) {
        return;
    }
    
    // 제출 버튼 확인
    const submitButton = event.submitter;
    const action = submitButton ? submitButton.value : 'draft';
    
    // 폼 제출
    submitForm(action);
}

/**
 * 폼 유효성 검사
 * @returns {boolean} 유효성 검사 통과 여부
 */
function validateForm() {
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const content = quillEditor.getText().trim();
    
    // 제목 검사
    if (!title) {
        showNotification('제목을 입력해주세요.', 'error');
        document.getElementById('title').focus();
        return false;
    }
    
    if (title.length > 100) {
        showNotification('제목은 100자 이하로 입력해주세요.', 'error');
        document.getElementById('title').focus();
        return false;
    }
    
    // 카테고리 검사
    if (!category) {
        showNotification('카테고리를 선택해주세요.', 'error');
        document.getElementById('category').focus();
        return false;
    }
    
    // 내용 검사
    if (!content || content.length < 10) {
        showNotification('내용을 10자 이상 입력해주세요.', 'error');
        quillEditor.focus();
        return false;
    }
    
    return true;
}

/* =========================================
   파일 업로드 시스템
   ========================================= */

/**
 * 파일 업로드 시스템 초기화
 */
function initializeFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('attachments');
    
    if (!uploadArea || !fileInput) return;
    
    // 클릭으로 파일 선택
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 파일 선택 이벤트
    fileInput.addEventListener('change', function(event) {
        handleFileSelect(event.target.files);
    });
    
    // 드래그 앤 드롭 이벤트
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleFileDrop);
    
    console.log('✅ 파일 업로드 시스템이 초기화되었습니다.');
}

/**
 * 드래그 오버 이벤트 처리
 * @param {DragEvent} event - 드래그 이벤트
 */
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

/**
 * 드래그 리브 이벤트 처리
 * @param {DragEvent} event - 드래그 이벤트
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
}

/**
 * 파일 드롭 이벤트 처리
 * @param {DragEvent} event - 드롭 이벤트
 */
function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    handleFileSelect(files);
}

/**
 * 파일 선택 처리
 * @param {FileList} files - 선택된 파일 목록
 */
function handleFileSelect(files) {
    if (!files || files.length === 0) return;
    
    // 파일 개수 제한 검사
    if (uploadedFiles.length + files.length > MAX_FILES) {
        showNotification(`최대 ${MAX_FILES}개의 파일만 업로드할 수 있습니다.`, 'error');
        return;
    }
    
    // 각 파일 처리
    Array.from(files).forEach(file => {
        if (validateFile(file)) {
            addFileToList(file);
        }
    });
    
    updateAttachmentList();
}

/**
 * 파일 유효성 검사
 * @param {File} file - 검사할 파일
 * @returns {boolean} 유효한 파일 여부
 */
function validateFile(file) {
    // 파일 크기 검사
    if (file.size > MAX_FILE_SIZE) {
        showNotification(`${file.name}의 크기가 10MB를 초과합니다.`, 'error');
        return false;
    }
    
    // 파일 타입 검사
    if (!ALLOWED_TYPES.includes(file.type)) {
        showNotification(`${file.name}은 지원하지 않는 파일 형식입니다.`, 'error');
        return false;
    }
    
    // 중복 파일 검사
    if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
        showNotification(`${file.name}은 이미 업로드된 파일입니다.`, 'warning');
        return false;
    }
    
    return true;
}

/**
 * 파일을 업로드 목록에 추가
 * @param {File} file - 추가할 파일
 */
function addFileToList(file) {
    const fileObj = {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
    };
    
    uploadedFiles.push(fileObj);
    markFormAsModified();
    
    console.log(`📎 파일이 추가되었습니다: ${file.name}`);
}

/**
 * 첨부파일 목록 UI 업데이트
 */
function updateAttachmentList() {
    const listContainer = document.getElementById('attachmentList');
    if (!listContainer) return;
    
    if (uploadedFiles.length === 0) {
        listContainer.innerHTML = '';
        return;
    }
    
    const html = uploadedFiles.map(fileObj => `
        <div class="attachment-item" data-file-id="${fileObj.id}">
            <span class="file-icon">${getFileIcon(fileObj.type)}</span>
            <div class="file-info">
                <div class="file-name">${fileObj.name}</div>
                <div class="file-size">${fileObj.size}</div>
            </div>
            <div class="file-actions">
                <button type="button" class="file-action remove" onclick="removeFile('${fileObj.id}')">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
    
    listContainer.innerHTML = html;
}

/**
 * 파일 아이콘 반환
 * @param {string} fileType - 파일 MIME 타입
 * @returns {string} 파일 아이콘 이모지
 */
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📎';
}

/**
 * 파일 크기 포맷팅
 * @param {number} bytes - 바이트 크기
 * @returns {string} 포맷팅된 크기 문자열
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 파일 제거
 * @param {string} fileId - 제거할 파일 ID
 */
function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    updateAttachmentList();
    markFormAsModified();
    
    showNotification('파일이 제거되었습니다.', 'info');
}

/* =========================================
   태그 시스템
   ========================================= */

/**
 * 태그 시스템 초기화
 */
function initializeTagSystem() {
    const tagInput = document.getElementById('tags');
    if (!tagInput) return;
    
    // 태그 입력 이벤트
    tagInput.addEventListener('input', handleTagInput);
    tagInput.addEventListener('keydown', handleTagKeydown);
    
    console.log('✅ 태그 시스템이 초기화되었습니다.');
}

/**
 * 태그 입력 처리
 * @param {Event} event - 입력 이벤트
 */
function handleTagInput(event) {
    const value = event.target.value;
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    currentTags = tags;
    updateTagPreview();
    markFormAsModified();
}

/**
 * 태그 입력 키다운 이벤트 처리
 * @param {KeyboardEvent} event - 키보드 이벤트
 */
function handleTagKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = event.target;
        const value = input.value.trim();
        
        if (value && !value.endsWith(',')) {
            input.value = value + ', ';
            handleTagInput(event);
        }
    }
}

/**
 * 태그 미리보기 업데이트
 */
function updateTagPreview() {
    const previewContainer = document.getElementById('tagPreview');
    if (!previewContainer) return;
    
    if (currentTags.length === 0) {
        previewContainer.innerHTML = '';
        return;
    }
    
    const html = currentTags.map((tag, index) => `
        <span class="tag">
            ${tag}
            <span class="remove-tag" onclick="removeTag(${index})">×</span>
        </span>
    `).join('');
    
    previewContainer.innerHTML = html;
}

/**
 * 태그 제거
 * @param {number} index - 제거할 태그 인덱스
 */
function removeTag(index) {
    currentTags.splice(index, 1);
    
    // 입력 필드 업데이트
    const tagInput = document.getElementById('tags');
    if (tagInput) {
        tagInput.value = currentTags.join(', ');
    }
    
    updateTagPreview();
    markFormAsModified();
}

/* =========================================
   이벤트 리스너
   ========================================= */

/**
 * 각종 이벤트 리스너 초기화
 */
function initializeEventListeners() {
    // 임시저장 버튼
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => saveDraft());
    }
    
    // 미리보기 버튼
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', showPreview);
    }
    
    // 초기화 버튼
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }
    
    // 발행 상태 변경 시 예약 날짜 필드 표시/숨김
    const statusInputs = document.querySelectorAll('input[name="status"]');
    statusInputs.forEach(input => {
        input.addEventListener('change', handleStatusChange);
    });
    
    // 페이지 나가기 전 확인
    window.addEventListener('beforeunload', function(event) {
        if (isFormModified && !isSaving) {
            event.preventDefault();
            event.returnValue = '저장하지 않은 변경사항이 있습니다. 정말 나가시겠습니까?';
            return event.returnValue;
        }
    });
    
    console.log('✅ 이벤트 리스너가 초기화되었습니다.');
}

/**
 * 발행 상태 변경 처리
 * @param {Event} event - 변경 이벤트
 */
function handleStatusChange(event) {
    const publishDateField = document.getElementById('publishDate').parentElement;
    
    if (event.target.value === 'scheduled') {
        publishDateField.style.display = 'block';
        document.getElementById('publishDate').required = true;
    } else {
        publishDateField.style.display = 'none';
        document.getElementById('publishDate').required = false;
    }
}

/* =========================================
   자동저장 시스템
   ========================================= */

/**
 * 자동저장 시스템 초기화
 */
function initializeAutoSave() {
    // 자동저장 타이머 시작
    autoSaveTimer = setInterval(function() {
        if (isFormModified && !isSaving) {
            saveDraft(true); // true = 자동저장
        }
    }, AUTO_SAVE_INTERVAL);
    
    console.log('✅ 자동저장 시스템이 초기화되었습니다.');
}

/**
 * 폼 수정 상태 표시
 */
function markFormAsModified() {
    isFormModified = true;
}

/**
 * 폼 수정 상태 해제
 */
function markFormAsSaved() {
    isFormModified = false;
}

/* =========================================
   저장 및 발행 기능
   ========================================= */

/**
 * 임시저장
 * @param {boolean} isAuto - 자동저장 여부
 */
async function saveDraft(isAuto = false) {
    if (isSaving) return;
    
    isSaving = true;
    
    try {
        const formData = collectFormData();
        formData.status = 'draft';
        
        if (!isAuto) {
            showSavingIndicator();
        }
        
        const response = await fetch(window.saveDraftUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [window.csrfHeader]: window.csrfToken
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            markFormAsSaved();
            if (!isAuto) {
                showNotification('임시저장되었습니다. 💾', 'success');
            } else {
                console.log('📁 자동저장 완료');
            }
        } else {
            throw new Error('저장 실패');
        }
        
    } catch (error) {
        console.error('저장 오류:', error);
        if (!isAuto) {
            showNotification('저장 중 오류가 발생했습니다.', 'error');
        }
    } finally {
        isSaving = false;
        hideSavingIndicator();
    }
}

/**
 * 폼 제출
 * @param {string} action - 제출 액션 (draft|publish)
 */
async function submitForm(action) {
    if (isSaving) return;
    
    isSaving = true;
    showSavingIndicator();
    
    try {
        const formData = collectFormData();
        formData.action = action;
        
        // 발행 시 추가 확인
        if (action === 'publish') {
            const confirmed = confirm('공지사항을 발행하시겠습니까?\n발행 후에는 모든 사용자에게 표시됩니다.');
            if (!confirmed) {
                isSaving = false;
                hideSavingIndicator();
                return;
            }
        }
        
        const response = await fetch(window.noticeWriteForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                [window.csrfHeader]: window.csrfToken
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            markFormAsSaved();
            
            if (action === 'publish') {
                showNotification('공지사항이 발행되었습니다! 📢', 'success');
                setTimeout(() => {
                    window.location.href = '/admin/notices';
                }, 2000);
            } else {
                showNotification('임시저장되었습니다. 💾', 'success');
            }
        } else {
            throw new Error('저장 실패');
        }
        
    } catch (error) {
        console.error('제출 오류:', error);
        showNotification('저장 중 오류가 발생했습니다.', 'error');
    } finally {
        isSaving = false;
        hideSavingIndicator();
    }
}

/**
 * 폼 데이터 수집
 * @returns {Object} 수집된 폼 데이터
 */
function collectFormData() {
    const form = document.getElementById('noticeWriteForm');
    const formData = new FormData(form);
    
    // 기본 데이터
    const data = {
        title: formData.get('title'),
        category: formData.get('category'),
        content: quillEditor.root.innerHTML,
        priority: formData.get('priority'),
        status: formData.get('status'),
        tags: currentTags,
        sendEmail: formData.has('sendEmail'),
        sendPush: formData.has('sendPush'),
        pinTop: formData.has('pinTop')
    };
    
    // 예약 발행 날짜
    if (data.status === 'scheduled') {
        data.publishDate = formData.get('publishDate');
    }
    
    // 첨부파일
    if (uploadedFiles.length > 0) {
        data.attachments = uploadedFiles.map(f => ({
            name: f.name,
            size: f.file.size,
            type: f.type
        }));
    }
    
    return data;
}

/* =========================================
   미리보기 기능
   ========================================= */

/**
 * 미리보기 표시
 */
function showPreview() {
    if (!validateForm()) return;
    
    const data = collectFormData();
    
    // 미리보기 HTML 생성
    const previewHtml = generatePreviewHtml(data);
    
    // 모달에 표시
    const previewContainer = document.getElementById('previewContainer');
    const previewModal = document.getElementById('previewModal');
    
    if (previewContainer && previewModal) {
        previewContainer.innerHTML = previewHtml;
        previewModal.style.display = 'flex';
    }
}

/**
 * 미리보기 HTML 생성
 * @param {Object} data - 폼 데이터
 * @returns {string} 미리보기 HTML
 */
function generatePreviewHtml(data) {
    const now = new Date().toLocaleDateString('ko-KR');
    const priorityBadge = data.priority === 'urgent' ? '<div class="important-badge-large">긴급</div>' :
                         data.priority === 'important' ? '<div class="important-badge-large">중요</div>' : '';
    
    return `
        <article class="notice-article">
            <header class="notice-article-header">
                ${priorityBadge}
                <h1 class="preview-title">${data.title}</h1>
                <div class="preview-meta">
                    <span>작성자: ${window.user?.nickname || '관리자'}</span>
                    <span>작성일: ${now}</span>
                    <span>카테고리: ${getCategoryName(data.category)}</span>
                </div>
                <div class="preview-tags">
                    ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </header>
            <div class="preview-content">
                ${data.content}
            </div>
        </article>
    `;
}

/**
 * 카테고리 이름 반환
 * @param {string} category - 카테고리 값
 * @returns {string} 카테고리 이름
 */
function getCategoryName(category) {
    const categoryNames = {
        'important': '중요 공지',
        'service': '서비스',
        'maintenance': '점검',
        'event': '이벤트',
        'update': '업데이트',
        'general': '일반'
    };
    return categoryNames[category] || category;
}

/**
 * 미리보기 닫기
 */
function closePreview() {
    const previewModal = document.getElementById('previewModal');
    if (previewModal) {
        previewModal.style.display = 'none';
    }
}

/**
 * 미리보기에서 바로 발행
 */
function publishFromPreview() {
    closePreview();
    submitForm('publish');
}

/* =========================================
   기타 유틸리티 함수
   ========================================= */

/**
 * 폼 초기화
 */
function resetForm() {
    const confirmed = confirm('작성 중인 내용이 모두 삭제됩니다. 계속하시겠습니까?');
    if (!confirmed) return;
    
    // 폼 리셋
    document.getElementById('noticeWriteForm').reset();
    
    // 에디터 초기화
    quillEditor.setContents([]);
    
    // 파일 목록 초기화
    uploadedFiles = [];
    updateAttachmentList();
    
    // 태그 초기화
    currentTags = [];
    updateTagPreview();
    
    // 상태 초기화
    markFormAsSaved();
    
    showNotification('폼이 초기화되었습니다.', 'info');
}

/**
 * 기존 공지사항 데이터 복원
 * @param {Object} noticeData - 공지사항 데이터
 */
function restoreNoticeData(noticeData) {
    // 기본 필드 복원
    if (noticeData.title) document.getElementById('title').value = noticeData.title;
    if (noticeData.category) document.getElementById('category').value = noticeData.category;
    if (noticeData.content && quillEditor) quillEditor.root.innerHTML = noticeData.content;
    
    // 우선순위 복원
    if (noticeData.priority) {
        const priorityInput = document.querySelector(`input[name="priority"][value="${noticeData.priority}"]`);
        if (priorityInput) priorityInput.checked = true;
    }
    
    // 태그 복원
    if (noticeData.tags) {
        currentTags = noticeData.tags;
        document.getElementById('tags').value = currentTags.join(', ');
        updateTagPreview();
    }
    
    console.log('📄 기존 데이터가 복원되었습니다.');
}

/**
 * 저장 중 표시
 */
function showSavingIndicator() {
    const form = document.getElementById('noticeWriteForm');
    if (form) {
        form.classList.add('saving');
    }
}

/**
 * 저장 중 표시 숨김
 */
function hideSavingIndicator() {
    const form = document.getElementById('noticeWriteForm');
    if (form) {
        form.classList.remove('saving');
    }
}

/**
 * 알림 메시지 표시
 * @param {string} message - 알림 메시지
 * @param {string} type - 알림 타입 (success|error|warning|info)
 */
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 표시 애니메이션
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 자동 숨김
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* =========================================
   전역 함수 등록
   ========================================= */

// HTML에서 호출할 수 있도록 전역 함수로 등록
window.removeFile = removeFile;
window.removeTag = removeTag;
window.showPreview = showPreview;
window.closePreview = closePreview;
window.publishFromPreview = publishFromPreview;
window.saveDraft = saveDraft;
window.resetForm = resetForm;

/* =========================================
   페이지 언로드 시 정리
   ========================================= */

/**
 * 페이지 언로드 시 자동저장 타이머 정리
 */
window.addEventListener('beforeunload', function() {
    if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
    }
});

console.log('📝 공지사항 작성 페이지 JavaScript가 완전히 로드되었습니다.');