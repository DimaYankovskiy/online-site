// iOS Circle Animation & Step Progression Fix

// This function completely replaces the original rotateCircleInSegment function
function rotateCircleInSegment(segmentIndex) {
    // Get elements
    const segment = segments[segmentIndex];
    if (!segment) return; // Safety check
    
    const circleContainer = segment.querySelector('.circle-container');
    const circleImage = circleContainer.querySelector('img');
    const multiplier = segment.querySelector('.multiplier');
    
    // Make sure elements exist
    if (!circleContainer || !circleImage || !multiplier) return;
    
    // Reset any existing transitions first
    multiplier.style.opacity = '0';
    
    // For iOS, avoid transition issues by using setTimeout with direct style changes
    circleImage.style.transition = 'none';
    circleImage.style.opacity = '0';
    
    // Use setTimeout to ensure the previous style changes have been applied
    setTimeout(() => {
        // Change image source based on click count
        if (clickCount === 1 || clickCount === 3 || clickCount === 6) {
            circleImage.src = images.circleRed;
        } else {
            circleImage.src = images.circleGreen;
        }
        
        // Force re-paint
        void circleImage.offsetWidth;
        
        // Show image with opacity instead of transform on iOS
        circleImage.style.opacity = '1';
        
        // Show multiplier after a delay
        setTimeout(() => {
            multiplier.style.opacity = '1';
        }, 300);
    }, 300);
}

// This function completely replaces the original moveSceneLeft function
function moveSceneLeft() {
    // Don't do anything if already animating or max clicks reached
    if (isAnimating || clickCount >= maxClicks) return;
    
    // Increment click count
    clickCount++;
    
    // Move the scene
    currentPosition -= segmentWidth;
    isAnimating = true;
    
    // Special iOS transition handling
    scene.style.transition = 'transform 0.5s ease-out';
    
    // Force browser to acknowledge the style change before setting transform
    void scene.offsetWidth;
    
    // Apply the transform
    scene.style.transform = `translateX(${currentPosition}px)`;
    
    // Start walking animation
    isWalking = true;
    if (!animationId) {
        animateChicken();
    }
    
    // After the transition completes
    setTimeout(() => {
        // Stop walking
        isWalking = false;
        
        // Update active segment
        activeSegmentIndex = Math.min(
            segments.length - 1, 
            Math.abs(Math.floor(currentPosition / segmentWidth))
        );
        
        // Only rotate circle if we've moved to a valid segment
        if (activeSegmentIndex > 0) {
            // Use our new circle rotation function
            rotateCircleInSegment(activeSegmentIndex);
        }
        
        // Update text and play sound
        bottomText.textContent = bottomTexts[clickCount];
        if (clickCount === 1 || clickCount === 3 || clickCount === 6) {
            playSound('loseSound');
        } else {
            playSound('winSound');
        }
        
        // After a bit more time, reset animation flag
        setTimeout(() => {
            isAnimating = false;
            
            // Show final content if we've reached max clicks
            if (clickCount >= maxClicks) {
                setTimeout(() => {
                    showFinalContent();
                }, 400);
            }
        }, 500);
    }, 500);
}

// This ensures the scene transition works properly on iOS
function setupIOSSceneTransition() {
    // Monitor transitionend events
    scene.addEventListener('transitionend', function(e) {
        // Only handle transform transitions
        if (e.propertyName !== 'transform') return;
        
        const maxScroll = -(segments.length - 1) * segmentWidth;
        
        if (currentPosition <= maxScroll) {
            // First remove transition
            scene.style.transition = 'none';
            // Reset position
            currentPosition = 0;
            scene.style.transform = `translateX(${currentPosition}px)`;
            activeSegmentIndex = 0;
            
            // Reset circles
            resetAllCircles();
            
            // Force repaint
            void scene.offsetWidth;
            
            // Restore transition
            scene.style.transition = 'transform 0.5s ease-out';
        }
    });
}

// Initialize iOS-specific fixes for step progression
function initIOSStepFixes() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        console.log("Applying iOS-specific step fixes");
        
        // Make sure bottom text is properly clickable on iOS
        if (bottomText) {
            // Remove existing click listeners to avoid duplication
            bottomText.removeEventListener('click', moveSceneLeft);
            
            // Add touchstart event for iOS
            bottomText.addEventListener('touchstart', function(e) {
                e.preventDefault(); // Prevent default behavior
                moveSceneLeft();
            });
            
            // Re-add click event for desktop/backup
            bottomText.addEventListener('click', moveSceneLeft);
        }
        
        // Setup scene transition handling
        setupIOSSceneTransition();
        
        // Make sure all images are properly loaded before animations start
        // This prevents iOS from showing blank images
        window.addEventListener('load', function() {
            // Preload all images
            const imagesToPreload = [
                'resources/images/circle-red.png',
                'resources/images/circle-green.png',
                'resources/images/circle-blue.png'
            ];
            
            imagesToPreload.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        });
    }
}

// Call this function when the document is ready
document.addEventListener('DOMContentLoaded', initIOSStepFixes);

// Ensure images are loaded on iOS
function forceImageReload() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            const originalSrc = img.src;
            img.src = '';
            setTimeout(() => {
                img.src = originalSrc;
            }, 10);
        });
    }
}

// Call after overlay is removed
function setupAfterOverlay() {
    const overlay = document.getElementById('audio-overlay');
    const startButton = document.getElementById('start-button');
    
    if (startButton && overlay) {
        startButton.addEventListener('click', function() {
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                overlay.remove();
                forceImageReload(); // Ensure images are loaded
            }, 500);
        });
        
        startButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            overlay.style.opacity = '0';
            
            setTimeout(() => {
                overlay.remove();
                forceImageReload(); // Ensure images are loaded
            }, 500);
        });
    }
}

// Call this function when the page loads
window.addEventListener('load', setupAfterOverlay);