import { useEffect, useRef, useState } from "react";
import GameEngine from "../game/engine";
import { loadGameSprites } from "../game/sprites";

interface GameCanvasProps {
  engine: GameEngine;
}

export default function GameCanvas({ engine }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
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

    const keys = new Set<string>();

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

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [engine]);

  return (
    <>
      {loadError && <p role="alert">{loadError}</p>}
      <canvas
        ref={canvasRef}
        width={696}
        height={456}
        className="game-canvas"
      />
    </>
  );
}