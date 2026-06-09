(function attachSnakeCore(root, factory) {
  const core = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = core;
  }

  root.SnakeCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createSnakeCore() {
  function createInitialSnake() {
    return [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
  }

  function samePosition(first, second) {
    return first.x === second.x && first.y === second.y;
  }

  function isDirectionAllowed(current, next) {
    const unchanged = current.x === next.x && current.y === next.y;
    const reversed = current.x === -next.x && current.y === -next.y;
    return !unchanged && !reversed;
  }

  function nextHead(head, direction) {
    return { x: head.x + direction.x, y: head.y + direction.y };
  }

  function inspectMove(snake, direction, food, columns, rows) {
    const head = nextHead(snake[0], direction);
    const willEat = samePosition(head, food);
    const hitWall = head.x < 0 || head.x >= columns || head.y < 0 || head.y >= rows;
    // On a normal step the tail leaves its current cell, so that cell is safe.
    const collisionBody = willEat ? snake : snake.slice(0, -1);
    const hitSelf = collisionBody.some(part => samePosition(part, head));

    return { head, willEat, hitWall, hitSelf, collided: hitWall || hitSelf };
  }

  function randomFood(snake, columns, rows, random = Math.random) {
    const freeCells = [];

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        if (!snake.some(part => part.x === x && part.y === y)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length === 0) return null;
    return freeCells[Math.floor(random() * freeCells.length)];
  }

  return {
    createInitialSnake,
    inspectMove,
    isDirectionAllowed,
    nextHead,
    randomFood,
    samePosition
  };
});
