// The 2D layer drawn over the scene: crosshair, health, kills, and the phase screens.
// Coordinates are WINDOW's logical pixels. Text needs the font registered (see ui/fonts.ts); without it nothing
// is drawn, which headless sims and early frames survive fine.
import type { Draw2D } from "dotframe/src/draw2d";
import { PLAYER, WINDOW } from "../config";
import { type Game, Phase } from "../state";

const CX = WINDOW.width / 2;
const CY = WINDOW.height / 2;
const INK = "#f5ead9";
const ACCENT = "#f0a13a";

function text(draw: Draw2D, size: number, align: string): void {
  draw.setFont(`${size}px Bangers, sans-serif`);
  draw.setTextAlign(align);
  draw.setTextBaseline("middle");
}

function line(draw: Draw2D, s: string, x: number, y: number): void {
  draw.fillText(s, x, y);
}

function overlay(draw: Draw2D): void {
  draw.setFillStyle("#06080cd9");
  draw.fillRect(0, 0, WINDOW.width, WINDOW.height);
}

// status: netplay link state ("paired", "waiting", "connecting"); null when playing local.
export function drawHud(game: Game, draw: Draw2D, port: number, status: string | null): void {
  const me = game.players[port] ?? game.players[0];
  const rival = game.players.find((_, i) => i !== port);
  if (game.phase === Phase.Title) {
    overlay(draw);
    draw.setFillStyle(ACCENT);
    text(draw, 84, "center");
    line(draw, "THE LAST EMPLOYEE", CX, 130);
    draw.setFillStyle(INK);
    text(draw, 30, "center");
    line(draw, "Año 2030. Los bots se quedaron con tu empresa.", CX, 215);
    line(draw, "Tu expediente se perdió: eres el último empleado.", CX, 250);
    text(draw, 26, "center");
    line(draw, "WASD moverse · Mouse mirar · Click izq/der golpear", CX, 330);
    line(draw, "Espacio saltar · Shift esquivar · Esc pausa", CX, 362);
    if (status !== null && status !== "paired") {
      draw.setFillStyle(ACCENT);
      text(draw, 32, "center");
      line(draw, "ESPERANDO AL OTRO EMPLEADO...", CX, 450);
    } else {
      draw.setFillStyle(ACCENT);
      text(draw, 36, "center");
      line(draw, "CLICK PARA FICHAR", CX, 450);
    }
    return;
  }

  if (game.phase === Phase.Playing) {
    // Crosshair.
    draw.setFillStyle("#ffffff");
    draw.fillRect(CX - 1, CY - 8, 2, 16);
    draw.fillRect(CX - 8, CY - 1, 16, 2);

    // Health bar, bottom left.
    const health = Math.max(0, me.health) / PLAYER.maxHealth;
    draw.setFillStyle("#00000099");
    draw.fillRect(20, WINDOW.height - 36, 204, 18);
    draw.setFillStyle("#e8453c");
    draw.fillRect(22, WINDOW.height - 34, 200 * health, 14);

    // Kill counter, top right; current squad, top left.
    draw.setFillStyle(ACCENT);
    text(draw, 34, "right");
    line(draw, `BOTS DESPEDIDOS: ${game.kills}`, WINDOW.width - 24, 30);
    text(draw, 28, "left");
    line(draw, `RONDA ${game.wave}`, 24, 30);
    if (game.spawnTimer > 0) {
      draw.setFillStyle(INK);
      text(draw, 26, "center");
      line(draw, "SE ACERCA MÁS PERSONAL...", CX, 60);
    }

    // The rival's health, top center, while they are in the match.
    if (game.duel === 1 && rival && rival.active) {
      const rhealth = Math.max(0, rival.health) / PLAYER.maxHealth;
      text(draw, 22, "center");
      draw.setFillStyle(INK);
      line(draw, "RIVAL", CX, 24);
      draw.setFillStyle("#00000099");
      draw.fillRect(CX - 102, 34, 204, 14);
      draw.setFillStyle("#e8453c");
      draw.fillRect(CX - 100, 36, 200 * rhealth, 10);
    }

    // Damage vignette while hurtFrames lasts.
    if (me.hurtFrames > 0) {
      draw.setFillStyle(`rgba(200, 30, 20, ${0.35 * (me.hurtFrames / PLAYER.hurtFrames)})`);
      draw.fillRect(0, 0, WINDOW.width, WINDOW.height);
    }
    return;
  }

  if (game.phase === Phase.Paused) {
    overlay(draw);
    draw.setFillStyle(ACCENT);
    text(draw, 72, "center");
    line(draw, "PAUSA", CX, 200);
    draw.setFillStyle(INK);
    text(draw, 30, "center");
    line(draw, "Click para volver al trabajo · R para reiniciar el turno", CX, 300);
    return;
  }

  // Phase.Over.
  overlay(draw);
  const won = game.duel === 1 && game.winner === port;
  draw.setFillStyle(won ? ACCENT : "#e8453c");
  text(draw, 84, "center");
  line(draw, won ? "TE QUEDASTE" : "DESPEDIDO", CX, 190);
  draw.setFillStyle(INK);
  text(draw, 34, "center");
  line(draw, `Bots despedidos: ${game.kills}`, CX, 280);
  line(draw, `Ronda alcanzada: ${game.wave}`, CX, 320);
  draw.setFillStyle(ACCENT);
  text(draw, 32, "center");
  line(draw, "CLICK PARA APELAR", CX, 380);
}
