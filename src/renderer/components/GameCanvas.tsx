import { useEffect, useRef, useState } from "react";
import GameEngine from "../game/engine";
import { loadGameSprites } from "../game/sprites";

interface GameCanvasProps {
  engine: GameEngine;
  onSwipeOpenPlayerMenu: () => void;
}

type SwipeStart = {
  pointerId: number;
  x: number;
  y: number;
}

type SwipeTrail = {
  pointerId: number;
  points: { x: number, y: number }[];
  endedAt: number | null;
}

export default function GameCanvas({ engine, onSwipeOpenPlayerMenu }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const swipeStartRef = useRef<SwipeStart | null>(null);
  const swipeTrailRef = useRef<SwipeTrail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const keys = new Set<string>();

    let cancelled = false;
    let animationFrame = 0;

    async function start() {
      try {
        const sprites = await loadGameSprites();

        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }

        const context = canvas.getContext("2d");
        if (!context) {
          return;
        }

        let lastTime = performance.now();

        function frame(currentTime: number) {
          const deltaSeconds = Math.min((currentTime - lastTime) / 1000, 0.1);
          lastTime = currentTime;

          engine.update(deltaSeconds, keys);
          engine.render(context!, canvas!.width, canvas!.height, sprites);

          const trail = swipeTrailRef.current;
          if (trail) {
            const fadeDuration = 150;
            const alpha = trail.endedAt === null ? 1 : Math.max(0, 1 - (currentTime - trail.endedAt) / fadeDuration);

            if (alpha === 0) {
              swipeTrailRef.current = null;
            } else {
              context!.save();
              context!.globalAlpha = alpha;
              context!.strokeStyle = "rgba(255, 215, 107, 0.8)"
              context!.lineWidth = 5;
              context!.lineCap = "round";
              context!.lineJoin = "round";
              context!.beginPath();
              context!.moveTo(trail.points[0].x, trail.points[0].y);

              for (const point of trail.points.slice(1)) {
                context!.lineTo(point.x, point.y);
              }

              context!.stroke();
              context!.restore();
            }
          }

          animationFrame = requestAnimationFrame(frame);
        }

        animationFrame = requestAnimationFrame(frame);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Could not load game sprites"
          );
        }
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      keys.add(event.key);
      keys.add(
        event.key.toLowerCase()
      );
    }

    function handleKeyUp(event: KeyboardEvent) {
      keys.delete(event.key);
      keys.delete(event.key.toLowerCase());
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // "void" modifier intentionally prevents accidental Promise leaks of an async function call
    //  by immediately returning undefined.
    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [engine]);

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (event.currentTarget.width / rect.width),
      y: (event.clientY - rect.top) * (event.currentTarget.height / rect.height)
    };
  }

  return (
    <>
      {loadError && <p role="alert">{loadError}</p>}
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="game-canvas"
        onPointerDown={event => {
          if (event.pointerType !== "mouse" || event.button !== 0) {
            return;
          }

          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          swipeStartRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY
          };
          swipeTrailRef.current = {
            pointerId: event.pointerId,
            points: [canvasPoint(event)],
            endedAt: null
          }
        }}
        onPointerMove={event => {
          const trail = swipeTrailRef.current;
          if (!trail || trail.pointerId !== event.pointerId || trail.endedAt !== null) {
            return;
          }

          trail.points.push(canvasPoint(event));
        }}
        onPointerUp={event => {
          const start = swipeStartRef.current;
          if (!start || start.pointerId !== event.pointerId) {
            return;
          }

          if (swipeTrailRef.current) {
            swipeTrailRef.current.points.push(canvasPoint(event));
            swipeTrailRef.current.endedAt = performance.now();
          }

          swipeStartRef.current = null;
          const deltaX = Math.abs(event.clientX - start.x);
          const deltaY = Math.abs(event.clientY - start.y);
          if (deltaX >= window.innerWidth * 0.35 && deltaX > deltaY) {
            onSwipeOpenPlayerMenu();
          }
        }}
        onPointerCancel={event => {
          if (swipeStartRef.current?.pointerId === event.pointerId) {
            swipeStartRef.current = null;
          }
        }}
        onLostPointerCapture={event => {
          if (swipeStartRef.current?.pointerId === event.pointerId) {
            swipeStartRef.current = null;
          }
        }}
      />
    </>
  );
}