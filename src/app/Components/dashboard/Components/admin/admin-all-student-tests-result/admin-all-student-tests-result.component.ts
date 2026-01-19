// admin-all-student-tests-result.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClassViewDto } from '../../../../../Interfaces/iclass';
import { StudentModel } from '../../../../../Interfaces/istudent';
import { DegreeItemDto, StudentDegreesDto, DegreeType } from '../../../../../Interfaces/idegree';
import { ClassService } from '../../../../../Services/class.service';
import { DegreeService } from '../../../../../Services/degree.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '../../../../../Services/UtilServices/toast.service';

@Component({
  selector: 'app-admin-all-student-tests-result',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './admin-all-student-tests-result.component.html',
  styleUrls: ['./admin-all-student-tests-result.component.css']
})
export class AdminAllStudentTestsResultComponent implements OnInit {
  // Filter properties
  selectedType: string = 'الكل';
  selectedClassId: string = '';

  // Exam types filter options
  examTypeOptions = [
    { value: 'الكل', label: 'examTypes.الكل', type: undefined },
    { value: 'MidTerm1', label: 'examTypes.MidTerm1', type: DegreeType.MidTerm1 },
    { value: 'Final1', label: 'examTypes.Final1', type: DegreeType.Final1 },
    { value: 'MidTerm2', label: 'examTypes.MidTerm2', type: DegreeType.MidTerm2 },
    { value: 'Final2', label: 'examTypes.Final2', type: DegreeType.Final2 }
  ];

  // Data properties
  classes: ClassViewDto[] = [];
  students: StudentModel[] = [];
  studentDegreesMap: Map<string, DegreeItemDto[]> = new Map();
  studentFullDegreesMap: Map<string, StudentDegreesDto> = new Map();

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
  selectedStudentId: string = '';

  constructor(
    private classService: ClassService,
    private degreeService: DegreeService,
    private toastService : ToastService
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
          this.classes = response.data || [];
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
    this.studentFullDegreesMap.clear();
    
    this.classService.getStudentsByClass(classId).subscribe({
      next: (response) => {
        if (response.success) {
          this.students = response.data || [];
        }
        this.loadingStudents = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.loadingStudents = false;
      }
    });
  }

  // Get exam type display name - handle both string and number
  getExamTypeDisplayName(degreeType: number | string): string {
    // Convert string to number if needed
    let typeValue: number;
    
    if (typeof degreeType === 'string') {
      switch(degreeType) {
        case 'MidTerm1': typeValue = DegreeType.MidTerm1; break;
        case 'Final1': typeValue = DegreeType.Final1; break;
        case 'MidTerm2': typeValue = DegreeType.MidTerm2; break;
        case 'Final2': typeValue = DegreeType.Final2; break;
        default: typeValue = 0;
      }
    } else {
      typeValue = degreeType;
    }
    
    // Now use the number value
    switch(typeValue) {
      case DegreeType.MidTerm1: return 'examTypes.MidTerm1';
      case DegreeType.Final1: return 'examTypes.Final1';
      case DegreeType.MidTerm2: return 'examTypes.MidTerm2';
      case DegreeType.Final2: return 'examTypes.Final2';
      default: return 'examTypes.unknown';
    }
  }

  // Update other methods to handle string degree types
  getExamTypeMaxScore(degreeType: number | string): number {
    if (typeof degreeType === 'string') {
      switch(degreeType) {
        case 'MidTerm1':
        case 'MidTerm2':
          return 20;
        case 'Final1':
        case 'Final2':
          return 80;
        default:
          return 100;
      }
    } else {
      switch(degreeType) {
        case DegreeType.MidTerm1:
        case DegreeType.MidTerm2:
          return 20;
        case DegreeType.Final1:
        case DegreeType.Final2:
          return 80;
        default:
          return 100;
      }
    }
  }

  // Get percentage for specific exam type
  getExamTypePercentage(studentId: string, examType: number): number {
    const studentData = this.studentFullDegreesMap.get(studentId);
    if (!studentData || !studentData.degrees) return 0;
    
    const examDegrees = studentData.degrees.filter(d => {
      if (typeof d.degreeType === 'string') {
        // Map string to number for comparison
        const stringToNum: { [key: string]: number } = {
          'MidTerm1': DegreeType.MidTerm1,
          'Final1': DegreeType.Final1,
          'MidTerm2': DegreeType.MidTerm2,
          'Final2': DegreeType.Final2
        };
        return stringToNum[d.degreeType] === examType;
      }
      return d.degreeType === examType;
    });
    
    if (examDegrees.length === 0) return 0;
    
    const totalScore = examDegrees.reduce((sum, d) => sum + d.score, 0);
    const totalMaxScore = examDegrees.reduce((sum, d) => sum + d.maxScore, 0);
    
    if (totalMaxScore === 0) return 0;
    return (totalScore / totalMaxScore) * 100;
  }

