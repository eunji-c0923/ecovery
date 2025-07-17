// Global variables
let animationObserver;
let isInitialized = false;

// DOM Elements
const header = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    initializeCounters();
    initializeObserver();
    initializeSettings();
    initializeInteractions();
    
    // Start background updates
    setTimeout(() => {
        updateDashboardData();
    }, 2000);
    
    isInitialized = true;
    console.log('🌱 GreenCycle 통합 마이페이지가 초기화되었습니다.');
});

// Header functionality
function initializeHeader() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (hamburger) {
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
    }
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });
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

// Counter animation
function initializeCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-count'));
        animateCounter(counter, target);
    });
}

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

// Intersection Observer for animations
function initializeObserver() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate progress bars
                if (entry.target.classList.contains('chart-fill') || 
                    entry.target.classList.contains('progress-fill')) {
                    const width = entry.target.style.width;
                    entry.target.style.width = '0%';
                    setTimeout(() => {
                        entry.target.style.width = width;
                    }, 300);
                }
                
                // Don't unobserve so elements don't disappear when scrolling back
                // animationObserver.unobserve(entry.target);
            }
            // Remove this else block to prevent elements from disappearing
            // else {
            //     entry.target.classList.remove('visible');
            // }
        });
    }, observerOptions);
    
    // Observe dashboard elements with proper class
    document.querySelectorAll('.unified-card, .quick-btn-unified, .dashboard-section').forEach(el => {
        el.classList.add('animate-on-scroll');
        animationObserver.observe(el);
    });
    
    // Observe progress bars separately
    document.querySelectorAll('.chart-fill, .progress-fill').forEach(el => {
        animationObserver.observe(el);
    });
}

// Settings functionality
function initializeSettings() {
    // Toggle switches
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const settingName = e.target.closest('.setting-item').querySelector('span').textContent;
            console.log(`설정 변경: ${settingName} = ${isChecked}`);
            showNotification(`${settingName} 설정이 ${isChecked ? '활성화' : '비활성화'}되었습니다.`);
        });
    });
    
    // Setting change buttons
    const changeButtons = document.querySelectorAll('.btn-small');
    changeButtons.forEach(btn => {
        if (btn.textContent === '변경') {
            btn.addEventListener('click', () => {
                const settingType = btn.closest('.setting-item').querySelector('label').textContent;
                handleSettingChange(settingType, btn);
            });
        }
    });
}

function handleSettingChange(settingType, button) {
    const input = button.closest('.input-group').querySelector('input');
    const originalText = button.textContent;
    
    button.textContent = '저장 중...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        button.textContent = '완료';
        button.style.background = 'var(--success-color)';
        button.style.color = 'white';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
            button.disabled = false;
        }, 1500);
        
        showNotification(`${settingType} 변경이 완료되었습니다.`);
    }, 1500);
    
    console.log(`설정 변경: ${settingType} = ${input.value}`);
}

// Interactive functionality
function initializeInteractions() {
    // Activity items hover effects
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            showNotification(`"${title}" 상세 정보를 확인합니다.`, 'info');
        });
    });
    
    // Achievement items interactions
    const achievementItems = document.querySelectorAll('.achievement-item');
    achievementItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            if (item.classList.contains('in-progress')) {
                showNotification(`"${title}" 성취를 완료하기 위해 더 노력해보세요!`, 'info');
            } else {
                showNotification(`"${title}" 성취를 달성하셨습니다! 🎉`, 'success');
            }
        });
    });
    
    // Sharing items interactions
    const sharingItems = document.querySelectorAll('.sharing-item');
    sharingItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            showNotification(`"${title}" 나눔 상세 정보를 확인합니다.`, 'info');
        });
    });
    
    // Purchase items interactions
    const purchaseItems = document.querySelectorAll('.purchase-item');
    purchaseItems.forEach(item => {
        item.addEventListener('click', () => {
            const title = item.querySelector('h4').textContent;
            showNotification(`"${title}" 주문 상세 정보를 확인합니다.`, 'info');
        });
    });
    
    // Points items interactions
    const pointsItems = document.querySelectorAll('.points-item');
    pointsItems.forEach(item => {
        item.addEventListener('click', () => {
            const desc = item.querySelector('.points-desc').textContent;
            showNotification(`"${desc}" 포인트 상세 내역을 확인합니다.`, 'info');
        });
    });
    
    // View all links
    const viewAllLinks = document.querySelectorAll('.view-all');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cardTitle = link.closest('.unified-card').querySelector('h3').textContent;
            showNotification(`${cardTitle} 전체 내역 페이지로 이동합니다.`, 'info');
        });
    });
    
    // Period selectors
    const periodSelectors = document.querySelectorAll('.period-selector');
    periodSelectors.forEach(selector => {
        selector.addEventListener('change', (e) => {
            const selectedPeriod = e.target.value;
            showNotification(`기간이 "${selectedPeriod}"으로 변경되었습니다.`, 'info');
            updateChartData(selectedPeriod);
        });
    });
}

