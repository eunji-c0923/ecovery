// Global variables
let currentSlide = 0;
let totalSlides = 4;
let slideInterval;
let activityInterval;
let resizeTimeout;

// DOM Elements
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Screen size detection
function getScreenSize() {
    const width = window.innerWidth;
    if (width >= 1600) return 'ultra-wide';
    if (width >= 1400) return 'extra-large';
    if (width >= 1200) return 'large';
    if (width >= 768) return 'tablet';
    return 'mobile';
}

// Header scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Animate hamburger
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
});

// Close mobile menu when clicking on a link
function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
}

// Smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = header.offsetHeight;
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Navigation link smooth scrolling
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            scrollToSection(href.substring(1));
            closeMobileMenu();
        }
    });
});

// Enhanced Services Slider Functions
function updateSliderForScreenSize() {
    const screenSize = getScreenSize();
    const slidesWrapper = document.getElementById('slidesWrapper');
    
    // Adjust slider behavior based on screen size
    switch (screenSize) {
        case 'ultra-wide':
        case 'extra-large':
            // Large screens can show 2 slides at once if desired
            totalSlides = 4; // Keep original for now
            if (slidesWrapper) {
                slidesWrapper.style.width = '400%';
            }
            break;
        default:
            totalSlides = 4;
            if (slidesWrapper) {
                slidesWrapper.style.width = '400%';
            }
    }
    
    // Reset slide position if out of bounds
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    showSlide(currentSlide);
}

function showSlide(slideIndex) {
    const slidesWrapper = document.getElementById('slidesWrapper');
    if (slidesWrapper) {
        const translateX = -slideIndex * 25; // 각 슬라이드는 25%씩 이동
        slidesWrapper.style.transform = `translateX(${translateX}%)`;
    }
    currentSlide = slideIndex;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

function startAutoSlide() {
    slideInterval = setInterval(nextSlide, 3000); // 3초마다 자동 슬라이드
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// Initialize slider
function initializeSlider() {
    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    let isDragging = false;
    
    const sliderContainer = document.querySelector('.services-slider');
    const slidesWrapper = document.getElementById('slidesWrapper');
    
    if (sliderContainer && slidesWrapper) {
        // Mouse events
        sliderContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            sliderContainer.style.cursor = 'grabbing';
            slidesWrapper.style.transition = 'none';
        });
        
        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const currentX = e.clientX;
            const diff = startX - currentX;
            const currentTransform = -currentSlide * 25;
            const newTransform = currentTransform - (diff / sliderContainer.offsetWidth) * 25;
            
            slidesWrapper.style.transform = `translateX(${newTransform}%)`;
        });
        
        sliderContainer.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            sliderContainer.style.cursor = 'grab';
            slidesWrapper.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.320, 1)';
            
            endX = e.clientX;
            handleSwipe();
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                sliderContainer.style.cursor = 'grab';
                slidesWrapper.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.320, 1)';
                showSlide(currentSlide); // Return to current slide
            }
        });
        
        // Touch events
        sliderContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            slidesWrapper.style.transition = 'none';
        });
        
        sliderContainer.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            const diff = startX - currentX;
            const currentTransform = -currentSlide * 25;
            const newTransform = currentTransform - (diff / sliderContainer.offsetWidth) * 25;
            
            slidesWrapper.style.transform = `translateX(${newTransform}%)`;
        });
        
        sliderContainer.addEventListener('touchend', (e) => {
            slidesWrapper.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.320, 1)';
            endX = e.changedTouches[0].clientX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                stopAutoSlide();
                if (diff > 0) {
                    nextSlide(); // Swipe left - next slide
                } else {
                    prevSlide(); // Swipe right - previous slide
                }
                startAutoSlide();
            } else {
                // Return to current slide if swipe wasn't strong enough
                showSlide(currentSlide);
            }
        }
        
        // Set initial cursor
        sliderContainer.style.cursor = 'grab';
    }
    
    // Start auto-slide
    startAutoSlide();
    
    // Pause auto-slide on hover
    const sliderSection = document.querySelector('.services-slider-container');
    if (sliderSection) {
        sliderSection.addEventListener('mouseenter', stopAutoSlide);
        sliderSection.addEventListener('mouseleave', startAutoSlide);
    }
}

