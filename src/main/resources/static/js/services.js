/* ============================================================================
   GreenCycle 분리배출 페이지 JavaScript
   AI 분석, 등록 기능, 성공/실패 처리를 포함한 메인 스크립트
   ============================================================================ */

// ============================================================================
// AI 분석 실패 관련 함수들
// ============================================================================

/**
 * AI 분석 실패 처리 함수
 * @param {string} errorType - 에러 타입 ('blur', 'recognition', 'network', 'timeout')
 */
function handleAnalysisError(errorType = 'recognition') {
    const analysisErrorMessage = document.getElementById('analysisErrorMessage');
    const analysisErrorReason = document.getElementById('analysisErrorReason');
    
    // 에러 타입별 메시지 설정
    const errorMessages = {
        'blur': {
            message: '이미지가 너무 흐릿합니다',
            reason: '사진이 흐려서 AI가 물품을 정확히 인식할 수 없습니다. 더 선명한 사진을 촬영해주세요.'
        },
        'recognition': {
            message: 'AI가 이미지를 분석하지 못했습니다',
            reason: '이미지에서 폐기물을 명확하게 인식할 수 없습니다. 다른 각도에서 더 선명한 사진을 촬영해주세요.'
        },
        'network': {
            message: '네트워크 오류가 발생했습니다',
            reason: '서버와의 연결에 문제가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
        },
        'timeout': {
            message: '분석 시간이 초과되었습니다',
            reason: '서버가 응답하지 않습니다. 잠시 후 다시 시도해주세요.'
        }
    };
    
    const errorInfo = errorMessages[errorType] || errorMessages['recognition'];
    
    if (analysisErrorMessage) {
        analysisErrorMessage.textContent = errorInfo.message;
    }
    
    if (analysisErrorReason) {
        analysisErrorReason.textContent = errorInfo.reason;
    }
    
    // AI 분석 실패 페이지로 이동
    showStep(6);
    showNotification('AI 분석에 실패했습니다. 다른 사진을 시도해보세요.', 'error');
}

/**
 * 업로드 단계로 돌아가기 함수
 */
function goBackToUpload() {
    // 분석 버튼 상태 초기화
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '🤖 AI 분석 시작';
    }
    
    showStep(1);
    showNotification('새로운 이미지를 선택해주세요.', 'info');
}

/**
 * 분석 재시도 함수
 */
function retryAnalysis() {
    if (!uploadedImage) {
        showNotification('먼저 이미지를 업로드해주세요.', 'warning');
        goBackToUpload();
        return;
    }
    
    showNotification('분석을 다시 시도합니다...', 'info');
    
    // 분석 단계로 이동하여 재시도
    setTimeout(() => {
        showStep(2);
        startAnalysisAnimation();
    }, 1000);
}

/**
 * 수동 분류 가이드 표시 함수
 */
function showManualGuide() {
    showNotification('수동 분류 가이드를 준비 중입니다...', 'info');
    
    // 실제 구현에서는 수동 분류 가이드 페이지로 이동하거나 모달을 표시
    // window.open('/manual-guide', '_blank');
    
    // 임시로 완료 단계로 이동
    setTimeout(() => {
        showStep(4);
    }, 2000);
}

// ============================================================================
// 전역 변수 설정
// ============================================================================

/**
 * 업로드된 이미지 파일을 저장할 변수
 * @type {File|null}
 */
let uploadedImage = null;

/**
 * 현재 진행 중인 단계를 표시하는 변수
 * 1: 업로드, 2: 분석 중, 3: 결과, 4: 완료, 5: 성공, 6: AI분석실패, 7: 등록실패
 * @type {number}
 */
let currentStep = 1;

/**
 * AI 분석 결과를 저장할 변수
 * @type {Object|null}
 */
let analysisResult = null;

/**
 * 선택된 지역 정보를 저장하는 객체
 * @type {Object}
 */
let selectedRegion = {
    city: '서울특별시',
    district: '강동구'
};

/**
 * 현재 등록 시도 중인 서비스 타입
 * @type {string|null} 'free_sharing' | 'eco_market' | null
 */
let currentRegistrationType = null;

// ============================================================================
// 지역별 수수료 정보 데이터베이스
// ============================================================================
const feeInfo = {
    '강남구': {
        contact: '02-3423-5678',
        fees: [
            { item: '냉장고', size: '대형', fee: '15,000원' },
            { item: '세탁기', size: '대형', fee: '12,000원' },
            { item: '에어컨', size: '대형', fee: '18,000원' },
            { item: '소파', size: '대형', fee: '10,000원' },
            { item: '매트리스', size: '대형', fee: '8,000원' }
        ]
    },
    '강동구': {
        contact: '02-3425-6789',
        fees: [
            { item: '냉장고', size: '대형', fee: '14,000원' },
            { item: '세탁기', size: '대형', fee: '11,000원' },
            { item: '에어컨', size: '대형', fee: '17,000원' },
            { item: '소파', size: '대형', fee: '9,000원' },
            { item: '매트리스', size: '대형', fee: '7,500원' }
        ]
    },
    '서초구': {
        contact: '02-2155-7890',
        fees: [
            { item: '냉장고', size: '대형', fee: '15,500원' },
            { item: '세탁기', size: '대형', fee: '12,500원' },
            { item: '에어컨', size: '대형', fee: '18,500원' },
            { item: '소파', size: '대형', fee: '10,500원' },
            { item: '매트리스', size: '대형', fee: '8,500원' }
        ]
    }
    // 필요에 따라 더 많은 지역 추가 가능
};

// ============================================================================
// DOM 요소 참조 변수들
// ============================================================================

// 업로드 관련 요소들
const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');

// 버튼 요소들
const resetBtn = document.getElementById('resetBtn');
const analyzeBtn = document.getElementById('analyzeBtn');

// 이미지 정보 표시 요소들
const imageName = document.getElementById('imageName');
const imageSize = document.getElementById('imageSize');

// 지역 선택 요소들
const citySelect = document.getElementById('citySelect');
const districtSelect = document.getElementById('districtSelect');

// 크기 입력 요소들
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');

// 단계별 컨테이너 요소들
const uploadStep = document.getElementById('uploadStep');
const loadingStep = document.getElementById('loadingStep');
const resultStep = document.getElementById('resultStep');
const completionStep = document.getElementById('completionStep');
const successStep = document.getElementById('successStep');
const analysisErrorStep = document.getElementById('analysisErrorStep');
const errorStep = document.getElementById('errorStep');

// 모달 요소들
const alertModal = document.getElementById('alertModal');
const alertMessage = document.getElementById('alertMessage');

