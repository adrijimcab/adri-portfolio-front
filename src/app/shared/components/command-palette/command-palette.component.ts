import type {
  OnDestroy,
  ElementRef} from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  afterNextRender,
  PLATFORM_ID,
  viewChild,
  effect,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

interface Command {
  id: string;
  label: string;
  hint: string;
  group: 'Navigation' | 'Actions' | 'External';
  action: () => void;
}

/**
 * Cmd+K command palette. Lazy attaches the keyboard listener after first
 * render. Search is fuzzy-ish (substring + word match). SSR-safe.
 */
@Component({
  selector: 'app-command-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="cmdk-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        (click)="close()"
      >
        <div class="cmdk-panel" (click)="$event.stopPropagation()">
          <input
            #search
            class="cmdk-input"
            type="text"
            placeholder="Type a command or search…"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeyDown($event)"
            autocomplete="off"
            spellcheck="false"
            aria-label="Search commands"
          />
          <div class="cmdk-results" role="listbox">
            @for (group of grouped(); track group.name) {
              <div class="cmdk-group-label">{{ group.name }}</div>
              @for (cmd of group.items; track cmd.id; let i = $index) {
                <button
                  type="button"
                  class="cmdk-item"
                  [class.cmdk-active]="cmd.id === activeId()"
                  role="option"
                  [attr.aria-selected]="cmd.id === activeId()"
                  (click)="run(cmd)"
                  (mouseenter)="setActive(cmd.id)"
                >
                  <span class="cmdk-label">{{ cmd.label }}</span>
                  <span class="cmdk-hint">{{ cmd.hint }}</span>
                </button>
              }
            }
            @if (filtered().length === 0) {
              <p class="cmdk-empty">No commands match.</p>
            }
          </div>
          <footer class="cmdk-footer">
            <kbd>↑↓</kbd> navigate
            <kbd>↵</kbd> select
            <kbd>esc</kbd> close
            <kbd>?</kbd> open
          </footer>
        </div>
      </div>
    }
  `,
  styles: [`
    .cmdk-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12vh;
    }
    .cmdk-panel {
      width: 100%;
      max-width: 36rem;
      background: rgba(20, 20, 26, 0.92);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.75rem;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
      overflow: hidden;
      animation: cmdk-pop 0.18s ease-out;
    }
    @keyframes cmdk-pop {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .cmdk-input {
      width: 100%;
      padding: 1.1rem 1.25rem;
      background: transparent;
      border: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      color: #fff;
      font-size: 1rem;
      outline: none;
    }
    .cmdk-input::placeholder { color: rgba(255, 255, 255, 0.35); }
    .cmdk-results {
      max-height: 22rem;
      overflow-y: auto;
      padding: 0.5rem;
    }
    .cmdk-group-label {
      padding: 0.5rem 0.75rem 0.25rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.4);
    }
    .cmdk-item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 0.75rem;
      background: transparent;
      border: 0;
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.9rem;
      text-align: left;
      border-radius: 0.4rem;
      cursor: pointer;
      transition: background 0.1s;
    }
    .cmdk-item.cmdk-active,
    .cmdk-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    .cmdk-hint {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .cmdk-empty {
      padding: 1.5rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.85rem;
    }
    .cmdk-footer {
      display: flex;
      gap: 1rem;
      padding: 0.65rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.4);
    }
    .cmdk-footer kbd {
      padding: 0.1rem 0.4rem;
      border-radius: 0.25rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: ui-monospace, monospace;
      font-size: 0.7rem;
      margin-right: 0.25rem;
    }
  `],
})
export class CommandPaletteComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);

  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('search');

  readonly open = signal(false);
  readonly query = signal('');
  readonly activeId = signal<string | null>(null);

  /** Keyboard buffer for vim-style sequences (e.g. `g` + `h`). */
  private keyBuffer = '';
  private bufferTimeout?: ReturnType<typeof setTimeout>;
  private static readonly BUFFER_TIMEOUT_MS = 800;

  private readonly commands: Command[] = [
    { id: 'home',    label: 'Home',          hint: 'g h', group: 'Navigation', action: () => this.go('/') },
    { id: 'projects',label: 'Projects',      hint: 'g p', group: 'Navigation', action: () => this.go('/projects') },
    { id: 'blog',    label: 'Blog',          hint: 'g b', group: 'Navigation', action: () => this.go('/blog') },
    { id: 'cv',      label: 'CV',            hint: 'g c', group: 'Navigation', action: () => this.go('/cv') },
    { id: 'uses',    label: 'Uses',          hint: 'g u', group: 'Navigation', action: () => this.go('/uses') },
    { id: 'stack',   label: 'Stack',         hint: 'g s', group: 'Navigation', action: () => this.go('/stack') },
    { id: 'now',     label: 'Now',           hint: 'g n', group: 'Navigation', action: () => this.go('/now') },
    { id: 'lab',     label: 'Lab',           hint: 'g l', group: 'Navigation', action: () => this.go('/lab') },
    { id: 'theme',   label: 'Toggle theme',  hint: 't',   group: 'Actions',    action: () => this.themeService.toggle() },
    { id: 'top',     label: 'Scroll to top', hint: 'gg',  group: 'Actions',    action: () => this.scrollTop() },
    { id: 'github',  label: 'GitHub',        hint: '↗',   group: 'External',   action: () => this.openExternal('https://github.com/adrijimcab') },
    { id: 'linkedin',label: 'LinkedIn',      hint: '↗',   group: 'External',   action: () => this.openExternal('https://www.linkedin.com/in/adrianjimenezcabello') },
  ];

  /**
   * Static map of vim-style shortcut → action. Matched against {@link keyBuffer}
   * after every keystroke. Kept as a plain object so it is tree-shake friendly
   * and trivially unit-testable via {@link matchShortcut}.
   */
  private readonly shortcutMap: Record<string, () => void> = {
    gh: () => this.go('/'),
    gp: () => this.go('/projects'),
    gb: () => this.go('/blog'),
    gu: () => this.go('/uses'),
    gs: () => this.go('/stack'),
    gn: () => this.go('/now'),
    gl: () => this.go('/lab'),
    gc: () => this.go('/cv'),
    gg: () => this.scrollTop(),
    t: () => this.themeService.toggle(),
  };

  readonly filtered = computed<Command[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.commands;
    return this.commands.filter((c) =>
      c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q),
    );
  });

  readonly grouped = computed(() => {
    const list = this.filtered();
    const groups: { name: string; items: Command[] }[] = [];
    for (const cmd of list) {
      let g = groups.find((x) => x.name === cmd.group);
      if (!g) {
        g = { name: cmd.group, items: [] };
        groups.push(g);
      }
      g.items.push(cmd);
    }
    return groups;
  });

  private keyHandler?: (e: KeyboardEvent) => void;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.keyHandler = (e: KeyboardEvent) => this.handleGlobalKey(e);
      window.addEventListener('keydown', this.keyHandler);
    });

    effect(() => {
      if (this.open()) {
        const first = this.filtered()[0];
        if (first) this.activeId.set(first.id);
        queueMicrotask(() => this.searchInput()?.nativeElement.focus());
      }
    });
  }

  toggle(): void {
    this.open.update((v) => !v);
    if (!this.open()) {
      this.query.set('');
      this.activeId.set(null);
    }
  }

  close(): void {
    this.open.set(false);
    this.query.set('');
  }

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.query.set(v);
    const first = this.filtered()[0];
    this.activeId.set(first?.id ?? null);
  }

  onKeyDown(e: KeyboardEvent): void {
    const items = this.filtered();
    if (items.length === 0) return;
    const idx = items.findIndex((c) => c.id === this.activeId());
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(idx + 1) % items.length];
      this.activeId.set(next.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(idx - 1 + items.length) % items.length];
      this.activeId.set(prev.id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = items.find((c) => c.id === this.activeId());
      if (cmd) this.run(cmd);
    }
  }

  setActive(id: string): void {
    this.activeId.set(id);
  }

  run(cmd: Command): void {
    cmd.action();
    this.close();
  }

  private go(path: string): void {
    void this.router.navigate([path]);
  }

  private scrollTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private openExternal(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Root keyboard handler. Dispatches:
   *   1. Cmd/Ctrl+K and `?` → open palette
   *   2. Esc → close palette (only when open)
   *   3. Printable keys → vim-style buffer (`gh`, `gp`, `gg`, `t`, …)
   *
   * Ignores events that originate from text inputs / contenteditable so users
   * can type freely in forms without hijacking keystrokes.
   */
  private handleGlobalKey(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName;
    const isEditable =
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      target?.isContentEditable === true;

    // Always honor the palette toggles, even while typing? No — if the user is
    // in the palette's own input, that input handles Esc/Enter/Arrows itself.
    // Outside of editable fields we handle global hotkeys.
    if (!isEditable) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK || e.key === '?') {
        e.preventDefault();
        this.toggle();
        this.resetBuffer();
        return;
      }
    }

    if (e.key === 'Escape' && this.open()) {
      this.close();
      this.resetBuffer();
      return;
    }

    // Don't intercept typing, shortcut sequences, or while palette is open.
    if (isEditable || this.open()) return;

    // Ignore modifier-only combos (Cmd+X, Ctrl+X, Alt+X). Shift is fine so
    // printable keys like `?` still work if typed via shift.
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // Only printable single-char keys contribute to the sequence buffer.
    if (e.key.length !== 1) return;

    this.keyBuffer += e.key.toLowerCase();
    this.scheduleBufferReset();

    const matched = this.matchShortcut(this.keyBuffer);
    if (matched) {
      e.preventDefault();
      matched();
      this.resetBuffer();
    } else if (!this.hasPrefix(this.keyBuffer)) {
      // Buffer can't lead to any shortcut — flush it so the next key starts clean.
      this.resetBuffer();
    }
  }

  /** Exposed for unit tests. Returns the action bound to a sequence, or null. */
  matchShortcut(sequence: string): (() => void) | null {
    return this.shortcutMap[sequence] ?? null;
  }

  /** True when `sequence` is a strict prefix of at least one registered shortcut. */
  private hasPrefix(sequence: string): boolean {
    for (const key of Object.keys(this.shortcutMap)) {
      if (key !== sequence && key.startsWith(sequence)) return true;
    }
    return false;
  }

  private scheduleBufferReset(): void {
    if (this.bufferTimeout) clearTimeout(this.bufferTimeout);
    this.bufferTimeout = setTimeout(
      () => this.resetBuffer(),
      CommandPaletteComponent.BUFFER_TIMEOUT_MS,
    );
  }

  private resetBuffer(): void {
    this.keyBuffer = '';
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
    }
  }
}
