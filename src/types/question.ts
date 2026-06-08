export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType =
  | 'single_best_answer'
  | 'scenario_based'
  | 'multiple_correct_answers'
  | 'matching'
  | 'sequence_ordering';

export interface Option {
  label: string;
  text: string;
}

export interface Explanation {
  why_correct: string;
  why_others_are_wrong: Record<string, string>;
}

export interface SourceReference {
  syllabus_section: string;
  source_file: string;
}

export interface Question {
  id: string;
  domain: string;
  domain_number: number;
  topic: string;
  subtopic: string;
  difficulty: Difficulty;
  question_type: QuestionType;
  question: string;
  options: Option[];
  /** single/scenario: "C"; multi: ["A","C"]; matching: "1-B,2-A"; sequence: "C,B,A" */
  correct_answer: string | string[];
  explanation: Explanation;
  exam_reasoning?: string;
  source_reference: SourceReference;
  /** matching questions only: left-hand prompts, numbered 1..n */
  prompts?: string[];
}

export interface QuestionBank {
  meta: Record<string, unknown>;
  questions: Question[];
}

/** A user's answer, shape depends on question type. */
export type UserAnswer =
  | string // single_best_answer / scenario_based -> a label
  | string[] // multiple_correct_answers -> set of labels; sequence_ordering -> ordered labels
  | Record<string, string> // matching -> { promptIndex(1-based): optionLabel }
  | null;
