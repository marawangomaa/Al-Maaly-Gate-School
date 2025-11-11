import { iquestionForExam } from "./iquestionForExam";

export interface iexamWithQuestions {
    examId: string;
    teacherId: string;
    start: string;
    end: string;
    subjectName: string;
    questions: iquestionForExam[];
}