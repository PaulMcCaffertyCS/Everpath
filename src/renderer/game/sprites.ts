import { characterSpriteUp, characterSpriteDown, characterSpriteLeft, characterSpriteRight } from "../../utils/ImageUtils";

interface GameSprites {
  player: {
    up: HTMLImageElement;
    down: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    image.onload = () => resolve(image);
    image.onerror = () => {
      reject(new Error(`Failed to load image: src=${src}`));
    };

    image.src = src;
  });
}

async function loadGameSprites(): Promise<GameSprites> {
  const [up, down, left, right] = await Promise.all([
    loadImage(characterSpriteUp),
    loadImage(characterSpriteDown),
    loadImage(characterSpriteLeft),
    loadImage(characterSpriteRight)
  ]);

  return { player: { up, down, left, right } };
}

export type { GameSprites };
export { loadGameSprites };