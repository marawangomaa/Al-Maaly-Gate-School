import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionModel, QuestionTypes } from '../../../../../../Interfaces/iquestoin';
import { Observable } from 'rxjs';
import { QuestionService } from '../../../../../../Services/question.service';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './question-list.component.html',
  styleUrls: ['./question-list.component.css']
})
export class QuestionListComponent {

  QuestionTypes = QuestionTypes;
  questions$!: Observable<QuestionModel[]>; // reactive stream
  editingId: string | null = null;
  editContent: string = '';

  constructor(private qs: QuestionService) { }

  ngOnInit() {
    this.questions$ = this.qs.questions$; // subscribe to BehaviorSubject
    this.qs.loadAll(); // load data from API

    // Log whenever the BehaviorSubject emits
    this.questions$.subscribe(questions => {
      console.log('✅ Questions from service:', questions);
      questions.forEach(q => {
        console.log(`Question ID: ${q.id}, type: ${q.type}, text: ${q.content}`);
      });
    });
  }


  /** Filter questions by type */
  getByType(questions: QuestionModel[], type: QuestionTypes): QuestionModel[] {
    switch (type) {
      case QuestionTypes.Choices:
        return questions.filter(q => q.type === QuestionTypes.Choices);
      case QuestionTypes.TrueOrFalse:
        return questions.filter(q => q.type === QuestionTypes.TrueOrFalse);
      case QuestionTypes.Complete:
        return questions.filter(q => q.type === QuestionTypes.Complete);
      case QuestionTypes.Connection:
        return questions.filter(q => q.type === QuestionTypes.Connection);
      default:
        return [];
    }
  }


  /** Start editing a question */
  startEdit(q: QuestionModel) {
    this.editingId = q.id;
    this.editContent = q.content;
  }

  /** Save edited question */
  saveEdit(q: QuestionModel) {
    if (!this.editContent.trim()) return;

    this.qs.update(q.id, { content: this.editContent.trim(), degree: q.degree })
      .subscribe(() => {
        this.cancelEdit();
        this.qs.loadAll(); // reload after update
      });
  }

  /** Cancel edit */
  cancelEdit() {
    this.editingId = null;
    this.editContent = '';
  }

  /** Delete question */
  delete(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;

    this.qs.delete(id).subscribe(() => this.qs.loadAll()); // reload after delete
  }
}
