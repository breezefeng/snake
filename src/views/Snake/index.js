import React, { createRef } from 'react'
import './index.css'
import { fromEvent, BehaviorSubject, interval, combineLatest, Subject } from 'rxjs'
import { map, filter, scan, startWith, distinctUntilChanged, share, withLatestFrom, skip, tap, takeWhile, takeUntil } from 'rxjs/operators'
import { renderScene, renderGameOver, CANVAS_WIDTH, CANVAS_HEIGHT } from './canvas'
import { nextDirection, move, generateSnake, eat, generateApples, isGameOver } from './utils'
import { DIRECTIONS, Key, SNAKE_LENGTH, POINTS_PER_APPLE, SPEED, FPS } from './constant'
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame'

const INITIAL_DIRECTION = DIRECTIONS[Key.RIGHT]
const startGame$ = new Subject()

function Snake() {
  const gameRef = createRef()

  function startGame() {
    startGame$.next()
    const ctx = gameRef.current.getContext('2d')

    const keydown$ = fromEvent(document, 'keydown').pipe(
      takeUntil(startGame$)
    )

    const direction$ = keydown$.pipe(
      map(event => DIRECTIONS[event.keyCode]),
      filter(direction => !!direction),
      scan(nextDirection),
      startWith(INITIAL_DIRECTION),
      distinctUntilChanged()
    )

    const length$ = new BehaviorSubject(SNAKE_LENGTH)

    const snakeLength$ = length$.pipe(
      scan((step, snakeLength) => snakeLength + step),
      share()
    )

    const score$ = snakeLength$.pipe(
      startWith(0),
      scan((score, _) => score + POINTS_PER_APPLE)
    )

    const ticks$ = interval(SPEED)

    const snake$ = ticks$.pipe(
      withLatestFrom(direction$, snakeLength$, (_, direction, snakeLength) => [direction, snakeLength]),
      scan(move, generateSnake()),
      share()
    )

    const apples$ = snake$.pipe(
      scan(eat, generateApples()),
      distinctUntilChanged(),
      share()
    )

    apples$.pipe(
      skip(1),
      tap(() => length$.next(POINTS_PER_APPLE))
    ).subscribe()

    const scene$ = combineLatest(snake$, apples$, score$, (snake, apples, score) => ({ snake, apples, score }))

    const game$ = interval(1000 / FPS, animationFrame).pipe(
      withLatestFrom(scene$, (_, scene) => scene),
      takeWhile(scene => !isGameOver(scene)),
      takeUntil(startGame$)
    )

    game$.subscribe({
      next: scene => renderScene(ctx, scene),
      complete: () => renderGameOver(ctx)
    })
  }

  return (
    <div className="app-container">
      <h3>贪吃蛇</h3>
      <p><button onClick={startGame}>开始游戏</button></p>
      <canvas ref={gameRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT}></canvas>
    </div>
  )
}

export default Snake