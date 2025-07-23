/* ========================================
   GreenCycle JavaScript - 메인 페이지 인터랙션
   ======================================== */

/* ========================================
   전역 변수 및 초기 설정
   ======================================== */

// 현재 활성화된 서비스 슬라이드 인덱스
let currentSlide = 0;
const totalSlides = 4; // 총 서비스 슬라이드 개수

// 히어로 배경 슬라이더 관련 변수
let heroSlideIndex = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const totalHeroSlides = heroSlides.length;

// 애니메이션 카운터 변수들
let statsAnimated = false;
let impactAnimated = false;

/* ========================================
   DOM 요소 초기화 및 이벤트 리스너 등록
   ======================================== */

// DOM이 로드되면 초기화 함수 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌱 GreenCycle 메인 페이지가 로드되었습니다.');
    
    // 각종 기능 초기화
    initializeNavigation();           // 네비게이션 기능
    initializeHeroSlider();          // 히어로 배경 슬라이더
    initializeServicesSlider();      // 서비스 슬라이더
    initializeScrollAnimations();    // 스크롤 애니메이션
    initializeInteractions();        // 기타 인터랙션
    
    console.log('✅ 모든 기능이 초기화되었습니다.');
});

/* ========================================
   네비게이션 기능
   ======================================== */

/**
 * 네비게이션 관련 기능 초기화
 */
function initializeNavigation() {
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // 스크롤 시 헤더 스타일 변경
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // 햄버거 메뉴 토글 (모바일)
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // 햄버거 아이콘 애니메이션
            const spans = hamburger.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });
    }
    
    // 네비게이션 링크 클릭 시 스무스 스크롤
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            
            // 모바일에서 메뉴 닫기
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                // 햄버거 아이콘 리셋
                const spans = hamburger.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            }
        });
    });
    
    console.log('📱 네비게이션 기능이 초기화되었습니다.');
}

/* ========================================
   히어로 배경 슬라이더
   ======================================== */

/**
 * 히어로 섹션 배경 이미지 슬라이더 초기화
 */
function initializeHeroSlider() {
    if (heroSlides.length === 0) return;
    
    // 첫 번째 슬라이드 활성화
    heroSlides[0].classList.add('active');
    
    // 5초마다 슬라이드 변경
    setInterval(() => {
        // 현재 활성화된 슬라이드 비활성화
        heroSlides[heroSlideIndex].classList.remove('active');
        
        // 다음 슬라이드로 이동
        heroSlideIndex = (heroSlideIndex + 1) % totalHeroSlides;
        
        // 새 슬라이드 활성화
        heroSlides[heroSlideIndex].classList.add('active');
    }, 5000);
    
    console.log('🎭 히어로 배경 슬라이더가 시작되었습니다.');
}

/* ========================================
   서비스 슬라이더 기능
   ======================================== */

/**
 * 서비스 슬라이더 초기화 및 자동 재생
 */
