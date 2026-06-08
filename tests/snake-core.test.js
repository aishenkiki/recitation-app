const assert = require('node:assert/strict');
const test = require('node:test');
const SnakeCore = require('../snake-core');

test('creates a five-segment snake facing right', () => {
  const snake = SnakeCore.createInitialSnake();
  assert.equal(snake.length, 5);
  assert.deepEqual(snake[0], { x: 10, y: 10 });
  assert.deepEqual(snake.at(-1), { x: 6, y: 10 });
});

test('accepts perpendicular turns but rejects duplicate and reverse turns', () => {
  const right = { x: 1, y: 0 };
  assert.equal(SnakeCore.isDirectionAllowed(right, { x: 0, y: -1 }), true);
  assert.equal(SnakeCore.isDirectionAllowed(right, { x: 1, y: 0 }), false);
  assert.equal(SnakeCore.isDirectionAllowed(right, { x: -1, y: 0 }), false);
});

test('allows moving into the tail cell when the tail moves away', () => {
  const snake = [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
    { x: 0, y: 1 }
  ];
  const move = SnakeCore.inspectMove(snake, { x: -1, y: 0 }, { x: 4, y: 4 }, 5, 5);
  assert.equal(move.hitSelf, false);
  assert.equal(move.collided, false);
});

test('treats the tail cell as occupied when eating prevents tail movement', () => {
  const snake = [
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 0, y: 2 },
    { x: 0, y: 1 }
  ];
  const move = SnakeCore.inspectMove(snake, { x: -1, y: 0 }, { x: 0, y: 1 }, 5, 5);
  assert.equal(move.willEat, true);
  assert.equal(move.hitSelf, true);
});

test('detects walls and body collisions', () => {
  const wallMove = SnakeCore.inspectMove([{ x: 0, y: 0 }], { x: -1, y: 0 }, { x: 2, y: 2 }, 3, 3);
  assert.equal(wallMove.hitWall, true);

  const snake = [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 2 }, { x: 1, y: 1 }];
  const bodyMove = SnakeCore.inspectMove(snake, { x: 0, y: 1 }, { x: 0, y: 0 }, 4, 4);
  assert.equal(bodyMove.hitSelf, true);
});

test('places food only on free cells and reports a full board', () => {
  const snake = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }];
  assert.deepEqual(SnakeCore.randomFood(snake, 2, 2, () => 0.99), { x: 1, y: 1 });
  assert.equal(SnakeCore.randomFood([...snake, { x: 1, y: 1 }], 2, 2), null);
});
