// 전역 변수
let uploadedImage = null;
let currentStep = 1;
let analysisResult = null;
let selectedRegion = {
   city: '서울특별시',
   district: '강동구'
};

// 전국 지역 데이터
const regionData = {
   '서울특별시': [
       '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
       '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
       '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
   ],
   '부산광역시': [
       '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구',
       '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'
   ],
   '대구광역시': [
       '남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'
   ],
   '인천광역시': [
       '강화군', '계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구'
   ],
   '광주광역시': [
       '광산구', '남구', '동구', '북구', '서구'
   ],
   '대전광역시': [
       '대덕구', '동구', '서구', '유성구', '중구'
   ],
   '울산광역시': [
       '남구', '동구', '북구', '울주군', '중구'
   ],
   '세종특별자치시': [
       '세종시'
   ],
   '경기도': [
       '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시',
       '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시',
       '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시',
       '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'
   ],
   '강원도': [
       '강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군',
       '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'
   ],
   '충청북도': [
       '괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '진천군',
       '청주시', '충주시', '증평군'
   ],
   '충청남도': [
       '계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시',
       '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'
   ],
   '전라북도': [
       '고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군',
       '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'
   ],
   '전라남도': [
       '강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시',
       '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군',
       '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'
   ],
   '경상북도': [
       '경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군',
       '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군',
       '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'
   ],
   '경상남도': [
       '거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군',
       '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군',
       '함양군', '합천군'
   ],
   '제주특별자치도': [
       '서귀포시', '제주시'
   ]
};

// 전국 수수료 정보
const nationalFeeInfo = {
   // 서울 지역
   '서울특별시-강남구': {
       contact: '02-3423-5678',
       website: 'https://www.gangnam.go.kr',
       fees: [
           { item: '냉장고', size: '대형', fee: '15,000원' },
           { item: '세탁기', size: '대형', fee: '12,000원' },
           { item: '에어컨', size: '대형', fee: '18,000원' },
           { item: '소파', size: '대형', fee: '10,000원' },
           { item: '매트리스', size: '대형', fee: '8,000원' }
       ]
   },
   '서울특별시-강동구': {
       contact: '02-3425-6789',
       website: 'https://www.gangdong.go.kr',
       fees: [
           { item: '냉장고', size: '대형', fee: '14,000원' },
           { item: '세탁기', size: '대형', fee: '11,000원' },
           { item: '에어컨', size: '대형', fee: '17,000원' },
           { item: '소파', size: '대형', fee: '9,000원' },
           { item: '매트리스', size: '대형', fee: '7,500원' }
       ]
   },
   // 부산 지역
   '부산광역시-해운대구': {
       contact: '051-749-4000',
       website: 'https://www.haeundae.go.kr',
       fees: [
           { item: '냉장고', size: '대형', fee: '13,000원' },
           { item: '세탁기', size: '대형', fee: '10,000원' },
           { item: '에어컨', size: '대형', fee: '16,000원' },
           { item: '소파', size: '대형', fee: '8,000원' },
           { item: '매트리스', size: '대형', fee: '7,000원' }
       ]
   },
   '부산광역시-부산진구': {
       contact: '051-605-4000',
       website: 'https://www.busanjin.go.kr',
       fees: [
           { item: '냉장고', size: '대형', fee: '13,500원' },
           { item: '세탁기', size: '대형', fee: '10,500원' },
           { item: '에어컨', size: '대형', fee: '16,500원' },
           { item: '소파', size: '대형', fee: '8,500원' },
           { item: '매트리스', size: '대형', fee: '7,500원' }
       ]
   },
   // 경기도 지역
   '경기도-수원시': {
       contact: '031-228-3000',
       website: 'https://www.suwon.go.kr',
       fees: [
           { item: '냉장고', size: '대형', fee: '14,500원' },
           { item: '세탁기', size: '대형', fee: '11,500원' },
           { item: '에어컨', size: '대형', fee: '17,500원' },
           { item: '소파', size: '대형', fee: '9,500원' },
           { item: '매트리스', size: '대형', fee: '8,000원' }
       ]
   },
   '경기도-성남시': {
       contact: '031-729-2000',
       website: 'https://www.seongnam.go.kr',
       fees: [
           { item: '냉장고', size: '대형', fee: '15,000원' },
           { item: '세탁기', size: '대형', fee: '12,000원' },
           { item: '에어컨', size: '대형', fee: '18,000원' },
           { item: '소파', size: '대형', fee: '10,000원' },
           { item: '매트리스', size: '대형', fee: '8,500원' }
       ]
   },
   // 기본 수수료 (데이터가 없는 지역)
   'default': {
       contact: '1588-0000',
       website: '#',
       fees: [
           { item: '냉장고', size: '대형', fee: '15,000원' },
           { item: '세탁기', size: '대형', fee: '12,000원' },
           { item: '에어컨', size: '대형', fee: '18,000원' },
           { item: '소파', size: '대형', fee: '10,000원' },
           { item: '매트리스', size: '대형', fee: '8,000원' }
       ]
   }
};