// Quick actions
function quickWasteSorting() {
    showNotification('AI 분리배출 페이지로 이동합니다. 📷', 'info');
    console.log('빠른 실행: 분리배출');
    
    // Animate button
    const btn = event.target.closest('.quick-btn-unified');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'translateY(-8px)';
    }, 150);
}

function quickSharing() {
    showNotification('무료나눔 등록 페이지로 이동합니다. 🤝', 'info');
    console.log('빠른 실행: 무료나눔');
    
    const btn = event.target.closest('.quick-btn-unified');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'translateY(-8px)';
    }, 150);
}

function quickMarket() {
    showNotification('친환경 에코마켓으로 이동합니다. 🛒', 'info');
    console.log('빠른 실행: 에코마켓');
    
    const btn = event.target.closest('.quick-btn-unified');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'translateY(-8px)';
    }, 150);
}

function quickCommunity() {
    showNotification('환경독톡 커뮤니티로 이동합니다. 💬', 'info');
    console.log('빠른 실행: 커뮤니티');
    
    const btn = event.target.closest('.quick-btn-unified');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'translateY(-8px)';
    }, 150);
}

function createSharing() {
    showNotification('새 나눔 등록 페이지로 이동합니다. ✨', 'info');
    console.log('새 나눔 등록');
}

function editProfile() {
    showNotification('프로필 편집 기능을 준비 중입니다. ✏️', 'info');
    console.log('프로필 편집');
}

// Data update functions
function updateDashboardData() {
    // Update recent activities
    updateRecentActivities();
    
    // Update stat numbers with animation
    const statNumbers = document.querySelectorAll('.profile-stats .stat-number');
    statNumbers.forEach(stat => {
        const current = parseInt(stat.textContent.replace(/,/g, ''));
        const increment = Math.floor(Math.random() * 5) + 1;
        const newValue = current + increment;
        
        animateCounter(stat, newValue, 1000);
    });
    
    console.log('대시보드 데이터 업데이트 완료');
}

function updateRecentActivities() {
    const activities = [
        {
            icon: 'waste',
            emoji: '⚡',
            title: '유리병 분리배출',
            desc: 'AI 분류 정확도 98.5%',
            time: '방금 전',
            reward: '+12P'
        },
        {
            icon: 'market',
            emoji: '🛒',
            title: '대나무 빗 구매',
            desc: '플라스틱 대신 친환경 소재',
            time: '30분 전',
            reward: '+18P'
        },
        {
            icon: 'sharing',
            emoji: '🤝',
            title: '아이 옷 나눔 매칭',
            desc: '서울 마포구 → 이웃에게',
            time: '1시간 전',
            reward: '+30P'
        }
    ];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const newActivity = createActivityElement(randomActivity);
        
        // Add new activity at the top
        activityList.insertBefore(newActivity, activityList.firstChild);
        
        // Remove old activities (keep only 3)
        while (activityList.children.length > 3) {
            activityList.removeChild(activityList.lastChild);
        }
    }
}

function createActivityElement(activity) {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    activityElement.style.opacity = '0';
    activityElement.style.transform = 'translateX(-20px)';
    
    activityElement.innerHTML = `
        <div class="activity-icon ${activity.icon}">${activity.emoji}</div>
        <div class="activity-content">
            <h4>${activity.title}</h4>
            <p>${activity.desc}</p>
            <span class="activity-time">${activity.time}</span>
        </div>
        <div class="activity-reward">${activity.reward}</div>
    `;
    
    // Add click event
    activityElement.addEventListener('click', () => {
        showNotification(`"${activity.title}" 상세 정보를 확인합니다.`, 'info');
    });
    
    // Animate in and KEEP visible
    setTimeout(() => {
        activityElement.style.opacity = '1';
        activityElement.style.transform = 'translateX(0)';
        activityElement.style.transition = 'all 0.5s ease';
    }, 100);
    
    return activityElement;
}

