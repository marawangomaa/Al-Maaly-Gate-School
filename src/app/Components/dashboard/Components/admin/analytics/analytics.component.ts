import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminManagementService } from '../../../../../Services/admin-management.service';
import { ClassService } from '../../../../../Services/class.service';
import { CurriculumService } from '../../../../../Services/curriculum.service';
import { GradeService } from '../../../../../Services/grade.service';
import { SubjectService } from '../../../../../Services/subject.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule, TranslateModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscription = new Subscription();

  // Chart references
  @ViewChild('pieChartCanvas') pieChartCanvas!: ElementRef;
  @ViewChild('barChartCanvas') barChartCanvas!: ElementRef;

  private pieChart!: Chart;
  private barChart!: Chart;

  // Analytics data
  teacherCount = 0;
  studentCount = 0;
  classCount = 0;
  curriculumCount = 0;
  gradeCount = 0;
  subjectCount = 0;

  // Loading states
  isLoading = true;
  loadingStatus = 'Loading analytics data...';

  // Analytics insights
  analyticsInsights = {
    studentsPerClass: 0,
    subjectsPerGrade: 0,
    classesPerGrade: 0,
    totalEntities: 0,
    studentTeacherRatio: 0,
    classUtilization: 0,
    gradeDistribution: ''
  };

  // Performance metrics
  performanceMetrics = {
    studentGrowth: 0,
    teacherGrowth: 0,
    classGrowth: 0,
    systemHealth: 0
  };

  // Time-based data (simulated - you'd get this from API)
  timeSeriesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    students: [120, 150, 180, 210, 240, 0], // Last will be updated
    teachers: [15, 18, 20, 22, 25, 0]
  };

  constructor(
    private adminService: AdminManagementService,
    private classService: ClassService,
    private curriculumService: CurriculumService,
    private gradeService: GradeService,
    private subjectService: SubjectService
  ) { }

  ngOnInit(): void {
    this.loadAllAnalytics();
  }

  ngAfterViewInit(): void {
    // Initialize charts after view is ready
    if (!this.isLoading) {
      this.initializeCharts();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    // Destroy charts to prevent memory leaks
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  private loadAllAnalytics(): void {
    this.isLoading = true;
    this.loadingStatus = 'Loading analytics data...';

    // Load all counts
    this.subscription.add(
      this.adminService.CountTeachers().subscribe({
        next: count => {
          this.teacherCount = count;
          this.timeSeriesData.teachers[5] = count;
          this.loadingStatus = 'Loading student count...';
        },
        error: err => this.handleError('teachers', err)
      })
    );

    this.subscription.add(
      this.adminService.CountStudent().subscribe({
        next: count => {
          this.studentCount = count;
          this.timeSeriesData.students[5] = count;
          this.loadingStatus = 'Loading class count...';
        },
        error: err => this.handleError('students', err)
      })
    );

    this.subscription.add(
      this.classService.getCount().subscribe({
        next: response => {
          if (response.success && response.data !== undefined) {
            this.classCount = response.data;
            this.loadingStatus = 'Loading curriculum count...';
          }
        },
        error: err => this.handleError('classes', err)
      })
    );

    this.subscription.add(
      this.curriculumService.getCount().subscribe({
        next: response => {
          if (response.success && response.data !== undefined) {
            this.curriculumCount = response.data;
            this.loadingStatus = 'Loading grade count...';
          }
        },
        error: err => this.handleError('curricula', err)
      })
    );

    this.subscription.add(
      this.gradeService.getCount().subscribe({
        next: response => {
          if (response.success && response.data !== undefined) {
            this.gradeCount = response.data;
            this.loadingStatus = 'Loading subject count...';
          }
        },
        error: err => this.handleError('grades', err)
      })
    );

    this.subscription.add(
      this.subjectService.getCount().subscribe({
        next: response => {
          if (response.success && response.data !== undefined) {
            this.subjectCount = response.data;
            this.isLoading = false;
            this.calculateAnalyticsInsights();
            this.calculatePerformanceMetrics();
            // Initialize charts after data is loaded
            setTimeout(() => this.initializeCharts(), 100);
          }
        },
        error: err => {
          this.handleError('subjects', err);
          this.isLoading = false;
        }
      })
    );
  }

  private initializeCharts(): void {
    if (!this.pieChartCanvas || !this.barChartCanvas) {
      return;
    }

    // Destroy existing charts if they exist
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }

    // Initialize Pie Chart
    const pieCtx = this.pieChartCanvas.nativeElement.getContext('2d');
    this.pieChart = new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ['Teachers', 'Students', 'Classes', 'Curricula', 'Grades', 'Subjects'],
        datasets: [{
          data: [
            this.teacherCount,
            this.studentCount,
            this.classCount,
            this.curriculumCount,
            this.gradeCount,
            this.subjectCount
          ],
          backgroundColor: [
            '#1e90ff',
            '#28a745',
            '#ff6b6b',
            '#6f42c1',
            '#fd7e14',
            '#17a2b8'
          ],
          hoverBackgroundColor: [
            '#1c86ee',
            '#239d3d',
            '#ff5252',
            '#5d36b5',
            '#e56b0a',
            '#148ea0'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.raw as number;
                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    // Initialize Bar Chart
    const barCtx = this.barChartCanvas.nativeElement.getContext('2d');
    this.barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Teachers', 'Students', 'Classes', 'Curricula', 'Grades', 'Subjects'],
        datasets: [{
          label: 'Count',
          data: [
            this.teacherCount,
            this.studentCount,
            this.classCount,
            this.curriculumCount,
            this.gradeCount,
            this.subjectCount
          ],
          backgroundColor: [
            'rgba(30, 144, 255, 0.7)',
            'rgba(40, 167, 69, 0.7)',
            'rgba(255, 107, 107, 0.7)',
            'rgba(111, 66, 193, 0.7)',
            'rgba(253, 126, 20, 0.7)',
            'rgba(23, 162, 184, 0.7)'
          ],
          borderColor: [
            '#1e90ff',
            '#28a745',
            '#ff6b6b',
            '#6f42c1',
            '#fd7e14',
            '#17a2b8'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  private calculateAnalyticsInsights(): void {
    // Calculate students per class (average)
    this.analyticsInsights.studentsPerClass = this.classCount > 0
      ? Math.round(this.studentCount / this.classCount)
      : 0;

    // Calculate subjects per grade (average)
    this.analyticsInsights.subjectsPerGrade = this.gradeCount > 0
      ? Math.round(this.subjectCount / this.gradeCount)
      : 0;

    // Calculate classes per grade (average)
    this.analyticsInsights.classesPerGrade = this.gradeCount > 0
      ? Math.round(this.classCount / this.gradeCount)
      : 0;

    // Calculate student-teacher ratio
    this.analyticsInsights.studentTeacherRatio = this.teacherCount > 0
      ? parseFloat((this.studentCount / this.teacherCount).toFixed(1))
      : 0;

    // Calculate class utilization (assuming max 30 students per class)
    this.analyticsInsights.classUtilization = this.classCount > 0
      ? Math.round((this.studentCount / (this.classCount * 30)) * 100)
      : 0;

    // Calculate total entities
    this.analyticsInsights.totalEntities =
      this.teacherCount + this.studentCount + this.classCount +
      this.curriculumCount + this.gradeCount + this.subjectCount;

    // Grade distribution analysis
    if (this.gradeCount > 0) {
      const avgClassesPerGrade = this.classCount / this.gradeCount;
      if (avgClassesPerGrade >= 3) {
        this.analyticsInsights.gradeDistribution = 'Well Distributed';
      } else if (avgClassesPerGrade >= 1) {
        this.analyticsInsights.gradeDistribution = 'Moderate';
      } else {
        this.analyticsInsights.gradeDistribution = 'Needs Attention';
      }
    }
  }

  private calculatePerformanceMetrics(): void {
    // Simulated growth calculations
    const previousStudents = this.timeSeriesData.students[4] || 0;
    const previousTeachers = this.timeSeriesData.teachers[4] || 0;
    const previousClasses = Math.max(0, this.classCount - 5);

    this.performanceMetrics.studentGrowth = previousStudents > 0
      ? Math.round(((this.studentCount - previousStudents) / previousStudents) * 100)
      : 0;

    this.performanceMetrics.teacherGrowth = previousTeachers > 0
      ? Math.round(((this.teacherCount - previousTeachers) / previousTeachers) * 100)
      : 0;

    this.performanceMetrics.classGrowth = previousClasses > 0
      ? Math.round(((this.classCount - previousClasses) / previousClasses) * 100)
      : 0;

    // Calculate system health score (0-100)
    const utilizationScore = Math.min(100, this.analyticsInsights.classUtilization);
    const ratioScore = this.analyticsInsights.studentTeacherRatio <= 30 ? 100 :
      Math.max(0, 100 - (this.analyticsInsights.studentTeacherRatio - 30) * 2);
    const distributionScore = this.analyticsInsights.gradeDistribution === 'Well Distributed' ? 100 :
      this.analyticsInsights.gradeDistribution === 'Moderate' ? 70 : 40;

    this.performanceMetrics.systemHealth = Math.round(
      (utilizationScore * 0.4) + (ratioScore * 0.3) + (distributionScore * 0.3)
    );
  }

  private handleError(entity: string, error: any): void {
    console.error(`Error loading ${entity} count:`, error);
  }

  // Refresh analytics data
  refreshAnalytics(): void {
    this.loadAllAnalytics();
  }

  // Get percentage for progress bars
  getPercentage(value: number, max: number = 100): number {
    return Math.min((value / max) * 100, 100);
  }

  // Format numbers with commas
  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  // Get health color based on score
  getHealthColor(score: number): string {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  }

  // Get growth indicator
  getGrowthIndicator(growth: number): { icon: string, color: string, text: string } {
    if (growth > 0) {
      return { icon: 'fas fa-arrow-up', color: '#28a745', text: `+${growth}%` };
    } else if (growth < 0) {
      return { icon: 'fas fa-arrow-down', color: '#dc3545', text: `${growth}%` };
    } else {
      return { icon: 'fas fa-minus', color: '#6c757d', text: '0%' };
    }
  }
}