import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Image as ImageIcon, AlertCircle, Save, 
  FunctionSquare, ListChecks, ToggleLeft, AlignJustify, 
  SplitSquareHorizontal 
} from 'lucide-react';
import { useTestStore } from '../store/testStore';
import { Question, QuestionType, DifficultyLevel } from '../types';
import { MathRenderer } from '../components/MathRenderer';
import { v4 as uuidv4 } from 'uuid';

export function ManualEntryPage() {
  const navigate = useNavigate();
  const { addQuestion } = useTestStore();
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Question[]>([]);
  const [showLatexHelper, setShowLatexHelper] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(DifficultyLevel.MEDIUM);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImages(prev => ({
          ...prev,
          [file.name]: base64
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = [];
    const blocks = text.split(/(?=Q\d+\.|\[(?:TRUE_FALSE|FILL_IN_BLANK|MATCHING|SHORT_ANSWER)\])/);

    for (const block of blocks) {
      if (!block.trim()) continue;

      let question: Partial<Question> = {
        id: uuidv4(),
        type: QuestionType.MULTIPLE_CHOICE,
        difficultyLevel: selectedDifficulty
      };

      // Check for question type markers
      if (block.includes('[TRUE_FALSE]')) {
        question.type = QuestionType.TRUE_FALSE;
        const match = block.match(/\[TRUE_FALSE\]\s+(.*?)(?=Answer:|$)/s);
        if (match) {
          question.text = match[1].trim();
          const answerMatch = block.match(/Answer:\s*(true|false)/i);
          question.correctAnswer = answerMatch ? answerMatch[1].toLowerCase() === 'true' : false;
        }
      } else if (block.includes('[FILL_IN_BLANK]')) {
        question.type = QuestionType.FILL_IN_BLANK;
        const match = block.match(/\[FILL_IN_BLANK\]\s+(.*?)(?=Answer:|$)/s);
        if (match) {
          question.text = match[1].trim();
          const blanks = [];
          const blankMatches = question.text.match(/\[___\]/g) || [];
          const answerMatch = block.match(/Answer:\s*(.+?)(?=Alternatives:|$)/s);
          const alternativesMatch = block.match(/Alternatives:\s*(.+)$/s);

          if (answerMatch) {
            const answers = answerMatch[1].split(',').map(a => a.trim());
            for (let i = 0; i < blankMatches.length; i++) {
              blanks.push({
                id: uuidv4(),
                answer: answers[i] || '',
                alternatives: alternativesMatch 
                  ? alternativesMatch[1].split(',').map(a => a.trim())
                  : []
              });
            }
          }
          question.blanks = blanks;
        }
      } else if (block.includes('[MATCHING]')) {
        question.type = QuestionType.MATCHING;
        const match = block.match(/\[MATCHING\]\s+(.*?)(?=\d+\.|$)/s);
        if (match) {
          question.text = match[1].trim();
          const pairs = [];
          const pairMatches = block.match(/\d+\.\s+(.*?)\s*\|\s*(.*?)(?=\d+\.|$)/g);
          
          if (pairMatches) {
            for (const pair of pairMatches) {
              const [, premise, response] = pair.match(/\d+\.\s+(.*?)\s*\|\s*(.*)/) || [];
              if (premise && response) {
                pairs.push({
                  id: uuidv4(),
                  premise: premise.trim(),
                  response: response.trim()
                });
              }
            }
          }
          question.matchingPairs = pairs;
        }
      } else if (block.includes('[SHORT_ANSWER]')) {
        question.type = QuestionType.SHORT_ANSWER;
        const match = block.match(/\[SHORT_ANSWER\]\s+(.*?)(?=Keywords:|$)/s);
        if (match) {
          question.text = match[1].trim();
          const keywordsMatch = block.match(/Keywords:\s*(.+?)(?=Model Answer:|$)/s);
          const modelAnswerMatch = block.match(/Model Answer:\s*(.+)$/s);
          
          if (keywordsMatch) {
            question.keywords = keywordsMatch[1].split(',').map(k => k.trim());
          }
          if (modelAnswerMatch) {
            question.modelAnswer = modelAnswerMatch[1].trim();
          }
        }
      } else {
        // Multiple choice question
        const questionMatch = block.match(/Q\d+\.\s+(.*?)(?=A\.|$)/s);
        if (!questionMatch) continue;

        question.text = questionMatch[1].trim();
        const options: QuestionOption[] = [];
        const optionsMatch = block.match(/[A-D]\.\s+([^\n]+)/g);
        
        if (optionsMatch) {
          for (const option of optionsMatch) {
            const [letter, text] = option.split(/\.\s+/);
            options.push({
              id: uuidv4(),
              text: text.trim()
            });
          }
        }

        const answerMatch = block.match(/Answer:\s+([A-D])/);
        if (answerMatch) {
          question.correctOptionIndex = answerMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
        }
        question.options = options;
      }

      // Check for LaTeX and images
      const latexMatch = question.text?.match(/\[latex:\s*([^\]]+)\]/);
      const imageMatch = question.text?.match(/\[image:\s*([^\]]+)\]/);

      if (latexMatch) {
        question.latex = latexMatch[1].trim();
        question.text = question.text?.replace(latexMatch[0], '').trim();
      }

      if (imageMatch) {
        const imageKey = imageMatch[1].trim();
        if (images[imageKey]) {
          question.imagePath = images[imageKey];
          question.text = question.text?.replace(imageMatch[0], '').trim();
        }
      }

      if (question.text) {
        questions.push(question as Question);
      }
    }

    return questions;
  };

  const handlePreview = () => {
    try {
      const parsedQuestions = parseQuestions(bulkText);
      setPreview(parsedQuestions);
      setError(null);
    } catch (error) {
      setError('Failed to parse questions. Please check the format.');
    }
  };

  const handleSubmit = () => {
    try {
      const questions = preview.length > 0 ? preview : parseQuestions(bulkText);
      
      if (questions.length === 0) {
        setError('No valid questions found. Please check the format.');
        return;
      }

      questions.forEach(question => {
        addQuestion(question);
      });

      navigate('/preview');
    } catch (error) {
      setError('Failed to parse questions. Please check the format.');
    }
  };

  const getQuestionTypeTemplate = () => {
    switch (selectedQuestionType) {
      case QuestionType.TRUE_FALSE:
        return `[TRUE_FALSE] The Earth is flat.
Answer: false`;

      case QuestionType.FILL_IN_BLANK:
        return `[FILL_IN_BLANK] The process of photosynthesis occurs in the [___] of plant cells.
Answer: chloroplasts
Alternatives: chloroplast, Chloroplasts`;

      case QuestionType.MATCHING:
        return `[MATCHING] Match the following elements with their properties:
1. Oxygen | Essential for breathing
2. Hydrogen | Lightest element
3. Carbon | Basic building block of life
4. Nitrogen | Main component of air`;

      case QuestionType.SHORT_ANSWER:
        return `[SHORT_ANSWER] Explain the process of photosynthesis.
Keywords: sunlight, chlorophyll, carbon dioxide, water, glucose, oxygen
Model Answer: Photosynthesis is the process where plants use sunlight, chlorophyll, carbon dioxide, and water to produce glucose and oxygen.`;

      default:
        return `Q1. What is the capital of France?
A. Berlin
B. Paris
C. London
D. Madrid
Answer: B`;
    }
  };

  const insertTemplate = () => {
    setBulkText(prev => prev + (prev ? '\n\n' : '') + getQuestionTypeTemplate());
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-indigo-900">Manual Question Entry</h1>
        <p className="text-gray-600 mt-2">
          Create questions with support for multiple formats, LaTeX, and images.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-indigo-600" />
                Question Input
              </h2>

              <div className="flex space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg flex items-center hover:bg-indigo-200"
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Images
                </button>
                <button
                  onClick={handlePreview}
                  className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg flex items-center hover:bg-emerald-200"
                >
                  <FunctionSquare className="h-5 w-5 mr-2" />
                  Preview
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => {
                    setSelectedQuestionType(QuestionType.MULTIPLE_CHOICE);
                    insertTemplate();
                  }}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedQuestionType === QuestionType.MULTIPLE_CHOICE
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <ListChecks className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>Multiple Choice</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedQuestionType(QuestionType.TRUE_FALSE);
                    insertTemplate();
                  }}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedQuestionType === QuestionType.TRUE_FALSE
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <ToggleLeft className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>True/False</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedQuestionType(QuestionType.FILL_IN_BLANK);
                    insertTemplate();
                  }}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedQuestionType === QuestionType.FILL_IN_BLANK
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <SplitSquareHorizontal className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>Fill in Blank</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedQuestionType(QuestionType.MATCHING);
                    insertTemplate();
                  }}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedQuestionType === QuestionType.MATCHING
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <AlignJustify className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>Matching</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedQuestionType(QuestionType.SHORT_ANSWER);
                    insertTemplate();
                  }}
                  className={`flex items-center p-3 rounded-lg border ${
                    selectedQuestionType === QuestionType.SHORT_ANSWER
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  <span>Short Answer</span>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Object.values(DifficultyLevel).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />

            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full h-[400px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              placeholder="Enter your questions here..."
            />

            {error && (
              <div className="mt-4 flex items-center bg-red-50 text-red-700 p-4 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {Object.keys(images).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Images</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(images).map(([name, src]) => (
                  <div key={name} className="relative group">
                    <img
                      src={src}
                      alt={name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-sm p-2 rounded-b-lg">
                      {name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Preview</h3>
              <div className="space-y-6">
                {preview.map((question, index) => (
                  <div key={question.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start space-x-4">
                      <span className="font-medium text-gray-700">Q{index + 1}.</span>
                      <div className="flex-1">
                        <div className="text-gray-800">
                          {question.text}
                          {question.latex && (
                            <div className="mt-3">
                              <MathRenderer latex={question.latex} block />
                            </div>
                          )}
                        </div>

                        {question.imagePath && (
                          <img
                            src={question.imagePath}
                            alt={`Question ${index + 1}`}
                            className="mt-4 max-h-48 rounded-lg"
                          />
                        )}

                        <div className="mt-4">
                          {question.type === QuestionType.MULTIPLE_CHOICE && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={option.id}
                                  className={`flex items-center p-3 rounded-lg ${
                                    optIndex === question.correctOptionIndex
                                      ? 'bg-green-50 border border-green-200'
                                      : 'border border-gray-200'
                                  }`}
                                >
                                  <span className="w-8 font-medium text-gray-700">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span>{option.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === QuestionType.TRUE_FALSE && (
                            <div className="space-y-2">
                              <div className={`p-3 rounded-lg ${
                                question.correctAnswer === true
                                  ? 'bg-green-50 border border-green-200'
                                  : 'border border-gray-200'
                              }`}>
                                True
                              </div>
                              <div className={`p-3 rounded-lg ${
                                question.correctAnswer === false
                                  ? 'bg-green-50 border border-green-200'
                                  : 'border border-gray-200'
                              }`}>
                                False
                              </div>
                            </div>
                          )}

                          {question.type === QuestionType.FILL_IN_BLANK && question.blanks && (
                            <div className="space-y-3">
                              {question.blanks.map((blank, blankIndex) => (
                                <div key={blank.id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="font-medium text-gray-700">
                                    Blank #{blankIndex + 1}
                                  </div>
                                  <div className="text-green-600 mt-1">
                                    Answer: {blank.answer}
                                  </div>
                                  {blank.alternatives && blank.alternatives.length > 0 && (
                                    <div className="text-gray-600 text-sm mt-1">
                                      Alternatives: {blank.alternatives.join(', ')}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === QuestionType.MATCHING && question.matchingPairs && (
                            <div className="space-y-2">
                              {question.matchingPairs.map((pair) => (
                                <div key={pair.id} className="flex items-center space-x-4">
                                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                                    {pair.premise}
                                  </div>
                                  <div className="text-gray-400">→</div>
                                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                                    {pair.response}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {question.type === QuestionType.SHORT_ANSWER && (
                            <div className="space-y-3">
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="font-medium text-green-800">Model Answer:</div>
                                <div className="mt-1">{question.modelAnswer}</div>
                              </div>
                              {question.keywords && question.keywords.length > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <div className="font-medium text-blue-800">Keywords:</div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {question.keywords.map((keyword, i) => (
                                      <span
                                        key={i}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                      >
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            question.difficultyLevel === DifficultyLevel.EASY
                              ? 'bg-green-100 text-green-800'
                              : question.difficultyLevel === DifficultyLevel.MEDIUM
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {question.difficultyLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg flex items-center hover:bg-indigo-700"
        >
          <Save className="h-5 w-5 mr-2" />
          Save and Continue
        </button>
      </div>

      <div className="mt-12 bg-amber-50 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-amber-800 mb-4">Format Instructions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-amber-800 mb-2">Multiple Choice</h3>
            <pre className="bg-white p-3 rounded-lg border border-amber-200 text-sm overflow-x-auto">
              {`Q1. What is the capital of France?
A. Berlin
B. Paris
C. London
D. Madrid
Answer: B`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-amber-800 mb-2">True/False</h3>
            <pre className="bg-white p-3 rounded-lg border border-amber-200 text-sm overflow-x-auto">
              {`[TRUE_FALSE] The Earth is flat.
Answer: false`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-amber-800 mb-2">Fill in the Blank</h3>
            <pre className="bg-white p-3 rounded-lg border border-amber-200 text-sm overflow-x-auto">
              {`[FILL_IN_BLANK] The process of photosynthesis 
occurs in the [___] of plant cells.
Answer: chloroplasts
Alternatives: chloroplast, Chloroplasts`}
            </pre>
          </div>

          <div>
            <h3 className="font-medium text-amber-800 mb-2">Matching</h3>
            <pre className="bg-white p-3 rounded-lg border border-amber-200 text-sm overflow-x-auto">
              {`[MATCHING] Match the following:
1. Oxygen | Essential for breathing
2. Hydrogen | Lightest element
3. Carbon | Basic building block
4. Nitrogen | Main component of air`}
            </pre>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium text-amber-800 mb-2">Short Answer</h3>
            <pre className="bg-white p-3 rounded-lg border border-amber-200 text-sm overflow-x-auto">
              {`[SHORT_ANSWER] Explain photosynthesis.
Keywords: sunlight, chlorophyll, CO2
Model Answer: Photosynthesis is the process
where plants convert sunlight to energy.`}
            </pre>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-gray-700">
          <p className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Add LaTeX equations using [latex: \\frac{x}{2}]
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Include images with [image: filename.png]
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Upload images before referencing them
          </p>
        </div>
      </div>
    </div>
  );
}