function updateChartData(period) {
    // Simulate chart data update based on period
    const chartFills = document.querySelectorAll('.chart-fill');
    
    chartFills.forEach((fill, index) => {
        const baseWidths = ['85%', '92%', '78%', '65%'];
        let newWidth;
        
        switch(period) {
            case '지난 달':
                newWidth = parseInt(baseWidths[index]) - 10 + '%';
                break;
            case '지난 3개월':
                newWidth = parseInt(baseWidths[index]) + 5 + '%';
                break;
            default:
                newWidth = baseWidths[index];
        }
        
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = newWidth;
        }, 200);
    });
    
    console.log(`차트 데이터 업데이트: ${period}`);
}

// Notification system
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
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
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification
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
    switch(type) {
        case 'success': return '#2d5a3d';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        case 'info': return '#6fa776';
        default: return '#2d5a3d';
    }
}

// Scroll to section functionality
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

// Achievement system
function checkAchievements() {
    const achievements = [
        {
            id: 'daily-streak',
            name: '매일 실천가',
            condition: () => getUserDailyStreak() >= 7,
            reward: 100
        },
        {
            id: 'waste-master',
            name: '분리배출 마스터',
            condition: () => getUserWasteCount() >= 50,
            reward: 200
        },
        {
            id: 'sharing-hero',
            name: '나눔 영웅',
            condition: () => getUserSharingCount() >= 20,
            reward: 150
        }
    ];
    
    achievements.forEach(achievement => {
        if (achievement.condition() && !hasAchievement(achievement.id)) {
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    addUserAchievement(achievement.id);
    showAchievementNotification(achievement);
    addUserPoints(achievement.reward);
    console.log(`🏆 성취 달성: ${achievement.name}`);
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-popup">
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <h4>성취 달성!</h4>
                <p>${achievement.name}</p>
                <span>+${achievement.reward}P</span>
            </div>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        z-index: 10001;
        transition: all 0.5s ease;
    `;
    
    const popup = notification.querySelector('.achievement-popup');
    popup.style.cssText = `
        background: linear-gradient(135deg, #2d5a3d, #6fa776);
        color: white;
        padding: 30px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        min-width: 250px;
    `;
    
    document.body.appendChild(notification);
    
    // Show popup
    setTimeout(() => {
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
    
    // Hide popup
    setTimeout(() => {
        notification.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// User data helpers (simulate local storage)
function getUserDailyStreak() {
    return parseInt(localStorage.getItem('dailyStreak') || '0');
}

function getUserWasteCount() {
    return parseInt(localStorage.getItem('wasteCount') || '0');
}

function getUserSharingCount() {
    return parseInt(localStorage.getItem('sharingCount') || '0');
}

function hasAchievement(achievementId) {
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    return achievements.includes(achievementId);
}

function addUserAchievement(achievementId) {
    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
    if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        localStorage.setItem('achievements', JSON.stringify(achievements));
    }
}

function addUserPoints(points) {
    const currentPoints = parseInt(localStorage.getItem('userPoints') || '15680');
    const newPoints = currentPoints + points;
    localStorage.setItem('userPoints', newPoints.toString());
    
    // Update display
    const pointsDisplay = document.querySelector('.points-amount');
    if (pointsDisplay) {
        animateCounter(pointsDisplay, newPoints, 1000);
    }
}

// Performance optimization
function optimizePerformance() {
    // Lazy load images
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
    
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateScrollBasedAnimations();
        }, 10);
    });
}

function updateScrollBasedAnimations() {
    // Update header based on scroll position
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Error handling
function handleError(error, context = '') {
    console.error(`Error in ${context}:`, error);
    showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
}

// Background update system
function startBackgroundUpdates() {
    // Update dashboard data every 30 seconds
    setInterval(() => {
        updateDashboardData();
    }, 30000);
    
    // Check achievements every minute
    setInterval(() => {
        checkAchievements();
    }, 60000);
    
    // Update progress bars animation every 2 minutes
    setInterval(() => {
        animateProgressBars();
    }, 120000);
}

function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill, .chart-fill');
    
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

// Environmental tips system
function showEnvironmentalTip() {
    const tips = [
        {
            title: "물 절약 팁",
            content: "양치할 때 컵을 사용하면 하루 6L의 물을 절약할 수 있습니다!",
            icon: "💧"
        },
        {
            title: "에너지 절약",
            content: "사용하지 않는 전자기기 플러그를 뽑으면 전기료 10% 절약 가능!",
            icon: "⚡"
        },
        {
            title: "대중교통 이용",
            content: "자가용 대신 대중교통 이용 시 CO₂ 배출을 70% 줄일 수 있습니다.",
            icon: "🚌"
        },
        {
            title: "일회용품 줄이기",
            content: "텀블러 사용으로 연간 365개의 일회용 컵을 줄일 수 있어요!",
            icon: "♻️"
        },
        {
            title: "친환경 쇼핑",
            content: "장바구니 사용으로 플라스틱 봉투 사용을 줄여보세요!",
            icon: "🛍️"
        }
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    const tipNotification = document.createElement('div');
    tipNotification.className = 'tip-notification';
    tipNotification.innerHTML = `
        <div class="tip-popup">
            <div class="tip-header">
                <span class="tip-icon">${randomTip.icon}</span>
                <h4>${randomTip.title}</h4>
                <button class="tip-close" onclick="this.closest('.tip-notification').remove()">×</button>
            </div>
            <p>${randomTip.content}</p>
        </div>
    `;
    
    tipNotification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 10000;
        transform: translateY(100px);
        transition: transform 0.5s ease;
    `;
    
    const popup = tipNotification.querySelector('.tip-popup');
    popup.style.cssText = `
        background: white;
        border: 2px solid #6fa776;
        border-radius: 12px;
        padding: 20px;
        max-width: 300px;
        box-shadow: 0 8px 32px rgba(45, 90, 61, 0.2);
    `;
    
    const header = popup.querySelector('.tip-header');
    header.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
        position: relative;
    `;
    
    const closeBtn = popup.querySelector('.tip-close');
    closeBtn.style.cssText = `
        position: absolute;
        right: -5px;
        top: -5px;
        background: #6fa776;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(tipNotification);
    
    // Show tip
    setTimeout(() => {
        tipNotification.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto hide after 10 seconds
    setTimeout(() => {
        if (tipNotification.parentNode) {
            tipNotification.style.transform = 'translateY(100px)';
            setTimeout(() => {
                if (tipNotification.parentNode) {
                    tipNotification.parentNode.removeChild(tipNotification);
                }
            }, 500);
        }
    }, 10000);
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only activate when not in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case 'Escape':
                closeMobileMenu();
                // Close any open modals or notifications
                const notifications = document.querySelectorAll('.notification, .tip-notification, .achievement-notification');
                notifications.forEach(notification => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                });
                break;
            case 'h':
                // Scroll to top (Home)
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'r':
                // Refresh dashboard data
                updateDashboardData();
                showNotification('데이터가 새로고침되었습니다.', 'info');
                break;
        }
    });
}

// Responsive layout adjustments
function handleResize() {
    const width = window.innerWidth;
    
    if (width < 768) {
        adjustMobileLayout();
    } else if (width < 1200) {
        adjustTabletLayout();
    } else {
        adjustDesktopLayout();
    }
}

function adjustMobileLayout() {
    // Mobile-specific adjustments
    const quickActions = document.querySelector('.quick-actions-unified');
    if (quickActions) {
        quickActions.style.gridTemplateColumns = '1fr';
    }
    
    const unifiedGrids = document.querySelectorAll('.unified-grid');
    unifiedGrids.forEach(grid => {
        grid.style.gridTemplateColumns = '1fr';
    });
}

function adjustTabletLayout() {
    // Tablet-specific adjustments
    const quickActions = document.querySelector('.quick-actions-unified');
    if (quickActions) {
        quickActions.style.gridTemplateColumns = 'repeat(2, 1fr)';
    }
    
    const unifiedGrids = document.querySelectorAll('.unified-grid');
    unifiedGrids.forEach(grid => {
        grid.style.gridTemplateColumns = '1fr';
    });
}

function adjustDesktopLayout() {
    // Desktop-specific adjustments
    const quickActions = document.querySelector('.quick-actions-unified');
    if (quickActions) {
        quickActions.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
    
    const unifiedGrids = document.querySelectorAll('.unified-grid');
    unifiedGrids.forEach(grid => {
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
    });
}

// Analytics and tracking (simulated)
function trackUserInteraction(action, element) {
    console.log(`📊 User interaction: ${action} on ${element}`);
    
    // Simulate analytics tracking
    const analyticsData = {
        action: action,
        element: element,
        timestamp: new Date().toISOString(),
        page: 'mypage-unified'
    };
    
    // In real app, send to analytics service
    localStorage.setItem('lastInteraction', JSON.stringify(analyticsData));
}

// Accessibility enhancements
function enhanceAccessibility() {
    // Add ARIA labels to interactive elements
    const quickBtns = document.querySelectorAll('.quick-btn-unified');
    quickBtns.forEach((btn, index) => {
        const text = btn.querySelector('span').textContent;
        btn.setAttribute('aria-label', `빠른 실행: ${text}`);
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        
        // Add keyboard support
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
    
    // Add ARIA labels to cards
    const unifiedCards = document.querySelectorAll('.unified-card');
    unifiedCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        card.setAttribute('aria-label', `섹션: ${title}`);
        card.setAttribute('role', 'region');
    });
    
    // Enhance focus management
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Data persistence
function saveUserPreferences() {
    const preferences = {
        notifications: {},
        theme: 'light',
        language: 'ko'
    };
    
    // Save notification preferences
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        const settingName = toggle.closest('.setting-item').querySelector('span').textContent;
        preferences.notifications[settingName] = toggle.checked;
    });
    
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    console.log('사용자 설정이 저장되었습니다.');
}

function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    
    if (preferences.notifications) {
        const toggles = document.querySelectorAll('.toggle input');
        toggles.forEach(toggle => {
            const settingName = toggle.closest('.setting-item').querySelector('span').textContent;
            if (preferences.notifications[settingName] !== undefined) {
                toggle.checked = preferences.notifications[settingName];
            }
        });
    }
    
    console.log('사용자 설정이 로드되었습니다.');
}

// Page lifecycle management
function initializePageLifecycle() {
    // Page visibility change handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, pause updates
            console.log('페이지가 숨겨짐 - 업데이트 일시정지');
        } else {
            // Page is visible, resume updates
            console.log('페이지가 다시 보임 - 업데이트 재개');
            updateDashboardData();
        }
    });
    
    // Before page unload
    window.addEventListener('beforeunload', () => {
        saveUserPreferences();
    });
    
    // Page load complete
    window.addEventListener('load', () => {
        loadUserPreferences();
        enhanceAccessibility();
        
        // Show welcome message
        setTimeout(() => {
            showNotification('GreenCycle 마이페이지에 오신 것을 환영합니다! 🌱', 'success');
        }, 1000);
        
        // Show first environmental tip after 10 seconds
        setTimeout(() => {
            showEnvironmentalTip();
        }, 10000);
    });
}

