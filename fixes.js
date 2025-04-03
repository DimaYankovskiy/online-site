
// 1. iOS-friendly viewport height fix
function setIOSHeight() {
    const windowHeight = window.innerHeight;
    document.body.style.height = windowHeight + 'px';
}

// Run on load and resize
window.addEventListener('load', setIOSHeight);
window.addEventListener('resize', setIOSHeight);
window.addEventListener('orientationchange', setIOSHeight);

// 2. iOS Touch Event Handlers
function addTouchSupport() {
    // Add touch support to the bottom text button
    bottomText.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent double-triggering
        moveSceneLeft();
    });
    
    // Add touch support to overlay and start button
    const overlay = document.getElementById('audio-overlay');
    const startButton = document.getElementById('start-button');
    
    if (startButton) {
        startButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            initAudio();
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                overlay.remove();
            }, 500);
        });
    }
    
    if (overlay) {
        overlay.addEventListener('touchstart', function(e) {
            // Only trigger if the click was directly on the overlay (not on the button)
            if (e.target === overlay) {
                e.preventDefault();
                initAudio();
                overlay.style.transition = 'opacity 0.5s ease';
                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    overlay.remove();
                }, 500);
            }
        });
    }
    
    // Add touch support to final button
    const finalButton = document.querySelector('.final-bottom button');
    if (finalButton) {
        finalButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            registerClick();
        });
    }
}

// 3. iOS Audio Fix - Initialize audio only after user interaction
function initAudio() {
    // Create a silent audio context to unlock audio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
        const audioContext = new AudioContext();
        // Create short silent buffer to unlock audio
        const buffer = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
    
    // Now it's safe to play audio
    playSound('backgroundMusic');
}

// 4. iOS Performance optimizations
function optimizeForIOS() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Reduce animation complexity for iOS
        walkingSpeed = 0.15; // Slower animations
        
        // Use transform instead of left position for chicken movement in continuous walking
        if (typeof moveChickenRight === 'function') {
            // Replace the original function with an optimized version
            window.originalMoveChickenRight = moveChickenRight;
            
            moveChickenRight = function() {
                if (!continuousWalking) return;
                
                let currentX = chickenContainer._currentX || 0;
                currentX += 1;
                chickenContainer._currentX = currentX;
                
                chickenContainer.style.transform = `translateX(${currentX}px)`;
                
                requestAnimationFrame(moveChickenRight);
            };
        }
        
        // Use opacity transitions instead of display none/flex for better iOS performance
        const originalShowFinalContent = showFinalContent;
        if (typeof showFinalContent === 'function') {
            showFinalContent = function() {
                const topText = document.querySelector('.top-text');
                const bottomText = document.querySelector('.bottom-text');
                const circles = document.querySelectorAll('.circle-container');
                
                // Use opacity for iOS instead of display changes
                topText.style.transition = 'opacity 0.5s ease';
                bottomText.style.transition = 'opacity 0.5s ease';
                finalContent.style.transition = 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)';
                
                circles.forEach(circle => {
                    circle.style.transition = 'opacity 0.5s ease';
                    circle.style.opacity = '0';
                });
                
                topText.style.opacity = '0';
                bottomText.style.opacity = '0';
                
                if (currentStepSound !== null) {
                    stopSound('stepOpening');
                    currentStepSound = null;
                }
                
                // Make final content visible but transparent first
                finalContent.style.display = 'flex';
                finalContent.style.opacity = '0';
                
                setTimeout(() => {
                    topText.style.visibility = 'hidden';
                    bottomText.style.visibility = 'hidden';
                    
                    walkingSpeed = 0.1;
                    continuousWalking = true;
                    startContinuousWalking();
                    
                    // Force layout recalculation
                    void finalContent.offsetWidth;
                    
                    // Now show with animation
                    finalContent.style.opacity = '1';
                    finalContent.classList.add('show');
                }, 500);
            };
        }
    }
}

// Function to detect iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Apply all fixes on load
window.addEventListener('load', function() {
    setIOSHeight();
    addTouchSupport();
    optimizeForIOS();
    
    // Replace setupAudioOverlay with iOS-friendly version
    if (typeof setupAudioOverlay === 'function') {
        const originalSetupAudioOverlay = setupAudioOverlay;
        setupAudioOverlay = function() {
            const overlay = document.getElementById('audio-overlay');
            const startButton = document.getElementById('start-button');
            
            // Only preload audio after user interaction on iOS
            if (!isIOS()) {
                preloadSounds();
            }
            
            if (startButton && overlay) {
                // Click handlers remain the same, but we won't autoplay on iOS
            }
        };
    }
});
