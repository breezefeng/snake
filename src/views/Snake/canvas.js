import React from 'react'

export const COLS = 66
export const ROWS = 46
export const GAP_SIZE = 1
export const CELL_SIZE = 10
export const CANVAS_WIDTH = COLS * (CELL_SIZE + GAP_SIZE)
export const CANVAS_HEIGHT = ROWS * (CELL_SIZE + GAP_SIZE)

export function createCanvasElement() {
  // const canvas = document.createElement('canvas')
  // canvas.width = CANVAS_WIDTH
  // canvas.height = CANVAS_HEIGHT
  // return canvas
  return (
    <canvas ref="game" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
  )
}

export function checkCollision(a, b) {
  return a.x === b.x && a.y === b.y
}

export function getRandomPosition(snake = []) {
  const position = {
    x: getRandomNumber(0, COLS - 1),
    y: getRandomNumber(0, ROWS - 1)
  }

  if (isEmptyCell(position, snake)) {
    return position
  }

  return getRandomPosition(snake)
}

export function renderGameOver(ctx) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  const textX = CANVAS_WIDTH / 2
  const textY = CANVAS_HEIGHT / 2

  drawText(ctx, 'GAME OVER!', textX, textY, 'black', 25)
}

export function renderScene(ctx, scene) {
  renderBackground(ctx)
  renderScore(ctx, scene.score)
  renderApples(ctx, scene.apples)
  renderSnake(ctx, scene.snake)
}

export function renderSnake(ctx, snake) {
  snake.forEach((segment, index) => paintCell(ctx, wrapBounds(segment), getSegmentColor(index)))
}

export function renderApples(ctx, apples) {
  apples.forEach(apple => paintCell(ctx, apple, 'red'))
}

export function renderScore(ctx, score) {
  const textX = CANVAS_WIDTH / 2
  const textY = CANVAS_HEIGHT / 2

  drawText(ctx, score.toString(), textX, textY, 'rgba(0, 0, 0, 0.1)', 150)
}

function drawText(ctx, text, x, y, fillStyle,
  fontSize, horizontalAlign = 'center', verticalAlign = 'middle') {
  ctx.fillStyle = fillStyle
  ctx.font = `bold ${fontSize}px sans-serif`

  const textX = x
  const textY = y

  ctx.textAlign = horizontalAlign
  ctx.textBaseline = verticalAlign

  ctx.fillText(text, textX, textY)
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function isEmptyCell(position, snake) {
  return !snake.some(segment => checkCollision(segment, position))
}

function getSegmentColor(index) {
  return index === 0 ? 'black' : '#2196f3'
}

function paintCell(ctx, point, color) {
  const x = point.x * CELL_SIZE + (point.x * GAP_SIZE)
  const y = point.y * CELL_SIZE + (point.y * GAP_SIZE)

  ctx.fillStyle = color
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
}

function renderBackground(ctx) {
  ctx.fillStyle = '#EEE'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
}

function wrapBounds(point) {
  point.x = point.x >= COLS ? 0 : point.x < 0 ? COLS - 1 : point.x
  point.y = point.y >= ROWS ? 0 : point.y < 0 ? ROWS - 1 : point.y

  return point
}
