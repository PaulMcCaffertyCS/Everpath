import type { GameSprites } from "./sprites";
import { ensureAroundPlayer } from "./world";
import { mobDefinitions } from "./mobs";
import { CHUNK_TILES, TILE_SIZE } from "../../shared/declarations";
import type { Mob, GameState, Player } from "../../shared/types";
import { PLAYER_RADIUS, MOB_RADIUS, biomeToColor } from "../../shared/types";
import SimplePoint from "../../utils/typescript/SimplePoint";
import { HexColor } from "../../utils/ColorUtils";
import TileRect from "../../utils/typescript/TileRect";
import TileCircle from "../../utils/typescript/TileCircle";
import { hashString, mulberry32 } from "./seed";

const BIOME_TRANSITION_SUBDIVISIONS = 16;
const BIOME_TRANSITION_WIDTH = 2;

class GameEngine {
  showHitboxes: boolean = false;

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
        // console.log(tile);

        const subdivisionsX = localX < BIOME_TRANSITION_WIDTH
          || localX >= CHUNK_TILES - BIOME_TRANSITION_WIDTH
          ? BIOME_TRANSITION_SUBDIVISIONS
          : 1;
        const subdivisionsY = localY < BIOME_TRANSITION_WIDTH
          || localY >= CHUNK_TILES - BIOME_TRANSITION_WIDTH
          ? BIOME_TRANSITION_SUBDIVISIONS
          : 1;

        for (let subY = 0; subY < subdivisionsY; subY++) {
          for (let subX = 0; subX < subdivisionsX; subX++) {
            const worldX = x + (subX + 0.5) / subdivisionsX;
            const worldY = y + (subY + 0.5) / subdivisionsY;
            context.fillStyle = this.biomeColorAt(
              new SimplePoint(worldX, worldY),
              "#000000"
            ).value;
            context.fillRect(
              centerX + (worldX - player.position.x) * TILE_SIZE - TILE_SIZE / (2 * subdivisionsX),
              centerY + (worldY - player.position.y) * TILE_SIZE - TILE_SIZE / (2 * subdivisionsY),
              TILE_SIZE / subdivisionsX + 1,
              TILE_SIZE / subdivisionsY + 1
            );
          }
        }

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
    if (this.canPlayerMoveToTile(nextX, player.position.y, PLAYER_RADIUS)) {
      player.position.x = nextX;
    }

    const nextY = player.position.y + dy;
    if (this.canPlayerMoveToTile(player.position.x, nextY, PLAYER_RADIUS)) {
      player.position.y = nextY;
    }

    player.rendering.hitbox.update(player.position);

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
    const chunkX = Math.floor(worldPos.x / CHUNK_TILES);
    const chunkY = Math.floor(worldPos.y / CHUNK_TILES);
    const localX = worldPos.x - chunkX * CHUNK_TILES;
    const localY = worldPos.y - chunkY * CHUNK_TILES;

    const colorAt = (cx: number, cy: number) => {
      const chunk = this.state.world.discovered[`${cx},${cy}`];
      return new HexColor(chunk ? biomeToColor[chunk.biome] : fallback);
    };

    const horizontalColorAt = (cy: number) => {
      const current = colorAt(chunkX, cy);

      if (localX < BIOME_TRANSITION_WIDTH) {
        return this.patchyBiomeBlend(
          colorAt(chunkX - 1, cy),
          current,
          (localX + BIOME_TRANSITION_WIDTH) / (2 * BIOME_TRANSITION_WIDTH),
          `x:${chunkX}:${Math.floor(worldPos.y * 1.5)}`,
          worldPos
        );
      }

      if (localX > CHUNK_TILES - BIOME_TRANSITION_WIDTH) {
        return this.patchyBiomeBlend(
          current,
          colorAt(chunkX + 1, cy),
          (localX - (CHUNK_TILES - BIOME_TRANSITION_WIDTH)) / (2 * BIOME_TRANSITION_WIDTH),
          `x:${chunkX + 1}:${Math.floor(worldPos.y * 1.5)}`,
          worldPos
        );
      }

      return current;
    };