// Enhanced Counter animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (target - start) * easeOutQuart;
        
        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Enhanced Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            
            // Trigger counter animation for stats
            if (entry.target.classList.contains('stats')) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseFloat(stat.getAttribute('data-count'));
                    animateCounter(stat, target);
                });
            }
            
            // Animate story cards
            if (entry.target.classList.contains('story-card')) {
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
            }
            
            // Animate certification items
            if (entry.target.classList.contains('cert-item')) {
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.opacity = '1';
            }
        }
    });
}, observerOptions);

// Form validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateNickname(nickname) {
    return nickname.length >= 2 && nickname.length <= 20;
}

// Enhanced Notification system
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Impact Dashboard Functions
function initializeImpactDashboard() {
    // Animate impact numbers
    const impactNumbers = document.querySelectorAll('.impact-number');
    
    const impactObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target, 2000);
                impactObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    impactNumbers.forEach(number => {
        impactObserver.observe(number);
    });
    
    // Animate progress bars
    setTimeout(() => {
        animateProgressBars();
    }, 1000);
    
    // Animate chart bars
    setTimeout(() => {
        animateChartBars();
    }, 1500);
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        }, index * 200);
    });
}

function animateChartBars() {
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0%';
        setTimeout(() => {
            bar.style.height = height;
        }, index * 300);
    });
}

// Activity Feed Functions
function initializeActivityFeed() {
    startActivityFeed();
}

function startActivityFeed() {
    // Simulate real-time activity updates
    activityInterval = setInterval(() => {
        addNewActivity();
    }, 8000); // New activity every 8 seconds
}

function stopActivityFeed() {
    if (activityInterval) {
        clearInterval(activityInterval);
    }
}

function addNewActivity() {
    const activities = [
        {
            icon: 'waste',
            text: '<strong>이○○님</strong>이 캔을 정확히 분리배출했습니다',
            reward: '+15P 적립',
            type: 'reward'
        },
        {
            icon: 'sharing',
            text: '<strong>부산 해운대구</strong>에서 아이 장난감 무료나눔이 시작되었습니다',
            location: '📍 좌동',
            type: 'location'
        },
        {
            icon: 'market',
            text: '<strong>정○○님</strong>이 대나무 칫솔을 구매하여 <strong>2kg CO₂</strong>를 절약했습니다',
            impact: '🌱 환경 기여도 +20P',
            type: 'impact'
        },
        {
            icon: 'community',
            text: '<strong>환경독톡</strong>에 "일회용품 줄이기 실천법" 새 글이 등록되었습니다',
            engagement: '👍 8개 좋아요',
            type: 'engagement'
        },
        {
            icon: 'achievement',
            text: '<strong>한○○님</strong>이 "분리배출 마스터" 배지를 획득했습니다',
            badge: '🎖️ 100회 연속 정확 분류',
            type: 'badge'
        }
    ];
    
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.style.opacity = '0';
    
    let extraContent = '';
    if (randomActivity.reward) extraContent = `<span class="activity-reward">${randomActivity.reward}</span>`;
    if (randomActivity.location) extraContent = `<span class="activity-location">${randomActivity.location}</span>`;
    if (randomActivity.impact) extraContent = `<span class="activity-impact">${randomActivity.impact}</span>`;
    if (randomActivity.engagement) extraContent = `<span class="activity-engagement">${randomActivity.engagement}</span>`;
    if (randomActivity.badge) extraContent = `<span class="activity-badge">${randomActivity.badge}</span>`;
    
    activityItem.innerHTML = `
        <div class="activity-time">방금 전</div>
        <div class="activity-content">
            <div class="activity-icon ${randomActivity.icon}">
                ${randomActivity.icon === 'waste' ? '⚡' : 
                  randomActivity.icon === 'sharing' ? '🤝' :
                  randomActivity.icon === 'market' ? '🛒' :
                  randomActivity.icon === 'community' ? '💬' : '🏆'}
            </div>
            <div class="activity-text">
                ${randomActivity.text}
                ${extraContent}
            </div>
        </div>
    `;
    
    // Insert at the beginning
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Animate in
    setTimeout(() => {
        activityItem.style.opacity = '1';
    }, 100);
    
    // Update existing timestamps
    const timeElements = activityList.querySelectorAll('.activity-time');
    timeElements.forEach((element, index) => {
        if (index === 0) return; // Skip the new one
        
        const currentText = element.textContent;
        if (currentText === '방금 전') {
            element.textContent = '2분 전';
        } else if (currentText.includes('분 전')) {
            const minutes = parseInt(currentText) + 2;
            element.textContent = `${minutes}분 전`;
        }
    });
    
    // Remove old activities (keep only 6)
    while (activityList.children.length > 6) {
        activityList.removeChild(activityList.lastChild);
    }
    
    // Update mini stats
    updateMiniStats();
}

