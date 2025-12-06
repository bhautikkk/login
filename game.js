const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- SCREEN RESIZING ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call

// --- VARIABLES ---
let frames = 0;
const DEGREE = Math.PI / 180;

// --- GAME STATE ---
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
};

// --- CONTROLS ---
function action(evt) {
    // Prevent default touch behavior (scrolling)
    if (evt.type === 'touchstart') evt.preventDefault();

    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            break;
        case state.game:
            bird.flap();
            break;
        case state.over:
            resetGame();
            break;
    }
}

// Support for Click, Touch, and Spacebar
window.addEventListener("mousedown", action);
window.addEventListener("touchstart", action, { passive: false });
window.addEventListener("keydown", (e) => {
    if (e.code === "Space") action(e);
});

// --- BIRD OBJECT ---
const bird = {
    x: 50,
    y: 150,
    w: 34,
    h: 24,
    speed: 0,
    gravity: 0.25,
    jump: 4.6,
    rotation: 0,

    draw: function () {
        ctx.save();
        // Bird ko thoda screen ke left side mein rakhte hain relative to width
        let drawX = Math.min(canvas.width * 0.2, 100);

        ctx.translate(drawX, this.y);
        ctx.rotate(this.rotation);

        // Body
        ctx.fillStyle = "#FFD700";
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000";
        ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);

        // Eye
        ctx.fillStyle = "#FFF";
        ctx.fillRect(2, -8, 10, 10);
        ctx.strokeRect(2, -8, 10, 10);
        ctx.fillStyle = "#000";
        ctx.fillRect(8, -5, 2, 2);

        // Beak
        ctx.fillStyle = "#FF4500";
        ctx.fillRect(6, 4, 14, 8);
        ctx.strokeRect(6, 4, 14, 8);

        ctx.restore();
    },

    flap: function () {
        this.speed = -this.jump;
    },

    update: function () {
        // Bird starts at 1/3rd of screen height or center
        let startY = canvas.height / 2 - 50;

        if (state.current == state.getReady) {
            this.y = startY - 10 * Math.cos(frames * 0.1);
            this.rotation = 0;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            // Rotation Logic
            if (this.speed < this.jump / 2) {
                this.rotation = -25 * DEGREE;
            } else {
                this.rotation += 5 * DEGREE;
                if (this.rotation > 90 * DEGREE) this.rotation = 90 * DEGREE;
            }

            // Floor Collision
            if (this.y + this.h / 2 >= canvas.height - fg.h) {
                this.y = canvas.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                }
            }
        }
    }
};

// --- BACKGROUND ---
const bg = {
    draw: function () {
        ctx.fillStyle = "#70c5ce";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw some clouds
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(100, canvas.height - 200, 30, 0, Math.PI * 2);
        ctx.arc(140, canvas.height - 190, 40, 0, Math.PI * 2);
        ctx.arc(180, canvas.height - 200, 30, 0, Math.PI * 2);
        ctx.fill();
    }
};

// --- FOREGROUND (Ground) ---
const fg = {
    h: 100, // Thoda uncha ground mobile ke liye
    x: 0,
    dx: 2,
    draw: function () {
        ctx.fillStyle = "#ded895";
        ctx.fillRect(0, canvas.height - this.h, canvas.width, this.h);

        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(0, canvas.height - this.h, canvas.width, 15);

        ctx.strokeStyle = "#558c22";
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - this.h + 15);
        ctx.lineTo(canvas.width, canvas.height - this.h + 15);
        ctx.stroke();
    },
    update: function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % 20;
        }
    }
};

