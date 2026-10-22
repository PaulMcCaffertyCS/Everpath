import type { Direction } from "../../shared/types";
import type { SpriteKey } from "../../utils/ImageUtils";
import { allSpriteSources } from "../../utils/ImageUtils";

type DirectionalImages = Record<Direction, HTMLImageElement>;
type GameSprites = Record<SpriteKey, DirectionalImages>;

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
  const gameSprites = {} as GameSprites;
  const loadTasks: Promise<void>[] = [];

  (Object.keys(allSpriteSources) as SpriteKey[]).forEach((key) => {
    gameSprites[key] = {} as DirectionalImages;
    const directionGroup = allSpriteSources[key];

    (Object.keys(directionGroup) as Direction []).forEach((direction) => {
      const path = directionGroup[direction];
      const task = loadImage(path).then((loadedImage) => {
        gameSprites[key][direction] = loadedImage;
      });

      loadTasks.push(task);
    });
  });

  await Promise.all(loadTasks);
  return gameSprites;
}

export type { GameSprites };
export { loadGameSprites };