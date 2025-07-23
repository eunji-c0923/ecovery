/* ==========================================
   GreenCycle 결제 페이지 JavaScript
   결제 수단별 동적 폼 표시 기능 포함
   ========================================== */

// 전역 변수 선언
let orderData = {
    items: [],           // 주문 상품 목록
    delivery: {},        // 배송 정보
    payment: {},         // 결제 정보
    coupons: [],         // 적용된 쿠폰
    totals: {            // 가격 정보
        subtotal: 0,
        discount: 0,
        couponDiscount: 0,
        shipping: 0,
        final: 0
    }
};

// DOM 요소 참조
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const paymentModal = document.getElementById('paymentModal');

/* ==========================================
   페이지 초기화 함수
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🛒 GreenCycle 결제 페이지 초기화 시작...');
        
        // 헤더 기능 초기화
        initializeHeader();
        
        // 주문 데이터 초기화
        initializeOrderData();
        
        // 폼 이벤트 리스너 설정
        initializeFormEvents();
        
        // 주문 요약 정보 업데이트
        updateOrderSummary();
        
        // 기본 결제 수단 (무통장입금) 설정
        handlePaymentMethodChange('bank');
        
        // 페이지 애니메이션 효과
        animatePageLoad();
        
        console.log('✅ GreenCycle 결제 페이지 초기화 완료');
        
    } catch (error) {
        console.error('❌ 페이지 초기화 오류:', error);
        showNotification('페이지 초기화 중 오류가 발생했습니다.', 'error');
    }
});

/* ==========================================
   헤더 관련 기능
   ========================================== */
function initializeHeader() {
    // 스크롤 시 헤더 스타일 변경
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 모바일 메뉴 토글 기능
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            toggleMobileMenu();
        });
    }
    
    // 네비게이션 링크 클릭 시 모바일 메뉴 닫기
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // 햄버거 아이콘 애니메이션
    const spans = hamburger.querySelectorAll('span');
    if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