// ============================================================================
// 초기화 함수 - 페이지 로드 시 실행
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 GreenCycle 폐기물 분류 시스템이 초기화되었습니다.');
    initializeEventListeners(); // 이벤트 리스너 등록
    initializeDistrictOptions(); // 지역 선택 옵션 초기화
    showStep(1); // 첫 번째 단계 표시
});

// ============================================================================
// 이벤트 리스너 등록 함수
// ============================================================================
/**
 * 모든 이벤트 리스너를 등록하는 함수
 */
function initializeEventListeners() {
    // 파일 입력 변경 이벤트 - 사용자가 파일을 선택했을 때
    if (imageInput) {
        imageInput.addEventListener('change', handleFileSelect);
    }
    
    // 드래그앤드롭 이벤트들 - 파일을 드래그해서 업로드할 때
    if (uploadZone) {
        uploadZone.addEventListener('dragover', handleDragOver);
        uploadZone.addEventListener('dragenter', handleDragEnter);
        uploadZone.addEventListener('dragleave', handleDragLeave);
        uploadZone.addEventListener('drop', handleDrop);
        
        // 업로드 존 클릭 시 파일 선택 창 열기
        uploadZone.addEventListener('click', () => {
            if (imageInput) imageInput.click();
        });
    }
    
    // 지역 선택 변경 이벤트
    if (citySelect) {
        citySelect.addEventListener('change', handleCityChange);
    }
    if (districtSelect) {
        districtSelect.addEventListener('change', handleDistrictChange);
    }
    
    // 크기 입력 이벤트들 - 가로/세로 입력 시 실시간 미리보기
    if (widthInput && heightInput) {
        widthInput.addEventListener('input', handleSizeInput);
        heightInput.addEventListener('input', handleSizeInput);
    }
}

// ============================================================================
// 지역 선택 초기화 함수
// ============================================================================
/**
 * 시/도 변경 시 구/군 옵션을 업데이트하는 함수
 */
function initializeDistrictOptions() {
    // 서울특별시 구 목록 (예시)
    const districtOptions = {
        '서울특별시': [
            '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
            '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
            '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
        ],
        '부산광역시': [
            '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구',
            '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'
        ],
        // 필요에 따라 다른 시/도 추가 가능
    };
    
    // 기본적으로 서울특별시의 구 목록 설정
    if (districtSelect) {
        updateDistrictOptions('서울특별시');
    }
}

/**
 * 시/도가 변경되었을 때 구/군 목록을 업데이트하는 함수
 * @param {string} city - 선택된 시/도
 */
function updateDistrictOptions(city) {
    const districtOptions = {
        '서울특별시': [
            '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
            '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
            '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
        ],
        '부산광역시': [
            '중구', '서구', '동구', '영도구', '부산진구', '동래구', '남구', '북구',
            '해운대구', '사하구', '금정구', '강서구', '연제구', '수영구', '사상구', '기장군'
        ]
        // 다른 시/도도 필요에 따라 추가
    };
    
    if (!districtSelect) return;
    
    // 기존 옵션 제거 (첫 번째 옵션은 유지)
    districtSelect.innerHTML = '<option value="">구/군을 선택하세요</option>';
    
    // 선택된 시/도의 구/군 옵션 추가
    const districts = districtOptions[city] || [];
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });
    
    // 기본값 설정 (강동구)
    if (districts.includes('강동구')) {
        districtSelect.value = '강동구';
        selectedRegion.district = '강동구';
    }
}

// ============================================================================
// 파일 업로드 관련 함수들
// ============================================================================

/**
 * 드래그 오버 이벤트 핸들러 - 파일을 드래그 중일 때
 * @param {Event} e - 드래그 이벤트 객체
 */
function handleDragOver(e) {
    e.preventDefault(); // 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
}

/**
 * 드래그 엔터 이벤트 핸들러 - 파일이 드롭 영역에 들어왔을 때
 * @param {Event} e - 드래그 이벤트 객체
 */
function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('dragover'); // 시각적 피드백을 위한 클래스 추가
}

/**
 * 드래그 리브 이벤트 핸들러 - 파일이 드롭 영역을 벗어났을 때
 * @param {Event} e - 드래그 이벤트 객체
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('dragover'); // 시각적 피드백 클래스 제거
}

/**
 * 드롭 이벤트 핸들러 - 파일이 드롭되었을 때
 * @param {Event} e - 드롭 이벤트 객체
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('dragover');
    
    const files = e.dataTransfer.files; // 드롭된 파일들 가져오기
    if (files.length > 0) {
        handleFileUpload(files[0]); // 첫 번째 파일만 처리
    }
}

/**
 * 파일 선택 이벤트 핸들러 - 파일 선택 창에서 파일을 선택했을 때
 * @param {Event} e - 파일 선택 이벤트 객체
 */
function handleFileSelect(e) {
    const file = e.target.files[0]; // 선택된 첫 번째 파일
    if (file) {
        handleFileUpload(file);
    }
}

/**
 * 파일 업로드 처리 함수 - 실제 파일 처리 로직
 * @param {File} file - 업로드할 파일 객체
 */
function handleFileUpload(file) {
    // 파일 유효성 검사
    if (!file.type.startsWith('image/')) {
        showNotification('이미지 파일만 업로드 가능합니다.', 'error');
        return;
    }
    
    // 파일 크기 검사 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('파일 크기는 10MB 이하여야 합니다.', 'error');
        return;
    }
    
    // 업로드된 파일을 전역 변수에 저장
    uploadedImage = file;
    
    // 파일 정보 표시
    const fileName = file.name;
    const fileSize = formatFileSize(file.size);
    
    if (imageName) imageName.textContent = fileName;
    if (imageSize) imageSize.textContent = fileSize;
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = function(e) {
        // 미리보기 이미지와 결과 이미지에 동일한 이미지 설정
        if (previewImage) previewImage.src = e.target.result;
        const resultImage = document.getElementById('resultImage');
        if (resultImage) resultImage.src = e.target.result;
        
        showUploadPreview(); // 미리보기 표시
    };
    reader.readAsDataURL(file); // 파일을 Data URL로 읽기
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환하는 함수
 * @param {number} bytes - 바이트 단위의 파일 크기
 * @returns {string} - 변환된 파일 크기 문자열
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 업로드 미리보기를 표시하는 함수
 */
