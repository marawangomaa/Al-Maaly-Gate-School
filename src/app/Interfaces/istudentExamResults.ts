export interface istudentExamResults {
  id: string;
  studentId: string;
  examId: string;
  totalMark: number;
  fullMark: number;
  minMark: number;
  percentage: number;
  status: string;
  studentName: string;
  subjectName: string;
  teacherName: string;
  examName: string;
  date: Date;
  canShowCorrection?: boolean;
}
