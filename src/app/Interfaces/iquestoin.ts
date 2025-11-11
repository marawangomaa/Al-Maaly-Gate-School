export enum QuestionTypes {
  None = 0,
  Text = 1,
  TrueOrFalse = 2,
  Choices = 3
}

export interface ChoiceDto {
  text: string;
  isCorrect: boolean;
}

export interface CreateQuestionDto {
  content: string;
  degree: number;
  type: QuestionTypes;
  teacherId: string;
  choices?: ChoiceDto[];
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
  choices?: ChoiceViewDto[];
  correctChoiceId?: string | null;
  trueAndFalses?: boolean | null;
  textAnswer?: string | null;
}
