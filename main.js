console.log("Script successfully loaded and running.");
// --- 1. Ultra-Minimal Inverted Cursor ---
let cursor = document.querySelector('.cursor');

if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
}

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;
let isHovering = false;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Buttery smooth cursor interpolation
function renderCursor() {
    // Linear interpolation for smooth trailing
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;

    cursor.style.transform = \`translate(\${cursorX}px, \${cursorY}px) translate(-50%, -50%)\`;
        requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const interactiveElements = document.querySelectorAll('a, .btn, .project-card, .resume-grid > div');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            cursor.classList.add('hover-grow');
            
            if (el.classList.contains('project-card')) {
                cursor.textContent = 'VIEW';
            } else if (el.tagName.toLowerCase() === 'a' && !el.classList.contains('btn')) {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
            }
        });
        el.addEventListener('mouseleave', () => {
            isHovering = false;
            cursor.classList.remove('hover-grow');
            cursor.textContent = '';
            cursor.style.width = '';
            cursor.style.height = '';
        });
    });

    // --- 2. Magnetic Snap Buttons ---
    const magneticBtns = document.querySelectorAll('.btn');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const h = rect.width / 2;
            const w = rect.height / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - w;
            
            this.style.transform = \`translate(\${x * 0.2}px, \${y * 0.2}px)\`;
            
            // Snap cursor slightly towards center
            mouseX = rect.left + h + (x * 0.1);
            mouseY = rect.top + w + (y * 0.1);
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0px, 0px)';
        });
    });

    // --- 3. Interactive Space Background (Canvas) ---
    const canvas = document.getElementById('bg-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];
        let shootingStars = [];
        
        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resize);
        resize();
        
        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5;
                this.baseAlpha = 0.3 + Math.random() * 0.7;
                this.alpha = this.baseAlpha;
                this.speed = (Math.random() * 0.1) + 0.02;
                this.twinkleSpeed = 0.02 + Math.random() * 0.03;
            }
            
            update() {
                // Parallax shift based on mouse
                let dx = (window.innerWidth / 2 - mouseX) * 0.005 * this.size;
                let dy = (window.innerHeight / 2 - mouseY) * 0.005 * this.size;
                
                this.y -= this.speed;
                
                // Twinkle
                this.alpha = this.baseAlpha + Math.sin(Date.now() * this.twinkleSpeed) * 0.2;
                
                if (this.y < 0) {
                    this.y = height;
                    this.x = Math.random() * width;
                }
                
                this.drawX = this.x + dx;
                this.drawY = this.y + dy;
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.drawX, this.drawY, this.size, 0, Math.PI * 2);
                ctx.fillStyle = \`rgba(255, 255, 255, \${this.alpha})\`;
                ctx.fill();
            }
        }
        
        class ShootingStar {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * width * 1.5;
                this.y = 0;
                this.len = Math.random() * 80 + 20;
                this.speedX = -Math.random() * 10 - 5;
                this.speedY = Math.random() * 10 + 5;
                this.size = Math.random() * 1.5 + 0.5;
                this.waitTime = Math.random() * 200 + 50;
                this.active = false;
            }
            
            update() {
                if (!this.active) {
                    this.waitTime--;
                    if (this.waitTime <= 0) this.active = true;
                    return;
                }
                
                this.x += this.speedX;
                this.y += this.speedY;
                
                if (this.x < -100 || this.y > height + 100) {
                    this.reset();
                }
            }
            
            draw() {
                if (!this.active) return;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.speedX * 2, this.y - this.speedY * 2);
                ctx.lineWidth = this.size;
                let gradient = ctx.createLinearGradient(this.x, this.y, this.x - this.speedX * 2, this.y - this.speedY * 2);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.strokeStyle = gradient;
                ctx.stroke();
            }
        }
        
        for(let i = 0; i < 150; i++) {
            stars.push(new Star());
        }
        
        for(let i = 0; i < 3; i++) {
            shootingStars.push(new ShootingStar());
        }
        
        function renderSpace() {
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < stars.length; i++) {
                stars[i].update();
                stars[i].draw();
            }
            
            for (let i = 0; i < shootingStars.length; i++) {
                shootingStars[i].update();
                shootingStars[i].draw();
            }
            
            requestAnimationFrame(renderSpace);
        }
        
        renderSpace();
    }

    // --- 4. Smooth Scroll Reveal ---
    const sections = document.querySelectorAll('.section, .hero-text > *, .about-text, .about-meta li, .skills-group, .project-card, .resume-grid > div');
    
    sections.forEach(sec => {
        if (!sec.classList.contains('reveal')) {
            sec.classList.add('reveal');
        }
    });

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a slight stagger effect based on index if they appear at once
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, index * 50);
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- 5. Twist & Fall Text Animation ---
    const heroTitle = document.querySelector('.hero h1');
    if(heroTitle) {
        // Split the text content while preserving the span element
        const content = heroTitle.innerHTML;
        // This regex splits out HTML tags and text chunks to preserve the structure
        const chunks = content.split(/(<[^>]+>)/g);
        let wrappedHTML = '';
        let letterDelay = 0;
        
        chunks.forEach(chunk => {
            if (chunk.startsWith('<')) {
                wrappedHTML += chunk;
            } else {
                // Text chunk
                const characters = chunk.split('');
                characters.forEach(char => {
                    if (char === ' ') {
                        wrappedHTML += ' '; // Preserve spaces
                    } else {
                        wrappedHTML += \`<span class="letter-wrap"><span class="letter" style="animation-delay: \${letterDelay}s">\${char}</span></span>\`;
                        letterDelay += 0.05; // Stagger letters
                    }
                });
            }
        });
        
        heroTitle.innerHTML = wrappedHTML;
    }