function updateMiniStats() {
    const statNumbers = document.querySelectorAll('.stat-mini .stat-number');
    statNumbers.forEach(stat => {
        const current = parseInt(stat.textContent.replace(',', ''));
        const increment = Math.floor(Math.random() * 5) + 1;
        const newValue = current + increment;
        stat.textContent = newValue.toLocaleString();
    });
}

// Enhanced Service Previews Functions
function initializeServicePreviews() {
    // Large demo button interactions
    const largeDemoBtns = document.querySelectorAll('.demo-btn-large');
    largeDemoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const originalText = btn.textContent;
            btn.textContent = '분석 중...';
            btn.disabled = true;
            btn.style.background = 'linear-gradient(135deg, #6c757d, #495057)';
            
            // Add loading animation
            btn.style.position = 'relative';
            btn.innerHTML = '분석 중... <span class="loading-dots">●●●</span>';
            
            // Animate loading dots
            const loadingDots = btn.querySelector('.loading-dots');
            if (loadingDots) {
                let dotCount = 0;
                const loadingInterval = setInterval(() => {
                    dotCount = (dotCount + 1) % 4;
                    loadingDots.textContent = '●'.repeat(dotCount);
                }, 300);
                
                setTimeout(() => {
                    clearInterval(loadingInterval);
                    showNotification('AI 분석이 완료되었습니다! 🤖', 'success');
                    btn.textContent = '다시 체험하기';
                    btn.disabled = false;
                    btn.style.background = 'linear-gradient(135deg, var(--primary-green), var(--accent-green))';
                    
                    // Animate result appearance
                    const resultSection = document.querySelector('.demo-result-large');
                    if (resultSection) {
                        resultSection.style.transform = 'scale(0.95)';
                        resultSection.style.opacity = '0.7';
                        setTimeout(() => {
                            resultSection.style.transform = 'scale(1)';
                            resultSection.style.opacity = '1';
                            resultSection.style.transition = 'all 0.5s ease';
                        }, 100);
                    }
                }, 2500);
            }
        });
    });
    
    // Regular demo button interactions (for backward compatibility)
    const demoBtns = document.querySelectorAll('.demo-btn');
    demoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = '분석 중...';
            btn.disabled = true;
            
            setTimeout(() => {
                showNotification('AI 분석이 완료되었습니다! 🤖', 'success');
                btn.textContent = '다시 체험하기';
                btn.disabled = false;
            }, 2000);
        });
    });
    
    // Preview more buttons
    const previewBtns = document.querySelectorAll('.preview-more');
    previewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent;
            showNotification(`${text} 페이지로 이동합니다!`, 'info');
            
            // Add click animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Enhanced sharing item interactions
    const sharingItems = document.querySelectorAll('.sharing-item');
    sharingItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            showNotification(`"${title}" 상세 정보를 확인합니다.`, 'info');
            
            // Add selection effect
            item.style.background = 'rgba(45, 90, 61, 0.1)';
            item.style.borderRadius = '8px';
            setTimeout(() => {
                item.style.background = '';
                item.style.borderRadius = '';
            }, 200);
        });
        
        // Add hover effect for better UX
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(5px)';
            item.style.transition = 'transform 0.2s ease';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0)';
        });
    });
    
    // Enhanced product item interactions
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            showNotification(`"${title}" 장바구니에 추가되었습니다! 🛒`, 'success');
            
            // Add cart animation effect
            item.style.transform = 'scale(0.95)';
            item.style.boxShadow = '0 0 20px rgba(45, 90, 61, 0.3)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
                item.style.boxShadow = '';
            }, 200);
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-3px)';
            item.style.transition = 'transform 0.2s ease';
            item.style.boxShadow = '0 4px 15px rgba(45, 90, 61, 0.2)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = '';
        });
    });
    
    // Enhanced post item interactions
    const postItems = document.querySelectorAll('.post-item');
    postItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            showNotification(`"${title}" 게시글을 읽습니다.`, 'info');
            
            // Add reading effect
            item.style.opacity = '0.7';
            setTimeout(() => {
                item.style.opacity = '1';
            }, 150);
        });
        
        // Add hover effect
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('hot')) {
                item.style.background = 'rgba(45, 90, 61, 0.05)';
                item.style.borderRadius = '8px';
                item.style.transform = 'translateX(3px)';
                item.style.transition = 'all 0.2s ease';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('hot')) {
                item.style.background = '';
                item.style.borderRadius = '';
                item.style.transform = 'translateX(0)';
            }
        });
    });
    
    // Upload zone drag and drop functionality
    const uploadZones = document.querySelectorAll('.upload-zone-large, .upload-zone');
    uploadZones.forEach(zone => {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop zone when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        zone.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight(e) {
            zone.style.borderColor = 'var(--primary-green)';
            zone.style.background = 'rgba(45, 90, 61, 0.1)';
        }
        
        function unhighlight(e) {
            zone.style.borderColor = 'var(--accent-green)';
            zone.style.background = 'rgba(111, 167, 118, 0.05)';
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    showNotification(`이미지 "${file.name}"이 업로드되었습니다! 분석을 시작합니다...`, 'info');
                    
                    // Simulate processing
                    setTimeout(() => {
                        showNotification('AI 분석이 완료되었습니다! 🤖', 'success');
                    }, 2000);
                } else {
                    showNotification('이미지 파일만 업로드 가능합니다.', 'error');
                }
            }
        }
    });
    
    // Add intersection observer for animations
    const serviceObserver = new IntersectionObserver((entries) => {
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
    
    // Observe service preview elements
    document.querySelectorAll('.ai-demo-large, .other-services-row .preview-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        serviceObserver.observe(card);
    });
}

