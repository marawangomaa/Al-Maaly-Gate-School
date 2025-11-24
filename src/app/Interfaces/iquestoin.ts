export enum QuestionTypes {
  Complete = 0,
  Connection = 1,
  TrueOrFalse = 2,
  Choices = 3
}

export interface ChoiceDto {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuestionDto {
  content: string;
  correctTextAnswer?: string | null;
  degree: number;
  type: QuestionTypes;
  teacherId: string;
  choices?: ChoiceDto[] | null;
  correctChoiceId?: string | null;
  trueAndFalses?: boolean | null;
}

export interface UpdateQuestionDto {
  content: string;
  degree: number;
}

export interface ChoiceViewDto {
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

export interface QuestionModel {
  id: string;
  content: string;
  degree: number;
  type: QuestionTypes;
  choices?: ChoiceViewDto[] | null;
  correctChoiceId?: string | null;
  trueAndFalses?: boolean | null;
  textAnswer?: string | null;
}