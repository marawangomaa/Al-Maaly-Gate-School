import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuestionService, QuestionType } from '../../../../../../Services/question.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-question',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './create-question.component.html',
  styleUrl: './create-question.component.css'
})
export class CreateQuestionComponent {
  form!: FormGroup;

  get options() {
    return this.form.get('options') as FormArray;
  }

  constructor(private fb: FormBuilder, private qs: QuestionService) {
    this.form = this.fb.group({
      type: ['mcq', Validators.required], // new type
      text: ['', [Validators.required, Validators.minLength(3)]],
      options: this.fb.array([] as any),
      correctOptionId: [''],
      difficulty: ['medium', Validators.required],
      tags: [''],
      trueFalseAnswer: ['true'] // only used if type = truefalse
    });

    this.setupDefaultOptions();
  }

  setupDefaultOptions() {
    this.options.clear();
    if (this.form.value.type === 'mcq') {
      this.addOption();
      this.addOption();
    }
  }

  onTypeChange() {
    this.setupDefaultOptions();
    this.form.patchValue({ correctOptionId: '', trueFalseAnswer: 'true' });
  }

  addOption() {
    const id = 'opt_' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    this.options.push(this.fb.group({ id: [id], text: ['', Validators.required] }));
  }

  removeOption(index: number) {
    this.options.removeAt(index);
    const selected = this.form.value.correctOptionId;
    if (selected && !this.options.value.find((o: any) => o.id === selected)) {
      this.form.patchValue({ correctOptionId: '' });
    }
  }

  markCorrect(id: string) {
    this.form.patchValue({ correctOptionId: id });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const question = {
      type: value.type as QuestionType,
      text: value.text,
      options: value.type === 'mcq' ? value.options.map((o: any) => ({ id: o.id, text: o.text })) : undefined,
      correctOptionId: value.type === 'mcq' ? value.correctOptionId : value.type === 'truefalse' ? value.trueFalseAnswer : undefined,
      difficulty: value.difficulty,
      tags: (value.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    };

    this.qs.add(question);

    // reset
    this.form.reset({ type: 'mcq', difficulty: 'medium', tags: '', trueFalseAnswer: 'true' });
    this.setupDefaultOptions();
  }

  getOptionControl(index: number): FormControl {
    return this.options.at(index).get('text') as FormControl;
  }
}
