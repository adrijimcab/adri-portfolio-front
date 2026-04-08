import type { Observable } from 'rxjs';

/**
 * CrudResource — minimal CRUD port used by the generic admin editors.
 *
 * Each admin editor adapts its specific `AdminService` methods into this
 * contract and hands it to {@link GenericCrudComponent}. Keeps the editor
 * free of template/form/list/delete boilerplate and concentrates the HTTP
 * plumbing in one place.
 */
export interface CrudResource<
  T extends { id: string },
  TCreate = Partial<T>,
  TUpdate = Partial<T>,
> {
  list(): Observable<T[]>;
  create(dto: TCreate): Observable<T>;
  update(id: string, dto: TUpdate): Observable<T>;
  delete(id: string): Observable<void>;
}
