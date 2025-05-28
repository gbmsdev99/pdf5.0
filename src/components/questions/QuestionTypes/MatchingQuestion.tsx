import React, { useState } from 'react';
import { Question, MatchingPair } from '../../../types';
import { ArrowRight } from 'lucide-react';

interface MatchingQuestionProps {
  question: Question;
  onAnswer: (matches: [string, string][]) => void;
  selectedMatches?: [string, string][];
  showCorrect?: boolean;
}

export function MatchingQuestion({
  question,
  onAnswer,
  selectedMatches = [],
  showCorrect
}: MatchingQuestionProps) {
  const [selectedPremise, setSelectedPremise] = useState<string | null>(null);
  const [matches, setMatches] = useState<[string, string][]>(selectedMatches);

  const handlePremiseClick = (premise: string) => {
    if (selectedPremise === premise) {
      setSelectedPremise(null);
    } else {
      setSelectedPremise(premise);
    }
  };

  const handleResponseClick = (response: string) => {
    if (!selectedPremise) return;

    const newMatches = matches.filter(
      ([p]) => p !== selectedPremise && p !== response
    );
    newMatches.push([selectedPremise, response]);
    setMatches(newMatches);
    setSelectedPremise(null);
    onAnswer(newMatches);
  };

  const isMatched = (item: string) => {
    return matches.some(([p, r]) => p === item || r === item);
  };

  return (
    <div className="space-y-6">
      <p className="text-lg text-gray-900">{question.text}</p>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 mb-2">Premises</h4>
          {question.matchingPairs?.map((pair) => (
            <button
              key={pair.premise}
              onClick={() => handlePremiseClick(pair.premise)}
              className={`w-full p-3 text-left rounded-lg border ${
                selectedPremise === pair.premise
                  ? 'border-indigo-500 bg-indigo-50'
                  : isMatched(pair.premise)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pair.premise}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 mb-2">Responses</h4>
          {question.matchingPairs?.map((pair) => (
            <button
              key={pair.response}
              onClick={() => handleResponseClick(pair.response)}
              disabled={!selectedPremise || isMatched(pair.response)}
              className={`w-full p-3 text-left rounded-lg border ${
                isMatched(pair.response)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pair.response}
            </button>
          ))}
        </div>
      </div>

      {matches.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">Your Matches:</h4>
          <div className="space-y-2">
            {matches.map(([premise, response], index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 p-2 bg-white rounded border border-gray-200">
                  {premise}
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
                <div className="flex-1 p-2 bg-white rounded border border-gray-200">
                  {response}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}