function initializeServicesSlider() {
    const slidesWrapper = document.getElementById('slidesWrapper');
    const slider = document.getElementById('servicesSlider');
    
    if (!slidesWrapper || !slider) return;
    
    // 슬라이드 이동 함수
    function moveToSlide(index) {
        const translateX = -(index * 25); // 각 슬라이드는 25% 폭
        slidesWrapper.style.transform = `translateX(${translateX}%)`;
        currentSlide = index;
    }
    
    // 다음 슬라이드로 이동
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        moveToSlide(nextIndex);
    }
    
    // 이전 슬라이드로 이동
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        moveToSlide(prevIndex);
    }
    
    // 자동 재생 (7초마다)
    let autoPlayInterval = setInterval(nextSlide, 7000);
    
    // 마우스 호버 시 자동 재생 일시 정지
    slider.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });
    
    // 마우스가 벗어나면 자동 재생 재개
    slider.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(nextSlide, 7000);
    });
    
    // 터치/드래그 기능 (모바일 지원)
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    slider.addEventListener('touchstart', handleTouchStart, { passive: true });
    slider.addEventListener('touchmove', handleTouchMove, { passive: true });
    slider.addEventListener('touchend', handleTouchEnd);
    
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mouseleave', handleMouseUp);
    
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        clearInterval(autoPlayInterval);
    }
    
    function handleMouseDown(e) {
        startX = e.clientX;
        isDragging = true;
        clearInterval(autoPlayInterval);
        e.preventDefault();
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        currentX = e.clientX;
        e.preventDefault();
    }
    
    function handleTouchEnd() {
        handleDragEnd();
    }
    
    function handleMouseUp() {
        handleDragEnd();
    }
    
    function handleDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const diffX = startX - currentX;
        const threshold = 50; // 최소 드래그 거리
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                nextSlide(); // 오른쪽으로 드래그 = 다음 슬라이드
            } else {
                prevSlide(); // 왼쪽으로 드래그 = 이전 슬라이드
            }
        }
        
        // 자동 재생 재개
        autoPlayInterval = setInterval(nextSlide, 7000);
    }
    
    // 키보드 네비게이션 지원
    slider.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextSlide();
        }
    });
    
    // 슬라이더에 포커스 가능하도록 설정 (접근성)
    slider.setAttribute('tabindex', '0');
    
    console.log('🎠 서비스 슬라이더가 초기화되었습니다.');
}

/* ========================================
   스크롤 애니메이션 기능
   ======================================== */

/**
 * 스크롤 기반 애니메이션 초기화
 */
function initializeScrollAnimations() {
    // Intersection Observer 설정
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // 특정 섹션별 애니메이션 트리거
                if (entry.target.classList.contains('stats') && !statsAnimated) {
                    animateStats();
                    statsAnimated = true;
                }
                
                if (entry.target.classList.contains('impact-dashboard') && !impactAnimated) {
                    animateImpactNumbers();
                    impactAnimated = true;
                }
            }
        });
    }, observerOptions);
    
    // 관찰할 요소들 등록
    const animateElements = document.querySelectorAll('.section-header, .stats, .impact-dashboard, .activity-feed, .service-previews, .success-stories');
    animateElements.forEach(element => {
        observer.observe(element);
    });
    
    console.log('🎬 스크롤 애니메이션이 설정되었습니다.');
}

/**
 * 통계 숫자 카운팅 애니메이션
 */
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    statNumbers.forEach(statNumber => {
        const target = parseInt(statNumber.getAttribute('data-count'));
        const duration = 2000; // 2초
        const step = target / (duration / 16); // 60fps 기준
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // 숫자에 따라 포맷팅
            if (target >= 1000) {
                statNumber.textContent = Math.floor(current).toLocaleString();
            } else {
                statNumber.textContent = current.toFixed(1);
            }
        }, 16);
    });
    
    console.log('📊 통계 애니메이션이 시작되었습니다.');
}

/**
 * 임팩트 숫자 카운팅 애니메이션
 */
function animateImpactNumbers() {
    const impactNumbers = document.querySelectorAll('.impact-number[data-count]');
    
    impactNumbers.forEach(impactNumber => {
        const target = parseInt(impactNumber.getAttribute('data-count'));
        const duration = 2500; // 2.5초
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            impactNumber.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
    
    // 차트 바 애니메이션
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.opacity = '1';
            bar.style.transform = 'scaleY(1)';
        }, index * 200);
    });
    
    console.log('📈 임팩트 애니메이션이 시작되었습니다.');
}

/* ========================================
   기타 인터랙션 기능
   ======================================== */

/**
 * 기타 페이지 인터랙션 초기화
 */
