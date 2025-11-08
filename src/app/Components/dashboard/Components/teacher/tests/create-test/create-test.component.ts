import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { QuestionModel, QuestionService } from '../../../../../../Services/question.service';
import { TestService } from '../../../../../../Services/test.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css'],
})
export class CreateTestComponent implements OnInit {
  testTitle = '';
  className = '';
  duration = 60;
  maxDegree = 100;
  minDegree = 50;

  selectedQuestions: string[] = [];

  questions$!: Observable<{
    mcq: QuestionModel[];
    truefalse: QuestionModel[];
    text: QuestionModel[];
  }>;

  constructor(private questionService: QuestionService, private testService: TestService) {}

  ngOnInit() {
    // Group questions by type from the QuestionService
    this.questions$ = this.questionService.questions$.pipe(
      map((questions: QuestionModel[]) => ({
        mcq: questions.filter((q) => q.type === 'mcq'),
        truefalse: questions.filter((q) => q.type === 'truefalse'),
        text: questions.filter((q) => q.type === 'text'),
      }))
    );
  }

  isSelected(id: string): boolean {
    return this.selectedQuestions.includes(id);
  }

  toggleQuestion(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedQuestions.push(id);
    } else {
      this.selectedQuestions = this.selectedQuestions.filter((qId) => qId !== id);
    }
  }

  createTest() {
    if (!this.testTitle || !this.className || this.selectedQuestions.length === 0) {
      alert('Please fill all fields and select at least one question.');
      return;
    }

    const newTest = {
      id: uuidv4(),
      title: this.testTitle,
      className: this.className,
      duration: this.duration,
      maxDegree: this.maxDegree,
      minDegree: this.minDegree,
      questionIds: [...this.selectedQuestions],
      createdAt: new Date().toISOString(),
    };

    this.testService.add(newTest);
    this.resetForm();
  }

  resetForm() {
    this.testTitle = '';
    this.className = '';
    this.duration = 60;
    this.maxDegree = 100;
    this.minDegree = 50;
    this.selectedQuestions = [];
  }
}
