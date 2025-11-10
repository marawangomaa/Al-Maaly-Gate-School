import { ichoicesForExamQuestions } from "./ichoicesForExamQuestions";

export interface iquestionForExam {
  id: string;
  content: string;
  type: string;
  trueAndFalses?: boolean;
  degree: number;
  choices?: ichoicesForExamQuestions[];
}