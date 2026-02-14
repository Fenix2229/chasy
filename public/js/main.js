/**
 * Основной JavaScript
 * komandirskie.su
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // Мобильное меню
    // ========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    // Создаем overlay для мобильного меню
    const navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });
    }

    navOverlay.addEventListener('click', function() {
        mobileMenuBtn.classList.remove('active');
        mainNav.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // ========================================
    // Корзина — обновление счетчика
    // ========================================
    function updateCartUI(data) {
        const cartCount = document.getElementById('cart-count');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartCount) {
            const oldCount = parseInt(cartCount.textContent) || 0;
            const newCount = data.cartCount || 0;
            
            cartCount.textContent = newCount;
            cartCount.style.display = newCount > 0 ? 'flex' : 'none';
            
            // Анимация пульса при увеличении
            if (newCount > oldCount) {
                cartCount.classList.remove('cart-count-pulse');
                void cartCount.offsetWidth; // Trigger reflow
                cartCount.classList.add('cart-count-pulse');
            }
        }
        
        if (cartTotal) {
            cartTotal.textContent = (data.cartTotal || 0).toLocaleString('ru-RU') + ' ₽';
        }
    }

    // ========================================
    // Добавление в корзину с анимацией
    // ========================================
    window.addToCart = async function(productId, quantity = 1, buttonElement = null) {
        // Находим кнопку, если не передана
        if (!buttonElement) {
            buttonElement = document.querySelector(`[onclick*="addToCart('${productId}')"]`) ||
                           document.querySelector(`[data-product-id="${productId}"]`);
        }
        
        // Сохраняем оригинальный контент кнопки
        let originalContent = '';
        if (buttonElement) {
            originalContent = buttonElement.innerHTML;
            buttonElement.disabled = true;
            buttonElement.classList.add('btn-loading');
            buttonElement.innerHTML = `
                <svg class="btn-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
                </svg>
            `;
        }
        
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateCartUI(data);
                showNotification('Товар добавлен в корзину', 'cart');
                
                // Анимация успеха на кнопке
                if (buttonElement) {
                    buttonElement.classList.remove('btn-loading');
                    buttonElement.classList.add('btn-success-animate');
                    buttonElement.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>Добавлено!</span>
                    `;
                    
                    setTimeout(() => {
                        buttonElement.disabled = false;
                        buttonElement.classList.remove('btn-success-animate');
                        buttonElement.innerHTML = originalContent;
                    }, 2000);
                }
            } else {
                showNotification(data.message || 'Ошибка добавления', 'error');
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('btn-loading');
                    buttonElement.innerHTML = originalContent;
                }
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Ошибка соединения', 'error');
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.classList.remove('btn-loading');
                buttonElement.innerHTML = originalContent;
            }
            return null;
        }
    };

    // ========================================
    // Обновление количества в корзине
    // ========================================
    window.updateCartItem = async function(productId, quantity) {
        try {
            const response = await fetch('/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateCartUI(data);
            } else {
                showNotification(data.message || 'Ошибка обновления', 'error');
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    };

    // ========================================
    // Удаление из корзины
    // ========================================
    window.removeFromCart = async function(productId) {
        try {
            const response = await fetch('/api/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                updateCartUI(data);
                showNotification('Товар удален из корзины', 'success');
            }
            
            return data;
        } catch (error) {
            console.error('Ошибка:', error);
            return null;
        }
    };

    // ========================================
    // Toast-уведомления (Premium Design)
    // ========================================
    
    // Создаем контейнер для toast-уведомлений
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Иконки для разных типов уведомлений
    const toastIcons = {
        success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
        cart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`
    };

    window.showNotification = function(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = toastIcons[type] || toastIcons.info;
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
            </div>
            <button class="toast-close" aria-label="Закрыть">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div class="toast-progress"></div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Запускаем анимацию появления
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Анимация прогресс-бара
        const progressBar = toast.querySelector('.toast-progress');
        progressBar.style.animationDuration = `${duration}ms`;
        
        // Функция закрытия
        const closeToast = () => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        };
        
        // Закрытие по клику на кнопку
        toast.querySelector('.toast-close').addEventListener('click', closeToast);
        
        // Пауза при наведении
        let timeoutId = setTimeout(closeToast, duration);
        
        toast.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            progressBar.style.animationPlayState = 'paused';
        });
        
        toast.addEventListener('mouseleave', () => {
            const remaining = parseFloat(getComputedStyle(progressBar).width) / 
                              parseFloat(getComputedStyle(toast).width) * duration;
            timeoutId = setTimeout(closeToast, remaining || 1000);
            progressBar.style.animationPlayState = 'running';
        });
        
        return toast;
    };
    
    // Специальные функции для разных типов уведомлений
    window.toast = {
        success: (msg, duration) => showNotification(msg, 'success', duration),
        error: (msg, duration) => showNotification(msg, 'error', duration),
        warning: (msg, duration) => showNotification(msg, 'warning', duration),
        info: (msg, duration) => showNotification(msg, 'info', duration),
        cart: (msg, duration) => showNotification(msg, 'cart', duration || 3000)
    };

    // ========================================
    // Форматирование цены
    // ========================================
    window.formatPrice = function(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    // ========================================
    // Поиск — автокомплит (Premium)
    // ========================================
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput && searchForm) {
        let searchTimeout;
        let autocomplete = null;
        let selectedIndex = -1;
        
        // Создаем контейнер автокомплита
        function createAutocomplete() {
            if (autocomplete) return autocomplete;
            
            autocomplete = document.createElement('div');
            autocomplete.className = 'search-autocomplete';
            autocomplete.innerHTML = `
                <div class="autocomplete-header">Результаты поиска</div>
                <div class="autocomplete-results"></div>
                <div class="autocomplete-footer">
                    <a href="/search">
                        Показать все результаты
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                        </svg>
                    </a>
                </div>
            `;
            
            searchForm.parentElement.appendChild(autocomplete);
            return autocomplete;
        }
        
        // Рендер результатов
        function renderResults(products, query) {
            if (!autocomplete) return;
            
            const results = autocomplete.querySelector('.autocomplete-results');
            const footer = autocomplete.querySelector('.autocomplete-footer a');
            
            if (products.length === 0) {
                results.innerHTML = `
                    <div class="autocomplete-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                        <p>По запросу «${query}» ничего не найдено</p>
                    </div>
                `;
                footer.href = `/search?q=${encodeURIComponent(query)}`;
                return;
            }
            
            // Подсветка совпадений
            const highlightMatch = (text, query) => {
                const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                return text.replace(regex, '<mark>$1</mark>');
            };
            
            results.innerHTML = products.map((product, index) => `
                <a href="/catalog/product/${product.slug}" class="autocomplete-item" data-index="${index}">
                    <div class="autocomplete-image">
                        <img src="${product.image || '/images/no-image.png'}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="autocomplete-info">
                        <div class="autocomplete-name">${highlightMatch(product.name, query)}</div>
                        <div class="autocomplete-category">${product.category || ''}</div>
                    </div>
                    <div class="autocomplete-price">
                        <div class="autocomplete-price-current">${product.price.toLocaleString('ru-RU')} ₽</div>
                        ${product.oldPrice ? `<div class="autocomplete-price-old">${product.oldPrice.toLocaleString('ru-RU')} ₽</div>` : ''}
                    </div>
                </a>
            `).join('');
            
            footer.href = `/search?q=${encodeURIComponent(query)}`;
            selectedIndex = -1;
        }
        
        // Показать загрузку
        function showLoading() {
            if (!autocomplete) createAutocomplete();
            const results = autocomplete.querySelector('.autocomplete-results');
            results.innerHTML = `
                <div class="autocomplete-loading">
                    <div class="autocomplete-spinner"></div>
                </div>
            `;
            autocomplete.classList.add('active');
        }
        
        // Скрыть автокомплит
        function hideAutocomplete() {
            if (autocomplete) {
                autocomplete.classList.remove('active');
            }
            selectedIndex = -1;
        }
        
        // Навигация клавиатурой
        function updateSelection(newIndex) {
            if (!autocomplete) return;
            
            const items = autocomplete.querySelectorAll('.autocomplete-item');
            if (items.length === 0) return;
            
            items.forEach(item => item.classList.remove('selected'));
            
            if (newIndex >= 0 && newIndex < items.length) {
                selectedIndex = newIndex;
                items[selectedIndex].classList.add('selected');
                items[selectedIndex].scrollIntoView({ block: 'nearest' });
            } else {
                selectedIndex = -1;
            }
        }
        
        // Обработчик ввода
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                hideAutocomplete();
                return;
            }
            
            showLoading();
            
            searchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
                    const data = await response.json();
                    
                    if (data.success) {
                        createAutocomplete();
                        renderResults(data.products, query);
                        autocomplete.classList.add('active');
                    }
                } catch (error) {
                    console.error('Ошибка поиска:', error);
                    hideAutocomplete();
                }
            }, 300);
        });
        
        // Фокус
        searchInput.addEventListener('focus', function() {
            if (this.value.trim().length >= 2 && autocomplete) {
                autocomplete.classList.add('active');
            }
        });
        
        // Клавиатурная навигация
        searchInput.addEventListener('keydown', function(e) {
            if (!autocomplete || !autocomplete.classList.contains('active')) return;
            
            const items = autocomplete.querySelectorAll('.autocomplete-item');
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    updateSelection(selectedIndex < items.length - 1 ? selectedIndex + 1 : 0);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    updateSelection(selectedIndex > 0 ? selectedIndex - 1 : items.length - 1);
                    break;
                case 'Enter':
                    if (selectedIndex >= 0 && items[selectedIndex]) {
                        e.preventDefault();
                        window.location.href = items[selectedIndex].href;
                    }
                    break;
                case 'Escape':
                    hideAutocomplete();
                    break;
            }
        });
        
        // Клик вне
        document.addEventListener('click', function(e) {
            if (!searchForm.parentElement.contains(e.target)) {
                hideAutocomplete();
            }
        });
    }

    // ========================================
    // Hero Slider
    // ========================================
    const slider = document.querySelector('.hero-slider');
    if (slider) {
        const track = slider.querySelector('.slider-track');
        const slides = slider.querySelectorAll('.slide');
        const prevBtn = slider.querySelector('.slider-prev');
        const nextBtn = slider.querySelector('.slider-next');
        const dots = slider.querySelectorAll('.slider-dot');
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        let autoSlideInterval;
        
        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Update dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }
        
        function nextSlide() {
            goToSlide(currentSlide + 1);
        }
        
        function prevSlide() {
            goToSlide(currentSlide - 1);
        }
        
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }
        
        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });
        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                goToSlide(index);
                stopAutoSlide();
                startAutoSlide();
            });
        });
        
        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        
        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            startAutoSlide();
        }, { passive: true });
        
        // Initialize
        goToSlide(0);
        startAutoSlide();
    }

    // ========================================
    // Плавный скролл
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // Scroll-анимации (Intersection Observer)
    // ========================================
    const animateOnScroll = () => {
        // Элементы для анимации
        const animatedElements = document.querySelectorAll(`
            .product-card,
            .category-card,
            .feature-card,
            .about-feature,
            .stat-item,
            .timeline-item,
            .contact-card,
            .social-card,
            .delivery-card,
            .payment-card,
            .faq-item,
            .section-header,
            [data-animate]
        `);
        
        if (animatedElements.length === 0) return;
        
        // Добавляем начальные классы
        animatedElements.forEach((el, index) => {
            if (!el.classList.contains('animate-init')) {
                el.classList.add('animate-init');
                el.style.setProperty('--animate-delay', `${(index % 6) * 0.1}s`);
            }
        });
        
        // Создаем observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Наблюдаем за элементами
        animatedElements.forEach(el => observer.observe(el));
    };
    
    // Запускаем после загрузки
    animateOnScroll();
    
    // ========================================
    // Parallax эффект для hero секций
    // ========================================
    const parallaxElements = document.querySelectorAll('.hero, .about-hero, .page-hero');
    
    if (parallaxElements.length > 0) {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    parallaxElements.forEach(el => {
                        const rate = scrolled * 0.3;
                        el.style.setProperty('--parallax-offset', `${rate}px`);
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }
    
    // ========================================
    // Счетчик чисел (анимация)
    // ========================================
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString('ru-RU');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('ru-RU');
            }
        };
        
        updateCounter();
    };
    
    // Анимируем счетчики статистики
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const text = el.textContent.replace(/\s/g, '');
                    const number = parseInt(text);
                    
                    if (!isNaN(number) && !el.classList.contains('counted')) {
                        el.classList.add('counted');
                        animateCounter(el, number);
                    }
                    statsObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(el => statsObserver.observe(el));
    }

});

// ========================================
// Toast CSS Styles (Premium Design)
// ========================================
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    /* Toast Container */
    .toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 10000;
        pointer-events: none;
    }
    
    /* Toast Base */
    .toast {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 320px;
        max-width: 420px;
        padding: 16px 20px;
        background: #fff;
        border-radius: 16px;
        box-shadow: 
            0 10px 40px rgba(15, 23, 42, 0.12),
            0 4px 12px rgba(15, 23, 42, 0.08);
        border: 1px solid rgba(15, 23, 42, 0.06);
        pointer-events: auto;
        position: relative;
        overflow: hidden;
        
        /* Animation */
        opacity: 0;
        transform: translateX(100%) scale(0.9);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
    
    .toast.hide {
        opacity: 0;
        transform: translateX(100%) scale(0.9);
    }
    
    /* Toast Icon */
    .toast-icon {
        width: 44px;
        height: 44px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(15, 23, 42, 0.06) 0%, rgba(15, 23, 42, 0.1) 100%);
    }
    
    .toast-icon svg {
        width: 22px;
        height: 22px;
    }
    
    /* Toast Content */
    .toast-content {
        flex: 1;
        min-width: 0;
    }
    
    .toast-message {
        font-size: 0.9375rem;
        font-weight: 500;
        color: #0f172a;
        line-height: 1.4;
    }
    
    /* Toast Close Button */
    .toast-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        color: #94a3b8;
        border-radius: 8px;
        transition: all 0.2s ease;
    }
    
    .toast-close:hover {
        background: rgba(15, 23, 42, 0.06);
        color: #0f172a;
    }
    
    /* Toast Progress Bar */
    .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        opacity: 0.3;
        animation: toastProgress linear forwards;
        border-radius: 0 3px 0 0;
    }
    
    @keyframes toastProgress {
        from { width: 100%; }
        to { width: 0%; }
    }
    
    /* Toast Types */
    .toast-success {
        border-left: 4px solid #10b981;
    }
    .toast-success .toast-icon {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%);
        color: #10b981;
    }
    .toast-success .toast-progress {
        background: #10b981;
    }
    
    .toast-error {
        border-left: 4px solid #ef4444;
    }
    .toast-error .toast-icon {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%);
        color: #ef4444;
    }
    .toast-error .toast-progress {
        background: #ef4444;
    }
    
    .toast-warning {
        border-left: 4px solid #f59e0b;
    }
    .toast-warning .toast-icon {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.2) 100%);
        color: #f59e0b;
    }
    .toast-warning .toast-progress {
        background: #f59e0b;
    }
    
    .toast-info {
        border-left: 4px solid #3b82f6;
    }
    .toast-info .toast-icon {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%);
        color: #3b82f6;
    }
    .toast-info .toast-progress {
        background: #3b82f6;
    }
    
    .toast-cart {
        border-left: 4px solid #d4a418;
    }
    .toast-cart .toast-icon {
        background: linear-gradient(135deg, rgba(212, 164, 24, 0.1) 0%, rgba(212, 164, 24, 0.2) 100%);
        color: #d4a418;
    }
    .toast-cart .toast-progress {
        background: #d4a418;
    }
    
    /* Scroll Animations */
    .animate-init {
        opacity: 0;
        transform: translateY(30px);
        transition: 
            opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        transition-delay: var(--animate-delay, 0s);
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Different animation types */
    [data-animate="fade-up"].animate-init {
        transform: translateY(40px);
    }
    
    [data-animate="fade-left"].animate-init {
        transform: translateX(-40px);
    }
    
    [data-animate="fade-right"].animate-init {
        transform: translateX(40px);
    }
    
    [data-animate="zoom"].animate-init {
        transform: scale(0.9);
    }
    
    [data-animate="fade-up"].animate-in,
    [data-animate="fade-left"].animate-in,
    [data-animate="fade-right"].animate-in,
    [data-animate="zoom"].animate-in {
        transform: none;
    }
    
    /* Parallax support */
    .hero,
    .about-hero,
    .page-hero {
        --parallax-offset: 0px;
    }
    
    .hero::before,
    .about-hero::before,
    .page-hero::before {
        transform: translateY(var(--parallax-offset));
    }
    
    /* Counter animation */
    .stat-number.counted {
        animation: counterPulse 0.3s ease;
    }
    
    @keyframes counterPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    /* Button Loading & Success Animations */
    .btn-loading {
        position: relative;
        pointer-events: none;
    }
    
    .btn-spinner {
        animation: btnSpin 1s linear infinite;
    }
    
    @keyframes btnSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .btn-success-animate {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        border-color: #10b981 !important;
        pointer-events: none;
    }
    
    .btn-success-animate svg {
        animation: btnCheckmark 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes btnCheckmark {
        0% { 
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
        }
        100% { 
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
        }
    }
    
    /* Header cart icon pulse */
    .cart-count-pulse {
        animation: cartPulse 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes cartPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
    }
    
    /* Mobile responsive */
    @media (max-width: 480px) {
        .toast-container {
            top: auto;
            bottom: 24px;
            left: 16px;
            right: 16px;
        }
        
        .toast {
            min-width: auto;
            max-width: none;
        }
    }
    
    /* Scroll to Top Button */
    .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gradient-primary);
        color: #fff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.25);
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 999;
    }
    
    .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .scroll-to-top:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(15, 23, 42, 0.35);
    }
    
    .scroll-to-top svg {
        width: 24px;
        height: 24px;
    }
    
    @media (max-width: 768px) {
        .scroll-to-top {
            bottom: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
        }
        
        .scroll-to-top svg {
            width: 20px;
            height: 20px;
        }
    }
`;
document.head.appendChild(toastStyles);

// ========================================
// Scroll to Top Button
// ========================================
(function() {
    // Создаем кнопку
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Наверх');
    scrollBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15"/>
        </svg>
    `;
    document.body.appendChild(scrollBtn);
    
    // Показать/скрыть кнопку
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                if (window.pageYOffset > 400) {
                    scrollBtn.classList.add('visible');
                } else {
                    scrollBtn.classList.remove('visible');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Скролл наверх
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
})();
