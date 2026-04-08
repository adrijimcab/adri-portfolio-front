import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

class AuthServiceStub {
  readonly isAuthenticated = signal(false);
}

class RouterStub {
  lastNavigation: unknown[] | null = null;
  createUrlTree(commands: unknown[]): UrlTree {
    this.lastNavigation = commands;
    return { __isUrlTree: true } as unknown as UrlTree;
  }
}

function runGuard(): boolean | UrlTree {
  const result = TestBed.runInInjectionContext(() =>
    authGuard({} as never, {} as never),
  );
  if (result instanceof Promise) {
    throw new Error('authGuard should be synchronous');
  }
  return result as boolean | UrlTree;
}

describe('authGuard', () => {
  let authStub: AuthServiceStub;
  let routerStub: RouterStub;

  beforeEach(() => {
    authStub = new AuthServiceStub();
    routerStub = new RouterStub();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: Router, useValue: routerStub },
      ],
    });
  });

  it('allows navigation when the user is authenticated', () => {
    authStub.isAuthenticated.set(true);
    const result = runGuard();
    expect(result).toBe(true);
    expect(routerStub.lastNavigation).toBeNull();
  });

  it('redirects to /login when the user is not authenticated', () => {
    authStub.isAuthenticated.set(false);
    const result = runGuard();
    expect(result).not.toBe(true);
    expect(routerStub.lastNavigation).toEqual(['/login']);
  });
});
