/**
 * Café Goldstück Berlin - Gallery & Lightbox
 * Interactive image gallery with keyboard navigation
 */

document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentImageIndex = 0;
    const images = Array.from(galleryItems);

    // ============================================
    // OPEN LIGHTBOX
    // ============================================

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            currentImageIndex = index;
            openLightbox(this);
        });

        // Keyboard accessibility - Enter or Space to open
        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                currentImageIndex = index;
                openLightbox(this);
            }
        });

        // Make gallery items focusable
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', 'Bild vergrößern');
    });

    function openLightbox(item) {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');

        if (img && lightbox && lightboxImg) {
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;

            if (caption && lightboxCaption) {
                lightboxCaption.textContent = caption.textContent;
            }

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling

            // Focus management
            lightboxClose.focus();
        }
    }

    // ============================================
    // CLOSE LIGHTBOX
    // ============================================

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling

            // Return focus to the gallery item
            if (images[currentImageIndex]) {
                images[currentImageIndex].focus();
            }
        }
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Close when clicking outside image
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // ============================================
    // NAVIGATION
    // ============================================

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        updateLightboxImage();
    }

    function showPreviousImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    function updateLightboxImage() {
        const item = images[currentImageIndex];
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');

        if (img && lightboxImg) {
            // Fade out
            lightboxImg.style.opacity = '0';

            setTimeout(() => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;

                if (caption && lightboxCaption) {
                    lightboxCaption.textContent = caption.textContent;
                }

                // Fade in
                lightboxImg.style.opacity = '1';
            }, 150);
        }
    }

    // Add transition for smooth image changes
    if (lightboxImg) {
        lightboxImg.style.transition = 'opacity 0.3s ease';
    }

    // ============================================
    // BUTTON CONTROLS
    // ============================================

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            showNextImage();
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            showPreviousImage();
        });
    }

    // ============================================
    // KEYBOARD CONTROLS
    // ============================================

    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) {
            return;
        }

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showNextImage();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                showPreviousImage();
                break;
        }
    });

    // ============================================
    // TOUCH GESTURES (MOBILE)
    // ============================================

    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - show next
                showNextImage();
            } else {
                // Swipe right - show previous
                showPreviousImage();
            }
        }
    }

    // ============================================
    // GALLERY FILTERING (OPTIONAL)
    // ============================================

    // You can add category filtering here if needed
    const filterButtons = document.querySelectorAll('[data-filter]');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });

            // Update active filter button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ============================================
    // PRELOAD ADJACENT IMAGES
    // ============================================

    function preloadAdjacentImages() {
        if (!lightbox.classList.contains('active')) return;

        const nextIndex = (currentImageIndex + 1) % images.length;
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;

        const nextImg = images[nextIndex]?.querySelector('img');
        const prevImg = images[prevIndex]?.querySelector('img');

        if (nextImg) {
            const preloadNext = new Image();
            preloadNext.src = nextImg.src;
        }

        if (prevImg) {
            const preloadPrev = new Image();
            preloadPrev.src = prevImg.src;
        }
    }

    // Preload images when lightbox opens or image changes
    if (lightbox) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    if (lightbox.classList.contains('active')) {
                        preloadAdjacentImages();
                    }
                }
            });
        });

        observer.observe(lightbox, { attributes: true });
    }

    // ============================================
    // GALLERY IMAGE COUNTER (OPTIONAL)
    // ============================================

    function updateImageCounter() {
        const counter = document.querySelector('.lightbox-counter');
        if (counter) {
            counter.textContent = `${currentImageIndex + 1} / ${images.length}`;
        }
    }

    // Add counter element if it doesn't exist
    if (lightbox && !document.querySelector('.lightbox-counter')) {
        const counter = document.createElement('div');
        counter.className = 'lightbox-counter';
        counter.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            background-color: rgba(0, 0, 0, 0.7);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
        `;
        lightbox.appendChild(counter);

        // Update counter when image changes
        const originalUpdateImage = updateLightboxImage;
        updateLightboxImage = function() {
            originalUpdateImage();
            updateImageCounter();
        };

        // Update counter when opening lightbox
        galleryItems.forEach((item, index) => {
            const originalClick = item.onclick;
            item.addEventListener('click', function() {
                setTimeout(updateImageCounter, 10);
            });
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    console.log(`✅ Gallery initialized with ${images.length} images`);
});