// Enhanced loading animation styles
const loadingStyles = `
.loading-dots {
    display: inline-block;
    font-size: 12px;
    margin-left: 5px;
    animation: loadingPulse 1.5s infinite;
}

@keyframes loadingPulse {
    0%, 20% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
}
`;

// Inject loading styles
if (!document.querySelector('#loading-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'loading-styles';
    styleSheet.textContent = loadingStyles;
    document.head.appendChild(styleSheet);
}
// Enhanced viewport and layout management
function handleViewportChange() {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    
    // CSS 변수로 뷰포트 크기 전달
    document.documentElement.style.setProperty('--vw', `${vw}px`);
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // 화면 크기별 클래스 추가/제거
    const screenSize = getScreenSize();
    document.body.className = document.body.className.replace(/screen-\w+/g, '');
    document.body.classList.add(`screen-${screenSize}`);
    
    // 컨테이너 변수 업데이트
    if (vw >= 1600) {
        document.documentElement.style.setProperty('--container-max-width', '1600px');
        document.documentElement.style.setProperty('--container-padding', '40px');
    } else if (vw >= 1200) {
        document.documentElement.style.setProperty('--container-max-width', '1400px');
        document.documentElement.style.setProperty('--container-padding', '30px');
    } else {
        document.documentElement.style.setProperty('--container-max-width', '1200px');
        document.documentElement.style.setProperty('--container-padding', '20px');
    }
}

// Enhanced window resize handler
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        handleViewportChange();
        updateSliderForScreenSize();
        adjustGridLayouts();
        
        // 큰 화면에서 애니메이션 다시 트리거
        if (window.innerWidth >= 1200) {
            triggerLargeScreenAnimations();
        }
    }, 250);
});