function showUploadPreview() {
    // 업로드 존을 숨기고 미리보기 표시
    if (uploadZone) {
        uploadZone.classList.add('has-image');
    }
    
    // 미리보기 컨테이너 표시
    if (uploadPreview) {
        uploadPreview.style.display = 'block';
    }
    
    // 버튼들을 애니메이션과 함께 표시
    setTimeout(() => {
        if (resetBtn) {
            resetBtn.style.display = 'block';
            resetBtn.classList.add('show');
        }
        if (analyzeBtn) {
            analyzeBtn.style.display = 'block';
            analyzeBtn.classList.add('show');
        }
    }, 300);
    
    // 성공 알림 표시
    showNotification('이미지가 성공적으로 업로드되었습니다! 📸', 'success');
}

/**
 * 업로드 초기화 함수 - 업로드된 내용을 모두 초기화
 */
function resetUpload() {
    // 전역 변수 초기화
    uploadedImage = null;
    
    // 업로드 존 상태 초기화
    if (uploadZone) {
        uploadZone.classList.remove('has-image');
    }
    
    // 미리보기 숨기기
    if (uploadPreview) {
        uploadPreview.style.display = 'none';
    }
    
    // 버튼들 숨기기 (애니메이션과 함께)
    if (resetBtn) {
        resetBtn.classList.remove('show');
        setTimeout(() => {
            resetBtn.style.display = 'none';
        }, 300);
    }
    if (analyzeBtn) {
        analyzeBtn.classList.remove('show');
        setTimeout(() => {
            analyzeBtn.style.display = 'none';
        }, 300);
    }
    
    // 파일 입력 초기화
    if (imageInput) {
        imageInput.value = '';
    }
    
    // 알림 표시
    showNotification('업로드가 초기화되었습니다.', 'info');
}

// ============================================================================
// 지역 선택 관련 함수들
// ============================================================================

/**
 * 시/도 변경 이벤트 핸들러
 */
function handleCityChange() {
    const selectedCity = citySelect.value;
    selectedRegion.city = selectedCity;
    
    if (selectedCity) {
        updateDistrictOptions(selectedCity);
    } else {
        // 시/도가 선택되지 않은 경우 구/군 옵션 초기화
        if (districtSelect) {
            districtSelect.innerHTML = '<option value="">먼저 시/도를 선택하세요</option>';
        }
    }
    
    console.log('선택된 시/도:', selectedCity);
}

/**
 * 구/군 변경 이벤트 핸들러
 */
function handleDistrictChange() {
    selectedRegion.district = districtSelect.value;
    console.log('선택된 지역:', selectedRegion);
}

/**
 * 수수료 정보 확인 함수
 */
function checkFeeInfo() {
    const district = districtSelect.value;
    
    // 지역이 선택되지 않은 경우 경고
    if (!district) {
        showNotification('먼저 구를 선택해주세요.', 'warning');
        return;
    }
    
    showFeeInfoModal(district); // 수수료 정보 모달 표시
}

/**
 * 수수료 정보 모달을 표시하는 함수
 * @param {string} district - 선택된 구/군 이름
 */
