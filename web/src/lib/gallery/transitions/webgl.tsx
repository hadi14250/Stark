/**
 * WebGL family: ripple (displace-ripple) and liquid-warp (displace-sweep).
 *
 * ShaderCrossfade is the runtime: PushCard mounts it absolutely over a PHOTO
 * cell's frame while a webgl transition runs; the DOM layers beneath hard-swap
 * (duration 0), so the canvas IS the transition. Raw WebGL1, zero deps: a
 * fullscreen quad samples both slides' photos with object-fit:cover UV math
 * and mixes them under a displacement effect, progress driven by rAF shaped
 * by the live ease. Until BOTH textures are decoded it paints nothing (the
 * fresh drawing buffer is transparent). If context creation fails or an image
 * errors it calls onDone() immediately — the DOM already swapped beneath.
 *
 * The impls' DOM targets are the fallback face of the effect: text cells (and
 * any cell the shader can't run on) get a clean crossfade — incoming fades in
 * on top while the outgoing holds still beneath for the full enter duration.
 */
"use client";

import { useEffect, useRef } from "react";
import type { PushDir } from "./core";
import type { CardCtx, LayerSpec, TransitionImpl } from "./types";

/* ------------------------------------------------------------------ */
/* Shaders                                                              */
/* ------------------------------------------------------------------ */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// shared prelude: precision guard + object-fit:cover UV math per texture
const FRAG_COMMON = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
uniform sampler2D u_texA;
uniform sampler2D u_texB;
uniform vec2 u_res;
uniform vec2 u_sizeA;
uniform vec2 u_sizeB;
uniform float u_p;

vec2 cover(vec2 uv, vec2 size) {
  float rc = u_res.x / u_res.y;
  float rt = size.x / size.y;
  vec2 s = rc > rt ? vec2(1.0, rt / rc) : vec2(rc / rt, 1.0);
  return (uv - 0.5) * s + 0.5;
}
`;

// displace-ripple: the new photo is REVEALED by a ripple ring expanding from
// the center — a water-drop, radial read. NOT a uniform crossfade (that's why
// the old version looked like "no transition"): the boundary between old and
// new IS a rippling ring, with a decaying wave-train and organic wavy edge.
const FRAG_RIPPLE =
  FRAG_COMMON +
  `
void main() {
  vec2 uv = v_uv;
  vec2 c = uv - vec2(0.5);
  float d = length(c);
  vec2 rd = d > 1e-4 ? c / d : vec2(0.0);
  // ring front expands past the corner (~0.72) so the card fully reveals
  float front = u_p * 0.92;
  float ring = d - front;
  // wave-train trailing the front; decays away from it, and fades out by p=1
  float wave = sin(ring * 55.0 - u_p * 8.0) * exp(-abs(ring) * 9.0);
  float amp = 0.06 * (1.0 - u_p * u_p);
  vec2 off = rd * wave * amp;
  vec3 a = texture2D(u_texA, cover(uv + off, u_sizeA)).rgb;
  vec3 b = texture2D(u_texB, cover(uv + off, u_sizeB)).rgb;
  // organic wavy reveal edge (not a perfect circle) → new inside the ring
  float wob = 0.04 + 0.03 * sin(atan(c.y, c.x) * 7.0 + u_p * 4.0);
  float reveal = smoothstep(front + wob, front - wob, d);
  gl_FragColor = vec4(mix(a, b, reveal), 1.0);
}`;

// displace-sweep: hash value-noise smear along u_axis, strongest mid-swap and
// near the mix front, which sweeps across the card along the travel axis.
const FRAG_SWEEP =
  FRAG_COMMON +
  `