    const current = horizontalColorAt(chunkY);
    if (localY < BIOME_TRANSITION_WIDTH) {
      return this.patchyBiomeBlend(
        horizontalColorAt(chunkY - 1),
        current,
        (localY + BIOME_TRANSITION_WIDTH) / (2 * BIOME_TRANSITION_WIDTH),
        `y:${chunkY}:${Math.floor(worldPos.x * 1.5)}`,
        worldPos
      );
    }

    if (localY > CHUNK_TILES - BIOME_TRANSITION_WIDTH) {
      return this.patchyBiomeBlend(
        current,
        horizontalColorAt(chunkY + 1),
        (localY - (CHUNK_TILES - BIOME_TRANSITION_WIDTH)) / (2 * BIOME_TRANSITION_WIDTH),
        `y:${chunkY + 1}:${Math.floor(worldPos.x * 1.5)}`,
        worldPos
      );
    }

    return current;
  }

  private patchyBiomeBlend(from: HexColor, to: HexColor, amount: number, patch: string, worldPos: SimplePoint): HexColor {
    const t = Math.max(0, Math.min(1, amount));
    const blendAmount = t * t * (3 - 2 * t);
    const random = mulberry32(
      hashString(
        `${this.state.world.seed}:${patch}`
      )
    )();
    return random < blendAmount ? to : from;
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
    const player = this.state.player;
    const playerSprite = sprites.player[this.state.player.direction];

    const playerSize = player.rendering.size;
    context.drawImage(
      playerSprite,
      centerX - (playerSize.width / 2),
      centerY - (playerSize.height / 2),
      playerSize.width,
      playerSize.height
    );

    if (this.showHitboxes) {
      this.drawDebugStats(context, new SimplePoint(centerX, centerY), player);
    }
  }

  private renderMob(context: CanvasRenderingContext2D, mob: Mob, centerX: number, centerY: number, sprites: GameSprites) {
    const sprite = sprites[mob.base.species][mob.direction];
    if (!sprite) {
      return;
    }

    const player = this.state.player;
    const mobSize = mob.base.rendering.size;
    const screenPosition = new SimplePoint(
      centerX + (mob.position.x - player.position.x) * TILE_SIZE,
      centerY + (mob.position.y - player.position.y) * TILE_SIZE
    );

    context.drawImage(
      sprite,
      screenPosition.x - (mobSize.width / 2),
      screenPosition.y - (mobSize.height / 2),
      mobSize.width,
      mobSize.height
    );

    if (this.showHitboxes) {
      this.drawDebugStats(context, screenPosition, undefined, mob);
    }
  }

  private updateMobs(deltaSeconds: number) {
    const player = this.state.player;

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const mob of chunk.mobs) {
        const definition = mobDefinitions[mob.base.species];
        if (!definition) {
          continue;
        }

        let mobAttackbox = mob.base.rendering.hitbox.copy();
        if (mobAttackbox instanceof TileRect) {
          mobAttackbox = mobAttackbox.toTileCirlce();
        }
        mobAttackbox.increaseSize(mob.base.attack.range);

        const isHostile = definition.interactions.relationship === "hostile"
        if (isHostile && this.isPlayerWithinAttackRange(player.rendering.hitbox, mobAttackbox)) {
          mob.base.action = "attacking";
          continue;
        }

        if (isHostile && !this.isPlayerWithinAttackRange(player.rendering.hitbox, mobAttackbox)) {
          mob.base.action = "chasing";

          const mobToPlayer = player.position.copy();
          mobToPlayer.minus(mob.position);
          const distanceToPlayer = Math.hypot(mobToPlayer.x, mobToPlayer.y);
          const direction = mobToPlayer.copy();
          direction.divideValue(distanceToPlayer);
          const dPoint = direction.copy();
          dPoint.multiplyValue(mob.base.movementSpeed * deltaSeconds);
          this.moveMob(mob, dPoint);

          continue;
        }

        switch (mob.base.behavior) {
          case "wander": this.updateWander(mob, deltaSeconds); break;
          case "patrol": mob.base.action = "idle"; break;
          case "idiot": {
            const newMovementSpeed = 0 + Math.random() * 4;
            // console.log(`newMovementSpeed=${newMovementSpeed}`);
            mob.base.movementSpeed = newMovementSpeed;
            this.updateWander(mob, deltaSeconds);
            break;
          }
          default: mob.base.action = "idle"; break;
        }
      }
    }
  }

  private updateWander(mob: Mob, deltaSeconds: number) {
    mob.ai ??= {
      wanderDirection: new SimplePoint(0, 0),
      wanderTimeRemaining: 0,
      pauseTimeRemaining: 0
    }

    const ai = mob.ai;

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

    const dPoint = ai.wanderDirection.copy();
    dPoint.multiplyValue(step);
    this.moveMob(mob, dPoint);

    ai.wanderTimeRemaining = Math.max(0, ai.wanderTimeRemaining - deltaSeconds);

    if (mob.position.equals(prevPoint)) {
      ai.wanderTimeRemaining = 0;
      ai.pauseTimeRemaining = 1.6 + Math.random() * 4.8; // Pause lasts 1.6-6.4 seconds
      mob.base.action = "idle";
    }
  }

  private moveMob(mob: Mob, dPoint: SimplePoint) {
    const radius = MOB_RADIUS;

    const nextX = mob.position.x + dPoint.x;
    if (this.canMobMoveToTile(mob, nextX, mob.position.y, radius)) {
      mob.position.x = nextX;
    }

    const nextY = mob.position.y + dPoint.y;
    if (this.canMobMoveToTile(mob, mob.position.x, nextY, radius)) {
      mob.position.y = nextY;
    }

    mob.base.rendering.hitbox.update(mob.position);

    if (Math.abs(dPoint.x) > Math.abs(dPoint.y)) {
      if (dPoint.x !== 0) {
        mob.direction = dPoint.x < 0 ? "left" : "right";
      }
    } else if (dPoint.y !== 0) {
      mob.direction = dPoint.y < 0 ? "up" : "down";
    }
  }

  private isPlayerWithinAttackRange(
    playerHitbox: TileCircle | TileRect,
    mobAttackbox: TileCircle
  ): boolean {
    return this.doHitboxesIntersect(mobAttackbox, playerHitbox);
  }

  private canPlayerMoveToTile(x: number, y: number, radius: number): boolean {
    if (!this.isTerrainTileClear(x, y, radius)) {
      // console.log("invalid terrain tile");
      return false;
    }

    const futurePoint = new SimplePoint(x, y);
    const player = this.state.player;
    const futureHitbox = player.rendering.hitbox instanceof TileRect ?
      TileRect.fromPointAndSize(futurePoint, player.rendering.size) :
      TileCircle.fromPointAndSize(futurePoint, player.rendering.size);

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const mob of chunk.mobs) {
        if (this.doHitboxesIntersect(mob.base.rendering.hitbox, futureHitbox)) {
          return false;
        }
      }
    }

    return true;
  }

  private canMobMoveToTile(mob: Mob, x: number, y: number, radius: number): boolean {
    if (!this.isTerrainTileClear(x, y, radius)) {
      return false;
    }

    const futurePoint = new SimplePoint(x, y);
    const mobSize = mob.base.rendering.size;
    const futureHitbox = mob.base.rendering.hitbox instanceof TileRect ?
      TileRect.fromPointAndSize(futurePoint, mobSize) :
      TileCircle.fromPointAndSize(futurePoint, mobSize);

    if (this.doHitboxesIntersect(futureHitbox, this.state.player.rendering.hitbox)) {
      return false;
    }

    for (const chunk of Object.values(this.state.world.discovered)) {
      for (const otherMob of chunk.mobs) {
        if (otherMob === mob) {
          continue;
        }

        if (this.doHitboxesIntersect(futureHitbox, undefined, otherMob.base.rendering.hitbox)) {
          return false;
        }
      }
    }

    return true;
  }

  private isTerrainTileClear(x: number, y: number, radius: number): boolean {
    const minTile = new SimplePoint(Math.floor(x - radius), Math.floor(y - radius));
    const maxTile = new SimplePoint(Math.floor(x + radius), Math.floor(y + radius));

    for (let tileY = minTile.y; tileY <= maxTile.y; tileY++) {
      for (let tileX = minTile.x; tileX <= maxTile.x; tileX++) {
        if (!this.doesTileAllowMovement(tileX + 0.5, tileY + 0.5)) {
          const closestTile = new SimplePoint(
            Math.max(tileX, Math.min(x, tileX + 1)),
            Math.max(tileY, Math.min(y, tileY + 1))
          )

          const dPoint = new SimplePoint(x, y);
          dPoint.minus(closestTile);

          if (dPoint.x * dPoint.x + dPoint.y * dPoint.y < radius * radius) {
            // console.log(`dPoint=${(dPoint.x, dPoint.y)}`);
            // console.log("invalid dPoint");
            return false;
          }
        }
      }
    }

    return true;
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
      // console.log("invalid chunk");
      return false;
    }

    const tile = chunk.tiles[localPoint.y * CHUNK_TILES + localPoint.x];

    // console.log(`tile === 0: ${tile === 0}`);
    return tile === undefined || tile === 0;
  }

  private doHitboxesIntersect(
    mobHitbox: TileRect | TileCircle,
    playerHitbox?: TileRect | TileCircle | undefined,
    otherMobHitbox?: TileRect | TileCircle | undefined
  ): boolean {
    if (playerHitbox === undefined) {
      if (otherMobHitbox === undefined) {
        console.error(`Entity collision check received only one entity`);
        return false;
      }

      return otherMobHitbox instanceof TileRect ?
        mobHitbox.overlapsRect(otherMobHitbox) :
        mobHitbox.overlapsCircle(otherMobHitbox);
    } else {
      return mobHitbox instanceof TileRect ?
        playerHitbox.overlapsRect(mobHitbox) :
        playerHitbox.overlapsCircle(mobHitbox);
    }
  }

  // DEBUG ZONE
  private drawDebugStats(context: CanvasRenderingContext2D, screenPosition: SimplePoint, player?: Player, mob?: Mob) {
    // Debug center: draw dot at entity center.
    // context.save();
    // context.beginPath();
    // context.arc(
    //   screenPosition.x,
    //   screenPosition.y,
    //   2,
    //   0,
    //   Math.PI * 2
    // );
    // context.strokeStyle = "blue";
    // context.lineWidth = 3;
    // context.stroke();
    // context.restore();

    // Debug hitbox: circle in world coordinates, converted to pixels.
    let rendering, attack;
    if (player) {
      rendering = player.rendering;
      attack = player.attack;
    } else {
      if (mob) {
        rendering = mob.base.rendering;
        attack = mob.base.attack;
      } else {
        return;
      }
    }

    const size = rendering.size;
    const hitbox = rendering.hitbox;

    if (mob) {
      context.strokeText(
        mob.base.movementSpeed.toPrecision(4).toString(),
        screenPosition.x - (size.width / 2),
        screenPosition.y - (size.height / 2) - 15
      );

      context.strokeText(
        mob.base.action,
        screenPosition.x - (size.width / 2),
        screenPosition.y - (size.height / 2) - 5
      );
    }

    context.save();
    context.beginPath();
    if (hitbox instanceof TileRect) {
      context.rect(
        screenPosition.x - (size.width / 2),
        screenPosition.y - (size.height / 2),
        hitbox.width * TILE_SIZE,
        hitbox.height * TILE_SIZE
      );
    } else {
      context.arc(
        screenPosition.x,
        screenPosition.y,
        hitbox.radius * TILE_SIZE,
        0,
        Math.PI * 2
      );
    }
    context.strokeStyle = `rgba(248, 112, 112, 0.75)`;
    context.lineWidth = 2;
    context.stroke();
    context.restore();

    // Debug attack range: in world coordinates, converted to pixels.
    let attackbox = rendering.hitbox.copy();
    attackbox.increaseSize(attack.range);
    if (attackbox instanceof TileRect) {
      attackbox = attackbox.toTileCirlce();
    }

    context.save();
    context.beginPath();
    // if (attackbox instanceof TileRect) {
    //   context.rect(
    //     screenPosition.x - ((attackbox.width * TILE_SIZE) / 2),
    //     screenPosition.y - ((attackbox.height * TILE_SIZE) / 2),
    //     attackbox.width * TILE_SIZE,
    //     attackbox.height * TILE_SIZE
    //   );
    // }
    context.arc(
      screenPosition.x,
      screenPosition.y,
      attackbox.radius * TILE_SIZE,
      attackbox.startAngle,
      attackbox.endAngle
    );
    context.strokeStyle = `rgba(255, 22, 22, 0.75)`;
    context.lineWidth = 2;
    context.stroke();
    context.restore();
  }
}

export default GameEngine;