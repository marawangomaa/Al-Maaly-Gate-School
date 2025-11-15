import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionService } from '../../../../../../Services/question.service';
import { QuestionTypes } from '../../../../../../Interfaces/iquestoin';

@Component({
  selector: 'app-create-question',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-question.component.html',
  styleUrls: ['./create-question.component.css']
})
export class CreateQuestionComponent {

  form!: FormGroup;

  constructor(private fb: FormBuilder, private qs: QuestionService) {
    this.form = this.fb.group({
      type: ['Choices', Validators.required], // default backend type
      text: ['', [Validators.required, Validators.minLength(3)]],
      options: this.fb.array([]),
      correctOptionId: [''],
      difficulty: ['medium', Validators.required],
      tags: [''],
      trueFalseAnswer: ['true']
    });

    this.setupDefaultOptions();
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  getOptionControl(index: number): FormControl {
    return this.options.at(index).get('text') as FormControl;
  }

  setupDefaultOptions() {
    this.options.clear();
    if (this.form.value.type === 'Choices') {
      this.addOption();
      this.addOption();
    }
  }

  onTypeChange() {
    this.form.patchValue({
      correctOptionId: '',
      trueFalseAnswer: 'true'
    });
    this.setupDefaultOptions();
  }

  addOption() {
    const id = 'opt_' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    this.options.push(this.fb.group({
      id: [id],
      text: ['', Validators.required]
    }));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
    if (!this.options.value.find((o: any) => o.id === this.form.value.correctOptionId)) {
      this.form.patchValue({ correctOptionId: '' });
    }
  }

  markCorrect(id: string) {
    this.form.patchValue({ correctOptionId: id });
  }

  resetForm() {
    this.form.reset({
      type: 'Choices',
      difficulty: 'medium',
      tags: '',
      trueFalseAnswer: 'true'
    });
    this.setupDefaultOptions();
  }

  private difficultyToDegree(d: string): number {
    switch (d) {
      case 'easy': return 1;
      case 'hard': return 5;
      default: return 3; // medium
    }
  }

  save() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const value = this.form.value;
  const teacherId = localStorage.getItem('teacherId') || '';

  // ✅ Convert string → enum number
  let typeNum: QuestionTypes;
  switch (value.type) {
    case 'Choices':
      typeNum = QuestionTypes.Choices;
      break;
    case 'TrueOrFalse':
      typeNum = QuestionTypes.TrueOrFalse;
      break;
    default:
      typeNum = QuestionTypes.Text;
      break;
  }

  const base: any = {
    content: value.text,
    degree: this.difficultyToDegree(value.difficulty),
    teacherId: teacherId,
    type: typeNum   // ✅ SEND NUMBER NOT STRING
  };

  let payload: any;

  if (value.type === 'Choices') {
    const correctId = value.correctOptionId;

    const choices = value.options.map((o: any) => ({
      text: o.text,
      isCorrect: o.id === correctId
    }));

    payload = { ...base, choices };

  } else if (value.type === 'TrueOrFalse') {
    payload = { ...base, trueAndFalses: value.trueFalseAnswer === 'true' };

  } else {
    payload = { ...base };
  }

  console.log("✅ Final Payload Sent:", payload);

  this.qs.create(payload).subscribe({
    next: res => {
      console.log('✅ Created Successfully:', res);
      this.resetForm();
    },
    error: err => console.error('❌ Create Error:', err)
  });
}

}
