import React, { useState } from 'react';
import { Question } from '../../../types';

interface FillInBlankQuestionProps {
  question: Question;
  onAnswer: (answers: string[]) => void;
  answers?: string[];
  showCorrect?: boolean;
}

export function FillInBlankQuestion({
  question,
  onAnswer,
  answers = [],
  showCorrect
}: FillInBlankQuestionProps) {
  const [currentAnswers, setCurrentAnswers] = useState<string[]>(answers);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...currentAnswers];
    newAnswers[index] = value;
    setCurrentAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  return (
    <div className="space-y-4">
      <div className="text-lg text-gray-900">
        {question.text.split('[___]').map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && (
              <input
                type="text"
                value={currentAnswers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={`mx-2 px-3 py-1 border rounded-md w-32 ${
                  showCorrect
                    ? question.blanks?.[index].answer === currentAnswers[index]
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {showCorrect && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Correct Answers:</h4>
          <ul className="space-y-2">
            {question.blanks?.map((blank, index) => (
              <li key={blank.id} className="flex items-center text-sm">
                <span className="w-8 font-medium text-gray-600">#{index + 1}:</span>
                <span className="text-green-600">{blank.answer}</span>
                {blank.alternatives && blank.alternatives.length > 0 && (
                  <span className="text-gray-500 ml-2">
                    (Also accepted: {blank.alternatives.join(', ')})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}