// Main initialization function
function initializeUnifiedMyPage() {
    try {
        // Core initialization
        initializeHeader();
        initializeCounters();
        initializeObserver();
        initializeSettings();
        initializeInteractions();
        initializeKeyboardShortcuts();
        initializePageLifecycle();
        
        // Performance optimization
        optimizePerformance();
        
        // Start background processes
        startBackgroundUpdates();
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Initial layout adjustment
        handleResize();
        
        // Show environmental tips every 5 minutes
        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance
                showEnvironmentalTip();
            }
        }, 300000);
        
        console.log('🌱 GreenCycle 통합 마이페이지 초기화 완료');
        
    } catch (error) {
        handleError(error, 'Page initialization');
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUnifiedMyPage);
} else {
    initializeUnifiedMyPage();
}

// Global error handler
window.addEventListener('error', (e) => {
    handleError(e.error, 'Global error');
});

// Expose useful functions globally
window.showNotification = showNotification;
window.updateDashboardData = updateDashboardData;
window.quickWasteSorting = quickWasteSorting;
window.quickSharing = quickSharing;
window.quickMarket = quickMarket;
window.quickCommunity = quickCommunity;
window.createSharing = createSharing;
window.editProfile = editProfile;

// Development helpers (remove in production)
if (process?.env?.NODE_ENV === 'development') {
    window.devHelpers = {
        showAllNotifications: () => {
            showNotification('성공 알림입니다!', 'success');
            setTimeout(() => showNotification('정보 알림입니다!', 'info'), 1000);
            setTimeout(() => showNotification('경고 알림입니다!', 'warning'), 2000);
            setTimeout(() => showNotification('오류 알림입니다!', 'error'), 3000);
        },
        triggerAchievement: () => {
            unlockAchievement({
                name: '테스트 성취',
                reward: 100
            });
        },
        showTip: showEnvironmentalTip,
        updateData: updateDashboardData
    };
    
    console.log('🔧 개발자 도구가 활성화되었습니다. window.devHelpers를 확인하세요.');
}