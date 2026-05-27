"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An ambient ASCII torus for the Arcidex home — Andy Sloane's `donut.c`
 * rendered in two colours (ink-soft + a single vermillion highlight pass)
 * the way a 19th-century book might run a wood engraving in black ink with a
 * red second impression.
 *
 * Pure Canvas 2D, no dependency. Slow rotation (full revolution ~20s) with a
 * faint sin-modulated wobble so it never reads as mechanical. Pauses off-
 * viewport and respects `prefers-reduced-motion`.
 */

const COLS = 70;
const ROWS = 22;
const FONT_PX = 12;
const CELL_W = 7.2;
const CELL_H = FONT_PX + 1.2;
const CHARSET = " .,-~:;=!*#$@";

const R1 = 1.0;
const R2 = 2.0;
const K2 = 5.0;
const K1 = (COLS * K2 * 3) / (8 * (R1 + R2));

export default function AsciiFrontispiece() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Pause when off-screen
  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setPaused(!e.isIntersecting);
      },
      { rootMargin: "0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxMaybe = canvas.getContext("2d", { alpha: true });
    if (!ctxMaybe) return;
    const ctx: CanvasRenderingContext2D = ctxMaybe;

    // hi-DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = COLS * CELL_W;
    const cssH = ROWS * CELL_H;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    ctx.scale(dpr, dpr);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Brand palette pulled at runtime so future theme tweaks stay coherent.
    const cs = getComputedStyle(document.documentElement);
    const ink = cs.getPropertyValue("--ink-soft").trim() || "#8C8473";
    const accent = cs.getPropertyValue("--accent-c").trim() || "#C5462E";

    let A = 0; // rotation around X
    let B = 0; // rotation around Z
    let raf = 0;
    let stopped = false;
    let startTs = 0;

    const zbuf = new Float32Array(COLS * ROWS);
    const chars = new Uint8Array(COLS * ROWS); // index into CHARSET

    function frame(ts: number = 0) {
      if (stopped) return;
      // Reset buffers
      zbuf.fill(0);
      chars.fill(0);

      const cosA = Math.cos(A);
      const sinA = Math.sin(A);
      const cosB = Math.cos(B);
      const sinB = Math.sin(B);

      // θ around the small circle of the torus
      for (let theta = 0; theta < 6.28; theta += 0.07) {
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        // φ around the big circle
        for (let phi = 0; phi < 6.28; phi += 0.02) {
          const cosP = Math.cos(phi);
          const sinP = Math.sin(phi);

          const circleX = R2 + R1 * cosT;
          const circleY = R1 * sinT;

          // 3D coords after rotation
          const x =
            circleX * (cosB * cosP + sinA * sinB * sinP) -
            circleY * cosA * sinB;
          const y =
            circleX * (sinB * cosP - sinA * cosB * sinP) +
            circleY * cosA * cosB;
          const z = K2 + cosA * circleX * sinP + circleY * sinA;
          const ooz = 1 / z; // one over z

          // Projected screen position
          const xp = Math.floor(COLS / 2 + K1 * ooz * x);
          const yp = Math.floor(ROWS / 2 - (K1 / 2) * ooz * y);

          // Lambert luminance (light from (0, 1, -1) direction)
          const L =
            cosP * cosT * sinB -
            cosA * cosT * sinP -
            sinA * sinT +
            cosB * (cosA * sinT - cosT * sinA * sinP);

          if (yp >= 0 && yp < ROWS && xp >= 0 && xp < COLS) {
            const idx = xp + COLS * yp;
            if (ooz > zbuf[idx]) {
              zbuf[idx] = ooz;
              // Map luminance to charset (L is in roughly [-sqrt(2), sqrt(2)])
              const li = Math.max(0, Math.floor(L * 8));
              chars[idx] = li > CHARSET.length - 1 ? CHARSET.length - 1 : li;
            }
          }
        }
      }

      // Render
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = `${FONT_PX}px var(--font-jetbrains), ui-monospace, monospace`;
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      // Two passes — only the very brightest level prints in vermillion,
      // so the accent reads as the occasional second-colour pull rather
      // than a focal element.
      const BRIGHT_THRESHOLD = CHARSET.length - 1;

      ctx.fillStyle = ink;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = x + COLS * y;
          const ch = chars[i];
          if (ch === 0) continue;
          if (ch >= BRIGHT_THRESHOLD) continue;
          ctx.fillText(CHARSET[ch] ?? "", x * CELL_W, y * CELL_H);
        }
      }

      ctx.fillStyle = accent;
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = x + COLS * y;
          const ch = chars[i];
          if (ch < BRIGHT_THRESHOLD) continue;
          ctx.fillText(CHARSET[ch] ?? "", x * CELL_W, y * CELL_H);
        }
      }

      // Time-based rotation — keeps speed constant regardless of fps.
      // Full revolution ~ 22s on A, ~ 32s on B. A faint sin wobble keeps
      // the motion from reading as a perfect mechanical loop.
      if (!startTs) startTs = ts;
      const t = (ts - startTs) / 1000;
      A = t * 0.28 + Math.sin(t * 0.09) * 0.08;
      B = t * 0.19 + Math.cos(t * 0.06) * 0.06;

      raf = requestAnimationFrame(frame);
    }

    if (reduced) {
      // Single static frame so the plate isn't blank for low-motion users.
      frame();
      stopped = true;
      return () => {};
    }

    if (paused) return () => {};

    raf = requestAnimationFrame(frame);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [paused]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          opacity: 0.16,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}
