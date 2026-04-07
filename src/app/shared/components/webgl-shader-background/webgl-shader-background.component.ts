import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  viewChild,
  OnDestroy,
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
    afterNextRender(async () => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.cleanup = await this.initThree();
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

    // Subtle animated gradient mesh: three drifting radial blobs + a dim dot grid,
    // composited onto a black base. Matches Aurora's language so swapping is seamless.
    const fragmentShader = /* glsl */ `
      precision highp float;

      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColorPrimary;
      uniform vec3 uColorSecondary;
      uniform vec3 uColorAccent;

      float blob(vec2 uv, vec2 center, float radius) {
        float d = distance(uv, center);
        return smoothstep(radius, 0.0, d);
      }

      void main() {
        vec2 uv = vUv;
        float aspect = uResolution.x / uResolution.y;
        vec2 auv = vec2(uv.x * aspect, uv.y);

        float t = uTime * 0.08;

        vec2 c1 = vec2(0.25 * aspect + 0.08 * sin(t * 1.1), 0.80 + 0.05 * cos(t * 0.9));
        vec2 c2 = vec2(0.75 * aspect + 0.06 * cos(t * 0.8), 0.20 + 0.05 * sin(t * 1.2));
        vec2 c3 = vec2(0.50 * aspect + 0.05 * sin(t * 0.6), 0.50 + 0.04 * cos(t * 0.7));

        float b1 = blob(auv, c1, 0.55);
        float b2 = blob(auv, c2, 0.50);
        float b3 = blob(auv, c3, 0.40);

        vec3 col = vec3(0.0);
        col += uColorPrimary   * b1 * 0.20;
        col += uColorSecondary * b2 * 0.15;
        col += uColorAccent    * b3 * 0.10;

        // Dim dot grid overlay to match Aurora's radial-gradient dots.
        vec2 grid = fract(uv * uResolution / 24.0) - 0.5;
        float dot = smoothstep(0.08, 0.0, length(grid));
        col += vec3(0.05) * dot;

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

    const clock = new THREE.Clock();
    let rafId: number | null = null;
    let paused = false;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const renderFrame = (): void => {
      (uniforms['uTime'] as THREE.IUniform<number>).value = clock.getElapsedTime();
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
      document.removeEventListener('visibilitychange', onVisibilityChange);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }
}
