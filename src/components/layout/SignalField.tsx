"use client";

import { useEffect, useRef } from "react";
import {
  createSignalField,
  signalPoint,
  signalProgress,
  signalStage,
  type SignalRecord,
} from "@/lib/signal-field";

const RECORD = "232, 226, 214";
const CHAIN = "34, 211, 238";

function perStreamFor(width: number) {
  if (width < 640) return 32;
  if (width < 1100) return 48;
  return 64;
}

/**
 * Scroll-driven background: horizontal record streams, one selected chain,
 * then the same points bend into a vortex and settle. Canvas, not a second
 * particle library. Reduced motion paints the opening field once.
 */
export function SignalField({ reduced }: { reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let records: SignalRecord[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;
    const clock = { start: performance.now() };
    const progress = { current: 0, target: 0 };

    const measure = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      records = createSignalField(perStreamFor(width));
    };

    const readScroll = () => {
      const range =
        document.documentElement.scrollHeight - window.innerHeight;
      progress.target = reduced
        ? 0
        : signalProgress(window.scrollY, range);
    };

    const draw = (now: number) => {
      const time = reduced ? 0 : (now - clock.start) / 1000;
      progress.current += (progress.target - progress.current) * (reduced ? 1 : 0.07);
      const stage = signalStage(progress.current);

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height * 0.46);
      ctx.scale(stage.zoom, stage.zoom);
      ctx.translate(-width / 2, -height * 0.46);

      const chain: { x: number; y: number }[] = [];

      for (const record of records) {
        const point = signalPoint(record, time, stage, width, height);
        if (point.chain) chain.push({ x: point.x, y: point.y });
        const color = point.chain ? CHAIN : RECORD;
        const tail = 18 * (1 - stage.morph);
        if (tail > 1) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${color}, ${point.alpha * 0.55})`;
          ctx.lineWidth = point.chain ? 1.4 : 1;
          ctx.moveTo(point.x - tail, point.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(${color}, ${point.alpha})`;
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (chain.length > 1) {
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(chain[0].x, chain[0].y);
        for (let i = 1; i < chain.length; i++) {
          const prev = chain[i - 1];
          const next = chain[i];
          if (Math.hypot(next.x - prev.x, next.y - prev.y) > width * 0.55) {
            ctx.moveTo(next.x, next.y);
          } else {
            ctx.lineTo(next.x, next.y);
          }
        }
        ctx.strokeStyle = `rgba(${CHAIN}, ${0.22 + stage.emphasis * 0.35})`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = `rgba(${CHAIN}, ${0.75 + stage.emphasis * 0.2})`;
        ctx.lineWidth = 1.35;
        ctx.stroke();
      }

      ctx.restore();

      if (!reduced && running && !document.hidden) {
        raf = requestAnimationFrame(draw);
      }
    };

    const onScroll = () => {
      readScroll();
      if (reduced) draw(clock.start);
    };

    const onResize = () => {
      measure();
      readScroll();
      draw(performance.now());
    };

    const onVisibility = () => {
      if (!document.hidden && !reduced && running) {
        clock.start = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    measure();
    readScroll();
    draw(performance.now());

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
