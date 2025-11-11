import { istudentExamAnswer } from "./istudentExamAnswer";

export interface istudentExamSubmission {
    studentId: string;
    examId: string;
    TeacherId: string;
    answers: istudentExamAnswer[];
}