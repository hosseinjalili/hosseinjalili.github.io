import { useEffect, useRef } from "react";

export function usePortraitMotion() {
  const ref = useRef(null);

  useEffect(() => {
    const stage = ref.current;
    const media = stage.querySelector(".cinema-photo");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let targetX = 0;
    let targetY = 0;

    function move() {
      vx = (vx + (targetX - x) * 0.12) * 0.78;
      vy = (vy + (targetY - y) * 0.12) * 0.78;
      x += vx;
      y += vy;
      const moving =
        Math.abs(targetX - x) +
          Math.abs(targetY - y) +
          Math.abs(vx) +
          Math.abs(vy) >
        0.12;
      if (!moving) {
        x = targetX;
        y = targetY;
        vx = vy = 0;
      }
      stage.style.setProperty("--portrait-x", x.toFixed(2) + "px");
      stage.style.setProperty("--portrait-y", y.toFixed(2) + "px");
      frame = moving ? requestAnimationFrame(move) : 0;
    }

    function onMove(event) {
      if (reduce.matches || event.pointerType !== "mouse") return;
      const box = stage.getBoundingClientRect();
      targetX = ((event.clientX - box.left) / box.width - 0.5) * 23;
      targetY = ((event.clientY - box.top) / box.height - 0.5) * 22;
      if (!frame) frame = requestAnimationFrame(move);
    }

    function reset() {
      targetX = targetY = 0;
      if (!frame && !reduce.matches) frame = requestAnimationFrame(move);
    }

    function onTouch(event) {
      if (reduce.matches || event.pointerType !== "touch") return;
      media.getAnimations().forEach((animation) => animation.cancel());
      media.animate(
        [{ scale: 1 }, { scale: 1.027, offset: 0.35 }, { scale: 1 }],
        { duration: 420, easing: "cubic-bezier(.18,.85,.27,1)" },
      );
    }

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", reset);
    stage.addEventListener("pointerdown", onTouch);
    return () => {
      cancelAnimationFrame(frame);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", reset);
      stage.removeEventListener("pointerdown", onTouch);
    };
  }, []);

  return ref;
}
