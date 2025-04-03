var clickTag = "";

function registerClick() {
    window.open(clickTag, "_blank");
}


const scene = document.querySelector('.scene');
const chicken = document.querySelector('.chicken');
const leg1 = document.querySelector('.leg1');
const leg2 = document.querySelector('.leg2');
const bottomText = document.querySelector('.bottom-text');
const chickenContainer = document.querySelector('.chicken-container');
const finalContent = document.querySelector('.final-content');

let currentPosition = 0;
const segmentWidth = document.querySelector('.segment').offsetWidth;
let isWalking = false;
let isAnimating = false;
let clickCount = 0;
const maxClicks = 7;

const sounds = {
    backgroundMusic: 'resources/audio/back.mp3',
    stepOpening: 'resources/audio/step.mp3',
    winSound: 'resources/audio/win.mp3',
    loseSound: 'resources/audio/lose.mp3'
};

const images = {
    circleRed: 'resources/images/circle-red.png',
    circleGreen: 'resources/images/circle-green.png'
};

const volumes = {
    backgroundMusic: 0.1,
    stepOpening: 1,
    winSound: 1, 
    loseSound: 1 
};

let audioElements = {};
let currentStepSound = null;

function preloadSounds() {
    Object.keys(sounds).forEach(soundKey => {
        audioElements[soundKey] = new Audio(sounds[soundKey]);
        
        audioElements[soundKey].volume = volumes[soundKey];
        
        if (soundKey === 'backgroundMusic') {
            audioElements[soundKey].loop = true;
        }
    });
}

function playSound(soundKey) {
    if (audioElements[soundKey]) {
        audioElements[soundKey].currentTime = 0;
        audioElements[soundKey].play().catch(e => console.error("Error playing sound:", e));
    }
}

function stopSound(soundKey) {
    if (audioElements[soundKey]) {
        audioElements[soundKey].pause();
        audioElements[soundKey].currentTime = 0;
    }
}

const bottomTexts = [
    " ¡JUGAR!",
    "¡VAMOS OTRA VEZ!",
    "¿NO HABRÁ SOPA DE POLLO?",
    "¡VAMOS OTRA VEZ!",
    "¿NO HABRÁ SOPA DE POLLO?",
    "¡PERO LOS HUEVOS SON DE ORO!",
    "¡VAMOS OTRA VEZ!",
    "¡PERO LOS HUEVOS SON DE ORO!",
];

let stepPhase = 0;
const legMoveAmount = 3;
let walkingSpeed = 0.2;
let chickTilt = 0;
const tiltAmount = 5;
let animationId;
let continuousWalking = false;

let activeSegmentIndex = 0;
const segments = document.querySelectorAll('.segment');

function moveSceneLeft() {
    if (isAnimating || clickCount >= maxClicks) return;
    
    clickCount++;
    
    
    currentPosition -= segmentWidth;
    isAnimating = true; 

    scene.style.transition = 'transform 0.5s ease-out';
    scene.style.transform = `translateX(${currentPosition}px)`;

    isWalking = true;
    if (!animationId) {
        animateChicken();
    }

    setTimeout(() => {
        isWalking = false;

        activeSegmentIndex = Math.min(segments.length - 1, Math.abs(Math.floor(currentPosition / segmentWidth)));

        if (activeSegmentIndex > 0) {
            rotateCircleInSegment(activeSegmentIndex);
        }
    
        bottomText.textContent = bottomTexts[clickCount];
        if (clickCount === 1 || clickCount === 3 || clickCount === 6) {
            playSound('loseSound');
        } else {
            playSound('winSound');
        }
        
        setTimeout(() => {
            isAnimating = false;
            
            if (clickCount >= maxClicks) {
                setTimeout(() => {
                    showFinalContent();
                }, 400);
            }
        }, 500);
    }, 500);
}

function showFinalContent() {
    const topText = document.querySelector('.top-text');
    const circles = document.querySelectorAll('.circle-container');

    topText.style.transition = 'opacity 0.5s ease';
    bottomText.style.transition = 'opacity 0.5s ease';
    
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
    
    setTimeout(() => {
        topText.style.display = 'none';
        bottomText.style.display = 'none';
        
        finalContent.style.display = 'flex';

        walkingSpeed = 0.1;
        continuousWalking = true;
        startContinuousWalking();
        
        void finalContent.offsetWidth;
        
        finalContent.classList.add('show');
    }, 500);
}

