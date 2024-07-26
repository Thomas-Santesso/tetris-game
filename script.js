const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 30;
const BOARD_WIDTH = COLS * BLOCK_SIZE;
const BOARD_HEIGHT = ROWS * BLOCK_SIZE;
const GRAVITY_INTERVAL = 500; // Time in milliseconds

canvas.width = BOARD_WIDTH;
canvas.height = BOARD_HEIGHT;

const shapes = [
    [[1, 1, 1, 1]], // I
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // O
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]]  // J
];

const colors = ['#00FFFF', '#800080', '#FFFF00', '#00FF00', '#FF0000', '#FFA500', '#0000FF'];

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let currentShape, currentShapeRow, currentShapeCol;
let gameInterval, gravityInterval;
let score = 0;

function drawBoard() {
    context.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c]) {
                context.fillStyle = board[r][c];
                context.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#000';
                context.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawShape() {
    context.fillStyle = colors[currentShape.color];
    for (let r = 0; r < currentShape.shape.length; r++) {
        for (let c = 0; c < currentShape.shape[r].length; c++) {
            if (currentShape.shape[r][c]) {
                context.fillRect((currentShapeCol + c) * BLOCK_SIZE, (currentShapeRow + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#000';
                context.strokeRect((currentShapeCol + c) * BLOCK_SIZE, (currentShapeRow + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function isValidMove(shape, row, col) {
    for (let r = 0; r < shape.shape.length; r++) {
        for (let c = 0; c < shape.shape[r].length; c++) {
            if (shape.shape[r][c]) {
                let boardRow = row + r;
                let boardCol = col + c;
                if (boardRow < 0 || boardRow >= ROWS || boardCol < 0 || boardCol >= COLS || board[boardRow][boardCol]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function mergeShape(shape, row, col) {
    for (let r = 0; r < shape.shape.length; r++) {
        for (let c = 0; c < shape.shape[r].length; c++) {
            if (shape.shape[r][c]) {
                board[row + r][col + c] = colors[shape.color];
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell)) {
            board.splice(r, 1);
            board.unshift(Array(COLS).fill(null));
            linesCleared++;
            r++; // Check the same row again
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100;
        scoreElement.textContent = score;
    }
}

function moveShapeDown() {
    if (isValidMove(currentShape, currentShapeRow + 1, currentShapeCol)) {
        currentShapeRow++;
    } else {
        mergeShape(currentShape, currentShapeRow, currentShapeCol);
        clearLines();
        newShape();
    }
    drawBoard();
    drawShape();
}

function newShape() {
    const randomIndex = Math.floor(Math.random() * shapes.length);
    currentShape = { shape: shapes[randomIndex], color: randomIndex };
    currentShapeRow = 0;
    currentShapeCol = Math.floor(COLS / 2) - Math.floor(currentShape.shape[0].length / 2);
    if (!isValidMove(currentShape, currentShapeRow, currentShapeCol)) {
        gameOver();
    }
}

function rotateShape() {
    const rotatedShape = currentShape.shape[0].map((_, i) => currentShape.shape.map(row => row[i])).reverse();
    const originalShape = currentShape.shape;
    currentShape.shape = rotatedShape;
    if (!isValidMove(currentShape, currentShapeRow, currentShapeCol)) {
        currentShape.shape = originalShape;
    }
}

function moveShape(dir) {
    if (dir === 'left') {
        if (isValidMove(currentShape, currentShapeRow, currentShapeCol - 1)) {
            currentShapeCol--;
        }
    } else if (dir === 'right') {
        if (isValidMove(currentShape, currentShapeRow, currentShapeCol + 1)) {
            currentShapeCol++;
        }
    } else if (dir === 'down') {
        moveShapeDown();
    }
    drawBoard();
    drawShape();
}

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') {
        moveShape('left');
    } else if (event.code === 'ArrowRight') {
        moveShape('right');
    } else if (event.code === 'ArrowDown') {
        moveShape('down');
    } else if (event.code === 'ArrowUp') {
        rotateShape();
    }
});

function gameOver() {
    clearInterval(gameInterval);
    clearInterval(gravityInterval);
    alert('Game Over');
    setTimeout(startGame, 1000); // Restart the game after 1 second
}

function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0;
    scoreElement.textContent = score;
    newShape();
    gameInterval = setInterval(moveShapeDown, GRAVITY_INTERVAL);
    drawBoard();
    drawShape();
}

startGame();
