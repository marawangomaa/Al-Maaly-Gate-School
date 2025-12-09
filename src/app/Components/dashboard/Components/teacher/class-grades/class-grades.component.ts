import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ClassService } from '../../../../../Services/class.service';
import { DegreeService } from '../../../../../Services/degree.service';
import { SubjectService } from '../../../../../Services/subject.service';
import { StudentService } from '../../../../../Services/student.service';

@Component({
  selector: 'app-class-grades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './class-grades.component.html',
  styleUrls: ['./class-grades.component.css']
})
export class ClassGradesComponent implements OnInit {

  classes: any[] = [];
  gradeForms: { [classId: string]: FormGroup } = {};
  expandedClassId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private classService: ClassService,
    private degreeService: DegreeService,
    private studentService: StudentService,
    private subjectService: SubjectService
  ) { }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses() {
    this.classService.getAll().subscribe(res => {
      this.classes = res.data;
      this.classes.forEach(cls => this.initializeClassForm(cls.id));
    });
  }

  initializeClassForm(classId: string) {
    this.classService.getStudentsByClass(classId).subscribe(studentRes => {
      const students = studentRes.data;

      this.classService.getSubjectsByClass(classId).subscribe(subRes => {
        console.log(subRes);

        const subjects = subRes.data;

        this.gradeForms[classId] = this.fb.group({
          students: this.fb.array(
            students.map((st: any) => this.createStudentForm(st, subjects))
          )
        });
      });
    });
  }

  createStudentForm(student: any, subjects: any[]): FormGroup {
    return this.fb.group({
      studentId: student.id,
      studentName: student.fullName,

      exams: this.fb.group({
        midterm1: this.createExamSubjects(subjects, 20),
        final1: this.createExamSubjects(subjects, 80),
        midterm2: this.createExamSubjects(subjects, 20),
        final2: this.createExamSubjects(subjects, 80)
      })
    });
  }

  createExamSubjects(subjects: any[], max: number): FormArray {
    return this.fb.array(
      subjects.map(sub =>
        this.fb.group({
          subjectId: sub.id,
          subjectName: sub.subjectName,
          score: [0],
          maxScore: [max]
        })
      )
    );
  }

  getStudentArray(classId: string): FormArray {
    return this.gradeForms[classId].get('students') as FormArray;
  }

  // ⭐ FIX: Safe getter for exam arrays
  getExamArray(studentForm: any, examName: string): FormArray {
    return studentForm.get('exams').get(examName) as FormArray;
  }

  toggleExpand(classId: string): void {
    this.expandedClassId = this.expandedClassId === classId ? null : classId;
  }

  saveGrades(classId: string): void {
    const form = this.gradeForms[classId].getRawValue();

    const dtoList: any[] = [];

    form.students.forEach((st: any) => {
      const exams = st.exams;

      const addExam = (type: string, arr: any[]) => {
        dtoList.push({
          studentId: st.studentId,
          degrees: arr.map(s => ({
            subjectId: s.subjectId,
            score: s.score,
            maxScore: s.maxScore,
            degreeType: type
          }))
        });
      };

      addExam("Midterm1", exams.midterm1);
      addExam("Final1", exams.final1);
      addExam("Midterm2", exams.midterm2);
      addExam("Final2", exams.final2);
    });

    dtoList.forEach(dto =>
      this.degreeService.addDegrees(dto).subscribe()
    );

    alert("Grades saved successfully!");
  }
}
