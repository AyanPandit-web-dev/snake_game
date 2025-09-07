const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10, actualX: 10 * gridSize, actualY: 10 * gridSize }
];
let food = generateFood();
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    switch(e.key.toLowerCase()) {
        case 'w':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 's':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'a':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'd':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
}

function generateFood() {
    const food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        scale: 1
    };
    return food;
}

function drawGame() {
    clearCanvas();
    moveSnake();
    
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    checkFoodCollision();
    drawSnake();
    drawFood();
    updateScore();
}

function clearCanvas() {
    // Fill background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy,
        actualX: snake[0].actualX,
        actualY: snake[0].actualY
    };
    
    // Smooth movement animation
    const targetX = head.x * gridSize;
    const targetY = head.y * gridSize;
    
    head.actualX += (targetX - head.actualX) * 0.5;
    head.actualY += (targetY - head.actualY) * 0.5;
    
    snake.unshift(head);
    
    // Update rest of the body to follow the head
    for (let i = 1; i < snake.length; i++) {
        const segment = snake[i];
        const nextSegment = snake[i - 1];
        const targetX = nextSegment.x * gridSize;
        const targetY = nextSegment.y * gridSize;
        
        segment.actualX += (targetX - segment.actualX) * 0.3;
        segment.actualY += (targetY - segment.actualY) * 0.3;
    }
    
    if (!checkFoodCollision()) {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function checkFoodCollision() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        food = generateFood();
        score += 10;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('highScore').textContent = highScore;
        }
        return true;
    }
    return false;
}

function drawSnake() {
    // Draw snake body segments with gradient
    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            segment.actualX + gridSize/2,
            segment.actualY + gridSize/2,
            0,
            segment.actualX + gridSize/2,
            segment.actualY + gridSize/2,
            gridSize/2
        );
        
        if (index === 0) {
            // Head color
            gradient.addColorStop(0, '#66bb6a');
            gradient.addColorStop(1, '#43a047');
            
            // Draw eyes
            ctx.fillStyle = '#000';
            const eyeSize = 4;
            const eyeOffset = 3;
            
            // Left eye
            ctx.beginPath();
            ctx.arc(segment.actualX + eyeOffset, segment.actualY + eyeOffset, eyeSize/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Right eye
            ctx.beginPath();
            ctx.arc(segment.actualX + gridSize - eyeOffset, segment.actualY + eyeOffset, eyeSize/2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Body segments with gradient
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#388E3C');
        }
        
        ctx.fillStyle = gradient;
        
        // Draw rounded rectangle for segment
        ctx.beginPath();
        ctx.roundRect(segment.actualX, segment.actualY, gridSize - 2, gridSize - 2, 5);
        ctx.fill();
    });
}

function drawFood() {
    // Animate food size
    food.scale = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
    
    const centerX = food.x * gridSize + gridSize/2;
    const centerY = food.y * gridSize + gridSize/2;
    
    // Create gradient for food
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, (gridSize/2) * food.scale
    );
    
    gradient.addColorStop(0, '#ff5252');
    gradient.addColorStop(1, '#d32f2f');
    
    ctx.fillStyle = gradient;
    
    // Draw food with pulsing animation
    ctx.beginPath();
    ctx.arc(
        centerX,
        centerY,
        (gridSize/2 - 2) * food.scale,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function gameOver() {
    clearInterval(gameLoop);
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
    
    setTimeout(() => {
        snake = [{ x: 10, y: 10, actualX: 10 * gridSize, actualY: 10 * gridSize }];
        dx = 1; // Start moving right
        dy = 0;
        score = 0;
        food = generateFood();
        document.getElementById('score').textContent = '0';
        gameLoop = setInterval(drawGame, 100);
    }, 2000);
}

// Start the game
dx = 1; // Start moving right
dy = 0;
gameLoop = setInterval(drawGame, 100);
document.getElementById('highScore').textContent = highScore;

// Initial draw to show the game state
drawGame();