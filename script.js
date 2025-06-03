// --- Futuristic Space Particle System with Connections ---

// Get canvas element and context
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Particle settings
const particleColors = ['neon-blue', 'purple', 'white'];
const maxDistance = 100; // Max distance for particle connections
let particles = [];
let animationId;
let isMoving = true;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';

// Particle class to manage properties and behavior
class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * 200 - 100; // Depth between -100 and 100
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
        this.pulseSize = 0;
    }

    update() {
        // Update position
        this.x += this.speedX * (1 - Math.abs(this.z) / 150); // Slower if further
        this.y += this.speedY * (1 - Math.abs(this.z) / 150);

        // Pulse effect
        this.pulseSize += this.pulseSpeed * this.pulseDirection;
        if (this.pulseSize > 0.5 || this.pulseSize < -0.5) {
            this.pulseDirection *= -1;
        }

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        // Mouse interaction: attract particles when close
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            const force = (150 - distance) / 150;
            this.x += dx * force * 0.02;
            this.y += dy * force * 0.02;
        }
    }

    draw() {
        // Adjust size and opacity based on depth and pulse
        const scale = 1 - Math.abs(this.z) / 150;
        const size = (this.size + this.pulseSize) * scale;
        const opacity = 0.5 + (1 - Math.abs(this.z) / 100) * 0.5;

        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = currentTheme === 'light' ?
            (this.color === 'neon-blue' ? 'rgba(0, 100, 200, ' + opacity + ')' :
             this.color === 'purple' ? 'rgba(100, 0, 200, ' + opacity + ')' :
             'rgba(0, 0, 0, ' + opacity + ')') :
            (this.color === 'neon-blue' ? 'rgba(0, 150, 255, ' + opacity + ')' :
             this.color === 'purple' ? 'rgba(150, 0, 255, ' + opacity + ')' :
             'rgba(255, 255, 255, ' + opacity + ')');
        ctx.fill();
    }
}

// Initialize particles
function createParticles(count) {
    if (!ctx) {
        console.warn('Canvas context not found for particles.');
        return;
    }
    particles = [];
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
    startAnimation();
}

// Draw connections between nearby particles
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Draw line if particles are close and mouse is nearby
            const mouseDx = (p1.x + p2.x) / 2 - mouseX;
            const mouseDy = (p1.y + p2.y) / 2 - mouseY;
            const mouseDistance = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);
            if (distance < maxDistance && mouseDistance < 200) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                
                // Create gradient for connection lines
                const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                const opacity = (maxDistance - distance) / maxDistance * 0.3;
                
                if (currentTheme === 'light') {
                    gradient.addColorStop(0, `rgba(0, 100, 200, ${opacity})`);
                    gradient.addColorStop(1, `rgba(100, 0, 200, ${opacity})`);
                } else {
                    gradient.addColorStop(0, `rgba(0, 150, 255, ${opacity})`);
                    gradient.addColorStop(1, `rgba(150, 0, 255, ${opacity})`);
                }
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}

// Update and draw particles
function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    drawConnections();
    if (isMoving) {
        animationId = requestAnimationFrame(updateParticles);
    }
}

// Start animation loop
function startAnimation() {
    if (!animationId) {
        isMoving = true;
        updateParticles();
    }
}

