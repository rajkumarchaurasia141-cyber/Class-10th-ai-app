import { MathChapterExercises, MathPrashnawali, MathExerciseQuestion } from '../types';
import { MATH_SOLUTIONS_CH1 } from './mathSolutionsCh1';
import { MATH_SOLUTIONS_CH2 } from './mathSolutionsCh2';
import { MATH_SOLUTIONS_CH3 } from './mathSolutionsCh3';
import { MATH_SOLUTIONS_CH4 } from './mathSolutionsCh4';
import { MATH_SOLUTIONS_CH5 } from './mathSolutionsCh5';
import { MATH_SOLUTIONS_CH8 } from './mathSolutionsCh8';
import { MATH_SOLUTIONS_PART2 } from './mathSolutionsPart2';
import { MATH_SOLUTIONS_PART3 } from './mathSolutionsPart3';

// Filter out chapters from part2 that have been completely updated
const filteredPart2 = MATH_SOLUTIONS_PART2.filter((ch) => ch.chapterNumber !== 8);

export const ALL_MATH_CHAPTER_SOLUTIONS: MathChapterExercises[] = [
  MATH_SOLUTIONS_CH1,
  MATH_SOLUTIONS_CH2,
  MATH_SOLUTIONS_CH3,
  MATH_SOLUTIONS_CH4,
  MATH_SOLUTIONS_CH5,
  ...filteredPart2.filter((ch) => ch.chapterNumber < 8),
  MATH_SOLUTIONS_CH8,
  ...filteredPart2.filter((ch) => ch.chapterNumber > 8),
  ...MATH_SOLUTIONS_PART3,
];


export const getMathChapterExercises = (chapterNum: number): MathChapterExercises | undefined => {
  return ALL_MATH_CHAPTER_SOLUTIONS.find((ch) => ch.chapterNumber === chapterNum);
};

export const getAllMathExercisesList = (): { chapterNumber: number; chapterTitle: string; exercise: MathPrashnawali }[] => {
  const list: { chapterNumber: number; chapterTitle: string; exercise: MathPrashnawali }[] = [];
  ALL_MATH_CHAPTER_SOLUTIONS.forEach((ch) => {
    ch.exercises.forEach((ex) => {
      list.push({
        chapterNumber: ch.chapterNumber,
        chapterTitle: ch.chapterTitle,
        exercise: ex,
      });
    });
  });
  return list;
};

export const searchMathPrashnawali = (query: string): {
  chapter: MathChapterExercises;
  exercise: MathPrashnawali;
  matchedQuestions: MathExerciseQuestion[];
}[] => {
  if (!query || query.trim() === '') return [];
  const q = query.trim().toLowerCase();

  const results: {
    chapter: MathChapterExercises;
    exercise: MathPrashnawali;
    matchedQuestions: MathExerciseQuestion[];
  }[] = [];

  ALL_MATH_CHAPTER_SOLUTIONS.forEach((ch) => {
    ch.exercises.forEach((ex) => {
      const matchInTitle = ex.title.toLowerCase().includes(q) || ex.exerciseNumber.includes(q) || ch.chapterTitle.toLowerCase().includes(q);
      const matchedQuestions = ex.questions.filter(
        (question) =>
          question.questionText.toLowerCase().includes(q) ||
          question.detailedSolution.toLowerCase().includes(q) ||
          question.finalAnswer.toLowerCase().includes(q) ||
          (question.keyFormula && question.keyFormula.toLowerCase().includes(q))
      );

      if (matchInTitle || matchedQuestions.length > 0) {
        results.push({
          chapter: ch,
          exercise: ex,
          matchedQuestions: matchedQuestions.length > 0 ? matchedQuestions : ex.questions,
        });
      }
    });
  });

  return results;
};