function closeMobileMenu() {
    if (hamburger && navMenu) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

/* ==========================================
   주문 데이터 초기화 함수
   ========================================== */
async function initializeOrderData() {
    try {
        // TODO: 백엔드에서 장바구니/주문 데이터 가져오기
        // const response = await fetch('/api/cart/checkout-data');
        // const cartData = await response.json();
        // orderData.items = cartData.items;
        
        // 임시로 로컬 스토리지에서 가져오기
        const savedCart = localStorage.getItem('greenCycleCart');
        if (savedCart) {
            orderData.items = JSON.parse(savedCart);
        } else {
            orderData.items = [];
        }
        
        calculateTotals();
        renderOrderItems();
        
        console.log('주문 데이터 초기화 완료:', orderData);
        
    } catch (error) {
        console.error('주문 데이터 초기화 오류:', error);
        showNotification('주문 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 주문 상품 목록을 화면에 렌더링하는 함수
function renderOrderItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = '';
    
    orderData.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-image-small">
                ${item.image || '📦'}
            </div>
            <div class="item-details-small">
                <div class="item-name-small">${item.name || item.title}</div>
                <div class="item-quantity-price">
                    <span class="item-quantity">수량: ${item.quantity}개</span>
                    <span class="item-price-small">${formatPrice(item.price * item.quantity)}</span>
                </div>
            </div>
        `;
        orderItemsContainer.appendChild(itemElement);
    });
}

/* ==========================================
   폼 이벤트 리스너 설정 함수
   ========================================== */
function initializeFormEvents() {
    // 배송 메시지 선택 이벤트
    const deliveryMessageSelect = document.getElementById('deliveryMessage');
    const customMessageTextarea = document.getElementById('customMessage');
    
    if (deliveryMessageSelect) {
        deliveryMessageSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customMessageTextarea.style.display = 'block';
                customMessageTextarea.focus();
            } else {
                customMessageTextarea.style.display = 'none';
            }
        });
    }
    
    // 전체 동의 체크박스 이벤트
    const agreeAllCheckbox = document.getElementById('agreeAll');
    if (agreeAllCheckbox) {
        agreeAllCheckbox.addEventListener('change', toggleAllAgreements);
    }
    
    // 개별 동의 체크박스 이벤트
    const agreementCheckboxes = document.querySelectorAll('.agreement-checkbox');
    agreementCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateAgreeAllStatus);
    });
    
    // 카드 번호 자동 포맷팅
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // 유효기간 자동 포맷팅
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', formatCardExpiry);
    }
    
    // 전화번호 자동 포맷팅
    const phoneInput = document.getElementById('receiverPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
    
    // 폼 유효성 검사 이벤트
    const formInputs = document.querySelectorAll('input[required], select[required]');
    formInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // 포인트 입력 이벤트
    initializePointInput();
}

/* ==========================================
   결제 수단 변경 처리 함수
   ========================================== */
function handlePaymentMethodChange(method) {
    console.log('🔄 결제 수단 변경:', method);
    
    // 모든 결제 상세 정보 폼을 숨김
    const cardDetails = document.getElementById('cardDetails');
    const bankDetails = document.getElementById('bankDetails');
    const pointDetails = document.getElementById('pointDetails');
    
    // 모든 폼 숨기기
    if (cardDetails) cardDetails.style.display = 'none';
    if (bankDetails) bankDetails.style.display = 'none';
    if (pointDetails) pointDetails.style.display = 'none';
    
    // 선택된 결제 수단에 따라 해당 폼 표시
    switch (method) {
        case 'card':
            console.log('💳 신용카드 선택됨');
            if (cardDetails) {
                showPaymentForm(cardDetails);
                setRequiredFields(['cardNumber', 'cardExpiry', 'cardCvc', 'cardPassword'], true);
                setRequiredFields(['selectedBank', 'depositorName', 'usePoints'], false);
                showNotification('신용카드가 선택되었습니다. 카드 정보를 입력해주세요.', 'info');
            }
            break;
            
        case 'bank':
            console.log('🏦 무통장입금 선택됨');
            if (bankDetails) {
                showPaymentForm(bankDetails);
                setRequiredFields(['selectedBank', 'depositorName'], true);
                setRequiredFields(['cardNumber', 'cardExpiry', 'cardCvc', 'cardPassword', 'usePoints'], false);
                showNotification('무통장입금이 선택되었습니다. 입금 정보를 입력해주세요.', 'info');
            }
            break;
            
        case 'point':
            console.log('💎 포인트 결제 선택됨');
            if (pointDetails) {
                showPaymentForm(pointDetails);
                setRequiredFields(['usePoints'], true);
                setRequiredFields(['cardNumber', 'cardExpiry', 'cardCvc', 'cardPassword', 'selectedBank', 'depositorName'], false);
                initializePointInput();
                showNotification('포인트 결제가 선택되었습니다. 사용할 포인트를 입력해주세요.', 'info');
            }
            break;
    }
    
    // 주문 데이터에 결제 수단 저장
    orderData.payment.method = method;
}

function showPaymentForm(formElement) {
    formElement.style.display = 'block';
    formElement.style.opacity = '0';
    formElement.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        formElement.style.transition = 'all 0.3s ease';
        formElement.style.opacity = '1';
        formElement.style.transform = 'translateY(0)';
    }, 50);
}

function setRequiredFields(fieldIds, required) {
    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            if (required) {
                field.setAttribute('required', '');
                field.style.borderColor = '';
            } else {
                field.removeAttribute('required');
                field.style.borderColor = '';
                clearFieldError(field);
            }
        }
    });
}

/* ==========================================
   포인트 결제 관련 기능들
   ========================================== */
function initializePointInput() {
    const usePointsInput = document.getElementById('usePoints');
    if (usePointsInput) {
        usePointsInput.removeEventListener('input', calculatePointPayment);
        usePointsInput.removeEventListener('blur', validatePointInput);
        
        usePointsInput.addEventListener('input', calculatePointPayment);
        usePointsInput.addEventListener('blur', validatePointInput);
    }
}

async function useAllPoints() {
    try {
        // TODO: 백엔드에서 보유 포인트 조회
        // const response = await fetch('/api/users/points');
        // const { availablePoints } = await response.json();
        
        const availablePoints = 15680; // 임시 데이터
        const totalAmount = orderData.totals.final;
        const usePointsInput = document.getElementById('usePoints');
        
        if (usePointsInput) {
            const pointsToUse = Math.min(availablePoints, totalAmount);
            usePointsInput.value = pointsToUse;
            calculatePointPayment();
            showNotification(`${pointsToUse.toLocaleString()}P를 사용합니다.`, 'success');
        }
        
    } catch (error) {
        console.error('전액 포인트 사용 오류:', error);
        showNotification('포인트 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

function calculatePointPayment() {
    const usePointsInput = document.getElementById('usePoints');
    const pointUsageElement = document.getElementById('pointUsage');
    const remainingPaymentElement = document.getElementById('remainingPayment');
    
    if (!usePointsInput || !pointUsageElement || !remainingPaymentElement) return;
    
    const usePoints = parseInt(usePointsInput.value) || 0;
    const totalAmount = orderData.totals.final;
    const remainingAmount = Math.max(0, totalAmount - usePoints);
    
    // 화면에 포인트 사용량과 남은 금액 표시
    pointUsageElement.textContent = `${usePoints.toLocaleString()}P`;
    remainingPaymentElement.textContent = formatPrice(remainingAmount);
    
    // 전액 포인트 결제인 경우 스타일 변경
    if (remainingAmount === 0 && usePoints > 0) {
        remainingPaymentElement.style.color = 'var(--success-color)';
        showNotification('전액 포인트로 결제됩니다! 🎉', 'success');
    } else {
        remainingPaymentElement.style.color = 'var(--primary-green)';
    }
}

async function validatePointInput() {
    const usePointsInput = document.getElementById('usePoints');
    
    try {
        // TODO: 백엔드에서 보유 포인트 조회
        // const response = await fetch('/api/users/points');
        // const { availablePoints } = await response.json();
        
        const availablePoints = 15680; // 임시 데이터
        const totalAmount = orderData.totals.final;
        
        if (!usePointsInput) return true;
        
        const usePoints = parseInt(usePointsInput.value) || 0;
        let isValid = true;
        let errorMessage = '';
        
        if (usePoints < 0) {
            isValid = false;
            errorMessage = '0 이상의 포인트를 입력해주세요.';
        } else if (usePoints > 0 && usePoints < 1000) {
            isValid = false;
            errorMessage = '최소 1,000P부터 사용 가능합니다.';
        } else if (usePoints > availablePoints) {
            isValid = false;
            errorMessage = `보유 포인트(${availablePoints.toLocaleString()}P)를 초과했습니다.`;
            usePointsInput.value = availablePoints;
            calculatePointPayment();
        } else if (usePoints > totalAmount) {
            usePointsInput.value = totalAmount;
            calculatePointPayment();
            showNotification('결제 금액만큼만 사용됩니다.', 'info');
        }
        
        if (!isValid) {
            showFieldError(usePointsInput, errorMessage);
        } else {
            clearFieldError(usePointsInput);
            calculatePointPayment();
        }
        
        return isValid;
        
    } catch (error) {
        console.error('포인트 유효성 검사 오류:', error);
        showNotification('포인트 확인 중 오류가 발생했습니다.', 'error');
        return false;
    }
}

/* ==========================================
   입력 필드 포맷팅 함수들
   ========================================== */
function formatCardNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1-');
    if (formattedValue.endsWith('-')) {
        formattedValue = formattedValue.slice(0, -1);
    }
    event.target.value = formattedValue;
}

function formatCardExpiry(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3 && value.length <= 7) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    } else if (value.length > 7) {
        value = value.substring(0, 3) + '-' + value.substring(3, 7) + '-' + value.substring(7, 11);
    }
    event.target.value = value;
}

/* ==========================================
   폼 유효성 검사 함수들
   ========================================== */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // 필수 필드 체크
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = '필수 입력 항목입니다.';
    }
    
    // 필드별 특별 유효성 검사
    switch (field.id) {
        case 'receiverPhone':
            if (value && !validatePhoneNumber(value)) {
                isValid = false;
                errorMessage = '올바른 전화번호 형식이 아닙니다.';
            }
            break;
        case 'cardNumber':
            if (value && !validateCardNumber(value)) {
                isValid = false;
                errorMessage = '올바른 카드 번호가 아닙니다.';
            }
            break;
        case 'cardExpiry':
            if (value && !validateCardExpiry(value)) {
                isValid = false;
                errorMessage = '올바른 유효기간이 아닙니다.';
            }
            break;
        case 'cardCvc':
            if (value && !/^\d{3}$/.test(value)) {
                isValid = false;
                errorMessage = 'CVC는 3자리 숫자여야 합니다.';
            }
            break;
    }
    
    // 오류 표시/제거
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // 약관 동의 확인
    const requiredAgreements = document.querySelectorAll('.agreement-checkbox[required]');
    requiredAgreements.forEach(checkbox => {
        if (!checkbox.checked) {
            isValid = false;
            showNotification('필수 약관에 동의해주세요.', 'warning');
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = 'var(--danger-color)';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
        color: var(--danger-color);
        font-size: 12px;
        margin-top: 5px;
        display: block;
    `;
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.style.borderColor = '';
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/* ==========================================
   유효성 검사 헬퍼 함수들
   ========================================== */
function validatePhoneNumber(phone) {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phone);
}

function validateCardNumber(cardNumber) {
    const number = cardNumber.replace(/\D/g, '');
    if (number.length !== 16) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

function validateCardExpiry(expiry) {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;
    
    const monthNum = parseInt(month);
    const yearNum = parseInt('20' + year);
    
    if (monthNum < 1 || monthNum > 12) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    
    return true;
}

/* ==========================================
   약관 동의 관련 기능
   ========================================== */
function toggleAllAgreements() {
    const agreeAll = document.getElementById('agreeAll');
    const agreementCheckboxes = document.querySelectorAll('.agreement-checkbox');
    
    agreementCheckboxes.forEach(checkbox => {
        checkbox.checked = agreeAll.checked;
    });
}

function updateAgreeAllStatus() {
    const agreeAll = document.getElementById('agreeAll');
    const agreementCheckboxes = document.querySelectorAll('.agreement-checkbox');
    const checkedCount = Array.from(agreementCheckboxes).filter(cb => cb.checked).length;
    
    agreeAll.checked = checkedCount === agreementCheckboxes.length;
}

/* ==========================================
   가격 계산 및 업데이트 함수들
   ========================================== */
function calculateTotals() {
    // 상품 금액 계산
    const subtotal = orderData.items.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price;
        return sum + (originalPrice * item.quantity);
    }, 0);
    
    // 할인 금액 계산
    const discountAmount = orderData.items.reduce((sum, item) => {
        if (item.originalPrice) {
            return sum + ((item.originalPrice - item.price) * item.quantity);
        }
        return sum;
    }, 0);
    
    // 실제 상품 금액
    const itemTotal = orderData.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    // 쿠폰 할인 계산
    let couponDiscountAmount = 0;
    orderData.coupons.forEach(coupon => {
        if (coupon.type === 'percentage') {
            couponDiscountAmount += itemTotal * (coupon.value / 100);
        } else if (coupon.type === 'fixed') {
            couponDiscountAmount += coupon.value;
        }
    });
    
    // 배송비 계산 (50,000원 이상 무료)
    const shippingCost = itemTotal >= 50000 ? 0 : 3000;
    
    // 최종 금액
    const finalTotal = Math.max(0, itemTotal - couponDiscountAmount + shippingCost);
    
    // 결과 저장
    orderData.totals = {
        subtotal: subtotal,
        discount: discountAmount,
        couponDiscount: couponDiscountAmount,
        shipping: shippingCost,
        final: finalTotal
    };
}

function updateOrderSummary() {
    calculateTotals();
    
    const totals = orderData.totals;
    
    // 가격 정보 업데이트
    updateElementText('subtotal', formatPrice(totals.subtotal));
    updateElementText('discount', `-${formatPrice(totals.discount)}`);
    updateElementText('shipping', totals.shipping === 0 ? '무료' : formatPrice(totals.shipping));
    updateElementText('finalTotal', formatPrice(totals.final));
    
    // 쿠폰 할인 표시/숨김
    const couponDiscountRow = document.getElementById('couponDiscountRow');
    if (totals.couponDiscount > 0) {
        updateElementText('couponDiscount', `-${formatPrice(totals.couponDiscount)}`);
        if (couponDiscountRow) couponDiscountRow.style.display = 'flex';
    } else {
        if (couponDiscountRow) couponDiscountRow.style.display = 'none';
    }
    
    // 결제 버튼 업데이트
    const paymentBtn = document.getElementById('paymentBtn');
    if (paymentBtn) {
        paymentBtn.textContent = `💳 ${formatPrice(totals.final)} 결제하기`;
    }
    
    // 환경 임팩트 업데이트
    updateEnvironmentalImpact();
}

function updateEnvironmentalImpact() {
    const totalCarbonSaved = orderData.items.reduce((sum, item) => {
        return sum + (item.carbonSaved * item.quantity);
    }, 0);
    
    const plasticSaved = Math.round(totalCarbonSaved * 50);
    const pointsToEarn = Math.floor(orderData.totals.final * 0.01);
    
    // 임팩트 값 업데이트
    const impactValues = document.querySelectorAll('.impact-value');
    if (impactValues.length >= 3) {
        impactValues[0].textContent = `${totalCarbonSaved.toFixed(1)}kg CO₂`;
        impactValues[1].textContent = `${plasticSaved}g`;
        impactValues[2].textContent = `${pointsToEarn}P`;
    }
}

/* ==========================================
   주소 검색 기능 (다음 주소 API 연동)
   ========================================== */
function searchAddress() {
    // TODO: 실제 다음 주소 검색 API 연동
    showNotification('주소 검색 서비스를 연결해주세요.', 'info');
    
    // 실제 구현에서는 다음과 같이 사용:
    // new daum.Postcode({
    //     oncomplete: function(data) {
    //         document.getElementById('zipcode').value = data.zonecode;
    //         document.getElementById('address1').value = data.address;
    //         document.getElementById('address2').focus();
    //     }
    // }).open();
}

/* ==========================================
   결제 처리 관련 함수들
   ========================================== */
async function processPayment() {
    console.log('💳 결제 처리 시작...');
    
    // 폼 유효성 검사
    if (!validateForm()) {
        showNotification('입력 정보를 확인해주세요.', 'error');
        return;
    }
    
    try {
        // 배송 정보 수집
        collectDeliveryInfo();
        
        // 결제 정보 수집
        collectPaymentInfo();
        
        // 결제 처리 모달 표시
        showPaymentModal();
        
        // 실제 결제 API 호출
        await processPaymentAPI();
        
    } catch (error) {
        console.error('결제 처리 오류:', error);
        showNotification('결제 처리 중 오류가 발생했습니다.', 'error');
        hidePaymentModal();
    }
}

function collectDeliveryInfo() {
    orderData.delivery = {
        receiverName: document.getElementById('receiverName').value,
        receiverPhone: document.getElementById('receiverPhone').value,
        zipcode: document.getElementById('zipcode').value,
        address1: document.getElementById('address1').value,
        address2: document.getElementById('address2').value,
        message: getDeliveryMessage()
    };
}

function getDeliveryMessage() {
    const messageSelect = document.getElementById('deliveryMessage');
    const customMessage = document.getElementById('customMessage');
    
    if (messageSelect.value === 'custom') {
        return customMessage.value;
    } else {
        return messageSelect.options[messageSelect.selectedIndex].text;
    }
}

function collectPaymentInfo() {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    orderData.payment = {
        method: paymentMethod,
        amount: orderData.totals.final
    };
    
    if (paymentMethod === 'card') {
        orderData.payment.cardInfo = {
            number: document.getElementById('cardNumber').value,
            expiry: document.getElementById('cardExpiry').value,
            cvc: document.getElementById('cardCvc').value
            // 실제로는 카드 정보를 직접 저장하지 않고 토큰화하여 처리
        };
    }
}

async function processPaymentAPI() {
    try {
        // TODO: 실제 결제 API 호출
        // const response = await fetch('/api/payments/process', {
        //     method: 'POST',
        //     body: JSON.stringify(orderData)
        // });
        // const result = await response.json();
        
        // 임시 결제 처리 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 성공 처리
        hidePaymentModal();
        handlePaymentSuccess();
        
    } catch (error) {
        hidePaymentModal();
        handlePaymentFailure(error);
        throw error;
    }
}

function showPaymentModal() {
    if (paymentModal) {
        paymentModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hidePaymentModal() {
    if (paymentModal) {
        paymentModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function handlePaymentSuccess() {
    const orderNumber = generateOrderNumber();
    showNotification('결제가 완료되었습니다! 🎉', 'success');
    
    setTimeout(() => {
        alert(`주문이 완료되었습니다!\n주문번호: ${orderNumber}\n\n주문 완료 페이지로 이동합니다.`);
        console.log('주문 완료 데이터:', {
            orderNumber: orderNumber,
            ...orderData
        });
        
        // TODO: 주문 완료 페이지로 이동
        // window.location.href = `order-complete.html?orderNumber=${orderNumber}`;
    }, 1500);
}

function handlePaymentFailure(error) {
    showNotification('결제에 실패했습니다. 다시 시도해주세요.', 'error');
    
    // 결제 버튼 다시 활성화
    const paymentBtn = document.getElementById('paymentBtn');
    if (paymentBtn) {
        paymentBtn.disabled = false;
    }
    
    console.error('결제 실패:', error);
}

function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `GC${year}${month}${day}${random}`;
}

/* ==========================================
   유틸리티 함수들
   ========================================== */
function formatPrice(price) {
    return new Intl.NumberFormat('ko-KR').format(Math.round(price)) + '원';
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
        font-size: 14px;
        line-height: 1.4;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationColor(type) {
    const colors = {
        'success': '#2d5a3d',
        'error': '#dc3545',
        'warning': '#ffc107',
        'info': '#6fa776'
    };
    return colors[type] || colors.success;
}

function animatePageLoad() {
    // 폼 섹션들을 순차적으로 페이드인
    const formSections = document.querySelectorAll('.form-section, .summary-section');
    formSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.5s ease';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // 진행 단계 애니메이션
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        setTimeout(() => {
            step.style.animation = 'fadeInUp 0.5s ease forwards';
        }, index * 200);
    });
}

/* ==========================================
   브라우저 호환성 및 성능 최적화
   ========================================== */
function checkBrowserCompatibility() {
    const features = {
        localStorage: typeof Storage !== 'undefined',
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid'),
        intersectionObserver: 'IntersectionObserver' in window
    };
    
    const unsupportedFeatures = Object.keys(features).filter(feature => !features[feature]);
    
    if (unsupportedFeatures.length > 0) {
        console.warn('지원되지 않는 브라우저 기능:', unsupportedFeatures);
        showNotification('일부 기능이 제한될 수 있습니다. 최신 브라우저를 사용해주세요.', 'warning');
    }
}

function monitorNetworkStatus() {
    function updateNetworkStatus() {
        if (!navigator.onLine) {
            showNotification('인터넷 연결이 끊어졌습니다. 연결을 확인해주세요.', 'error');
        }
    }
    
    window.addEventListener('online', () => {
        showNotification('인터넷 연결이 복구되었습니다.', 'success');
    });
    
    window.addEventListener('offline', updateNetworkStatus);
}

/* ==========================================
   접근성 향상 함수들
   ========================================== */
function enhanceAccessibility() {
    // 폼 레이블과 입력 필드 연결 확인
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-labelledby', input.id + '_label');
                label.id = input.id + '_label';
            }
        }
    });
    
    // 결제 수단 라디오 버튼에 키보드 네비게이션 추가
    const paymentLabels = document.querySelectorAll('.payment-label');
    paymentLabels.forEach(label => {
        label.setAttribute('tabindex', '0');
        label.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const radio = label.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    handlePaymentMethodChange(radio.value);
                }
            }
        });
    });
    
    // 진행 단계에 ARIA 레이블 추가
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        const stepText = step.querySelector('.step-text').textContent;
        
        if (step.classList.contains('completed')) {
            step.setAttribute('aria-label', `${stepNumber}단계: ${stepText} (완료)`);
        } else if (step.classList.contains('active')) {
            step.setAttribute('aria-label', `${stepNumber}단계: ${stepText} (현재 단계)`);
        } else {
            step.setAttribute('aria-label', `${stepNumber}단계: ${stepText}`);
        }
    });
}

