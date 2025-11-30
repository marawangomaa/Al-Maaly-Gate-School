import { ChoiceViewDto } from "./iquestoin";
import { QuestionTypes } from "./QuestionTypes";

export interface CreateExamWithQuestionsDto {
  examName: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  start: string;
  end: string;
  minMark: number;
  fullMark: number;
  questionIds: string[];
  status: string;
}

export interface UpdateExamDto {
  examName: string;
  start: string;
  end: string;
  minMark: number;
  fullMark: number;
}

export interface ExamViewDto {
  id: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  start: string;
  end: string;
  minMark: number;
  fullMark: number;
}

export interface QuestionChoice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionViewDto {
  id: string;
  content: string;
  degree: number;
  type: QuestionTypes;
  teacherId: string;
  choices?: ChoiceViewDto[] | null;
  correctChoiceId?: string | null;
  trueAndFalses?: boolean | null;
  textAnswer?: string | null;
}

export interface ExamDetailsViewDto {
  id: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  teacherId: string;
  start: string;
  end: string;
  minMark: number;
  fullMark: number;
  questions: QuestionViewDto[];
}

