export interface iclassExams {
    examId: string;
    start: string;
    end: string;
    minMark: number;
    fullMark: number;
    status: 'Upcoming' | 'Running' | 'Finished';
    examName: string;
    subjectName: string;
    teacherName: string;
}

