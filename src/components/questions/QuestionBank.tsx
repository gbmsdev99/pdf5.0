import React, { useState } from 'react';
import { Question, QuestionBank as QuestionBankType } from '../../types';
import { Search, Filter, Plus } from 'lucide-react';

interface QuestionBankProps {
  bank: QuestionBankType;
  onSelectQuestion: (question: Question) => void;
  onAddQuestion: (question: Question) => void;
}

export function QuestionBank({ bank, onSelectQuestion, onAddQuestion }: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = Array.from(
    new Set(bank.questions.flatMap(q => q.tags || []))
  );

  const filteredQuestions = bank.questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => question.tags?.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search questions..."
            />
          </div>
          <button
            onClick={() => {}} // Toggle filter panel
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag) 
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.map(question => (
          <div
            key={question.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer"
            onClick={() => onSelectQuestion(question)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-900 font-medium">{question.text}</h3>
              <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                question.difficultyLevel === 'EASY'
                  ? 'bg-green-100 text-green-800'
                  : question.difficultyLevel === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {question.difficultyLevel}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {question.tags?.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}