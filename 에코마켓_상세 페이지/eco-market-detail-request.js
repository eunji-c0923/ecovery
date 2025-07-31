/*
    에코마켓 상품 상세 페이지 JavaScript
    @author : sehui
    @fileName : eco-market-detail-request.js
    @since : 250731
    @history
     - 250731 | sehui | 에코마켓 상품 상세 페이지 요청 기능 추가
     - 250731 | sehui | 헤더/푸터 충돌 방지 및 이미지 처리 개선
 */

document.addEventListener("DOMContentLoaded", function (){
    console.log('🚀 상품 상세 페이지 데이터 로딩 시작...');
    
    //서버가 model로 전달한 itemId 가져오기
    const itemId = document.getElementById('itemId').value;
    
    if (!itemId) {
        console.error('❌ 상품 ID가 없습니다.');
        showNotification('상품 정보를 찾을 수 없습니다.', 'error');
        return;
    }

    console.log('📦 상품 ID:', itemId);

    //API 호출하여 상품 데이터 가져오기
    fetch(`/api/eco/${itemId}`)
        .then(response => {
            if(!response.ok) {
                throw new Error(`네트워크 응답 오류: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ 서버 응답 데이터:', data);
            
            const item = data.item;
            const role = data.role;
            const categories = data.categories;

            // 기본 정보 검증
            if (!item) {
                throw new Error('상품 데이터가 없습니다.');
            }

            // 상품명, 가격, 재고 수량, 판매 상태 설정
            updateProductBasicInfo(item);
            
            // 카테고리 정보 설정
            updateProductCategory(item, categories);
            
            // 상품 이미지 설정
            updateProductImages(item);
            
            // 상품 설명 설정
            updateProductDescription(item);
            
            // 관리자 메뉴 표시 여부 결정
            updateAdminMenu(role);
            
            console.log('✅ 상품 상세 정보 로딩 완료!');
        })
        .catch(error => {
            console.error("❌ 상품 상세 정보 데이터 로드 실패:", error);
            showNotification("상품 정보를 불러오지 못했습니다.", 'error');
            
            // 에러 시 기본 정보라도 표시
            setDefaultProductInfo();
        });
});

/**
 * 상품 기본 정보 업데이트
 */
function updateProductBasicInfo(item) {
    try {
        // 상품명
        const titleElement = document.getElementById('productTitle');
        if (titleElement) {
            titleElement.textContent = item.itemNm || '상품명 없음';
        }

        // 가격
        const priceElement = document.getElementById('currentPrice');
        if (priceElement && item.price !== undefined) {
            priceElement.textContent = item.price.toLocaleString() + '원';
        }

        // 재고 수량
        const stockElement = document.getElementById('stockNumber');
        if (stockElement && item.stockNumber !== undefined) {
            stockElement.textContent = item.stockNumber.toLocaleString() + '개';
        }

        // 판매 상태
        const statusElement = document.getElementById('productStatus');
        if (statusElement) {
            const statusText = getStatusText(item.itemSellStatus);
            const statusClass = getStatusClass(item.itemSellStatus);
            
            statusElement.textContent = statusText;
            statusElement.className = `product-status-badge ${statusClass}`;
        }

        console.log('✅ 기본 정보 업데이트 완료');
    } catch (error) {
        console.error('❌ 기본 정보 업데이트 실패:', error);
    }
}

/**
 * 상품 카테고리 정보 업데이트
 */
function updateProductCategory(item, categories) {
    try {
        const categoryElement = document.getElementById('productCategory');
        const breadcrumbCategoryElement = document.getElementById('breadcrumbCategory');
        
        if (!categories || !Array.isArray(categories)) {
            console.warn('⚠️ 카테고리 데이터가 없습니다.');
            return;
        }

        // item.categoryId와 일치하는 categoryName 찾기
        const matchedCategory = categories.find(cat => cat.categoryId === item.categoryId);
        const categoryName = matchedCategory ? matchedCategory.categoryName : "알 수 없음";

        if (categoryElement) {
            categoryElement.textContent = categoryName;
        }
        
        if (breadcrumbCategoryElement) {
            breadcrumbCategoryElement.textContent = categoryName;
        }

        console.log('✅ 카테고리 정보 업데이트 완료:', categoryName);
    } catch (error) {
        console.error('❌ 카테고리 업데이트 실패:', error);
    }
}

/**
 * 상품 이미지 업데이트
 */
function updateProductImages(item) {
    try {
        const imgList = item.itemImgDtoList;
        const mainImageTag = document.getElementById('mainImageTag');
        const mainImageContainer = document.getElementById('mainImage');
        const thumbnailList = document.getElementById('thumbnailList');

        if (!imgList || !Array.isArray(imgList) || imgList.length === 0) {
            console.warn('⚠️ 상품 이미지가 없습니다.');
            setDefaultImage(mainImageContainer);
            return;
        }

        // 메인 이미지로 첫 번째 이미지 사용
        const firstImage = imgList[0];
        if (mainImageTag && firstImage && firstImage.imgUrl) {
            mainImageTag.src = firstImage.imgUrl;
            mainImageTag.alt = firstImage.oriImgName || '상품 메인 이미지';
            mainImageTag.style.display = 'block';
            
            // 이미지 로드 완료 시 컨테이너 스타일 조정
            mainImageTag.onload = function() {
                if (mainImageContainer) {
                    mainImageContainer.style.fontSize = '0'; // 이모지 숨기기
                }
            };
            
            // 이미지 로드 실패 시 기본 이미지 표시
            mainImageTag.onerror = function() {
                console.warn('⚠️ 메인 이미지 로드 실패:', firstImage.imgUrl);
                setDefaultImage(mainImageContainer);
            };
        }

        // 썸네일 이미지 생성 (두 번째 이미지부터)
        if (thumbnailList) {
            thumbnailList.innerHTML = '';
            
            // 전체 이미지 배열을 전역 변수에 저장 (모달용)
            window.productImages = imgList.map(img => img.imgUrl);
            window.currentImageIndex = 0;

            // 썸네일 생성 (전체 이미지를 썸네일로 사용)
            for(let i = 0; i < imgList.length; i++) {
                const imgDto = imgList[i];
                const thumbContainer = document.createElement('div');
                thumbContainer.classList.add('thumbnail');
                if (i === 0) thumbContainer.classList.add('active');
                
                const thumbImg = document.createElement('img');
                thumbImg.src = imgDto.imgUrl;
                thumbImg.alt = imgDto.oriImgName || '상품 썸네일';
                thumbImg.style.width = '100%';
                thumbImg.style.height = '100%';
                thumbImg.style.objectFit = 'cover';
                
                // 썸네일 클릭 시 메인 이미지 변경
                thumbContainer.addEventListener('click', () => {
                    changeMainImage(i, imgList);
                    updateThumbnailActive(i);
                });
                
                // 이미지 로드 실패 시 기본 아이콘 표시
                thumbImg.onerror = function() {
                    thumbContainer.innerHTML = '🖼️';
                    thumbContainer.style.fontSize = '24px';
                };
                
                thumbContainer.appendChild(thumbImg);
                thumbnailList.appendChild(thumbContainer);
            }
        }

        console.log('✅ 이미지 업데이트 완료:', imgList.length + '개 이미지');
    } catch (error) {
        console.error('❌ 이미지 업데이트 실패:', error);
        setDefaultImage(document.getElementById('mainImage'));
    }
}

/**
 * 메인 이미지 변경
 */
function changeMainImage(index, imgList) {
    try {
        const mainImageTag = document.getElementById('mainImageTag');
        const mainImageContainer = document.getElementById('mainImage');
        
        if (mainImageTag && imgList[index]) {
            window.currentImageIndex = index;
            mainImageTag.src = imgList[index].imgUrl;
            mainImageTag.alt = imgList[index].oriImgName || '상품 이미지';
            
            mainImageTag.onload = function() {
                if (mainImageContainer) {
                    mainImageContainer.style.fontSize = '0';
                }
            };
            
            mainImageTag.onerror = function() {
                setDefaultImage(mainImageContainer);
            };
        }
    } catch (error) {
        console.error('❌ 메인 이미지 변경 실패:', error);
    }
}

/**
 * 썸네일 활성화 상태 업데이트
 */
function updateThumbnailActive(activeIndex) {
    try {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === activeIndex);
        });
    } catch (error) {
        console.error('❌ 썸네일 활성화 업데이트 실패:', error);
    }
}

/**
 * 기본 이미지 설정
 */
function setDefaultImage(container) {
    if (container) {
        container.innerHTML = '📦';
        container.style.fontSize = '120px';
        const img = container.querySelector('img');
        if (img) {
            img.style.display = 'none';
        }
    }
}

/**
 * 상품 설명 업데이트
 */
function updateProductDescription(item) {
    try {
        const desc = item.itemDetail || '';
        const container = document.getElementById('productDescription');

        if (!container) {
            console.warn('⚠️ 상품 설명 컨테이너를 찾을 수 없습니다.');
            return;
        }

        container.innerHTML = '';

        if (!desc.trim()) {
            container.innerHTML = '<p>상품 설명이 없습니다.</p>';
            return;
        }

        // 줄바꿈 기준으로 나눔
        const paragraphs = desc.split('\n');

        // 각 줄마다 <p> 태그로 감싸서 추가
        paragraphs.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line.trim();
            if (line.trim()) { // 빈 줄이 아닌 경우만 추가
                container.appendChild(p);
            }
        });

        // 추가 이미지가 있는 경우 설명에 추가
        if (item.itemImgDtoList && item.itemImgDtoList.length > 1) {
            const additionalImages = item.itemImgDtoList.slice(1); // 첫 번째 제외
            
            additionalImages.forEach(imgDto => {
                if (imgDto.imgUrl) {
                    const img = document.createElement('img');
                    img.src = imgDto.imgUrl;
                    img.alt = imgDto.oriImgName || '상품 이미지';
                    img.classList.add('product-image');
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.margin = '20px 0';
                    img.style.borderRadius = '8px';
                    img.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                    
                    img.onerror = function() {
                        this.style.display = 'none';
                    };
                    
                    container.appendChild(img);
                }
            });
        }

        console.log('✅ 상품 설명 업데이트 완료');
    } catch (error) {
        console.error('❌ 상품 설명 업데이트 실패:', error);
    }
}

/**
 * 관리자 메뉴 표시 업데이트
 */
function updateAdminMenu(role) {
    try {
        const productMenu = document.querySelector('.product-menu');
        
        if (productMenu) {
            // ROLE_ADMIN인 경우에만 메뉴 표시
            if (role === 'ROLE_ADMIN') {
                productMenu.style.display = 'block';
                console.log('✅ 관리자 메뉴 표시');
            } else {
                productMenu.style.display = 'none';
                console.log('ℹ️ 관리자 메뉴 숨김');
            }
        }
    } catch (error) {
        console.error('❌ 관리자 메뉴 업데이트 실패:', error);
    }
}

/**
 * 판매 상태 텍스트 반환
 */
function getStatusText(status) {
    switch(status) {
        case 'SELL': return '판매중';
        case 'SOLD_OUT': return '품절';
        default: return '판매 상태';
    }
}

/**
 * 판매 상태 CSS 클래스 반환
 */
function getStatusClass(status) {
    switch(status) {
        case 'SELL': return 'available';
        case 'SOLD_OUT': return 'sold';
        default: return 'available';
    }
}

/**
 * 기본 상품 정보 설정 (에러 시)
 */
function setDefaultProductInfo() {
    try {
        const titleElement = document.getElementById('productTitle');
        if (titleElement) {
            titleElement.textContent = '상품 정보를 불러올 수 없습니다';
        }

        const priceElement = document.getElementById('currentPrice');
        if (priceElement) {
            priceElement.textContent = '가격 정보 없음';
        }

        const stockElement = document.getElementById('stockNumber');
        if (stockElement) {
            stockElement.textContent = '0개';
        }

        const categoryElement = document.getElementById('productCategory');
        if (categoryElement) {
            categoryElement.textContent = '카테고리 없음';
        }

        setDefaultImage(document.getElementById('mainImage'));
        
        console.log('⚠️ 기본 상품 정보 설정 완료');
    } catch (error) {
        console.error('❌ 기본 상품 정보 설정 실패:', error);
    }
}

/**
 * 알림 표시 함수 (다른 JS 파일의 함수와 연동)
 */
function showNotification(message, type = 'info') {
    // 다른 JS 파일의 showNotification 함수가 있으면 사용
    if (window.showNotification && typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // 간단한 알림 표시
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // 브라우저 알림 API 사용
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('에코마켓', { body: message });
        }
    } else {
        // 기본 alert 사용
        alert(message);
    }
}

// 전역 함수로 등록 (다른 스크립트에서 사용 가능)
window.updateProductBasicInfo = updateProductBasicInfo;
window.updateProductImages = updateProductImages;
window.changeMainImage = changeMainImage;
window.updateThumbnailActive = updateThumbnailActive;

console.log('✅ 상품 상세 페이지 요청 스크립트 로딩 완료!');