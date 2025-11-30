import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { QuestionService } from '../../../../../../Services/question.service';
import { QuestionTypes } from "../../../../../../Interfaces/QuestionTypes";

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
      content: ['', [Validators.required, Validators.minLength(3)]],
      degree: [1, [Validators.required, Validators.min(1)]],
      type: ['Choices', Validators.required],
      choices: this.fb.array([]),
      correctChoiceId: [null],
      trueAndFalses: [null],
      correctTextAnswer: ['']
    });

    this.setupDefaultOptions();
  }

  // دالة واحدة للحصول على الخيارات
  get choices(): FormArray {
    return this.form.get('choices') as FormArray;
  }

  getOptionControl(index: number): FormControl {
    const optionGroup = this.choices.at(index) as FormGroup;
    return optionGroup.get('text') as FormControl;
  }

  setupDefaultOptions() {
    this.choices.clear();
    if (this.form.value.type === 'Choices') {
      this.addOption();
      this.addOption();
    }
  }

  setupConnectionOptions() {
    this.choices.clear();
    for (let i = 0; i < 6; i++) {
      this.choices.push(
        this.fb.group({
          id: 'opt_' + i,
          text: ['', Validators.required],
          isCorrect: [false]
        })
      );
    }
  }

  onCorrectCheckboxChange() {
    const selected = this.choices.controls.filter((c) => (c as FormGroup).get('isCorrect')?.value);
    if (selected.length > 2) {
      const lastChecked = selected[selected.length - 1] as FormGroup;
      lastChecked.get('isCorrect')?.setValue(false);
      alert('✅ يمكنك اختيار إجابتين صحيحتين فقط');
    }
  }

  onTypeChange() {
    const type = this.form.get('type')?.value;

    // إعادة تعيين جميع القيم
    this.form.patchValue({
      correctChoiceId: null,
      trueAndFalses: null,
      correctTextAnswer: ''
    });

    this.choices.clear();

    if (type === 'Choices') {
      this.setupDefaultOptions();
    } else if (type === 'TrueOrFalse') {
      this.form.patchValue({ trueAndFalses: true });
    } else if (type === 'Connection') {
      this.setupConnectionOptions();
    }
    // نوع Complete لا يحتاج خيارات
  }

  addOption() {
    const id = 'opt_' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
    this.choices.push(this.fb.group({
      id: [id],
      text: ['', Validators.required]
    }));
  }

  removeOption(index: number) {
    const removedOption = this.choices.at(index).value;
    this.choices.removeAt(index);

    // إذا كان الخيار المحذوف هو الصحيح، إعادة تعيين correctChoiceId
    if (removedOption.id === this.form.value.correctChoiceId) {
      this.form.patchValue({ correctChoiceId: null });
    }
  }

  markCorrect(id: string) {
    this.form.patchValue({ correctChoiceId: id });
  }

  resetForm() {
    this.form.reset({
      type: 'Choices',
      degree: 1,
      content: '',
      correctChoiceId: null,
      trueAndFalses: null,
      textAnswer: ''
    });
    this.setupDefaultOptions();
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('❌ يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const value = this.form.value;
    const teacherId = localStorage.getItem('teacherId') || '';

    // التحقق من صحة البيانات حسب النوع
    if (value.type === 'Choices') {
      if (!value.correctChoiceId) {
        alert('❌ يرجى تحديد الإجابة الصحيحة');
        return;
      }
      if (this.choices.length < 2) {
        alert('❌ يرجى إضافة خيارين على الأقل');
        return;
      }
    } else if (value.type === 'Connection') {
      const correctCount = this.choices.controls.filter((c) => (c as FormGroup).get('isCorrect')?.value).length;
      if (correctCount !== 2) {
        alert('✅ يجب تحديد إجابتين صحيحتين بالضبط');
        return;
      }
    } else if (value.type === 'Complete' && !value.correctTextAnswer) {
      alert('❌ يرجى إدخال الإجابة');
      return;
    } else if (value.type === 'TrueOrFalse' && value.trueAndFalses === null) {
      alert('❌ يرجى اختيار true أو false');
      return;
    }

    // ✅ Convert string → enum number
    let typeNum: QuestionTypes;
    switch (value.type) {
      case 'Choices':
        typeNum = QuestionTypes.Choices;
        break;
      case 'Connection':
        typeNum = QuestionTypes.Connection;
        break;
      case 'Complete':
        typeNum = QuestionTypes.Complete;
        break;
      default:
        typeNum = QuestionTypes.TrueOrFalse;
        break;
    }

    const base: any = {
      content: value.content,
      degree: value.degree || 1,
      teacherId: teacherId,
      type: typeNum
    };

    let payload: any;

    if (value.type === 'Choices') {
      const correctId = value.correctChoiceId;
      const choices = value.choices.map((o: any) => ({
        text: o.text,
        isCorrect: o.id === correctId
      }));
      payload = { ...base, choices };
    } else if (value.type === 'TrueOrFalse') {
      payload = { ...base, trueAndFalses: value.trueAndFalses };
    } else if (value.type === 'Connection') {
      const choices = value.choices.map((o: any) => ({
        text: o.text,
        isCorrect: o.isCorrect
      }));
      payload = { ...base, choices };
    } else {
      payload = { ...base, correctTextAnswer: value.correctTextAnswer };
    }

    console.log("✅ Final Payload Sent:", payload);

    this.qs.create(payload).subscribe({
      next: res => {
        console.log('✅ Created Successfully:', res);
        alert('✅ تم حفظ السؤال بنجاح');
        this.resetForm();
      },
      error: err => {
        console.error('❌ Create Error:', err);
        alert('❌ حدث خطأ أثناء حفظ السؤال');
      }
    });
  }
}