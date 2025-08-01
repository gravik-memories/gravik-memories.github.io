document.addEventListener('DOMContentLoaded', () => {
    // --- Мобильное меню (ФИНАЛЬНАЯ ВЕРСИЯ) ---
    const menuToggle = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.overlay');
    const body = document.body;

    const closeMenu = () => {
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('menu-open');
    };

    if (menuToggle && navMenu && overlay) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            body.classList.toggle('menu-open');
        });

        overlay.addEventListener('click', closeMenu);
    }

    // --- Логика для таймера зворотного відліку ---
    let promotionEndDate;
    const startOrResetTimer = () => {
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
        promotionEndDate = new Date().getTime() + twoDaysInMs;
        localStorage.setItem('promotionEndDate', promotionEndDate);
    };
    const storedEndDate = localStorage.getItem('promotionEndDate');
    if (storedEndDate && new Date().getTime() < parseInt(storedEndDate)) {
        promotionEndDate = parseInt(storedEndDate);
    } else {
        startOrResetTimer();
    }
    const countdownFunction = setInterval(() => {
        const now = new Date().getTime();
        const distance = promotionEndDate - now;
        if (distance < 0) {
            startOrResetTimer();
        }
        const remainingDistance = Math.max(0, distance);
        const days = Math.floor(remainingDistance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingDistance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingDistance % (1000 * 60)) / 1000);
        const format = (num) => num < 10 ? '0' + num : num;
        const daysEl = document.getElementById("days");
        if (daysEl) daysEl.innerText = format(days);
        const hoursEl = document.getElementById("hours");
        if (hoursEl) hoursEl.innerText = format(hours);
        const minutesEl = document.getElementById("minutes");
        if (minutesEl) minutesEl.innerText = format(minutes);
        const secondsEl = document.getElementById("seconds");
        if (secondsEl) secondsEl.innerText = format(seconds);
    }, 1000);

    // --- Плавне прокручування ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                if (navMenu && navMenu.classList.contains('active')) {
                    closeMenu();
                }
            }
        });
    });

    // --- Слайдери в секції "Приклади робіт" ---
    let sliderStates = [];
    const galleryContainers = document.querySelectorAll('.rectangular-gallery .gallery-container');
    galleryContainers.forEach((container, index) => {
        sliderStates.push({
            id: `slider${index + 1}`,
            currentSlide: 0,
            container: container,
            totalSlides: container.children.length,
            intervalId: null
        });
        const prevButton = document.getElementById(`prev${index + 1}`);
        const nextButton = document.getElementById(`next${index + 1}`);
        const startAutoPlay = () => {
            if (sliderStates[index].intervalId) clearInterval(sliderStates[index].intervalId);
            sliderStates[index].intervalId = setInterval(() => moveGallery(index, 1), 10000);
        };
        const moveAndReset = (direction) => {
            moveGallery(index, direction);
            startAutoPlay();
        };
        if (prevButton) prevButton.onclick = () => moveAndReset(-1);
        if (nextButton) nextButton.onclick = () => moveAndReset(1);
        startAutoPlay();
    });

    function moveGallery(sliderIndex, direction) {
        let state = sliderStates[sliderIndex];
        if (!state || state.totalSlides === 0) return;
        state.currentSlide = (state.currentSlide + direction + state.totalSlides) % state.totalSlides;
        state.container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
    }

    // --- КОД МОДАЛЬНОГО ВІКНА (ФИНАЛЬНАЯ ВЕРСИЯ) ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("expandedImg");
    const closeModalButton = document.getElementById("closeModalButton");
    const modalPrevBtn = document.getElementById("modalPrev");
    const modalNextBtn = document.getElementById("modalNext");
    const dotsContainer = document.getElementById('modalDotsContainer');
    let currentModalImages = [];
    let currentImageIndex = 0;

    // Функция открытия модального окна
    function openModal(isGallery, imagesOrSrc, startIndex = 0) {
        if (!modal) return;
        document.body.classList.add('menu-open'); // <-- ДОБАВЛЕНА ЭТА СТРОКА
        modal.style.display = "block";
        currentModalImages = Array.isArray(imagesOrSrc) ? imagesOrSrc : [imagesOrSrc];
        currentImageIndex = startIndex;
        
        // --- НАЧАЛО ИЗМЕНЕНИЙ (ЛОГИКА КЛАССОВ) ---
        const hasMultipleImages = currentModalImages.length > 1;

        if (hasMultipleImages) {
            modalPrevBtn.classList.add('is-visible');
            modalNextBtn.classList.add('is-visible');
        } else {
            modalPrevBtn.classList.remove('is-visible');
            modalNextBtn.classList.remove('is-visible');
        }
        // --- КОНЕЦ ИЗМЕНЕНИЙ ---
        
        dotsContainer.innerHTML = '';
        if (currentModalImages.length > 1) {
            currentModalImages.forEach((_, index) => {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showImage(index);
                });
                dotsContainer.appendChild(dot);
            });
        }
        
        const canNavigate = isGallery && currentModalImages.length > 1;
        if (canNavigate) {
            modal.addEventListener('touchstart', handleTouchStart, { passive: true });
            modal.addEventListener('touchmove', handleTouchMove, { passive: true });
            modal.addEventListener('touchend', handleTouchEnd);
        }
        
        showImage(currentImageIndex);
        document.addEventListener('keydown', handleKeyDown);
        history.pushState({ modalOpen: true }, "");
    }

    // Функция закрытия модального окна
    function closeModalLogic() {
        if (modal && modal.style.display === "block") {
        document.body.classList.remove('menu-open'); // <-- ДОБАВЛЕНА ЭТА СТРОКА
            modal.style.display = "none";
            document.removeEventListener('keydown', handleKeyDown);
            modal.removeEventListener('touchstart', handleTouchStart);
            modal.removeEventListener('touchmove', handleTouchMove);
            modal.removeEventListener('touchend', handleTouchEnd);
            if (dotsContainer) dotsContainer.innerHTML = '';
        }
    }

    if (modal) {
        window.addEventListener('popstate', closeModalLogic);
        closeModalButton.addEventListener('click', () => history.back());
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                history.back();
            }
        });
        modalPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex - 1); });
        modalNextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex + 1); });
    }

    // Функция отображения изображения
    function showImage(index) {
        if (!currentModalImages || currentModalImages.length === 0) return;
        currentImageIndex = (index + currentModalImages.length) % currentModalImages.length;
        modalImg.src = currentModalImages[currentImageIndex];

        const allDots = dotsContainer.querySelectorAll('.dot');
        if (allDots.length > 0) {
            allDots.forEach(dot => dot.classList.remove('active'));
            allDots[currentImageIndex].classList.add('active');
        }
    }
    
    document.querySelectorAll('.tile-gallery-item, .gallery-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const galleryContainer = item.closest('.gallery-container');
            if (galleryContainer) {
                const allItems = Array.from(galleryContainer.children);
                const images = allItems.map(galleryItem => galleryItem.dataset.src || galleryItem.querySelector('img').src);
                const startIndex = allItems.indexOf(item);
                openModal(true, images, startIndex);
            } else {
                const src = item.dataset.src || item.querySelector('img').src;
                openModal(false, src);
            }
        });
    });

    document.querySelectorAll('.product-card .product-image-wrapper').forEach(wrapper => {
        wrapper.addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.product-card');
            const imagesAttr = card.dataset.images;
            if (!imagesAttr) return;
            const images = imagesAttr.split(',').map(s => s.trim());
            if (images.length > 0) {
                openModal(true, images, 0);
            }
        });
    });

    // --- Анімація похитування для блоку "Додатково" ---
    const extrasBlock = document.getElementById('extras');
    if (extrasBlock) {
        const extrasGrid = extrasBlock.querySelector('.extras-grid');
        let swayIntervalId = null;
        const triggerSwayAnimation = () => {
            if (extrasGrid && !extrasGrid.classList.contains('sway-animation')) {
                extrasGrid.classList.add('sway-animation');
                extrasGrid.addEventListener('animationend', () => {
                    extrasGrid.classList.remove('sway-animation');
                }, { once: true });
            }
        };
        const stopSwayingPermanently = () => {
            clearInterval(swayIntervalId);
            extrasGrid.removeEventListener('scroll', stopSwayingPermanently);
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!swayIntervalId) {
                        swayIntervalId = setInterval(triggerSwayAnimation, 3000);
                        extrasGrid.addEventListener('scroll', stopSwayingPermanently, { once: true });
                    }
                } else {
                    clearInterval(swayIntervalId);
                    swayIntervalId = null;
                }
            });
        }, { threshold: 0.5 });
        observer.observe(extrasBlock);
    }

    // --- Функции для управления модальным окном ---
    function handleKeyDown(e) {
        if (!modal || modal.style.display !== 'block') return;
        if (currentModalImages.length <= 1) return;
        if (e.key === "ArrowLeft") showImage(currentImageIndex - 1);
        else if (e.key === "ArrowRight") showImage(currentImageIndex + 1);
        else if (e.key === "Escape") history.back();
    }
    let touchStartX = 0;
    let touchEndX = 0;
    function handleTouchStart(e) { touchStartX = e.touches[0].clientX; }
    function handleTouchMove(e) { touchEndX = e.touches[0].clientX; }
    function handleTouchEnd() {
        if (touchStartX - touchEndX > 50) showImage(currentImageIndex + 1);
        if (touchStartX - touchEndX < -50) showImage(currentImageIndex - 1);
    }

    // --- Логіка для віджета швидкого замовлення ---
    const quickOrderWidget = document.getElementById('quickOrderWidget');
    const orderTrigger = document.getElementById('orderTrigger');
    const closePopup = document.getElementById('closePopup');
    const quickOrderForm = document.getElementById('quickOrderForm');
    const showQuickOrderBtn = document.getElementById('showQuickOrderFormBtn');

    if (quickOrderWidget && orderTrigger && closePopup && quickOrderForm) {
        const openPopup = () => {
            if (!quickOrderWidget.classList.contains('active')) {
                quickOrderWidget.classList.add('active');
                history.pushState({ quickOrderPopupOpen: true }, null, "");
            }
        };
        const closePopupLogic = () => {
            quickOrderWidget.classList.remove('active');
        };
        orderTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            openPopup();
        });
        if (showQuickOrderBtn) {
            showQuickOrderBtn.addEventListener('click', openPopup);
        }
        closePopup.addEventListener('click', () => {
            history.back();
        });
        document.addEventListener('click', (e) => {
            if (quickOrderWidget.classList.contains('active') && !quickOrderWidget.contains(e.target) && e.target !== showQuickOrderBtn) {
                history.back();
            }
        });
        window.addEventListener('popstate', (event) => {
            if (!event.state || (!event.state.modalOpen && !event.state.quickOrderPopupOpen)) {
                    closePopupLogic();
            }
        });
        
        // --- БЕЗОПАСНАЯ ОТПРАВКА ФОРМЫ ЧЕРЕЗ CLOUDFLARE WORKER ---
        quickOrderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const phoneInput = document.getElementById('clientPhone');
            const phone = phoneInput.value;
        
            // !!! ВАЖНО: Замените этот URL на URL вашего Cloudflare Worker'а !!!
            const workerUrl = 'https://telegram-sender.brelok2023.workers.dev/'; 
            const params = { phone: phone };
        
            fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    alert('Дякуємо! Ми скоро з вами зв\'яжемось.');
                    phoneInput.value = '';
                    history.back();
                } else { throw new Error(data.description || 'Неизвестная ошибка'); }
            })
            .catch(error => {
                console.error('Помилка відправки через Worker:', error);
                alert('Виникла помилка. Спробуйте ще раз або зв\'яжіться з нами напряму.');
            });
        });
    }
});

