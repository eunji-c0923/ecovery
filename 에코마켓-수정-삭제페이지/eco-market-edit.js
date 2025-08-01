// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    // 전역 변수 선언
    let uploadedImages = []; // 업로드된 이미지 파일들을 저장할 배열
    let uploadedFile = null; // 업로드된 정보 파일
    let hasChanges = false; // 변경사항 체크용
    
    // DOM 요소들 가져오기
    const editForm = document.getElementById('editForm');
    const fileBtn = document.querySelector('.file-btn');
    const uploadBtn = document.querySelector('.upload-btn');
    const fileInput = document.getElementById('fileInput');
    const imageInput = document.getElementById('imageInput');
    const fileInfo = document.getElementById('fileInfo');
    const imageSlots = document.querySelectorAll('.image-slot');
    const deleteBtn = document.getElementById('deleteBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    // 초기화 함수 - 페이지 로드 시 기존 데이터 설정
    function initializeForm() {
        console.log('📋 폼 초기화 시작');
        
        // 기존 이미지들 로드 (서버에서 전달받은 데이터)
        if (window.itemData && window.itemData.images) {
            loadExistingImages(window.itemData.images);
        }
        
        updateImageSlots();
        setupFormChangeDetection();
        setupPriceFormatting();
        showNotification('에코마켓 수정 페이지가 로드되었습니다.', 'info');
    }
    
    // 기존 이미지 로드 함수
    function loadExistingImages(images) {
        images.forEach((imageUrl, index) => {
            if (index < 5) { // 최대 5개까지만
                // 서버 이미지를 로컬 배열에 저장 (실제로는 URL 형태)
                uploadedImages[index] = {
                    type: 'existing',
                    url: imageUrl,
                    name: `기존이미지_${index + 1}.jpg`
                };
            }
        });
    }
    
    // 폼 변경사항 감지 설정
    function setupFormChangeDetection() {
        const formElements = editForm.querySelectorAll('input, select, textarea');
        
        formElements.forEach(element => {
            element.addEventListener('change', () => {
                hasChanges = true;
            });
            
            if (element.type === 'text' || element.type === 'number' || element.tagName === 'TEXTAREA') {
                element.addEventListener('input', () => {
                    hasChanges = true;
                });
            }
        });
    }
    
    // 가격 포맷팅 설정
    function setupPriceFormatting() {
        const priceInput = document.getElementById('price');
        
        if (priceInput) {
            priceInput.addEventListener('input', function() {
                // 숫자만 입력되도록 처리
                let value = this.value.replace(/[^0-9]/g, '');
                
                // 최대값 체크
                if (parseInt(value) > 999999999) {
                    value = '999999999';
                    showNotification('가격은 999,999,999원을 초과할 수 없습니다.', 'error');
                }
                
                this.value = value;
            });
            
            // 가격 표시용 포맷팅 (선택사항)
            priceInput.addEventListener('blur', function() {
                if (this.value) {
                    const price = parseInt(this.value);
                    if (!isNaN(price)) {
                        // 여기서 천단위 콤마 등의 포맷팅을 적용할 수 있음
                        console.log(`가격 설정: ${price.toLocaleString()}원`);
                    }
                }
            });
        }
    }
    
    // 파일 업로드 버튼 이벤트 처리
    fileBtn.addEventListener('click', function() {
        fileInput.click(); // 숨겨진 파일 input 클릭
    });
    
    uploadBtn.addEventListener('click', function() {
        fileInput.click(); // 동일한 파일 input 사용
    });
    
    // 파일 선택 이벤트 처리
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        
        if (file) {
            // 파일 크기 체크 (예: 10MB 제한)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('파일 크기는 10MB 이하로 업로드 해주세요.', 'error');
                return;
            }
            
            // 허용된 파일 형식 체크
            const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedTypes.includes(fileExtension)) {
                showNotification('PDF, DOC, DOCX, TXT 파일만 업로드 가능합니다.', 'error');
                return;
            }
            
            uploadedFile = file;
            fileInfo.textContent = `📎 선택된 파일: ${file.name}`;
            fileInfo.style.color = 'var(--primary-green)';
            hasChanges = true;
            console.log('📁 파일 업로드 완료:', file.name);
        } else {
            uploadedFile = null;
            fileInfo.textContent = '선택된 파일이 없습니다';
            fileInfo.style.color = 'var(--medium-gray)';
        }
    });
    
    // 이미지 슬롯 클릭 이벤트 처리
    imageSlots.forEach((slot, index) => {
        slot.addEventListener('click', function(e) {
            // 삭제 버튼을 클릭한 경우는 제외
            if (e.target.classList.contains('remove-btn')) {
                return;
            }
            
            // 이미지 input의 multiple 속성을 임시로 제거하고 단일 선택으로 변경
            imageInput.multiple = false;
            imageInput.dataset.slotIndex = index; // 어떤 슬롯인지 저장
            imageInput.click();
        });
        
        // 이미지 삭제 버튼 이벤트
        const removeBtn = slot.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // 슬롯 클릭 이벤트 방지
            removeImage(index);
        });
    });
    
    // 이미지 선택 이벤트 처리
    imageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        const slotIndex = parseInt(imageInput.dataset.slotIndex);
        
        if (files.length > 0) {
            const file = files[0];
            
            // 이미지 파일 형식 체크
            if (!file.type.startsWith('image/')) {
                showNotification('이미지 파일만 업로드 가능합니다.', 'error');
                return;
            }
            
            // 파일 크기 체크 (예: 5MB 제한)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('이미지 파일 크기는 5MB 이하로 업로드 해주세요.', 'error');
                return;
            }
            
            // 해당 슬롯에 이미지 추가
            uploadedImages[slotIndex] = {
                type: 'new',
                file: file,
                name: file.name
            };
            updateImageSlots();
            hasChanges = true;
            showNotification(`이미지가 슬롯 ${slotIndex + 1}에 추가되었습니다.`, 'success');
            console.log(`🖼️ 이미지 업로드 완료 (슬롯 ${slotIndex}):`, file.name);
        }
        
        // input 초기화
        imageInput.value = '';
        imageInput.multiple = true; // 다시 multiple로 설정
    });
    
    // 이미지 삭제 함수
    function removeImage(index) {
        if (uploadedImages[index]) {
            const fileName = uploadedImages[index].name;
            uploadedImages[index] = null;
            updateImageSlots();
            hasChanges = true;
            showNotification(`이미지가 삭제되었습니다: ${fileName}`, 'info');
            console.log(`🗑️ 이미지 삭제 완료 (슬롯 ${index}):`, fileName);
        }
    }
    
    // 이미지 슬롯 업데이트 함수
    function updateImageSlots() {
        imageSlots.forEach((slot, index) => {
            const img = slot.querySelector('img');
            const placeholder = slot.querySelector('.upload-placeholder');
            const removeBtn = slot.querySelector('.remove-btn');
            
            if (uploadedImages[index]) {
                const imageData = uploadedImages[index];
                
                if (!img) {
                    const newImg = document.createElement('img');
                    slot.appendChild(newImg);
                }
                
                const imageElement = slot.querySelector('img');
                
                if (imageData.type === 'existing') {
                    // 기존 서버 이미지
                    imageElement.src = imageData.url;
                } else if (imageData.type === 'new') {
                    // 새로 업로드한 이미지
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        imageElement.src = e.target.result;
                    };
                    reader.readAsDataURL(imageData.file);
                }
                
                slot.classList.add('has-image');
                placeholder.style.display = 'none';
            } else {
                // 이미지가 없는 경우
                if (img) {
                    img.remove();
                }
                slot.classList.remove('has-image');
                placeholder.style.display = 'flex';
            }
        });
    }
    
    // 폼 유효성 검사 함수
    function validateForm() {
        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const category = document.getElementById('category').value;
        const condition = document.getElementById('condition').value;
        const status = document.getElementById('status').value;
        const price = document.getElementById('price').value.trim();
        
        if (!title) {
            showNotification('제목을 입력해주세요.', 'error');
            document.getElementById('title').focus();
            return false;
        }
        
        if (title.length < 2) {
            showNotification('제목은 2자 이상 입력해주세요.', 'error');
            document.getElementById('title').focus();
            return false;
        }
        
        if (title.length > 100) {
            showNotification('제목은 100자 이하로 입력해주세요.', 'error');
            document.getElementById('title').focus();
            return false;
        }
        
        if (!category) {
            showNotification('카테고리를 선택해주세요.', 'error');
            document.getElementById('category').focus();
            return false;
        }
        
        if (!condition) {
            showNotification('상품 상태를 선택해주세요.', 'error');
            document.getElementById('condition').focus();
            return false;
        }
        
        if (!status) {
            showNotification('판매 상태를 선택해주세요.', 'error');
            document.getElementById('status').focus();
            return false;
        }
        
        if (!price) {
            showNotification('가격을 입력해주세요.', 'error');
            document.getElementById('price').focus();
            return false;
        }
        
        const priceNum = parseInt(price);
        if (isNaN(priceNum) || priceNum < 0) {
            showNotification('올바른 가격을 입력해주세요.', 'error');
            document.getElementById('price').focus();
            return false;
        }
        
        if (priceNum > 999999999) {
            showNotification('가격은 999,999,999원을 초과할 수 없습니다.', 'error');
            document.getElementById('price').focus();
            return false;
        }
        
        if (!description) {
            showNotification('상세설명을 입력해주세요.', 'error');
            document.getElementById('description').focus();
            return false;
        }
        
        if (description.length < 10) {
            showNotification('상세설명은 10자 이상 입력해주세요.', 'error');
            document.getElementById('description').focus();
            return false;
        }
        
        return true;
    }
    
    // 폼 제출 이벤트 처리 (수정완료)
    editForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 기본 제출 동작 방지
        
        if (!validateForm()) {
            return;
        }
        
        // 확인 메시지
        showConfirmModal(
            '게시물 수정',
            '게시물을 수정하시겠습니까?',
            function() {
                submitForm();
            }
        );
    });
    
    // 실제 폼 제출 함수
    function submitForm() {
        // 로딩 시작
        const submitBtn = editForm.querySelector('.btn-update');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '수정 중...';
        submitBtn.disabled = true;
        
        // 폼 데이터 수집
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('author', document.getElementById('author').value);
        formData.append('condition', document.getElementById('condition').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('status', document.getElementById('status').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('region1', document.getElementById('region1').value);
        formData.append('region2', document.getElementById('region2').value);
        formData.append('description', document.getElementById('description').value);
        
        // 파일 추가
        if (uploadedFile) {
            formData.append('infoFile', uploadedFile);
        }
        
        // 이미지 파일들 추가
        uploadedImages.forEach((image, index) => {
            if (image && image.type === 'new') {
                formData.append(`image_${index}`, image.file);
            } else if (image && image.type === 'existing') {
                formData.append(`existing_image_${index}`, image.url);
            }
        });
        
        // 서버로 전송 (실제 API 호출)
        console.log('📤 수정 데이터 전송 시작...');
        
        // fetch를 사용한 실제 API 호출
        fetch(editForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('게시물이 성공적으로 수정되었습니다! 🎉', 'success');
                hasChanges = false;
                
                // 2초 후 상세 페이지로 이동
                setTimeout(() => {
                    window.location.href = `/eco-market/detail/${window.itemData.id}`;
                }, 2000);
            } else {
                throw new Error(data.message || '수정 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('❌ 수정 오류:', error);
            showNotification(error.message || '수정 중 오류가 발생했습니다.', 'error');
        })
        .finally(() => {
            // 로딩 종료
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }
    
    // 삭제 버튼 이벤트 처리
    deleteBtn.addEventListener('click', function() {
        showConfirmModal(
            '게시물 삭제',
            '정말로 이 게시물을 삭제하시겠습니까?<br><span class="warning-text">⚠️ 삭제된 게시물은 복구할 수 없습니다.</span>',
            function() {
                deletePost();
            },
            'danger'
        );
    });
    
    // 게시물 삭제 함수
    function deletePost() {
        console.log('🗑️ 게시물 삭제 시작...');
        
        // 로딩 상태 표시
        deleteBtn.disabled = true;
        deleteBtn.textContent = '삭제 중...';
        
        // 삭제 API 호출
        fetch(`/eco-market/delete/${window.itemData.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('게시물이 삭제되었습니다.', 'success');
                hasChanges = false;
                
                // 1.5초 후 목록 페이지로 이동
                setTimeout(() => {
                    window.location.href = '/eco-market';
                }, 1500);
            } else {
                throw new Error(data.message || '삭제 중 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('❌ 삭제 오류:', error);
            showNotification(error.message || '삭제 중 오류가 발생했습니다.', 'error');
            deleteBtn.disabled = false;
            deleteBtn.textContent = '삭제';
        });
    }
    
    // 취소 버튼 이벤트 처리
    cancelBtn.addEventListener('click', function() {
        if (hasChanges) {
            showConfirmModal(
                '변경사항 확인',
                '변경사항이 저장되지 않았습니다.<br>정말로 나가시겠습니까?',
                function() {
                    goBack();
                }
            );
        } else {
            goBack();
        }
    });
    
    // 이전 페이지로 이동
    function goBack() {
        if (document.referrer && document.referrer.includes('/eco-market/detail/')) {
            window.history.back();
        } else {
            window.location.href = '/eco-market';
        }
    }
    
    // 확인 모달 표시 함수
    function showConfirmModal(title, message, onConfirm, type = 'default') {
        // 기존 모달이 있으면 제거
        const existingModal = document.querySelector('.modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 모달 생성
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    <div class="modal-buttons">
                        <button class="modal-btn modal-btn-confirm ${type === 'danger' ? 'danger' : ''}">
                            ${type === 'danger' ? '삭제' : '확인'}
                        </button>
                        <button class="modal-btn modal-btn-cancel">취소</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // 모달 버튼 이벤트
        const confirmBtn = modal.querySelector('.modal-btn-confirm');
        const cancelBtn = modal.querySelector('.modal-btn-cancel');
        
        confirmBtn.addEventListener('click', function() {
            closeModal(modal);
            onConfirm();
        });
        
        cancelBtn.addEventListener('click', function() {
            closeModal(modal);
        });
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        // ESC 키로 닫기
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    // 모달 닫기
    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    // 지역 선택 연동 기능
    const region1Select = document.getElementById('region1');
    const region2Select = document.getElementById('region2');
    
    region1Select.addEventListener('change', function() {
        const selectedRegion1 = this.value;
        updateRegion2Options(selectedRegion1);
    });
    
    // 하위 지역 옵션 업데이트 함수
    function updateRegion2Options(region1) {
        // 실제로는 서버에서 데이터를 받아와야 함
        const regionData = {
            '00구': ['00동', '01동', '02동', '03동'],
            '01구': ['10동', '11동', '12동', '13동'],
            '02구': ['20동', '21동', '22동', '23동']
        };
        
        // 기존 옵션 제거
        region2Select.innerHTML = '';
        
        // 새 옵션 추가
        if (regionData[region1]) {
            regionData[region1].forEach(dong => {
                const option = document.createElement('option');
                option.value = dong;
                option.textContent = dong;
                region2Select.appendChild(option);
            });
        }
        
        hasChanges = true;
    }
    
    // 실시간 글자 수 카운터
    const titleInput = document.getElementById('title');
    const descriptionTextarea = document.getElementById('description');
    
    // 제목 글자 수 카운터 추가
    if (titleInput && !document.querySelector('.char-count')) {
        const charCount = document.createElement('span');
        charCount.className = 'char-count';
        charCount.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            color: var(--medium-gray);
            pointer-events: none;
        `;
        titleInput.parentElement.style.position = 'relative';
        titleInput.parentElement.appendChild(charCount);
        
        titleInput.addEventListener('input', function() {
            const length = this.value.length;
            charCount.textContent = `${length}/100`;
            charCount.style.color = length > 90 ? '#dc3545' : 'var(--medium-gray)';
        });
        
        // 초기 카운트 설정
        titleInput.dispatchEvent(new Event('input'));
    }
    
    // 페이지 벗어나기 전 경고
    window.addEventListener('beforeunload', function(e) {
        if (hasChanges) {
            e.preventDefault();
            e.returnValue = '변경사항이 저장되지 않았습니다. 정말로 나가시겠습니까?';
        }
    });
    
    // 알림 토스트 함수
    function showNotification(message, type = 'success') {
        // 기존 토스트 제거
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 새 토스트 생성
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 애니메이션
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 자동 제거
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
    
    // 키보드 단축키
    document.addEventListener('keydown', function(e) {
        // Ctrl+S 또는 Cmd+S로 저장
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (hasChanges) {
                editForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Ctrl+Z 또는 Cmd+Z로 되돌리기 (간단한 구현)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            // 실제로는 더 복잡한 undo/redo 시스템이 필요
            console.log('⏪ 되돌리기 기능 (미구현)');
        }
    });
    
    // 디바운스 함수
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
    
    // 자동 저장 기능 (선택사항)
    const autoSave = debounce(function() {
        if (hasChanges) {
            const formData = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                condition: document.getElementById('condition').value,
                status: document.getElementById('status').value,
                price: document.getElementById('price').value
            };
            
            // 로컬 스토리지에 임시 저장
            localStorage.setItem(`ecomarket_draft_${window.itemData.id}`, JSON.stringify(formData));
            console.log('💾 자동 저장 완료');
        }
    }, 3000);
    
    // 폼 입력 시 자동 저장 트리거
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', autoSave);
        element.addEventListener('change', autoSave);
    });
    
    // 임시 저장된 데이터 복구
    function restoreDraft() {
        const draftKey = `ecomarket_draft_${window.itemData.id}`;
        const savedDraft = localStorage.getItem(draftKey);
        
        if (savedDraft) {
            try {
                const draftData = JSON.parse(savedDraft);
                
                showConfirmModal(
                    '임시 저장 데이터 발견',
                    '이전에 작성하던 내용이 있습니다.<br>복구하시겠습니까?',
                    function() {
                        // 임시 저장 데이터 복구
                        Object.keys(draftData).forEach(key => {
                            const element = document.getElementById(key);
                            if (element && draftData[key]) {
                                element.value = draftData[key];
                            }
                        });
                        hasChanges = true;
                        showNotification('임시 저장된 데이터를 복구했습니다.', 'info');
                        localStorage.removeItem(draftKey);
                    },
                    'default'
                );
            } catch (error) {
                console.error('임시 저장 데이터 복구 오류:', error);
                localStorage.removeItem(draftKey);
            }
        }
    }
    
    // 초기화 함수 실행
    initializeForm();
    
    // 1초 후 임시 저장 데이터 확인
    setTimeout(restoreDraft, 1000);
    
    console.log('✅ 에코마켓 수정/삭제 페이지 JavaScript 로드 완료');
});