function showFeeInfoModal(district) {
    // 해당 지역의 수수료 정보 가져오기 (없으면 기본값 사용)
    const info = feeInfo[district] || feeInfo['강동구'];
    
    // 모달 HTML 생성
    const modal = document.createElement('div');
    modal.className = 'fee-info-modal';
    modal.innerHTML = `
        <div class="fee-info-content">
            <div class="fee-info-header">
                <h3>💰 ${selectedRegion.city} ${district} 대형폐기물 수수료</h3>
            </div>
            <div class="fee-info-body">
                <table class="fee-table">
                    <thead>
                        <tr>
                            <th>📦 품목</th>
                            <th>📏 크기</th>
                            <th>💳 수수료</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${info.fees.map(fee => `
                            <tr>
                                <td>${fee.item}</td>
                                <td>${fee.size}</td>
                                <td><strong>${fee.fee}</strong></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="fee-contact">
                    <h4>📞 문의 및 신고센터</h4>
                    <p><strong>전화번호:</strong> ${info.contact}</p>
                    <p><strong>운영시간:</strong> 평일 09:00 ~ 18:00 (점심시간 12:00~13:00 제외)</p>
                    <p><strong>신고방법:</strong> 전화 신고 → 수수료 결제 → 스티커 발급</p>
                    <p><strong>배출방법:</strong> 지정된 날짜에 스티커 부착 후 지정장소 배출</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <button class="modal-close-btn" onclick="closeFeeInfoModal()">✅ 확인했습니다</button>
                </div>
            </div>
        </div>
    `;
    
    // 모달을 페이지에 추가
    document.body.appendChild(modal);
    
    // 모달 외부 클릭으로 닫기 기능
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeFeeInfoModal();
        }
    });
    
    // ESC 키로 모달 닫기 기능
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeFeeInfoModal();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
}

/**
 * 수수료 정보 모달을 닫는 함수
 */
function closeFeeInfoModal() {
    const modal = document.querySelector('.fee-info-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================================================
// 크기 입력 관련 함수들
// ============================================================================

/**
 * 크기 입력 이벤트 핸들러 - 가로/세로 입력 시 실시간 계산
 */
function handleSizeInput() {
    const width = widthInput.value;
    const height = heightInput.value;
    const sizePreview = document.getElementById('sizePreview');
    
    // 가로와 세로가 모두 입력된 경우
    if (width && height) {
        const area = width * height; // 면적 계산
        let sizeCategory, categoryIcon, categoryColor;
        
        // 면적에 따른 크기 분류
        if (area < 100) {
            sizeCategory = '소형';
            categoryIcon = '📦';
            categoryColor = '#28a745';
        } else if (area < 1000) {
            sizeCategory = '중형';
            categoryIcon = '📋';
            categoryColor = '#ffc107';
        } else {
            sizeCategory = '대형';
            categoryIcon = '🏠';
            categoryColor = '#dc3545';
        }
        
        // 미리보기 표시
        sizePreview.innerHTML = `
            ${categoryIcon} <strong>${sizeCategory}</strong> 폐기물 
            (${width} × ${height}cm = ${area.toLocaleString()}㎠)
        `;
        sizePreview.style.color = categoryColor;
        sizePreview.style.borderLeft = `4px solid ${categoryColor}`;
        sizePreview.classList.add('show');
        
        console.log(`입력된 크기: ${width} x ${height} cm (${sizeCategory})`);
    } 
    // 하나만 입력된 경우
    else if (width || height) {
        sizePreview.innerHTML = `⚠️ 가로와 세로를 모두 입력해주세요`;
        sizePreview.style.color = '#6c757d';
        sizePreview.style.borderLeft = '4px solid #6c757d';
        sizePreview.classList.add('show');
    } 
    // 아무것도 입력되지 않은 경우
    else {
        sizePreview.classList.remove('show');
    }
}

// ============================================================================
// AI 분석 관련 함수들
// ============================================================================

/**
 * 이미지 분석 시작 함수
 */
function analyzeImage() {
    // 이미지가 업로드되지 않은 경우
    if (!uploadedImage) {
        showNotification('먼저 이미지를 업로드해주세요.', 'warning');
        return;
    }
    
    // 지역이 선택되지 않은 경우
    if (!districtSelect.value) {
        showNotification('지역을 선택해주세요.', 'warning');
        // 지역 선택 부분으로 스크롤하여 사용자 주의 끌기
        const regionSection = document.querySelector('.region-selection');
        if (regionSection) {
            regionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            regionSection.style.animation = 'pulse 0.5s ease-in-out';
        }
        return;
    }
    
    // 분석 시작 알림
    showNotification('AI 분석을 시작합니다... 🤖', 'info');
    
    // 분석 버튼 비활성화
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '🔄 분석 중...';
    }
    
    // 다음 단계로 이동 (약간의 지연 후)
    setTimeout(() => {
        showStep(2);
        startAnalysisAnimation();
    }, 1000);
}

/**
 * 분석 애니메이션 시작 함수 - 진행률 바 애니메이션
 */
function startAnalysisAnimation() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    let progress = 0;
    
    // 진행률 증가 애니메이션
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5~20% 랜덤 증가
        if (progress > 100) {
            progress = 100;
        }
        
        // 진행률 표시 업데이트
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.round(progress) + '%';
        
        // 100% 완료 시 분석 완료 함수 호출
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                performActualAnalysis();
            }, 1000);
        }
    }, 300);
}

/**
 * 실제 AI 분석 수행 함수
 */
async function performActualAnalysis() {
    try {
        // 실제 AI 분석 API 호출
        const formData = new FormData();
        formData.append('image', uploadedImage);
        formData.append('region', JSON.stringify(selectedRegion));
        
        if (widthInput.value && heightInput.value) {
            formData.append('width', widthInput.value);
            formData.append('height', heightInput.value);
        }
        
        const response = await fetch('/api/analyze-waste', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            analysisResult = result.data;
            displayAnalysisResult();
            showStep(3); // 결과 단계로 이동
        } else {
            handleAnalysisError(result.errorType || 'recognition');
        }
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // 네트워크 에러인지 확인
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            handleAnalysisError('network');
        } else {
            handleAnalysisError('timeout');
        }
    }
}

/**
 * 분석 결과를 화면에 표시하는 함수
 */
function displayAnalysisResult() {
    if (!analysisResult) return;
    
    // 결과 데이터를 각 HTML 요소에 설정
    const elements = {
        'wasteType': analysisResult.name,
        'wasteCategory': analysisResult.category,
        'itemName': analysisResult.name,
        'itemSize': analysisResult.size,
        'processingFee': analysisResult.fee,
        'reliability': analysisResult.confidence + '%',
        'confidenceBadge': `정확도 ${analysisResult.confidence}%`
    };
    
    // 각 요소에 데이터 설정
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
    
    // 처리 단계 목록 표시
    const disposalSteps = document.getElementById('disposalSteps');
    if (disposalSteps && analysisResult.steps) {
        disposalSteps.innerHTML = '';
        analysisResult.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            disposalSteps.appendChild(li);
        });
    }
    
    // 등록 섹션 표시 여부 결정
    const registrationSection = document.getElementById('registrationSection');
    if (registrationSection) {
        // 재사용 가능한 물품만 등록 섹션 표시
        if (analysisResult.recyclable) {
            registrationSection.style.display = 'block';
            // 등록 가능할 때 강조 애니메이션 추가
            setTimeout(() => {
                registrationSection.style.animation = 'registrationPulse 2s ease-in-out infinite';
            }, 1000);
        } else {
            registrationSection.style.display = 'none';
        }
    }
    
    // 대형폐기물인 경우 연락처 정보 추가
    if (analysisResult.sizeCategory === '대형' && analysisResult.contact) {
        const contactInfo = document.createElement('div');
        contactInfo.className = 'contact-info';
        contactInfo.innerHTML = `
            <h4>📞 ${analysisResult.region.city} ${analysisResult.region.district} 신고센터</h4>
            <p><strong>전화번호:</strong> ${analysisResult.contact}</p>
            <p><strong>운영시간:</strong> 평일 09:00 ~ 18:00</p>
        `;
        contactInfo.style.cssText = `
            background: rgba(45, 90, 61, 0.1);
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid var(--primary-green);
        `;
        
        const resultInfo = document.querySelector('.result-info');
        if (resultInfo) {
            resultInfo.appendChild(contactInfo);
        }
    }
}

// ============================================================================
// 등록 관련 함수들
// ============================================================================

/**
 * 무료나눔 등록 함수
 */
async function registerForFreeSharing() {
    if (!analysisResult) {
        showNotification('먼저 분석을 완료해주세요.', 'warning');
        return;
    }
    
    // 재사용 불가능한 물품인 경우
    if (!analysisResult.recyclable) {
        showNotification('해당 물품은 무료나눔 등록이 불가능합니다.', 'error');
        return;
    }
    
    currentRegistrationType = 'free_sharing';
    showNotification('무료나눔 등록을 시작합니다... 📦', 'info');
    
    try {
        await performRegistration('free_sharing');
    } catch (error) {
        handleRegistrationError('무료나눔 등록 중 오류가 발생했습니다.');
    }
}

/**
 * 에코마켓 등록 함수
 */
async function registerForEcoMarket() {
    if (!analysisResult) {
        showNotification('먼저 분석을 완료해주세요.', 'warning');
        return;
    }
    
    // 재사용 불가능한 물품인 경우
    if (!analysisResult.recyclable) {
        showNotification('해당 물품은 에코마켓 등록이 불가능합니다.', 'error');
        return;
    }
    
    currentRegistrationType = 'eco_market';
    showNotification('에코마켓 등록을 시작합니다... 🏪', 'info');
    
    try {
        await performRegistration('eco_market');
    } catch (error) {
        handleRegistrationError('에코마켓 등록 중 오류가 발생했습니다.');
    }
}

/**
 * 실제 등록 처리 함수
 * @param {string} type - 등록 타입 ('free_sharing' | 'eco_market')
 */
async function performRegistration(type) {
    const registrationData = {
        type: type,
        itemData: analysisResult,
        region: selectedRegion,
        image: uploadedImage
    };
    
    const formData = new FormData();
    formData.append('registrationData', JSON.stringify(registrationData));
    formData.append('image', uploadedImage);
    
    const response = await fetch('/api/register-item', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
        handleRegistrationSuccess(result.data);
    } else {
        handleRegistrationError(result.message || '등록 처리 중 오류가 발생했습니다.');
    }
}

/**
 * 등록 성공 처리 함수
 * @param {Object} data - 등록 성공 데이터
 */
function handleRegistrationSuccess(data = {}) {
    // 성공 페이지 데이터 설정
    const successMessage = document.getElementById('successMessage');
    const registrationId = document.getElementById('registrationId');
    const registrationDate = document.getElementById('registrationDate');
    
    if (successMessage) {
        const serviceName = currentRegistrationType === 'free_sharing' ? '무료나눔' : '에코마켓';
        successMessage.textContent = `${serviceName}에 성공적으로 등록되었습니다`;
    }
    
    if (registrationId) {
        registrationId.textContent = data.registrationId || `GC-${Date.now()}`;
    }
    
    if (registrationDate) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        registrationDate.textContent = dateStr;
    }
    
    // 성공 페이지로 이동
    showStep(5);
    showNotification('등록이 완료되었습니다! 🎉', 'success');
}

/**
 * 등록 실패 처리 함수
 * @param {string} errorMessage - 에러 메시지
 */
function handleRegistrationError(errorMessage) {
    // 에러 페이지 데이터 설정
    const errorMessageElement = document.getElementById('errorMessage');
    const errorReason = document.getElementById('errorReason');
    
    if (errorMessageElement) {
        errorMessageElement.textContent = '등록 중 오류가 발생했습니다';
    }
    
    if (errorReason) {
        errorReason.textContent = errorMessage;
    }
    
    // 에러 페이지로 이동
    showStep(7);
    showNotification('등록에 실패했습니다. 다시 시도해주세요.', 'error');
}

/**
 * 등록 재시도 함수
 */
function retryRegistration() {
    showNotification('등록을 다시 시도합니다...', 'info');
    
    // 결과 페이지로 돌아가기
    setTimeout(() => {
        showStep(3);
    }, 1000);
}

/**
 * 결과 페이지로 돌아가기 함수
 */
function goBackToResult() {
    showStep(3);
}

/**
 * 내 등록 목록 보기 함수 (실제 구현에서는 다른 페이지로 이동)
 */
function viewMyPosts() {
    showNotification('내 등록 목록 페이지로 이동합니다.', 'info');
    window.location.href = '/my-posts';
}

// ============================================================================
// 단계 전환 관련 함수들
// ============================================================================

/**
 * 지정된 단계를 표시하는 함수
 * @param {number} stepNumber - 표시할 단계 번호 (1~7)
 */
function showStep(stepNumber) {
    // 모든 단계 컨테이너 숨기기
    const steps = [uploadStep, loadingStep, resultStep, completionStep, successStep, analysisErrorStep, errorStep];
    steps.forEach(step => {
        if (step) {
            step.style.display = 'none';
            step.classList.remove('active');
        }
    });
    
    // 해당 단계 컨테이너 선택
    let targetStep;
    switch(stepNumber) {
        case 1:
            targetStep = uploadStep;
            break;
        case 2:
            targetStep = loadingStep;
            break;
        case 3:
            targetStep = resultStep;
            break;
        case 4:
            targetStep = completionStep;
            break;
        case 5:
            targetStep = successStep;
            break;
        case 6:
            targetStep = analysisErrorStep;
            break;
        case 7:
            targetStep = errorStep;
            break;
    }
    
    // 선택된 단계 표시 (애니메이션과 함께)
    if (targetStep) {
        targetStep.style.display = 'block';
        setTimeout(() => {
            targetStep.classList.add('active');
        }, 50);
    }
    
    currentStep = stepNumber; // 현재 단계 업데이트
    
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// 사용자 액션 관련 함수들
// ============================================================================

/**
 * 정확한 분류법 확인 함수
 */
function confirmDisposal() {
    showAlert('예상 물품의 분류가 정확하다고 확인하시겠습니까?');
}

/**
 * 이전 단계로 돌아가는 함수
 */
function goBack() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

/**
 * 처음부터 다시 시작하는 함수
 */
function startOver() {
    resetUpload(); // 업로드 상태 초기화
    analysisResult = null; // 분석 결과 초기화
    currentRegistrationType = null; // 등록 타입 초기화
    
    // 분석 버튼 상태 초기화
    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '🤖 AI 분석 시작';
    }
    
    showStep(1); // 첫 단계로 이동
}

/**
 * 지자체 홈페이지 방문 함수
 */
function visitLocalWebsite() {
    showNotification('지역 분리배출 홈페이지로 이동합니다.', 'info');
    // 실제 구현에서는 해당 지역의 실제 URL로 이동
    const urls = {
        '강남구': 'https://www.gangnam.go.kr',
        '강동구': 'https://www.gangdong.go.kr',
        '서초구': 'https://www.seocho.go.kr'
    };
    
    const url = urls[selectedRegion.district] || 'https://www.seoul.go.kr';
    window.open(url, '_blank');
}

// ============================================================================
// 모달 관련 함수들
// ============================================================================

/**
 * 알림 모달을 표시하는 함수
 * @param {string} message - 표시할 메시지
 */
function showAlert(message) {
    if (alertMessage) alertMessage.textContent = message;
    if (alertModal) alertModal.style.display = 'flex';
}

/**
 * 알림 모달을 닫는 함수
 */
function closeAlert() {
    if (alertModal) alertModal.style.display = 'none';
}

/**
 * 알림 확인 함수 - 사용자가 확인 버튼을 클릭했을 때
 */
function confirmAlert() {
    closeAlert();
    showStep(4); // 완료 단계로 이동
}

// ============================================================================
// 알림 시스템 함수들
// ============================================================================

/**
 * 화면 우측 상단에 알림 메시지를 표시하는 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('info', 'success', 'warning', 'error')
 */
function showNotification(message, type = 'info') {
    // 기존 알림이 있다면 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 알림 타입에 따른 배경색 설정
    const colors = {
        'error': '#dc3545',
        'warning': '#ffc107', 
        'success': '#28a745',
        'info': '#17a2b8'
    };
    
    // 알림 스타일 설정
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    // 알림을 페이지에 추가
    document.body.appendChild(notification);
    
    // 슬라이드 인 애니메이션
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============================================================================
// 키보드 및 접근성 이벤트 처리
// ============================================================================

// 키보드 이벤트 처리
document.addEventListener('keydown', function(e) {
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
        closeAlert();
        closeFeeInfoModal();
    }
    
    // Enter 키로 다음 단계 진행 (업로드 단계에서 이미지가 있을 때)
    if (e.key === 'Enter' && currentStep === 1 && uploadedImage) {
        analyzeImage();
    }
});

// 모달 외부 클릭으로 닫기
if (alertModal) {
    alertModal.addEventListener('click', function(e) {
        if (e.target === alertModal) {
            closeAlert();
        }
    });
}

// ============================================================================
// 접근성 개선 함수들
// ============================================================================

/**
 * 접근성을 위한 추가 설정 함수
 */
function setupAccessibility() {
    // 이미지 업로드 영역에 키보드 접근성 추가
    if (uploadZone) {
        uploadZone.setAttribute('tabindex', '0');
        uploadZone.setAttribute('role', 'button');
        uploadZone.setAttribute('aria-label', '이미지 업로드 영역');
        
        // 키보드로 업로드 영역 활성화
        uploadZone.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (imageInput) imageInput.click();
            }
        });
    }
}

// ============================================================================
// 성능 최적화 함수들
// ============================================================================

/**
 * 이미지 리사이즈 함수 - 업로드 성능 최적화
 * @param {File} file - 리사이즈할 파일
 * @param {number} maxWidth - 최대 너비 (기본값: 800px)
 * @param {number} quality - 품질 (기본값: 0.8)
 * @returns {Promise<Blob>} - 리사이즈된 이미지 Blob
 */
function resizeImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Intersection Observer를 사용한 애니메이션 효과 추가
 */
function addTransitionEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 관찰할 요소들 설정
    document.querySelectorAll('.step-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

/**
 * 반응형 처리 함수
 */
function handleResize() {
    // 모바일에서 미리보기 이미지 크기 조정
    if (window.innerWidth <= 768) {
        const previewImg = document.getElementById('previewImage');
        const resultImg = document.getElementById('resultImage');
        
        if (previewImg) {
            previewImg.style.maxHeight = '250px';
        }
        if (resultImg) {
            resultImg.style.maxHeight = '250px';
        }
    }
}

// ============================================================================
// 이벤트 리스너 등록
// ============================================================================

// 창 크기 변경 이벤트
window.addEventListener('resize', handleResize);

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    if (uploadedImage) {
        uploadedImage = null;
    }
});

// 페이지 로드 완료 후 추가 초기화
window.addEventListener('load', function() {
    addTransitionEffects(); // 애니메이션 효과 초기화
    setupAccessibility(); // 접근성 설정
    handleResize(); // 초기 리사이즈 처리
});

// ============================================================================
// 전역 함수 노출 - HTML에서 호출할 수 있도록 window 객체에 등록
// ============================================================================
window.checkFeeInfo = checkFeeInfo;
window.closeFeeInfoModal = closeFeeInfoModal;
window.resetUpload = resetUpload;
window.analyzeImage = analyzeImage;
window.goBack = goBack;
window.goBackToResult = goBackToResult;
window.goBackToUpload = goBackToUpload;
window.startOver = startOver;
window.visitLocalWebsite = visitLocalWebsite;
window.confirmDisposal = confirmDisposal;
window.showAlert = showAlert;
window.closeAlert = closeAlert;
window.confirmAlert = confirmAlert;
window.registerForFreeSharing = registerForFreeSharing;
window.registerForEcoMarket = registerForEcoMarket;
window.retryRegistration = retryRegistration;
window.retryAnalysis = retryAnalysis;
window.showManualGuide = showManualGuide;
window.viewMyPosts = viewMyPosts;

// ============================================================================
// 초기화 완료 로그
// ============================================================================
console.log('🤖 GreenCycle 폐기물 분류 시스템이 초기화되었습니다.');
console.log('🎯 실제 API 연동으로 동작합니다.');

/* ============================================================================
   오류신고 관련 JavaScript 함수들 (기존 services.js 파일에 추가)
   ============================================================================ */

// ============================================================================
// 오류신고 관련 전역 변수
// ============================================================================

/**
 * 현재 오류신고 진행 상태
 * @type {boolean}
 */
let isErrorReporting = false;

/**
 * 오류신고 모달 요소들
 */
const errorReportModal = document.getElementById('errorReportModal');
const errorReportForm = document.getElementById('errorReportForm');
const errorReportSuccessModal = document.getElementById('errorReportSuccessModal');
const errorDescription = document.getElementById('errorDescription');
const charCount = document.getElementById('charCount');

// ============================================================================
// 오류신고 모달 관련 함수들
// ============================================================================

/**
 * 오류신고 모달을 여는 함수
 */
function openErrorReportModal() {
    // 분석 결과가 없으면 경고
    if (!analysisResult) {
        showNotification('분석 결과가 없습니다. 먼저 이미지를 분석해주세요.', 'warning');
        return;
    }
    
    // 현재 분석 결과를 모달에 표시 (타임리프로 이미 설정되어 있지만 동적 업데이트)
    updateCurrentAnalysisDisplay();
    
    // 모달 표시
    if (errorReportModal) {
        errorReportModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 배경 스크롤 방지
        
        // 포커스를 첫 번째 입력 필드로 이동 (접근성)
        const firstInput = errorReportModal.querySelector('select, input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 300);
        }
    }
    
    showNotification('오류신고 모달이 열렸습니다.', 'info');
}

/**
 * 오류신고 모달을 닫는 함수
 */
function closeErrorReportModal() {
    if (errorReportModal) {
        errorReportModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 배경 스크롤 복원
        
        // 폼 초기화 (사용자가 입력한 내용 제거)
        if (errorReportForm && !isErrorReporting) {
            resetErrorReportForm();
        }
    }
}

/**
 * 오류신고 성공 모달을 닫는 함수
 */
function closeErrorReportSuccessModal() {
    if (errorReportSuccessModal) {
        errorReportSuccessModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // 원래 결과 페이지로 돌아가기
    showStep(3);
}

/**
 * 현재 분석 결과를 모달에 동적으로 업데이트하는 함수
 */
function updateCurrentAnalysisDisplay() {
    if (!analysisResult) return;
    
    // 타임리프로 이미 설정되어 있지만, JavaScript로 동적 업데이트도 지원
    const elements = {
        'currentItemName': analysisResult.itemName || analysisResult.name,
        'currentCategory': analysisResult.category,
        'currentConfidence': (analysisResult.confidence || 95.2) + '%'
    };
    
    // 각 요소 업데이트
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

/**
 * 오류신고 폼을 초기화하는 함수
 */
function resetErrorReportForm() {
    if (!errorReportForm) return;
    
    // 모든 입력 필드 초기화
    const correctCategory = document.getElementById('correctCategory');
    const correctItemName = document.getElementById('correctItemName');
    const errorDescription = document.getElementById('errorDescription');
    const reporterEmail = document.querySelector('input[name="reporterEmail"]:not([type="hidden"])');
    
    if (correctCategory) correctCategory.value = '';
    if (correctItemName) correctItemName.value = '';
    if (errorDescription) {
        errorDescription.value = '';
        updateCharCount(); // 글자 수 카운터 업데이트
    }
    if (reporterEmail) reporterEmail.value = '';
    
    // 체크박스들 초기화
    const checkboxes = errorReportForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 폼 유효성 검사 메시지 제거
    const invalidFields = errorReportForm.querySelectorAll('.invalid');
    invalidFields.forEach(field => {
        field.classList.remove('invalid');
    });
}

// ============================================================================
// 오류신고 폼 제출 관련 함수들
// ============================================================================

/**
 * 오류신고 폼 제출 함수
 * @param {Event} event - 폼 제출 이벤트
 * @returns {boolean} - 제출 성공 여부
 */
async function submitErrorReport(event) {
    event.preventDefault(); // 기본 폼 제출 방지
    
    // 이미 제출 중인 경우 중복 방지
    if (isErrorReporting) {
        showNotification('이미 신고를 처리 중입니다. 잠시만 기다려주세요.', 'warning');
        return false;
    }
    
    // 폼 유효성 검사
    if (!validateErrorReportForm()) {
        return false;
    }
    
    // 제출 상태 설정
    isErrorReporting = true;
    const submitButton = errorReportForm.querySelector('.btn-error-submit');
    const originalText = submitButton.textContent;
    
    // 제출 버튼 비활성화 및 로딩 표시
    submitButton.disabled = true;
    submitButton.textContent = '🔄 신고 중...';
    
    try {
        // 폼 데이터 수집
        const formData = new FormData(errorReportForm);
        
        // 추가 데이터 설정 (타임리프에서 설정되지 않은 경우를 대비)
        if (analysisResult) {
            formData.set('analysisId', analysisResult.id || Date.now());
            formData.set('currentItemName', analysisResult.itemName || analysisResult.name);
            formData.set('currentCategory', analysisResult.category);
            formData.set('currentConfidence', analysisResult.confidence || 95.2);
            formData.set('imageId', analysisResult.imageId || 'default');
        }
        
        // 선택된 오류 타입들을 배열로 수집
        const selectedErrorTypes = [];
        const errorTypeCheckboxes = errorReportForm.querySelectorAll('input[name="errorTypes"]:checked');
        errorTypeCheckboxes.forEach(checkbox => {
            selectedErrorTypes.push(checkbox.value);
        });
        formData.set('errorTypes', JSON.stringify(selectedErrorTypes));
        
        // 지역 정보 추가
        formData.set('region', JSON.stringify(selectedRegion));
        
        // 서버에 오류신고 전송
        const response = await fetch(errorReportForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest' // AJAX 요청임을 표시
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // 성공 처리
            handleErrorReportSuccess(result.data);
        } else {
            // 실패 처리
            throw new Error(result.message || '오류신고 처리 중 문제가 발생했습니다.');
        }
        
    } catch (error) {
        console.error('Error report submission failed:', error);
        handleErrorReportFailure(error.message);
    } finally {
        // 제출 상태 초기화
        isErrorReporting = false;
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
    
    return false; // 폼의 기본 제출을 방지
}

/**
 * 오류신고 폼 유효성 검사 함수
 * @returns {boolean} - 유효성 검사 통과 여부
 */
function validateErrorReportForm() {
    const correctCategory = document.getElementById('correctCategory');
    const correctItemName = document.getElementById('correctItemName');
    const errorTypeCheckboxes = errorReportForm.querySelectorAll('input[name="errorTypes"]:checked');
    
    let isValid = true;
    const errors = [];
    
    // 올바른 분류 선택 확인
    if (!correctCategory || !correctCategory.value) {
        errors.push('올바른 분류를 선택해주세요.');
        if (correctCategory) {
            correctCategory.style.borderColor = '#dc3545';
            correctCategory.classList.add('invalid');
        }
        isValid = false;
    } else {
        if (correctCategory) {
            correctCategory.style.borderColor = '';
            correctCategory.classList.remove('invalid');
        }
    }
    
    // 올바른 물품명 입력 확인
    if (!correctItemName || !correctItemName.value.trim()) {
        errors.push('올바른 물품명을 입력해주세요.');
        if (correctItemName) {
            correctItemName.style.borderColor = '#dc3545';
            correctItemName.classList.add('invalid');
        }
        isValid = false;
    } else {
        if (correctItemName) {
            correctItemName.style.borderColor = '';
            correctItemName.classList.remove('invalid');
        }
    }
    
    // 오류 타입 선택 확인 (최소 1개는 선택해야 함)
    if (errorTypeCheckboxes.length === 0) {
        errors.push('오류 유형을 최소 1개 이상 선택해주세요.');
        isValid = false;
    }
    
    // 이메일 형식 검사 (입력된 경우에만)
    const reporterEmail = document.querySelector('input[name="reporterEmail"]:not([type="hidden"])');
    if (reporterEmail && reporterEmail.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(reporterEmail.value.trim())) {
            errors.push('올바른 이메일 형식을 입력해주세요.');
            reporterEmail.style.borderColor = '#dc3545';
            reporterEmail.classList.add('invalid');
            isValid = false;
        } else {
            reporterEmail.style.borderColor = '';
            reporterEmail.classList.remove('invalid');
        }
    }
    
    // 유효성 검사 실패 시 첫 번째 오류 메시지 표시
    if (!isValid && errors.length > 0) {
        showNotification(errors[0], 'error');
        
        // 첫 번째 잘못된 필드로 포커스 이동
        const firstInvalidField = errorReportForm.querySelector('.invalid');
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }
    
    return isValid;
}

/**
 * 오류신고 성공 처리 함수
 * @param {Object} data - 서버로부터 받은 성공 데이터
 */
function handleErrorReportSuccess(data = {}) {
    // 기본 오류신고 모달 닫기
    closeErrorReportModal();
    
    // 성공 모달에 데이터 설정
    const reportIdElement = document.getElementById('reportId');
    if (reportIdElement) {
        reportIdElement.textContent = data.reportId || `ER-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    }
    
    // 성공 모달 표시
    if (errorReportSuccessModal) {
        errorReportSuccessModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    // 성공 알림
    showNotification('오류신고가 성공적으로 접수되었습니다! 🎉', 'success');
    
    // 환경 포인트 적립 (로그인 사용자만)
    if (data.earnedPoints && data.earnedPoints > 0) {
        setTimeout(() => {
            showNotification(`환경 포인트 +${data.earnedPoints}P가 적립되었습니다! 🌟`, 'success');
        }, 2000);
    }
}