// Grid layout dynamic adjustment
function adjustGridLayouts() {
    const screenSize = getScreenSize();
    
    // Impact grid 조정
    const impactGrid = document.querySelector('.impact-grid');
    if (impactGrid) {
        switch (screenSize) {
            case 'ultra-wide':
            case 'extra-large':
                impactGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                impactGrid.style.gap = '50px';
                break;
            case 'large':
                impactGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                impactGrid.style.gap = '40px';
                break;
            default:
                impactGrid.style.gridTemplateColumns = '';
                impactGrid.style.gap = '';
        }
    }
    
    // Preview grid 조정
    const previewGrid = document.querySelector('.preview-grid');
    if (previewGrid) {
        switch (screenSize) {
            case 'ultra-wide':
                previewGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                break;
            case 'extra-large':
            case 'large':
                previewGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                break;
            default:
                previewGrid.style.gridTemplateColumns = '';
        }
    }
}

// Large screen animations
function triggerLargeScreenAnimations() {
    // Impact cards 재애니메이션
    const impactCards = document.querySelectorAll('.impact-card');
    impactCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.opacity = '1';
        }, index * 100);
    });
    
    // Chart bars 재애니메이션
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0%';
        setTimeout(() => {
            bar.style.height = height;
        }, 500 + (index * 200));
    });
}

// Environmental data simulation
function updateEnvironmentalData() {
    // Update air quality randomly
    const aqiNumber = document.querySelector('.aqi-number');
    if (aqiNumber) {
        const currentAqi = parseInt(aqiNumber.textContent);
        const newAqi = Math.max(20, Math.min(80, currentAqi + (Math.random() - 0.5) * 10));
        aqiNumber.textContent = Math.round(newAqi);
        
        // Update grade based on AQI
        const aqiGrade = document.querySelector('.aqi-grade');
        if (newAqi <= 50) {
            aqiGrade.textContent = '좋음';
            aqiGrade.parentElement.className = 'aqi-value good';
        } else if (newAqi <= 100) {
            aqiGrade.textContent = '보통';
            aqiGrade.parentElement.className = 'aqi-value moderate';
        }
    }
}