// Stop animation loop
function stopAnimation() {
    isMoving = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Clear particles
function clearParticles() {
    stopAnimation();
    particles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Resize canvas to fit window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    clearParticles();
    createParticles(window.innerWidth < 768 ? 50 : 100); // Fewer particles on mobile
}

// Track mouse movement
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Update particle colors based on theme
function updateParticlesForTheme(theme) {
    currentTheme = theme;
    updateParticles();
}

// --- Logo Particle Animation ---
function initLogoAnimation() {
    const logo = document.querySelector('.logo');
    if (!logo) {
        console.warn('Logo element not found.');
        return;
    }

    let logoParticles = [];
    function createLogoParticles() {
        logoParticles = [];
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'logo-particle';
            logo.parentElement.appendChild(particle);
            logoParticles.push(particle);
            gsap.set(particle, {
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--color-accent)',
                x: logo.offsetWidth / 2,
                y: logo.offsetHeight / 2,
                opacity: 0,
                zIndex: 1
            });
        }
        console.log('Logo particles created:', logoParticles.length);}

    const animateParticles = () => {
        if (logoParticles.length === 0) createLogoParticles();
        logoParticles.forEach((particle, i) => {
            const angle = (i / logoParticles.length) * Math.PI * 2;
            const distance = 20 + Math.random() * 15;
            gsap.to(particle, {
                x: Math.cos(angle) * distance + logo.offsetWidth / 2,
                y: Math.sin(angle) * distance + logo.offsetHeight / 2,
                opacity: 0.8,
                duration: 0.8,
                delay: i * 0.05,
                ease: 'elastic.out(1, 0.5)'
            });
        });
        console.log('Logo particles animated on mouseenter');
    };

    logo.addEventListener('mouseenter', animateParticles);
    logo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        animateParticles();
    });

    logo.addEventListener('mouseleave', () => {
        logoParticles.forEach((particle) => {
            gsap.to(particle, {
                x: logo.offsetWidth / 2,
                y: logo.offsetHeight / 2,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        });
        logoParticles = [];
        console.log('Logo particles reset on mouseleave');
    });
}

// --- Project Rendering Functions ---
function renderDesignProjects(projects) {
    const container = document.getElementById('designProjects');
    if (!container) return;
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card glass-card';
        card.innerHTML = `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
            </div>
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    createInfiniteCarousel();
}

function renderCodeProjects(projects) {
    const categories = ['web', 'mobile', 'outros'];
    categories.forEach(category => {
        const container = document.getElementById(category);
        if (!container) return;
        projects[category].forEach(project => {
            const card = document.createElement('div');
            card.className = 'code-project glass-card';
            card.innerHTML = `
                <div class="code-preview">
                    <div class="browser-mockup">
                        <div class="browser-bar">
                            <div class="browser-dots">
                                <div class="browser-dot"></div>
                                <div class="browser-dot"></div>
                                <div class="browser-dot"></div>
                            </div>
                        </div>
                        <div class="browser-content">
                            <img src="${project.image}" alt="${project.title}">
                        </div>
                    </div>
                </div>
                <div class="code-info">
                    <h3 class="code-title">${project.title}</h3>
                    <p class="code-description">${project.description}</p>
                    <div class="tech-stack">
                        ${project.tech.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
                    </div>
                    <div class="code-links">
                        <a href="${project.github}" class="code-link secondary-link" target="_blank" rel="noopener">GitHub</a>
                        <a href="${project.demo}" class="code-link primary-link" target="_blank" rel="noopener">Demo</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    });
}

function createInfiniteCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;
    const cards = track.querySelectorAll('.project-card');
    if (!cards.length) return;
    const cardWidth = 350 + 32;
    const cloneCount = Math.ceil(window.innerWidth / cardWidth) + 1;
    for (let i = 0; i < cloneCount; i++) {
        cards.forEach(card => track.appendChild(card.cloneNode(true)));
    }
    let scrollPos = 0;
    function animateCarousel() {
        scrollPos -= 0.5;
        if (scrollPos <= -(cards.length * cardWidth)) {
            scrollPos = 0;
        }
        track.style.transform = `translateX(${scrollPos}px)`;
        if (track.isConnected) requestAnimationFrame(animateCarousel);
    }
    animateCarousel();
}

// --- Tabs Initialization ---
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tabs-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const activeContent = document.getElementById(tab.dataset.tab);
            activeContent.classList.add('active');
            if (typeof gsap !== 'undefined') {
                gsap.from(activeContent.querySelectorAll('.code-project'), {
                    x: (index) => (index % 2 === 0 ? -50 : 50),
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    stagger: 0.2
                });
            }
        });
    });
}

// --- Scroll Animations ---
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        animatedElements.forEach(element => observer.observe(element));
    } else {
        animatedElements.forEach(element => element.classList.add('visible'));
    }
}

// --- Custom Cursor ---
function initCustomCursor() {
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    if (!cursor || !cursorFollower) return;
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        setTimeout(() => {
            cursorFollower.style.left = e.clientX + 'px';
            cursorFollower.style.top = e.clientY + 'px';
        }, 100);
    });
    const interactiveElements = document.querySelectorAll('a, button, .project-card, .service-card, .contact-link');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorFollower.style.width = '60px';
            cursorFollower.style.height = '60px';
        });
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.width = '40px';
            cursorFollower.style.height = '40px';
        });
    });
}

