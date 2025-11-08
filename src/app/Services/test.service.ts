import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TestModel {
  id: string;
  title: string;
  className: string;
  duration: number; // in minutes
  maxDegree: number;
  minDegree: number;
  questionIds: string[];
}

@Injectable({ providedIn: 'root' })
export class TestService {
  private _tests = new BehaviorSubject<TestModel[]>([]);
  tests$ = this._tests.asObservable();

  add(test: TestModel) {
    const current = this._tests.value;
    this._tests.next([...current, test]);
  }

  delete(id: string) {
    const updated = this._tests.value.filter(t => t.id !== id);
    this._tests.next(updated);
  }
}
