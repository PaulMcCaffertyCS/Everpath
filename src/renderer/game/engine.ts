import type { GameSprites } from "./sprites";
import { CHUNK_TILES, TILE_SIZE, ensureAroundPlayer } from "./world";
import { mobDefinitions } from "./mobs";
import { type Mob, type GameState, PLAYER_RADIUS, MOB_RADIUS, biomeToColor } from "../../shared/types";
import SimplePoint from "../../utils/typescript/SimplePoint";
import { HexColor, blend } from "../../utils/ColorUtils";

class GameEngine {
  constructor(public state: GameState) {
    ensureAroundPlayer(this.state);
  }

  render(context: CanvasRenderingContext2D, width: number, height: number, sprites: GameSprites) {
    const state = this.state;
    const player = state.player;
    const centerX = width / 2;
    const centerY = height / 2;
    context.imageSmoothingEnabled = false;
    context.fillStyle = "#151821";
    context.fillRect(0, 0, width, height);
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

        // context.fillStyle = this.biomeColorAt(new SimplePoint(x + 0.5, y + 0.5), "#000000").value;

        switch (chunk.biome) {
          case "forest": context.fillStyle = "#24452f"; break;
          case "hills": context.fillStyle = "#4a4630"; break;
          case "lake": context.fillStyle = "#02678f"; break;
          case "meadow": context.fillStyle = "#38533a"; break;
          case "mountains": context.fillStyle = "#83807e"; break;
          case "ruins": context.fillStyle = "#353338"; break;
          case "swamp": context.fillStyle = "#293c36"; break;
          default: context.fillStyle = "#000000";
        }

        context.fillRect(
          centerX + (x - player.position.x) * TILE_SIZE,
          centerY + (y - player.position.y) * TILE_SIZE,
          TILE_SIZE + 1,
          TILE_SIZE + 1
        );

        if (tile === 1) {
          context.fillStyle = "#1b2b20";

          context.fillRect(
            centerX + (x - player.position.x) * TILE_SIZE + 7,
            centerY + (y - player.position.y) * TILE_SIZE + 6,
            10,
            12
          );
        }

        if (tile === 2) {
          context.fillStyle = "#777";
          context.fillRect(
            centerX + (x - player.position.x) * TILE_SIZE + 5,
            centerY + (y - player.position.y) * TILE_SIZE + 8,
            13,
            8
          );
        }
      }
    }

    this.renderTowns(context, centerX, centerY);

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const mob of chunk.mobs) {
        this.renderMob(context, mob, centerX, centerY, sprites);
      }
    }

    this.renderPlayer(context, centerX, centerY, sprites);
  }

  update(deltaSeconds: number, keys: Set<string>) {
    const speed = this.state.player.movementSpeed * deltaSeconds;
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

    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    const player = this.state.player;

    const nextX = player.position.x + dx;
    // if (this.canPlayerMoveToTile(nextX, player.position.y)) {
    // if (this.doesTileAllowMovement(nextX, player.position.y)) {
      player.position.x = nextX;
    // }

    const nextY = player.position.y + dy;
    // if (this.canPlayerMoveToTile(nextY, player.position.y)) {
    // if (this.doesTileAllowMovement(nextY, player.position.y)) {
      player.position.y = nextY;
    // }

    this.state.updatedAt = Date.now();
    ensureAroundPlayer(this.state);
    this.updateMobs(deltaSeconds);

    // Temporary demonstration of progression.
    // This will eventually become the real
    // experience/progression system.

    this.state.player.experience += deltaSeconds * 0.5;
    const needed = this.state.player.level * 25;

    if (this.state.player.experience >= needed) {
      this.state.player.experience -= needed;
      this.state.player.level += 1;
      this.state.player.hp += 3;
    }
  }

  // Seriously broken
  private biomeColorAt(worldPos: SimplePoint, fallback: string): HexColor {
    const chunkCenter = worldPos.divideValue(CHUNK_TILES).minusValue(0.5);
    const localPoint = new SimplePoint(Math.floor(chunkCenter.x), Math.floor(chunkCenter.y));
    const tilePoint = chunkCenter.minus(localPoint);

    const colorAt = (chunkPoint: SimplePoint) => {
      const chunk = this.state.world.discovered[`${chunkPoint.x},${chunkPoint.y}`];
      return chunk ? (biomeToColor[chunk.biome] ?? fallback) : fallback;
    };

    const top = blend(
      new HexColor(colorAt(localPoint)),
      new HexColor(colorAt(localPoint.shiftX(1))),
      tilePoint.x
    );
    const bottom = blend(
      new HexColor(colorAt(localPoint.shiftY(1))),
      new HexColor(colorAt(localPoint.plusValue(1))),
      tilePoint.x
    );

    return blend(top, bottom, tilePoint.y);
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

  private renderMob(context: CanvasRenderingContext2D, mob: Mob, centerX: number, centerY: number, sprites: GameSprites) {
    const sprite = sprites[mob.base.species][mob.direction];
    if (!sprite) {
      return;
    }

    const player = this.state.player;

    const screenX = centerX + (mob.position.x - player.position.x) * TILE_SIZE;
    const screenY = centerY + (mob.position.y - player.position.y) * TILE_SIZE;
    const drawWidth = mob.base.rendering.width;
    const drawHeight = mob.base.rendering.height;

    context.drawImage(
      sprite,
      screenX + (TILE_SIZE - drawWidth) / 2,
      screenY + TILE_SIZE - drawHeight,
      drawWidth,
      drawHeight
    )
  }

  private updateMobs(deltaSeconds: number) {
    const player = this.state.player;

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const mob of chunk.mobs) {
        const definition = mobDefinitions[mob.base.species];
        if (!definition) {
          continue;
        }

        const mobToPlayer = player.position.minus(mob.position);
        const distanceToPlayer = Math.hypot(mobToPlayer.x, mobToPlayer.y);
        const isHostile = definition.interactions.relationship === "hostile"
        const withinAttackRange = distanceToPlayer <= mob.base.attack.range

        if (isHostile && distanceToPlayer > 0 && withinAttackRange) {
          mob.base.action = "attacking";
          continue;
        }

        if (isHostile && distanceToPlayer > mob.base.attack.range) {
          mob.base.action = "chasing";

          const direction = mobToPlayer.divideValue(distanceToPlayer);
          const dPoint = direction.multiplyValue(mob.base.movementSpeed * deltaSeconds);
          this.moveMob(mob, dPoint);

          continue;
        }

        switch (mob.base.behavior) {
          case "wander": this.updateWander(mob, deltaSeconds); break;
          case "patrol": mob.base.action = "idle"; break;
          case "idiot":
          default: mob.base.action = "idle"; break;
        }
      }
    }
  }

  private updateWander(mob: Mob, deltaSeconds: number) {
    mob.base.ai ??= {
      wanderDirection: new SimplePoint(0, 0),
      wanderTimeRemaining: 0,
      pauseTimeRemaining: 0
    }

    const ai = mob.base.ai;

    if (ai.pauseTimeRemaining > 0) {
      ai.pauseTimeRemaining = Math.max(0, ai.pauseTimeRemaining - deltaSeconds);
      mob.base.action = "idle";
      return;
    }

    if (ai.wanderTimeRemaining <= 0) {
      const directions = [
        new SimplePoint(1, 0),
        new SimplePoint(-1, 0),
        new SimplePoint(0, 1),
        new SimplePoint(0, -1)
      ];

      ai.wanderDirection = directions[Math.floor(Math.random() * directions.length)];
      ai.wanderTimeRemaining = 2.2 + Math.random() * 3.0; // Move 2.2-5.2 seconds
      
      // Usually move, occasionally take a break
      if (Math.random() < 0.3) {
        ai.pauseTimeRemaining = 1.5 + Math.random() * 5.3; // Break lasts 1.5-6.8 seconds
        mob.base.action = "idle";
        return;
      }
    }

    mob.base.action = "wandering";

    const prevPoint = mob.position.copy();
    const step = mob.base.movementSpeed * Math.min(deltaSeconds, ai.wanderTimeRemaining);

    this.moveMob(mob, ai.wanderDirection.multiplyValue(step));

    ai.wanderTimeRemaining = Math.max(0, ai.wanderTimeRemaining - deltaSeconds);

    if (mob.position.equals(prevPoint)) {
      ai.wanderTimeRemaining = 0;
      ai.pauseTimeRemaining = 1.6 + Math.random() * 4.8; // Pause lasts 1.6-6.4 seconds
      mob.base.action = "idle";
    }
  }

  private moveMob(mob: Mob, dPoint: SimplePoint) {
    const nextX = mob.position.x + dPoint.x;
    // if (this.canMobMoveToTile(mob, nextX, mob.position.y)) {
    if (this.doesTileAllowMovement(nextX, mob.position.y)) {
      mob.position.x = nextX;
    }

    const nextY = mob.position.y + dPoint.y;
    // if (this.canMobMoveToTile(mob, mob.position.x, nextY)) {
    if (this.doesTileAllowMovement(mob.position.x, nextY)) {
      mob.position.y = nextY;
    }

    if (Math.abs(dPoint.x) > Math.abs(dPoint.y)) {
      if (dPoint.x !== 0) {
        mob.direction = dPoint.x < 0 ? "left" : "right";
      }
    } else if (dPoint.y !== 0) {
      mob.direction = dPoint.y < 0 ? "up" : "down";
    }
  }

  private canPlayerMoveToTile(x: number, y: number): boolean {
    // if (!this.doesTerrainTileAllowMovement(x, y, PLAYER_RADIUS)) {
    if (!this.doesTileAllowMovement(x, y)) {
      return false;
    }

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const mob of chunk.mobs) {
        const minDistance = PLAYER_RADIUS + MOB_RADIUS;
        const distance = Math.hypot(x - mob.position.x, y - mob.position.y);
        if (distance < minDistance) {
          return false;
        }
      }
    }

    return true;
  }

  private canMobMoveToTile(mob: Mob, x: number, y: number): boolean {
    // if (!this.doesTerrainTileAllowMovement(x, y, MOB_RADIUS)) {
    if (!this.doesTileAllowMovement(x, y)) {
      return false;
    }

    const player = this.state.player;
    const playerDistance = Math.hypot(x - player.position.x, y - player.position.y);
    if (playerDistance < MOB_RADIUS + PLAYER_RADIUS) {
      return false;
    }

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const otherMob of chunk.mobs) {
        if (otherMob === mob) {
          continue;
        }

        const distance = Math.hypot(x = otherMob.position.x, y - otherMob.position.y);
        if (distance < MOB_RADIUS * 2) {
          return false;
        }
      }
    }

    return true;
  }

  private doesTerrainTileAllowMovement(x: number, y: number, radius: number): boolean {
    const samples = [
      [0, 0],
      [-radius, 0],
      [radius, 0],
      [0, -radius],
      [0, radius]
    ];

    return samples.every(([offsetX, offsetY]) => {
      return this.doesTileAllowMovement(x + offsetX, y + offsetY);
    });
  }

  private doesTileAllowMovement(x: number, y: number): boolean {
    const tilePoint = new SimplePoint(Math.floor(x), Math.floor(y));
    const chunkPoint = new SimplePoint(
      Math.floor(tilePoint.x / CHUNK_TILES),
      Math.floor(tilePoint.y / CHUNK_TILES)
    );
    const localPoint = new SimplePoint(
      ((tilePoint.x % CHUNK_TILES) + CHUNK_TILES) % CHUNK_TILES,
      ((tilePoint.y % CHUNK_TILES) + CHUNK_TILES) % CHUNK_TILES
    )

    const chunk = this.state.world.discovered[`${chunkPoint.x},${chunkPoint.y}`];
    if (!chunk) {
      return false;
    }

    const tile = chunk.tiles[localPoint.y * CHUNK_TILES + localPoint.x];

    return tile === 0;
  }
}

export default GameEngine;