/* ==========================================
   데이터 관리 함수들
   ========================================== */
function saveOrderToStorage() {
    try {
        // 민감한 정보는 제외하고 저장
        const safeOrderData = { ...orderData };
        if (safeOrderData.payment && safeOrderData.payment.cardInfo) {
            delete safeOrderData.payment.cardInfo;
        }
        
        localStorage.setItem('greenCycleOrder', JSON.stringify(safeOrderData));
        console.log('주문 데이터가 로컬 스토리지에 저장되었습니다.');
    } catch (error) {
        console.warn('로컬 스토리지 저장 실패:', error);
    }
}

function loadOrderFromStorage() {
    try {
        const savedOrder = localStorage.getItem('greenCycleOrder');
        if (savedOrder) {
            const parsedOrder = JSON.parse(savedOrder);
            orderData = { ...orderData, ...parsedOrder };
            console.log('저장된 주문 데이터를 불러왔습니다.');
            return true;
        }
    } catch (error) {
        console.warn('로컬 스토리지 불러오기 실패:', error);
    }
    return false;
}

/* ==========================================
   오류 처리 함수
   ========================================== */
function handleError(error, context) {
    console.error(`❌ 오류 발생 [${context}]:`, error);
    showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
}

/* ==========================================
   전역 이벤트 리스너 설정
   ========================================== */