// Add active state to navigation based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200 && scrollY < sectionTop + sectionHeight - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// Enhanced scroll to top functionality
function createScrollToTopButton() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-green);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(45, 90, 61, 0.3);
    `;
    
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(scrollButton);
    
    // Show/hide scroll button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollButton.style.opacity = '1';
            scrollButton.style.visibility = 'visible';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.visibility = 'hidden';
        }
    });
}

// Enhanced hover effects
function addHoverEffects() {
    // Impact cards hover effect
    const impactCards = document.querySelectorAll('.impact-card');
    impactCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 1200) {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Activity items hover effect
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 1200) {
                item.style.backgroundColor = 'rgba(45, 90, 61, 0.05)';
                item.style.borderRadius = '8px';
                item.style.transform = 'translateX(5px)';
            }
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
            item.style.transform = 'translateX(0)';
        });
    });
}

// Environmental updates
function startEnvironmentalUpdates() {
    // Update environmental data every 30 seconds
    setInterval(() => {
        updateEnvironmentalData();
    }, 30000);
}

// Performance monitoring
function trackPerformance() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
            
            if (loadTime > 0) {
                console.log(`🚀 페이지 로드 시간: ${loadTime}ms`);
                
                // Show performance notification for very fast loads
                if (loadTime < 1000) {
                    setTimeout(() => {
                        showNotification('페이지가 빠르게 로드되었습니다! ⚡', 'success');
                    }, 2000);
                }
            }
        }, 1000);
    });
}

// Initialize page functionality
function initializePage() {
    // Initialize viewport and responsive features
    handleViewportChange();
    updateSliderForScreenSize();
    adjustGridLayouts();
    
    // Initialize core components
    initializeSlider();
    initializeImpactDashboard();
    initializeActivityFeed();
    initializeServicePreviews();
    
    // Create additional features
    createScrollToTopButton();
    addHoverEffects();
    
    // Start background processes
    startEnvironmentalUpdates();
    
    // Observe elements for animation
    document.querySelectorAll('.stats, .hero-content, .impact-card, .story-card, .cert-item').forEach(el => {
        observer.observe(el);
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
        
        // Slider keyboard navigation
        if (e.key === 'ArrowLeft') {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        } else if (e.key === 'ArrowRight') {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        }
    });
    
    // Handle page visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoSlide();
            stopActivityFeed();
        } else {
            startAutoSlide();
            startActivityFeed();
        }
    });
    
    // Add resize listener
    window.addEventListener('resize', handleViewportChange);
    
    console.log('🌱 GreenCycle 스마트 환경 플랫폼이 초기화되었습니다.');
    console.log(`📱 현재 화면 크기: ${getScreenSize()}`);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    trackPerformance();
    
    // Add loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
    
    // Add initial CSS for story cards and cert items
    const storyCards = document.querySelectorAll('.story-card');
    const certItems = document.querySelectorAll('.cert-item');
    
    storyCards.forEach(card => {
        card.style.transform = 'translateY(30px)';
        card.style.opacity = '0';
        card.style.transition = 'all 0.6s ease';
    });
    
    certItems.forEach(item => {
        item.style.transform = 'translateY(30px)';
        item.style.opacity = '0';
        item.style.transition = 'all 0.6s ease';
    });
    
    console.log('🎯 실시간 데이터 업데이트가 시작되었습니다.');
});

// Page load completion
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.innerWidth >= 1200) {
            triggerLargeScreenAnimations();
        }
        
        // Performance optimization
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                console.log('💚 GreenCycle 대형 화면 최적화 완료');
            });
        }
    }, 1000);
});

// Error handling
window.addEventListener('error', (e) => {
    console.warn('페이지 오류:', e.error);
});

// Export functions for global access
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;

// Hero Background Slider
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentSlide = 0;
        this.slideInterval = null;
        this.isPlaying = true;
        
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) return;
        
        // 첫 번째 슬라이드 활성화
        this.showSlide(0);
        
        // 인디케이터 이벤트 리스너
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // 자동 재생 시작
        this.startAutoPlay();
        
        // 페이지 가시성 변경 감지
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
        
        // 윈도우 포커스/블러 이벤트
        window.addEventListener('focus', () => {
            if (this.isPlaying) {
                this.startAutoPlay();
            }
        });
        
        window.addEventListener('blur', () => {
            this.pauseAutoPlay();
        });
        
        // 마우스 호버 시 일시정지 (선택사항)
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                this.pauseAutoPlay();
            });
            
            heroSection.addEventListener('mouseleave', () => {
                if (this.isPlaying) {
                    this.startAutoPlay();
                }
            });
        }
        
        console.log('🎬 Hero slider initialized with', this.slides.length, 'slides');
    }
    
    showSlide(index) {
        // 모든 슬라이드 비활성화
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // 모든 인디케이터 비활성화
        this.indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // 해당 슬라이드와 인디케이터 활성화
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }
        
        this.currentSlide = index;
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.showSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
            // 수동 전환 시 자동재생 잠시 중단 후 재시작
            this.pauseAutoPlay();
            setTimeout(() => {
                if (this.isPlaying) {
                    this.startAutoPlay();
                }
            }, 5000); // 5초 후 자동재생 재시작
        }
    }
    
    startAutoPlay() {
        this.pauseAutoPlay(); // 기존 인터벌 정리
        
        if (this.slides.length > 1) {
            this.slideInterval = setInterval(() => {
                this.nextSlide();
            }, 3000); // 3초마다 전환
        }
    }
    
    pauseAutoPlay() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }
    
    play() {
        this.isPlaying = true;
        this.startAutoPlay();
    }
    
    pause() {
        this.isPlaying = false;
        this.pauseAutoPlay();
    }
    
    // 키보드 컨트롤 (선택사항)
    handleKeyboard(event) {
        switch(event.key) {
            case 'ArrowLeft':
                this.prevSlide();
                break;
            case 'ArrowRight':
                this.nextSlide();
                break;
            case ' ': // 스페이스바
                event.preventDefault();
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }
                break;
        }
    }
}

// 이미지 사전 로딩 함수
function preloadHeroImages() {
    const imageUrls = [
        'images/hero-bg-1.jpg',
        'images/hero-bg-2.jpg',
        'images/hero-bg-3.jpg'
    ];
    
    const imagePromises = imageUrls.map(url => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log(`✅ Loaded: ${url}`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`❌ Failed to load: ${url}`);
                resolve(null); // 실패해도 계속 진행
            };
            img.src = url;
        });
    });
    
    Promise.all(imagePromises).then(images => {
        const loadedCount = images.filter(img => img !== null).length;
        console.log(`🖼️ Preloaded ${loadedCount}/${imageUrls.length} hero images`);
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 이미지 사전 로딩
    preloadHeroImages();
    
    // 슬라이더 초기화 (약간의 지연을 두어 DOM이 완전히 로드되도록)
    setTimeout(() => {
        window.heroSlider = new HeroSlider();
        
        // 키보드 이벤트 리스너 추가 (선택사항)
        document.addEventListener('keydown', (event) => {
            // 입력 필드에 포커스가 있을 때는 키보드 컨트롤 비활성화
            if (document.activeElement.tagName === 'INPUT' || 
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }
            window.heroSlider.handleKeyboard(event);
        });
        
    }, 100);
});

// 윈도우 리사이즈 시 슬라이더 재조정 (선택사항)
window.addEventListener('resize', function() {
    // 필요시 슬라이더 크기 재조정 로직 추가
    console.log('🔄 Window resized, hero slider adjusted');
});

// 성능 최적화: Intersection Observer로 히어로 섹션이 보일 때만 슬라이더 실행
function initIntersectionObserver() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (window.heroSlider) {
                if (entry.isIntersecting) {
                    window.heroSlider.play();
                } else {
                    window.heroSlider.pause();
                }
            }
        });
    }, {
        threshold: 0.1 // 10% 보일 때 트리거
    });
    
    observer.observe(heroSection);
}

// Intersection Observer 초기화
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initIntersectionObserver, 200);
});

// 에러 처리
window.addEventListener('error', function(event) {
    if (event.target.tagName === 'IMG') {
        console.warn('Hero image failed to load:', event.target.src);
        // 대체 이미지나 기본 배경으로 설정
        event.target.style.backgroundColor = 'var(--primary-green)';
    }
});

// 개발자 도구에서 슬라이더 제어를 위한 전역 함수들
window.heroSliderControls = {
    next: () => window.heroSlider?.nextSlide(),
    prev: () => window.heroSlider?.prevSlide(),
    goTo: (index) => window.heroSlider?.goToSlide(index),
    play: () => window.heroSlider?.play(),
    pause: () => window.heroSlider?.pause()
};

// 성능 모니터링 (개발 환경에서만)
if (process?.env?.NODE_ENV === 'development') {
    // 슬라이더 성능 측정
    let slideTransitionStart = 0;
    
    document.addEventListener('DOMContentLoaded', function() {
        const heroSlides = document.querySelectorAll('.hero-slide');
        
        heroSlides.forEach(slide => {
            slide.addEventListener('transitionstart', () => {
                slideTransitionStart = performance.now();
            });
            
            slide.addEventListener('transitionend', () => {
                const duration = performance.now() - slideTransitionStart;
                if (duration > 16) { // 60fps 기준
                    console.warn(`⚠️ Slow transition detected: ${duration.toFixed(2)}ms`);
                }
            });
        });
    });
}