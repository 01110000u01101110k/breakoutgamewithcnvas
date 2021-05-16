const score = document.getElementById("score");
const life = document.getElementById("life");

const startBtn = document.getElementById("btn");
const canvas = document.getElementById("playField");
const context = canvas.getContext("2d");

let costOneBrick = 50;

let scoreCount = 0;
let lifeCount = 3;

let directionOfMovement = null;

let firstStart = true;

let gameLoop = null;
let isOver = true;

let playFieldSizes = {
  width: 700,
  height: 500,
};

const platformSpeed = 10;

let platformSizes = {
  width: 100,
  height: 20,
};

let platformPosition = {
  x: playFieldSizes.width / 2 - platformSizes.width / 2,
  y: playFieldSizes.height - platformSizes.height,
};

let ballSpeed = {
  x: 5,
  y: 5,
};

let ballSize = 15;

let positionBall = {
  x: platformPosition.x + platformSizes.width / 2,
  y: playFieldSizes.height - platformSizes.height - ballSize,
};

let grid = {
  x: 12,
  y: 3,
};
let brickCount = grid.x * grid.y;
let brokenBrick = 0;
let brickOffsets = {
  x: 5,
  y: 5,
};
let brickSectionOffsets = {
  x: 20,
  y: 20,
};
let brickSizes = {
  width: 50,
  height: 20,
};

let bricks = [];

let brickColor = "#ffc200";
let platformColor = "#cecece";
let ballColor = "#811ddd";

const setStartPosition = (isWin) => {
  isOver = true;
  cancelAnimationFrame(gameLoop);
  gameLoop = null;

  platformPosition = {
    x: playFieldSizes.width / 2 - platformSizes.width / 2,
    y: playFieldSizes.height - platformSizes.height,
  };

  ballSpeed = {
    x: 5,
    y: 5,
  };

  positionBall = {
    x: playFieldSizes.width / 2 - ballSize / 2,
    y: playFieldSizes.height - platformSizes.height - ballSize,
  };

  if (lifeCount !== 0) {
    lifeCount--;
  }
  if (lifeCount === 0) {
    alert(`поражение, счет: ${scoreCount}`);
    firstStart = true;
    scoreCount = 0;
    score.textContent = scoreCount;
    lifeCount = 3;
    brokenBrick = 0;
    createArrBricks(firstStart);
  }
  if (isWin) {
    firstStart = true;
    scoreCount = 0;
    score.textContent = scoreCount;
    lifeCount = 3;
    brokenBrick = 0;
    updateCanvas();
  }
  life.textContent = lifeCount;
};

const endGame = () => {
  setStartPosition();
};

const checkCollisionBallWithPlatform = () => {
  if (
    positionBall.y + ballSpeed.y >
    playField.height - (ballSize / 2 + platformSizes.height)
  ) {
    if (
      positionBall.x >= platformPosition.x &&
      positionBall.x <= platformPosition.x + platformSizes.width
    ) {
      ballSpeed.y = -ballSpeed.y;
    }
  }
};

const checkCollisionBallWithPlayField = () => {
  if (
    positionBall.x + ballSpeed.x < ballSize / 2 ||
    positionBall.x + ballSpeed.x > playFieldSizes.width - ballSize / 2
  ) {
    ballSpeed.x = -ballSpeed.x;
  }
  if (positionBall.y + ballSpeed.y < ballSize / 2) {
    ballSpeed.y = -ballSpeed.y;
  }
  if (positionBall.y + ballSpeed.y > playFieldSizes.height) {
    endGame();
  }
};

const checkCollisionBallWithBrick = () => {
  for (let i = 0; i < grid.x; i++) {
    for (let j = 0; j < grid.y; j++) {
      let brick = bricks[i][j];
      if (
        positionBall.y > brick.y &&
        positionBall.y < brick.y + brickSizes.height
      ) {
        if (
          positionBall.x > brick.x &&
          positionBall.x < brick.x + brickSizes.width &&
          bricks[i][j].exist
        ) {
          scoreCount += costOneBrick;
          score.textContent = scoreCount;
          ballSpeed.y = -ballSpeed.y;
          bricks[i][j].exist = false;
          brokenBrick++;
          if (brokenBrick === brickCount) {
            alert(`победа, счет: ${scoreCount}`);
            setStartPosition(true);
          }
        }
      }
    }
  }
};