// 폐기물 분류 데이터베이스 (시뮬레이션용)
const wasteDatabase = {
   plastic_bottle: {
       name: "플라스틱 병",
       category: "재활용품",
       size: "중형 (500ml)",
       fee: "무료",
       confidence: 95.2,
       steps: [
           "라벨과 뚜껑을 제거해주세요",
           "내용물을 완전히 비워주세요", 
           "물로 헹구어 이물질을 제거해주세요",
           "플라스틱 전용 수거함에 배출해주세요"
       ]
   },
   glass_bottle: {
       name: "유리병",
       category: "재활용품", 
       size: "중형 (350ml)",
       fee: "무료",
       confidence: 92.7,
       steps: [
           "뚜껑을 제거해주세요",
           "내용물을 완전히 비워주세요",
           "물로 헹구어 이물질을 제거해주세요", 
           "유리병 전용 수거함에 배출해주세요"
       ]
   },
   paper_box: {
       name: "종이박스",
       category: "재활용품",
       size: "대형 (30x20x15cm)",
       fee: "무료", 
       confidence: 88.9,
       steps: [
           "테이프나 스테이플러를 제거해주세요",
           "이물질을 완전히 제거해주세요",
           "납작하게 펼쳐주세요",
           "종이류 전용 수거함에 배출해주세요"
       ]
   },
   electronic_device: {
       name: "소형 전자제품",
       category: "전자폐기물",
       size: "소형 (스마트폰 크기)",
       fee: "무료",
       confidence: 91.3,
       steps: [
           "개인정보를 완전히 삭제해주세요",
           "배터리를 분리해주세요", 
           "전자제품 전용 수거함에 배출해주세요",
           "또는 제조사 수거 서비스를 이용해주세요"
       ]
   },
   furniture: {
       name: "가구",
       category: "대형폐기물",
       size: "대형 (의자/테이블)",
       fee: "10,000원",
       confidence: 94.1,
       steps: [
           "대형폐기물 신고센터에 신고해주세요",
           "수수료를 결제해주세요",
           "지정된 배출일에 배출해주세요",
           "스티커를 부착해주세요"
       ]
   }
};

// DOM 요소들
const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');
const alertModal = document.getElementById('alertModal');
const alertMessage = document.getElementById('alertMessage');

