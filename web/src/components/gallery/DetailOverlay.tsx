"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import type { Slide } from "@/lib/gallery/types";

export default function DetailOverlay({
  slide,
  onClose,
  onPrev,
  onNext,
}: {
  slide: Slide;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const o = slide.overlay;

  // lock background scroll + escape-to-close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="overlay-root"
      role="dialog"
      aria-modal="true"
      aria-label={`${o.eyebrow} — ${o.title}`}
    >
      <motion.div
        className="overlay-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onClick={onClose}
      />
      <motion.div
        className="overlay-panel"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* full-bleed background with ken-burns zoom */}
        <img draggable={false} className="overlay-bg" src={o.bg} alt={slide.city} />
        <div className="overlay-scrim" />

        <div className="overlay-inner">
          {/* LEFT: eyebrow + title + controls */}
          <div className="overlay-left">
            <div className="overlay-eyebrow">{o.eyebrow}</div>
            <h2 className="overlay-title">{o.title}</h2>
            <div className="overlay-controls">
              <button className="octl" onClick={onPrev} aria-label="Previous">
                ‹
              </button>
              <button className="octl" onClick={onNext} aria-label="Next">
                ›
              </button>
              <button
                className="octl close"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* RIGHT: info panels */}
          <div className="overlay-right">
            <div className="ov-label">Best time to visit</div>
            <div className="ov-card info">{o.bestTime}</div>

            <div className="ov-label">Must-do activities</div>
            {o.activities.map((a) => (
              <div className="ov-card" key={a.title}>
                <div className="ov-act-title">{a.title}</div>
                <div className="ov-act-desc">{a.desc}</div>
              </div>
            ))}

            <button className="ov-cta" onClick={onClose}>
              {o.ctaLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