/**
 * 오류신고 실패 처리 함수
 * @param {string} errorMessage - 오류 메시지
 */
function handleErrorReportFailure(errorMessage) {
    console.error('Error report failed:', errorMessage);
    
    // 사용자에게 오류 메시지 표시
    const userMessage = errorMessage.includes('네트워크') || errorMessage.includes('network') 
        ? '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하고 다시 시도해주세요.'
        : '오류신고 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    
    showNotification(userMessage, 'error');
}

// ============================================================================
// 글자 수 카운터 관련 함수들
// ============================================================================

/**
 * 글자 수 카운터를 업데이트하는 함수
 */
function updateCharCount() {
    if (!errorDescription || !charCount) return;
    
    const currentLength = errorDescription.value.length;
    const maxLength = 500;
    
    charCount.textContent = currentLength;
    
    // 글자 수에 따른 색상 변경
    if (currentLength > maxLength * 0.9) {
        charCount.style.color = '#dc3545'; // 빨간색 - 거의 한계
    } else if (currentLength > maxLength * 0.7) {
        charCount.style.color = '#ffc107'; // 노란색 - 주의
    } else {
        charCount.style.color = '#6c757d'; // 기본 회색
    }
    
    // 최대 글자 수 초과 방지
    if (currentLength > maxLength) {
        errorDescription.value = errorDescription.value.substring(0, maxLength);
        charCount.textContent = maxLength;
        showNotification('최대 500자까지 입력 가능합니다.', 'warning');
    }
}

