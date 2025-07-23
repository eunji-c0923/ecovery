// =========================
// 전역 변수 (페이지 전체에서 사용)
// =========================

// 지역 데이터 (시/도를 선택하면 구/군이 나타남)
const regionData = {
    '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구'],
    '부산': ['강서구', '금정구', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구'],
    '대구': ['남구', '달서구', '동구', '북구', '서구', '수성구', '중구', '달성군'],
    '인천': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구'],
    '경기': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시']
};

// 업로드된 이미지들을 저장할 배열
let uploadedImages = [];

// =========================
// 페이지가 로드되면 실행되는 함수
// =========================
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지가 로드되었습니다!');
    
    // 현재 날짜를 등록일에 자동으로 입력
    setCurrentDate();
    
    // 각종 이벤트 리스너 등록
    setupEventListeners();
    
    // 페이드인 애니메이션 적용
    setTimeout(function() {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.classList.add('fade-in');
        }
    }, 200);
});

// =========================
// 현재 날짜 설정 함수
// =========================
function setCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const dateString = `${year}.${month}.${day}`;
    
    const regDateInput = document.getElementById('regDate');
    if (regDateInput) {
        regDateInput.value = dateString;
    }
}

// =========================
// 이벤트 리스너 설정 함수
// =========================
function setupEventListeners() {
    // 시/도 선택이 바뀔 때
    const region1Select = document.getElementById('region1');
    if (region1Select) {
        region1Select.addEventListener('change', handleRegion1Change);
    }
    
    // 이미지 업로드 관련
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    
    if (imageUploadArea && imageInput) {
        // 업로드 영역 클릭시
        imageUploadArea.addEventListener('click', function() {
            imageInput.click();
        });
        
        // 파일이 선택되었을 때
        imageInput.addEventListener('change', handleImageSelect);
        
        // 드래그 앤 드롭 관련
        setupDragAndDrop(imageUploadArea);
    }
    
    // 폼 제출 이벤트
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // 실시간 유효성 검사
    setupRealtimeValidation();
    
    // 카테고리 변경시 도움말 표시
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
    }
    
    // 상품 상태 변경시 미리보기 표시
    const conditionSelect = document.getElementById('condition');
    if (conditionSelect) {
        conditionSelect.addEventListener('change', handleConditionChange);
    }
    
    // 제목 글자수 제한
    const titleInput = document.getElementById('title');
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            limitCharacters(this, 50, '제목');
        });
    }
    
    // 설명 글자수 제한 및 카운터
    const descriptionInput = document.getElementById('description');
    if (descriptionInput) {
        descriptionInput.addEventListener('input', function() {
            limitCharacters(this, 1000, '설명');
            updateCharacterCounter(this, 1000);
        });
    }
}

// =========================
// 지역 선택 관련 함수
// =========================

// 시/도가 변경되었을 때 실행
function handleRegion1Change() {
    const region1Select = document.getElementById('region1');
    const region2Select = document.getElementById('region2');
    
    if (!region1Select || !region2Select) return;
    
    const selectedRegion = region1Select.value;
    
    // 구/군 선택박스 초기화
    region2Select.innerHTML = '<option value="">구/군</option>';
    
    // 선택된 시/도에 해당하는 구/군 추가
    if (selectedRegion && regionData[selectedRegion]) {
        regionData[selectedRegion].forEach(function(district) {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            region2Select.appendChild(option);
        });
    }
}

// =========================
// 이미지 업로드 관련 함수
// =========================

// 파일이 선택되었을 때
function handleImageSelect(event) {
    const files = event.target.files;
    handleImageFiles(Array.from(files));
}

// 드래그 앤 드롭 설정
function setupDragAndDrop(uploadArea) {
    // 드래그 오버
    uploadArea.addEventListener('dragover', function(event) {
        event.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-green)';
        uploadArea.style.background = 'rgba(45, 90, 61, 0.1)';
    });
    
    // 드래그 나감
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.style.borderColor = 'var(--accent-green)';
        uploadArea.style.background = 'rgba(111, 167, 118, 0.05)';
    });
    
    // 드롭
    uploadArea.addEventListener('drop', function(event) {
        event.preventDefault();
        
        // 스타일 원복
        uploadArea.style.borderColor = 'var(--accent-green)';
        uploadArea.style.background = 'rgba(111, 167, 118, 0.05)';
        
        const files = event.dataTransfer.files;
        handleImageFiles(Array.from(files));
    });
}