// --- ЛОГІКА ВІДЕОПЛЕЄРА ---
const playerWrapper = document.querySelector('.player-wrapper');

if (playerWrapper) {
    const video = playerWrapper.querySelector('.player');
    const playButton = playerWrapper.querySelector('.toggle-play');
    const volumeSlider = playerWrapper.querySelector('input[name="volume"]');
    const fullscreenButton = playerWrapper.querySelector('.fullscreen');
    const progressBar = playerWrapper.querySelector('.progress');
    const progressFilled = playerWrapper.querySelector('.progress-filled');

    function togglePlay() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updateButton() {
        const icon = video.paused ? '►' : '❚❚';
        playButton.textContent = icon;
    }

    function handleVolumeUpdate() {
        video.volume = this.value;
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            playerWrapper.requestFullscreen().catch(err => {
                alert(`Помилка при переході в повноекранний режим: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    function handleProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progressFilled.style.flexBasis = `${percent}%`;
    }

    function scrub(e) {
        const scrubTime = (e.offsetX / progressBar.offsetWidth) * video.duration;
        video.currentTime = scrubTime;
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updateButton);
    video.addEventListener('pause', updateButton);
    video.addEventListener('timeupdate', handleProgress);

    playButton.addEventListener('click', togglePlay);
    volumeSlider.addEventListener('input', handleVolumeUpdate);
    fullscreenButton.addEventListener('click', toggleFullscreen);

    let mousedown = false;
    progressBar.addEventListener('click', scrub);
    progressBar.addEventListener('mousemove', (e) => mousedown && scrub(e));
    progressBar.addEventListener('mousedown', () => mousedown = true);
    progressBar.addEventListener('mouseup', () => mousedown = false);

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault(); // Запобігаємо прокрутці сторінки
            togglePlay();
        }
    });

    // Пауза при прокручуванні
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && !video.paused) {
                video.pause();
            }
        });
    }, { threshold: 0 });

    observer.observe(playerWrapper);
}
// --- КІНЕЦЬ ЛОГІКИ ВІДЕОПЛЕЄРА ---