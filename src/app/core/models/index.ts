/**
 * Legacy barrel — re-exports domain entities so existing consumers keep
 * importing from `core/models` without breakage while new code can point
 * directly at `core/domain/entities`.
 *
 * Prefer `core/domain/entities` in new code.
 */
export * from '../domain/entities';
