// admin-all-student-tests-result.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { StudentModel } from '../../../../../Interfaces/istudent';
import { DegreeItemDto, StudentDegreesDto } from '../../../../../Interfaces/idegree';
import { ClassService } from '../../../../../Services/class.service';
import { DegreeService } from '../../../../../Services/degree.service';

@Component({
  selector: 'app-admin-all-student-tests-result',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-all-student-tests-result.component.html',
  styleUrls: ['./admin-all-student-tests-result.component.css']
})
export class AdminAllStudentTestsResultComponent implements OnInit {
  // Filter properties
  selectedType: string = 'الكل';
  selectedClassId: string = '';

  // Data properties
  classes: ClassViewDto[] = [];
  students: StudentModel[] = [];
  studentDegreesMap: Map<string, DegreeItemDto[]> = new Map(); // studentId -> degrees[]

  // Loading states
  loadingClasses: boolean = false;
  loadingStudents: boolean = false;
  loadingDegrees: boolean = false;
  loadingStudentDetails: boolean = false;

  // UI state
  expandedStudentId: string | null = null;
  showStudentDetailsModal: boolean = false;
  selectedStudentDegrees: DegreeItemDto[] = [];
  selectedStudentName: string = '';
  selectedClassName: string = '';

  constructor(
    private classService: ClassService,
    private degreeService: DegreeService
  ) {}

  ngOnInit(): void {
    this.loadAllClasses();
  }

