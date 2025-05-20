      const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        const navLinks = document.querySelectorAll('.nav-link');
        const buttons = document.querySelectorAll('.btn');
        const liquidItems = document.querySelectorAll('.liquid-item');
        const canvas = document.querySelector('.blob-canvas');
        const ctx = canvas.getContext('2d');
        
        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        let followerX = 0;
        let followerY = 0;
        
        // Initialize canvas size
        function setCanvasSize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);
        
        // Update mouse position
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Animate the cursors
        function animateCursors() {
            // Smooth animation for cursor
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            
            // Smooth animation for cursor follower
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;
            
            requestAnimationFrame(animateCursors);
        }
        
        animateCursors();
        
        // Link hover effects
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.style.width = '50px';
                cursor.style.height = '50px';
                cursorFollower.style.width = '80px';
                cursorFollower.style.height = '80px';
            });
            
            link.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursorFollower.style.width = '40px';
                cursorFollower.style.height = '40px';
            });
        });
        
        // Button hover effects
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                cursor.style.width = '70px';
                cursor.style.height = '70px';
                cursorFollower.style.width = '0';
                cursorFollower.style.height = '0';
            });
            
            button.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursorFollower.style.width = '40px';
                cursorFollower.style.height = '40px';
            });
        });
        
        // Magnetic button effect
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const btnX = rect.left + rect.width / 2;
                const btnY = rect.top + rect.height / 2;
                
                const distX = e.clientX - btnX;
                const distY = e.clientY - btnY;
                
                // Move the button slightly towards the cursor for a magnetic effect
                btn.style.transform = `translate(${distX * 0.1}px, ${distY * 0.1}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
        
        // Liquid items hover effect
        liquidItems.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Create a radial gradient effect from the mouse position
                item.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(98, 70, 234, 0.2), rgba(15, 14, 23, 0.8) 40%)`;
                
                // Slight tilt effect
                const tiltX = (y - rect.height / 2) / rect.height * 10;
                const tiltY = -(x - rect.width / 2) / rect.width * 10;
                item.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px)`;
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'rgba(15, 14, 23, 0.5)';
                item.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
        
        // Create blobs
        class Blob {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 200 + 100;
                this.vx = Math.random() * 1 - 0.5;
                this.vy = Math.random() * 1 - 0.5;
                this.color = this.getRandomColor();
            }
            
            getRandomColor() {
                const colors = [
                    'rgba(98, 70, 234, 0.15)',
                    'rgba(228, 88, 88, 0.15)',
                    'rgba(42, 35, 86, 0.15)'
                ];
                return colors[Math.floor(Math.random() * colors.length)];
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                // Bounce off the edges
                if (this.x <= 0 || this.x >= canvas.width) this.vx *= -1;
                if (this.y <= 0 || this.y >= canvas.height) this.vy *= -1;
                
                // Interactive - move slightly towards cursor
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 400) {
                    this.vx += dx * 0.0002;
                    this.vy += dy * 0.0002;
                }
                
                // Limit velocity
                const maxVel = 2;
                const vel = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (vel > maxVel) {
                    this.vx = (this.vx / vel) * maxVel;
                    this.vy = (this.vy / vel) * maxVel;
                }
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const blobs = Array(5).fill().map(() => new Blob());
        
        function animateBlobs() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            blobs.forEach(blob => {
                blob.update();
                blob.draw();
            });
            
            requestAnimationFrame(animateBlobs);
        }
        
        animateBlobs();
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        
        // Handle cursor for touch devices
        if ('ontouchstart' in window) {
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
            document.body.style.cursor = 'auto';
        }
        
        // Text highlight animation
        const highlightText = document.querySelector('.highlight-text');
        
        function animateHighlight() {
            const hue = (Date.now() / 50) % 360;
            highlightText.style.color = `hsl(${hue}, 80%, 60%)`;
            requestAnimationFrame(animateHighlight);
        }
        
        animateHighlight();