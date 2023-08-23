const SIZE = 290;
const SEGMENT_SIZE = 10;
const INITIAL_SNAKE_POSITION = [
  { x: 7 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 6 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 5 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 4 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 3 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 2 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 1 * SEGMENT_SIZE, y: 20, direction: "right" },
  { x: 0 * SEGMENT_SIZE, y: 20, direction: "right" },
];

function getRandomCoordinates() {
  const max = (SIZE - SEGMENT_SIZE) / SEGMENT_SIZE + 1;
  return {
    x: Math.floor(Math.random() * max) * SEGMENT_SIZE,
    y: Math.floor(Math.random() * max) * SEGMENT_SIZE,
  };
}

var snakeBodyState = INITIAL_SNAKE_POSITION;
var directionQueue = [];
var currentDirection = "right";
var directionChangeScheduled = false;

var eatenCount = 0;
var segmentToAdd = null;
var isPlaying = false;
var animationLoop;

//{x: y: direction: }
//{ direction: "right", currentSegmentIndex: 5 },

var foodLocation = getRandomCoordinates();

window.onload = function () {
  document.getElementById("start").addEventListener("click", start);
  initialiseBoard();
};

function initialiseBoard() {
  const board = document.getElementById("board");
  board.append(createFood());
  renderSnakeBody(snakeBodyState);
}

function createFood() {
  let food = document.createElement("div");
  food.id = "food";
  food.style.position = "absolute";
  food.style.top = foodLocation.y;
  food.style.left = foodLocation.x;

  return food;
}

function moveFoodLocation() {
  foodLocation = getRandomCoordinates();
  //keep generating co ordinates until its not on a snake segment
  while (
    snakeBodyState.some(
      (segment) => segment.x === foodLocation.x && segment.y === foodLocation.y
    )
  ) {
    foodLocation = getRandomCoordinates();
  }
  renderFood();
}
function renderSnakeBody(snakeState) {
  const board = document.getElementById("board");
  const segments = Array.from(document.getElementsByClassName("snake-segment"));
  segments.forEach((segment) => {
    segment.remove();
  });
  snakeState.forEach((item, index) => {
    board.append(createSnakeSegment(item.x, item.y, index === 0));
  });
}

function createSnakeSegment(x, y, isHead) {
  let segment = document.createElement("div");
  segment.classList.add("snake-segment");
  if (isHead) segment.classList.add("snake-head");

  segment.style.top = y;
  segment.style.left = x;
  return segment;
}

function start() {
  animationLoop = setInterval(handleFrameChange, 60);
  isPlaying = true;
  this.setAttribute("disabled", "disabled");
  eatenCount = 0;
  renderScore();
}

function handleFrameChange() {
  if (segmentToAdd !== null) {
    snakeBodyState.push(segmentToAdd);
    segmentToAdd = null;
  }
  handleFoodEaten();

  updateSegmentDirections();
  const newSnake = snakeBodyState.map((segment) => {
    if (segment.direction === "right") {
      return { x: segment.x + SEGMENT_SIZE, y: segment.y, direction: "right" };
    }
    if (segment.direction === "left") {
      return { x: segment.x - SEGMENT_SIZE, y: segment.y, direction: "left" };
    }
    if (segment.direction === "up") {
      return { x: segment.x, y: segment.y - SEGMENT_SIZE, direction: "up" };
    }
    if (segment.direction === "down") {
      return { x: segment.x, y: segment.y + SEGMENT_SIZE, direction: "down" };
    }
  });
  snakeBodyState = newSnake;
  if (handleIsDead()) return;

  renderSnakeBody(snakeBodyState);
  directionChangeScheduled = false;
}

function addToDirectionQueue(direction) {
  const item = {
    x: snakeBodyState[0].x,
    y: snakeBodyState[0].y,
    direction: direction,
  };
  directionQueue.push(item);
}

function updateSegmentDirections() {
  snakeBodyState.forEach((snakeSegment, segIndex) => {
    directionQueue.forEach((directionItem) => {
      if (
        directionItem.x === snakeSegment.x &&
        directionItem.y === snakeSegment.y
      )
        snakeBodyState[segIndex].direction = directionItem.direction;
    });
  });

  const newQueue = directionQueue.filter((dir) => {
    return snakeBodyState.some((seg) => seg.x === dir.x && seg.y === dir.y);
  });
  directionQueue = newQueue;

}

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowLeft":
      changeDirection("left");
      // Left pressed
      break;
    case "ArrowRight":
      changeDirection("right");

      // Right pressed
      break;
    case "ArrowUp":
      changeDirection("up");
      // Up pressed
      break;
    case "ArrowDown":
      changeDirection("down");

      // Down pressed
      break;
  }
});

function changeDirection(direction) {
  const horizontalCondition =
    currentDirection !== "right" && currentDirection !== "left";

  const verticalCondition =
    currentDirection !== "up" && currentDirection !== "down";

  let canChangeDirection = false;
  if ((direction === "right" || direction === "left") && horizontalCondition) {
    canChangeDirection = true;
  }
  if ((direction === "up" || direction === "down") && verticalCondition) {
    canChangeDirection = true;
  }

  if (canChangeDirection && directionChangeScheduled === false && isPlaying) {
    directionChangeScheduled = true;
    currentDirection = direction;
    addToDirectionQueue(direction);
  }
}

function handleFoodEaten() {
  if (
    snakeBodyState[0].x === foodLocation.x &&
    snakeBodyState[0].y === foodLocation.y
  ) {
    eatenCount++;
    moveFoodLocation();
    renderScore();
    segmentToAdd = snakeBodyState[snakeBodyState.length - 1];
  }
}

function renderScore() {
  document.getElementById("eaten-count").textContent = `Score ${eatenCount}`;
}
function renderFood() {
  let food = document.getElementById("food");
  food.style.top = foodLocation.y;
  food.style.left = foodLocation.x;
}

function handleIsDead() {
  if (
    snakeBodyState[0].x > SIZE ||
    snakeBodyState[0].x < 0 ||
    snakeBodyState[0].y > SIZE ||
    snakeBodyState[0].y < 0 ||
    hasSnakeEatenItself()
  ) {
    isPlaying = false;
    clearInterval(animationLoop);
    resetBoard();
    return true;
  }
  return false;
}

function hasSnakeEatenItself() {
  return snakeBodyState.some((segN, indexN) => {
    return snakeBodyState.some(
      (segK, indexK) =>
        indexN !== indexK && segN.x === segK.x && segN.y === segK.y
    );
  });
}

function resetBoard() {
  snakeBodyState = INITIAL_SNAKE_POSITION;
  directionQueue = [];
  currentDirection = "right";
  directionChangeScheduled = false;

  eatenCount = 0;
  segmentToAdd = null;
  document.getElementById("start").removeAttribute("disabled");
  renderSnakeBody(snakeBodyState);
}
