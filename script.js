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

    // --- КОД МОДАЛЬНОГО ВІКНА ДЛЯ ИЗОБРАЖЕНИЙ ---
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("expandedImg");
    const closeModalButton = document.getElementById("closeModalButton");
    const modalPrevBtn = document.getElementById("modalPrev");
    const modalNextBtn = document.getElementById("modalNext");
    const dotsContainer = document.getElementById('modalDotsContainer');
    let currentModalImages = [];
    let currentImageIndex = 0;

    function openImageModal(isGallery, imagesOrSrc, startIndex = 0) {
        if (!modal) return;
        body.classList.add('menu-open');
        modal.style.display = "block";
        currentModalImages = Array.isArray(imagesOrSrc) ? imagesOrSrc : [imagesOrSrc];
        currentImageIndex = startIndex;
        
        const hasMultipleImages = currentModalImages.length > 1;
        modalPrevBtn.classList.toggle('is-visible', hasMultipleImages);
        modalNextBtn.classList.toggle('is-visible', hasMultipleImages);
        
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
        
        if (hasMultipleImages) {
            modal.addEventListener('touchstart', handleTouchStart, { passive: true });
            modal.addEventListener('touchmove', handleTouchMove, { passive: true });
            modal.addEventListener('touchend', handleTouchEnd);
        }
        
        showImage(currentImageIndex);
        document.addEventListener('keydown', handleKeyDown);
        history.pushState({ modalOpen: true }, "");
    }

    function closeImageModalLogic() {
        if (modal && modal.style.display === "block") {
            body.classList.remove('menu-open');
            modal.style.display = "none";
            document.removeEventListener('keydown', handleKeyDown);
            modal.removeEventListener('touchstart', handleTouchStart);
            modal.removeEventListener('touchmove', handleTouchMove);
            modal.removeEventListener('touchend', handleTouchEnd);
            if (dotsContainer) dotsContainer.innerHTML = '';
        }
    }

    if (modal) {
        window.addEventListener('popstate', (e) => {
             if (e.state && e.state.modalOpen) {
                 closeImageModalLogic();
             } else if (!e.state) {
                 closeImageModalLogic();
             }
        });
        closeModalButton.addEventListener('click', () => history.back());
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                history.back();
            }
        });
        modalPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex - 1); });
        modalNextBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex + 1); });
    }

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
                openImageModal(true, images, startIndex);
            } else {
                const src = item.dataset.src || item.querySelector('img').src;
                openImageModal(false, src);
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
                openImageModal(true, images, 0);
            }
        });
    });

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
        if (currentModalImages.length <= 1) return;
        if (touchStartX - touchEndX > 50) showImage(currentImageIndex + 1);
        if (touchStartX - touchEndX < -50) showImage(currentImageIndex - 1);
    }
    
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

    // --- Логіка для віджета швидкого замовлення ---
    const quickOrderWidget = document.getElementById('quickOrderWidget');
    if (quickOrderWidget) {
        const orderTrigger = document.getElementById('orderTrigger');
        const closePopup = document.getElementById('closePopup');
        const quickOrderForm = document.getElementById('quickOrderForm');
        const showQuickOrderBtn = document.getElementById('showQuickOrderFormBtn');

        const openPopup = () => {
            if (!quickOrderWidget.classList.contains('active')) {
                quickOrderWidget.classList.add('active');
            }
        };
        const closePopupLogic = () => {
            quickOrderWidget.classList.remove('active');
        };

        if (orderTrigger) orderTrigger.addEventListener('click', (e) => { e.stopPropagation(); openPopup(); });
        if (showQuickOrderBtn) showQuickOrderBtn.addEventListener('click', openPopup);
        if (closePopup) closePopup.addEventListener('click', closePopupLogic);
        
        document.addEventListener('click', (e) => {
            if (quickOrderWidget.classList.contains('active') && !quickOrderWidget.contains(e.target) && e.target !== showQuickOrderBtn) {
                closePopupLogic();
            }
        });
        
        if (quickOrderForm) {
            quickOrderForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const phoneInput = document.getElementById('clientPhone');
                const phone = phoneInput.value;
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
                        closePopupLogic();
                    } else { throw new Error(data.description || 'Неизвестная ошибка'); }
                })
                .catch(error => {
                    console.error('Помилка відправки через Worker:', error);
                    alert('Виникла помилка. Спробуйте ще раз або зв\'яжіться з нами напряму.');
                });
            });
        }
    }
    
    // =======================================================
    // --- ЛОГІКА КОРЗИНИ ---
    // =======================================================
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cartModal');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSummaryEl = document.getElementById('cartSummary');
    const orderForm = document.getElementById('orderForm');
    const successModal = document.getElementById('successModal');
    const cartOrderFormContainer = document.getElementById('cartOrderFormContainer');
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    if (cartIcon && cartModal && closeCartBtn) {
        cartIcon.addEventListener('click', () => {
            cartModal.style.display = 'block';
            body.classList.add('menu-open');
            updateCart();
        });
        const closeCartModal = () => {
            cartModal.style.display = 'none';
            body.classList.remove('menu-open');
        };
        closeCartBtn.addEventListener('click', closeCartModal);
        window.addEventListener('click', (event) => {
            if (event.target == cartModal) {
                closeCartModal();
            }
        });
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseFloat(card.dataset.price),
                image: card.dataset.image,
                quantity: 1
            };
            addToCart(product, button);
        });
    });

    function addToCart(product, button) {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push(product);
        }
    
        if (button) {
            button.innerHTML = '<i class="fas fa-check"></i> Додано!';
            button.classList.add('added');
            button.disabled = true;
            setTimeout(() => {
                button.innerHTML = 'Замовити';
                button.classList.remove('added');
                button.disabled = false;
            }, 2000);
        }
        
        updateCart();
    
        if (cartModal) {
            cartModal.style.display = 'block';
            body.classList.add('menu-open');
        }
    }

    function updateCart() {
        renderCartItems();
        renderCartSummary();
        updateCartIcon();
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function renderCartItems() {
        if (!cartItemsContainer || !cartOrderFormContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-empty-message">Ваша корзина порожня</p>';
            cartOrderFormContainer.style.display = 'none';
            cartSummaryEl.innerHTML = '';
            return;
        }
        cartOrderFormContainer.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">${item.price} грн</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
                    <button class="remove-item-btn" onclick="removeItemFromCart('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }
    
    function renderCartSummary() {
        if (!cartSummaryEl) return;
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cart.length > 0) {
             cartSummaryEl.innerHTML = `<h3>Загальна сума: ${totalPrice.toFixed(2)} грн</h3>`;
        } else {
            cartSummaryEl.innerHTML = '';
        }
    }
    
    function updateCartIcon() {
        if (!cartCountEl) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountEl.textContent = totalItems;
        cartCountEl.classList.toggle('visible', totalItems > 0);
    }
    
    window.changeQuantity = (productId, amount) => {
        const productIndex = cart.findIndex(item => item.id === productId);
        if (productIndex > -1) {
            cart[productIndex].quantity += amount;
            if (cart[productIndex].quantity <= 0) {
                cart.splice(productIndex, 1);
            }
            updateCart();
        }
    };

    window.removeItemFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    };

   if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const clientName = document.getElementById('clientName').value;
        const clientPhone = document.getElementById('clientPhoneCart').value;
        // ПОЛУЧАЕМ ДАННЫЕ ИЗ НОВОГО ПОЛЯ
        const clientViberTelegram = document.getElementById('clientViberTelegram').value;
        
        if (cart.length === 0) {
            alert('Ваша корзина порожня!');
            return;
        }

        const TOKEN = "ВАШ_ТОКЕН_БОТА";
        const CHAT_ID = "ВАШ_ID_ЧАТА";
        
        if (TOKEN === "ВАШ_ТОКЕН_БОТА" || CHAT_ID === "ВАШ_ID_ЧАТА") {
            alert("Помилка: Не налаштовано дані для відправки в Telegram. Зверніться до розробника.");
            return;
        }

        let message = `<b>Нове замовлення з сайту!</b>\n\n`;
        message += `<b>Ім'я:</b> ${clientName}\n`;
        message += `<b>Телефон:</b> ${clientPhone}\n`;
        
        // ДОБАВЛЯЕМ VIBER/TELEGRAM В СООБЩЕНИЕ, ЕСЛИ ПОЛЕ ЗАПОЛНЕНО
        if (clientViberTelegram) {
            message += `<b>Viber/Telegram:</b> ${clientViberTelegram}\n`;
        }

        message += `\n<b>Товари в замовленні:</b>\n`;
        
        let totalPrice = 0;
        cart.forEach(item => {
            message += `— ${item.name} (x${item.quantity}) - ${item.price * item.quantity} грн\n`;
            totalPrice += item.price * item.quantity;
        });
        
        message += `\n<b>Загальна сума: ${totalPrice.toFixed(2)} грн</b>`;

        const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
        const params = { chat_id: CHAT_ID, text: message, parse_mode: 'HTML' };

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                if(successModal) successModal.style.display = 'flex';
                if(cartModal) cartModal.style.display = 'none';
                body.classList.remove('menu-open');
                cart = [];
                updateCart();
                orderForm.reset();
                setTimeout(() => {
                    if(successModal) successModal.style.display = 'none';
                }, 4000);
            } else { throw new Error(data.description); }
        })
        .catch(error => {
            console.error('Помилка відправки в Telegram:', error);
            alert('Виникла помилка при оформленні замовлення.');
        });
    });
}
    updateCart();
});

// --- ЛОГІКА ВІДЕОПЛЕЄРА (ПОЛНАЯ ВЕРСИЯ) ---
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
            e.preventDefault(); 
            togglePlay();
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && !video.paused) {
                video.pause();
            }
        });
    }, { threshold: 0 });

    observer.observe(playerWrapper);
}
// --- КОНЕЦ ЛОГИКИ ВИДЕОПЛЕЕРА ---
