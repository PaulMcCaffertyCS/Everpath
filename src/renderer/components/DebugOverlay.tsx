import "./debug-overlay.css";
import { CHUNK_TILES } from "../../shared/declarations";
import type { Player, WorldState } from "../../shared/types"

interface DebugOverlayProps {
  world: WorldState;
  player: Player;
  showDebugOverlay: boolean;
}

const DebugOverlay = ({ world, player, showDebugOverlay }: DebugOverlayProps) => {
  const currentTown = Object.values(world.discovered)
    .flatMap(chunk => chunk.towns)
    .find(town =>
      player.position.x >= town.bounds.minX
      && player.position.x <= town.bounds.maxX
      && player.position.y >= town.bounds.minY
      && player.position.y <= town.bounds.maxY
    );

  return showDebugOverlay ? (
    <div className="debug-overlay">
      <div className="muted">
        World seed
      </div>

      <strong>
        {world.seed}
      </strong>

      <div className="muted">
        Chunks generated
      </div>

      <strong>
        {Object.keys(world.discovered).length}
      </strong>

      <div className="muted top-margin">
        Chunk biome
      </div>

      <strong>
        {function () {
          const playerPosition = player.position;
          const cx = Math.floor(playerPosition.x / CHUNK_TILES);
          const cy = Math.floor((playerPosition.y + 0.75) / CHUNK_TILES);
          const chunk = world.discovered[`${cx},${cy}`];
          if (!chunk) {
            return "ERROR";
          }

          return chunk.biome;
        }()}
      </strong>

      <div className="muted top-margin">
        Town / city
      </div>

      <strong>
        {currentTown?.name ?? "Wilderness"}
      </strong>

      <div className="muted top-margin">
        Coordinates
      </div>

      <strong>
        {`x: ${player.position.x}, y: ${player.position.y}`}
      </strong>
    </div>
  ) : null;
}

export default DebugOverlay;