const createBrick = (offsetX, offsetY) => {
  context.beginPath();
  context.rect(offsetX, offsetY, brickSizes.width, brickSizes.height);
  context.fillStyle = brickColor;
  context.fill();
  context.closePath();
};

const createArrBricks = (first) => {
  for (let i = 0; i < grid.x; i++) {
    if (first) {
      bricks[i] = [];
    }
    for (let j = 0; j < grid.y; j++) {
      if (first) {
        console.log("first");
        let offsetX =
          i * (brickSizes.width + brickOffsets.x) + brickSectionOffsets.x;
        let offsetY =
          j * (brickSizes.height + brickOffsets.y) + brickSectionOffsets.y;
        bricks[i][j] = { x: offsetX, y: offsetY, exist: true };
        createBrick(offsetX, offsetY);
      }
      if (!first && bricks[i][j].exist) {
        createBrick(bricks[i][j].x, bricks[i][j].y);
      }
    }
  }
  if (firstStart) {
    firstStart = false;
  }
};

const createBall = () => {
  context.beginPath();
  checkCollisionBallWithPlayField();
  if (gameLoop) {
    positionBall.x += ballSpeed.x;
    positionBall.y += ballSpeed.y;
    context.arc(
      positionBall.x,
      positionBall.y,
      ballSize,
      0,
      Math.PI * ballSize
    );
  } else {
    positionBall.x = platformPosition.x + platformSizes.width / 2;
    if (directionOfMovement === "left") {
      if (Math.sign(ballSpeed.x) === 1) {
        ballSpeed.x = -ballSpeed.x;
        console.log(ballSpeed.x);
      }
    } else if (directionOfMovement === "right") {
      if (Math.sign(ballSpeed.x) === -1) {
        ballSpeed.x = -ballSpeed.x;
        console.log(ballSpeed.x);
      }
    }
    context.arc(
      positionBall.x,
      positionBall.y,
      ballSize,
      0,
      Math.PI * ballSize
    );
  }

  context.fillStyle = ballColor;
  context.fill();
  context.closePath();
};

const createPlatform = () => {
  context.beginPath();
  context.rect(
    platformPosition.x,
    platformPosition.y,
    platformSizes.width,
    platformSizes.height
  );
  context.fillStyle = platformColor;
  context.fill();
  context.closePath();
};

const goLeft = () => {
  directionOfMovement = "left";
};

const goRight = () => {
  directionOfMovement = "right";
};

const controlPlatform = (event) => {
  if (
    event.key.toLowerCase() === "a" ||
    event.key.toLowerCase() === "ф" ||
    event.key == "ArrowLeft"
  ) {
    goLeft();
    if (!gameLoop) {
      updateCanvas();
    }
  } else if (
    event.key.toLowerCase() === "d" ||
    event.key.toLowerCase() === "в" ||
    event.key == "ArrowRight"
  ) {
    goRight();
    if (!gameLoop) {
      updateCanvas();
    }
  } else if (event.key === "Enter" || event.key == " ") {
    startGame();
  }
};

const updateCanvas = () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  createArrBricks(firstStart);
  createBall();
  if (directionOfMovement === "left") {
    if (platformPosition.x < 0) {
      platformPosition.x = playFieldSizes.width - platformSizes.width / 2;
    } else {
      platformPosition.x -= platformSpeed;
    }
  } else if (directionOfMovement === "right") {
    if (platformPosition.x + platformSizes.width / 2 > playFieldSizes.width) {
      platformPosition.x = -platformSizes.width / 2;
    } else {
      platformPosition.x += platformSpeed;
    }
  }
  createPlatform();
  checkCollisionBallWithPlatform();
  checkCollisionBallWithBrick();
  if (!isOver) {
    gameLoop = requestAnimationFrame(updateCanvas);
  }
};
updateCanvas();

const startGame = () => {
  if (!gameLoop) {
    isOver = false;
    requestAnimationFrame(updateCanvas);
  }
};

startBtn.addEventListener("click", startGame);

document.addEventListener("keydown", controlPlatform);
document.addEventListener("keyup", () => {
  directionOfMovement = null;
});
