export interface istudentExamAnswer {
  questionId: string;
  choiceId?: string;
  ConnectionLeftId?: string;
  ConnectionRightId?: string;
  CorrectTextAnswer?: string;
  trueAndFalseAnswer?: boolean;
}