export interface iclassExams {
    examName: string;
    subjectId: string;
    subjectName: string | null;
    classId: string;
    class: string | null;
    teacherId: string;
    teacherName: string | null;
    start: string;
    end: string;
    status: string;
    minMark: number;
    fullMark: number;
    questions: any[];
}