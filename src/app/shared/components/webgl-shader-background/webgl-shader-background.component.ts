import type {
  ElementRef,
  OnDestroy} from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  afterNextRender,
  inject,
  viewChild
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// Type-only import — erased at compile time, never added to any bundle.
import type * as THREE from 'three';

/**
 * WebGL shader background — lazy alternative to AuroraBackgroundComponent.
 *
 * - SSR-safe: three is dynamically imported inside afterNextRender + isPlatformBrowser
 *   so it never ends up in the server bundle.
 * - Visual tone matches Aurora: dark base, accent purple/blue blobs via CSS custom
 *   properties (`--color-primary`, `--color-secondary`, `--color-accent`).
 * - Performance: capped DPR, pauses on `visibilitychange`, single-frame render when
 *   `(prefers-reduced-motion: reduce)` is active.
 * - Not wired into app.ts yet — this is an opt-in alternative. Import it manually
 *   (or behind a feature flag) to swap with <app-aurora-background />.
 */
@Component({
  selector: 'app-webgl-shader-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 -z-10 overflow-hidden bg-black">
      <canvas #canvas class="block h-full w-full"></canvas>
    </div>
  `,
})
export class WebglShaderBackgroundComponent implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private cleanup?: () => void;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      void this.initThree().then((cleanup) => {
        this.cleanup = cleanup;
      });
    });
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }

  private async initThree(): Promise<() => void> {
    // Dynamic import keeps three out of the server bundle AND out of the
    // initial browser bundle unless something imports this component.
    const THREE = await import('three');

    const canvas = this.canvasRef().nativeElement;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Parse CSS custom properties so the shader matches Aurora's palette.
    const cssColor = (name: string, fallback: string): THREE.Vector3 => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      const c = new THREE.Color(raw);
      return new THREE.Vector3(c.r, c.g, c.b);
    };

    const uniforms: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColorPrimary: { value: cssColor('--color-primary', '#8b5cf6') },
      uColorSecondary: { value: cssColor('--color-secondary', '#3b82f6') },
      uColorAccent: { value: cssColor('--color-accent', '#a855f7') },
    };

    const vertexShader = /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Multi-layer animated mesh with simplex-style noise, 5 drifting blobs,
    // mouse-reactive distortion, and a faint dot grid overlay. This is the
    // version designed to be VISIBLY different from the CSS Aurora — more
    // motion, more depth, and the cursor pulls the field around.
    const fragmentShader = /* glsl */ `
      precision highp float;

      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uColorPrimary;
      uniform vec3 uColorSecondary;
      uniform vec3 uColorAccent;

      // Cheap 2D hash + value-noise (no textures, no extensions).
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * vnoise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      float blob(vec2 uv, vec2 center, float radius) {
        float d = distance(uv, center);
        return smoothstep(radius, 0.0, d);
      }

      void main() {
        float aspect = uResolution.x / uResolution.y;
        vec2 uv = vUv;
        vec2 auv = vec2(uv.x * aspect, uv.y);

        // Mouse vector (also aspect-corrected) and an attractor pull strength
        // that fades with distance from the cursor. Much stronger than v1.
        vec2 mouse = vec2(uMouse.x * aspect, uMouse.y);
        float md = distance(auv, mouse);
        float pull = exp(-md * 1.8) * 0.45;

        float t = uTime * 0.22;

        // 5 drifting blobs at different speeds + strong bias toward the cursor.
        vec2 c1 = vec2(0.20 * aspect + 0.22 * sin(t * 1.10), 0.78 + 0.14 * cos(t * 0.90));
        vec2 c2 = vec2(0.78 * aspect + 0.20 * cos(t * 0.80), 0.22 + 0.14 * sin(t * 1.20));
        vec2 c3 = vec2(0.50 * aspect + 0.28 * sin(t * 0.65), 0.50 + 0.16 * cos(t * 0.75));
        vec2 c4 = vec2(0.10 * aspect + 0.14 * cos(t * 1.30), 0.30 + 0.10 * sin(t * 1.05));
        vec2 c5 = vec2(0.90 * aspect + 0.14 * sin(t * 0.95), 0.85 + 0.10 * cos(t * 1.15));
        c1 = mix(c1, mouse, pull * 1.6);
        c2 = mix(c2, mouse, pull * 1.3);
        c3 = mix(c3, mouse, pull * 2.0);
        c4 = mix(c4, mouse, pull * 0.9);
        c5 = mix(c5, mouse, pull * 0.9);

        float b1 = blob(auv, c1, 0.72);
        float b2 = blob(auv, c2, 0.66);
        float b3 = blob(auv, c3, 0.62);
        float b4 = blob(auv, c4, 0.50);
        float b5 = blob(auv, c5, 0.55);

        // Domain-warped FBM noise field gives that "fluid plasma" look you cannot
        // produce with CSS gradients alone. The warp field also reacts to pull.
        vec2 q = auv * 2.5;
        vec2 warp = vec2(
          fbm(q + vec2(0.0, t) + (mouse - auv) * pull),
          fbm(q + vec2(5.2, -t * 0.9) - (mouse - auv) * pull)
        );
        float n = fbm(q * 1.6 + warp * 2.2 + t * 0.35);

        vec3 col = vec3(0.0);
        col += uColorPrimary   * b1 * 0.75;
        col += uColorSecondary * b2 * 0.62;
        col += uColorAccent    * b3 * 0.70;
        col += uColorPrimary   * b4 * 0.35;
        col += uColorSecondary * b5 * 0.35;

        // Plasma noise overlay drives the most visible movement.
        col += mix(uColorPrimary, uColorAccent, n) * 0.32 * smoothstep(0.15, 0.9, n);

        // Cursor glow ring — a soft halo that follows the pointer.
        float glow = exp(-md * 3.2) * 0.35;
        col += uColorAccent * glow;

        // Soft vignette that pulses gently with the noise field.
        float vig = smoothstep(1.2, 0.3, distance(uv, vec2(0.5)));
        col *= 0.55 + vig * 0.65;

        // Faint dot grid (carry-over from Aurora identity).
        vec2 grid = fract(uv * uResolution / 26.0) - 0.5;
        float dotMask = smoothstep(0.07, 0.0, length(grid));
        col += vec3(0.05) * dotMask;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Avoid THREE.Clock (deprecated in newer three versions). Use performance.now()
    // directly — zero allocation, no cross-version breakage.
    const startMs = performance.now();
    let rafId: number | null = null;
    let paused = false;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = (): void => {
      (uniforms['uTime'] as THREE.IUniform<number>).value =
        (performance.now() - startMs) / 1000;
      // Smooth lerp the mouse uniform toward the latest pointer position.
      const mouseUniform = uniforms['uMouse'] as THREE.IUniform<THREE.Vector2>;
      mouseUniform.value.lerp(targetMouse, 0.08);
      renderer.render(scene, camera);
    };

    const loop = (): void => {
      if (paused) return;
      renderFrame();
      rafId = requestAnimationFrame(loop);
    };

    const onResize = (): void => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      (uniforms['uResolution'] as THREE.IUniform<THREE.Vector2>).value.set(w, h);
      if (reducedMotion) renderFrame();
    };

    // Mouse-reactive distortion. Smoothed via lerp toward target so the
    // shader doesn't jitter on every pointermove event.
    const targetMouse = new THREE.Vector2(0.5, 0.5);
    const onPointerMove = (e: PointerEvent): void => {
      targetMouse.x = e.clientX / window.innerWidth;
      targetMouse.y = 1.0 - e.clientY / window.innerHeight;
    };

    const onVisibilityChange = (): void => {
      if (document.hidden) {
        paused = true;
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!reducedMotion) {
        paused = false;
        loop();
      }
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    if (reducedMotion) {
      renderFrame();
    } else {
      loop();
    }

    return () => {
      paused = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }
}