// 이미지 파일들 처리
function handleImageFiles(files) {
    // 이미지 파일만 필터링
    const imageFiles = files.filter(function(file) {
        return file.type.startsWith('image/');
    });
    
    // 최대 5개까지만 허용
    if (uploadedImages.length + imageFiles.length > 5) {
        showNotification('최대 5개의 이미지만 업로드할 수 있습니다.', 'error');
        return;
    }
    
    // 각 이미지 파일 처리
    imageFiles.forEach(function(file) {
        // 파일 크기 체크 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showNotification(file.name + '은 10MB를 초과합니다.', 'error');
            return;
        }
        
        // 파일을 읽어서 미리보기 생성
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = {
                file: file,
                src: event.target.result,
                id: Date.now() + Math.random()
            };
            
            uploadedImages.push(imageData);
            displayImagePreview(imageData);
        };
        reader.readAsDataURL(file);
    });
}

// 이미지 미리보기 표시
function displayImagePreview(imageData) {
    const previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) return;
    
    // 미리보기 아이템 생성
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
        <img src="${imageData.src}" alt="미리보기" class="preview-image">
        <button type="button" class="remove-image" onclick="removeImage('${imageData.id}')">×</button>
    `;
    
    previewContainer.appendChild(previewItem);
}

// 이미지 삭제
function removeImage(imageId) {
    // 배열에서 해당 이미지 제거
    uploadedImages = uploadedImages.filter(function(img) {
        return img.id != imageId;
    });
    
    // 미리보기 다시 그리기
    updateImagePreview();
}

// 이미지 미리보기 업데이트
function updateImagePreview() {
    const previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) return;
    
    // 기존 미리보기 모두 제거
    previewContainer.innerHTML = '';
    
    // 현재 업로드된 이미지들로 다시 생성
    uploadedImages.forEach(function(imageData) {
        displayImagePreview(imageData);
    });
}

// =========================
// 폼 유효성 검사 함수
// =========================

// 실시간 유효성 검사 설정
function setupRealtimeValidation() {
    const inputs = document.querySelectorAll('.form-input, .form-select');
    
    inputs.forEach(function(input) {
        // 포커스를 잃었을 때
        input.addEventListener('blur', function() {
            validateField(input);
        });
        
        // 내용이 변경될 때
        input.addEventListener('input', function() {
            if (input.classList.contains('error') && input.value.trim()) {
                clearFieldError(input);
                input.classList.add('success');
            }
        });
    });
}

// 개별 필드 유효성 검사
function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    if (isRequired && !value) {
        showFieldError(field, '필수 입력 항목입니다.');
        return false;
    } else if (value) {
        clearFieldError(field);
        field.classList.add('success');
        return true;
    }
    
    return true;
}

// 필드 에러 표시
function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    
    // 기존 에러 메시지 제거
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 새 에러 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// 필드 에러 제거
function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// 전체 폼 유효성 검사
function validateForm() {
    let isValid = true;
    const requiredFields = ['title', 'condition', 'region1', 'region2', 'category', 'description'];
    
    requiredFields.forEach(function(fieldId) {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// =========================
// 폼 제출 관련 함수
// =========================

// 폼 제출 처리
function handleFormSubmit(event) {
    event.preventDefault();
    
    console.log('폼 제출 시도');
    
    // 유효성 검사
    if (!validateForm()) {
        showNotification('필수 입력 항목을 모두 작성해주세요.', 'error');
        return;
    }
    
    // 제출 버튼 상태 변경
    const submitBtn = document.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '등록 중...';
    submitBtn.disabled = true;
    
    // FormData 객체 생성
    const formData = new FormData();
    
    // 폼 필드 데이터 추가
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('condition', document.getElementById('condition').value);
    formData.append('region1', document.getElementById('region1').value);
    formData.append('region2', document.getElementById('region2').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('description', document.getElementById('description').value);
    
    // 이미지 파일들 추가
    uploadedImages.forEach(function(imageData, index) {
        formData.append(`images[${index}]`, imageData.file);
    });
    
    // 서버에 전송
    fetch('/api/free-sharing/posts', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('나눔 등록이 완료되었습니다! 🎉', 'success');
            
            // 임시 저장 데이터 삭제
            clearDraft();
            
            // 2초 후 이동 확인
            setTimeout(function() {
                if (confirm('나눔 목록 페이지로 이동하시겠습니까?')) {
                    window.location.href = '/free-sharing/list';
                }
            }, 2000);
        } else {
            showNotification(data.message || '등록 중 오류가 발생했습니다.', 'error');
        }
    })
    .catch(error => {
        console.error('등록 오류:', error);
        showNotification('등록 중 오류가 발생했습니다.', 'error');
    })
    .finally(() => {
        // 버튼 상태 복원
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// =========================
// 상품 상태 관련 함수
// =========================

// 상품 상태 변경시 미리보기 표시
function handleConditionChange() {
    const conditionSelect = document.getElementById('condition');
    const conditionPreview = document.getElementById('conditionPreview');
    
    if (!conditionSelect || !conditionPreview) return;
    
    const selectedCondition = conditionSelect.value;
    
    // 미리보기 초기화
    conditionPreview.className = 'condition-preview';
    conditionPreview.style.display = 'none';
    
    if (selectedCondition) {
        let previewText = '';
        let previewClass = '';
        
        switch(selectedCondition) {
            case '상':
                previewText = '👍 상태가 매우 좋은 상품입니다';
                previewClass = 'good';
                break;
            case '중':
                previewText = '👌 일반적인 사용감이 있는 상품입니다';
                previewClass = 'fair';
                break;
            case '하':
                previewText = '⚠️ 사용감이 많이 있는 상품입니다';
                previewClass = 'poor';
                break;
        }
        
        // 미리보기 표시
        conditionPreview.textContent = previewText;
        conditionPreview.classList.add(previewClass);
        conditionPreview.style.display = 'block';
        
        // 애니메이션 효과
        setTimeout(function() {
            conditionPreview.style.opacity = '1';
            conditionPreview.style.transform = 'translateY(0)';
        }, 100);
    }
}

// 카테고리 변경시 도움말 표시
function handleCategoryChange() {
    const categorySelect = document.getElementById('category');
    const descriptionInput = document.getElementById('description');
    
    if (!categorySelect || !descriptionInput) return;
    
    const category = categorySelect.value;
    
    // 카테고리별 도움말
    const helpTexts = {
        '가구': '가구는 크기와 무게를 미리 안내해주세요.',
        '전자제품': '정상 작동 여부와 구매 시기를 명시해주세요.',
        '의류': '사이즈와 계절 정보를 포함해주세요.',
        '도서': '전집인지 단행본인지, 출간년도를 알려주세요.',
        '육아용품': '사용 기간과 안전성을 중점적으로 설명해주세요.'
    };
    
    // 설명란이 비어있을 때만 도움말 추가
    if (helpTexts[category] && !descriptionInput.value) {
        const helpText = helpTexts[category];
        descriptionInput.placeholder = `물품에 대한 자세한 설명을 적어주세요\n\n💡 ${helpText}\n\n예시:\n- 사용 기간\n- 구매 시기\n- 특이사항 등`;
    }
}

// =========================
// 글자수 제한 관련 함수
// =========================

// 글자수 제한
function limitCharacters(input, maxLength, fieldName) {
    if (input.value.length > maxLength) {
        input.value = input.value.substring(0, maxLength);
        showNotification(`${fieldName}은 ${maxLength}자까지 입력 가능합니다.`, 'error');
    }
}

// 글자수 카운터 업데이트
function updateCharacterCounter(input, maxLength) {
    const currentLength = input.value.length;
    
    // 기존 카운터 찾기 또는 생성
    let counter = input.parentNode.querySelector('.char-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = 'font-size: 12px; color: var(--medium-gray); text-align: right; margin-top: 5px;';
        input.parentNode.appendChild(counter);
    }
    
    // 카운터 텍스트 업데이트
    counter.textContent = `${Math.min(currentLength, maxLength)}/${maxLength}`;
    
    // 글자수가 많아지면 색상 변경
    if (currentLength > maxLength * 0.9) {
        counter.style.color = 'var(--error-red)';
    } else {
        counter.style.color = 'var(--medium-gray)';
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

// 뒤로가기 함수
function goBack() {
    // 입력된 내용이 있는지 확인
    const hasContent = checkFormHasContent();
    
    if (hasContent) {
        if (confirm('입력한 내용이 사라집니다. 정말로 나가시겠습니까?')) {
            window.history.back();
        }
    } else {
        window.history.back();
    }
}

// 폼에 내용이 있는지 확인
function checkFormHasContent() {
    const inputs = document.querySelectorAll('.form-input, .form-select');
    let hasContent = false;
    
    inputs.forEach(function(input) {
        // 작성자와 등록일은 제외
        if (input.id !== 'author' && input.id !== 'regDate') {
            if (input.value.trim()) {
                hasContent = true;
            }
        }
    });
    
    // 업로드된 이미지가 있는지도 확인
    if (uploadedImages.length > 0) {
        hasContent = true;
    }
    
    return hasContent;
}

// =========================
// 자동 저장 기능
// =========================

// 자동 저장
function autoSave() {
    const formData = {
        title: document.getElementById('title').value,
        condition: document.getElementById('condition').value,
        region1: document.getElementById('region1').value,
        region2: document.getElementById('region2').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value
    };
    
    // 서버에 임시 저장
    fetch('/api/free-sharing/draft', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .catch(error => {
        console.error('자동 저장 오류:', error);
    });
}

// 저장된 임시 데이터 복원
function restoreDraft() {
    fetch('/api/free-sharing/draft')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.draft) {
                const formData = data.draft;
                
                // 각 필드에 저장된 값 복원
                if (formData.title) document.getElementById('title').value = formData.title;
                if (formData.condition) document.getElementById('condition').value = formData.condition;
                if (formData.region1) {
                    document.getElementById('region1').value = formData.region1;
                    handleRegion1Change();
                    setTimeout(function() {
                        if (formData.region2) {
                            document.getElementById('region2').value = formData.region2;
                        }
                    }, 100);
                }
                if (formData.category) {
                    document.getElementById('category').value = formData.category;
                    handleCategoryChange();
                }
                if (formData.description) document.getElementById('description').value = formData.description;
                
                console.log('임시 저장된 데이터를 복원했습니다.');
            }
        })
        .catch(error => {
            console.error('임시저장 데이터 복원 중 오류:', error);
        });
}

// 임시 저장 데이터 삭제
function clearDraft() {
    fetch('/api/free-sharing/draft', { method: 'DELETE' })
        .catch(error => {
            console.error('임시 저장 데이터 삭제 오류:', error);
        });
}

// 자동 저장 타이머 설정
function setupAutoSave() {
    const inputs = document.querySelectorAll('.form-input, .form-select');
    
    inputs.forEach(function(input) {
        input.addEventListener('input', function() {
            // 기존 타이머가 있으면 취소
            clearTimeout(input.autoSaveTimeout);
            
            // 1초 후에 자동 저장 실행
            input.autoSaveTimeout = setTimeout(autoSave, 1000);
        });
    });
}

// =========================
// 키보드 단축키
// =========================

// 키보드 이벤트 처리
document.addEventListener('keydown', function(event) {
    // Ctrl + S: 폼 저장 (제출)
    if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const form = document.getElementById('registrationForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // ESC: 취소
    if (event.key === 'Escape') {
        goBack();
    }
});

// =========================
// 페이지 이탈 경고
// =========================

// 페이지를 벗어나려 할 때 경고 메시지
window.addEventListener('beforeunload', function(event) {
    // 폼에 내용이 있을 때만 경고
    if (checkFormHasContent()) {
        event.preventDefault();
        event.returnValue = '';
        return '';
    }
});

// =========================
// 페이지 초기화 완료 후 실행
// =========================

// DOM이 완전히 로드된 후 추가 설정
document.addEventListener('DOMContentLoaded', function() {
    // 자동 저장 기능 설정
    setupAutoSave();
    
    // 임시 저장된 데이터 복원
    restoreDraft();
    
    // 폼 제출 성공시 임시 저장 데이터 삭제는 handleFormSubmit에서 처리
});

// =========================
// 전역 함수로 노출 (HTML에서 onclick 등으로 사용)
// =========================

// HTML의 onclick에서 사용할 수 있도록 전역으로 노출
window.goBack = goBack;
window.removeImage = removeImage;

// 기타 유용한 전역 함수들
window.showNotification = showNotification;
window.validateForm = validateForm;

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

console.log('🤝 무료나눔 등록 페이지 JavaScript가 로드되었습니다.');
console.log('📝 사용 가능한 기능:');
console.log('   - 지역 연동 선택');
console.log('   - 이미지 드래그 앤 드롭');
console.log('   - 실시간 유효성 검사');
console.log('   - 자동 저장/복원');
console.log('   - 키보드 단축키 (Ctrl+S, ESC)');
console.log('   - 접근성 지원');