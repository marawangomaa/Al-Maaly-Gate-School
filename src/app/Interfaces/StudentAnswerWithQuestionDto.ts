import { ConnectionDto } from "./ConnectionDto";

export interface StudentAnswerWithQuestionDto {
    examId: string;
    studentId: string;
    questionId: string;

    questionContent: string;
    questionType: string;
    questionDegree: number;

    studentChoiceText?: string;
    studentTrueFalseAnswer?: boolean;
    studentTextAnswer?: string;
    studentConnectionTexts?: string;

    correctChoiceText?: string;
    correctTrueFalseAnswer?: boolean;
    correctTextAnswer?: string;
    correctConnectionTexts?: string;

    studentMark?: number;
    isCorrect: boolean;
}