import { ichoicesForExamQuestions } from "./ichoicesForExamQuestions";

export interface iquestionForExam {
  id: string;
  content: string;
  type: string; //Complete,Connection,TrueOrFalse,Choices
  trueAndFalses?: boolean;
  degree: number;
  choices?: ichoicesForExamQuestions[];
  CorrectTextAnswer?: string;

  leftColumn?: any[];
  rightColumn?: any[];
}