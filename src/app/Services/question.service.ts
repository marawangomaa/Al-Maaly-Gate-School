import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// 🧩 Exported types and model directly from the service
export type QuestionType = 'mcq' | 'truefalse' | 'text';

export interface QuestionModel {
  id: string;
  type: QuestionType;
  text: string;
  options?: { id: string; text: string }[];
  correctOptionId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private storageKey = 'app_questions';
  private subject = new BehaviorSubject<QuestionModel[]>(this.loadFromStorage());

  get questions$(): Observable<QuestionModel[]> {
    return this.subject.asObservable();
  }

  get snapshot(): QuestionModel[] {
    return this.subject.getValue();
  }

  add(question: Omit<QuestionModel, 'id' | 'createdAt'>) {
    const newQ: QuestionModel = {
      ...question,
      id: 'q_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    const next = [newQ, ...this.snapshot];
    this.save(next);
  }

  update(id: string, patch: Partial<QuestionModel>) {
    const next = this.snapshot.map((q) => (q.id === id ? { ...q, ...patch } : q));
    this.save(next);
  }

  delete(id: string) {
    const next = this.snapshot.filter((q) => q.id !== id);
    this.save(next);
  }

  private save(list: QuestionModel[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
    this.subject.next(list);
  }

  private loadFromStorage(): QuestionModel[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as QuestionModel[];
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  }

  // 🆕 Helper: Get questions by type
  getByType(type: QuestionType): QuestionModel[] {
    return this.snapshot.filter((q) => q.type === type);
  }

  // 🆕 Helper: Get questions grouped by type
  getGroupedByType(): Record<QuestionType, QuestionModel[]> {
    return {
      mcq: this.getByType('mcq'),
      truefalse: this.getByType('truefalse'),
      text: this.getByType('text'),
    };
  }
}
