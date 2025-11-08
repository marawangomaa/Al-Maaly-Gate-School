import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ClassModel {
  id: string;
  grade: string;
  section: string;
  subject: string;
  meetingLink: string;
  startTime: string; // ISO string
  duration: number; // minutes
  ended: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private storageKey = 'app_classes';
  private subject = new BehaviorSubject<ClassModel[]>(this.loadFromStorage());

  classes$ = this.subject.asObservable();

  private loadFromStorage(): ClassModel[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as ClassModel[]) : [];
    } catch {
      return [];
    }
  }

  private save(list: ClassModel[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(list));
    this.subject.next(list);
  }

  addClass(cls: Omit<ClassModel, 'id' | 'ended'>) {
    const newClass: ClassModel = {
      ...cls,
      id: 'c_' + Date.now().toString(36),
      ended: false
    };
    const next = [newClass, ...this.subject.getValue()];
    this.save(next);
  }

  endClass(id: string) {
    const next = this.subject.getValue().map(c =>
      c.id === id ? { ...c, ended: true } : c
    );
    this.save(next);
  }
}