// 새로 추가된 요소들
const resetBtn = document.getElementById('resetBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const imageName = document.getElementById('imageName');
const imageSize = document.getElementById('imageSize');

// 지역 선택 요소들
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');

// 단계별 요소들
const uploadStep = document.getElementById('uploadStep');
const loadingStep = document.getElementById('loadingStep');
const resultStep = document.getElementById('resultStep');
const completionStep = document.getElementById('completionStep');

// 초기화 함수
function initializeRegionSelectors() {
   const citySelect = document.getElementById('citySelect');
   const districtSelect = document.getElementById('districtSelect');
   
   // 시/도 선택 옵션 추가
   if (citySelect) {
       citySelect.innerHTML = '<option value="">시/도를 선택하세요</option>';
       Object.keys(regionData).forEach(city => {
           const option = document.createElement('option');
           option.value = city;
           option.textContent = city;
           if (city === '서울특별시') {
               option.selected = true;
           }
           citySelect.appendChild(option);
       });
       
       // 시/도 변경 이벤트
       citySelect.addEventListener('change', function() {
           updateDistrictOptions(this.value);
           selectedRegion.city = this.value;
           selectedRegion.district = '';
       });
   }
   
   // 구/군 변경 이벤트 리스너 추가
   if (districtSelect) {
       districtSelect.addEventListener('change', handleDistrictChange);
   }
   
   // 초기 구/군 옵션 설정
   updateDistrictOptions('서울특별시');
}

// 구/군 옵션 업데이트
function updateDistrictOptions(selectedCity) {
   const districtSelect = document.getElementById('districtSelect');
   
   if (!districtSelect || !selectedCity) return;
   
   districtSelect.innerHTML = '<option value="">구/군을 선택하세요</option>';
   
   if (regionData[selectedCity]) {
       regionData[selectedCity].forEach(district => {
           const option = document.createElement('option');
           option.value = district;
           option.textContent = district;
           if (selectedCity === '서울특별시' && district === '강동구') {
               option.selected = true;
           }
           districtSelect.appendChild(option);
       });
   }
   
   // 서울 강동구가 기본 선택되도록
   if (selectedCity === '서울특별시') {
       selectedRegion.district = '강동구';
   }
}

// 수수료 정보 가져오기 함수
function getFeeInfo(city, district) {
   const key = `${city}-${district}`;
   return nationalFeeInfo[key] || nationalFeeInfo['default'];
}

// 수수료 확인 함수
function checkFeeInfo() {
   const citySelect = document.getElementById('citySelect');
   const districtSelect = document.getElementById('districtSelect');
   
   const city = citySelect ? citySelect.value : selectedRegion.city;
   const district = districtSelect ? districtSelect.value : selectedRegion.district;
   
   if (!city || !district) {
       showNotification('지역을 먼저 선택해주세요.', 'warning');
       return;
   }
   
   showFeeInfoModal(city, district);
}

// 수수료 정보 모달 함수
function showFeeInfoModal(city, district) {
   const info = getFeeInfo(city, district);
   
   const modal = document.createElement('div');
   modal.className = 'fee-info-modal';
   modal.innerHTML = `
       <div class="fee-info-content">
           <div class="fee-info-header">
               <h3>💰 ${city} ${district} 대형폐기물 수수료</h3>
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
                   <p><strong>홈페이지:</strong> ${info.website !== '#' ? `<a href="${info.website}" target="_blank">바로가기</a>` : '준비중'}</p>
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
   
   document.body.appendChild(modal);
   
   // 모달 외부 클릭으로 닫기
   modal.addEventListener('click', function(e) {
       if (e.target === modal) {
           closeFeeInfoModal();
       }
   });
}

// 수수료 정보 모달 닫기
function closeFeeInfoModal() {
   const modal = document.querySelector('.fee-info-modal');
   if (modal) {
       modal.remove();
   }
}

// 지역 변경 핸들러
function handleDistrictChange() {
   const districtSelect = document.getElementById('districtSelect');
   if (districtSelect) {
       selectedRegion.district = districtSelect.value;
       console.log('선택된 지역:', selectedRegion);
   }
}

// 이벤트 리스너 설정
function initializeEventListeners() {
   // 파일 입력 이벤트
   if (imageInput) {
       imageInput.addEventListener('change', handleFileSelect);
   }
   
   // 드래그앤드롭 이벤트
   if (uploadZone) {
       uploadZone.addEventListener('dragover', handleDragOver);
       uploadZone.addEventListener('dragenter', handleDragEnter);
       uploadZone.addEventListener('dragleave', handleDragLeave);
       uploadZone.addEventListener('drop', handleDrop);
       
       // 클릭 이벤트
       uploadZone.addEventListener('click', () => {
           if (imageInput) imageInput.click();
       });
   }
   
   // 크기 입력 이벤트
   if (widthInput && heightInput) {
       widthInput.addEventListener('input', handleSizeInput);
       heightInput.addEventListener('input', handleSizeInput);
   }
}

// 크기 입력 핸들러
function handleSizeInput() {
   const width = widthInput.value;
   const height = heightInput.value;
   const sizePreview = document.getElementById('sizePreview');
   
   if (width && height) {
       const area = width * height;
       let sizeCategory;
       let categoryIcon;
       let categoryColor;
       
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
       
       sizePreview.innerHTML = `
           ${categoryIcon} <strong>${sizeCategory}</strong> 폐기물 
           (${width} × ${height}cm = ${area.toLocaleString()}㎠)
       `;
       sizePreview.style.color = categoryColor;
       sizePreview.style.borderLeft = `4px solid ${categoryColor}`;
       sizePreview.classList.add('show');
       
       console.log(`입력된 크기: ${width} x ${height} cm (${sizeCategory})`);
   } else if (width || height) {
       sizePreview.innerHTML = `⚠️ 가로와 세로를 모두 입력해주세요`;
       sizePreview.style.color = '#6c757d';
       sizePreview.style.borderLeft = '4px solid #6c757d';
       sizePreview.classList.add('show');
   } else {
       sizePreview.classList.remove('show');
   }
}

// 드래그앤드롭 이벤트 핸들러
function handleDragOver(e) {
   e.preventDefault();
   e.stopPropagation();
}

function handleDragEnter(e) {
   e.preventDefault();
   e.stopPropagation();
   uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
   e.preventDefault();
   e.stopPropagation();
   uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
   e.preventDefault();
   e.stopPropagation();
   uploadZone.classList.remove('dragover');
   
   const files = e.dataTransfer.files;
   if (files.length > 0) {
       handleFileUpload(files[0]);
   }
}

// 파일 선택 핸들러
function handleFileSelect(e) {
   const file = e.target.files[0];
   if (file) {
       handleFileUpload(file);
   }
}

// 파일 업로드 처리
function handleFileUpload(file) {
   // 파일 유효성 검사
   if (!file.type.startsWith('image/')) {
       showNotification('이미지 파일만 업로드 가능합니다.', 'error');
       return;
   }
   
   if (file.size > 10 * 1024 * 1024) { // 10MB
       showNotification('파일 크기는 10MB 이하여야 합니다.', 'error');
       return;
   }
   
   uploadedImage = file;
   
   // 파일 정보 표시
   const fileName = file.name;
   const fileSize = formatFileSize(file.size);
   
   if (imageName) imageName.textContent = fileName;
   if (imageSize) imageSize.textContent = fileSize;
   
   // 이미지 미리보기
   const reader = new FileReader();
   reader.onload = function(e) {
       if (previewImage) previewImage.src = e.target.result;
       const resultImage = document.getElementById('resultImage');
       if (resultImage) resultImage.src = e.target.result;
       showUploadPreview();
   };
   reader.readAsDataURL(file);
}

// 파일 크기 포맷 함수
function formatFileSize(bytes) {
   if (bytes === 0) return '0 Bytes';
   const k = 1024;
   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
   const i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 업로드 미리보기 표시
function showUploadPreview() {
   // 업로드 존 상태 변경
   if (uploadZone) uploadZone.classList.add('has-image');
   
   // 미리보기 표시
   if (uploadPreview) uploadPreview.style.display = 'block';
   
   // 버튼들 애니메이션으로 표시
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
   
   // 성공 알림
   showNotification('이미지가 성공적으로 업로드되었습니다! 📸', 'success');
}

// 업로드 초기화
function resetUpload() {
   uploadedImage = null;
   
   // 업로드 존 상태 초기화
   if (uploadZone) uploadZone.classList.remove('has-image');
   
   // 미리보기 숨기기
   if (uploadPreview) uploadPreview.style.display = 'none';
   
   // 버튼들 숨기기
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
   if (imageInput) imageInput.value = '';
   
   // 알림
   showNotification('업로드가 초기화되었습니다.', 'info');
}

// 이미지 분석 시작
function analyzeImage() {
   if (!uploadedImage) {
       showNotification('먼저 이미지를 업로드해주세요.', 'warning');
       return;
   }
   
   const districtSelect = document.getElementById('districtSelect');
   if (!districtSelect || !districtSelect.value) {
       showNotification('지역을 선택해주세요.', 'warning');
       // 지역 선택 부분으로 스크롤
       const regionSection = document.querySelector('.region-selection');
       if (regionSection) {
           regionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
           regionSection.style.animation = 'pulse 0.5s ease-in-out';
       }
       return;
   }
   
   // 분석 시작 알림
   showNotification('AI 분석을 시작합니다... 🤖', 'info');
   
   // 버튼 비활성화
   if (analyzeBtn) {
       analyzeBtn.disabled = true;
       analyzeBtn.innerHTML = '🔄 분석 중...';
   }
   
   // 다음 단계로 이동
   setTimeout(() => {
       showStep(2);
       startAnalysisAnimation();
   }, 1000);
}

// 분석 애니메이션 시작
function startAnalysisAnimation() {
   const progressFill = document.getElementById('progressFill');
   const progressText = document.getElementById('progressText');
   let progress = 0;
   
   const interval = setInterval(() => {
       progress += Math.random() * 15 + 5;
       if (progress > 100) {
           progress = 100;
       }
       
       if (progressFill) progressFill.style.width = progress + '%';
       if (progressText) progressText.textContent = Math.round(progress) + '%';
       
       if (progress >= 100) {
           clearInterval(interval);
           setTimeout(() => {
               completeAnalysis();
           }, 1000);
       }
   }, 300);
}

// 분석 완료
function completeAnalysis() {
   // 크기 정보 가져오기
   const width = widthInput ? widthInput.value : '';
   const height = heightInput ? heightInput.value : '';
   let sizeCategory = '중형';
   let estimatedSize = '중형 (추정)';
   
   if (width && height) {
       const area = width *