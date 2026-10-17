// Punches: left and right click start a punch on each fist.
import { COMBAT } from "../config";
import { Button } from "../input";
import type { Game } from "../state";

// pressed: buttons that went down this frame.
export function stepCombat(game: Game, pressed: number): void {
  const f = game.fists;
  if (f.left > 0) f.left -= 1;
  if (f.right > 0) f.right -= 1;
  if (pressed & Button.PunchLeft && f.left === 0) f.left = COMBAT.punchFrames;
  if (pressed & Button.PunchRight && f.right === 0) f.right = COMBAT.punchFrames;
  // TODO(VS 0.1, combate): on the impact frame, damage the enemies within COMBAT.reach in front of the player
  // (COMBAT.damage, set enemy.hitFrames).
}
