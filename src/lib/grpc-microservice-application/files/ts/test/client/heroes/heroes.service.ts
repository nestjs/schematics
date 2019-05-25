import { Observable } from 'rxjs';

export interface IHeroService {
  findOne(data: { id: number }): Observable<any>;
}
