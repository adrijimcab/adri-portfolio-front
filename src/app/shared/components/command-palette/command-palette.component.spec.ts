import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { CommandPaletteComponent } from './command-palette.component';
import { ThemeService } from '../../../core/services/theme.service';

/** Minimal ThemeService double — the matcher only calls toggle(). */
class ThemeServiceStub {
  toggle(): void {
    /* no-op */
  }
}

describe('CommandPaletteComponent — shortcut matcher', () => {
  let component: CommandPaletteComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ThemeService, useClass: ThemeServiceStub },
      ],
    });
    const fixture = TestBed.createComponent(CommandPaletteComponent);
    component = fixture.componentInstance;
  });

  it('resolves every documented vim-style sequence to an action', () => {
    const sequences = ['gh', 'gp', 'gb', 'gu', 'gs', 'gn', 'gl', 'gc', 'gg', 't'];
    for (const seq of sequences) {
      expect(component.matchShortcut(seq)).toBeTypeOf('function');
    }
  });

  it('returns null for unknown sequences', () => {
    expect(component.matchShortcut('')).toBeNull();
    expect(component.matchShortcut('xyz')).toBeNull();
    expect(component.matchShortcut('g')).toBeNull();
  });
});
