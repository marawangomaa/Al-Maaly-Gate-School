import { Component } from '@angular/core';
import { QuestionModel, QuestionService } from '../../../../../../Services/question.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionListComponent {
  questions$!: Observable<QuestionModel[]>;
  editingId: string | null = null;
  editText = '';

  constructor(private qs: QuestionService) {
    this.questions$ = this.qs.questions$;
  }

  /** Filter helper to separate questions by type */
  getByType(list: QuestionModel[], type: string): QuestionModel[] {
    return list.filter(q => q.type === type);
  }

  startEdit(q: QuestionModel) {
    this.editingId = q.id;
    this.editText = q.text;
  }

  saveEdit(q: QuestionModel) {
    if (!this.editingId || !this.editText.trim()) return;
    this.qs.update(this.editingId, { text: this.editText.trim() });
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingId = null;
    this.editText = '';
  }

  delete(id: string) {
    if (!confirm('Are you sure?')) return;
    this.qs.delete(id);
  }
}