  // Load degrees for a specific student
  loadStudentDegrees(studentId: string, studentName: string): void {
    if (this.studentDegreesMap.has(studentId)) {
      this.expandedStudentId = this.expandedStudentId === studentId ? null : studentId;
      return;
    }

    this.loadingDegrees = true;
    this.degreeService.getStudentDegrees(studentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const studentDegreesData = response.data;
          this.studentFullDegreesMap.set(studentId, studentDegreesData);
          
          let degrees = studentDegreesData.degrees || [];
          
          // Filter by selected type if needed
          if (this.selectedType !== 'الكل') {
            degrees = degrees.filter(degree => {
              if (!degree) return false;
              
              if (typeof degree.degreeType === 'string') {
                // Compare string directly
                return degree.degreeType === this.selectedType;
              } else {
                // Convert selectedType to number for comparison
                const selectedOption = this.examTypeOptions.find(opt => opt.value === this.selectedType);
                if (selectedOption?.type !== undefined) {
                  return degree.degreeType === selectedOption.type;
                }
                return false;
              }
            });
          }
          
          this.studentDegreesMap.set(studentId, degrees);
          this.expandedStudentId = studentId;
        } else {
          this.studentDegreesMap.set(studentId, []);
          this.expandedStudentId = studentId;
        }
        this.loadingDegrees = false;
      },
      error: (error) => {
        console.error('Error loading student degrees:', error);
        this.studentDegreesMap.set(studentId, []);
        this.loadingDegrees = false;
      }
    });
  }

  // Open student details modal
  openStudentDetailsModal(studentId: string, studentName: string): void {
    this.selectedStudentId = studentId;
    this.selectedStudentName = studentName || 'طالب';
    
    if (this.studentFullDegreesMap.has(studentId)) {
      const studentData = this.studentFullDegreesMap.get(studentId);
      if (studentData) {
        this.loadStudentDegreesForModal(studentData);
      }
    } else {
      this.loadStudentDegreesForModalFromService(studentId);
    }
  }

  // Load degrees for modal from cached data
  loadStudentDegreesForModal(studentData: StudentDegreesDto): void {
    this.loadingStudentDetails = false;
    
    let degrees = studentData.degrees || [];
    
    // Filter by selected type if needed
    if (this.selectedType !== 'الكل') {
      degrees = degrees.filter(degree => {
        if (!degree) return false;
        
        if (typeof degree.degreeType === 'string') {
          // Compare string directly
          return degree.degreeType === this.selectedType;
        } else {
          // Convert selectedType to number for comparison
          const selectedOption = this.examTypeOptions.find(opt => opt.value === this.selectedType);
          if (selectedOption?.type !== undefined) {
            return degree.degreeType === selectedOption.type;
          }
          return false;
        }
      });
    }
    
    this.selectedStudentDegrees = degrees;
    this.selectedClassName = studentData.className || this.getClassName(this.selectedClassId);
    this.showStudentDetailsModal = true;
  }

  // Load degrees for modal from service
  loadStudentDegreesForModalFromService(studentId: string): void {
    this.loadingStudentDetails = true;
    
    this.degreeService.getStudentDegrees(studentId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const studentData = response.data;
          this.studentFullDegreesMap.set(studentId, studentData);
          this.loadStudentDegreesForModal(studentData);
        } else {
          this.toastService.error('حدث خطأ أثناء تحميل النتائج');
          this.loadingStudentDetails = false;
        }
      },
      error: (error) => {
        console.error('Error loading student degrees for modal:', error);
        this.toastService.error('حدث خطأ أثناء تحميل النتائج');
        this.loadingStudentDetails = false;
      }
    });
  }

  // Close student details modal
  closeStudentDetailsModal(): void {
    this.showStudentDetailsModal = false;
    this.selectedStudentDegrees = [];
    this.selectedStudentName = '';
    this.selectedClassName = '';
    this.selectedStudentId = '';
    this.loadingStudentDetails = false;
  }

  // Get class name by ID
  getClassName(classId: string): string {
    if (!classId) return 'غير محدد';
    const classItem = this.classes.find(c => c.id === classId);
    return classItem ? classItem.className : 'غير معروف';
  }

  // Calculate pass/fail status
  getPassStatus(score: number, maxScore: number): { status: string, isPass: boolean } {
    if (maxScore === 0) return { status: 'studentResults.unknownStatus', isPass: false };
    const percentage = (score / maxScore) * 100;
    const isPass = percentage >= 50;
    return {
      status: isPass ? 'studentResults.passed' : 'studentResults.failed',
      isPass: isPass
    };
  }

  // Calculate student average for specific set of degrees
  calculateStudentAverage(degrees: DegreeItemDto[]): number {
    if (!degrees || degrees.length === 0) return 0;
    
    const totalScore = degrees.reduce((sum, degree) => sum + degree.score, 0);
    const totalMaxScore = degrees.reduce((sum, degree) => sum + degree.maxScore, 0);
    
    if (totalMaxScore === 0) return 0;
    return (totalScore / totalMaxScore) * 100;
  }

  // Calculate overall student average from all exams - FIXED VERSION
  calculateStudentOverallAverage(studentId: string): number {
    const studentData = this.studentFullDegreesMap.get(studentId);
    if (!studentData || !studentData.degrees || studentData.degrees.length === 0) return 0;
    
    // Calculate simple percentage: total score ÷ total max score × 100
    const totalScore = studentData.degrees.reduce((sum, degree) => sum + degree.score, 0);
    const totalMaxScore = studentData.degrees.reduce((sum, degree) => sum + degree.maxScore, 0);
    
    if (totalMaxScore === 0) return 0;
    return (totalScore / totalMaxScore) * 100;
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
      this.studentFullDegreesMap.clear();
    }
  }

  // Handle type change
  onTypeChange(): void {
    this.studentDegreesMap.clear();
    this.expandedStudentId = null;
    
    if (this.selectedClassId && this.students.length > 0) {
      this.students.forEach(student => {
        if (this.studentFullDegreesMap.has(student.id)) {
          const studentData = this.studentFullDegreesMap.get(student.id);
          if (studentData) {
            let degrees = studentData.degrees || [];
            
            if (this.selectedType !== 'الكل') {
              degrees = degrees.filter(degree => {
                if (!degree) return false;
                
                if (typeof degree.degreeType === 'string') {
                  // Compare string directly
                  return degree.degreeType === this.selectedType;
                } else {
                  // Convert selectedType to number for comparison
                  const selectedOption = this.examTypeOptions.find(opt => opt.value === this.selectedType);
                  if (selectedOption?.type !== undefined) {
                    return degree.degreeType === selectedOption.type;
                  }
                  return false;
                }
              });
            }
            
            this.studentDegreesMap.set(student.id, degrees);
          }
        }
      });
    }
  }

  // Check if student has degrees
  hasDegrees(studentId: string): boolean {
    const degrees = this.studentDegreesMap.get(studentId);
    return degrees !== undefined && degrees !== null && degrees.length > 0;
  }

  // Calculate total marks for a student
  calculateStudentTotalMarks(studentId: string): { total: number, maxTotal: number } {
    const studentData = this.studentFullDegreesMap.get(studentId);
    if (!studentData || !studentData.degrees || studentData.degrees.length === 0) {
      return { total: 0, maxTotal: 0 };
    }
    
    const total = studentData.degrees.reduce((sum, degree) => sum + degree.score, 0);
    const maxTotal = studentData.degrees.reduce((sum, degree) => sum + degree.maxScore, 0);
    
    return { total, maxTotal };
  }

  // Get total possible marks for all exam types
  getTotalPossibleMarks(): number {
    return 200; // 20 + 80 + 20 + 80
  }

  // Format score with precision
  formatScore(score: number): string {
    return score?.toFixed(1) || '0.0';
  }

  // Check if student has components in degrees
  studentHasComponents(studentId: string): boolean {
    const degrees = this.studentDegreesMap.get(studentId);
    if (!degrees) return false;
    
    return degrees.some(degree => 
      degree.components && degree.components.length > 0
    );
  }

  // Check if selected student has components
  selectedStudentHasComponents(): boolean {
    return this.selectedStudentDegrees.some(degree => 
      degree.components && degree.components.length > 0
    );
  }
}