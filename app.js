let wasmModule;
let snake = [{ x: 100, y: 100 }];
let direction = { x: 20, y: 0 };
let food = { x: 200, y: 200 };
let score = 0;
const canvasSize = 400;
const gridSize = 20;
const currentScoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const mainMenu = document.getElementById('mainMenu');
const scoreDisplay = document.getElementById('scoreDisplay');
const startButton = document.getElementById('startButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameInterval;

const appleImage = new Image();
appleImage.src = 'assets/apple.png';

const snakeHeadImage = new Image();
snakeHeadImage.src = 'assets/snake.png';

const snakeBodyImage = new Image();
snakeBodyImage.src = 'assets/snakeskin.png';

let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.textContent = highScore;

fetch('snake.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {}))
    .then(results => {
        wasmModule = results.instance.exports;
        wasmModule.update_position = Module.cwrap('update_position', 'number', ['number', 'number']);
        wasmModule.check_collision = Module.cwrap('check_collision', 'number', ['number', 'number', 'number']);
        startButton.disabled = false; // Enable the start button after WebAssembly is loaded
    });

function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Малюємо голову змії
            ctx.drawImage(snakeHeadImage, segment.x, segment.y, gridSize, gridSize);
        } else {
            // Малюємо тіло змії
            ctx.drawImage(snakeBodyImage, segment.x, segment.y, gridSize, gridSize);
        }
    });
}

function drawFood() {
    ctx.drawImage(appleImage, food.x, food.y, gridSize, gridSize);
}

function updateSnake() {
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    snake.unshift(head); // Додаємо нову голову

    if (head.x === food.x && head.y === food.y) {
        score++;
        currentScoreElement.textContent = score;
        placeFood(); // Ставимо нове яблуко
    } else {
        snake.pop(); // Видаляємо хвіст, якщо їжу не з'їдено
    }

    // Трансформуємо тіло змії в масив для WebAssembly
    const bodyArray = new Int32Array(snake.length * 2); // Множимо на 2, бо координати x та y
    for (let i = 1; i < snake.length; i++) {
        bodyArray[(i - 1) * 2] = snake[i].x;
        bodyArray[(i - 1) * 2 + 1] = snake[i].y;
    }

    // Викликаємо WebAssembly для перевірки колізій
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || wasmModule.check_collision(head.x, head.y, bodyArray, snake.length - 1)) {
        endGame(); // Завершення гри, якщо є колізія
    }
}


function placeFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
    };
}

function resetGame() {
    snake = [{ x: 100, y: 100 }];
    direction = { x: 20, y: 0 };
    score = 0;
    currentScoreElement.textContent = score;
    placeFood();
    gameOverElement.style.display = 'none';
}

function endGame() {
    clearInterval(gameInterval);
    gameOverElement.style.display = 'block';
    mainMenu.style.display = 'block';
    scoreDisplay.style.display = 'none';
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('highScore', highScore);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    updateSnake();
}

document.addEventListener('keydown', event => {
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = { x: 0, y: -gridSize };
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = { x: 0, y: gridSize };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = { x: -gridSize, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = { x: gridSize, y: 0 };
            break;
    }
});

startButton.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    scoreDisplay.style.display = 'block';
    resetGame();
    gameInterval = setInterval(gameLoop, 150);
});