// ============================================================================
// 이벤트 리스너 등록 (DOMContentLoaded에 추가)
// ============================================================================

/**
 * 오류신고 관련 이벤트 리스너를 등록하는 함수
 * (기존 initializeEventListeners 함수에 추가하거나 별도로 호출)
 */
function initializeErrorReportEventListeners() {
    // 글자 수 카운터 이벤트
    if (errorDescription) {
        errorDescription.addEventListener('input', updateCharCount);
        errorDescription.addEventListener('paste', () => {
            setTimeout(updateCharCount, 10); // paste 이벤트 후 약간의 지연
        });
    }
    
    // 모달 외부 클릭으로 닫기
    if (errorReportModal) {
        errorReportModal.addEventListener('click', function(e) {
            if (e.target === errorReportModal) {
                closeErrorReportModal();
            }
        });
    }
    
    if (errorReportSuccessModal) {
        errorReportSuccessModal.addEventListener('click', function(e) {
            if (e.target === errorReportSuccessModal) {
                closeErrorReportSuccessModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기 (기존 키보드 이벤트에 추가)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (errorReportModal && errorReportModal.style.display === 'flex') {
                closeErrorReportModal();
            }
            if (errorReportSuccessModal && errorReportSuccessModal.style.display === 'flex') {
                closeErrorReportSuccessModal();
            }
        }
    });
    
    // 폼 입력 필드들의 실시간 유효성 검사
    const correctCategory = document.getElementById('correctCategory');
    const correctItemName = document.getElementById('correctItemName');
    
    if (correctCategory) {
        correctCategory.addEventListener('change', function() {
            if (this.value) {
                this.style.borderColor = '';
                this.classList.remove('invalid');
            }
        });
    }
    
    if (correctItemName) {
        correctItemName.addEventListener('input', function() {
            if (this.value.trim()) {
                this.style.borderColor = '';
                this.classList.remove('invalid');
            }
        });
    }
    
    // 이메일 필드 실시간 유효성 검사
    const reporterEmail = document.querySelector('input[name="reporterEmail"]:not([type="hidden"])');
    if (reporterEmail) {
        reporterEmail.addEventListener('blur', function() {
            if (this.value.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(this.value.trim())) {
                    this.style.borderColor = '';
                    this.classList.remove('invalid');
                } else {
                    this.style.borderColor = '#dc3545';
                    this.classList.add('invalid');
                }
            }
        });
    }
}