// 페이지 언로드 시 데이터 저장
window.addEventListener('beforeunload', () => {
    saveOrderToStorage();
});

// 전역 오류 핸들러
window.addEventListener('error', (e) => {
    handleError(e.error, 'Global error');
});

window.addEventListener('unhandledrejection', (e) => {
    handleError(e.reason, 'Unhandled promise rejection');
});

/* ==========================================
   페이지 완전 로드 후 추가 초기화
   ========================================== */
window.addEventListener('load', () => {
    // 추가 초기화 작업들
    enhanceAccessibility();
    checkBrowserCompatibility();
    monitorNetworkStatus();
    
    // 개발 모드에서만 실행되는 기능들
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 개발 모드로 실행 중입니다.');
    }
    
    console.log('✅ GreenCycle 결제 페이지 로드 완료');
});

/* ==========================================
   주요 함수들을 전역으로 노출 (HTML onclick 이벤트용)
   ========================================== */
window.searchAddress = searchAddress;
window.processPayment = processPayment;
window.toggleAllAgreements = toggleAllAgreements;
window.handlePaymentMethodChange = handlePaymentMethodChange;
window.useAllPoints = useAllPoints;

/* ==========================================
   결제 완료 후 정리 작업
   ========================================== */
function cleanupAfterPayment() {
    // 결제 완료 후 민감한 데이터 정리
    if (orderData.payment && orderData.payment.cardInfo) {
        delete orderData.payment.cardInfo;
    }
    
    // 폼 데이터 초기화
    const sensitiveFields = ['cardNumber', 'cardExpiry', 'cardCvc', 'cardPassword'];
    sensitiveFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = '';
        }
    });
    
    console.log('🧹 민감한 데이터가 정리되었습니다.');
}

console.log('🛒 GreenCycle 결제 페이지 스크립트 로드 완료');