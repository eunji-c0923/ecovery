// Global variables
let currentSection = 'dashboard';
let activityUpdateInterval;
let dashboardUpdateInterval;

// DOM Elements
const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
const contentSections = document.querySelectorAll('.content-section');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize the admin page
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPage();
    startRealTimeUpdates();
    setupEventListeners();
    animateCounters();
    console.log('🌱 GreenCycle 관리자 페이지가 초기화되었습니다.');
});

// Initialize admin page
function initializeAdminPage() {
    // Show dashboard by default
    showSection('dashboard');
    
    // Set active sidebar link
    updateActiveLink('dashboard');
    
    // Add fade-in animation to cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            updateActiveLink(section);
        });
    });
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Modal close events
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Form submissions
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionId;
        
        // Load section-specific data
        loadSectionData(sectionId);
    }
}

// Update active sidebar link
function updateActiveLink(sectionId) {
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Load section-specific data
function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'waste-management':
            loadWasteManagementData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        default:
            console.log(`Loading data for ${sectionId}...`);
    }
}

// Counter animation
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

// Animate all counters
function animateCounters() {
    const counters = document.querySelectorAll('.card-value[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Real-time updates
function startRealTimeUpdates() {
    // Update activities every 10 seconds
    activityUpdateInterval = setInterval(() => {
        updateRecentActivities();
    }, 10000);
    
    // Update dashboard data every 30 seconds
    dashboardUpdateInterval = setInterval(() => {
        updateDashboardData();
    }, 30000);
}

function stopRealTimeUpdates() {
    if (activityUpdateInterval) {
        clearInterval(activityUpdateInterval);
    }
    if (dashboardUpdateInterval) {
        clearInterval(dashboardUpdateInterval);
    }
}

// Update recent activities
function updateRecentActivities() {
    const activitiesTable = document.getElementById('activitiesTable');
    if (!activitiesTable) return;
    
    const newActivities = [
        {
            time: '방금 전',
            user: '최○○',
            activity: '캔 분리배출',
            status: 'active',
            points: '+20P'
        },
        {
            time: '1분 전',
            user: '김○○',
            activity: '무료나눔 완료',
            status: 'active',
            points: '+10P'
        }
    ];
    
    // Add new activity to the top
    const newActivity = newActivities[Math.floor(Math.random() * newActivities.length)];
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${newActivity.time}</td>
        <td>${newActivity.user}</td>
        <td>${newActivity.activity}</td>
        <td><span class="status-badge status-${newActivity.status}">완료</span></td>
        <td>${newActivity.points}</td>
    `;
    
    // Insert at the beginning
    activitiesTable.insertBefore(newRow, activitiesTable.firstChild);
    
    // Add animation
    newRow.style.opacity = '0';
    newRow.style.backgroundColor = 'rgba(45, 90, 61, 0.1)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.5s ease';
        newRow.style.opacity = '1';
        setTimeout(() => {
            newRow.style.backgroundColor = 'transparent';
        }, 2000);
    }, 100);
    
    // Remove old rows (keep only 6)
    while (activitiesTable.children.length > 6) {
        activitiesTable.removeChild(activitiesTable.lastChild);
    }
}

// Update dashboard data
function updateDashboardData() {
    const cardValues = document.querySelectorAll('.card-value[data-count]');
    cardValues.forEach(card => {
        const currentValue = parseInt(card.getAttribute('data-count'));
        const change = Math.floor(Math.random() * 20) - 10; // -10 to +10
        const newValue = Math.max(0, currentValue + change);
        
        card.setAttribute('data-count', newValue);
        
        // Animate to new value
        animateCounter(card, newValue, 1000);
        
        // Update change indicator
        const changeElement = card.parentElement.querySelector('.card-change');
        if (changeElement && change !== 0) {
            const isPositive = change > 0;
            changeElement.className = `card-change ${isPositive ? 'positive' : 'negative'}`;
            changeElement.innerHTML = `
                <span>${isPositive ? '↗️' : '↘️'}</span>
                <span>${isPositive ? '+' : ''}${change} 실시간</span>
            `;
        }
    });
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        closeModal(modal.id);
    });
}

// Form handlers
function handleAddUser(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const userData = {
        name: formData.get('name') || e.target.querySelector('input[type="text"]').value,
        email: formData.get('email') || e.target.querySelector('input[type="email"]').value,
        points: formData.get('points') || e.target.querySelector('input[type="number"]').value,
        status: formData.get('status') || e.target.querySelector('select').value
    };
    
    // Simulate API call
    showNotification('새 사용자가 추가되었습니다.', 'success');
    closeModal('addUserModal');
    
    // Add to users table if on users page
    if (currentSection === 'users') {
        addUserToTable(userData);
    }
    
    console.log('User added:', userData);
}

function addUserToTable(userData) {
    const usersTable = document.querySelector('#users table tbody');
    if (usersTable) {
        const newRow = document.createElement('tr');
        const userId = String(usersTable.children.length + 1).padStart(3, '0');
        const currentDate = new Date().toISOString().split('T')[0];
        
        newRow.innerHTML = `
            <td>${userId}</td>
            <td>${userData.name}</td>
            <td>${userData.email}</td>
            <td>${currentDate}</td>
            <td><span class="status-badge status-${userData.status}">${userData.status === 'active' ? '활성' : '비활성'}</span></td>
            <td>${userData.points}P</td>
            <td>
                <button class="btn btn-secondary btn-sm">수정</button>
                <button class="btn btn-danger btn-sm">삭제</button>
            </td>
        `;
        
        usersTable.appendChild(newRow);
        
        // Animate new row
        newRow.style.opacity = '0';
        newRow.style.backgroundColor = 'rgba(45, 90, 61, 0.1)';
        setTimeout(() => {
            newRow.style.transition = 'all 0.5s ease';
            newRow.style.opacity = '1';
            setTimeout(() => {
                newRow.style.backgroundColor = 'transparent';
            }, 2000);
        }, 100);
    }
}

// Data loading functions
function loadDashboardData() {
    console.log('📊 대시보드 데이터 로딩...');
    // Simulate data loading
    setTimeout(() => {
        console.log('✅ 대시보드 데이터 로딩 완료');
    }, 500);
}

function loadUsersData() {
    console.log('👥 사용자 데이터 로딩...');
    // Simulate data loading
    setTimeout(() => {
        console.log('✅ 사용자 데이터 로딩 완료');
    }, 500);
}

function loadWasteManagementData() {
    console.log('♻️ 폐기물 관리 데이터 로딩...');
    // Simulate data loading
    setTimeout(() => {
        console.log('✅ 폐기물 관리 데이터 로딩 완료');
    }, 500);
}

function loadAnalyticsData() {
    console.log('📈 분석 데이터 로딩...');
    // Simulate data loading
    setTimeout(() => {
        console.log('✅ 분석 데이터 로딩 완료');
    }, 500);
}

// Utility functions
function refreshActivities() {
    showNotification('활동 목록을 새로고침했습니다.', 'info');
    updateRecentActivities();
}

function logout() {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
        showNotification('로그아웃되었습니다.', 'info');
        stopRealTimeUpdates();
        
        // Simulate logout redirect
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 10001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
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
    switch(type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        case 'info': return '#17a2b8';
        default: return '#28a745';
    }
}

// Chart animation
function animateChartBars() {
    const chartBars = document.querySelectorAll('.chart-bar');
    chartBars.forEach((bar, index) => {
        const height = bar.style.height;
        bar.style.height = '0%';
        setTimeout(() => {
            bar.style.transition = 'height 0.8s ease-out';
            bar.style.height = height;
        }, index * 100);
    });
}

// Performance monitoring
function trackPagePerformance() {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
                
                if (loadTime > 0) {
                    console.log(`⚡ 관리자 페이지 로드 시간: ${loadTime}ms`);
                    
                    if (loadTime < 1000) {
                        setTimeout(() => {
                            showNotification('관리자 페이지가 빠르게 로드되었습니다!', 'success');
                        }, 2000);
                    }
                }
            }
        }, 1000);
    });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + number keys for quick navigation
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
            e.preventDefault();
            const sectionIndex = parseInt(e.key) - 1;
            const sections = ['dashboard', 'users', 'waste-management', 'sharing', 'marketplace', 'community', 'analytics', 'content', 'settings'];
            
            if (sections[sectionIndex]) {
                showSection(sections[sectionIndex]);
                updateActiveLink(sections[sectionIndex]);
            }
        }
        
        // Ctrl/Cmd + R for refresh current section data
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshCurrentSection();
        }
        
        // Ctrl/Cmd + N for new user (when on users page)
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && currentSection === 'users') {
            e.preventDefault();
            openModal('addUserModal');
        }
    });
}

function refreshCurrentSection() {
    loadSectionData(currentSection);
    showNotification(`${getSectionTitle(currentSection)} 데이터를 새로고침했습니다.`, 'info');
}

function getSectionTitle(sectionId) {
    const titles = {
        'dashboard': '대시보드',
        'users': '사용자 관리',
        'waste-management': '폐기물 관리',
        'sharing': '무료나눔 관리',
        'marketplace': '마켓플레이스 관리',
        'community': '커뮤니티 관리',
        'analytics': '분석 및 리포트',
        'content': '콘텐츠 관리',
        'settings': '시스템 설정'
    };
    return titles[sectionId] || sectionId;
}

// Enhanced table interactions
function setupTableInteractions() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        // Add sorting functionality
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                sortTable(table, index);
            });
        });
        
        // Add row selection
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.addEventListener('click', function(e) {
                if (!e.target.closest('button')) {
                    row.classList.toggle('selected');
                }
            });
        });
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const isNumeric = rows.every(row => {
        const cell = row.cells[columnIndex];
        if (!cell) return false;
        const text = cell.textContent.replace(/[^\d.-]/g, '');
        return !isNaN(text) && text !== '';
    });
    
    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex];
        const bCell = b.cells[columnIndex];
        if (!aCell || !bCell) return 0;
        
        const aText = aCell.textContent.trim();
        const bText = bCell.textContent.trim();
        
        if (isNumeric) {
            return parseFloat(aText.replace(/[^\d.-]/g, '')) - parseFloat(bText.replace(/[^\d.-]/g, ''));
        } else {
            return aText.localeCompare(bText);
        }
    });
    
    rows.forEach(row => tbody.appendChild(row));
    showNotification('테이블이 정렬되었습니다.', 'info');
}

// Search and filter functions
function searchUsers(query) {
    const rows = document.querySelectorAll('#users table tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query.toLowerCase())) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterByStatus(status) {
    const rows = document.querySelectorAll('#users table tbody tr');
    
    rows.forEach(row => {
        const statusCell = row.querySelector('.status-badge');
        if (status === 'all' || (statusCell && statusCell.textContent.includes(status))) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Export functions
function exportUsers() {
    const users = [];
    const rows = document.querySelectorAll('#users table tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
            users.push({
                id: cells[0].textContent,
                name: cells[1].textContent,
                email: cells[2].textContent,
                joinDate: cells[3].textContent,
                status: cells[4].textContent,
                points: cells[5].textContent
            });
        }
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,이름,이메일,가입일,상태,포인트\n"
        + users.map(user => `${user.id},${user.name},${user.email},${user.joinDate},${user.status},${user.points}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('사용자 데이터를 내보냈습니다.', 'success');
}

// Initialize additional features
function initializeAdditionalFeatures() {
    setupKeyboardShortcuts();
    trackPagePerformance();
    setupTableInteractions();
    
    // Animate chart bars when dashboard is visible
    setTimeout(() => {
        if (currentSection === 'dashboard') {
            animateChartBars();
        }
    }, 1000);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Page error:', e.error);
    showNotification('오류가 발생했습니다. 페이지를 새로고침해 주세요.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showNotification('네트워크 오류가 발생했습니다.', 'error');
});

// Page visibility handling
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopRealTimeUpdates();
        console.log('⏸️ 실시간 업데이트 일시정지');
    } else {
        startRealTimeUpdates();
        console.log('▶️ 실시간 업데이트 재시작');
    }
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPage();
    startRealTimeUpdates();
    setupEventListeners();
    animateCounters();
    initializeAdditionalFeatures();
    
    console.log('🚀 GreenCycle 관리자 시스템 초기화 완료');
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopRealTimeUpdates();
});

// Export global functions for HTML onclick events
window.openModal = openModal;
window.closeModal = closeModal;
window.refreshActivities = refreshActivities;
window.logout = logout;
window.exportUsers = exportUsers;
window.showSection = showSection;