// ============================================================================
// 타임리프 인라인 스크립트 처리 함수
// ============================================================================

/**
 * 타임리프로 전달받은 서버 데이터를 처리하는 함수
 * HTML의 타임리프 인라인 스크립트에서 호출됨
 */
function initializeErrorReportData() {
    // 서버에서 전달받은 분석 결과가 있는 경우 전역 변수에 설정
    if (typeof analysisResult !== 'undefined' && analysisResult) {
        console.log('오류신고 기능 - 분석 결과 로드 완료:', analysisResult);
    }
    
    // 서버에서 전달받은 지역 정보가 있는 경우 전역 변수에 설정
    if (typeof selectedRegion !== 'undefined' && selectedRegion) {
        console.log('오류신고 기능 - 지역 정보 로드 완료:', selectedRegion);
    }
    
    // 기본 글자 수 카운터 초기화
    updateCharCount();
}

// ============================================================================
// 전역 함수 노출 (HTML에서 호출할 수 있도록)
// ============================================================================
window.openErrorReportModal = openErrorReportModal;
window.closeErrorReportModal = closeErrorReportModal;
window.closeErrorReportSuccessModal = closeErrorReportSuccessModal;
window.submitErrorReport = submitErrorReport;
window.updateCharCount = updateCharCount;