uniform vec2 u_axis;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  vec2 uv = v_uv;
  vec2 perp = vec2(-u_axis.y, u_axis.x);
  float t = dot(uv - 0.5, u_axis) + 0.5;              // 0..1 along travel axis
  // two-octave flow noise, dragged along the axis over time
  float n1 = vnoise(vec2(dot(uv, u_axis) * 4.0 + u_p * 2.5, dot(uv, perp) * 9.0)) - 0.5;
  float n2 = vnoise(vec2(dot(uv, perp) * 7.0 - u_p * 2.0, dot(uv, u_axis) * 5.0)) - 0.5;
  // a soft wide sweep front travels along the axis; warp is strongest AT it
  float w = 0.30;
  float front = mix(-w, 1.0 + w, u_p);
  float near = 1.0 - smoothstep(0.0, w * 1.7, abs(t - front));
  float amp = 0.18 * near;                            // 3x the old smear — clearly liquid
  vec2 off = (u_axis * n1 * 2.0 + perp * n2) * amp;
  vec3 a = texture2D(u_texA, cover(uv + off, u_sizeA)).rgb;
  vec3 b = texture2D(u_texB, cover(uv - off * 0.6, u_sizeB)).rgb;
  // behind the front (t < front) → new; ahead → old
  float m = smoothstep(front - w, front + w, t);
  gl_FragColor = vec4(mix(b, a, m), 1.0);
}`;

/** travel axis in visual UV space (y up, matching UNPACK_FLIP_Y uploads) */
const AXIS: Record<PushDir, [number, number]> = {
  up: [0, 1],
  down: [0, -1],
  left: [-1, 0],
  right: [1, 0],
};

/* ------------------------------------------------------------------ */
/* GL plumbing                                                          */
/* ------------------------------------------------------------------ */

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

function link(gl: WebGLRenderingContext, fragSrc: string): WebGLProgram | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  return gl.getProgramParameter(prog, gl.LINK_STATUS) ? prog : null;
}

/** NPOT-safe photo upload: clamp + linear, no mipmaps, flipped to y-up */
function uploadTexture(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) {
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

/* ------------------------------------------------------------------ */
/* Component                                                            */
/* ------------------------------------------------------------------ */

export function ShaderCrossfade({
  from,
  to,
  kind,
  dir,
  duration,
  ease,
  onDone,
}: {
  from: string;
  to: string;
  kind: "displace-ripple" | "displace-sweep";
  dir: PushDir;
  duration: number; // ms
  ease: (t: number) => number;
  onDone?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // latest callback/ease without restarting the effect mid-transition
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const easeRef = useRef(ease);
  easeRef.current = ease;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let raf = 0;
    let disposed = false;
    let signalled = false;
    const finish = () => {
      if (!signalled && !disposed) {
        signalled = true;
        onDoneRef.current?.();
      }
    };

    const gl = canvas.getContext("webgl", { depth: false, stencil: false, antialias: false });
    if (!gl) {
      // no WebGL — the DOM fallback beneath has already swapped
      finish();
      return;
    }

    // backing store from the CSS box, devicePixelRatio capped at 2
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    const program = link(gl, kind === "displace-ripple" ? FRAG_RIPPLE : FRAG_SWEEP);
    if (!program) {
      finish();
      return () => {
        disposed = true;
      };
    }
    gl.useProgram(program);

    // fullscreen quad
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // static uniforms (u_axis is compiled out of the ripple program — no-op)
    gl.uniform1i(gl.getUniformLocation(program, "u_texA"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "u_texB"), 1);
    gl.uniform2f(gl.getUniformLocation(program, "u_res"), canvas.width, canvas.height);
    const axis = AXIS[dir];
    gl.uniform2f(gl.getUniformLocation(program, "u_axis"), axis[0], axis[1]);
    const uP = gl.getUniformLocation(program, "u_p");

    const total = Math.max(duration, 1);
    let start = 0;
    const frame = (now: number) => {
      if (disposed) return;
      if (!start) start = now;
      const t = Math.min((now - start) / total, 1);
      const p = t >= 1 ? 1 : Math.min(Math.max(easeRef.current(t), 0), 1);
      gl.uniform1f(uP, p);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (t >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    // same-origin /images/* — no crossOrigin needed; paint only when BOTH ready.
    // Both slide images are already decoded (shown on screen + preloaded), so
    // upload SYNCHRONOUSLY when img.complete instead of waiting for the async
    // onload — that shaves the pre-paint gap to a single frame, so the shader
    // takes over before the DOM crossfade underneath is visible.
    let ready = 0;
    const loadTex = (src: string, unit: number, sizeName: string) => {
      const img = new Image();
      let fired = false;
      const done = () => {
        if (fired || disposed) return;
        fired = true;
        uploadTexture(gl, unit, img);
        gl.uniform2f(
          gl.getUniformLocation(program, sizeName),
          img.naturalWidth || 1,
          img.naturalHeight || 1
        );
        if (++ready === 2) raf = requestAnimationFrame(frame);
      };
      img.onload = done;
      img.onerror = () => finish();
      img.src = src;
      if (img.complete && img.naturalWidth) done();
    };
    loadTex(from, 0, "u_sizeA");
    loadTex(to, 1, "u_sizeB");

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      // NOTE: do NOT loseContext() here. React StrictMode remounts this effect
      // on the SAME canvas element, and getContext() returns the cached
      // context — losing it poisons the remount, so the shader would compile
      // on a dead context and never render. The context is reclaimed when the
      // canvas leaves the DOM (showShader → false ends the transition).
    };
  }, [from, to, kind, dir, duration]);

  return <canvas ref={canvasRef} />;
}

/* ------------------------------------------------------------------ */
/* Impls                                                                */
/* ------------------------------------------------------------------ */

// Ripple — radial ripple reveal on photo cells; NON-photo cells (text, CTA)
// echo the from-center feel with a scale BLOOM so the whole grid reads radial
// (a plain crossfade there is what made it indistinguishable from liquid-warp).
const rippleImpl: TransitionImpl = {
  scope: "card",
  directional: false,
  textMode: "static",
  card: (ctx: CardCtx): LayerSpec => ({
    initial: { opacity: 0, scale: 1.08, zIndex: 2 },
    animate: { opacity: 1, scale: 1, zIndex: 2 },
    exitTarget: { scale: 0.96, zIndex: 1 },
    exitTransition: { duration: ctx.enter, ease: "linear" },
    webgl: "displace-ripple",
  }),
};

/** ~14% of the card box along the travel axis so DIRECTION clearly reads on
    non-photo cells — the whole grid flows one way (vs ripple's radial bloom) */
const DRIFT: Record<PushDir, { x: string; y: string }> = {
  up: { x: "0%", y: "14%" },
  down: { x: "0%", y: "-14%" },
  left: { x: "14%", y: "0%" },
  right: { x: "-14%", y: "0%" },
};

/** the OLD layer drifts on a bit as it exits (continuing the flow) — a real
    animatable value so framer keeps it MOUNTED and visible for the whole
    transition, holding the old image under the shader (a zIndex-only exit is
    removed instantly, which flashed the empty card and broke the effect) */
const EXIT_DRIFT: Record<PushDir, { x: string; y: string }> = {
  up: { x: "0%", y: "-7%" },
  down: { x: "0%", y: "7%" },
  left: { x: "-7%", y: "0%" },
  right: { x: "7%", y: "0%" },
};

// Liquid Warp — directional noise-smear sweep on photo cells; non-photo cells
// drift + skew IN from the travel direction so the whole grid reads as one
// flowing directional wave (the opposite character to ripple's radial reveal).
const liquidWarpImpl: TransitionImpl = {
  scope: "card",
  directional: true,
  textMode: "static",
  card: (ctx: CardCtx): LayerSpec => {
    const d = DRIFT[ctx.dir];
    const horiz = ctx.dir === "left" || ctx.dir === "right";
    const skew = ctx.dir === "left" || ctx.dir === "up" ? 6 : -6;
    return {
      initial: {
        opacity: 0,
        x: d.x,
        y: d.y,
        ...(horiz ? { skewY: skew } : { skewX: skew }),
        zIndex: 2,
      },
      animate: {
        opacity: 1,
        x: "0%",
        y: "0%",
        ...(horiz ? { skewY: 0 } : { skewX: 0 }),
        zIndex: 2,
      },
      // hold the old image mounted + visible for the full enter (see EXIT_DRIFT)
      exitTarget: { ...EXIT_DRIFT[ctx.dir], zIndex: 1 },
      exitTransition: { duration: ctx.enter, ease: "linear" },
      webgl: "displace-sweep",
    };
  },
};

export const IMPLS: Record<string, TransitionImpl> = {
  ripple: rippleImpl,
  "liquid-warp": liquidWarpImpl,
};
