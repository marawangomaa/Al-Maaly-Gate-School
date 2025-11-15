import { istudentExamAnswer } from "./istudentExamAnswer";

export interface istudentExamSubmission {
    studentId: string;
    examId: string;
    teacherId: string;
    answers: istudentExamAnswer[];
}