function initializeInteractions() {
    // 카드 호버 효과 개선
    const cards = document.querySelectorAll('.impact-card, .story-card, .preview-card, .info-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 버튼 클릭 효과
    const buttons = document.querySelectorAll('.btn, .demo-btn-large, .preview-more');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 리플 효과
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // 이미지 레이지 로딩
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // 팝업 또는 모달 관련 기능
    initializeModals();
    
    console.log('🎯 기타 인터랙션이 초기화되었습니다.');
}

/**
 * 모달 관련 기능 초기화
 */
function initializeModals() {
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // 모달 외부 클릭으로 닫기
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
}

/**
 * 모든 모달 닫기
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal, .modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('active');
    });
}

/* ========================================
   유틸리티 함수들
   ======================================== */

/**
 * 특정 섹션으로 스크롤
 * @param {string} sectionId - 이동할 섹션의 ID
 */
function scrollToSection(sectionId) {
    const targetElement = document.getElementById(sectionId);
    const header = document.getElementById('header');
    
    if (targetElement && header) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * 알림 메시지 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 ('info', 'success', 'warning', 'error')
 * @param {number} duration - 표시 시간 (ms, 기본값: 3000)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 스타일 설정
    const colors = {
        'error': '#dc3545',
        'warning': '#ffc107',
        'success': '#28a745',
        'info': '#17a2b8'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
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
    
    // DOM에 추가
    document.body.appendChild(notification);
    
    // 슬라이드 인 애니메이션
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

/**
 * 숫자에 천 단위 콤마 추가
 * @param {number} num - 포맷팅할 숫자
 * @returns {string} - 포맷팅된 문자열
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 디바운스 함수 - 연속된 함수 호출을 제한
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} - 디바운스된 함수
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 쓰로틀 함수 - 함수 호출 빈도를 제한
 * @param {Function} func - 실행할 함수
 * @param {number} delay - 지연 시간 (ms)
 * @returns {Function} - 쓰로틀된 함수
 */
function throttle(func, delay) {
    let lastCall = 0;
    return function (...args) {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return func.apply(this, args);
        }
    };
}

/* ========================================
   성능 최적화 및 접근성
   ======================================== */

/**
 * 이미지 지연 로딩 초기화
 */
function initializeLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.remove('lazy');
                    imageObserver.unobserve(image);
                }
            });
        });
        
        lazyImages.forEach(image => imageObserver.observe(image));
    } else {
        // IntersectionObserver를 지원하지 않는 브라우저의 경우
        lazyImages.forEach(image => {
            image.src = image.dataset.src;
        });
    }
}

/**
 * 키보드 접근성 개선
 */
function improveKeyboardAccessibility() {
    // 포커스 가능한 요소들에 포커스 표시 개선
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-green)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
    
    // Skip to content 링크 추가 (스크린 리더 사용자를 위해)
    const skipLink = document.createElement('a');
    skipLink.href = '#mainContent';
    skipLink.textContent = '메인 콘텐츠로 건너뛰기';
    skipLink.className = 'skip-link sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-green);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10001;
        border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

/* ========================================
   브라우저 호환성 체크
   ======================================== */

/**
 * 브라우저 지원 기능 체크
 */
function checkBrowserSupport() {
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        webp: false,
        animations: 'animate' in document.createElement('div')
    };
    
    // WebP 지원 체크
    const webpTest = new Image();
    webpTest.onload = webpTest.onerror = function () {
        features.webp = (webpTest.height === 2);
        
        if (!features.webp) {
            // WebP를 지원하지 않는 경우 JPG/PNG로 폴백
            console.log('⚠️ WebP를 지원하지 않는 브라우저입니다. JPG/PNG를 사용합니다.');
        }
    };
    webpTest.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    
    // 구형 브라우저 경고
    if (!features.intersectionObserver) {
        console.log('⚠️ 구형 브라우저 감지. 일부 기능이 제한될 수 있습니다.');
        showNotification('브라우저 업데이트를 권장합니다.', 'warning', 5000);
    }
    
    return features;
}

/* ========================================
   에러 처리 및 디버깅
   ======================================== */

/**
 * 전역 에러 핸들러 설정
 */
function setupErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('🚨 JavaScript 에러 발생:', e.error);
        
        // 프로덕션 환경에서는 에러 로깅 서비스에 전송
        if (window.location.hostname !== 'localhost') {
            // 에러 로깅 로직
            console.log('에러가 로깅 서버로 전송됩니다.');
        }
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('🚨 처리되지 않은 Promise 거부:', e.reason);
        e.preventDefault();
    });
}