// --- PIPES ---
const pipes = {
    position: [],
    w: 60,  // Thoda chauda pipe
    gap: 120, // Mobile par easy khelne ke liye gap
    dx: 3, // Thodi speed badhayi hai smooth feel ke liye

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            let topY = p.y;
            let bottomY = p.y + p.h + this.gap;

            // Pipe Body
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(p.x, topY, this.w, p.h); // Top
            ctx.fillRect(p.x, bottomY, this.w, canvas.height - bottomY - fg.h); // Bottom

            // Borders
            ctx.strokeStyle = "#555";
            ctx.lineWidth = 2;
            ctx.strokeRect(p.x, topY, this.w, p.h);
            ctx.strokeRect(p.x, bottomY, this.w, canvas.height - bottomY - fg.h);

            // Caps
            let capHeight = 25;
            // Top Cap
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(p.x - 4, topY + p.h - capHeight, this.w + 8, capHeight);
            ctx.strokeRect(p.x - 4, topY + p.h - capHeight, this.w + 8, capHeight);
            // Bottom Cap
            ctx.fillRect(p.x - 4, bottomY, this.w + 8, capHeight);
            ctx.strokeRect(p.x - 4, bottomY, this.w + 8, capHeight);
        }
    },

    update: function () {
        if (state.current !== state.game) return;

        // Spawning Logic (distance based on screen width)
        // Har 100 frames par nahi, balki distance ke hisab se spawn karenge
        if (frames % 100 == 0) {
            // Pipe height calculation based on screen height
            let minPipeH = canvas.height * 0.1;
            let maxPipeH = canvas.height - fg.h - this.gap - minPipeH;
            let randomH = Math.floor(Math.random() * (maxPipeH - minPipeH + 1) + minPipeH);

            this.position.push({
                x: canvas.width,
                y: 0,
                h: randomH
            });
        }

        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];
            p.x -= this.dx;

            // Collision Variables
            let birdX = Math.min(canvas.width * 0.2, 100); // Bird ki fixed screen position

            // Collision Logic
            // 1. Top Pipe
            if (birdX + bird.w / 2 > p.x && birdX - bird.w / 2 < p.x + this.w &&
                bird.y - bird.h / 2 < p.h) {
                state.current = state.over;
            }
            // 2. Bottom Pipe
            if (birdX + bird.w / 2 > p.x && birdX - bird.w / 2 < p.x + this.w &&
                bird.y + bird.h / 2 > p.h + this.gap) {
                state.current = state.over;
            }

            if (p.x + this.w <= 0) {
                this.position.shift();
                score.value += 1;
                score.best = Math.max(score.value, score.best);
            }
        }
    }
};

// --- SCORE ---
const score = {
    best: localStorage.getItem('flappy_full_best') || 0,
    value: 0,

    draw: function () {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";

        if (state.current == state.game) {
            ctx.font = "bold 60px Arial";
            ctx.fillText(this.value, canvas.width / 2, 100);
            ctx.strokeText(this.value, canvas.width / 2, 100);
        } else if (state.current == state.over) {

            // Box background
            let boxW = 300;
            let boxH = 250;
            let boxX = canvas.width / 2 - boxW / 2;
            let boxY = canvas.height / 2 - boxH / 2;

            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fillRect(boxX, boxY, boxW, boxH);
            ctx.strokeStyle = "#333";
            ctx.strokeRect(boxX, boxY, boxW, boxH);

            ctx.fillStyle = "#000";
            ctx.font = "30px Impact";
            ctx.fillText("SCORE", canvas.width / 2, boxY + 50);
            ctx.font = "50px Impact";
            ctx.fillText(this.value, canvas.width / 2, boxY + 100);

            ctx.fillStyle = "#e8802e";
            ctx.font = "25px Impact";
            ctx.fillText("BEST: " + this.best, canvas.width / 2, boxY + 150);
            localStorage.setItem('flappy_full_best', this.best);

            ctx.fillStyle = "#555";
            ctx.font = "20px Arial";
            ctx.fillText("Tap to Restart", canvas.width / 2, boxY + 220);

        } else if (state.current == state.getReady) {
            ctx.fillStyle = "#000";
            ctx.font = "40px Impact";
            ctx.fillText("GET READY", canvas.width / 2, canvas.height / 2 - 50);
            ctx.font = "20px Arial";
            ctx.fillText("Tap to Fly", canvas.width / 2, canvas.height / 2);
        }
    }
};

function resetGame() {
    bird.speed = 0;
    bird.rotation = 0;
    pipes.position = [];
    score.value = 0;
    frames = 0;
    state.current = state.getReady;
}

function draw() {
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    score.draw();
}

function update() {
    bird.update();
    fg.update();
    pipes.update();
}

function loop() {
    update();
    draw();
    frames++;
    requestAnimationFrame(loop);
}

loop();