// --- Back to Top Button ---
function initBackToTopButton() {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;
    window.addEventListener('scroll', () => {
        backToTopButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
        backToTopButton.style.opacity = window.scrollY > 300 ? '1' : '0';
    });
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// --- Mobile Menu ---
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!menuToggle || !navLinks) return;
    menuToggle.addEventListener('click', () => {
        const isActive = menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// --- Button Animations ---
function initButtonAnimations() {
    document.querySelectorAll('.btn').forEach(button => {
        const glow = document.createElement('div');
        glow.classList.add('btn-glow');
        button.appendChild(glow);
        button.addEventListener('mouseenter', () => {
            gsap.to(button, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
            gsap.to(glow, { opacity: 0.8, duration: 0.5, ease: 'power2.out' });
        });
        button.addEventListener('mouseleave', () => {
            gsap.to(button, { scale: 1, duration: 0.3, ease: 'power2.out' });
            gsap.to(glow, { opacity: 0, duration: 0.5, ease: 'power2.out' });
        });
        button.addEventListener('click', () => {
            gsap.to(button, { scale: 0.95, duration: 0.2, yoyo: true, repeat: 1 });
        });
    });
}

// --- Project Data ---
const designProjects = [
    { title: 'Identidade Visual', description: 'Desenvolvimento de marca completa para startup de tecnologia.', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=80', tags: ['Branding', 'UI/UX'] },
    { title: 'App Financeiro', description: 'Design de interface para aplicativo de gestão financeira.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', tags: ['UI/UX', 'Mobile'] },
    { title: 'E-commerce', description: 'Redesign completo de plataforma de comércio eletrônico.', image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=1000&q=80', tags: ['Web Design', 'UX Research'] },
    { title: 'Dashboard Analytics', description: 'Interface para visualização de dados e métricas.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', tags: ['UI/UX', 'Data Viz'] },
    { title: 'Design System', description: 'Sistema de design completo para produto SaaS.', image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1000&q=80', tags: ['Design System', 'UI/UX'] },
    { title: 'App de Saúde', description: 'Interface para aplicativo de monitoramento de saúde.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80', tags: ['Mobile', 'UI/UX'] }
];

const codeProjects = {
    web: [
        { title: 'Plataforma E-commerce', description: 'Desenvolvimento completo de plataforma de comércio eletrônico com React, Node.js e MongoDB.', image: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&w=1000&q=80', tech: ['React', 'Node.js', 'MongoDB', 'Express'], github: 'https://github.com/marcio-maker', demo: 'https://demo.ecommerce-plataforma.com' },
        { title: 'Dashboard Analytics', description: 'Painel de visualização de dados com gráficos interativos e filtros avançados.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80', tech: ['Vue.js', 'D3.js', 'Firebase', 'Tailwind CSS'], github: 'https://github.com/marcio-maker', demo: 'https://demo.dashboard-analytics.com' }
    ],
    mobile: [
        { title: 'App de Fitness', description: 'Aplicativo móvel para acompanhamento de treinos e nutrição.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80', tech: ['React Native', 'Redux', 'Firebase', 'Expo'], github: 'https://github.com/marcio-maker', demo: 'https://demo.fitness-app.com' },
        { title: 'App de Finanças', description: 'Aplicativo para controle financeiro pessoal com categorização automática.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80', tech: ['Flutter', 'Dart', 'SQLite', 'Provider'], github: 'https://github.com/marcio-maker', demo: 'https://demo.finance-app.com' }
    ],
    outros: [
        { title: 'Biblioteca de Animações', description: 'Biblioteca open source para animações de interface.', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1000&q=80', tech: ['JavaScript', 'TypeScript', 'GSAP', 'Webpack'], github: 'https://github.com/marcio-maker', demo: 'https://demo.animation-library.com' },
        { title: 'CLI para Automação', description: 'Ferramenta de linha de comando para automação de tarefas.', image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1000&q=80', tech: ['Node.js', 'Commander.js', 'Shell Script', 'Docker'], github: 'https://github.com/marcio-maker', demo: 'https://demo.automation-cli.com' }
    ]
};

// --- Main Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // GSAP and ScrollTrigger validation
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded.');
    } else {
        console.log('GSAP and ScrollTrigger loaded.');
        gsap.registerPlugin(ScrollTrigger);
        gsap.from('.split-half', {
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.3,
            ease: 'power3.out',
            onComplete: () => {
                document.querySelectorAll('.split-half').forEach(half => half.classList.add('active'));
            }
        });
        gsap.utils.toArray('.section').forEach(section => {
            gsap.from(section.querySelector('.section-title'), {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.8,
                ease: 'power3.out'
            });
        });
    }

    // GSAP animation for testimonials
    if (typeof gsap !== 'undefined') {
        gsap.from('.testimonial', {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            duration: 1,
            ease: "power3.out"
        });

        // GSAP glow effect for icons
        document.querySelectorAll('.icon-glow').forEach(icon => {
            // Continuous pulsing glow
            gsap.to(icon, {
                boxShadow: "0 0 32px 8px var(--color-accent-glow)",
                repeat: -1,
                yoyo: true,
                duration: 2.2,
                ease: "power1.inOut"
            });
            // Extra glow on hover
            icon.addEventListener('mouseenter', () => {
                gsap.to(icon, { boxShadow: "0 0 48px 16px var(--color-accent-glow)", duration: 0.4 });
            });
            icon.addEventListener('mouseleave', () => {
                gsap.to(icon, { boxShadow: "0 0 32px 8px var(--color-accent-glow)", duration: 0.6 });
            });
        });
    }

    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateParticlesForTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateParticlesForTheme(savedTheme);
        }
    }

    // Initialize components
    if (canvas) resizeCanvas();
    renderDesignProjects(designProjects);
    renderCodeProjects(codeProjects);
    initTabs();
    initScrollAnimations();
    initCustomCursor();
    initBackToTopButton();
    initMobileMenu();
    initButtonAnimations();
    initLogoAnimation();

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Initial hero animation
    setTimeout(() => {
        document.querySelectorAll('.split-half').forEach(half => half.classList.add('active'));
    }, 500);
});
