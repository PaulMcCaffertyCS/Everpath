import type { GameSprites } from "./sprites";
import { CHUNK_TILES, TILE_SIZE, ensureAroundPlayer } from "./world";
import { biomes } from "../../shared/types";
import type { BiomeType, GameState } from "../../shared/types";

class GameEngine {
  constructor(public state: GameState) {
    ensureAroundPlayer(this.state);
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number, sprites: GameSprites) {
    const state = this.state;
    const player = state.player;
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#151821";
    ctx.fillRect( 0, 0, width, height);
    const startX = Math.floor(player.position.x) - 14;
    const startY = Math.floor(player.position.y) - 9;

    for (let y = startY; y < startY + 19; y++) {
      for (let x = startX; x < startX + 29; x++) {
        const cx = Math.floor(x / CHUNK_TILES);
        const cy = Math.floor(y / CHUNK_TILES);
        const localX = ((x % CHUNK_TILES) + CHUNK_TILES) % CHUNK_TILES;
        const localY = ((y % CHUNK_TILES) + CHUNK_TILES) % CHUNK_TILES;
        const chunk = state.world.discovered[`${cx},${cy}`];

        if (!chunk) {
          continue;
        }

        const tile = chunk.tiles[localY * CHUNK_TILES + localX];

        switch (chunk.biome) {
          case "forest": ctx.fillStyle = "#24452f";
          case "hills": ctx.fillStyle = "#4a4630";
          case "lake": ctx.fillStyle = "#0e7575";
          case "meadow": ctx.fillStyle = "#38533a";
          case "ruins": ctx.fillStyle = "#403a4a";
          case "swamp": ctx.fillStyle = "#293c36";
        }

        ctx.fillRect(
          centerX + (x - player.position.x) * TILE_SIZE,
          centerY + (y - player.position.y) * TILE_SIZE,
          TILE_SIZE + 1,
          TILE_SIZE + 1
        );

        if (tile === 1) {
          ctx.fillStyle = "#1b2b20";
          ctx.fillRect(
            centerX + (x - player.position.x) * TILE_SIZE + 7,
            centerY + (y - player.position.y) * TILE_SIZE + 6,
            10,
            12
          );
        }

        if (tile === 2) {
          ctx.fillStyle = "#777";
          ctx.fillRect(
            centerX + (x - player.position.x) * TILE_SIZE + 5,
            centerY + (y - player.position.y) * TILE_SIZE + 8,
            13,
            8
          );
        }
      }
    }

    this.renderTowns(ctx, centerX, centerY);
    this.renderPlayer(ctx, centerX, centerY, sprites);
  }

  update(deltaSeconds: number, keys: Set<string>) {
    const speed = 4 * deltaSeconds;
    let dx = 0;
    let dy = 0;

    if (keys.has("w") || keys.has("ArrowUp")) {
      dy -= speed;
      this.state.player.direction = "up"
    }

    if (keys.has("s") || keys.has("ArrowDown")) {
      dy += speed;
      this.state.player.direction = "down"
    }

    if (keys.has("a") || keys.has("ArrowLeft")) {
      dx -= speed;
      this.state.player.direction = "left"
    }

    if (keys.has("d") || keys.has("ArrowRight")) {
      dx += speed;
      this.state.player.direction = "right"
    }

    this.state.player.position.x += dx;
    this.state.player.position.y += dy;
    this.state.updatedAt = Date.now();
    ensureAroundPlayer(this.state);

    // Temporary demonstration of progression.
    // This will eventually become the real
    // experience/progression system.

    this.state.player.experience += deltaSeconds * 0.5;
    const needed = this.state.player.level * 25;

    if (this.state.player.experience >= needed) {
      this.state.player.experience -= needed;
      this.state.player.level += 1;
      this.state.player.maxHp += 3;
      this.state.player.hp = this.state.player.maxHp;
    }
  }

  private renderTowns(ctx: CanvasRenderingContext2D, centerX: number, centerY: number) {
    const player = this.state.player;

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const town of chunk.towns) {
        const worldX = chunk.cx * CHUNK_TILES + town.x;
        const worldY = chunk.cy * CHUNK_TILES + town.y;
        const screenX = centerX + (worldX - player.position.x) * TILE_SIZE;
        const screenY = centerY + (worldY - player.position.y) * TILE_SIZE;

        if (screenX < -50 || screenX > 1000 || screenY < -50 || screenY > 1000) {
          continue;
        }

        ctx.fillStyle = "#c6a15b";
        ctx.fillRect(
          screenX + 3,
          screenY + 2,
          18,
          20
        );

        ctx.fillStyle = "#6f4737";
        ctx.fillRect(
          screenX + 7,
          screenY + 11,
          10,
          11
        );
      }
    }
  }

  private renderPlayer(context: CanvasRenderingContext2D, centerX: number, centerY: number, sprites: GameSprites) {
    const playerSprite = sprites.player[this.state.player.direction];

    context.drawImage(
      playerSprite,
      centerX - 12,
      centerY - 12,
      26,
      32
    );
  }
}

export default GameEngine;