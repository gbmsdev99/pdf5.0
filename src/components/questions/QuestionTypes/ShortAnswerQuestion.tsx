import React, { useState } from 'react';
import { Question } from '../../../types';

interface ShortAnswerQuestionProps {
  question: Question;
  onAnswer: (answer: string) => void;
  answer?: string;
  showCorrect?: boolean;
}

export function ShortAnswerQuestion({
  question,
  onAnswer,
  answer = '',
  showCorrect
}: ShortAnswerQuestionProps) {
  const [currentAnswer, setCurrentAnswer] = useState(answer);

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
    onAnswer(value);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg text-gray-900">{question.text}</p>

      <textarea
        value={currentAnswer}
        onChange={(e) => handleAnswerChange(e.target.value)}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter your answer..."
      />

      {showCorrect && (
        <div className="mt-4 space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Model Answer:</h4>
            <p className="text-green-700">{question.modelAnswer}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Key Concepts:</h4>
            <div className="flex flex-wrap gap-2">
              {question.keywords?.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}