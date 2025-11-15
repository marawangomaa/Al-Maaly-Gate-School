export interface istudentExamAnswer {
  questionId: string;
  choiceId?: string;
  ConnectionId?: { leftId: string; rightId: string } | null;
  CorrectTextAnswer?: string;
  trueAndFalseAnswer?: boolean;
}