function startContinuousWalking() {
    isWalking = true;
    if (!animationId) {
        animateChicken();
    }
    
    moveChickenRight();
}

function moveChickenRight() {
    if (!continuousWalking) return;
    
    let currentLeft = parseFloat(getComputedStyle(chickenContainer).left) || 7;
    currentLeft += 1;
    
    chickenContainer.style.left = `${currentLeft}px`;
    
    requestAnimationFrame(moveChickenRight);
}

function rotateCircleInSegment(segmentIndex) {
    const segment = segments[segmentIndex];
    const circleContainer = segment.querySelector('.circle-container');
    const circleImage = circleContainer.querySelector('img');
    const multiplier = segment.querySelector('.multiplier');

    multiplier.style.opacity = '0';

    circleImage.style.transition = 'transform 0.2s ease-out';
    circleImage.style.transform = 'rotateY(90deg)';

    setTimeout(() => {
        if (clickCount === 1 || clickCount === 3 || clickCount === 6) {
            circleImage.src = images.circleRed;
        } else {
            circleImage.src = images.circleGreen;
        }

        circleImage.style.transform = 'rotateY(0deg)';

        setTimeout(() => {
            multiplier.style.opacity = '1';
        }, 200);
    }, 200);
}

function animateChicken() {
    if (isWalking) {
        stepPhase += walkingSpeed;

        if (currentStepSound === null && !continuousWalking) {
            currentStepSound = playSound('stepOpening');
            
            audioElements['stepOpening'].addEventListener('ended', function() {
                if (isWalking && !continuousWalking) {
                    this.currentTime = 0;
                    this.play();
                }
            });
        }

        leg1.style.transform = `translateX(${Math.sin(stepPhase) * legMoveAmount}vh)`;
        leg2.style.transform = `translateX(${Math.sin(stepPhase + Math.PI) * legMoveAmount}vh)`;

        chickTilt = Math.sin(stepPhase * 2) * (tiltAmount / 2) - tiltAmount / 2;
        chicken.style.transform = `rotate(${chickTilt}deg)`;
    } else if (!continuousWalking) {
        stepPhase = 0;
        leg1.style.transform = 'translateX(0)';
        leg2.style.transform = 'translateX(0)';
        chicken.style.transform = 'rotate(0deg)';
        
        if (currentStepSound !== null) {
            stopSound('stepOpening');
            currentStepSound = null;
        }
    }

    animationId = requestAnimationFrame(animateChicken);
}

bottomText.addEventListener('click', moveSceneLeft);

scene.addEventListener('transitionend', function () {
    const maxScroll = -(segments.length - 1) * segmentWidth;

    if (currentPosition <= maxScroll) {
        scene.style.transition = 'none';
        currentPosition = 0;
        scene.style.transform = `translateX(${currentPosition}px)`;
        activeSegmentIndex = 0;

        resetAllCircles();

        void scene.offsetWidth;

        scene.style.transition = 'transform 0.5s ease-out';
    }
});

function resetAllCircles() {
    segments.forEach((segment, index) => {
        if (index > 0) {
            const circleContainer = segment.querySelector('.circle-container');
            const circleImage = circleContainer.querySelector('img');
            const multiplier = segment.querySelector('.multiplier');

            circleImage.style.transition = 'none';
            circleImage.style.transform = 'rotateY(0deg)';
            circleImage.src = 'resources/images/circle-blue.png';

            setTimeout(() => {
                multiplier.style.opacity = '1';
            }, 50);
        }
    });
}

function setupAudioOverlay() {
    const overlay = document.getElementById('audio-overlay');
    const startButton = document.getElementById('start-button');

    preloadSounds();

    if (startButton && overlay) {
        startButton.addEventListener('click', function () {
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
                
            playSound('backgroundMusic');

            setTimeout(() => {
                overlay.remove();
            }, 500);
        });

        overlay.addEventListener('click', function () {
            overlay.style.transition = 'opacity 0.5s ease';
            overlay.style.opacity = '0';
                
            playSound('backgroundMusic');

            setTimeout(() => {
                overlay.remove();
            }, 500);
        });
    }
}

window.addEventListener('load', function () {
    setupAudioOverlay();
});