/* ========================================
   전역 함수 노출 (HTML에서 호출 가능)
   ======================================== */

// HTML에서 직접 호출할 수 있도록 전역 스코프에 함수 노출
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;

/* ========================================
   개발자 도구 (개발 환경에서만)
   ======================================== */

// 개발 환경에서만 디버깅 도구 제공
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.GreenCycleDebug = {
        // 강제로 특정 슬라이드로 이동
        goToSlide: (index) => {
            if (index >= 0 && index < totalSlides) {
                const slidesWrapper = document.getElementById('slidesWrapper');
                if (slidesWrapper) {
                    const translateX = -(index * 25);
                    slidesWrapper.style.transform = `translateX(${translateX}%)`;
                    currentSlide = index;
                    console.log(`슬라이드 ${index}로 이동했습니다.`);
                }
            }
        },
        
        // 통계 애니메이션 강제 실행
        triggerStats: () => {
            animateStats();
            console.log('통계 애니메이션을 강제 실행했습니다.');
        },
        
        // 임팩트 애니메이션 강제 실행
        triggerImpact: () => {
            animateImpactNumbers();
            console.log('임팩트 애니메이션을 강제 실행했습니다.');
        },
        
        // 현재 상태 정보
        getStatus: () => {
            return {
                currentSlide,
                heroSlideIndex,
                statsAnimated,
                impactAnimated,
                totalSlides,
                totalHeroSlides
            };
        }
    };
    
    console.log('🛠️ 개발자 도구가 활성화되었습니다. window.GreenCycleDebug로 접근하세요.');
}

/* ========================================
   초기화 완료 및 브라우저 지원 체크
   ======================================== */

// 모든 기능 로드 완료 후 실행
window.addEventListener('load', function() {
    // 브라우저 지원 기능 체크
    const browserSupport = checkBrowserSupport();
    
    // 에러 처리 설정
    setupErrorHandling();
    
    // 접근성 개선
    improveKeyboardAccessibility();
    
    // 지연 로딩 초기화
    initializeLazyLoading();
    
    // 로딩 완료 메시지
    console.log('🎉 GreenCycle 메인 페이지가 완전히 로드되었습니다!');
    console.log('📊 브라우저 지원 정보:', browserSupport);
    
    // 성능 측정 (개발 환경에서만)
    if (window.location.hostname === 'localhost') {
        if (performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log(`⚡ 페이지 로딩 시간: ${loadTime}ms`);
        }
    }
});

/* ========================================
   페이지 언로드 시 정리
   ======================================== */

// 페이지를 떠날 때 리소스 정리
window.addEventListener('beforeunload', function() {
    // 타이머 정리
    clearInterval(window.heroSliderInterval);
    clearInterval(window.serviceSliderInterval);
    
    console.log('🧹 리소스가 정리되었습니다.');
});

/* ========================================
   모듈 패턴으로 네임스페이스 보호
   ======================================== */

// 즉시 실행 함수로 전역 네임스페이스 오염 방지
(function() {
    'use strict';
    
    // 전역 변수 최소화
    const GreenCycle = {
        version: '1.0.0',
        initialized: false,
        
        init: function() {
            if (this.initialized) {
                console.warn('GreenCycle이 이미 초기화되었습니다.');
                return;
            }
            
            this.initialized = true;
            console.log(`🌱 GreenCycle v${this.version} 초기화 완료`);
        }
    };
    
    // 전역 객체로 노출 (필요한 경우에만)
    window.GreenCycle = GreenCycle;
    
})();

// CSS 커스텀 속성 동적 변경 함수 (테마 변경 등에 사용)
function updateCSSCustomProperty(property, value) {
    document.documentElement.style.setProperty(`--${property}`, value);
}

// 다크 모드 토글 함수 (향후 기능 확장용)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    console.log(`🌙 다크 모드: ${isDark ? 'ON' : 'OFF'}`);
}

// 로컬 저장소에서 다크 모드 설정 복원
function restoreDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

console.log('📄 GreenCycle JavaScript 모듈이 로드되었습니다.');