// ============================================================================
// 초기화 (기존 DOMContentLoaded 이벤트에 추가)
// ============================================================================
document.addEventListener('DOMContentLoaded', function() {
    // 기존 초기화 함수들...
    
    // 오류신고 관련 초기화
    initializeErrorReportEventListeners();
    initializeErrorReportData();
    
    console.log('🚨 오류신고 기능이 초기화되었습니다.');
});

// ============================================================================
// 유틸리티 함수들
// ============================================================================

/**
 * 오류신고 기능 사용 가능 여부를 확인하는 함수
 * @returns {boolean} - 사용 가능 여부
 */
function isErrorReportAvailable() {
    return analysisResult && analysisResult.itemName && errorReportModal;
}

/**
 * 오류신고 통계를 위한 이벤트 로깅 함수
 * @param {string} action - 수행된 액션
 * @param {Object} data - 추가 데이터
 */
function logErrorReportEvent(action, data = {}) {
    // 실제 구현에서는 분석 통계 API로 전송
    console.log('오류신고 이벤트:', {
        action: action,
        timestamp: new Date().toISOString(),
        analysisId: analysisResult?.id,
        ...data
    });
}

/**
 * 오류신고 모달 접근성 개선 함수
 */
function improveErrorReportAccessibility() {
    // 모달이 열릴 때 포커스 트랩 구현
    if (errorReportModal) {
        const focusableElements = errorReportModal.querySelectorAll(
            'select, input, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            errorReportModal.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            });
        }
    }
}

// 접근성 개선 함수 호출
document.addEventListener('DOMContentLoaded', function() {
    improveErrorReportAccessibility();
});