  // Load all classes
  loadAllClasses(): void {
    this.loadingClasses = true;
    this.classService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.classes = response.data;
        }
        this.loadingClasses = false;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.loadingClasses = false;
      }
    });
  }

  // Load students by class
  loadStudentsByClass(classId: string): void {
    this.loadingStudents = true;
    this.selectedClassId = classId;
    this.students = [];
    this.expandedStudentId = null;
    this.studentDegreesMap.clear();
    
    this.classService.getStudentsByClass(classId).subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data;
        }
        this.loadingStudents = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loadingStudents = false;
      }
    });
  }

  // Load degrees for a specific student
  loadStudentDegrees(studentId: string, studentName: string): void {
    if (this.studentDegreesMap.has(studentId)) {
      // Already loaded, just toggle expansion
      this.expandedStudentId = this.expandedStudentId === studentId ? null : studentId;
      return;
    }

    this.loadingDegrees = true;
    this.degreeService.getStudentDegrees(studentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const degrees = response.data.degrees || [];
          
          // Filter by selected type if needed
          let filteredDegrees = degrees;
          if (this.selectedType !== 'الكل') {
            filteredDegrees = degrees.filter(degree => 
              degree && degree.degreeType === this.selectedType
            );
          }
          
          this.studentDegreesMap.set(studentId, filteredDegrees);
          this.expandedStudentId = studentId;
        } else {
          // If no degrees found, set empty array
          this.studentDegreesMap.set(studentId, []);
          this.expandedStudentId = studentId;
        }
        this.loadingDegrees = false;
      },
      error: (error) => {
        console.error('Error loading student degrees:', error);
        // Set empty array on error
        this.studentDegreesMap.set(studentId, []);
        this.loadingDegrees = false;
      }
    });
  }

  // Open student details modal
  openStudentDetailsModal(studentId: string, studentName: string): void {
    console.log("openStudentDetailsModal called with:", { studentId, studentName });
    
    // Check if degrees are already loaded
    if (this.studentDegreesMap.has(studentId)) {
      const degrees = this.studentDegreesMap.get(studentId);
      console.log("Degrees already loaded:", degrees?.length);
      
      if (degrees && degrees.length > 0) {
        this.showStudentDetails(studentId, studentName, degrees);
      } else {
        console.log("No degrees found in cache, loading...");
        this.loadStudentDegreesForModal(studentId, studentName);
      }
    } else {
      console.log("Degrees not loaded yet, loading...");
      this.loadStudentDegreesForModal(studentId, studentName);
    }
  }

  // Load degrees specifically for modal
  loadStudentDegreesForModal(studentId: string, studentName: string): void {
    this.loadingStudentDetails = true;
    
    this.degreeService.getStudentDegrees(studentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const degrees = response.data.degrees || [];
          
          // Filter by selected type if needed
          let filteredDegrees = degrees;
          if (this.selectedType !== 'الكل') {
            filteredDegrees = degrees.filter(degree => 
              degree && degree.degreeType === this.selectedType
            );
          }
          
          // Update the cache
          this.studentDegreesMap.set(studentId, filteredDegrees);
          
          if (filteredDegrees.length > 0) {
            this.showStudentDetails(studentId, studentName, filteredDegrees);
          } else {
            alert('لا توجد نتائج لهذا الطالب');
          }
        } else {
          alert('لا توجد نتائج لهذا الطالب');
        }
        this.loadingStudentDetails = false;
      },
      error: (error) => {
        console.error('Error loading student degrees for modal:', error);
        alert('حدث خطأ أثناء تحميل النتائج');
        this.loadingStudentDetails = false;
      }
    });
  }

  // Show student details in modal
  showStudentDetails(studentId: string, studentName: string, degrees: DegreeItemDto[]): void {
    console.log("Showing student details with", degrees.length, "degrees");
    this.selectedStudentDegrees = degrees;
    this.selectedStudentName = studentName;
    this.selectedClassName = this.getClassName(this.selectedClassId);
    this.showStudentDetailsModal = true;
  }

  // Close student details modal
  closeStudentDetailsModal(): void {
    this.showStudentDetailsModal = false;
    this.selectedStudentDegrees = [];
    this.selectedStudentName = '';
    this.selectedClassName = '';
  }

  // Get class name by ID
  getClassName(classId: string): string {
    if (!classId) return 'غير محدد';
    const classItem = this.classes.find(c => c.id === classId);
    return classItem ? classItem.className : 'غير معروف';
  }

  // Calculate pass/fail status
  getPassStatus(score: number, maxScore: number): { status: string, isPass: boolean } {
    if (maxScore === 0) return { status: 'غير محدد', isPass: false };
    const percentage = (score / maxScore) * 100;
    const isPass = percentage >= 50;
    return {
      status: isPass ? 'ناجح' : 'راسب',
      isPass: isPass
    };
  }

  // Calculate student average
  calculateStudentAverage(degrees: DegreeItemDto[]): number {
    if (!degrees || degrees.length === 0) return 0;
    
    const totalPercentage = degrees.reduce((sum, degree) => {
      if (degree && degree.maxScore > 0) {
        return sum + (degree.score / degree.maxScore);
      }
      return sum;
    }, 0);
    
    return (totalPercentage / degrees.length) * 100;
  }

  // Calculate degree percentage
  calculateDegreePercentage(score: number, maxScore: number): number {
    if (maxScore === 0) return 0;
    return (score / maxScore) * 100;
  }

  // Handle class change
  onClassChange(): void {
    if (this.selectedClassId) {
      this.loadStudentsByClass(this.selectedClassId);
    } else {
      this.students = [];
      this.expandedStudentId = null;
      this.studentDegreesMap.clear();
    }
  }

  // Handle type change
  onTypeChange(): void {
    // Clear all loaded degrees so they get reloaded with new filter
    this.studentDegreesMap.clear();
    this.expandedStudentId = null;
    
    // Reload degrees for expanded student if any
    if (this.expandedStudentId) {
      const student = this.students.find(s => s.id === this.expandedStudentId);
      if (student) {
        this.loadStudentDegrees(student.id, student.fullName || student.fullName);
      }
    }
  }

  // Check if student has degrees
  hasDegrees(studentId: string): boolean {
    const degrees = this.studentDegreesMap.get(studentId);
    return degrees !== undefined && degrees !== null && degrees.length > 0;
  }
}