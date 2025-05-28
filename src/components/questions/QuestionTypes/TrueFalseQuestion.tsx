import React from 'react';
import { Question } from '../../../types';

interface TrueFalseQuestionProps {
  question: Question;
  onAnswer: (answer: boolean) => void;
  selectedAnswer?: boolean;
  showCorrect?: boolean;
}

export function TrueFalseQuestion({
  question,
  onAnswer,
  selectedAnswer,
  showCorrect
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg text-gray-900">{question.text}</p>
      
      <div className="space-y-2">
        {[true, false].map((value) => (
          <button
            key={value.toString()}
            onClick={() => onAnswer(value)}
            className={`w-full p-4 text-left rounded-lg border ${
              selectedAnswer === value
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:bg-gray-50'
            } ${
              showCorrect && value === question.correctAnswer
                ? 'bg-green-50 border-green-500'
                : ''
            }`}
          >
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full border ${
                selectedAnswer === value
                  ? 'border-indigo-600 bg-indigo-600'
                  : 'border-gray-300'
              }`} />
              <span className="ml-3">{value ? 'True' : 'False'}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}