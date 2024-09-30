const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const mainMenu = document.getElementById('mainMenu');
const scoreDisplay = document.getElementById('scoreDisplay');
const currentScoreElement = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');

const gridSize = 20;
const canvasSize = 400;
const snake = [{ x: gridSize * 5, y: gridSize * 5 }];
let direction = { x: 0, y: 0 };
let food = { x: gridSize * 10, y: gridSize * 10 };
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.textContent = highScore;
let gameInterval;
const appleImage = new Image();
appleImage.src = 'assets/apple.png';

const snakeHeadImage = new Image();
snakeHeadImage.src = 'assets/snake.png';

const snakeBodyImage = new Image();
snakeBodyImage.src = 'assets/snakeskin.png';

appleImage.onload = () => {
    snakeHeadImage.onload = () => {
        snakeBodyImage.onload = () => {

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
            const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
            snake.unshift(head);

            if (head.x === food.x && head.y === food.y) {
                score++;
                currentScoreElement.textContent = score;
                placeFood();
            } else {
                snake.pop();
            }

            if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize || snakeCollision(head)) {
                endGame();
            }
        }

        function snakeCollision(head) {
            return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
        }

        function placeFood() {
            food = {
                x: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvasSize / gridSize)) * gridSize
            };
        }

        function resetGame() {
            snake.length = 1;
            snake[0] = { x: gridSize * 5, y: gridSize * 5 };
            direction = { x: 0, y: 0 };
            score = 0;
            currentScoreElement.textContent = score;
            placeFood();
            gameOverElement.style.display = 'none';
        }

        function endGame() {
            clearInterval(gameInterval);
            gameOverElement.style.display = 'block';
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('highScore', highScore);
            }
            mainMenu.style.display = 'block';
            scoreDisplay.style.display = 'none';
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
    };

    snakeHeadImage.onerror = () => {
        console.error('Failed to load the snake head image.');
    };
};

appleImage.onerror = () => {
    console.error('Failed to load the apple image.');
    };
};